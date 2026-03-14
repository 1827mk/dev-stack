/**
 * Risk Assessor Tests - Dev-Stack v6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RiskAssessor } from './risk-assessor.js';
import type { RiskAssessmentInput } from './types.js';

describe('RiskAssessor', () => {
  let assessor: RiskAssessor;

  beforeEach(() => {
    assessor = new RiskAssessor();
  });

  describe('constructor', () => {
    it('should create assessor with default config', () => {
      expect(assessor).toBeDefined();
    });
  });

  describe('assess', () => {
    describe('Files affected scoring', () => {
      it('should return low risk for single file', () => {
        const input: RiskAssessmentInput = {
          operation: 'modify',
          target_files: ['src/index.ts'],
          affects_protected_paths: false,
          involves_secrets: false,
          is_destructive: false,
          cross_cutting: false,
          dependency_changes: false
        };
        const result = assessor.assess(input);

        expect(result.risk_score).toBeLessThan(0.3);
        expect(result.risk_level).toBe('low');
      });

      it('should return medium risk for multiple files', () => {
        const input: RiskAssessmentInput = {
          operation: 'modify',
          target_files: ['src/a.ts', 'src/b.ts', 'src/c.ts', 'src/d.ts', 'src/e.ts'],
          affects_protected_paths: false,
          involves_secrets: false,
          is_destructive: false,
          cross_cutting: false,
          dependency_changes: false
        };
        const result = assessor.assess(input);

        expect(result.risk_score).toBeGreaterThanOrEqual(0.1);
      });

      it('should return high risk for many files', () => {
        const files = Array.from({ length: 20 }, (_, i) => `src/file${i}.ts`);
        const input: RiskAssessmentInput = {
          operation: 'modify',
          target_files: files,
          affects_protected_paths: false,
          involves_secrets: false,
          is_destructive: false,
          cross_cutting: false,
          dependency_changes: false
        };
        const result = assessor.assess(input);

        expect(result.risk_score).toBeGreaterThanOrEqual(0.2);
      });
    });

    describe('Protected paths consideration', () => {
      it('should increase risk for protected paths', () => {
        const normalInput: RiskAssessmentInput = {
          operation: 'modify',
          target_files: ['src/utils.ts'],
          affects_protected_paths: false,
          involves_secrets: false,
          is_destructive: false,
          cross_cutting: false,
          dependency_changes: false
        };

        const protectedInput: RiskAssessmentInput = {
          operation: 'modify',
          target_files: ['src/utils.ts'],
          affects_protected_paths: true,
          involves_secrets: false,
          is_destructive: false,
          cross_cutting: false,
          dependency_changes: false
        };

        const normalResult = assessor.assess(normalInput);
        const protectedResult = assessor.assess(protectedInput);

        expect(protectedResult.risk_score).toBeGreaterThan(normalResult.risk_score);
      });
    });

    describe('Secrets consideration', () => {
      it('should increase risk when secrets are involved', () => {
        const input: RiskAssessmentInput = {
          operation: 'modify',
          target_files: ['src/config.ts'],
          affects_protected_paths: false,
          involves_secrets: true,
          is_destructive: false,
          cross_cutting: false,
          dependency_changes: false
        };
        const result = assessor.assess(input);

        expect(result.risk_score).toBeGreaterThan(0.1);
      });
    });

    describe('Destructive operations', () => {
      it('should increase risk for destructive operations', () => {
        const input: RiskAssessmentInput = {
          operation: 'delete',
          target_files: ['src/index.ts'],
          affects_protected_paths: false,
          involves_secrets: false,
          is_destructive: true,
          cross_cutting: false,
          dependency_changes: false
        };
        const result = assessor.assess(input);

        expect(result.risk_score).toBeGreaterThan(0.1);
      });
    });

    describe('Risk levels', () => {
      it('should return low for minimal risk', () => {
        const input: RiskAssessmentInput = {
          operation: 'read',
          target_files: ['src/test.ts'],
          affects_protected_paths: false,
          involves_secrets: false,
          is_destructive: false,
          cross_cutting: false,
          dependency_changes: false
        };
        const result = assessor.assess(input);
        expect(result.risk_level).toBe('low');
      });

      it('should return medium for moderate risk', () => {
        const input: RiskAssessmentInput = {
          operation: 'modify',
          target_files: ['src/a.ts', 'src/b.ts', 'src/c.ts', 'src/d.ts'],
          affects_protected_paths: false,
          involves_secrets: false,
          is_destructive: false,
          cross_cutting: false,
          dependency_changes: false
        };
        const result = assessor.assess(input);
        expect(['low', 'medium']).toContain(result.risk_level);
      });

      it('should return high for elevated risk', () => {
        const input: RiskAssessmentInput = {
          operation: 'modify',
          target_files: Array.from({ length: 15 }, (_, i) => `src/file${i}.ts`),
          affects_protected_paths: true,
          involves_secrets: false,
          is_destructive: false,
          cross_cutting: true,
          dependency_changes: false
        };
        const result = assessor.assess(input);
        expect(['high', 'critical']).toContain(result.risk_level);
      });

      it('should return critical for high risk', () => {
        const input: RiskAssessmentInput = {
          operation: 'modify',
          target_files: ['src/auth.ts', 'src/middleware.ts', 'src/config.ts'],
          affects_protected_paths: true,
          involves_secrets: true,
          is_destructive: true,
          cross_cutting: true,
          dependency_changes: true
        };
        const result = assessor.assess(input);
        expect(result.risk_level).toBe('critical');
      });
    });

    describe('Action determination', () => {
      it('should return allow for low risk', () => {
        const input: RiskAssessmentInput = {
          operation: 'read',
          target_files: ['src/test.ts'],
          affects_protected_paths: false,
          involves_secrets: false,
          is_destructive: false,
          cross_cutting: false,
          dependency_changes: false
        };
        const result = assessor.assess(input);
        expect(result.action).toBe('allow');
      });

      it('should return confirm for high risk', () => {
        const input: RiskAssessmentInput = {
          operation: 'delete',
          target_files: Array.from({ length: 20 }, (_, i) => `src/file${i}.ts`),
          affects_protected_paths: true,
          involves_secrets: true,
          is_destructive: true,
          cross_cutting: true,
          dependency_changes: true
        };
        const result = assessor.assess(input);
        expect(['confirm', 'block']).toContain(result.action);
      });
    });

    describe('Recommendations', () => {
      it('should provide recommendations for elevated risk', () => {
        const input: RiskAssessmentInput = {
          operation: 'modify',
          target_files: Array.from({ length: 10 }, (_, i) => `src/file${i}.ts`),
          affects_protected_paths: true,
          involves_secrets: false,
          is_destructive: false,
          cross_cutting: true,
          dependency_changes: false
        };
        const result = assessor.assess(input);
        expect(result.recommendations.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getRiskLevelDescription', () => {
    it('should return description for each level', () => {
      expect(assessor.getRiskLevelDescription('low')).toContain('Low');
      expect(assessor.getRiskLevelDescription('medium')).toContain('Medium');
      expect(assessor.getRiskLevelDescription('high')).toContain('High');
      expect(assessor.getRiskLevelDescription('critical')).toContain('Critical');
    });
  });

  describe('getExecutionMode', () => {
    it('should return AUTO for low risk', () => {
      expect(assessor.getExecutionMode('low')).toBe('AUTO');
    });

    it('should return PLAN_FIRST for medium risk', () => {
      expect(assessor.getExecutionMode('medium')).toBe('PLAN_FIRST');
    });

    it('should return CONFIRM for high risk', () => {
      expect(assessor.getExecutionMode('high')).toBe('CONFIRM');
    });

    it('should return INTERACTIVE for critical risk', () => {
      expect(assessor.getExecutionMode('critical')).toBe('INTERACTIVE');
    });
  });

  describe('updateFactorWeight', () => {
    it('should update factor weight', () => {
      const result = assessor.updateFactorWeight('files_affected', 0.5);
      expect(result).toBe(true);
    });

    it('should return false for unknown factor', () => {
      const result = assessor.updateFactorWeight('unknown_factor', 0.5);
      expect(result).toBe(false);
    });
  });

  describe('getFactors', () => {
    it('should return list of risk factors', () => {
      const factors = assessor.getFactors();
      expect(Array.isArray(factors)).toBe(true);
      expect(factors.length).toBeGreaterThan(0);
    });
  });

  describe('getThresholds', () => {
    it('should return thresholds', () => {
      const thresholds = assessor.getThresholds();
      expect(thresholds.low).toBeDefined();
      expect(thresholds.medium).toBeDefined();
      expect(thresholds.high).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty files affected', () => {
      const input: RiskAssessmentInput = {
        operation: 'read',
        target_files: [],
        affects_protected_paths: false,
        involves_secrets: false,
        is_destructive: false,
        cross_cutting: false,
        dependency_changes: false
      };
      const result = assessor.assess(input);
      expect(result.risk_score).toBeLessThan(0.1);
    });

    it('should handle complexity score', () => {
      const input: RiskAssessmentInput = {
        operation: 'modify',
        target_files: ['src/index.ts'],
        affects_protected_paths: false,
        involves_secrets: false,
        is_destructive: false,
        cross_cutting: false,
        dependency_changes: false,
        complexity_score: 0.8
      };
      const result = assessor.assess(input);
      expect(result).toBeDefined();
    });
  });
});
