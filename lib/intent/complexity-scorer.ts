/**
 * Complexity Scorer - Dev-Stack v6
 * Calculates task complexity score (0.0-1.0) for execution mode selection
 */

/**
 * Complexity factor scores
 */
export interface ComplexityFactors {
  files_affected: number;      // 0.0-1.0: How many files will be modified
  risk_level: number;          // 0.0-1.0: Potential for damage
  dependencies: number;        // 0.0-1.0: External dependencies needed
  cross_cutting: number;       // 0.0-1.0: Affects multiple modules
  user_clarity: number;        // 0.0-1.0: How clear is the request (inverse)
  reversibility: number;       // 0.0-1.0: How hard to undo
}

/**
 * Factor weights for total complexity calculation
 */
export const FACTOR_WEIGHTS: Record<keyof ComplexityFactors, number> = {
  files_affected: 0.25,
  risk_level: 0.20,
  dependencies: 0.15,
  cross_cutting: 0.15,
  user_clarity: 0.10,
  reversibility: 0.05
};

/**
 * Risk level classification
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Dependency level classification
 */
export type DependencyLevel = 'none' | 'few' | 'some' | 'many' | 'extensive';

/**
 * Cross-cutting scope classification
 */
export type CrossCuttingScope = 'single_file' | 'module' | 'multiple_modules' | 'system_wide' | 'all';

/**
 * Clarity level classification
 */
export type ClarityLevel = 'very_clear' | 'clear' | 'somewhat' | 'unclear' | 'very_unclear';

/**
 * Reversibility level classification
 */
export type ReversibilityLevel = 'easy' | 'moderate' | 'difficult' | 'impossible';

/**
 * Complexity scorer class
 */
export class ComplexityScorer {
  /**
   * Calculate complexity score from individual factors
   */
  calculateScore(factors: ComplexityFactors): number {
    let totalScore = 0;

    for (const [factor, weight] of Object.entries(FACTOR_WEIGHTS)) {
      const factorKey = factor as keyof ComplexityFactors;
      const factorScore = factors[factorKey] ?? 0;
      totalScore += factorScore * weight;
    }

    // Clamp to 0.0-1.0 range
    return Math.max(0, Math.min(1, totalScore));
  }

  /**
   * Score files affected factor
   */
  scoreFilesAffected(fileCount: number): number {
    if (fileCount <= 1) return 0.1;
    if (fileCount <= 3) return 0.3;
    if (fileCount <= 5) return 0.5;
    if (fileCount <= 10) return 0.7;
    if (fileCount <= 20) return 0.85;
    return 1.0;
  }

  /**
   * Score risk level factor
   */
  scoreRiskLevel(level: RiskLevel): number {
    const scores: Record<RiskLevel, number> = {
      low: 0.0,
      medium: 0.3,
      high: 0.6,
      critical: 1.0
    };
    return scores[level] ?? 0.0;
  }

  /**
   * Score dependencies factor
   */
  scoreDependencies(level: DependencyLevel): number {
    const scores: Record<DependencyLevel, number> = {
      none: 0.0,
      few: 0.2,
      some: 0.5,
      many: 0.8,
      extensive: 1.0
    };
    return scores[level] ?? 0.0;
  }

  /**
   * Score cross-cutting factor
   */
  scoreCrossCutting(scope: CrossCuttingScope): number {
    const scores: Record<CrossCuttingScope, number> = {
      single_file: 0.0,
      module: 0.2,
      multiple_modules: 0.5,
      system_wide: 0.8,
      all: 1.0
    };
    return scores[scope] ?? 0.0;
  }

  /**
   * Score user clarity factor (inverse - unclear = higher score)
   */
  scoreUserClarity(level: ClarityLevel): number {
    const scores: Record<ClarityLevel, number> = {
      very_clear: 0.1,
      clear: 0.3,
      somewhat: 0.5,
      unclear: 0.7,
      very_unclear: 1.0
    };
    return scores[level] ?? 0.5;
  }

  /**
   * Score reversibility factor
   */
  scoreReversibility(level: ReversibilityLevel): number {
    const scores: Record<ReversibilityLevel, number> = {
      easy: 0.1,
      moderate: 0.3,
      difficult: 0.6,
      impossible: 1.0
    };
    return scores[level] ?? 0.3;
  }

  /**
   * Analyze intent and estimate complexity factors
   */
  analyzeIntent(intent: {
    verb: string;
    target: string;
    context?: string;
  }): ComplexityFactors {
    const verb = intent.verb.toLowerCase();
    const target = intent.target.toLowerCase();
    const context = (intent.context ?? '').toLowerCase();

    // Estimate files affected based on target
    let filesAffected = 0.3; // Default: 2-3 files
    if (target.includes('system') || target.includes('all')) {
      filesAffected = 0.85;
    } else if (target.includes('module') || target.includes('api')) {
      filesAffected = 0.5;
    } else if (target.includes('function') || target.includes('variable')) {
      filesAffected = 0.1;
    }

    // Estimate risk based on verb
    let riskLevel: RiskLevel = 'medium';
    if (['delete', 'remove', 'drop'].includes(verb)) {
      riskLevel = 'critical';
    } else if (['update', 'change', 'migrate'].includes(verb)) {
      riskLevel = 'high';
    } else if (['add', 'create', 'make'].includes(verb)) {
      riskLevel = 'medium';
    } else if (['read', 'find', 'analyze', 'view'].includes(verb)) {
      riskLevel = 'low';
    }

    // Estimate dependencies
    let dependencies: DependencyLevel = 'some';
    if (context.includes('auth') || context.includes('payment') || context.includes('database')) {
      dependencies = 'many';
    } else if (context.includes('api') || context.includes('integration')) {
      dependencies = 'extensive';
    } else if (['read', 'find', 'view'].includes(verb)) {
      dependencies = 'few';
    }

    // Estimate cross-cutting
    let crossCutting: CrossCuttingScope = 'module';
    if (target.includes('auth') || target.includes('security')) {
      crossCutting = 'system_wide';
    } else if (target.includes('ui') || target.includes('api')) {
      crossCutting = 'multiple_modules';
    } else if (['function', 'variable', 'constant'].some(t => target.includes(t))) {
      crossCutting = 'single_file';
    }

    // User clarity - assume clear by default
    const userClarity: ClarityLevel = 'clear';

    // Reversibility based on verb
    let reversibility: ReversibilityLevel = 'moderate';
    if (['delete', 'remove', 'drop'].includes(verb)) {
      reversibility = 'difficult';
    } else if (['add', 'create'].includes(verb)) {
      reversibility = 'easy';
    } else if (['migrate', 'transform'].includes(verb)) {
      reversibility = 'impossible';
    }

    return {
      files_affected: this.scoreFilesAffected(this.estimateFileCount(filesAffected)),
      risk_level: this.scoreRiskLevel(riskLevel),
      dependencies: this.scoreDependencies(dependencies),
      cross_cutting: this.scoreCrossCutting(crossCutting),
      user_clarity: this.scoreUserClarity(userClarity),
      reversibility: this.scoreReversibility(reversibility)
    };
  }

  /**
   * Estimate file count from score
   */
  private estimateFileCount(score: number): number {
    if (score <= 0.1) return 1;
    if (score <= 0.3) return 2;
    if (score <= 0.5) return 4;
    if (score <= 0.7) return 8;
    if (score <= 0.85) return 15;
    return 25;
  }

  /**
   * Get complexity summary
   */
  getSummary(factors: ComplexityFactors): {
    score: number;
    level: string;
    dominant_factor: string;
    recommendations: string[];
  } {
    const score = this.calculateScore(factors);

    // Determine level
    let level: string;
    if (score < 0.3) level = 'Low';
    else if (score < 0.6) level = 'Medium';
    else if (score < 0.8) level = 'High';
    else level = 'Critical';

    // Find dominant factor
    let dominantFactor = 'files_affected';
    let maxScore = 0;
    for (const [factor, factorScore] of Object.entries(factors)) {
      const weightedScore = factorScore * FACTOR_WEIGHTS[factor as keyof ComplexityFactors];
      if (weightedScore > maxScore) {
        maxScore = weightedScore;
        dominantFactor = factor;
      }
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (factors.risk_level > 0.5) {
      recommendations.push('Consider creating a backup before proceeding');
    }
    if (factors.files_affected > 0.5) {
      recommendations.push('Break into smaller, incremental changes');
    }
    if (factors.dependencies > 0.5) {
      recommendations.push('Verify external dependencies are available');
    }
    if (factors.reversibility > 0.5) {
      recommendations.push('Document changes for potential rollback');
    }

    return {
      score,
      level,
      dominant_factor: dominantFactor,
      recommendations
    };
  }
}

/**
 * Export singleton instance
 */
export const complexityScorer = new ComplexityScorer();
