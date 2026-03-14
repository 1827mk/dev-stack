/**
 * Execution Mode Transitions - Dev-Stack v6
 * Manages transitions between execution modes: AUTO → PLAN_FIRST → CONFIRM → INTERACTIVE
 */

import { ExecutionMode } from '../intent/mode-selector.js';

/**
 * Transition trigger
 */
export type TransitionTrigger =
  | 'complexity_increase'
  | 'risk_detected'
  | 'user_request'
  | 'failure'
  | 'timeout'
  | 'guard_block';

/**
 * Transition rule
 */
export interface TransitionRule {
  from: ExecutionMode;
  to: ExecutionMode;
  trigger: TransitionTrigger;
  condition?: (context: TransitionContext) => boolean;
  message: string;
}

/**
 * Transition context
 */
export interface TransitionContext {
  current_mode: ExecutionMode;
  complexity_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  failures: number;
  guard_blocks: number;
  user_interactions: number;
  elapsed_time_ms: number;
}

/**
 * Transition result
 */
export interface TransitionResult {
  previous_mode: ExecutionMode;
  new_mode: ExecutionMode;
  trigger: TransitionTrigger;
  message: string;
  requires_confirmation: boolean;
}

/**
 * Mode transition manager
 */
export class ModeTransitionManager {
  private currentMode: ExecutionMode = 'AUTO';
  private context: TransitionContext;
  private transitionHistory: TransitionResult[] = [];

  /**
   * Transition rules (ordered by priority)
   */
  private rules: TransitionRule[] = [
    // AUTO → PLAN_FIRST
    {
      from: 'AUTO',
      to: 'PLAN_FIRST',
      trigger: 'complexity_increase',
      condition: (ctx) => ctx.complexity_score > 0.3,
      message: 'Task complexity increased, switching to plan-first mode'
    },
    {
      from: 'AUTO',
      to: 'PLAN_FIRST',
      trigger: 'risk_detected',
      condition: (ctx) => ctx.risk_level === 'high' || ctx.risk_level === 'critical',
      message: 'High risk detected, switching to plan-first mode for review'
    },

    // AUTO → CONFIRM
    {
      from: 'AUTO',
      to: 'CONFIRM',
      trigger: 'guard_block',
      message: 'Guard blocked operation, switching to confirm mode'
    },

    // PLAN_FIRST → CONFIRM
    {
      from: 'PLAN_FIRST',
      to: 'CONFIRM',
      trigger: 'complexity_increase',
      condition: (ctx) => ctx.complexity_score > 0.6,
      message: 'Complexity further increased, switching to confirm mode'
    },
    {
      from: 'PLAN_FIRST',
      to: 'CONFIRM',
      trigger: 'failure',
      condition: (ctx) => ctx.failures > 0,
      message: 'Failure occurred, switching to confirm mode for oversight'
    },

    // PLAN_FIRST → INTERACTIVE
    {
      from: 'PLAN_FIRST',
      to: 'INTERACTIVE',
      trigger: 'user_request',
      message: 'User requested interactive mode'
    },

    // CONFIRM → INTERACTIVE
    {
      from: 'CONFIRM',
      to: 'INTERACTIVE',
      trigger: 'complexity_increase',
      condition: (ctx) => ctx.complexity_score > 0.8,
      message: 'Critical complexity, switching to interactive mode'
    },
    {
      from: 'CONFIRM',
      to: 'INTERACTIVE',
      trigger: 'failure',
      condition: (ctx) => ctx.failures > 2,
      message: 'Multiple failures, switching to interactive mode'
    },
    {
      from: 'CONFIRM',
      to: 'INTERACTIVE',
      trigger: 'timeout',
      message: 'Operation timeout, switching to interactive mode'
    },

    // Any → INTERACTIVE (user override)
    {
      from: 'AUTO',
      to: 'INTERACTIVE',
      trigger: 'user_request',
      message: 'User requested interactive mode'
    },
    {
      from: 'PLAN_FIRST',
      to: 'INTERACTIVE',
      trigger: 'user_request',
      message: 'User requested interactive mode'
    }
  ];

  constructor(initialMode: ExecutionMode = 'AUTO') {
    this.currentMode = initialMode;
    this.context = {
      current_mode: initialMode,
      complexity_score: 0,
      risk_level: 'low',
      failures: 0,
      guard_blocks: 0,
      user_interactions: 0,
      elapsed_time_ms: 0
    };
  }

  /**
   * Get current mode
   */
  getCurrentMode(): ExecutionMode {
    return this.currentMode;
  }

  /**
   * Get context
   */
  getContext(): TransitionContext {
    return { ...this.context };
  }

  /**
   * Update context
   */
  updateContext(updates: Partial<TransitionContext>): void {
    this.context = { ...this.context, ...updates };
  }

  /**
   * Check if transition should occur
   */
  checkTransition(trigger: TransitionTrigger): TransitionResult | null {
    const applicableRules = this.rules.filter(
      rule => rule.from === this.currentMode && rule.trigger === trigger
    );

    for (const rule of applicableRules) {
      // Check condition if present
      if (rule.condition && !rule.condition(this.context)) {
        continue;
      }

      // Execute transition
      const result: TransitionResult = {
        previous_mode: this.currentMode,
        new_mode: rule.to,
        trigger,
        message: rule.message,
        requires_confirmation: this.requiresConfirmation(rule.to)
      };

      return result;
    }

    return null;
  }

  /**
   * Execute transition
   */
  executeTransition(trigger: TransitionTrigger): TransitionResult | null {
    const result = this.checkTransition(trigger);

    if (result) {
      this.currentMode = result.new_mode;
      this.context.current_mode = result.new_mode;
      this.transitionHistory.push(result);
    }

    return result;
  }

  /**
   * Force mode (user override)
   */
  forceMode(mode: ExecutionMode): TransitionResult {
    const result: TransitionResult = {
      previous_mode: this.currentMode,
      new_mode: mode,
      trigger: 'user_request',
      message: `User forced mode to ${mode}`,
      requires_confirmation: false
    };

    this.currentMode = mode;
    this.context.current_mode = mode;
    this.transitionHistory.push(result);

    return result;
  }

  /**
   * Check if mode requires confirmation
   */
  private requiresConfirmation(mode: ExecutionMode): boolean {
    switch (mode) {
      case 'AUTO':
        return false;
      case 'PLAN_FIRST':
        return true; // Confirm plan
      case 'CONFIRM':
        return true; // Confirm each step
      case 'INTERACTIVE':
        return true; // Always ask
      default:
        return true;
    }
  }

  /**
   * Get transition history
   */
  getHistory(): TransitionResult[] {
    return [...this.transitionHistory];
  }

  /**
   * Get mode phases
   */
  getModePhases(mode: ExecutionMode): string[] {
    switch (mode) {
      case 'AUTO':
        return ['THINK', 'RESEARCH', 'BUILD', 'VERIFY'];
      case 'PLAN_FIRST':
        return ['THINK', 'RESEARCH', 'PLAN_APPROVAL', 'BUILD', 'TEST', 'VERIFY'];
      case 'CONFIRM':
        return ['THINK', 'RESEARCH', 'CONFIRM', 'BUILD', 'CONFIRM', 'TEST', 'CONFIRM', 'VERIFY'];
      case 'INTERACTIVE':
        return ['THINK', 'CLARIFY', 'RESEARCH', 'CONFIRM', 'BUILD', 'CONFIRM', 'TEST', 'CONFIRM', 'VERIFY'];
      default:
        return ['THINK', 'RESEARCH', 'BUILD', 'VERIFY'];
    }
  }

  /**
   * Get confirmation points for mode
   */
  getConfirmationPoints(mode: ExecutionMode): string[] {
    switch (mode) {
      case 'AUTO':
        return [];
      case 'PLAN_FIRST':
        return ['PLAN_APPROVAL'];
      case 'CONFIRM':
        return ['CONFIRM', 'PLAN_APPROVAL'];
      case 'INTERACTIVE':
        return ['CLARIFY', 'CONFIRM', 'PLAN_APPROVAL'];
      default:
        return [];
    }
  }

  /**
   * Check if should pause at phase
   */
  shouldPauseAtPhase(mode: ExecutionMode, phase: string): boolean {
    const confirmationPoints = this.getConfirmationPoints(mode);
    return confirmationPoints.includes(phase);
  }

  /**
   * Reset to initial state
   */
  reset(initialMode: ExecutionMode = 'AUTO'): void {
    this.currentMode = initialMode;
    this.context = {
      current_mode: initialMode,
      complexity_score: 0,
      risk_level: 'low',
      failures: 0,
      guard_blocks: 0,
      user_interactions: 0,
      elapsed_time_ms: 0
    };
    this.transitionHistory = [];
  }

  /**
   * Get summary
   */
  getSummary(): {
    current_mode: ExecutionMode;
    transitions_count: number;
    last_transition: TransitionResult | null;
    context: TransitionContext;
  } {
    return {
      current_mode: this.currentMode,
      transitions_count: this.transitionHistory.length,
      last_transition: this.transitionHistory[this.transitionHistory.length - 1] ?? null,
      context: this.context
    };
  }
}

/**
 * Export singleton factory
 */
export function createModeTransitionManager(initialMode?: ExecutionMode): ModeTransitionManager {
  return new ModeTransitionManager(initialMode);
}
