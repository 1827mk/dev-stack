/**
 * Mode Selector Tests - Dev-Stack v6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ModeSelector,
  MODE_THRESHOLDS
} from './mode-selector.js';
import type { ComplexityFactors } from './complexity-scorer.js';

describe('ModeSelector', () => {
  let selector: ModeSelector;

  beforeEach(() => {
    selector = new ModeSelector();
  });

  describe('selectMode', () => {
    describe('AUTO mode', () => {
      it('should select AUTO for low complexity', () => {
        const mode = selector.selectMode(0.2);
        expect(mode).toBe('AUTO');
      });

      it('should select AUTO for complexity below threshold', () => {
        const mode = selector.selectMode(MODE_THRESHOLDS.AUTO.max - 0.01);
        expect(mode).toBe('AUTO');
      });

      it('should select AUTO when quick mode is enabled', () => {
        selector.setQuickMode(true);
        const mode = selector.selectMode(0.8);
        expect(mode).toBe('AUTO');
      });
    });

    describe('PLAN_FIRST mode', () => {
      it('should select PLAN_FIRST for medium complexity', () => {
        const mode = selector.selectMode(0.4);
        expect(mode).toBe('PLAN_FIRST');
      });

      it('should select PLAN_FIRST at threshold boundary', () => {
        const mode = selector.selectMode(0.35);
        expect(mode).toBe('PLAN_FIRST');
      });
    });

    describe('CONFIRM mode', () => {
      it('should select CONFIRM for high complexity', () => {
        const mode = selector.selectMode(0.65);
        expect(mode).toBe('CONFIRM');
      });

      it('should select CONFIRM at threshold boundary', () => {
        const mode = selector.selectMode(0.7);
        expect(mode).toBe('CONFIRM');
      });
    });

    describe('INTERACTIVE mode', () => {
      it('should select INTERACTIVE for very high complexity', () => {
        const mode = selector.selectMode(0.85);
        expect(mode).toBe('INTERACTIVE');
      });

      it('should select INTERACTIVE at maximum complexity', () => {
        const mode = selector.selectMode(1.0);
        expect(mode).toBe('INTERACTIVE');
      });
    });
  });

  describe('getModeConfig', () => {
    it('should return config for AUTO', () => {
      const config = selector.getModeConfig('AUTO', 0.2);
      expect(config.mode).toBe('AUTO');
      expect(config.confirm_required).toBe(false);
      expect(config.allows_quick_mode).toBe(true);
    });

    it('should return config for PLAN_FIRST', () => {
      const config = selector.getModeConfig('PLAN_FIRST', 0.4);
      expect(config.mode).toBe('PLAN_FIRST');
      expect(config.confirm_required).toBe(true);
      expect(config.allows_quick_mode).toBe(true);
    });

    it('should return config for CONFIRM', () => {
      const config = selector.getModeConfig('CONFIRM', 0.7);
      expect(config.mode).toBe('CONFIRM');
      expect(config.confirm_required).toBe(true);
      expect(config.allows_quick_mode).toBe(false);
    });

    it('should return config for INTERACTIVE', () => {
      const config = selector.getModeConfig('INTERACTIVE', 0.9);
      expect(config.mode).toBe('INTERACTIVE');
      expect(config.confirm_required).toBe(true);
      expect(config.allows_quick_mode).toBe(false);
    });

    it('should include phases', () => {
      const config = selector.getModeConfig('AUTO', 0.2);
      expect(config.phases).toContain('THINK');
      expect(config.phases).toContain('BUILD');
      expect(config.phases).toContain('VERIFY');
    });
  });

  describe('selectFromFactors', () => {
    it('should select mode from complexity factors', () => {
      const factors: ComplexityFactors = {
        files_affected: 0.1,
        risk_level: 0.0,
        dependencies: 0.0,
        cross_cutting: 0.0,
        user_clarity: 0.1,
        reversibility: 0.1
      };

      const result = selector.selectFromFactors(factors);
      expect(result.mode).toBe('AUTO');
      expect(result.complexity_score).toBeDefined();
      expect(result.config).toBeDefined();
    });

    it('should include quick_mode_available flag', () => {
      const factors: ComplexityFactors = {
        files_affected: 0.1,
        risk_level: 0.0,
        dependencies: 0.0,
        cross_cutting: 0.0,
        user_clarity: 0.1,
        reversibility: 0.1
      };

      const result = selector.selectFromFactors(factors);
      expect(typeof result.quick_mode_available).toBe('boolean');
    });
  });

  describe('selectFromIntent', () => {
    it('should select mode from intent', () => {
      const result = selector.selectFromIntent({
        verb: 'read',
        target: 'config file'
      });
      expect(result.mode).toBeDefined();
      expect(result.complexity_score).toBeDefined();
    });

    it('should detect high-risk verbs', () => {
      const result = selector.selectFromIntent({
        verb: 'delete',
        target: 'user data'
      });
      // Delete operations should result in higher complexity
      expect(result.complexity_score).toBeGreaterThan(0.3);
    });
  });

  describe('canSkipPhase', () => {
    it('should not allow skipping by default', () => {
      expect(selector.canSkipPhase('AUTO', 'THINK')).toBe(false);
    });

    it('should allow skipping THINK in quick mode', () => {
      selector.setQuickMode(true);
      expect(selector.canSkipPhase('AUTO', 'THINK')).toBe(true);
    });

    it('should allow skipping RESEARCH in quick mode', () => {
      selector.setQuickMode(true);
      expect(selector.canSkipPhase('AUTO', 'RESEARCH')).toBe(true);
    });

    it('should not allow skipping BUILD even in quick mode', () => {
      selector.setQuickMode(true);
      expect(selector.canSkipPhase('AUTO', 'BUILD')).toBe(false);
    });
  });

  describe('getPhases', () => {
    it('should return phases for AUTO', () => {
      const phases = selector.getPhases('AUTO');
      expect(phases).toContain('THINK');
      expect(phases).toContain('RESEARCH');
      expect(phases).toContain('BUILD');
      expect(phases).toContain('VERIFY');
    });

    it('should return phases for PLAN_FIRST', () => {
      const phases = selector.getPhases('PLAN_FIRST');
      expect(phases).toContain('PLAN_APPROVAL');
    });

    it('should return phases for CONFIRM', () => {
      const phases = selector.getPhases('CONFIRM');
      expect(phases.filter(p => p === 'CONFIRM').length).toBeGreaterThan(0);
    });

    it('should return phases for INTERACTIVE', () => {
      const phases = selector.getPhases('INTERACTIVE');
      expect(phases).toContain('CLARIFY');
    });
  });

  describe('needsConfirmation', () => {
    it('should not need confirmation for AUTO', () => {
      expect(selector.needsConfirmation('AUTO', 'BUILD')).toBe(false);
    });

    it('should need confirmation for PLAN_APPROVAL in PLAN_FIRST', () => {
      expect(selector.needsConfirmation('PLAN_FIRST', 'PLAN_APPROVAL')).toBe(true);
    });

    it('should need confirmation for BUILD in CONFIRM mode', () => {
      expect(selector.needsConfirmation('CONFIRM', 'BUILD')).toBe(true);
    });

    it('should need confirmation for CLARIFY in INTERACTIVE mode', () => {
      expect(selector.needsConfirmation('INTERACTIVE', 'CLARIFY')).toBe(true);
    });
  });

  describe('getModeSummary', () => {
    it('should return formatted summary', () => {
      const factors: ComplexityFactors = {
        files_affected: 0.1,
        risk_level: 0.0,
        dependencies: 0.0,
        cross_cutting: 0.0,
        user_clarity: 0.1,
        reversibility: 0.1
      };

      const result = selector.selectFromFactors(factors);
      const summary = selector.getModeSummary(result);

      expect(summary).toContain('AUTO');
      expect(summary).toContain('Complexity Score');
      expect(summary).toContain('Estimated Steps');
    });
  });

  describe('setQuickMode', () => {
    it('should enable quick mode', () => {
      selector.setQuickMode(true);
      const mode = selector.selectMode(0.5);
      expect(mode).toBe('AUTO');
    });

    it('should disable quick mode', () => {
      selector.setQuickMode(true);
      selector.setQuickMode(false);
      const mode = selector.selectMode(0.5);
      expect(mode).toBe('PLAN_FIRST');
    });
  });

  describe('edge cases', () => {
    it('should handle zero complexity', () => {
      const mode = selector.selectMode(0);
      expect(mode).toBe('AUTO');
    });

    it('should handle maximum complexity', () => {
      const mode = selector.selectMode(1);
      expect(mode).toBe('INTERACTIVE');
    });

    it('should handle negative complexity', () => {
      const mode = selector.selectMode(-0.5);
      expect(mode).toBe('AUTO');
    });

    it('should handle complexity above 1', () => {
      const mode = selector.selectMode(1.5);
      expect(mode).toBe('INTERACTIVE');
    });
  });
});
