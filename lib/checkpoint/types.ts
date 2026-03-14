/**
 * Checkpoint Types - Dev-Stack v6
 * Session state snapshots for continuity and rollback
 */

/**
 * Execution mode
 */
export type ExecutionMode = 'AUTO' | 'PLAN_FIRST' | 'CONFIRM' | 'INTERACTIVE';

/**
 * Workflow phase
 */
export type WorkflowPhase = 'THINK' | 'RESEARCH' | 'BUILD' | 'TEST' | 'LEARN' | 'VERIFY';

/**
 * Step status
 */
export type StepStatus = 'pending' | 'in_progress' | 'success' | 'partial' | 'failed' | 'skipped';

/**
 * Priority level
 */
export type Priority = 'high' | 'medium' | 'low';

/**
 * Individual step in workflow
 */
export interface WorkflowStep {
  step: string;
  phase: WorkflowPhase;
  status: StepStatus;
  started_at?: string;
  completed_at?: string;
  tokens_used?: number;
  error?: string;
}

/**
 * File change record
 */
export interface FileChange {
  path: string;
  original_sha?: string; // Git SHA before change
  action: 'created' | 'modified' | 'deleted';
  lines_added?: number;
  lines_removed?: number;
  diff_preview?: string;
}

/**
 * Decision record
 */
export interface DecisionRecord {
  decision: string;
  reasoning: string;
  alternatives_considered?: string[];
  user_approved: boolean;
  approved_at?: string;
  impact?: string;
}

/**
 * Next action item
 */
export interface NextAction {
  action: string;
  priority: Priority;
  estimated_tokens?: number;
  dependencies?: string[];
  phase: WorkflowPhase;
}

/**
 * Phase progress
 */
export interface PhaseProgress {
  phase: WorkflowPhase;
  status: StepStatus;
  progress: string; // e.g., "3/6"
  steps_completed: number;
  steps_total: number;
  started_at?: string;
  completed_at?: string;
}

/**
 * Checkpoint - Main interface
 * Session state snapshot
 */
export interface Checkpoint {
  // Identity
  session_id: string; // UUID
  created_at: string; // ISO datetime
  checkpoint_id: string; // UUID

  // Git reference
  base_sha: string; // Git commit SHA at checkpoint creation
  current_sha?: string; // Current HEAD SHA

  // Task identification
  task_hash: string; // Hash of user request for identification
  checkpoint_number: number; // Sequential checkpoint number in session

  // Session state
  started_at: string;
  turns: number;
  tokens_used: number;

  // Current task
  user_request: string; // Original user request in natural language
  derived_intent: string; // System-derived intent
  complexity_score: number; // 0.0-1.0
  execution_mode: ExecutionMode;

  // Phase progress
  current_phase: WorkflowPhase;
  phase_progress: PhaseProgress[];
  all_phases: WorkflowPhase[];

  // Progress tracking
  completed_steps: WorkflowStep[];
  pending_steps: WorkflowStep[];

  // File tracking
  files_created: string[];
  files_modified: FileChange[];
  files_deleted: string[];

  // Decisions
  decisions: DecisionRecord[];

  // Next steps
  next_actions: NextAction[];

  // Metadata
  compression_count?: number; // Times context has been compressed
  rollback_available: boolean;
  parent_checkpoint_id?: string; // For checkpoint chain
}

/**
 * Session state (full session, not just checkpoint)
 */
export interface SessionState {
  session_id: string;
  started_at: string;
  last_activity: string;

  // Project context
  project_root: string;
  dna_loaded: boolean;
  dna_path?: string;

  // Task context
  current_task?: Checkpoint;
  task_history: Checkpoint[];

  // Audit
  action_count: number;
  blocked_count: number;

  // Patterns
  patterns_used: string[];
  patterns_learned: string[];

  // Memory
  checkpoints: Checkpoint[];
  current_checkpoint_id?: string;
}

/**
 * Rollback level
 */
export type RollbackLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Rollback level definitions
 */
export const ROLLBACK_LEVELS: Record<RollbackLevel, {
  name: string;
  scope: string;
  description: string;
}> = {
  1: {
    name: 'Last Action',
    scope: 'single_file',
    description: 'Undo single file change'
  },
  2: {
    name: 'Last Phase',
    scope: 'phase',
    description: 'Undo entire current phase'
  },
  3: {
    name: 'Last Task',
    scope: 'task',
    description: 'Undo entire task'
  },
  4: {
    name: 'To Checkpoint',
    scope: 'checkpoint',
    description: 'Return to saved state'
  },
  5: {
    name: 'To Base SHA',
    scope: 'commit',
    description: 'Full reset to original commit'
  }
};

/**
 * Rollback preview
 */
export interface RollbackPreview {
  level: RollbackLevel;
  checkpoint: Checkpoint;
  files_to_revert: FileChange[];
  files_to_delete: string[];
  diff_preview: string;
  warnings: string[];
  can_proceed: boolean;
}

/**
 * Rollback result
 */
export interface RollbackResult {
  success: boolean;
  level: RollbackLevel;
  files_reverted: string[];
  files_deleted: string[];
  new_sha?: string;
  error?: string;
}

/**
 * Checkpoint storage format (YAML frontmatter + Markdown body)
 */
export interface CheckpointStorage {
  frontmatter: {
    session_id: string;
    created_at: string;
    base_sha: string;
    task_hash: string;
  };
  body: {
    session_state: string; // Markdown
    current_task: string; // Markdown
    progress: string; // Markdown
    files: string; // Markdown
    decisions: string; // Markdown
    next_steps: string; // Markdown
  };
}

/**
 * Checkpoint conflict (multi-session scenario)
 */
export interface CheckpointConflict {
  local_checkpoint: Checkpoint;
  remote_checkpoint: Checkpoint;
  conflict_type: 'concurrent_edit' | 'divergent_state' | 'stale';
  resolution_options: ('keep_local' | 'keep_remote' | 'merge' | 'ask_user')[];
}

/**
 * Resume info (displayed on session start)
 */
export interface ResumeInfo {
  has_checkpoint: boolean;
  checkpoint_age_ms: number;
  phase: WorkflowPhase;
  phase_progress: string;
  task: string;
  can_resume: boolean;
}
