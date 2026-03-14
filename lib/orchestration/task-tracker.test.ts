/**
 * Task Tracker Tests - Dev-Stack v6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TaskTracker, createTaskTracker } from './task-tracker.js';

describe('TaskTracker', () => {
  let tracker: TaskTracker;
  const projectRoot = '/tmp/test-project';

  beforeEach(() => {
    tracker = new TaskTracker(projectRoot);
  });

  describe('constructor', () => {
    it('should create tracker with project root', () => {
      expect(tracker).toBeDefined();
    });

    it('should create tracker via factory', () => {
      const factoryTracker = createTaskTracker(projectRoot);
      expect(factoryTracker).toBeDefined();
    });
  });

  describe('addTask', () => {
    it('should add a new task', () => {
      const task = tracker.addTask({
        id: 'T001',
        subject: 'Test task',
        description: 'Test description'
      });
      expect(task).toBeDefined();
      expect(task.id).toBe('T001');
      expect(task.subject).toBe('Test task');
    });

    it('should track task status as pending by default', () => {
      tracker.addTask({
        id: 'T001',
        subject: 'Test task'
      });
      const task = tracker.getTask('T001');
      expect(task?.status).toBe('pending');
    });
  });

  describe('updateStatus', () => {
    it('should update task status', () => {
      tracker.addTask({
        id: 'T001',
        subject: 'Test task'
      });
      tracker.updateStatus('T001', 'in_progress');
      const task = tracker.getTask('T001');
      expect(task?.status).toBe('in_progress');
    });

    it('should record started_at when status becomes in_progress', () => {
      tracker.addTask({
        id: 'T001',
        subject: 'Test task'
      });
      tracker.updateStatus('T001', 'in_progress');
      const task = tracker.getTask('T001');
      expect(task?.started_at).toBeDefined();
    });

    it('should record completed_at when status becomes completed', () => {
      tracker.addTask({
        id: 'T001',
        subject: 'Test task'
      });
      tracker.updateStatus('T001', 'in_progress');
      tracker.updateStatus('T001', 'completed');
      const task = tracker.getTask('T001');
      expect(task?.completed_at).toBeDefined();
      expect(task?.progress).toBe(100);
    });
  });

  describe('updateProgress', () => {
    it('should update task progress', () => {
      tracker.addTask({
        id: 'T001',
        subject: 'Test task'
      });
      tracker.updateProgress('T001', 50);
      const task = tracker.getTask('T001');
      expect(task?.progress).toBe(50);
    });

    it('should add note when updating progress', () => {
      tracker.addTask({
        id: 'T001',
        subject: 'Test task'
      });
      tracker.updateProgress('T001', 50, 'Half done');
      const task = tracker.getTask('T001');
      expect(task?.notes).toContain('Half done');
    });
  });

  describe('getTask', () => {
    it('should return task by id', () => {
      tracker.addTask({
        id: 'T001',
        subject: 'Test task'
      });
      const task = tracker.getTask('T001');
      expect(task).toBeDefined();
      expect(task?.id).toBe('T001');
    });

    it('should return null for non-existent task', () => {
      const task = tracker.getTask('NONEXISTENT');
      expect(task).toBeNull();
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', () => {
      tracker.addTask({ id: 'T001', subject: 'Task 1' });
      tracker.addTask({ id: 'T002', subject: 'Task 2' });
      tracker.addTask({ id: 'T003', subject: 'Task 3' });

      const tasks = tracker.getAllTasks();
      expect(tasks.length).toBe(3);
    });
  });

  describe('getTasksByStatus', () => {
    it('should filter by status', () => {
      tracker.addTask({ id: 'T001', subject: 'Task 1' });
      tracker.addTask({ id: 'T002', subject: 'Task 2' });
      tracker.updateStatus('T001', 'completed');

      const completed = tracker.getTasksByStatus('completed');
      expect(completed.length).toBe(1);
    });
  });

  describe('getProgressReport', () => {
    it('should return overall progress', () => {
      tracker.addTask({ id: 'T001', subject: 'Task 1' });
      tracker.addTask({ id: 'T002', subject: 'Task 2' });
      tracker.addTask({ id: 'T003', subject: 'Task 3' });

      const progress = tracker.getProgressReport();
      expect(progress.total_tasks).toBe(3);
      expect(progress.pending).toBe(3);
      expect(progress.in_progress).toBe(0);
      expect(progress.completed).toBe(0);
    });

    it('should calculate completion percentage', () => {
      tracker.addTask({ id: 'T001', subject: 'Task 1' });
      tracker.addTask({ id: 'T002', subject: 'Task 2' });
      tracker.addTask({ id: 'T003', subject: 'Task 3' });

      tracker.updateStatus('T001', 'in_progress');
      tracker.updateStatus('T001', 'completed');
      tracker.updateStatus('T002', 'in_progress');
      tracker.updateStatus('T002', 'completed');

      const progress = tracker.getProgressReport();
      // Implementation rounds 2/3 = 0.666... to 67%
      expect(progress.progress_percent).toBe(67);
    });
  });

  describe('generateProgressBar', () => {
    it('should generate progress bar', () => {
      tracker.addTask({ id: 'T001', subject: 'Task 1' });
      tracker.updateStatus('T001', 'completed');

      const bar = tracker.generateProgressBar();
      expect(bar).toContain('100%');
    });
  });

  describe('generateSummary', () => {
    it('should generate summary', () => {
      tracker.addTask({ id: 'T001', subject: 'Task 1' });
      tracker.updateStatus('T001', 'completed');

      const summary = tracker.generateSummary();
      expect(summary).toContain('Task Progress');
    });
  });

  describe('reset', () => {
    it('should clear all tasks', () => {
      tracker.addTask({ id: 'T001', subject: 'Task 1' });
      tracker.addTask({ id: 'T002', subject: 'Task 2' });
      tracker.reset();
      const tasks = tracker.getAllTasks();
      expect(tasks.length).toBe(0);
    });
  });

  describe('phases', () => {
    it('should add and track phases', () => {
      tracker.addTask({ id: 'T001', subject: 'Task 1', parent_phase: 'Phase 1' });
      tracker.addTask({ id: 'T002', subject: 'Task 2', parent_phase: 'Phase 1' });

      tracker.addPhase('Phase 1', ['T001', 'T002']);
      tracker.updateStatus('T001', 'completed');
      tracker.updateStatus('T002', 'completed');

      const report = tracker.getProgressReport();
      const phase = report.phases.find(p => p.name === 'Phase 1');
      expect(phase?.progress).toBe(100);
    });
  });
});
