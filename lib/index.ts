/**
 * Dev-Stack v6 - Main Entry Point
 * Meta-Orchestrator plugin for Claude Code
 */

// Guards
export { BashGuard, bashGuard } from './guards/bash-guard.js';
export { ScopeGuard, scopeGuard } from './guards/scope-guard.js';
export { SecretScanner, secretScanner } from './guards/secret-scanner.js';
export { RiskAssessor, riskAssessor } from './guards/risk-assessor.js';
export type {
  GuardType,
  GuardAction,
  GuardResult,
  RiskLevel,
  BashGuardConfig,
  DangerousCommand,
  BashCheckInput,
  BashCheckResult,
  ScopeGuardConfig,
  ProtectedPathPattern,
  ScopeCheckInput,
  SecretScannerConfig,
  SecretPattern,
  SecretScanResult,
  DetectedSecret,
  RiskAssessorConfig,
  RiskFactor,
  RiskThresholds,
  RiskAssessmentInput,
  RiskAssessmentResult,
  CompositeGuardResult,
  GuardStatistics,
  GuardAuditEntry,
  AllGuardsConfig
} from './guards/types.js';

// Patterns
export { PatternStore } from './patterns/store.js';
export { PatternAdapter } from './patterns/adapter.js';
export { PatternLearner } from './patterns/learner.js';
export { HNSWIndex } from './patterns/search.js';
export type {
  PatternType,
  PatternStatus,
  ConfidenceLevel,
  VectorEmbedding,
  Pattern,
  PatternSearchResult,
  HNSWSearchOptions,
  PatternFilters,
  CreatePatternInput,
  UpdatePatternInput,
  PatternUsage,
  PatternTransferResult,
  AdaptationContext,
  PatternDatabaseSchema,
  SimilarityMetric
} from './patterns/types.js';

// Checkpoint
export { CheckpointManager, checkpointManager } from './checkpoint/manager.js';
export type {
  ExecutionMode,
  WorkflowPhase,
  StepStatus,
  Priority,
  WorkflowStep,
  FileChange,
  DecisionRecord,
  NextAction,
  PhaseProgress,
  Checkpoint,
  SessionState,
  RollbackLevel,
  RollbackPreview,
  RollbackResult,
  CheckpointStorage,
  CheckpointConflict,
  ResumeInfo
} from './checkpoint/types.js';

// DNA Scanner
export { DNAScanner, createDNAScanner, DEFAULT_SCAN_OPTIONS } from './dna/scanner.js';
export type {
  ProjectType,
  NamingConvention,
  FormatterType,
  ComponentPattern,
  ApiPattern,
  TechStack,
  EntryPoint,
  KeyDirectory,
  CodingStyle,
  ProtectedPath,
  HighCouplingArea,
  WhatWorks,
  WhatNotToDo,
  UserPreference,
  RiskArea,
  ProjectDNA,
  ScanOptions,
  DNADiff,
  DNAStorage
} from './dna/types.js';

// Orchestration - Task Tracker
export { TaskTracker, createTaskTracker } from './orchestration/task-tracker.js';
export type {
  TaskStatus,
  TaskPriority,
  TrackedTask,
  PhaseInfo,
  ProgressReport
} from './orchestration/task-tracker.js';

// Orchestration - Recovery
export {
  FailureRecoveryManager,
  createFailureRecoveryManager,
  DEFAULT_RETRY_CONFIG
} from './orchestration/recovery.js';
export type {
  RecoveryStrategy,
  FailureType,
  FailureRecord,
  RetryConfig,
  RollbackTarget,
  RecoveryResult
} from './orchestration/recovery.js';

// Orchestration - Mode Transitions
export { ModeTransitionManager, createModeTransitionManager } from './orchestration/mode-transitions.js';
export type {
  TransitionTrigger,
  TransitionRule,
  TransitionContext,
  TransitionResult
} from './orchestration/mode-transitions.js';

// Context - JIT Loader
export { JITLoader, createJITLoader } from './context/jit-loader.js';
export type {
  LoadingStrategy,
  ContextSource,
  LoadedContext,
  LoadingResult
} from './context/jit-loader.js';

// Context - Token Budget
export { TokenBudgetManager, createTokenBudgetManager, DEFAULT_ALLOCATION } from './context/token-budget.js';
export type {
  BudgetCategory,
  BudgetAllocation,
  ContextItem,
  BudgetStatus,
  BudgetReport
} from './context/token-budget.js';

// Intent - Complexity Scorer
export { ComplexityScorer, complexityScorer } from './intent/complexity-scorer.js';
export type {
  ComplexityFactors,
  DependencyLevel,
  CrossCuttingScope,
  ClarityLevel,
  ReversibilityLevel
} from './intent/complexity-scorer.js';

// Intent - Language Detector
export {
  languageDetector,
  detectLanguage,
  containsThai,
  containsEnglish,
  getLanguageName,
  getLanguageEmoji
} from './intent/language-detector.js';
export type {
  LanguageType,
  LanguageDetectionResult,
  LanguageSegment
} from './intent/language-detector.js';

// Intent - Mode Selector
export { ModeSelector, modeSelector, MODE_THRESHOLDS } from './intent/mode-selector.js';
export type {
  ExecutionMode as ExecutionModeType,
  ModeConfig,
  ModeSelectionResult
} from './intent/mode-selector.js';

// Selector - Capability Loader
export { CapabilityLoader, capabilityLoader } from './selector/capability-loader.js';
export type {
  Capability,
  CapabilityRegistry,
  LoadedCapability
} from './selector/capability-loader.js';

// Selector - Tool Checker
export { ToolAvailabilityChecker, toolChecker } from './selector/tool-checker.js';
export type {
  ToolSource,
  ToolInfo,
  MCPServerInfo
} from './selector/tool-checker.js';

// Audit
export { AuditLogger, auditLogger } from './audit/logger.js';
export type {
  AuditResult,
  GuardType as AuditGuardType,
  AuditEntry,
  AuditSessionSummary,
  AuditFilter,
  GuardAuditInfo,
  AuditStatistics,
  AuditLogLine,
  AuditQueryResult,
  ComplianceReport,
  AuditExportFormat,
  AuditExportOptions
} from './audit/types.js';

// Errors
export {
  DevStackError,
  formatErrorMessage,
  createError,
  isDevStackError,
  getRecoverySuggestion,
  DevStackErrorCode,
  ERROR_MESSAGES,
  ErrorSeverity,
  ERROR_SEVERITY
} from './errors/messages.js';

// Recovery
export { RollbackManager } from './recovery/rollback.js';
