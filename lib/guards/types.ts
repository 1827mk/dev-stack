/**
 * Guard Types - Dev-Stack v6
 * Security guards for protecting sensitive operations
 */

/**
 * Guard type enumeration
 */
export type GuardType = 'scope' | 'secret' | 'bash' | 'risk' | 'token';

/**
 * Risk level
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Guard action
 */
export type GuardAction = 'allow' | 'block' | 'confirm' | 'warn';

/**
 * Guard result - Main interface
 */
export interface GuardResult {
  guard_type: GuardType;
  action: GuardAction;
  allowed: boolean;
  reason?: string;
  suggestion?: string;
  risk_score?: number; // 0.0-1.0
  risk_level?: RiskLevel;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Scope guard configuration
 */
export interface ScopeGuardConfig {
  enabled: boolean;
  protected_paths: ProtectedPathPattern[];
  allow_user_override: boolean;
  log_violations: boolean;
}

/**
 * Protected path pattern
 */
export interface ProtectedPathPattern {
  pattern: string; // Glob pattern
  reason: string;
  block_operations: ('write' | 'edit' | 'bash' | 'delete' | 'read')[];
  suggestion?: string;
  severity: RiskLevel;
}

/**
 * Scope guard check input
 */
export interface ScopeCheckInput {
  path: string;
  operation: 'read' | 'write' | 'edit' | 'delete' | 'bash';
  content?: string;
}

/**
 * Secret scanner configuration
 */
export interface SecretScannerConfig {
  enabled: boolean;
  patterns: SecretPattern[];
  scan_content: boolean;
  scan_filenames: boolean;
  allowed_in_tests: boolean;
}

/**
 * Secret pattern definition
 */
export interface SecretPattern {
  name: string;
  pattern: string; // Regex pattern
  description: string;
  severity: RiskLevel;
  false_positive_rate?: number;
}

/**
 * Secret scanner result
 */
export interface SecretScanResult {
  found: boolean;
  secrets: DetectedSecret[];
  content_safe: boolean;
}

/**
 * Detected secret
 */
export interface DetectedSecret {
  pattern_name: string;
  match: string; // Partially masked
  line_number?: number;
  column_number?: number;
  severity: RiskLevel;
  context?: string; // Surrounding text (masked)
}

/**
 * Bash guard configuration
 */
export interface BashGuardConfig {
  enabled: boolean;
  blocked_commands: DangerousCommand[];
  require_confirmation_patterns: string[];
  timeout_seconds: number;
}

/**
 * Dangerous command definition
 */
export interface DangerousCommand {
  pattern: string; // Regex pattern
  reason: string;
  severity: RiskLevel;
  block: boolean; // true = block, false = require confirmation
  alternatives?: string[];
}

/**
 * Bash guard check input
 */
export interface BashCheckInput {
  command: string;
  cwd?: string;
  has_root?: boolean;
}

/**
 * Bash guard check result
 */
export interface BashCheckResult extends GuardResult {
  matched_pattern?: string;
  command_parts?: string[];
  safe_alternative?: string;
}

/**
 * Risk assessor configuration
 */
export interface RiskAssessorConfig {
  enabled: boolean;
  factors: RiskFactor[];
  thresholds: RiskThresholds;
}

/**
 * Risk factor definition
 */
export interface RiskFactor {
  name: string;
  weight: number; // 0.0-1.0
  description: string;
}

/**
 * Risk thresholds
 */
export interface RiskThresholds {
  low: number; // < this value = low risk
  medium: number; // < this value = medium risk
  high: number; // < this value = high risk
  // >= high value = critical risk
}

/**
 * Risk assessment input
 */
export interface RiskAssessmentInput {
  operation: string;
  target_files: string[];
  complexity_score?: number;
  affects_protected_paths: boolean;
  involves_secrets: boolean;
  is_destructive: boolean;
  cross_cutting: boolean;
  dependency_changes: boolean;
}

/**
 * Risk assessment result
 */
export interface RiskAssessmentResult {
  risk_score: number; // 0.0-1.0
  risk_level: RiskLevel;
  action: GuardAction;
  factors: {
    factor: string;
    contribution: number;
    weight: number;
  }[];
  recommendations: string[];
  requires_confirmation: boolean;
  confirmation_message?: string;
}

/**
 * Composite guard result
 * Result from all guards combined
 */
export interface CompositeGuardResult {
  allowed: boolean;
  results: GuardResult[];
  blocking_guard?: GuardType;
  overall_risk_level: RiskLevel;
  overall_risk_score: number;
  combined_action: GuardAction;
  warnings: string[];
  suggestions: string[];
}

/**
 * Guard statistics
 */
export interface GuardStatistics {
  guard_type: GuardType;
  total_checks: number;
  allowed: number;
  blocked: number;
  confirmed: number;
  warned: number;
  block_rate: number; // 0.0-1.0
  avg_risk_score: number;
  last_check?: string;
}

/**
 * Guard audit entry
 */
export interface GuardAuditEntry {
  timestamp: string;
  guard_type: GuardType;
  input: ScopeCheckInput | BashCheckInput | RiskAssessmentInput;
  result: GuardResult;
  user_response?: 'approved' | 'rejected' | 'modified';
  response_time_ms?: number;
}

/**
 * Guard configuration (all guards)
 */
export interface AllGuardsConfig {
  scope: ScopeGuardConfig;
  secret: SecretScannerConfig;
  bash: BashGuardConfig;
  risk: RiskAssessorConfig;
  enabled: boolean;
  fail_closed: boolean; // If guard fails, block operation
}
