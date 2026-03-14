/**
 * Tests for Tool Availability Checker
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ToolAvailabilityChecker } from './tool-checker.js';

describe('ToolAvailabilityChecker', () => {
  let checker: ToolAvailabilityChecker;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), 'tool-checker-test-' + Date.now());
    fs.mkdirSync(tempDir, { recursive: true });
    checker = new ToolAvailabilityChecker(tempDir);
    await checker.refresh();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('refresh', () => {
    it('should refresh tool list', async () => {
      await checker.refresh();
      const tools = checker.getAvailableTools();
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('isAvailable', () => {
    it('should return true for builtin tools', () => {
      expect(checker.isAvailable('Read')).toBe(true);
      expect(checker.isAvailable('Write')).toBe(true);
      expect(checker.isAvailable('Bash')).toBe(true);
    });

    it('should return false for unknown tools', () => {
      expect(checker.isAvailable('UnknownTool123')).toBe(false);
    });
  });

  describe('getToolInfo', () => {
    it('should return tool info for known tools', () => {
      const info = checker.getToolInfo('Read');
      expect(info).toBeDefined();
      expect(info?.source).toBe('builtin');
      expect(info?.available).toBe(true);
    });

    it('should return undefined for unknown tools', () => {
      const info = checker.getToolInfo('UnknownTool123');
      expect(info).toBeUndefined();
    });
  });

  describe('getAvailableTools', () => {
    it('should return all available tools', async () => {
      const tools = checker.getAvailableTools();
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.every(t => t.available)).toBe(true);
    });
  });

  describe('getToolsBySource', () => {
    it('should filter tools by source', async () => {
      const builtinTools = checker.getToolsBySource('builtin');
      expect(builtinTools.length).toBeGreaterThan(0);
      expect(builtinTools.every(t => t.source === 'builtin')).toBe(true);
    });
  });

  describe('getSummary', () => {
    it('should return tool summary', async () => {
      const summary = checker.getSummary();
      expect(summary.total_tools).toBeGreaterThan(0);
      expect(summary.available_tools).toBeGreaterThan(0);
      expect(summary.by_source).toBeDefined();
      expect(summary.mcp_servers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('findTools', () => {
    it('should find tools matching pattern', async () => {
      const tools = checker.findTools('Read');
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', async () => {
      const tools = checker.findTools('NonExistentToolXYZ');
      expect(tools).toEqual([]);
    });
  });

  describe('suggestToolsForCapability', () => {
    it('should suggest tools for known capabilities', async () => {
      const tools = checker.suggestToolsForCapability('file.read');
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown capabilities', async () => {
      const tools = checker.suggestToolsForCapability('unknown.capability');
      expect(tools).toEqual([]);
    });
  });

  describe('getMCPServerInfo', () => {
    it('should return undefined for unknown server', () => {
      const info = checker.getMCPServerInfo('unknown-server');
      expect(info).toBeUndefined();
    });
  });

  describe('getAllMCPServers', () => {
    it('should return array of MCP servers', async () => {
      const servers = checker.getAllMCPServers();
      expect(Array.isArray(servers)).toBe(true);
    });
  });

  describe('checkMCPServerStatus', () => {
    it('should return stopped for unknown server', async () => {
      const status = await checker.checkMCPServerStatus('unknown-server');
      expect(status).toBe('stopped');
    });
  });
});
