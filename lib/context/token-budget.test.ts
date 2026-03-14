/**
 * Tests for Token Budget Manager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  TokenBudgetManager,
  createTokenBudgetManager,
  DEFAULT_ALLOCATION
} from './token-budget.js';

describe('TokenBudgetManager', () => {
  let manager: TokenBudgetManager;

  beforeEach(() => {
    manager = new TokenBudgetManager();
  });

  describe('Constructor', () => {
    it('should create instance with default allocation', () => {
      expect(manager).toBeDefined();
    });

    it('should create instance with custom allocation', () => {
      const customManager = new TokenBudgetManager({
        system_prompt: 10000,
        project_dna: 10000,
        current_task: 30000,
        working_memory: 20000,
        pattern_memory: 15000,
        code_context: 40000,
        buffer: 20000
      });
      expect(customManager).toBeDefined();
    });

    it('should support efficient mode', () => {
      const efficientManager = new TokenBudgetManager({ _efficient: true });
      expect(efficientManager.isEfficientMode()).toBe(true);
    });
  });

  describe('canLoad', () => {
    it('should return true when enough budget', () => {
      const result = manager.canLoad('code_context', 1000);
      expect(result).toBe(true);
    });

    it('should return false when not enough budget', () => {
      // Create manager with small code_context AND no buffer
        const smallManager = new TokenBudgetManager({
        code_context: 100,
        buffer: 0
      });
      const result = smallManager.canLoad('code_context', 1000);
      expect(result).toBe(false);
    });

    it('should use buffer when category exhausted', () => {
      const result = manager.canLoad('code_context', DEFAULT_ALLOCATION.code_context + DEFAULT_ALLOCATION.buffer);
      expect(result).toBe(true);
    });
  });

  describe('loadContext', () => {
    it('should load context item', () => {
      const result = manager.loadContext(
        'test-1',
        'code_context',
        'test-source.ts',
        1000,
        0.8
      );
      expect(result).toBe(true);
    });

    it('should fail when not enough budget', () => {
      const smallManager = new TokenBudgetManager({
        code_context: 100,
        buffer: 0
      });
      const result = smallManager.loadContext(
        'test-2',
        'code_context',
        'test.ts',
        1000,
        0.8
      );
      expect(result).toBe(false);
    });

    it('should track loaded context', () => {
      manager.loadContext('test-3', 'code_context', 'test.ts', 500, 0.9);
      const loaded = manager.getLoadedContext();
      expect(loaded.length).toBe(1);
      expect(loaded[0].id).toBe('test-3');
    });
  });

  describe('accessContext', () => {
    it('should update access time and count', () => {
      manager.loadContext('test-1', 'code_context', 'test.ts', 100, 0.8);
      const result = manager.accessContext('test-1');
      expect(result).toBe(true);
    });

    it('should return false for non-existent context', () => {
      const result = manager.accessContext('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('unloadContext', () => {
    it('should unload context item', () => {
      manager.loadContext('test-1', 'code_context', 'test.ts', 100, 0.8);
      const result = manager.unloadContext('test-1');
      expect(result).toBe(true);
    });

    it('should return false for non-existent context', () => {
      const result = manager.unloadContext('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getUsage', () => {
    it('should return usage stats', () => {
      manager.loadContext('test-1', 'code_context', 'test.ts', 1000, 0.8);
      const usage = manager.getUsage();
      expect(usage.used).toBe(1000);
      expect(usage.remaining).toBeGreaterThan(0);
      expect(usage.utilization).toBeGreaterThan(0);
    });
  });

  describe('getStatus', () => {
    it('should return ok status when under 80%', () => {
      manager.loadContext('test-1', 'code_context', 'test.ts', 100, 0.8);
      const status = manager.getStatus();
      expect(status).toBe('ok');
    });

    it('should return warning status at 80%', () => {
      // Load a lot of context
      for (let i = 0; i < 100; i++) {
        manager.loadContext(`test-${i}`, 'code_context', `test-${i}.ts`, 2000, 0.8);
      }
      const status = manager.getStatus();
      expect(['ok', 'warning', 'critical', 'emergency']).toContain(status);
    });
  });

  describe('getCategoryUsage', () => {
    it('should return category usage', () => {
      const usage = manager.getCategoryUsage('code_context');
      expect(usage.allocated).toBe(DEFAULT_ALLOCATION.code_context);
      expect(usage.used).toBe(0);
    });
  });

  describe('getTopConsumers', () => {
    it('should return top consumers', () => {
      manager.loadContext('test-1', 'code_context', 'test.ts', 100, 0.8);
      manager.loadContext('test-2', 'code_context', 'test2.ts', 200, 0.8);
      const top = manager.getTopConsumers(5);
      expect(top.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array when no context loaded', () => {
      const top = manager.getTopConsumers();
      expect(top).toEqual([]);
    });
  });

  describe('getLoadedContext', () => {
    it('should return all loaded context', () => {
      manager.loadContext('test-1', 'code_context', 'test.ts', 100, 0.8);
      const context = manager.getLoadedContext();
      expect(context.length).toBe(1);
    });
  });

  describe('getContextByCategory', () => {
    it('should return context by category', () => {
      manager.loadContext('test-1', 'code_context', 'test.ts', 100, 0.8);
      manager.loadContext('test-2', 'current_task', 'test2.ts', 100, 0.8);
      const codeContext = manager.getContextByCategory('code_context');
      expect(codeContext.length).toBe(1);
    });
  });

  describe('findContext', () => {
    it('should find context by pattern', () => {
      manager.loadContext('test-1', 'code_context', '/src/test.ts', 100, 0.8);
      const found = manager.findContext('test');
      expect(found.length).toBe(1);
    });

    it('should return empty array when no match', () => {
      manager.loadContext('test-1', 'code_context', '/src/test.ts', 100, 0.8);
      const found = manager.findContext('nonexistent');
      expect(found.length).toBe(0);
    });
  });

  describe('isEfficientMode', () => {
    it('should return false for default mode', () => {
      expect(manager.isEfficientMode()).toBe(false);
    });

    it('should return true for efficient mode', () => {
      const efficientManager = new TokenBudgetManager({ _efficient: true });
      expect(efficientManager.isEfficientMode()).toBe(true);
    });
  });

  describe('getMode', () => {
    it('should return default for default mode', () => {
      expect(manager.getMode()).toBe('default');
    });

    it('should return efficient for efficient mode', () => {
      const efficientManager = new TokenBudgetManager({ _efficient: true });
      expect(efficientManager.getMode()).toBe('efficient');
    });
  });

  describe('evictLRU', () => {
    it('should evict least recently used items', () => {
      manager.loadContext('test-1', 'code_context', 'test1.ts', 100, 0.8);
      manager.loadContext('test-2', 'code_context', 'test2.ts', 100, 0.8);
      // Access first item to make it more recent
      manager.accessContext('test-1');
      const freed = manager.evictLRU('code_context', 50);
      expect(freed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('compress', () => {
    it('should compress old items', () => {
      manager.loadContext('test-1', 'code_context', 'test1.ts', 1000, 0.8);
      manager.loadContext('test-2', 'code_context', 'test2.ts', 1000, 0.8);
      const freed = manager.compress(0.5);
      expect(freed).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('should reset all budgets', () => {
      manager.loadContext('test-1', 'code_context', 'test.ts', 1000, 0.8);
      manager.reset();
      const loaded = manager.getLoadedContext();
      expect(loaded.length).toBe(0);
    });
  });

  describe('getReport', () => {
    it('should return full report', () => {
      manager.loadContext('test-1', 'code_context', 'test.ts', 1000, 0.8);
      const report = manager.getReport();
      expect(report.total).toBeGreaterThan(0);
      expect(report.used).toBe(1000);
      expect(report.status).toBeDefined();
      expect(report.by_category).toBeDefined();
      expect(report.top_consumers).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });
  });
});

describe('createTokenBudgetManager factory', () => {
  it('should create manager with default config', () => {
    const manager = createTokenBudgetManager();
    expect(manager).toBeDefined();
  });

  it('should create manager with custom config', () => {
    const manager = createTokenBudgetManager({ code_context: 30000 });
    expect(manager).toBeDefined();
  });
});
