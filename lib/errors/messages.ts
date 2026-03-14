/**
 * Error Messages - Dev-Stack v6
 * Standardized error codes and messages
 */

/**
 * Dev-Stack error codes
 */
export enum DevStackErrorCode {
  // DS001: Scope/Guard errors
  PROTECTED_PATH_ACCESS = 'DS001',
  SECRET_DETECTED = 'DS002',
  DANGEROUS_COMMAND = 'DS003',

  // DS004: Context errors
  DNA_NOT_FOUND = 'DS004',
  CONTEXT_OVERFLOW = 'DS005',
  TOKEN_BUDGET_EXCEEDED = 'DS006',

  // DS007: Pattern errors
  PATTERN_NOT_FOUND = 'DS007',
  PATTERN_ADAPTATION_FAILED = 'DS008',
  PATTERN_DATABASE_ERROR = 'DS009',

  // DS010: Checkpoint errors
  CHECKPOINT_CORRUPTED = 'DS010',
  CHECKPOINT_NOT_FOUND = 'DS011',
  ROLLBACK_FAILED = 'DS012',

  // DS013: Tool errors
  TOOL_UNAVAILABLE = 'DS013',
  TOOL_TIMEOUT = 'DS014',
  TOOL_SELECTION_FAILED = 'DS015',

  // DS016: Execution errors
  EXECUTION_FAILED = 'DS016',
  MODE_TRANSITION_FAILED = 'DS017',
  RECOVERY_FAILED = 'DS018',

  // DS019: Configuration errors
  INVALID_CONFIGURATION = 'DS019',
  CAPABILITY_REGISTRY_ERROR = 'DS020',
}

/**
 * Error message templates
 */
export const ERROR_MESSAGES: Record<DevStackErrorCode, string> = {
  [DevStackErrorCode.PROTECTED_PATH_ACCESS]:
    'Access to protected path denied: {path}. This path is configured as protected and cannot be modified.',

  [DevStackErrorCode.SECRET_DETECTED]:
    'Secret detected in content: {type}. Please remove sensitive data before proceeding.',

  [DevStackErrorCode.DANGEROUS_COMMAND]:
    'Dangerous command blocked: {command}. This command is not allowed for safety reasons.',

  [DevStackErrorCode.DNA_NOT_FOUND]:
    'Project DNA not found. Run /dev-stack:learn to scan the project first.',

  [DevStackErrorCode.CONTEXT_OVERFLOW]:
    'Context window overflow detected. Consider using --quick mode or breaking down the task.',

  [DevStackErrorCode.TOKEN_BUDGET_EXCEEDED]:
    'Token budget exceeded: used {used}/{total}. Consider summarizing context or using progressive loading.',

  [DevStackErrorCode.PATTERN_NOT_FOUND]:
    'Pattern not found: {patternId}. The pattern may have been deleted or never existed.',

  [DevStackErrorCode.PATTERN_ADAPTATION_FAILED]:
    'Failed to adapt pattern {patternName} for target tech stack. Manual adaptation may be required.',

  [DevStackErrorCode.PATTERN_DATABASE_ERROR]:
    'Pattern database error: {details}. Try running /dev-stack:learn to rebuild the database.',

  [DevStackErrorCode.CHECKPOINT_CORRUPTED]:
    'Checkpoint file is corrupted. Starting fresh session. Previous work may be recoverable via git.',

  [DevStackErrorCode.CHECKPOINT_NOT_FOUND]:
    'No checkpoint found for this session. A new checkpoint will be created on next save.',

  [DevStackErrorCode.ROLLBACK_FAILED]:
    'Rollback failed at level {level}. Manual intervention may be required.',

  [DevStackErrorCode.TOOL_UNAVAILABLE]:
    'Tool {toolName} is not available. Using fallback: {fallbackTool}.',

  [DevStackErrorCode.TOOL_TIMEOUT]:
    'Tool {toolName} timed out after {timeout}ms. Consider increasing timeout or simplifying the task.',

  [DevStackErrorCode.TOOL_SELECTION_FAILED]:
    'Failed to select appropriate tool for capability: {capability}. No matching tools found.',

  [DevStackErrorCode.EXECUTION_FAILED]:
    'Task execution failed at phase {phase}: {reason}. Check logs for details.',

  [DevStackErrorCode.MODE_TRANSITION_FAILED]:
    'Failed to transition from {from} to {to} mode. Staying in current mode.',

  [DevStackErrorCode.RECOVERY_FAILED]:
    'Recovery strategy {strategy} failed. Escalating to user intervention.',

  [DevStackErrorCode.INVALID_CONFIGURATION]:
    'Invalid configuration in {file}: {details}. Using default values.',

  [DevStackErrorCode.CAPABILITY_REGISTRY_ERROR]:
    'Capability registry error: {details}. Some tools may not be available.',
};

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error severity mapping
 */
export const ERROR_SEVERITY: Record<DevStackErrorCode, ErrorSeverity> = {
  [DevStackErrorCode.PROTECTED_PATH_ACCESS]: 'high',
  [DevStackErrorCode.SECRET_DETECTED]: 'critical',
  [DevStackErrorCode.DANGEROUS_COMMAND]: 'high',
  [DevStackErrorCode.DNA_NOT_FOUND]: 'medium',
  [DevStackErrorCode.CONTEXT_OVERFLOW]: 'medium',
  [DevStackErrorCode.TOKEN_BUDGET_EXCEEDED]: 'medium',
  [DevStackErrorCode.PATTERN_NOT_FOUND]: 'low',
  [DevStackErrorCode.PATTERN_ADAPTATION_FAILED]: 'low',
  [DevStackErrorCode.PATTERN_DATABASE_ERROR]: 'medium',
  [DevStackErrorCode.CHECKPOINT_CORRUPTED]: 'medium',
  [DevStackErrorCode.CHECKPOINT_NOT_FOUND]: 'low',
  [DevStackErrorCode.ROLLBACK_FAILED]: 'high',
  [DevStackErrorCode.TOOL_UNAVAILABLE]: 'low',
  [DevStackErrorCode.TOOL_TIMEOUT]: 'medium',
  [DevStackErrorCode.TOOL_SELECTION_FAILED]: 'medium',
  [DevStackErrorCode.EXECUTION_FAILED]: 'high',
  [DevStackErrorCode.MODE_TRANSITION_FAILED]: 'medium',
  [DevStackErrorCode.RECOVERY_FAILED]: 'high',
  [DevStackErrorCode.INVALID_CONFIGURATION]: 'medium',
  [DevStackErrorCode.CAPABILITY_REGISTRY_ERROR]: 'medium',
};

/**
 * Dev-Stack Error class
 */
export class DevStackError extends Error {
  public readonly code: DevStackErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly details: Record<string, string>;
  public readonly recoverable: boolean;
  public readonly timestamp: string;

  constructor(
    code: DevStackErrorCode,
    details: Record<string, string> = {},
    cause?: Error
  ) {
    const message = formatErrorMessage(code, details);
    super(message);

    this.name = 'DevStackError';
    if (cause) {
      Object.defineProperty(this, 'cause', {
        value: cause,
        enumerable: false,
        writable: true
      });
    }
    this.code = code;
    this.severity = ERROR_SEVERITY[code];
    this.details = details;
    this.recoverable = this.isRecoverable(code);
    this.timestamp = new Date().toISOString();

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, DevStackError.prototype);
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(code: DevStackErrorCode): boolean {
    const recoverableCodes = [
      DevStackErrorCode.DNA_NOT_FOUND,
      DevStackErrorCode.PATTERN_NOT_FOUND,
      DevStackErrorCode.CHECKPOINT_NOT_FOUND,
      DevStackErrorCode.TOOL_UNAVAILABLE,
      DevStackErrorCode.MODE_TRANSITION_FAILED,
    ];
    return recoverableCodes.includes(code);
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      details: this.details,
      recoverable: this.recoverable,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Format error message with details
 */
export function formatErrorMessage(
  code: DevStackErrorCode,
  details: Record<string, string> = {}
): string {
  let message = ERROR_MESSAGES[code];

  // Replace placeholders with details
  for (const [key, value] of Object.entries(details)) {
    message = message.replace(`{${key}}`, value);
  }

  return `[${code}] ${message}`;
}

/**
 * Create a DevStack error
 */
export function createError(
  code: DevStackErrorCode,
  details: Record<string, string> = {},
  cause?: Error
): DevStackError {
  return new DevStackError(code, details, cause);
}

/**
 * Check if error is a DevStack error
 */
export function isDevStackError(error: unknown): error is DevStackError {
  return error instanceof DevStackError;
}

/**
 * Get error recovery suggestions
 */
export function getRecoverySuggestion(code: DevStackErrorCode): string[] {
  const suggestions: Record<DevStackErrorCode, string[]> = {
    [DevStackErrorCode.PROTECTED_PATH_ACCESS]: [
      'Remove the protected path from your request',
      'Modify .dev-stack/config/scope.json to allow this path (not recommended)',
    ],
    [DevStackErrorCode.SECRET_DETECTED]: [
      'Remove the secret from the content',
      'Use environment variables instead of hardcoded secrets',
    ],
    [DevStackErrorCode.DANGEROUS_COMMAND]: [
      'Use a safer alternative command',
      'Break down the operation into smaller, safer steps',
    ],
    [DevStackErrorCode.DNA_NOT_FOUND]: [
      'Run /dev-stack:learn to scan the project',
      'Ensure you are in the correct project directory',
    ],
    [DevStackErrorCode.CONTEXT_OVERFLOW]: [
      'Use --quick mode to skip THINK phase',
      'Break down the task into smaller subtasks',
    ],
    [DevStackErrorCode.TOKEN_BUDGET_EXCEEDED]: [
      'Summarize older context',
      'Use progressive context loading',
    ],
    [DevStackErrorCode.PATTERN_NOT_FOUND]: [
      'Verify the pattern ID is correct',
      'Run /dev-stack:learn to discover new patterns',
    ],
    [DevStackErrorCode.PATTERN_ADAPTATION_FAILED]: [
      'Manually review and adapt the pattern',
      'Add custom tech mapping in configuration',
    ],
    [DevStackErrorCode.PATTERN_DATABASE_ERROR]: [
      'Run /dev-stack:learn to rebuild the database',
      'Check .dev-stack/memory/patterns.db for corruption',
    ],
    [DevStackErrorCode.CHECKPOINT_CORRUPTED]: [
      'Start a fresh session',
      'Use git to recover previous work',
    ],
    [DevStackErrorCode.CHECKPOINT_NOT_FOUND]: [
      'Continue with current session - checkpoint will be created automatically',
    ],
    [DevStackErrorCode.ROLLBACK_FAILED]: [
      'Try a different rollback level',
      'Use git reset --hard to recover',
    ],
    [DevStackErrorCode.TOOL_UNAVAILABLE]: [
      'Install the required MCP server',
      'Use the fallback tool if available',
    ],
    [DevStackErrorCode.TOOL_TIMEOUT]: [
      'Increase timeout in configuration',
      'Simplify the task',
    ],
    [DevStackErrorCode.TOOL_SELECTION_FAILED]: [
      'Install required MCP servers',
      'Manually specify the tool to use',
    ],
    [DevStackErrorCode.EXECUTION_FAILED]: [
      'Check .dev-stack/logs/ for detailed error logs',
      'Try running in INTERACTIVE mode for more guidance',
    ],
    [DevStackErrorCode.MODE_TRANSITION_FAILED]: [
      'Continue in current mode',
      'Manually switch modes if needed',
    ],
    [DevStackErrorCode.RECOVERY_FAILED]: [
      'Review the error and take manual action',
      'Check git status for current state',
    ],
    [DevStackErrorCode.INVALID_CONFIGURATION]: [
      'Fix the configuration file',
      'Delete the file to use defaults',
    ],
    [DevStackErrorCode.CAPABILITY_REGISTRY_ERROR]: [
      'Check config/capabilities.yaml for syntax errors',
      'Verify MCP servers are running',
    ],
  };

  return suggestions[code] || ['No recovery suggestions available'];
}

// Default export
export default {
  DevStackErrorCode,
  ERROR_MESSAGES,
  ERROR_SEVERITY,
  DevStackError,
  formatErrorMessage,
  createError,
  isDevStackError,
  getRecoverySuggestion,
};
