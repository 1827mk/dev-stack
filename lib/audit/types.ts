/**
 * Audit Types - Dev-Stack v6
 * Types for audit logging and traceability
 */

/**
 * Audit result type
 */
export type AuditResult = 'success' | 'blocked' | 'error' | 'skipped';

/**
 * Guard type that may block operation
 */
export type GuardType = 'scope' | 'secret' | 'bash' | 'risk' | 'token';

/**
 * Audit entry - Main interface
 * Record of every action for traceability
 */
export interface AuditEntry {
  // Identity
  id: string; // UUID
  timestamp: string; // ISO 8601 datetime
  sequence_number: number; // Sequential within session

  // Session context
  session_id: string;

  // Tool info
  tool: string; // Tool name (e.g., 'Write', 'serena:find_symbol')
  action: string; // Action type (e.g., 'write_file', 'find_symbol')
  capability?: string; // Mapped capability (e.g., 'code.edit')

  // Target
  target: string; // Target path or identifier
  target_type?: 'file' | 'symbol' | 'command' | 'query' | 'other';

  // Result
  result: AuditResult;
  reason?: string; // If blocked: reason for block
  guard?: GuardType; // If blocked: which guard blocked it
  error_message?: string; // If error: error details

  // User interaction
  user_approved?: boolean; // If confirmation was required
  approval_method?: 'explicit' | 'implicit' | 'timeout';

  // Rollback
  rollback_available: boolean;
  rollback_sha?: string; // SHA before change

  // Performance
  duration_ms?: number;
  tokens_used?: number;

  // Additional context
  metadata?: Record<string, unknown>;
}

/**
 * Audit session summary
 */
export interface AuditSessionSummary {
  session_id: string;
  started_at: string;
  ended_at?: string;

  // Counts
  total_actions: number;
  successful_actions: number;
  blocked_actions: number;
  error_actions: number;

  // Guards
  scope_blocks: number;
  secret_blocks: number;
  bash_blocks: number;

  // Files
  files_created: number;
  files_modified: number;
  files_deleted: number;

  // Performance
  total_duration_ms: number;
  total_tokens_used: number;

  // Patterns
  patterns_used: number;
  patterns_learned: number;

  // Success rate
  success_rate: number; // 0.0-1.0
}

/**
 * Audit filter options
 */
export interface AuditFilter {
  session_id?: string;
  start_time?: string;
  end_time?: string;
  tool?: string;
  action?: string;
  result?: AuditResult;
  guard?: GuardType;
  target_pattern?: string;
  limit?: number;
  offset?: number;
}

/**
 * Guard info for audit display
 */
export interface GuardAuditInfo {
  guard_type: GuardType;
  total_checks: number;
  blocks: number;
  block_rate: number; // 0.0-1.0
  last_block?: AuditEntry;
  common_reasons: { reason: string; count: number }[];
}

/**
 * Audit statistics
 */
export interface AuditStatistics {
  period_start: string;
  period_end: string;

  // Action counts
  total_actions: number;
  by_result: Record<AuditResult, number>;
  by_tool: Record<string, number>;
  by_action: Record<string, number>;

  // Guard statistics
  guard_stats: GuardAuditInfo[];

  // Performance
  avg_duration_ms: number;
  max_duration_ms: number;
  total_tokens: number;

  // Rollback statistics
  rollback_available_count: number;
  rollback_executed_count: number;
}

/**
 * Audit log format (JSONL)
 */
export interface AuditLogLine extends AuditEntry {
  _version: string; // Schema version
}

/**
 * Audit query result
 */
export interface AuditQueryResult {
  entries: AuditEntry[];
  total_count: number;
  has_more: boolean;
  statistics?: AuditStatistics;
}

/**
 * Compliance report
 */
export interface ComplianceReport {
  report_id: string;
  generated_at: string;
  period: {
    start: string;
    end: string;
  };

  // Summary
  total_operations: number;
  blocked_operations: number;
  approved_operations: number;

  // Guard effectiveness
  scope_guard: {
    protected_paths_count: number;
    violations_prevented: number;
    violations_attempted: number;
  };
  secret_guard: {
    secrets_detected: number;
    leaks_prevented: number;
  };
  bash_guard: {
    dangerous_commands_blocked: number;
    commands_audited: number;
  };

  // Audit trail completeness
  audit_completeness: number; // 0.0-1.0
  missing_entries: number;

  // Recommendations
  recommendations: string[];
}

/**
 * Audit export format
 */
export type AuditExportFormat = 'jsonl' | 'json' | 'csv' | 'markdown';

/**
 * Audit export options
 */
export interface AuditExportOptions {
  format: AuditExportFormat;
  filters?: AuditFilter;
  include_metadata?: boolean;
  include_statistics?: boolean;
  pretty_print?: boolean;
}
