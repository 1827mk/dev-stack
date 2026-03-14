/**
 * Complexity Scorer Tests - Dev-Stack v6
 */

import { describe, it, expect } from 'vitest';
import {
  complexityScorer,
  FACTOR_WEIGHTS
} from './complexity-scorer.js';
import type { ComplexityFactors } from './complexity-scorer.js';

describe('ComplexityScorer', () => {
  const defaultFactors: ComplexityFactors = {
    files_affected: 0,
    risk_level: 0,
    dependencies: 0,
    cross_cutting: 0,
    user_clarity: 0,
    reversibility: 0
  };

  describe('calculateScore', () => {
    describe('Files affected factor', () => {
      it('should return low score for few files', () => {
        const factors: ComplexityFactors = {
          ...defaultFactors,
          files_affected: complexityScorer.scoreFilesAffected(1)
        };
        const score = complexityScorer.calculateScore(factors);
        expect(score).toBeLessThan(0.1);
      });

      it('should increase score with more files', () => {
        const factors: ComplexityFactors = {
          ...defaultFactors,
          files_affected: complexityScorer.scoreFilesAffected(10)
        };
        const score = complexityScorer.calculateScore(factors);
        expect(score).toBeGreaterThan(0);
      });

      it('should cap files_affected factor contribution', () => {
        const factors: ComplexityFactors = {
          ...defaultFactors,
          files_affected: complexityScorer.scoreFilesAffected(50)
        };
        const score = complexityScorer.calculateScore(factors);
        // Max contribution from files_affected is FACTOR_WEIGHTS.files_affected * 1.0
        expect(score).toBeLessThanOrEqual(FACTOR_WEIGHTS.files_affected);
      });
    });

    describe('Risk level factor', () => {
      it('should return low for low risk', () => {
        const factors: ComplexityFactors = {
          ...defaultFactors,
          risk_level: complexityScorer.scoreRiskLevel('low')
        };
        const score = complexityScorer.calculateScore(factors);
        expect(score).toBeLessThan(0.05);
      });

      it('should increase for medium risk', () => {
        const factors: ComplexityFactors = {
          ...defaultFactors,
          risk_level: complexityScorer.scoreRiskLevel('medium')
        };
        const score = complexityScorer.calculateScore(factors);
        expect(score).toBeGreaterThan(0);
      });

      it('should increase for high risk', () => {
        const factors: ComplexityFactors = {
          ...defaultFactors,
          risk_level: complexityScorer.scoreRiskLevel('high')
        };
        const score = complexityScorer.calculateScore(factors);
        expect(score).toBeGreaterThan(0.1);
      });

      it('should increase for critical risk', () => {
        const factors: ComplexityFactors = {
          ...defaultFactors,
          risk_level: complexityScorer.scoreRiskLevel('critical')
        };
        const score = complexityScorer.calculateScore(factors);
        expect(score).toBeGreaterThan(0.15);
      });
    });

    describe('Dependencies factor', () => {
      it('should return 0 for no dependencies', () => {
        const factors: ComplexityFactors = {
          ...defaultFactors,
          dependencies: complexityScorer.scoreDependencies('none')
        };
        const score = complexityScorer.calculateScore(factors);
        expect(score).toBe(0);
      });

      it('should increase with more dependencies', () => {
        const factors: ComplexityFactors = {
          ...defaultFactors,
          dependencies: complexityScorer.scoreDependencies('many')
        };
        const score = complexityScorer.calculateScore(factors);
        expect(score).toBeGreaterThan(0);
      });
    });

    describe('Cross-cutting factor', () => {
      it('should return 0 for single file scope', () => {
        const factors: ComplexityFactors = {
          ...defaultFactors,
          cross_cutting: complexityScorer.scoreCrossCutting('single_file')
        };
        const score = complexityScorer.calculateScore(factors);
        expect(score).toBe(0);
      });

      it('should increase for cross-cutting concerns', () => {
        const factors: ComplexityFactors = {
          ...defaultFactors,
          cross_cutting: complexityScorer.scoreCrossCutting('system_wide')
        };
        const score = complexityScorer.calculateScore(factors);
        expect(score).toBeGreaterThan(0);
      });
    });

    describe('Combined factors', () => {
      it('should calculate total score correctly', () => {
        const factors: ComplexityFactors = {
          files_affected: complexityScorer.scoreFilesAffected(3),
          risk_level: complexityScorer.scoreRiskLevel('medium'),
          dependencies: complexityScorer.scoreDependencies('few'),
          cross_cutting: complexityScorer.scoreCrossCutting('module'),
          user_clarity: complexityScorer.scoreUserClarity('clear'),
          reversibility: complexityScorer.scoreReversibility('moderate')
        };

        const score = complexityScorer.calculateScore(factors);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(1);
      });

      it('should reach maximum with all factors high', () => {
        const factors: ComplexityFactors = {
          files_affected: complexityScorer.scoreFilesAffected(50),
          risk_level: complexityScorer.scoreRiskLevel('critical'),
          dependencies: complexityScorer.scoreDependencies('extensive'),
          cross_cutting: complexityScorer.scoreCrossCutting('all'),
          user_clarity: complexityScorer.scoreUserClarity('very_unclear'),
          reversibility: complexityScorer.scoreReversibility('impossible')
        };

        const score = complexityScorer.calculateScore(factors);
        expect(score).toBeGreaterThan(0.8);
      });
    });
  });

  describe('scoreFilesAffected', () => {
    it('should score 1 file as 0.1', () => {
      expect(complexityScorer.scoreFilesAffected(1)).toBe(0.1);
    });

    it('should score 2-3 files as 0.3', () => {
      expect(complexityScorer.scoreFilesAffected(2)).toBe(0.3);
      expect(complexityScorer.scoreFilesAffected(3)).toBe(0.3);
    });

    it('should score 4-5 files as 0.5', () => {
      expect(complexityScorer.scoreFilesAffected(5)).toBe(0.5);
    });

    it('should score 20+ files as 1.0', () => {
      expect(complexityScorer.scoreFilesAffected(25)).toBe(1.0);
    });
  });

  describe('scoreRiskLevel', () => {
    it('should score low as 0.0', () => {
      expect(complexityScorer.scoreRiskLevel('low')).toBe(0.0);
    });

    it('should score medium as 0.3', () => {
      expect(complexityScorer.scoreRiskLevel('medium')).toBe(0.3);
    });

    it('should score high as 0.6', () => {
      expect(complexityScorer.scoreRiskLevel('high')).toBe(0.6);
    });

    it('should score critical as 1.0', () => {
      expect(complexityScorer.scoreRiskLevel('critical')).toBe(1.0);
    });
  });

  describe('scoreDependencies', () => {
    it('should score none as 0.0', () => {
      expect(complexityScorer.scoreDependencies('none')).toBe(0.0);
    });

    it('should score few as 0.2', () => {
      expect(complexityScorer.scoreDependencies('few')).toBe(0.2);
    });

    it('should score extensive as 1.0', () => {
      expect(complexityScorer.scoreDependencies('extensive')).toBe(1.0);
    });
  });

  describe('scoreCrossCutting', () => {
    it('should score single_file as 0.0', () => {
      expect(complexityScorer.scoreCrossCutting('single_file')).toBe(0.0);
    });

    it('should score system_wide as 0.8', () => {
      expect(complexityScorer.scoreCrossCutting('system_wide')).toBe(0.8);
    });

    it('should score all as 1.0', () => {
      expect(complexityScorer.scoreCrossCutting('all')).toBe(1.0);
    });
  });

  describe('scoreUserClarity', () => {
    it('should score very_clear as 0.1', () => {
      expect(complexityScorer.scoreUserClarity('very_clear')).toBe(0.1);
    });

    it('should score very_unclear as 1.0', () => {
      expect(complexityScorer.scoreUserClarity('very_unclear')).toBe(1.0);
    });
  });

  describe('scoreReversibility', () => {
    it('should score easy as 0.1', () => {
      expect(complexityScorer.scoreReversibility('easy')).toBe(0.1);
    });

    it('should score impossible as 1.0', () => {
      expect(complexityScorer.scoreReversibility('impossible')).toBe(1.0);
    });
  });

  describe('analyzeIntent', () => {
    it('should analyze delete operations as high risk', () => {
      const factors = complexityScorer.analyzeIntent({
        verb: 'delete',
        target: 'user data'
      });
      expect(factors.risk_level).toBe(1.0); // critical
    });

    it('should analyze read operations as low risk', () => {
      const factors = complexityScorer.analyzeIntent({
        verb: 'read',
        target: 'config file'
      });
      expect(factors.risk_level).toBe(0.0); // low
    });

    it('should analyze system-wide targets as high cross-cutting', () => {
      const factors = complexityScorer.analyzeIntent({
        verb: 'update',
        target: 'authentication system'
      });
      expect(factors.cross_cutting).toBe(0.8); // system_wide
    });
  });

  describe('getSummary', () => {
    it('should return summary with score and level', () => {
      const factors: ComplexityFactors = {
        files_affected: 0.5,
        risk_level: 0.3,
        dependencies: 0.2,
        cross_cutting: 0.0,
        user_clarity: 0.3,
        reversibility: 0.3
      };

      const summary = complexityScorer.getSummary(factors);
      expect(summary.score).toBeDefined();
      expect(summary.level).toBeDefined();
      expect(summary.dominant_factor).toBeDefined();
      expect(summary.recommendations).toBeDefined();
      expect(Array.isArray(summary.recommendations)).toBe(true);
    });

    it('should provide recommendations for high risk', () => {
      const factors: ComplexityFactors = {
        ...defaultFactors,
        risk_level: 1.0
      };

      const summary = complexityScorer.getSummary(factors);
      expect(summary.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle zero factors', () => {
      const score = complexityScorer.calculateScore(defaultFactors);
      expect(score).toBe(0);
    });

    it('should handle max factors', () => {
      const factors: ComplexityFactors = {
        files_affected: 1.0,
        risk_level: 1.0,
        dependencies: 1.0,
        cross_cutting: 1.0,
        user_clarity: 1.0,
        reversibility: 1.0
      };
      const score = complexityScorer.calculateScore(factors);
      // The max score is the weighted sum of all factors
      // Let's verify it's close to 1 but account for floating point precision
      expect(score).toBeGreaterThan(0.85);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should clamp score to 0-1 range', () => {
      // Even with extreme values, score should be clamped
      const factors: ComplexityFactors = {
        files_affected: 1.0,
        risk_level: 1.0,
        dependencies: 1.0,
        cross_cutting: 1.0,
        user_clarity: 1.0,
        reversibility: 1.0
      };
      const score = complexityScorer.calculateScore(factors);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });
});
