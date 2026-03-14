/**
 * Pattern Learner Tests - Dev-Stack v6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatternLearner } from './learner';
import { PatternStore } from './store';

// Mock PatternStore
vi.mock('./store', () => ({
  PatternStore: vi.fn().mockImplementation(() => ({
    savePattern: vi.fn().mockResolvedValue('test-pattern-id'),
    getPatternById: vi.fn().mockReturnValue({
      id: 'test-pattern-id',
      type: 'code_pattern',
      name: 'test-pattern',
      description: 'Test pattern',
      tags: ['test'],
      confidence: 0.5,
      success_count: 0,
      failure_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      status: 'active',
      usage_count: 0,
      source_project: '/test',
    }),
    recordUsage: vi.fn(),
  })),
}));

// Mock fs
vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(false),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe('PatternLearner', () => {
  let learner: PatternLearner;
  let mockStore: PatternStore;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = new PatternStore('/test');
    learner = new PatternLearner(mockStore);
  });

  describe('constructor', () => {
    it('should create learner with store', () => {
      expect(learner).toBeDefined();
    });

    it('should accept custom config', () => {
      const customLearner = new PatternLearner(mockStore, {
        minInteractionsForConfidence: 5,
        successWeight: 0.8,
      });
      expect(customLearner).toBeDefined();
    });
  });

  describe('recordUsage', () => {
    it('should record successful usage', () => {
      learner.recordUsage('test-pattern-id', 'session-1', true, 'Test context');
      expect(mockStore.recordUsage).toHaveBeenCalledWith('test-pattern-id', true);
    });

    it('should record failed usage', () => {
      learner.recordUsage('test-pattern-id', 'session-1', false, 'Test context');
      expect(mockStore.recordUsage).toHaveBeenCalledWith('test-pattern-id', false);
    });

    it('should work without context', () => {
      learner.recordUsage('test-pattern-id', 'session-1', true);
      expect(mockStore.recordUsage).toHaveBeenCalled();
    });
  });

  describe('recordFeedback', () => {
    it('should record positive feedback', () => {
      learner.recordFeedback('test-pattern-id', 'session-1', 'positive', 'Great pattern');
      expect(mockStore.recordUsage).toHaveBeenCalledWith('test-pattern-id', true);
    });

    it('should record negative feedback', () => {
      learner.recordFeedback('test-pattern-id', 'session-1', 'negative', 'Did not work');
      expect(mockStore.recordUsage).toHaveBeenCalledWith('test-pattern-id', false);
    });

    it('should not update stats for neutral feedback', () => {
      learner.recordFeedback('test-pattern-id', 'session-1', 'neutral', 'Okay');
      // Neutral feedback should not call recordUsage
      expect(mockStore.recordUsage).not.toHaveBeenCalled();
    });
  });

  describe('recordAdaptation', () => {
    it('should record successful adaptation', () => {
      learner.recordAdaptation('test-pattern-id', 'session-1', 'Changed React to Vue', true);
      expect(mockStore.recordUsage).toHaveBeenCalledWith('test-pattern-id', true);
    });

    it('should record failed adaptation', () => {
      learner.recordAdaptation('test-pattern-id', 'session-1', 'Changed React to Vue', false);
      // Failed adaptation should not increment success
      expect(mockStore.recordUsage).not.toHaveBeenCalled();
    });
  });

  describe('getPatternStats', () => {
    it('should return default stats for pattern without history', () => {
      const stats = learner.getPatternStats('non-existent-pattern');
      expect(stats.totalEvents).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.recentTrend).toBe('stable');
    });

    it('should calculate stats after recording events', () => {
      // Record some events
      learner.recordUsage('test-pattern-id', 'session-1', true);
      learner.recordUsage('test-pattern-id', 'session-2', true);
      learner.recordUsage('test-pattern-id', 'session-3', false);

      const stats = learner.getPatternStats('test-pattern-id');
      expect(stats.totalEvents).toBe(3);
      expect(stats.successRate).toBeCloseTo(0.67, 1);
    });
  });

  describe('learnFromTask', () => {
    it('should create pattern from successful task', async () => {
      const pattern = await learner.learnFromTask(
        'Implement authentication',
        ['Step 1: Analyze', 'Step 2: Implement', 'Step 3: Test'],
        'success',
        'session-1',
        ['const auth = useAuth();']
      );

      expect(pattern).toBeDefined();
      expect(mockStore.savePattern).toHaveBeenCalled();
    });

    it('should return null for failed task', async () => {
      const pattern = await learner.learnFromTask(
        'Failed task',
        ['Step 1'],
        'failure',
        'session-1'
      );

      expect(pattern).toBeNull();
    });

    it('should infer correct pattern type', async () => {
      await learner.learnFromTask(
        'Fix bug in authentication',
        ['Debug', 'Fix', 'Test'],
        'success',
        'session-1'
      );

      const saveCall = (mockStore.savePattern as any).mock.calls[0][0];
      expect(saveCall.type).toBe('debug');
    });

    it('should extract tags from task description', async () => {
      await learner.learnFromTask(
        'Implement React authentication with TypeScript',
        ['Setup', 'Code'],
        'success',
        'session-1'
      );

      const saveCall = (mockStore.savePattern as any).mock.calls[0][0];
      expect(saveCall.tags).toContain('react');
      expect(saveCall.tags).toContain('typescript');
    });

    it('should generate pattern name from description', async () => {
      await learner.learnFromTask(
        'Create authentication middleware for API',
        [],
        'success',
        'session-1'
      );

      const saveCall = (mockStore.savePattern as any).mock.calls[0][0];
      expect(saveCall.name).toBeDefined();
      expect(saveCall.name.length).toBeGreaterThan(0);
    });
  });

  describe('getSuggestedPatterns', () => {
    it('should return patterns above confidence threshold', async () => {
      // Mock store.searchPatterns to return patterns
      (mockStore.searchPatterns as any) = vi.fn().mockResolvedValue([
        { pattern: { confidence: 0.8, name: 'high-confidence' } },
        { pattern: { confidence: 0.3, name: 'low-confidence' } },
      ]);

      const suggestions = await learner.getSuggestedPatterns('test query');
      expect(suggestions.length).toBe(1);
      expect(suggestions[0].name).toBe('high-confidence');
    });
  });

  describe('clearPatternHistory', () => {
    it('should clear history for specific pattern', () => {
      learner.recordUsage('test-pattern-id', 'session-1', true);
      learner.clearPatternHistory('test-pattern-id');

      const stats = learner.getPatternStats('test-pattern-id');
      expect(stats.totalEvents).toBe(0);
    });
  });

  describe('exportLearningData', () => {
    it('should export empty data for new learner', () => {
      const data = learner.exportLearningData();
      expect(data.events).toBeDefined();
      expect(data.stats).toBeDefined();
    });

    it('should export data after recording events', () => {
      learner.recordUsage('test-pattern-id', 'session-1', true);
      learner.recordUsage('test-pattern-id', 'session-2', false);

      const data = learner.exportLearningData();
      expect(Object.keys(data.events).length).toBeGreaterThan(0);
      expect(Object.keys(data.stats).length).toBeGreaterThan(0);
    });
  });

  describe('trend calculation', () => {
    it('should detect improving trend', () => {
      // Record improving pattern: failures first, then successes
      for (let i = 0; i < 3; i++) {
        learner.recordUsage('test-pattern-id', `session-${i}`, false);
      }
      for (let i = 3; i < 8; i++) {
        learner.recordUsage('test-pattern-id', `session-${i}`, true);
      }

      const stats = learner.getPatternStats('test-pattern-id');
      expect(stats.recentTrend).toBe('improving');
    });

    it('should detect declining trend', () => {
      // Record declining pattern: successes first, then failures
      for (let i = 0; i < 5; i++) {
        learner.recordUsage('test-pattern-id', `session-${i}`, true);
      }
      for (let i = 5; i < 10; i++) {
        learner.recordUsage('test-pattern-id', `session-${i}`, false);
      }

      const stats = learner.getPatternStats('test-pattern-id');
      expect(stats.recentTrend).toBe('declining');
    });

    it('should detect stable trend', () => {
      // Record consistent pattern - all successes to have stable trend
      for (let i = 0; i < 10; i++) {
        learner.recordUsage('test-pattern-id', `session-${i}`, true);
      }

      const stats = learner.getPatternStats('test-pattern-id');
      expect(stats.recentTrend).toBe('stable');
    });
  });

  describe('pattern type inference', () => {
    it('should infer debug type for fix/bug keywords', async () => {
      await learner.learnFromTask('Fix authentication bug', [], 'success', 's1');
      const call = (mockStore.savePattern as any).mock.calls[0][0];
      expect(call.type).toBe('debug');
    });

    it('should infer refactor type for refactor/clean keywords', async () => {
      await learner.learnFromTask('Refactor authentication module', [], 'success', 's1');
      const call = (mockStore.savePattern as any).mock.calls[0][0];
      expect(call.type).toBe('refactor');
    });

    it('should infer solution type for implement/add keywords', async () => {
      await learner.learnFromTask('Implement new feature', [], 'success', 's1');
      const call = (mockStore.savePattern as any).mock.calls[0][0];
      expect(call.type).toBe('solution');
    });

    it('should infer workflow type for workflow/process keywords', async () => {
      await learner.learnFromTask('Setup CI/CD workflow', [], 'success', 's1');
      const call = (mockStore.savePattern as any).mock.calls[0][0];
      expect(call.type).toBe('workflow');
    });

    it('should default to code_pattern for unknown keywords', async () => {
      await learner.learnFromTask('Update configuration', [], 'success', 's1');
      const call = (mockStore.savePattern as any).mock.calls[0][0];
      expect(call.type).toBe('code_pattern');
    });
  });
});
