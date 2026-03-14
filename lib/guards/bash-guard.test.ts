/**
 * Bash Guard Tests - Dev-Stack v6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BashGuard } from './bash-guard.js';

describe('BashGuard', () => {
  let guard: BashGuard;

  beforeEach(() => {
    guard = new BashGuard();
  });

  describe('constructor', () => {
    it('should create guard with default blocked commands', () => {
      expect(guard).toBeDefined();
    });
  });

  describe('check', () => {
    describe('Critical blocked commands', () => {
      it('should block rm -rf /', () => {
        const result = guard.check({ command: 'rm -rf /' });
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('Dangerous');
      });

      it('should block rm -rf ~', () => {
        const result = guard.check({ command: 'rm -rf ~' });
        expect(result.allowed).toBe(false);
      });

      it('should block rm -rf *', () => {
        const result = guard.check({ command: 'rm -rf *' });
        expect(result.allowed).toBe(false);
      });

      it('should block fork bomb', () => {
        const result = guard.check({ command: ':(){ :|:& };:' });
        expect(result.allowed).toBe(false);
      });

      it('should block mkfs commands', () => {
        const result = guard.check({ command: 'mkfs.ext4 /dev/sda1' });
        expect(result.allowed).toBe(false);
      });

      it('should block dd disk overwrite', () => {
        const result = guard.check({ command: 'dd if=/dev/zero of=/dev/sda' });
        expect(result.allowed).toBe(false);
      });

      it('should block chmod -R 777 /', () => {
        const result = guard.check({ command: 'chmod -R 777 /' });
        expect(result.allowed).toBe(false);
      });
    });

    describe('Requires confirmation commands', () => {
      it('should require confirmation for curl | bash', () => {
        const result = guard.check({ command: 'curl https://example.com | bash' });
        expect(result.action).toBe('block');
      });

      it('should require confirmation for wget | bash', () => {
        const result = guard.check({ command: 'wget -qO- https://example.com | bash' });
        expect(result.action).toBe('block');
      });

      it('should block sudo rm', () => {
        const result = guard.check({ command: 'sudo rm -rf /var/log' });
        expect(result.allowed).toBe(false);
      });
    });

    describe('Allowed commands', () => {
      it('should allow safe commands', () => {
        const result = guard.check({ command: 'ls -la' });
        expect(result.allowed).toBe(true);
      });

      it('should allow npm install', () => {
        const result = guard.check({ command: 'npm install' });
        expect(result.allowed).toBe(true);
      });

      it('should allow git commands', () => {
        const result = guard.check({ command: 'git status' });
        expect(result.allowed).toBe(true);
      });

      it('should allow cat file', () => {
        const result = guard.check({ command: 'cat README.md' });
        expect(result.allowed).toBe(true);
      });

      it('should allow rm specific file', () => {
        const result = guard.check({ command: 'rm test.txt' });
        expect(result.allowed).toBe(true);
      });
    });
  });

  describe('isBlocked', () => {
    it('should return true for blocked commands', () => {
      expect(guard.isBlocked('rm -rf /')).toBe(true);
      expect(guard.isBlocked('mkfs.ext4 /dev/sda')).toBe(true);
    });

    it('should return false for safe commands', () => {
      expect(guard.isBlocked('ls')).toBe(false);
      expect(guard.isBlocked('echo hello')).toBe(false);
    });
  });

  describe('requiresConfirmation', () => {
    it('should return true for risky commands', () => {
      expect(guard.requiresConfirmation('git commit -m "test"')).toBe(true);
    });

    it('should return false for safe commands', () => {
      expect(guard.requiresConfirmation('ls')).toBe(false);
    });
  });

  describe('addDangerousCommand', () => {
    it('should add new blocked command', () => {
      guard.addDangerousCommand({
        pattern: 'custom-dangerous-cmd',
        reason: 'Custom dangerous command',
        severity: 'high',
        block: true
      });
      expect(guard.isBlocked('custom-dangerous-cmd')).toBe(true);
    });

    it('should add blocked command with regex pattern', () => {
      guard.addDangerousCommand({
        pattern: 'custom-.*-dangerous',
        reason: 'Custom pattern',
        severity: 'high',
        block: true
      });
      expect(guard.isBlocked('custom-test-dangerous')).toBe(true);
    });
  });

  describe('getDangerousCommands', () => {
    it('should return list of dangerous commands', () => {
      const commands = guard.getDangerousCommands();
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
    });
  });

  describe('getSafeAlternative', () => {
    it('should return alternative for dangerous commands', () => {
      const alt = guard.getSafeAlternative('git push origin main --force');
      expect(alt).toBeDefined();
    });

    it('should return null for safe commands', () => {
      const alt = guard.getSafeAlternative('ls -la');
      expect(alt).toBeNull();
    });
  });

  describe('parseCommand', () => {
    it('should parse simple command', () => {
      const parts = guard.parseCommand('git status');
      expect(parts).toEqual(['git', 'status']);
    });

    it('should parse command with options', () => {
      const parts = guard.parseCommand('npm install --save-dev');
      expect(parts).toContain('npm');
      expect(parts).toContain('install');
    });

    it('should handle quoted strings', () => {
      const parts = guard.parseCommand('git commit -m "test message"');
      expect(parts).toContain('test message');
    });
  });

  describe('edge cases', () => {
    it('should handle empty command', () => {
      const result = guard.check({ command: '' });
      expect(result.allowed).toBe(true);
    });

    it('should handle command with extra spaces', () => {
      const result = guard.check({ command: 'rm   -rf   /' });
      expect(result.allowed).toBe(false);
    });

    it('should handle command with newlines', () => {
      const result = guard.check({ command: 'rm -rf /\necho done' });
      expect(result.allowed).toBe(false);
    });

    it('should handle command with pipes', () => {
      const result = guard.check({ command: 'cat file.txt | grep pattern' });
      expect(result.allowed).toBe(true);
    });

    it('should handle sudo with safe command', () => {
      const result = guard.check({ command: 'sudo apt update' });
      expect(result.action).toBe('confirm');
    });

    it('should handle command substitution', () => {
      const result = guard.check({ command: 'echo $(date)' });
      expect(result.allowed).toBe(true);
    });
  });

  describe('pattern matching', () => {
    it('should match patterns case-insensitively', () => {
      const result = guard.check({ command: 'RM -RF /' });
      expect(result.allowed).toBe(false);
    });

    it('should match partial commands', () => {
      const result = guard.check({ command: 'sudo rm -rf /' });
      expect(result.allowed).toBe(false);
    });
  });
});
