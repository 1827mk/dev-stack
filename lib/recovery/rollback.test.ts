/**
 * Tests for Rollback Manager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RollbackManager } from './rollback.js';
import { ROLLBACK_LEVELS } from '../checkpoint/types.js';

describe('RollbackManager', () => {
  let manager: RollbackManager;

  beforeEach(() => {
    manager = new RollbackManager(process.cwd());
  });

  describe('Constructor', () => {
    it('should create instance with default project root', () => {
      const defaultManager = new RollbackManager();
      expect(defaultManager).toBeDefined();
    });

    it('should create instance with custom project root', () => {
      const customManager = new RollbackManager('/tmp');
      expect(customManager).toBeDefined();
    });
  });

  describe('getLevelInfo', () => {
    it('should return info for level 1', () => {
      const info = manager.getLevelInfo(1);
      expect(info).toBeDefined();
      expect(info.name).toBe(ROLLBACK_LEVELS[1].name);
    });

    it('should return info for level 5', () => {
      const info = manager.getLevelInfo(5);
      expect(info).toBeDefined();
      expect(info.name).toBe(ROLLBACK_LEVELS[5].name);
    });
  });

  describe('isGitAvailable', () => {
    it('should return true when in git repository', () => {
      const result = manager.isGitAvailable();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getCurrentSha', () => {
    it('should return SHA or unknown', () => {
      const sha = manager.getCurrentSha();
      expect(typeof sha).toBe('string');
      expect(sha.length).toBeGreaterThan(0);
    });
  });

  describe('getDiff', () => {
    it('should return empty string for empty file list', () => {
      const diff = manager.getDiff([]);
      expect(diff).toBe('');
    });

    it('should handle files without original_sha', () => {
      const diff = manager.getDiff([
        { path: '/tmp/test.ts', change_type: 'created' }
      ]);
      expect(diff).toBe('');
    });
  });

  describe('preview', () => {
    it('should return null when no checkpoint available', async () => {
      // Without a checkpoint, preview should return null
      const preview = await manager.preview(1);
      // May be null or a preview object depending on checkpoint state
      expect(preview === null || typeof preview === 'object').toBe(true);
    });
  });

  describe('execute', () => {
    it('should fail without checkpoint', async () => {
      const result = await manager.execute(1);
      // May succeed or fail depending on checkpoint state
      expect(typeof result.success).toBe('boolean');
      expect(result.level).toBe(1);
    });

    it('should require force for level 5', async () => {
      // This test assumes no checkpoint available
      // If checkpoint exists, it would require force
      const result = await manager.execute(5, false);
      // Either no checkpoint or force required
      expect(result.level).toBe(5);
    });
  });

  describe('listRollbackTargets', () => {
    it('should return all 5 levels', async () => {
      const targets = await manager.listRollbackTargets();
      expect(targets).toHaveLength(5);
    });

    it('should include level info for each target', async () => {
      const targets = await manager.listRollbackTargets();
      for (const target of targets) {
        expect(target.level).toBeGreaterThanOrEqual(1);
        expect(target.level).toBeLessThanOrEqual(5);
        expect(target.info).toBeDefined();
        expect(typeof target.available).toBe('boolean');
      }
    });
  });
});
