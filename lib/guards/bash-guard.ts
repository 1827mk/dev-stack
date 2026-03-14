/**
 * Bash Guard - Dev-Stack v6
 * Blocks dangerous bash commands and validates shell operations
 */

import {
  BashGuardConfig,
  DangerousCommand,
  BashCheckInput,
  BashCheckResult,
  RiskLevel
} from './types';

/**
 * Default dangerous commands
 */
const DEFAULT_DANGEROUS_COMMANDS: DangerousCommand[] = [
  // System destruction
  {
    pattern: '^rm\\s+(-[rf]+\\s+|.*\\s+-[rf]+\\s*)(/|/\\*|~|\\.)',
    reason: 'Recursive delete of critical directories',
    severity: 'critical',
    block: true
  },
  {
    pattern: 'rm\\s+-rf\\s+/',
    reason: 'Recursive delete all - system destruction',
    severity: 'critical',
    block: true
  },
  {
    pattern: 'rm\\s+-rf\\s+\\*',
    reason: 'Recursive delete all in current directory',
    severity: 'critical',
    block: true
  },
  {
    pattern: 'mkfs(\\.|\\s)',
    reason: 'Filesystem format - data destruction',
    severity: 'critical',
    block: true
  },
  {
    pattern: 'dd\\s+.*of=/dev/',
    reason: 'Direct disk write - data destruction',
    severity: 'critical',
    block: true
  },
  {
    pattern: ':\\(\\)\\s*\\{\\s*:\\|:&\\s*\\};\\s*:',
    reason: 'Fork bomb - system resource exhaustion',
    severity: 'critical',
    block: true
  },

  // Database destruction
  {
    pattern: '(DROP|TRUNCATE)\\s+(DATABASE|TABLE|SCHEMA)',
    reason: 'Database/Table destruction',
    severity: 'critical',
    block: true
  },

  // Remote code execution
  {
    pattern: 'curl\\s+.*\\|.*bash',
    reason: 'Remote code execution - security risk',
    severity: 'critical',
    block: true
  },
  {
    pattern: 'wget\\s+.*\\|.*bash',
    reason: 'Remote code execution - security risk',
    severity: 'critical',
    block: true
  },
  {
    pattern: 'curl\\s+.*\\|.*sh',
    reason: 'Remote code execution - security risk',
    severity: 'critical',
    block: true
  },

  // Permission changes
  {
    pattern: 'chmod\\s+(-R\\s+)?777',
    reason: 'Insecure permissions - security risk',
    severity: 'high',
    block: true
  },
  {
    pattern: 'chown\\s+-R\\s+[^\\s]+\\s+/',
    reason: 'Recursive ownership change - security risk',
    severity: 'high',
    block: true
  },

  // Network operations
  {
    pattern: 'nc\\s+.*-e\\s+/bin/(ba)?sh',
    reason: 'Reverse shell - security risk',
    severity: 'critical',
    block: true
  },
  {
    pattern: '/bin/(ba)?sh\\s+-i\\s+>&\\s+/dev/tcp',
    reason: 'Reverse shell - security risk',
    severity: 'critical',
    block: true
  },

  // Service control (require confirmation)
  {
    pattern: 'systemctl\\s+(stop|disable|restart)',
    reason: 'Service control operation',
    severity: 'medium',
    block: false,
    alternatives: ['Use systemctl status first', 'Confirm service impact']
  },
  {
    pattern: 'service\\s+\\w+\\s+stop',
    reason: 'Service stop operation',
    severity: 'medium',
    block: false
  },

  // Process control
  {
    pattern: 'kill\\s+-9\\s+1',
    reason: 'Kill init process - system instability',
    severity: 'critical',
    block: true
  },
  {
    pattern: 'pkill\\s+-9',
    reason: 'Force kill all matching processes',
    severity: 'high',
    block: false
  },

  // User management
  {
    pattern: 'userdel\\s+',
    reason: 'User deletion operation',
    severity: 'high',
    block: false
  },
  {
    pattern: 'passwd\\s+',
    reason: 'Password change operation',
    severity: 'medium',
    block: false
  },

  // Git force operations
  {
    pattern: 'git\\s+push\\s+.*--force',
    reason: 'Force push - may overwrite history',
    severity: 'high',
    block: false,
    alternatives: ['Use --force-with-lease instead']
  },
  {
    pattern: 'git\\s+reset\\s+--hard',
    reason: 'Hard reset - loses uncommitted changes',
    severity: 'medium',
    block: false
  },

  // Package management
  {
    pattern: 'npm\\s+publish',
    reason: 'Package publication',
    severity: 'medium',
    block: false
  },
  {
    pattern: 'pip\\s+install\\s+--user',
    reason: 'User-level package installation',
    severity: 'low',
    block: false
  }
];

/**
 * Patterns that require confirmation
 */
const CONFIRMATION_PATTERNS: string[] = [
  'git\\s+commit',
  'git\\s+push',
  'npm\\s+install\\s+-g',
  'sudo\\s+',
  'su\\s+',
  '>\\s*/dev/null',
  '2>&1'
];

/**
 * Default bash guard configuration
 */
const DEFAULT_CONFIG: BashGuardConfig = {
  enabled: true,
  blocked_commands: DEFAULT_DANGEROUS_COMMANDS,
  require_confirmation_patterns: CONFIRMATION_PATTERNS,
  timeout_seconds: 300
};

/**
 * Bash Guard class
 */
export class BashGuard {
  private config: BashGuardConfig;
  private compiledPatterns: Map<string, RegExp>;

  constructor(config: Partial<BashGuardConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.compiledPatterns = new Map();
    this.compilePatterns();
  }

  /**
   * Compile all patterns to regex
   */
  private compilePatterns(): void {
    for (const cmd of this.config.blocked_commands) {
      try {
        const regex = new RegExp(cmd.pattern, 'i');
        this.compiledPatterns.set(cmd.pattern, regex);
      } catch (error) {
        console.error(`Failed to compile pattern ${cmd.pattern}: ${error}`);
      }
    }
  }

  /**
   * Check if a command is safe
   */
  check(input: BashCheckInput): BashCheckResult {
    if (!this.config.enabled) {
      return this.allowResult('Bash guard disabled');
    }

    const command = input.command.trim();

    // Check against all dangerous patterns
    for (const dangerousCmd of this.config.blocked_commands) {
      const regex = this.compiledPatterns.get(dangerousCmd.pattern);
      if (!regex) continue;

      if (regex.test(command)) {
        if (dangerousCmd.block) {
          return this.blockResult(
            command,
            dangerousCmd.pattern,
            dangerousCmd.reason,
            dangerousCmd.severity,
            dangerousCmd.alternatives
          );
        } else {
          return this.confirmResult(
            command,
            dangerousCmd.pattern,
            dangerousCmd.reason,
            dangerousCmd.severity,
            dangerousCmd.alternatives
          );
        }
      }
    }

    // Check confirmation patterns
    for (const pattern of this.config.require_confirmation_patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(command)) {
        return this.confirmResult(
          command,
          pattern,
          'Command requires confirmation',
          'low'
        );
      }
    }

    return this.allowResult('Command allowed');
  }

  /**
   * Check if command is blocked
   */
  isBlocked(command: string): boolean {
    const result = this.check({ command });
    return result.action === 'block';
  }

  /**
   * Check if command requires confirmation
   */
  requiresConfirmation(command: string): boolean {
    const result = this.check({ command });
    return result.action === 'confirm';
  }

  /**
   * Get safe alternative for a command
   */
  getSafeAlternative(command: string): string | null {
    for (const dangerousCmd of this.config.blocked_commands) {
      const regex = this.compiledPatterns.get(dangerousCmd.pattern);
      if (!regex) continue;

      if (regex.test(command) && dangerousCmd.alternatives?.length) {
        return dangerousCmd.alternatives[0];
      }
    }
    return null;
  }

  /**
   * Parse command into parts
   */
  parseCommand(command: string): string[] {
    // Simple command parsing - handles basic cases
    const parts: string[] = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (const char of command) {
      if ((char === '"' || char === "'") && !inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuote) {
        inQuote = false;
        quoteChar = '';
      } else if (char === ' ' && !inQuote) {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  /**
   * Add dangerous command pattern
   */
  addDangerousCommand(cmd: DangerousCommand): void {
    this.config.blocked_commands.push(cmd);
    try {
      const regex = new RegExp(cmd.pattern, 'i');
      this.compiledPatterns.set(cmd.pattern, regex);
    } catch (error) {
      console.error(`Failed to compile pattern ${cmd.pattern}: ${error}`);
    }
  }

  /**
   * Get all dangerous commands
   */
  getDangerousCommands(): DangerousCommand[] {
    return [...this.config.blocked_commands];
  }

  /**
   * Create allow result
   */
  private allowResult(reason: string): BashCheckResult {
    return {
      guard_type: 'bash',
      action: 'allow',
      allowed: true,
      reason,
      risk_level: 'low',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create block result
   */
  private blockResult(
    command: string,
    pattern: string,
    reason: string,
    severity: RiskLevel,
    alternatives?: string[]
  ): BashCheckResult {
    return {
      guard_type: 'bash',
      action: 'block',
      allowed: false,
      reason: `Dangerous command blocked: ${reason}`,
      suggestion: alternatives?.[0] || 'Use a safer alternative',
      risk_level: severity,
      matched_pattern: pattern,
      command_parts: this.parseCommand(command),
      safe_alternative: alternatives?.[0],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create confirm result
   */
  private confirmResult(
    command: string,
    pattern: string,
    reason: string,
    severity: RiskLevel,
    alternatives?: string[]
  ): BashCheckResult {
    return {
      guard_type: 'bash',
      action: 'confirm',
      allowed: false,
      reason: `Command requires confirmation: ${reason}`,
      suggestion: alternatives?.[0],
      risk_level: severity,
      matched_pattern: pattern,
      command_parts: this.parseCommand(command),
      safe_alternative: alternatives?.[0],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Export singleton instance
 */
export const bashGuard = new BashGuard();
