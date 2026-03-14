/**
 * Execution Mode Selector - Dev-Stack v6
 * Selects execution mode based on complexity score and context
 */

import { ComplexityFactors, complexityScorer } from './complexity-scorer.js';

/**
 * Execution mode types
 */
export type ExecutionMode = 'AUTO' | 'PLAN_FIRST' | 'CONFIRM' | 'INTERACTIVE';

/**
 * Mode selection thresholds
 */
export const MODE_THRESHOLDS = {
  AUTO: { max: 0.3 },
  PLAN_FIRST: { min: 0.3, max: 0.6 },
  CONFIRM: { min: 0.6, max: 0.8 },
  INTERACTIVE: { min: 0.8 }
};

/**
 * Mode configuration
 */
export interface ModeConfig {
  mode: ExecutionMode;
  reason: string;
  phases: string[];
  estimated_steps: number;
  confirm_required: boolean;
  allows_quick_mode: boolean;
}

/**
 * Mode selection result
 */
export interface ModeSelectionResult {
  mode: ExecutionMode;
  config: ModeConfig;
  complexity_score: number;
  factors: ComplexityFactors;
  quick_mode_available: boolean;
}

/**
 * Execution mode selector class
 */
export class ModeSelector {
  private quickModeEnabled: boolean = false;

  /**
   * Enable or disable quick mode
   */
  setQuickMode(enabled: boolean): void {
    this.quickModeEnabled = enabled;
  }

  /**
   * Select execution mode based on complexity score
   */
  selectMode(complexityScore: number): ExecutionMode {
    // Quick mode forces AUTO
    if (this.quickModeEnabled) {
      return 'AUTO';
    }

    if (complexityScore < MODE_THRESHOLDS.AUTO.max) {
      return 'AUTO';
    } else if (complexityScore < MODE_THRESHOLDS.PLAN_FIRST.max) {
      return 'PLAN_FIRST';
    } else if (complexityScore < MODE_THRESHOLDS.CONFIRM.max) {
      return 'CONFIRM';
    } else {
      return 'INTERACTIVE';
    }
  }

  /**
   * Get mode configuration
   */
  getModeConfig(mode: ExecutionMode, complexityScore: number): ModeConfig {
    const configs: Record<ExecutionMode, ModeConfig> = {
      AUTO: {
        mode: 'AUTO',
        reason: 'Low complexity, safe to execute immediately',
        phases: ['THINK', 'RESEARCH', 'BUILD', 'VERIFY'],
        estimated_steps: this.estimateSteps(complexityScore),
        confirm_required: false,
        allows_quick_mode: true
      },
      PLAN_FIRST: {
        mode: 'PLAN_FIRST',
        reason: 'Medium complexity, requires plan approval',
        phases: ['THINK', 'RESEARCH', 'PLAN_APPROVAL', 'BUILD', 'TEST', 'VERIFY'],
        estimated_steps: this.estimateSteps(complexityScore) + 2,
        confirm_required: true,
        allows_quick_mode: true
      },
      CONFIRM: {
        mode: 'CONFIRM',
        reason: 'High complexity, requires confirmation at each step',
        phases: ['THINK', 'RESEARCH', 'CONFIRM', 'BUILD', 'CONFIRM', 'TEST', 'CONFIRM', 'VERIFY'],
        estimated_steps: this.estimateSteps(complexityScore) + 4,
        confirm_required: true,
        allows_quick_mode: false
      },
      INTERACTIVE: {
        mode: 'INTERACTIVE',
        reason: 'Critical complexity, requires interactive guidance',
        phases: ['THINK', 'CLARIFY', 'RESEARCH', 'CONFIRM', 'BUILD', 'CONFIRM', 'TEST', 'CONFIRM', 'VERIFY'],
        estimated_steps: this.estimateSteps(complexityScore) + 6,
        confirm_required: true,
        allows_quick_mode: false
      }
    };

    return configs[mode];
  }

  /**
   * Estimate number of steps based on complexity
   */
  private estimateSteps(complexityScore: number): number {
    // Base steps: 3-5
    // Add more steps for higher complexity
    const baseSteps = 3;
    const additionalSteps = Math.floor(complexityScore * 10);
    return baseSteps + additionalSteps;
  }

  /**
   * Full mode selection from factors
   */
  selectFromFactors(factors: ComplexityFactors): ModeSelectionResult {
    const complexityScore = complexityScorer.calculateScore(factors);
    const mode = this.selectMode(complexityScore);
    const config = this.getModeConfig(mode, complexityScore);

    return {
      mode,
      config,
      complexity_score: complexityScore,
      factors,
      quick_mode_available: config.allows_quick_mode && this.quickModeEnabled
    };
  }

  /**
   * Select mode from intent
   */
  selectFromIntent(intent: {
    verb: string;
    target: string;
    context?: string;
  }): ModeSelectionResult {
    const factors = complexityScorer.analyzeIntent(intent);
    return this.selectFromFactors(factors);
  }

  /**
   * Check if mode allows skipping phases
   */
  canSkipPhase(mode: ExecutionMode, phase: string): boolean {
    if (this.quickModeEnabled && mode === 'AUTO') {
      // Quick mode can skip THINK and RESEARCH
      return phase === 'THINK' || phase === 'RESEARCH';
    }
    return false;
  }

  /**
   * Get phases to execute for a mode
   */
  getPhases(mode: ExecutionMode): string[] {
    const config = this.getModeConfig(mode, 0.5);
    return config.phases;
  }

  /**
   * Check if confirmation is needed for a phase
   */
  needsConfirmation(mode: ExecutionMode, phase: string): boolean {
    if (mode === 'AUTO') return false;
    if (mode === 'PLAN_FIRST') return phase === 'PLAN_APPROVAL';
    if (mode === 'CONFIRM' || mode === 'INTERACTIVE') {
      return ['CONFIRM', 'PLAN_APPROVAL', 'CLARIFY'].includes(phase) ||
             phase === 'BUILD' ||
             phase === 'TEST';
    }
    return false;
  }

  /**
   * Get mode summary for display
   */
  getModeSummary(result: ModeSelectionResult): string {
    const lines: string[] = [
      `## Execution Mode: ${result.mode}`,
      '',
      `**Reason**: ${result.config.reason}`,
      `**Complexity Score**: ${result.complexity_score.toFixed(2)}`,
      `**Estimated Steps**: ${result.config.estimated_steps}`,
      `**Phases**: ${result.config.phases.join(' → ')}`,
      ''
    ];

    // Add factor breakdown
    lines.push('### Complexity Factors:');
    for (const [factor, score] of Object.entries(result.factors)) {
      const bar = this.createProgressBar(score);
      lines.push(`- ${factor}: ${bar} ${score.toFixed(2)}`);
    }

    if (result.quick_mode_available) {
      lines.push('');
      lines.push('*Quick mode available: use `--quick` to skip THINK/RESEARCH*');
    }

    return lines.join('\n');
  }

  /**
   * Create ASCII progress bar
   */
  private createProgressBar(value: number, width: number = 10): string {
    const filled = Math.round(value * width);
    const empty = width - filled;
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  }
}

/**
 * Export singleton instance
 */
export const modeSelector = new ModeSelector();
