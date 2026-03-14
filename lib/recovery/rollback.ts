/**
 * Rollback Implementation - Dev-Stack v6
 * 5-level rollback with diff preview
 */

import { execFileSync } from 'child_process';
import { CheckpointManager } from '../checkpoint/manager';
import {
  RollbackLevel,
  RollbackPreview,
  RollbackResult,
  FileChange,
  ROLLBACK_LEVELS,
} from '../checkpoint/types';

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
 * Rollback Manager
 * Handles 5 levels of rollback with diff preview
 */
export class RollbackManager {
  private projectRoot: string;
  private checkpointManager: CheckpointManager;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.checkpointManager = new CheckpointManager(projectRoot);
  }

  /**
   * Get rollback level information
   */
  getLevelInfo(level: RollbackLevel): {
    name: string;
    scope: string;
    description: string;
  } {
    return ROLLBACK_LEVELS[level];
  }

  /**
   * Preview rollback without executing
   */
  async preview(level: RollbackLevel): Promise<RollbackPreview | null> {
    return this.checkpointManager.previewRollback(level);
  }

  /**
   * Execute rollback
   */
  async execute(level: RollbackLevel, force: boolean = false): Promise<RollbackResult> {
    const preview = await this.preview(level);

    if (!preview) {
      return {
        success: false,
        level,
        files_reverted: [],
        files_deleted: [],
        error: 'No checkpoint available for rollback',
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

    // Level 5: Full git reset - requires force
    if (level === 5 && !force) {
      return {
        success: false,
        level,
        files_reverted: [],
        files_deleted: [],
        error: 'Level 5 (Base SHA) rollback requires --force flag',
      };
    }

    return this.checkpointManager.executeRollback(level);
  }

  /**
   * Get git diff for files
   */
  getDiff(files: FileChange[]): string {
    const diffs: string[] = [];

    for (const file of files) {
      if (file.original_sha) {
        try {
          const diff = safeGitCommand(
            ['diff', file.original_sha, 'HEAD', '--', file.path],
            this.projectRoot
          );
          if (diff) {
            diffs.push(`diff --git a/${file.path} b/${file.path}`);
            diffs.push(diff);
          }
        } catch {
          diffs.push(`# Could not get diff for ${file.path}`);
        }
      }
    }

    return diffs.join('\n');
  }

  /**
   * Check if git is available
   */
  isGitAvailable(): boolean {
    try {
      const result = safeGitCommand(['rev-parse', '--git-dir'], this.projectRoot);
      return result.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get current HEAD SHA
   */
  getCurrentSha(): string {
    return safeGitCommand(['rev-parse', 'HEAD'], this.projectRoot) || 'unknown';
  }

  /**
   * List available rollback targets
   */
  async listRollbackTargets(): Promise<{
    level: RollbackLevel;
    info: { name: string; scope: string; description: string };
    available: boolean;
    preview?: string;
  }[]> {
    const checkpoint = await this.checkpointManager.loadCheckpoint();
    const targets: {
      level: RollbackLevel;
      info: { name: string; scope: string; description: string };
      available: boolean;
      preview?: string;
    }[] = [];

    for (let level = 1 as RollbackLevel; level <= 5; level++) {
      const info = this.getLevelInfo(level);
      let available = true;
      let preview: string | undefined;

      switch (level) {
        case 1:
          available = (checkpoint?.files_modified.length ?? 0) > 0;
          if (available) {
            const lastFile = checkpoint?.files_modified[checkpoint.files_modified.length - 1];
            preview = lastFile?.path;
          }
          break;
        case 2:
        case 3:
        case 4:
          available = (checkpoint?.files_modified.length ?? 0) > 0 ||
                      (checkpoint?.files_created.length ?? 0) > 0;
          preview = `${checkpoint?.files_modified.length ?? 0} modified, ${checkpoint?.files_created.length ?? 0} created`;
          break;
        case 5:
          available = this.isGitAvailable() && checkpoint?.base_sha !== 'unknown';
          preview = checkpoint?.base_sha;
          break;
      }

      targets.push({ level: level as RollbackLevel, info, available, preview });
    }

    return targets;
  }
}

// Export singleton instance
export const rollbackManager = new RollbackManager();
