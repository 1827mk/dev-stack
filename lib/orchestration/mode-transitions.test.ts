/**
 * Mode Transitions Tests - Dev-Stack v6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ModeTransitionManager,
  createModeTransitionManager
} from './mode-transitions.js';

describe('ModeTransitionManager', () => {
  let transitions: ModeTransitionManager;

  beforeEach(() => {
    transitions = new ModeTransitionManager();
  });

  describe('constructor', () => {
    it('should create transitions with default config', () => {
      expect(transitions).toBeDefined();
    });

    it('should start with AUTO mode by default', () => {
      expect(transitions.getCurrentMode()).toBe('AUTO');
    });

    it('should accept initial mode', () => {
      const customTransitions = new ModeTransitionManager('PLAN_FIRST');
      expect(customTransitions.getCurrentMode()).toBe('PLAN_FIRST');
    });
  });

  describe('getCurrentMode', () => {
    it('should return current mode', () => {
      expect(transitions.getCurrentMode()).toBe('AUTO');
    });
  });

  describe('getContext', () => {
    it('should return context', () => {
      const context = transitions.getContext();
      expect(context.current_mode).toBe('AUTO');
      expect(context.complexity_score).toBe(0);
    });
  });

  describe('updateContext', () => {
    it('should update context', () => {
      transitions.updateContext({ complexity_score: 0.5 });
      const context = transitions.getContext();
      expect(context.complexity_score).toBe(0.5);
    });
  });

  describe('checkTransition', () => {
    it('should detect complexity_increase transition', () => {
      transitions.updateContext({ complexity_score: 0.5 });
      const result = transitions.checkTransition('complexity_increase');
      expect(result).not.toBeNull();
      expect(result?.new_mode).toBe('PLAN_FIRST');
    });

    it('should not transition if condition not met', () => {
      transitions.updateContext({ complexity_score: 0.1 });
      const result = transitions.checkTransition('complexity_increase');
      expect(result).toBeNull();
    });

    it('should detect risk_detected transition', () => {
      transitions.updateContext({ risk_level: 'high' });
      const result = transitions.checkTransition('risk_detected');
      expect(result).not.toBeNull();
    });

    it('should detect guard_block transition', () => {
      const result = transitions.checkTransition('guard_block');
      expect(result).not.toBeNull();
    });
  });

  describe('executeTransition', () => {
    it('should execute transition', () => {
      transitions.updateContext({ complexity_score: 0.5 });
      const result = transitions.executeTransition('complexity_increase');
      expect(result).not.toBeNull();
      expect(result?.new_mode).toBe('PLAN_FIRST');
      expect(transitions.getCurrentMode()).toBe('PLAN_FIRST');
    });

    it('should add to history', () => {
      transitions.updateContext({ complexity_score: 0.5 });
      transitions.executeTransition('complexity_increase');
      const history = transitions.getHistory();
      expect(history.length).toBe(1);
    });
  });

  describe('forceMode', () => {
    it('should force mode change', () => {
      const result = transitions.forceMode('INTERACTIVE');
      expect(result.new_mode).toBe('INTERACTIVE');
      expect(transitions.getCurrentMode()).toBe('INTERACTIVE');
    });

    it('should allow any mode', () => {
      transitions.forceMode('CONFIRM');
      transitions.forceMode('PLAN_FIRST');
      transitions.forceMode('AUTO');
      expect(transitions.getCurrentMode()).toBe('AUTO');
    });
  });

  describe('getHistory', () => {
    it('should return empty history initially', () => {
      const history = transitions.getHistory();
      expect(history).toEqual([]);
    });

    it('should accumulate transition history', () => {
      transitions.updateContext({ complexity_score: 0.5 });
      transitions.executeTransition('complexity_increase');
      transitions.updateContext({ complexity_score: 0.7 });
      transitions.executeTransition('complexity_increase');

      const history = transitions.getHistory();
      expect(history.length).toBe(2);
    });
  });

  describe('getModePhases', () => {
    it('should return phases for AUTO', () => {
      const phases = transitions.getModePhases('AUTO');
      expect(phases).toContain('THINK');
      expect(phases).toContain('RESEARCH');
      expect(phases).toContain('BUILD');
      expect(phases).toContain('VERIFY');
    });

    it('should return phasesfor PLAN_FIRST', () => {
      const phases= transitions.getModePhases('PLAN_FIRST');
      expect(phases).toContain('PLAN_APPROVAL');
    });

    it('should return phases for CONFIRM', () => {
      const phases = transitions.getModePhases('CONFIRM');
      expect(phases).toContain('CONFIRM');
    });

    it('should return phases for INTERACTIVE', () => {
      const phases = transitions.getModePhases('INTERACTIVE');
      expect(phases).toContain('CLARIFY');
    });
  });

  describe('getConfirmationPoints', () => {
    it('should return empty for AUTO', () => {
      const points = transitions.getConfirmationPoints('AUTO');
      expect(points).toEqual([]);
    });

    it('should return PLAN_APPROVAL for PLAN_FIRST', () => {
      const points = transitions.getConfirmationPoints('PLAN_FIRST');
      expect(points).toContain('PLAN_APPROVAL');
    });

    it('should return CONFIRM for CONFIRM mode', () => {
      const points = transitions.getConfirmationPoints('CONFIRM');
      expect(points).toContain('CONFIRM');
    });

    it('should return CLARIFY for INTERACTIVE', () => {
      const points = transitions.getConfirmationPoints('INTERACTIVE');
      expect(points).toContain('CLARIFY');
    });
  });

  describe('shouldPauseAtPhase', () => {
    it('should not pause in AUTO', () => {
      expect(transitions.shouldPauseAtPhase('AUTO', 'BUILD')).toBe(false);
    });

    it('should pause at PLAN_APPROVAL in PLAN_FIRST', () => {
      expect(transitions.shouldPauseAtPhase('PLAN_FIRST', 'PLAN_APPROVAL')).toBe(true);
    });

    it('should pause at CONFIRM in CONFIRM mode', () => {
      expect(transitions.shouldPauseAtPhase('CONFIRM', 'CONFIRM')).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      transitions.updateContext({ complexity_score: 0.5 });
      transitions.executeTransition('complexity_increase');
      transitions.reset();

      expect(transitions.getCurrentMode()).toBe('AUTO');
      expect(transitions.getHistory().length).toBe(0);
    });

    it('should reset to specified mode', () => {
      transitions.reset('PLAN_FIRST');
      expect(transitions.getCurrentMode()).toBe('PLAN_FIRST');
    });
  });

  describe('getSummary', () => {
    it('should return summary', () => {
      const summary = transitions.getSummary();
      expect(summary.current_mode).toBe('AUTO');
      expect(summary.transitions_count).toBe(0);
      expect(summary.last_transition).toBeNull();
    });

    it('should include transition history', () => {
      transitions.updateContext({ complexity_score: 0.5 });
      transitions.executeTransition('complexity_increase');

      const summary = transitions.getSummary();
      expect(summary.transitions_count).toBe(1);
      expect(summary.last_transition).not.toBeNull();
    });
  });

  describe('createModeTransitionManager factory', () => {
    it('should create instance', () => {
      const manager = createModeTransitionManager();
      expect(manager).toBeInstanceOf(ModeTransitionManager);
    });

    it('should accept initial mode', () => {
      const manager = createModeTransitionManager('CONFIRM');
      expect(manager.getCurrentMode()).toBe('CONFIRM');
    });
  });
});
