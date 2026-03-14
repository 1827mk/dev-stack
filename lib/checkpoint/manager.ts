/**
 * Checkpoint Manager - Dev-Stack v6
 * Save/load operations for session continuity and rollback
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { execFileSync } from 'child_process';
import {
  Checkpoint,
  RollbackLevel,
  RollbackPreview,
  RollbackResult,
  ResumeInfo,
  CheckpointConflict,
  WorkflowPhase,
  FileChange,
  WorkflowStep,
  DecisionRecord,
  NextAction,
  ExecutionMode,
} from './types';

/**
 * Default checkpoint directory
 */
const DEFAULT_CHECKPOINT_DIR = '.dev-stack/memory';
const CHECKPOINT_FILE = 'checkpoint.md';
const SESSION_SENTINEL_DIR = 'sentinels';

/**
 * Safely execute git command using execFileSync
 */
function safeGitCommand(args: string[], cwd: string): string {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
  } catch {
    return '';
  }
}

/**
 * Checkpoint Manager
 * Handles save/load operations for session continuity
 */
export class CheckpointManager {
  private projectRoot: string;
  private checkpointDir: string;
  private checkpointPath: string;
  private sentinelDir: string;
  private currentSessionId: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.checkpointDir = path.join(projectRoot, DEFAULT_CHECKPOINT_DIR);
    this.checkpointPath = path.join(this.checkpointDir, CHECKPOINT_FILE);
    this.sentinelDir = path.join(this.checkpointDir, SESSION_SENTINEL_DIR);
    this.currentSessionId = this.generateSessionId();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${uuidv4().replace(/-/g, '').substring(0, 12)}`;
  }

  /**
   * Generate task hash for identification
   */
  generateTaskHash(userRequest: string): string {
    return crypto.createHash('sha256').update(userRequest).digest('hex').substring(0, 16);
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.currentSessionId;
  }

  /**
   * Ensure checkpoint directory exists
   */
  private ensureDirectory(): void {
    if (!fs.existsSync(this.checkpointDir)) {
      fs.mkdirSync(this.checkpointDir, { recursive: true });
    }
    if (!fs.existsSync(this.sentinelDir)) {
      fs.mkdirSync(this.sentinelDir, { recursive: true });
    }
  }

  /**
   * Get current git SHA
   */
  private getCurrentSha(): string {
    const result = safeGitCommand(['rev-parse', 'HEAD'], this.projectRoot);
    return result || 'unknown';
  }

  /**
   * Get base SHA from git
   */
  private getBaseSha(): string {
    // Try to get the current branch name
    const branch = safeGitCommand(['rev-parse', '--abbrev-ref', 'HEAD'], this.projectRoot);
    if (!branch) {
      return this.getCurrentSha();
    }

    // Try to get merge base with origin
    const mergeBase = safeGitCommand(['merge-base', 'HEAD', `origin/${branch}`], this.projectRoot);
    if (mergeBase) {
      return mergeBase;
    }

    // Fallback to HEAD
    return this.getCurrentSha();
  }

  /**
   * Create new checkpoint
   */
  async createCheckpoint(data: {
    userRequest: string;
    derivedIntent: string;
    complexityScore: number;
    executionMode: string;
    currentPhase: WorkflowPhase;
    completedSteps: WorkflowStep[];
    pendingSteps: WorkflowStep[];
    filesCreated: string[];
    filesModified: FileChange[];
    filesDeleted: string[];
    decisions: DecisionRecord[];
    nextActions: NextAction[];
    turns?: number;
    tokensUsed?: number;
  }): Promise<Checkpoint> {
    this.ensureDirectory();

    const baseSha = this.getBaseSha();
    const currentSha = this.getCurrentSha();

    // Load existing checkpoint to get checkpoint number
    let checkpointNumber = 1;
    const existing = await this.loadCheckpoint();
    if (existing) {
      checkpointNumber = existing.checkpoint_number + 1;
    }

    const checkpoint: Checkpoint = {
      session_id: this.currentSessionId,
      created_at: new Date().toISOString(),
      checkpoint_id: uuidv4(),
      base_sha: baseSha,
      current_sha: currentSha,
      task_hash: this.generateTaskHash(data.userRequest),
      checkpoint_number: checkpointNumber,
      started_at: existing?.started_at || new Date().toISOString(),
      turns: data.turns || existing?.turns || 0,
      tokens_used: data.tokensUsed || existing?.tokens_used || 0,
      user_request: data.userRequest,
      derived_intent: data.derivedIntent,
      complexity_score: data.complexityScore,
      execution_mode: data.executionMode as ExecutionMode,
      current_phase: data.currentPhase,
      phase_progress: existing?.phase_progress || [],
      all_phases: ['THINK', 'RESEARCH', 'BUILD', 'TEST', 'LEARN', 'VERIFY'],
      completed_steps: data.completedSteps,
      pending_steps: data.pendingSteps,
      files_created: data.filesCreated,
      files_modified: data.filesModified,
      files_deleted: data.filesDeleted,
      decisions: data.decisions,
      next_actions: data.nextActions,
      compression_count: existing?.compression_count || 0,
      rollback_available: true,
      parent_checkpoint_id: existing?.checkpoint_id,
    };

    await this.saveCheckpoint(checkpoint);
    return checkpoint;
  }

  /**
   * Save checkpoint to file (YAML frontmatter + Markdown body)
   */
  private async saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
    this.ensureDirectory();

    const content = this.formatCheckpointAsMarkdown(checkpoint);
    fs.writeFileSync(this.checkpointPath, content, 'utf-8');

    // Also create sentinel file for session tracking
    const sentinelPath = path.join(this.sentinelDir, `${this.currentSessionId}.sentinel`);
    fs.writeFileSync(sentinelPath, JSON.stringify({
      session_id: this.currentSessionId,
      last_checkpoint: checkpoint.checkpoint_id,
      updated_at: checkpoint.created_at,
    }, null, 2), 'utf-8');
  }

  /**
   * Format checkpoint as Markdown with YAML frontmatter (compact format)
   */
  private formatCheckpointAsMarkdown(checkpoint: Checkpoint): string {
    const frontmatter = `---
session_id: ${checkpoint.session_id}
created_at: ${checkpoint.created_at}
checkpoint_id: ${checkpoint.checkpoint_id}
base_sha: ${checkpoint.base_sha}
current_sha: ${checkpoint.current_sha || 'unknown'}
task_hash: ${checkpoint.task_hash}
checkpoint_number: ${checkpoint.checkpoint_number}
---`;

    // Compact format - ~50% less tokens than verbose format
    const body = `
# Checkpoint #${checkpoint.checkpoint_number}
${checkpoint.current_phase} | ${checkpoint.execution_mode} | complexity: ${checkpoint.complexity_score.toFixed(2)}

## Task
> ${checkpoint.user_request}
Intent: \`${checkpoint.derived_intent}\`

## State
- Phase: ${checkpoint.current_phase} (${checkpoint.all_phases.indexOf(checkpoint.current_phase) + 1}/${checkpoint.all_phases.length})
- Turns: ${checkpoint.turns} | Tokens: ${checkpoint.tokens_used.toLocaleString()}

## Files
${checkpoint.files_created.length > 0 ? `+ ${checkpoint.files_created.join(', ')}` : ''}${checkpoint.files_modified.length > 0 ? `\n~ ${checkpoint.files_modified.map(f => f.path).join(', ')}` : ''}${checkpoint.files_deleted.length > 0 ? `\n- ${checkpoint.files_deleted.join(', ')}` : ''}${checkpoint.files_created.length === 0 && checkpoint.files_modified.length === 0 && checkpoint.files_deleted.length === 0 ? '_None_' : ''}

## Next
${checkpoint.next_actions.length > 0 ? checkpoint.next_actions.slice(0, 3).map(a => `- [${a.priority}] ${a.action}`).join('\n') : '_None_'}
`;
    return frontmatter + body;
  }

  /**
   * Load checkpoint from file
   */
  async loadCheckpoint(): Promise<Checkpoint | null> {
    if (!fs.existsSync(this.checkpointPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(this.checkpointPath, 'utf-8');
      return this.parseCheckpointFromMarkdown(content);
    } catch (error) {
      console.error('Failed to load checkpoint:', error);
      return null;
    }
  }

  /**
   * Parse checkpoint from Markdown with YAML frontmatter
   */
  private parseCheckpointFromMarkdown(content: string): Checkpoint | null {
    try {
      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        return null;
      }

      const frontmatter = frontmatterMatch[1];
      const body = content.substring(frontmatterMatch[0].length);

      // Parse frontmatter
      const frontmatterLines = frontmatter.split('\n');
      const frontmatterData: Record<string, string> = {};

      for (const line of frontmatterLines) {
        const [key, ...valueParts] = line.split(': ');
        if (key && valueParts.length > 0) {
          frontmatterData[key.trim()] = valueParts.join(': ').trim();
        }
      }

      // Parse body sections
      const sessionState = this.parseSection(body, 'Session State');
      const currentTask = this.parseSection(body, 'Current Task');
      const progress = this.parseSection(body, 'Progress');
      const files = this.parseSection(body, 'Files Touched');
      const decisions = this.parseSection(body, 'Key Decisions');
      const nextSteps = this.parseSection(body, 'Next Actions');

      // Extract values from sections
      const startedMatch = sessionState.match(/\*\*Started\*\*: (.+)/);
      const turnsMatch = sessionState.match(/\*\*Turns\*\*: (\d+)/);
      const tokensMatch = sessionState.match(/\*\*Tokens Used\*\*: ([\d,]+)/);

      const requestMatch = currentTask.match(/\*\*Request\*\*: (.+)/);
      const intentMatch = currentTask.match(/\*\*Derived Intent\*\*: (.+)/);
      const complexityMatch = currentTask.match(/\*\*Complexity\*\*: ([\d.]+)/);
      const modeMatch = currentTask.match(/\*\*Mode\*\*: (\w+)/);
      const phaseMatch = currentTask.match(/\*\*Phase\*\*: (\w+)/);

      // Parse completed/pending steps
      const completedSteps = this.parseSteps(progress, 'Completed Steps');
      const pendingSteps = this.parseSteps(progress, 'Pending Steps');

      // Parse files
      const filesCreated = this.parseListItems(files, 'Created');
      const filesModifiedPaths = this.parseListItems(files, 'Modified');
      const filesDeleted = this.parseListItems(files, 'Deleted');

      // Parse decisions
      const decisionItems = this.parseDecisions(decisions);

      // Parse next actions
      const nextActions = this.parseNextActions(nextSteps);

      return {
        session_id: frontmatterData.session_id || this.currentSessionId,
        created_at: frontmatterData.created_at || new Date().toISOString(),
        checkpoint_id: frontmatterData.checkpoint_id || uuidv4(),
        base_sha: frontmatterData.base_sha || 'unknown',
        current_sha: frontmatterData.current_sha,
        task_hash: frontmatterData.task_hash || '',
        checkpoint_number: parseInt(frontmatterData.checkpoint_number || '1', 10),
        started_at: startedMatch?.[1] || new Date().toISOString(),
        turns: parseInt(turnsMatch?.[1] || '0', 10),
        tokens_used: parseInt(tokensMatch?.[1]?.replace(/,/g, '') || '0', 10),
        user_request: requestMatch?.[1] || '',
        derived_intent: intentMatch?.[1] || '',
        complexity_score: parseFloat(complexityMatch?.[1] || '0.5'),
        execution_mode: (modeMatch?.[1] || 'AUTO') as ExecutionMode,
        current_phase: (phaseMatch?.[1] || 'THINK') as WorkflowPhase,
        phase_progress: [],
        all_phases: ['THINK', 'RESEARCH', 'BUILD', 'TEST', 'LEARN', 'VERIFY'],
        completed_steps: completedSteps,
        pending_steps: pendingSteps,
        files_created: filesCreated,
        files_modified: filesModifiedPaths.map(p => ({ path: p, action: 'modified' as const })),
        files_deleted: filesDeleted,
        decisions: decisionItems,
        next_actions: nextActions,
        rollback_available: true,
      };
    } catch (error) {
      console.error('Failed to parse checkpoint:', error);
      return null;
    }
  }

  /**
   * Parse a section from markdown body
   */
  private parseSection(body: string, sectionName: string): string {
    const regex = new RegExp(`## ${sectionName}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    const match = body.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Parse step items from section
   */
  private parseSteps(section: string, subsection: string): WorkflowStep[] {
    const regex = new RegExp(`### ${subsection}\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`, 'i');
    const match = section.match(regex);
    if (!match) return [];

    const lines = match[1].trim().split('\n');
    return lines
      .filter(line => line.startsWith('-'))
      .map(line => {
        const stepMatch = line.match(/- \[([ x])\] (.+) \((\w+)\)/) ||
                          line.match(/- \[([ x])\] (.+)/);
        if (stepMatch) {
          return {
            step: stepMatch[2],
            status: stepMatch[3] || (stepMatch[1] === 'x' ? 'success' : 'pending'),
            phase: 'BUILD' as WorkflowPhase,
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  /**
   * Parse list items from section
   */
  private parseListItems(section: string, subsection: string): string[] {
    const regex = new RegExp(`### ${subsection}\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`, 'i');
    const match = section.match(regex);
    if (!match) return [];

    const lines = match[1].trim().split('\n');
    return lines
      .filter(line => line.startsWith('- ') && !line.includes('_None'))
      .map(line => line.substring(2).trim());
  }

  /**
   * Parse decisions from section
   */
  private parseDecisions(section: string): DecisionRecord[] {
    const lines = section.trim().split('\n');
    return lines
      .filter(line => line.startsWith('- **'))
      .map(line => {
        const match = line.match(/- \*\*(.+?)\*\*: (.+?)(?: \(approved\))?$/);
        if (match) {
          return {
            decision: match[1],
            reasoning: match[2],
            user_approved: line.includes('(approved)'),
          };
        }
        return null;
      })
      .filter(Boolean)
  }

  /**
   * Parse next actions from section
   */
  private parseNextActions(section: string): NextAction[] {
    const lines = section.trim().split('\n');
    const results: NextAction[] = [];

    for (const line of lines) {
      if (line.startsWith('- [ ]')) {
        const match = line.match(/- \[(\w+)\] (.+)/);
        if (match) {
          results.push({
            priority: match[1].toLowerCase() as 'high' | 'medium' | 'low',
            action: match[2],
            phase: 'BUILD' as WorkflowPhase,
          });
        }
      }
    }

    return results;
  }

  /**
   * Get resume info for session start
   */
  async getResumeInfo(): Promise<ResumeInfo> {
    const checkpoint = await this.loadCheckpoint();

    if (!checkpoint) {
      return {
        has_checkpoint: false,
        checkpoint_age_ms: 0,
        phase: 'THINK',
        phase_progress: '0/6',
        task: '',
        can_resume: false,
      };
    }

    const checkpointTime = new Date(checkpoint.created_at).getTime();
    const now = Date.now();
    const ageMs = now - checkpointTime;

    const phaseIndex = checkpoint.all_phases.indexOf(checkpoint.current_phase);
    const phaseProgress = `${phaseIndex + 1}/${checkpoint.all_phases.length}`;

    // Check if checkpoint is too old (more than 24 hours)
    const maxAge = 24 * 60 * 60 * 1000;
    const canResume = ageMs < maxAge;

    return {
      has_checkpoint: true,
      checkpoint_age_ms: ageMs,
      phase: checkpoint.current_phase,
      phase_progress: phaseProgress,
      task: checkpoint.user_request,
      can_resume: canResume,
    };
  }

  /**
   * Preview rollback
   */
  async previewRollback(level: RollbackLevel): Promise<RollbackPreview | null> {
    const checkpoint = await this.loadCheckpoint();
    if (!checkpoint) {
      return null;
    }

    const filesToRevert: FileChange[] = [];
    const filesToDelete: string[] = [];
    const warnings: string[] = [];

    switch (level) {
      case 1: // Last Action - revert last file change
        if (checkpoint.files_modified.length > 0) {
          const lastFile = checkpoint.files_modified[checkpoint.files_modified.length - 1];
          if (lastFile) {
            filesToRevert.push(lastFile);
          }
        }
        break;

      case 2: // Last Phase - revert all changes in current phase
        filesToRevert.push(...checkpoint.files_modified);
        filesToDelete.push(...checkpoint.files_created);
        break;

      case 3: // Last Task - revert all task changes
        filesToRevert.push(...checkpoint.files_modified);
        filesToDelete.push(...checkpoint.files_created);
        break;

      case 4: // To Checkpoint - restore to checkpoint state
        filesToRevert.push(...checkpoint.files_modified);
        filesToDelete.push(...checkpoint.files_created);
        break;

      case 5: // To Base SHA - full git reset
        if (checkpoint.base_sha === 'unknown') {
          warnings.push('No git base SHA available - cannot perform full reset');
        }
        break;
    }

    // Generate diff preview
    let diffPreview = '';
    if (filesToRevert.length > 0) {
      diffPreview = `Files to revert:\n${filesToRevert.map(f => `  - ${f.path}`).join('\n')}`;
    }
    if (filesToDelete.length > 0) {
      diffPreview += `\nFiles to delete:\n${filesToDelete.map(f => `  - ${f}`).join('\n')}`;
    }

    return {
      level,
      checkpoint,
      files_to_revert: filesToRevert,
      files_to_delete: filesToDelete,
      diff_preview: diffPreview || 'No changes to preview',
      warnings,
      can_proceed: !warnings.some(w => w.includes('cannot')),
    };
  }

  /**
   * Execute rollback using safe git commands
   */
  async executeRollback(level: RollbackLevel): Promise<RollbackResult> {
    const preview = await this.previewRollback(level);
    if (!preview) {
      return {
        success: false,
        level,
        files_reverted: [],
        files_deleted: [],
        error: 'No checkpoint available',
      };
    }

    if (!preview.can_proceed) {
      return {
        success: false,
        level,
        files_reverted: [],
        files_deleted: [],
        error: preview.warnings.join('; '),
      };
    }

    const filesReverted: string[] = [];
    const filesDeleted: string[] = [];

    try {
      // Level 5: Full git reset
      if (level === 5 && preview.checkpoint.base_sha !== 'unknown') {
        execFileSync('git', ['reset', '--hard', preview.checkpoint.base_sha], {
          cwd: this.projectRoot,
          stdio: 'pipe'
        });
        return {
          success: true,
          level,
          files_reverted: ['all'],
          files_deleted: [],
          new_sha: preview.checkpoint.base_sha,
        };
      }

      // Levels 1-4: Revert individual files
      for (const file of preview.files_to_revert) {
        if (file.original_sha) {
          execFileSync('git', ['checkout', file.original_sha, '--', file.path], {
            cwd: this.projectRoot,
            stdio: 'pipe'
          });
          filesReverted.push(file.path);
        }
      }

      // Delete created files
      for (const filePath of preview.files_to_delete) {
        const fullPath = path.join(this.projectRoot, filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          filesDeleted.push(filePath);
        }
      }

      return {
        success: true,
        level,
        files_reverted: filesReverted,
        files_deleted: filesDeleted,
      };
    } catch (error: unknown) {
      return {
        success: false,
        level,
        files_reverted: filesReverted,
        files_deleted: filesDeleted,
        error: error.message,
      };
    }
  }

  /**
   * Clear checkpoint
   */
  async clearCheckpoint(): Promise<void> {
    if (fs.existsSync(this.checkpointPath)) {
      fs.unlinkSync(this.checkpointPath);
    }
  }

  /**
   * Check for checkpoint conflicts (multi-session)
   */
  async checkConflicts(): Promise<CheckpointConflict | null> {
    // Check for other session sentinels
    if (!fs.existsSync(this.sentinelDir)) {
      return null;
    }

    const sentinels = fs.readdirSync(this.sentinelDir)
      .filter(f => f.endsWith('.sentinel') && !f.includes(this.currentSessionId));

    if (sentinels.length === 0) {
      return null;
    }

    // There's another session - check for conflict
    const localCheckpoint = await this.loadCheckpoint();
    if (!localCheckpoint) {
      return null;
    }

    // Read the other session's sentinel
    const sentinelFile = sentinels[0];
    if (!sentinelFile) {
      return null;
    }
    const otherSentinelPath = path.join(this.sentinelDir, sentinelFile);
    const otherSentinel = JSON.parse(fs.readFileSync(otherSentinelPath, 'utf-8'));

    return {
      local_checkpoint: localCheckpoint,
      remote_checkpoint: {
        ...localCheckpoint,
        session_id: otherSentinel.session_id,
        checkpoint_id: otherSentinel.last_checkpoint,
      } as Checkpoint,
      conflict_type: 'concurrent_edit',
      resolution_options: ['keep_local', 'keep_remote', 'ask_user'],
    };
  }
}

// Factory function for creating checkpoint manager with explicit project root
// Use this instead of singleton to avoid issues with process.cwd() at module load time
let _checkpointManager: CheckpointManager | null = null;

/**
 * Get or create checkpoint manager instance
 *
 * @param projectRoot - Optional project root path. If not provided, uses process.cwd()
 *                      at call time (not module load time)
 *
 * @example
 * // Recommended: Explicit project root
 * const manager = getCheckpointManager('/path/to/project');
 *
 * // Alternative: Auto-detect from current directory
 * const manager = getCheckpointManager();
 */
export function getCheckpointManager(projectRoot?: string): CheckpointManager {
  if (!_checkpointManager || projectRoot) {
    _checkpointManager = new CheckpointManager(projectRoot ?? process.cwd());
  }
  return _checkpointManager;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetCheckpointManager(): void {
  _checkpointManager = null;
}

/**
 * Legacy singleton export for backward compatibility
 *
 * @deprecated Use getCheckpointManager() instead to avoid process.cwd() issues
 * @see getCheckpointManager
 */
export const checkpointManager = new Proxy<CheckpointManager>({} as CheckpointManager, {
  get(_target, prop) {
    const manager = getCheckpointManager();
    return manager[prop as keyof CheckpointManager];
  }
});
