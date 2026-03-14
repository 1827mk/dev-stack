/**
 * Scope Guard - Dev-Stack v6
 * Validates file paths against protected patterns
 */

import * as path from 'path';
import * as fs from 'fs';
import {
  ScopeGuardConfig,
  ProtectedPathPattern,
  ScopeCheckInput,
  GuardResult,
  RiskLevel,
  GuardType
} from './types';

/**
 * Default protected paths
 */
const DEFAULT_PROTECTED_PATHS: ProtectedPathPattern[] = [
  {
    pattern: '.env',
    reason: 'Environment secrets - use .env.example instead',
    block_operations: ['write', 'edit', 'delete'],
    suggestion: 'Use .env.example for documentation',
    severity: 'critical'
  },
  {
    pattern: '.env.*',
    reason: 'Environment secrets (development, staging, production)',
    block_operations: ['write', 'edit', 'delete'],
    suggestion: 'Use .env.example for documentation',
    severity: 'critical'
  },
  {
    pattern: 'migrations/**',
    reason: 'Database integrity - migrations should not be modified after commit',
    block_operations: ['write', 'edit', 'delete'],
    suggestion: 'Create new migration file instead',
    severity: 'high'
  },
  {
    pattern: '.git/**',
    reason: 'Version control integrity - git operations should use git commands',
    block_operations: ['write', 'edit', 'delete', 'bash'],
    suggestion: 'Use git commands for version control',
    severity: 'critical'
  },
  {
    pattern: '*.pem',
    reason: 'Certificate files - sensitive security data',
    block_operations: ['write', 'edit', 'delete'],
    suggestion: 'Use environment variables or secret manager',
    severity: 'critical'
  },
  {
    pattern: '*.key',
    reason: 'Private key files - sensitive security data',
    block_operations: ['write', 'edit', 'delete'],
    suggestion: 'Use environment variables or secret manager',
    severity: 'critical'
  },
  {
    pattern: 'credentials.*',
    reason: 'Credential files - sensitive authentication data',
    block_operations: ['write', 'edit', 'delete'],
    suggestion: 'Use environment variables or secret manager',
    severity: 'critical'
  },
  {
    pattern: 'secrets.*',
    reason: 'Secret files - sensitive configuration data',
    block_operations: ['write', 'edit', 'delete'],
    suggestion: 'Use environment variables or secret manager',
    severity: 'critical'
  },
  {
    pattern: '.claude-plugin/marketplace.json',
    reason: 'Marketplace configuration - plugin registration',
    block_operations: ['write', 'edit'],
    suggestion: 'Contact plugin maintainer for changes',
    severity: 'medium'
  },
  {
    pattern: 'package-lock.json',
    reason: 'Lock file integrity - prevents dependency conflicts',
    block_operations: ['write', 'edit', 'delete'],
    suggestion: 'Use npm install to update',
    severity: 'low'
  }
];

/**
 * Default scope guard configuration
 */
const DEFAULT_CONFIG: ScopeGuardConfig = {
  enabled: true,
  protected_paths: DEFAULT_PROTECTED_PATHS,
  allow_user_override: false,
  log_violations: true
};

/**
 * Scope Guard class
 */
export class ScopeGuard {
  private config: ScopeGuardConfig;
  private projectRoot: string;

  constructor(config: Partial<ScopeGuardConfig> = {}, projectRoot: string = process.cwd()) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.projectRoot = projectRoot;
  }

  /**
   * Check if a path is protected for a given operation
   */
  check(input: ScopeCheckInput): GuardResult {
    if (!this.config.enabled) {
      return this.allowResult('Scope guard disabled');
    }

    const normalizedPath = this.normalizePath(input.path);
    const matchedPattern = this.findMatchingPattern(normalizedPath);

    if (!matchedPattern) {
      return this.allowResult('Path not protected');
    }

    const operationBlocked = matchedPattern.block_operations.includes(input.operation);

    if (!operationBlocked) {
      return this.allowResult(`Operation ${input.operation} allowed on protected path`, matchedPattern);
    }

    return this.blockResult(
      `Protected path: ${input.path}`,
      matchedPattern.reason,
      matchedPattern.suggestion,
      matchedPattern.severity
    );
  }

  /**
   * Check multiple paths at once
   */
  checkPaths(paths: string[], operation: ScopeCheckInput['operation']): GuardResult[] {
    return paths.map(p => this.check({ path: p, operation }));
  }

  /**
   * Check if any path in a list is blocked
   */
  hasBlockedPath(paths: string[], operation: ScopeCheckInput['operation']): boolean {
    return this.checkPaths(paths, operation).some(r => !r.allowed);
  }

  /**
   * Get all matching protected patterns for a path
   */
  getMatchingPatterns(targetPath: string): ProtectedPathPattern[] {
    const normalizedPath = this.normalizePath(targetPath);
    return this.config.protected_paths.filter(pattern =>
      this.matchesPattern(normalizedPath, pattern.pattern)
    );
  }

  /**
   * Add a protected path pattern
   */
  addProtectedPath(pattern: ProtectedPathPattern): void {
    this.config.protected_paths.push(pattern);
  }

  /**
   * Remove a protected path pattern
   */
  removeProtectedPath(pattern: string): boolean {
    const index = this.config.protected_paths.findIndex(p => p.pattern === pattern);
    if (index >= 0) {
      this.config.protected_paths.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all protected paths
   */
  getProtectedPaths(): ProtectedPathPattern[] {
    return [...this.config.protected_paths];
  }

  /**
   * Normalize path for comparison
   */
  private normalizePath(inputPath: string): string {
    // Convert to forward slashes
    let normalized = inputPath.replace(/\\/g, '/');

    // Remove leading ./
    normalized = normalized.replace(/^\.\//, '');

    // Make relative to project root if absolute
    if (path.isAbsolute(normalized)) {
      normalized = path.relative(this.projectRoot, normalized);
    }

    return normalized;
  }

  /**
   * Find matching protected pattern
   */
  private findMatchingPattern(normalizedPath: string): ProtectedPathPattern | null {
    for (const pattern of this.config.protected_paths) {
      if (this.matchesPattern(normalizedPath, pattern.pattern)) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * Match path against glob pattern
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Handle different pattern types
    if (pattern.includes('**')) {
      // Directory wildcard - matches any depth
      const basePattern = pattern.replace(/\*\*/g, '*');
      return this.globMatch(filePath, basePattern);
    }

    if (pattern.includes('*')) {
      // Simple wildcard
      return this.globMatch(filePath, pattern);
    }

    // Exact match
    if (filePath === pattern) {
      return true;
    }

    // Directory prefix match
    if (filePath.startsWith(pattern + '/') || pattern.startsWith(filePath + '/')) {
      return true;
    }

    return false;
  }

  /**
   * Simple glob matching
   */
  private globMatch(filePath: string, pattern: string): boolean {
    // Convert glob to regex
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special chars
      .replace(/\*/g, '.*') // * matches anything
      .replace(/\?/g, '.'); // ? matches single char

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(filePath);
  }

  /**
   * Create allow result
   */
  private allowResult(reason: string, pattern?: ProtectedPathPattern): GuardResult {
    return {
      guard_type: 'scope' as GuardType,
      action: 'allow',
      allowed: true,
      reason,
      risk_level: pattern?.severity as RiskLevel || 'low',
      timestamp: new Date().toISOString(),
      details: pattern ? { pattern: pattern.pattern } : undefined
    };
  }

  /**
   * Create block result
   */
  private blockResult(
    reason: string,
    explanation: string,
    suggestion?: string,
    severity: RiskLevel = 'high'
  ): GuardResult {
    return {
      guard_type: 'scope' as GuardType,
      action: 'block',
      allowed: false,
      reason,
      suggestion,
      risk_level: severity,
      timestamp: new Date().toISOString(),
      details: { explanation }
    };
  }

  /**
   * Load configuration from scope.json
   */
  static loadFromConfig(configPath: string, projectRoot: string): ScopeGuard {
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(content);
        return new ScopeGuard(
          { protected_paths: config.protected_paths || [] },
          projectRoot
        );
      }
    } catch (error) {
      // Fall back to defaults
    }
    return new ScopeGuard({}, projectRoot);
  }
}

/**
 * Export singleton instance
 */
export const scopeGuard = new ScopeGuard();
