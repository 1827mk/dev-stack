/**
 * Tests for Audit Logger
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { AuditLogger, auditLogger } from './logger.js';
import type { AuditFilter } from './types.js';

describe('AuditLogger', () => {
  let logger: AuditLogger;
  const testLogPath = '.dev-stack/test-logs/audit-test.jsonl';

  beforeEach(() => {
    // Clean up test log file before each test
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath);
    }
    // Ensure directory exists
    const dir = path.dirname(testLogPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    logger = new AuditLogger({
      enabled: true,
      log_path: testLogPath,
      max_file_size_mb: 100,
      retention_days: 30,
      flush_interval_ms: 1000
    });
  });

  afterEach(async () => {
    await logger.close();
    // Clean up test log file after each test
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath);
    }
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      const defaultLogger = new AuditLogger();
      expect(defaultLogger).toBeDefined();
    });

    it('should create instance with custom config', () => {
      const customLogger = new AuditLogger({
        enabled: false,
        log_path: '.dev-stack/custom-audit.jsonl',
        max_file_size_mb: 50,
        retention_days: 7,
        flush_interval_ms: 500
      });
      expect(customLogger).toBeDefined();
    });
  });

  describe('log', () => {
    it('should log audit entry', async () => {
      const entry = {
        tool: 'Bash',
        action: 'execute',
        target: '/tmp/test',
        result: 'success' as const,
        rollback_available: false,
        duration_ms: 100
      };

      await logger.log(entry);
      await logger.flush(); // Flush buffer to disk

      // Verify log was written
      expect(fs.existsSync(testLogPath)).toBe(true);
      const content = fs.readFileSync(testLogPath, 'utf-8');
      expect(content).toContain('Bash');
      expect(content).toContain('/tmp/test');
    });

    it('should not log when disabled', async () => {
      const disabledLogger = new AuditLogger({
        enabled: false,
        log_path: testLogPath,
        max_file_size_mb: 100,
        retention_days: 30,
        flush_interval_ms: 1000
      });

      const entry = {
        tool: 'Bash',
        action: 'execute',
        target: '/tmp/test',
        result: 'success' as const,
        rollback_available: false,
        duration_ms: 100
      };

      await disabledLogger.log(entry);
      await disabledLogger.close();

      // Verify log was not written
      expect(fs.existsSync(testLogPath)).toBe(false);
    });
  });

  describe('query', () => {
    it('should query audit entries', async () => {
      // Add some test entries
      const entry1 = {
        tool: 'Bash',
        action: 'execute',
        target: '/tmp/test1',
        result: 'success' as const,
        rollback_available: false,
        duration_ms: 100
      };

      const entry2 = {
        tool: 'Write',
        action: 'write_file',
        target: '/tmp/test2.txt',
        result: 'blocked' as const,
        rollback_available: false,
        guard: 'scope' as const,
        reason: 'Protected path'
      };

      await logger.log(entry1);
      await logger.log(entry2);

      // Query all entries
      const filter: AuditFilter = {};
      const results = await logger.query(filter);

      expect(results.entries).toHaveLength(2);
      expect(results.total_count).toBe(2);
    });

    it('should query with session filter', async () => {
      // Add some test entries
      const entry1 = {
        tool: 'Bash',
        action: 'execute',
        target: '/tmp/test1',
        result: 'success' as const,
        rollback_available: false,
        duration_ms: 100
      };

      const entry2 = {
        tool: 'Bash',
        action: 'execute',
        target: '/tmp/test2',
        result: 'success' as const,
        rollback_available: false,
        duration_ms: 50
      };

      await logger.log(entry1);
      await logger.log(entry2);

      // Query with filter
      const filter: AuditFilter = {
        session_id: logger['sessionId']
      };
      const results = await logger.query(filter);

      expect(results.entries.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getSessionSummary', () => {
    it('should return session summary', async () => {
      // Add some test entries
      const entry1 = {
        tool: 'Bash',
        action: 'execute',
        target: '/tmp/test1',
        result: 'success' as const,
        rollback_available: false,
        duration_ms: 100
      };

      const entry2 = {
        tool: 'Write',
        action: 'write_file',
        target: '/protected/file.txt',
        result: 'blocked' as const,
        rollback_available: false,
        guard: 'scope' as const,
        reason: 'Protected path'
      };

      await logger.log(entry1);
      await logger.log(entry2);
      await logger.flush(); // Ensure entries are written

      const summary = await logger.getSessionSummary();

      expect(summary.total_actions).toBe(2);
      expect(summary.successful_actions).toBe(1);
      expect(summary.blocked_actions).toBe(1);
    });
  });

  describe('export', () => {
    it('should export to JSON format', async () => {
      const entry = {
        tool: 'Bash',
        action: 'execute',
        target: '/tmp/test',
        result: 'success' as const,
        rollback_available: false,
        duration_ms: 100
      };

      await logger.log(entry);

      const exported = await logger.export({ format: 'json' });
      expect(exported).toContain('Bash');
      expect(exported).toContain('/tmp/test');
    });

    it('should export to CSV format', async () => {
      const entry = {
        tool: 'Bash',
        action: 'execute',
        target: '/tmp/test',
        result: 'success' as const,
        rollback_available: false,
        duration_ms: 100
      };

      await logger.log(entry);

      const exported = await logger.export({ format: 'csv' });
      expect(exported).toContain('Bash');
      expect(exported).toContain('/tmp/test');
    });
  });

  describe('close', () => {
    it('should close logger gracefully', async () => {
      const entry = {
        tool: 'Bash',
        action: 'execute',
        target: '/tmp/test',
        result: 'success' as const,
        rollback_available: false,
        duration_ms: 100
      };

      await logger.log(entry);
      await logger.close();

      // Verify log was written
      expect(fs.existsSync(testLogPath)).toBe(true);
    });
  });
});

describe('auditLogger instance', () => {
  it('should export singleton instance', () => {
    expect(auditLogger).toBeDefined();
    expect(auditLogger).toBeInstanceOf(AuditLogger);
  });
});
