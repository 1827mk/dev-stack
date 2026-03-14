/**
 * Risk Assessor - Dev-Stack v6
 * Calculates risk scores based on multiple factors
 */

import {
  RiskAssessorConfig,
  RiskFactor,
  RiskThresholds,
  RiskAssessmentInput,
  RiskAssessmentResult,
  RiskLevel,
  GuardAction
} from './types';

/**
 * Default risk factors with weights
 */
const DEFAULT_RISK_FACTORS: RiskFactor[] = [
  {
    name: 'files_affected',
    weight: 0.25,
    description: 'Number of files that will be modified'
  },
  {
    name: 'protected_paths',
    weight: 0.20,
    description: 'Whether operation affects protected paths'
  },
  {
    name: 'secrets_involved',
    weight: 0.15,
    description: 'Whether operation involves secrets'
  },
  {
    name: 'destructive',
    weight: 0.15,
    description: 'Whether operation is destructive'
  },
  {
    name: 'cross_cutting',
    weight: 0.10,
    description: 'Whether operation affects multiple modules'
  },
  {
    name: 'dependencies',
    weight: 0.10,
    description: 'Whether operation changes dependencies'
  },
  {
    name: 'complexity',
    weight: 0.05,
    description: 'Inherent complexity of the operation'
  }
];

/**
 * Default risk thresholds
 */
const DEFAULT_THRESHOLDS: RiskThresholds = {
  low: 0.3,      // < 0.3 = low risk (AUTO)
  medium: 0.5,   // 0.3-0.5 = medium risk (PLAN_FIRST)
  high: 0.7,     // 0.5-0.7 = high risk (CONFIRM)
  // >= 0.7 = critical risk (INTERACTIVE)
};

/**
 * Default risk assessor configuration
 */
const DEFAULT_CONFIG: RiskAssessorConfig = {
  enabled: true,
  factors: DEFAULT_RISK_FACTORS,
  thresholds: DEFAULT_THRESHOLDS
};

/**
 * Risk Assessor class
 */
export class RiskAssessor {
  private config: RiskAssessorConfig;

  constructor(config: Partial<RiskAssessorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Assess risk for an operation
   */
  assess(input: RiskAssessmentInput): RiskAssessmentResult {
    if (!this.config.enabled) {
      return this.createResult(0, 'low', 'allow', [], [], false);
    }

    const factorContributions = this.calculateFactors(input);
    const totalRisk = this.calculateTotalRisk(factorContributions);
    const riskLevel = this.determineRiskLevel(totalRisk);
    const action = this.determineAction(riskLevel, totalRisk);
    const recommendations = this.generateRecommendations(factorContributions, riskLevel);

    return {
      risk_score: totalRisk,
      risk_level: riskLevel,
      action,
      factors: factorContributions,
      recommendations,
      requires_confirmation: action === 'confirm' || action === 'block',
      confirmation_message: action !== 'allow'
        ? this.generateConfirmationMessage(riskLevel, factorContributions)
        : undefined
    };
  }

  /**
   * Calculate individual factor contributions
   */
  private calculateFactors(input: RiskAssessmentInput): RiskAssessmentResult['factors'] {
    const factors: RiskAssessmentResult['factors'] = [];

    // Files affected factor
    const filesFactor = this.config.factors.find(f => f.name === 'files_affected')!;
    const filesScore = this.scoreFilesAffected(input.target_files.length);
    factors.push({
      factor: 'files_affected',
      contribution: filesScore * filesFactor.weight,
      weight: filesFactor.weight
    });

    // Protected paths factor
    const protectedFactor = this.config.factors.find(f => f.name === 'protected_paths')!;
    const protectedScore = input.affects_protected_paths ? 1.0 : 0.0;
    factors.push({
      factor: 'protected_paths',
      contribution: protectedScore * protectedFactor.weight,
      weight: protectedFactor.weight
    });

    // Secrets factor
    const secretsFactor = this.config.factors.find(f => f.name === 'secrets_involved')!;
    const secretsScore = input.involves_secrets ? 1.0 : 0.0;
    factors.push({
      factor: 'secrets_involved',
      contribution: secretsScore * secretsFactor.weight,
      weight: secretsFactor.weight
    });

    // Destructive factor
    const destructiveFactor = this.config.factors.find(f => f.name === 'destructive')!;
    const destructiveScore = input.is_destructive ? 1.0 : 0.0;
    factors.push({
      factor: 'destructive',
      contribution: destructiveScore * destructiveFactor.weight,
      weight: destructiveFactor.weight
    });

    // Cross-cutting factor
    const crossCuttingFactor = this.config.factors.find(f => f.name === 'cross_cutting')!;
    const crossCuttingScore = input.cross_cutting ? 0.8 : 0.0;
    factors.push({
      factor: 'cross_cutting',
      contribution: crossCuttingScore * crossCuttingFactor.weight,
      weight: crossCuttingFactor.weight
    });

    // Dependencies factor
    const depsFactor = this.config.factors.find(f => f.name === 'dependencies')!;
    const depsScore = input.dependency_changes ? 0.7 : 0.0;
    factors.push({
      factor: 'dependencies',
      contribution: depsScore * depsFactor.weight,
      weight: depsFactor.weight
    });

    // Complexity factor
    const complexityFactor = this.config.factors.find(f => f.name === 'complexity')!;
    const complexityScore = input.complexity_score ?? 0.5;
    factors.push({
      factor: 'complexity',
      contribution: complexityScore * complexityFactor.weight,
      weight: complexityFactor.weight
    });

    return factors;
  }

  /**
   * Score files affected (0.0-1.0)
   */
  private scoreFilesAffected(count: number): number {
    if (count === 0) return 0.0;
    if (count === 1) return 0.1;
    if (count <= 3) return 0.3;
    if (count <= 5) return 0.5;
    if (count <= 10) return 0.7;
    if (count <= 20) return 0.85;
    return 1.0;
  }

  /**
   * Calculate total risk score
   */
  private calculateTotalRisk(factors: RiskAssessmentResult['factors']): number {
    const total = factors.reduce((sum, f) => sum + f.contribution, 0);
    // Normalize to 0.0-1.0 range
    return Math.min(1.0, Math.max(0.0, total));
  }

  /**
   * Determine risk level from score
   */
  private determineRiskLevel(score: number): RiskLevel {
    const thresholds = this.config.thresholds;

    if (score < thresholds.low) return 'low';
    if (score < thresholds.medium) return 'medium';
    if (score < thresholds.high) return 'high';
    return 'critical';
  }

  /**
   * Determine action based on risk level and score
   */
  private determineAction(riskLevel: RiskLevel, score: number): GuardAction {
    switch (riskLevel) {
      case 'low':
        return 'allow';
      case 'medium':
        return 'warn';
      case 'high':
        return 'confirm';
      case 'critical':
        return score >= 0.9 ? 'block' : 'confirm';
      default:
        return 'confirm';
    }
  }

  /**
   * Generate recommendations based on factors
   */
  private generateRecommendations(
    factors: RiskAssessmentResult['factors'],
    riskLevel: RiskLevel
  ): string[] {
    const recommendations: string[] = [];

    for (const f of factors) {
      if (f.contribution > 0.1) {
        switch (f.factor) {
          case 'files_affected':
            recommendations.push('Consider breaking into smaller, focused changes');
            break;
          case 'protected_paths':
            recommendations.push('Review if operation really needs to touch protected paths');
            break;
          case 'secrets_involved':
            recommendations.push('Ensure secrets are handled via environment variables');
            break;
          case 'destructive':
            recommendations.push('Create backup before destructive operation');
            break;
          case 'cross_cutting':
            recommendations.push('Coordinate changes across affected modules');
            break;
          case 'dependencies':
            recommendations.push('Review dependency changes for security vulnerabilities');
            break;
        }
      }
    }

    if (riskLevel === 'critical') {
      recommendations.unshift('⚠️ HIGH RISK: Consider manual review before proceeding');
    }

    return recommendations;
  }

  /**
   * Generate confirmation message
   */
  private generateConfirmationMessage(
    riskLevel: RiskLevel,
    factors: RiskAssessmentResult['factors']
  ): string {
    const topFactors = factors
      .filter(f => f.contribution > 0.1)
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3);

    const factorNames = topFactors.map(f =>
      f.factor.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    );

    return `⚠️ ${riskLevel.toUpperCase()} RISK operation detected.\n\n` +
      `Primary risk factors: ${factorNames.join(', ')}\n\n` +
      `Do you want to proceed?`;
  }

  /**
   * Create result object
   */
  private createResult(
    riskScore: number,
    riskLevel: RiskLevel,
    action: GuardAction,
    factors: RiskAssessmentResult['factors'],
    recommendations: string[],
    requiresConfirmation: boolean
  ): RiskAssessmentResult {
    return {
      risk_score: riskScore,
      risk_level: riskLevel,
      action,
      factors,
      recommendations,
      requires_confirmation: requiresConfirmation
    };
  }

  /**
   * Get risk level description
   */
  getRiskLevelDescription(level: RiskLevel): string {
    const descriptions: Record<RiskLevel, string> = {
      low: 'Low risk - can proceed automatically',
      medium: 'Medium risk - requires plan review',
      high: 'High risk - requires confirmation for each step',
      critical: 'Critical risk - requires explicit approval'
    };
    return descriptions[level];
  }

  /**
   * Get execution mode for risk level
   */
  getExecutionMode(level: RiskLevel): string {
    const modes: Record<RiskLevel, string> = {
      low: 'AUTO',
      medium: 'PLAN_FIRST',
      high: 'CONFIRM',
      critical: 'INTERACTIVE'
    };
    return modes[level];
  }

  /**
   * Update risk factor weight
   */
  updateFactorWeight(factorName: string, weight: number): boolean {
    const factor = this.config.factors.find(f => f.name === factorName);
    if (factor) {
      factor.weight = Math.max(0, Math.min(1, weight));
      return true;
    }
    return false;
  }

  /**
   * Get all risk factors
   */
  getFactors(): RiskFactor[] {
    return [...this.config.factors];
  }

  /**
   * Get current thresholds
   */
  getThresholds(): RiskThresholds {
    return { ...this.config.thresholds };
  }
}

/**
 * Export singleton instance
 */
export const riskAssessor = new RiskAssessor();
