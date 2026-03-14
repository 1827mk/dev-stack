/**
 * Pattern Store Tests - Dev-Stack v6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PatternStore } from './store';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe('PatternStore', () => {
  let store: PatternStore;
  const testProjectRoot = '/test-project';

  beforeEach(() => {
    vi.clearAllMocks();
    (fs.existsSync as any).mockReturnValue(false);
    store = new PatternStore(testProjectRoot);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default project root', () => {
      (fs.existsSync as any).mockReturnValue(false);
      const defaultStore = new PatternStore();
      expect(defaultStore).toBeDefined();
    });

    it('should create instance with custom project root', () => {
      expect(store).toBeDefined();
    });
  });

  describe('savePattern', () => {
    it('should save a new pattern and return its ID', async () => {
      const input = {
        type: 'code_pattern' as const,
        name: 'test-pattern',
        description: 'A test pattern',
        tags: ['test', 'example'],
        source_project: testProjectRoot,
      };

      const id = await store.savePattern(input);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should save pattern with code example', async () => {
      const input = {
        type: 'solution' as const,
        name: 'auth-pattern',
        description: 'Authentication pattern',
        code_example: 'const auth = useAuth();',
        tags: ['auth', 'security'],
        source_project: testProjectRoot,
      };

      const id = await store.savePattern(input);
      expect(id).toBeDefined();
    });
  });

  describe('getPatternById', () => {
    it('should return null for non-existent pattern', () => {
      const pattern = store.getPatternById('non-existent-id');
      expect(pattern).toBeNull();
    });

    it('should return pattern after saving', async () => {
      const input = {
        type: 'code_pattern' as const,
        name: 'test-pattern',
        description: 'A test pattern',
        tags: ['test'],
        source_project: testProjectRoot,
      };

      const id = await store.savePattern(input);
      const pattern = store.getPatternById(id);

      expect(pattern).toBeDefined();
      expect(pattern?.name).toBe('test-pattern');
      expect(pattern?.type).toBe('code_pattern');
    });
  });

  describe('getPatternsByType', () => {
    it('should return empty array when no patterns of type exist', () => {
      const patterns = store.getPatternsByType('debug');
      expect(patterns).toEqual([]);
    });

    it('should return patterns of specified type', async () => {
      await store.savePattern({
        type: 'code_pattern',
        name: 'pattern1',
        description: 'First pattern',
        tags: [],
        source_project: testProjectRoot,
      });

      await store.savePattern({
        type: 'code_pattern',
        name: 'pattern2',
        description: 'Second pattern',
        tags: [],
        source_project: testProjectRoot,
      });

      const patterns = store.getPatternsByType('code_pattern');
      expect(patterns.length).toBe(2);
    });
  });

  describe('getPatternsByTags', () => {
    it('should return empty array when no patterns match tags', () => {
      const patterns = store.getPatternsByTags(['nonexistent']);
      expect(patterns).toEqual([]);
    });

    it('should return patterns matching any tag', async () => {
      await store.savePattern({
        type: 'code_pattern',
        name: 'tagged-pattern',
        description: 'A tagged pattern',
        tags: ['auth', 'security'],
        source_project: testProjectRoot,
      });

      const patterns = store.getPatternsByTags(['auth']);
      expect(patterns.length).toBe(1);
    });
  });

  describe('searchPatterns', () => {
    it('should return empty array when no matches found', async () => {
      const results = await store.searchPatterns('nonexistent query');
      expect(results).toEqual([]);
    });

    it('should return matching patterns', async () => {
      await store.savePattern({
        type: 'solution',
        name: 'authentication-handler',
        description: 'Handles user authentication with JWT',
        tags: ['auth'],
        source_project: testProjectRoot,
      });

      const results = await store.searchPatterns('authentication');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].pattern.name).toContain('authentication');
    });

    it('should respect limit parameter', async () => {
      // Save multiple patterns
      for (let i = 0; i < 10; i++) {
        await store.savePattern({
          type: 'code_pattern',
          name: `test-pattern-${i}`,
          description: 'Test pattern for search',
          tags: [],
          source_project: testProjectRoot,
        });
      }

      const results = await store.searchPatterns('test', 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  describe('recordUsage', () => {
    it('should increment success count on successful usage', async () => {
      const id = await store.savePattern({
        type: 'code_pattern',
        name: 'test-pattern',
        description: 'Test',
        tags: [],
        source_project: testProjectRoot,
      });

      store.recordUsage(id, true);
      const pattern = store.getPatternById(id);

      expect(pattern?.success_count).toBe(1);
    });

    it('should increment failure count on failed usage', async () => {
      const id = await store.savePattern({
        type: 'code_pattern',
        name: 'test-pattern',
        description: 'Test',
        tags: [],
        source_project: testProjectRoot,
      });

      store.recordUsage(id, false);
      const pattern = store.getPatternById(id);

      expect(pattern?.failure_count).toBe(1);
    });

    it('should update confidence after usage', async () => {
      const id = await store.savePattern({
        type: 'code_pattern',
        name: 'test-pattern',
        description: 'Test',
        tags: [],
        source_project: testProjectRoot,
      });

      // Record some successes and failures
      store.recordUsage(id, true);
      store.recordUsage(id, true);
      store.recordUsage(id, false);

      const pattern = store.getPatternById(id);
      // Confidence should be 2/3 ≈ 0.67
      expect(pattern?.confidence).toBeCloseTo(0.67, 1);
    });
  });

  describe('deletePattern', () => {
    it('should return false for non-existent pattern', () => {
      const result = store.deletePattern('non-existent-id');
      expect(result).toBe(false);
    });

    it('should delete existing pattern', async () => {
      const id = await store.savePattern({
        type: 'code_pattern',
        name: 'test-pattern',
        description: 'Test',
        tags: [],
        source_project: testProjectRoot,
      });

      const result = store.deletePattern(id);
      expect(result).toBe(true);

      const pattern = store.getPatternById(id);
      expect(pattern).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return empty stats for new store', () => {
      const stats = store.getStats();
      expect(stats.totalPatterns).toBe(0);
      expect(stats.avgConfidence).toBe(0);
    });

    it('should return correct stats after adding patterns', async () => {
      await store.savePattern({
        type: 'code_pattern',
        name: 'pattern1',
        description: 'First',
        tags: [],
        source_project: testProjectRoot,
      });

      await store.savePattern({
        type: 'solution',
        name: 'pattern2',
        description: 'Second',
        tags: [],
        source_project: testProjectRoot,
      });

      const stats = store.getStats();
      expect(stats.totalPatterns).toBe(2);
    });
  });

  describe('getPatternCount', () => {
    it('should return 0 for empty store', async () => {
      const count = await store.getPatternCount();
      expect(count).toBe(0);
    });

    it('should return correct count after adding patterns', async () => {
      await store.savePattern({
        type: 'code_pattern',
        name: 'pattern1',
        description: 'First',
        tags: [],
        source_project: testProjectRoot,
      });

      await store.savePattern({
        type: 'code_pattern',
        name: 'pattern2',
        description: 'Second',
        tags: [],
        source_project: testProjectRoot,
      });

      const count = await store.getPatternCount();
      expect(count).toBe(2);
    });
  });

  describe('getAllPatternTypes', () => {
    it('should return empty array for empty store', () => {
      const types = store.getAllPatternTypes();
      expect(types).toEqual([]);
    });

    it('should return unique pattern types', async () => {
      await store.savePattern({
        type: 'code_pattern',
        name: 'pattern1',
        description: 'First',
        tags: [],
        source_project: testProjectRoot,
      });

      await store.savePattern({
        type: 'solution',
        name: 'pattern2',
        description: 'Second',
        tags: [],
        source_project: testProjectRoot,
      });

      const types = store.getAllPatternTypes();
      expect(types).toContain('code_pattern');
      expect(types).toContain('solution');
    });
  });
});
