/**
 * Tests for Capability Loader
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CapabilityLoader } from './capability-loader.js';
import type { CapabilityRegistry } from './capability-loader.js';

describe('CapabilityLoader', () => {
  let loader: CapabilityLoader;

  beforeEach(() => {
    loader = new CapabilityLoader(['Read', 'Write', 'Bash']);
  });

  describe('Constructor', () => {
    it('should create instance with available tools', () => {
      expect(loader).toBeDefined();
    });

    it('should create instance with empty tools', () => {
      const emptyLoader = new CapabilityLoader();
      expect(emptyLoader).toBeDefined();
    });
  });

  describe('loadFromObject', () => {
    it('should load registry from object', () => {
      const config: CapabilityRegistry = {
        version: '1.0',
        capabilities: {
          readFile: {
            primary: 'Read',
            fallback: null,
            description: 'Read files',
            timeout_s: 30000,
            requires_guard: false
          }
        }
      };
      loader.loadFromObject(config);
      const cap = loader.getCapability('readFile');
      expect(cap).toBeDefined();
      expect(cap?.available).toBe(true);
    });

    it('should handle fallback tools', () => {
      const fallbackLoader = new CapabilityLoader(['Read', 'Write']);
      const config: CapabilityRegistry = {
        version: '1.0',
        capabilities: {
          files: {
            primary: 'Read',
            fallback: 'Write',
            description: 'File operations',
            timeout_s: 30000,
            requires_guard: false
          }
        }
      };
      fallbackLoader.loadFromObject(config);
      const cap = fallbackLoader.getCapability('files');
      expect(cap?.primary_available).toBe(true);
      expect(cap?.fallback_available).toBe(true);
    });

    it('should detect unavailable tools', () => {
      const config: CapabilityRegistry = {
        version: '1.0',
        capabilities: {
          special: {
            primary: 'NonExistentTool',
            fallback: null,
            description: 'Special tool',
            timeout_s: 30000,
            requires_guard: false
          }
        }
      };
      loader.loadFromObject(config);
      const cap = loader.getCapability('special');
      expect(cap?.available).toBe(false);
      expect(cap?.primary_available).toBe(false);
    });
  });

  describe('getCapability', () => {
    it('should return capability by name', () => {
      const config: CapabilityRegistry = {
        version: '1.0',
        capabilities: {
          bash: {
            primary: 'Bash',
            fallback: null,
            description: 'Execute bash commands',
            timeout_s: 60000,
            requires_guard: true
          }
        }
      };
      loader.loadFromObject(config);
      const cap = loader.getCapability('bash');
      expect(cap).toBeDefined();
      expect(cap?.name).toBe('bash');
    });

    it('should return undefined for unknown capability', () => {
      const cap = loader.getCapability('unknown');
      expect(cap).toBeUndefined();
    });
  });

  describe('getToolForCapability', () => {
    it('should return primary tool when available', () => {
      const config: CapabilityRegistry = {
        version: '1.0',
        capabilities: {
          files: {
            primary: 'Read',
            fallback: 'Glob',
            description: 'File operations',
            timeout_s: 30000,
            requires_guard: false
          }
        }
      };
      loader.loadFromObject(config);
      const tool = loader.getToolForCapability('files');
      expect(tool).toBe('Read');
    });

    it('should return fallback when primary unavailable', () => {
      const fallbackLoader = new CapabilityLoader(['Glob']);
      const config: CapabilityRegistry = {
        version: '1.0',
        capabilities: {
          files: {
            primary: 'NonExistent',
            fallback: 'Glob',
            description: 'File operations',
            timeout_s: 30000,
            requires_guard: false
          }
        }
      };
      fallbackLoader.loadFromObject(config);
      const tool = fallbackLoader.getToolForCapability('files');
      expect(tool).toBe('Glob');
    });

    it('should return null when no tool available', () => {
      const config: CapabilityRegistry = {
        version: '1.0',
        capabilities: {
          files: {
            primary: 'NonExistent1',
            fallback: 'NonExistent2',
            description: 'File operations',
            timeout_s: 30000,
            requires_guard: false
          }
        }
      };
      loader.loadFromObject(config);
      const tool = loader.getToolForCapability('files');
      expect(tool).toBeNull();
    });

    it('should return null for unknown capability', () => {
      const tool = loader.getToolForCapability('unknown');
      expect(tool).toBeNull();
    });
  });

  describe('setAvailableTools', () => {
    it('should update available tools', () => {
      const config: CapabilityRegistry = {
        version: '1.0',
        capabilities: {
          files: {
            primary: 'NewTool',
            fallback: null,
            description: 'File operations',
            timeout_s: 30000,
            requires_guard: false
          }
        }
      };
      loader.loadFromObject(config);
      expect(loader.getCapability('files')?.available).toBe(false);

      loader.setAvailableTools(['NewTool']);
      expect(loader.getCapability('files')?.available).toBe(true);
    });
  });

  describe('getAllCapabilities', () => {
    it('should return all loaded capabilities', () => {
      const config: CapabilityRegistry = {
        version: '1.0',
        capabilities: {
          read: {
            primary: 'Read',
            fallback: null,
            description: 'Read files',
            timeout_s: 30000,
            requires_guard: false
          },
          write: {
            primary: 'Write',
            fallback: null,
            description: 'Write files',
            timeout_s: 30000,
            requires_guard: false
          }
        }
      };
      loader.loadFromObject(config);
      const all = loader.getAllCapabilities();
      expect(all.length).toBe(2);
    });

    it('should return empty array when no capabilities loaded', () => {
      const all = loader.getAllCapabilities();
      expect(all).toEqual([]);
    });
  });

  describe('pattern matching', () => {
    it('should match wildcard tool patterns', () => {
      const patternLoader = new CapabilityLoader(['serena:find_symbol', 'serena:search']);
      const config: CapabilityRegistry = {
        version: '1.0',
        capabilities: {
          symbols: {
            primary: 'serena:*',
            fallback: null,
            description: 'Symbol operations',
            timeout_s: 30000,
            requires_guard: false
          }
        }
      };
      patternLoader.loadFromObject(config);
      const cap = patternLoader.getCapability('symbols');
      expect(cap?.available).toBe(true);
      expect(cap?.primary_available).toBe(true);
    });
  });
});
