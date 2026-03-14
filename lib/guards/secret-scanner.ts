/**
 * Secret Scanner - Dev-Stack v6
 * Detects secrets, API keys, passwords, and tokens in content
 */

import {
  SecretScannerConfig,
  SecretPattern,
  SecretScanResult,
  DetectedSecret
} from './types';

/**
 * Default secret patterns
 */
const DEFAULT_SECRET_PATTERNS: SecretPattern[] = [
  // API Keys
  {
    name: 'api_key_generic',
    pattern: '(api[_-]?key|apikey)[\'"]?\\s*[:=]\\s*[\'"]?[a-zA-Z0-9]{20,}',
    description: 'Generic API key pattern',
    severity: 'high'
  },
  {
    name: 'aws_access_key',
    pattern: 'AKIA[0-9A-Z]{16}',
    description: 'AWS Access Key ID',
    severity: 'critical'
  },
  {
    name: 'aws_secret_key',
    pattern: 'aws[_-]?secret[_-]?access[_-]?key[\'"]?\\s*[:=]\\s*[\'"]?[a-zA-Z0-9/+=]{40}',
    description: 'AWS Secret Access Key',
    severity: 'critical'
  },
  {
    name: 'google_api_key',
    pattern: 'AIza[0-9A-Za-z\\-_]{35}',
    description: 'Google API Key',
    severity: 'critical'
  },
  {
    name: 'github_token',
    pattern: 'ghp_[a-zA-Z0-9]{36}',
    description: 'GitHub Personal Access Token',
    severity: 'critical'
  },
  {
    name: 'github_oauth',
    pattern: 'gho_[a-zA-Z0-9]{36}',
    description: 'GitHub OAuth Token',
    severity: 'critical'
  },
  {
    name: 'anthropic_api_key',
    pattern: 'sk-ant-api03-[a-zA-Z0-9\\-_]{92}',
    description: 'Anthropic API Key',
    severity: 'critical'
  },
  {
    name: 'openai_api_key',
    pattern: 'sk-[a-zA-Z0-9]{48}',
    description: 'OpenAI API Key',
    severity: 'critical'
  },

  // Passwords
  {
    name: 'password_assignment',
    pattern: '(password|passwd|pwd)[\'"]?\\s*[:=]\\s*[\'"]?[^{\\s"\']{8,}',
    description: 'Password assignment pattern',
    severity: 'high'
  },
  {
    name: 'db_password',
    pattern: '(db_password|database_password|DB_PASS)[\'"]?\\s*[:=]\\s*[\'"]?[^{\\s"\']{8,}',
    description: 'Database password pattern',
    severity: 'critical'
  },

  // Tokens
  {
    name: 'jwt_token',
    pattern: 'eyJ[a-zA-Z0-9_-]*\\.eyJ[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*',
    description: 'JWT Token',
    severity: 'high'
  },
  {
    name: 'oauth_token',
    pattern: '(oauth[_-]?token|access[_-]?token)[\'"]?\\s*[:=]\\s*[\'"]?[a-zA-Z0-9\\-_]{20,}',
    description: 'OAuth/Access token pattern',
    severity: 'high'
  },

  // Private Keys
  {
    name: 'private_key_marker',
    pattern: '-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----',
    description: 'Private key marker',
    severity: 'critical'
  },

  // Connection Strings
  {
    name: 'db_connection_string',
    pattern: '(mysql|postgres|postgresql|mongodb|redis)://[^\\s]+:[^\\s]+@[^\\s]+',
    description: 'Database connection string with credentials',
    severity: 'critical'
  }
];

/**
 * Default secret scanner configuration
 */
const DEFAULT_CONFIG: SecretScannerConfig = {
  enabled: true,
  patterns: DEFAULT_SECRET_PATTERNS,
  scan_content: true,
  scan_filenames: true,
  allowed_in_tests: false
};

/**
 * Secret Scanner class
 */
export class SecretScanner {
  private config: SecretScannerConfig;
  private compiledPatterns: Map<string, RegExp>;

  constructor(config: Partial<SecretScannerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.compiledPatterns = new Map();
    this.compilePatterns();
  }

  /**
   * Compile all patterns to regex
   */
  private compilePatterns(): void {
    for (const pattern of this.config.patterns) {
      try {
        const regex = new RegExp(pattern.pattern, 'gi');
        this.compiledPatterns.set(pattern.name, regex);
      } catch (error) {
        console.error(`Failed to compile pattern ${pattern.name}: ${error}`);
      }
    }
  }

  /**
   * Scan content for secrets
   */
  scan(content: string, filename?: string): SecretScanResult {
    if (!this.config.enabled) {
      return { found: false, secrets: [], content_safe: true };
    }

    // Skip test files if not allowed
    if (filename && !this.config.allowed_in_tests && this.isTestFile(filename)) {
      return { found: false, secrets: [], content_safe: true };
    }

    const secrets: DetectedSecret[] = [];

    for (const pattern of this.config.patterns) {
      const regex = this.compiledPatterns.get(pattern.name);
      if (!regex) continue;

      // Reset regex state
      regex.lastIndex = 0;

      let match;
      while ((match = regex.exec(content)) !== null) {
        const detected = this.createDetectedSecret(pattern, match, content);

        // Deduplicate
        if (!secrets.some(s => s.match === detected.match && s.pattern_name === detected.pattern_name)) {
          secrets.push(detected);
        }
      }
    }

    return {
      found: secrets.length > 0,
      secrets,
      content_safe: secrets.length === 0
    };
  }

  /**
   * Check if content has any secrets
   */
  hasSecrets(content: string, filename?: string): boolean {
    return this.scan(content, filename).found;
  }

  /**
   * Mask secrets in content
   */
  maskSecrets(content: string): string {
    let masked = content;

    for (const pattern of this.config.patterns) {
      const regex = this.compiledPatterns.get(pattern.name);
      if (!regex) continue;

      regex.lastIndex = 0;
      masked = masked.replace(regex, (match) => this.maskValue(match));
    }

    return masked;
  }

  /**
   * Create detected secret object
   */
  private createDetectedSecret(
    pattern: SecretPattern,
    match: RegExpExecArray,
    content: string
  ): DetectedSecret {
    const matchText = match[0];
    const lineNumber = this.getLineNumber(content, match.index);
    const columnNumber = this.getColumnNumber(content, match.index);
    const context = this.getContext(content, match.index, matchText.length);

    return {
      pattern_name: pattern.name,
      match: this.maskValue(matchText),
      line_number: lineNumber,
      column_number: columnNumber,
      severity: pattern.severity,
      context: this.maskValue(context)
    };
  }

  /**
   * Mask a secret value
   */
  private maskValue(value: string): string {
    if (value.length <= 8) {
      return '*'.repeat(value.length);
    }

    // Show first 4 and last 4 characters
    const start = value.substring(0, 4);
    const end = value.substring(value.length - 4);
    const middle = '*'.repeat(Math.min(value.length - 8, 20));

    return `${start}${middle}${end}`;
  }

  /**
   * Get line number from index
   */
  private getLineNumber(content: string, index: number): number {
    const lines = content.substring(0, index).split('\n');
    return lines.length;
  }

  /**
   * Get column number from index
   */
  private getColumnNumber(content: string, index: number): number {
    const lastNewline = content.lastIndexOf('\n', index - 1);
    return index - lastNewline;
  }

  /**
   * Get surrounding context
   */
  private getContext(content: string, index: number, length: number): string {
    const start = Math.max(0, index - 20);
    const end = Math.min(content.length, index + length + 20);
    return content.substring(start, end);
  }

  /**
   * Check if file is a test file
   */
  private isTestFile(filename: string): boolean {
    const testPatterns = [
      /\.test\./i,
      /\.spec\./i,
      /_test\./i,
      /_spec\./i,
      /__tests__/i,
      /test\//i,
      /tests\//i
    ];

    return testPatterns.some(p => p.test(filename));
  }
}

/**
 * Export singleton instance
 */
export const secretScanner = new SecretScanner();
