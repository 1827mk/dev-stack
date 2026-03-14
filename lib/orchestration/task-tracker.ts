/**
 * Task Tracker - Dev-Stack v6
 * Tracks task progress and integrates with task lists
 */

import * as fs from 'fs';

/**
 * Task status
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

/**
 * Task priority
 */
export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';

/**
 * Tracked task
 */
export interface TrackedTask {
  id: string;
  subject: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  user_story?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  dependencies: string[];
  blocked_by: string[];
  progress: number; // 0-100
  notes: string[];
  files_modified: string[];
  parent_phase?: string;
}

/**
 * Phase info
 */
export interface PhaseInfo {
  name: string;
  status: TaskStatus;
  tasks: string[];
  started_at?: string;
  completed_at?: string;
  progress: number;
}

/**
 * Progress report
 */
export interface ProgressReport {
  total_tasks: number;
  completed: number;
  in_progress: number;
  pending: number;
  failed: number;
  skipped: number;
  progress_percent: number;
  current_phase?: string;
  current_task?: string;
  eta_minutes?: number;
  phases: PhaseInfo[];
}

/**
 * Task Tracker class
 */
export class TaskTracker {
  private projectRoot: string;
  private tasks: Map<string, TrackedTask> = new Map();
  private phases: Map<string, PhaseInfo> = new Map();
  private startTime: number | null = null;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Load tasks from tasks.md
   */
  loadFromTasksMd(filePath: string): number {
    if (!fs.existsSync(filePath)) {
      return 0;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let loaded = 0;

    for (const line of lines) {
      // Parse task lines: - [ ] T001 [P] [US1] Description
      const match = line.match(/^- \[([ x])\] (T\d+)(?:\s+\[P\])?(?:\s+\[(US\d+)\])?\s+(.+)$/);
      if (match) {
        const [, checked, id, userStory, subject] = match;
        const status: TaskStatus = checked === 'x' ? 'completed' : 'pending';

        this.tasks.set(id, {
          id,
          subject,
          description: subject,
          status,
          priority: 'P1',
          user_story: userStory,
          created_at: new Date().toISOString(),
          dependencies: [],
          blocked_by: [],
          progress: status === 'completed' ? 100 : 0,
          notes: [],
          files_modified: []
        });

        loaded++;
      }
    }

    return loaded;
  }

  /**
   * Add task
   */
  addTask(task: Partial<TrackedTask> & { id: string; subject: string }): TrackedTask {
    const fullTask: TrackedTask = {
      description: task.description ?? task.subject,
      status: task.status ?? 'pending',
      priority: task.priority ?? 'P1',
      user_story: task.user_story,
      created_at: task.created_at ?? new Date().toISOString(),
      dependencies: task.dependencies ?? [],
      blocked_by: task.blocked_by ?? [],
      progress: task.progress ?? 0,
      notes: task.notes ?? [],
      files_modified: task.files_modified ?? [],
      parent_phase: task.parent_phase,
      ...task
    };

    this.tasks.set(task.id, fullTask);
    return fullTask;
  }

  /**
   * Update task status
   */
  updateStatus(taskId: string, status: TaskStatus): TrackedTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = status;

    if (status === 'in_progress' && !task.started_at) {
      task.started_at = new Date().toISOString();
      if (!this.startTime) {
        this.startTime = Date.now();
      }
    }

    if (status === 'completed' || status === 'failed' || status === 'skipped') {
      task.completed_at = new Date().toISOString();
      if (task.started_at) {
        task.duration_ms = new Date(task.completed_at).getTime() - new Date(task.started_at).getTime();
      }
      task.progress = status === 'completed' ? 100 : task.progress;
    }

    return task;
  }

  /**
   * Update task progress
   */
  updateProgress(taskId: string, progress: number, note?: string): TrackedTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.progress = Math.min(100, Math.max(0, progress));

    if (note) {
      task.notes.push(note);
    }

    return task;
  }

  /**
   * Add file to task
   */
  addFileModified(taskId: string, filePath: string): TrackedTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    if (!task.files_modified.includes(filePath)) {
      task.files_modified.push(filePath);
    }

    return task;
  }

  /**
   * Get task
   */
  getTask(taskId: string): TrackedTask | null {
    return this.tasks.get(taskId) ?? null;
  }

  /**
   * Get all tasks
   */
  getAllTasks(): TrackedTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): TrackedTask[] {
    return this.getAllTasks().filter(t => t.status === status);
  }

  /**
   * Get tasks by user story
   */
  getTasksByUserStory(userStory: string): TrackedTask[] {
    return this.getAllTasks().filter(t => t.user_story === userStory);
  }

  /**
   * Get next available task
   */
  getNextAvailableTask(): TrackedTask | null {
    const pending = this.getTasksByStatus('pending');

    for (const task of pending) {
      // Check if all dependencies are completed
      const blockedByIncomplete = task.blocked_by.some(depId => {
        const dep = this.tasks.get(depId);
        return dep && dep.status !== 'completed';
      });

      if (!blockedByIncomplete) {
        return task;
      }
    }

    return null;
  }

  /**
   * Add phase
   */
  addPhase(name: string, taskIds: string[]): PhaseInfo {
    const phase: PhaseInfo = {
      name,
      status: 'pending',
      tasks: taskIds,
      progress: 0
    };

    this.phases.set(name, phase);
    return phase;
  }

  /**
   * Update phase
   */
  updatePhase(name: string): PhaseInfo | null {
    const phase = this.phases.get(name);
    if (!phase) return null;

    const tasks = phase.tasks.map(id => this.tasks.get(id)).filter((t): t is TrackedTask => t !== undefined);

    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;

    phase.progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update phase status
    if (tasks.some(t => t.status === 'in_progress')) {
      phase.status = 'in_progress';
      if (!phase.started_at) {
        phase.started_at = new Date().toISOString();
      }
    } else if (completed === total && total > 0) {
      phase.status = 'completed';
      phase.completed_at = new Date().toISOString();
    } else if (tasks.some(t => t.status === 'failed')) {
      phase.status = 'failed';
    }

    return phase;
  }

  /**
   * Get progress report
   */
  getProgressReport(): ProgressReport {
    const tasks = this.getAllTasks();

    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    const skipped = tasks.filter(t => t.status === 'skipped').length;
    const total = tasks.length;

    // Calculate progress
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Find current phase and task
    const currentTask = tasks.find(t => t.status === 'in_progress');
    const currentPhase = currentTask?.parent_phase;

    // Calculate ETA
    let etaMinutes: number | undefined;
    if (this.startTime && completed > 0) {
      const elapsedMs = Date.now() - this.startTime;
      const msPerTask = elapsedMs / completed;
      const remaining = pending + inProgress;
      etaMinutes = Math.round((msPerTask * remaining) / 60000);
    }

    // Update all phases
    for (const [name] of this.phases) {
      this.updatePhase(name);
    }

    return {
      total_tasks: total,
      completed,
      in_progress: inProgress,
      pending,
      failed,
      skipped,
      progress_percent: progressPercent,
      current_phase: currentPhase,
      current_task: currentTask?.id,
      eta_minutes: etaMinutes,
      phases: Array.from(this.phases.values())
    };
  }

  /**
   * Generate progress bar
   */
  generateProgressBar(width: number = 20): string {
    const report = this.getProgressReport();
    const filled = Math.round((report.progress_percent / 100) * width);
    const empty = width - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${report.progress_percent}%`;
  }

  /**
   * Generate summary
   */
  generateSummary(): string {
    const report = this.getProgressReport();
    const lines: string[] = [];

    lines.push(`## Task Progress`);
    lines.push('');
    lines.push(this.generateProgressBar());
    lines.push('');

    lines.push(`**Total**: ${report.total_tasks} tasks`);
    lines.push(`**Completed**: ${report.completed}`);
    lines.push(`**In Progress**: ${report.in_progress}`);
    lines.push(`**Pending**: ${report.pending}`);

    if (report.failed > 0) {
      lines.push(`**Failed**: ${report.failed}`);
    }

    if (report.skipped > 0) {
      lines.push(`**Skipped**: ${report.skipped}`);
    }

    if (report.current_task) {
      lines.push('');
      lines.push(`**Current Task**: ${report.current_task}`);
    }

    if (report.eta_minutes !== undefined) {
      lines.push(`**ETA**: ~${report.eta_minutes} minutes`);
    }

    return lines.join('\n');
  }

  /**
   * Export to tasks.md format
   */
  exportToTasksMd(): string {
    const lines: string[] = [];
    const tasks = this.getAllTasks();

    for (const task of tasks) {
      const checkbox = task.status === 'completed' ? '[x]' : '[ ]';
      let line = `- ${checkbox} ${task.id}`;

      if (task.priority) {
        line += ` [${task.priority}]`;
      }

      if (task.user_story) {
        line += ` [${task.user_story}]`;
      }

      line += ` ${task.subject}`;

      lines.push(line);
    }

    return lines.join('\n');
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.tasks.clear();
    this.phases.clear();
    this.startTime = null;
  }
}

/**
 * Export singleton factory
 */
export function createTaskTracker(projectRoot: string): TaskTracker {
  return new TaskTracker(projectRoot);
}
