/**
 * Error Messages Tests - Dev-Stack v6
 */

import { describe, it, expect } from 'vitest';
import {
  DevStackErrorCode,
  ERROR_MESSAGES,
  ERROR_SEVERITY,
  DevStackError,
  formatErrorMessage,
  createError,
  isDevStackError,
  getRecoverySuggestion,
} from './messages';

describe('Error Messages', () => {
  describe('ERROR_MESSAGES', () => {
    it('should have messages for all error codes', () => {
      Object.values(DevStackErrorCode).forEach(code => {
        expect(ERROR_MESSAGES[code]).toBeDefined();
        expect(typeof ERROR_MESSAGES[code]).toBe('string');
      });
    });

    it('should contain placeholders for variable parts', () => {
      expect(ERROR_MESSAGES[DevStackErrorCode.PROTECTED_PATH_ACCESS]).toContain('{path}');
      expect(ERROR_MESSAGES[DevStackErrorCode.SECRET_DETECTED]).toContain('{type}');
      expect(ERROR_MESSAGES[DevStackErrorCode.TOOL_TIMEOUT]).toContain('{timeout}');
    });
  });

  describe('ERROR_SEVERITY', () => {
    it('should have severity for all error codes', () => {
      Object.values(DevStackErrorCode).forEach(code => {
        expect(ERROR_SEVERITY[code]).toBeDefined();
      });
    });

    it('should classify critical errors correctly', () => {
      expect(ERROR_SEVERITY[DevStackErrorCode.SECRET_DETECTED]).toBe('critical');
    });

    it('should classify high severity errors correctly', () => {
      expect(ERROR_SEVERITY[DevStackErrorCode.PROTECTED_PATH_ACCESS]).toBe('high');
      expect(ERROR_SEVERITY[DevStackErrorCode.DANGEROUS_COMMAND]).toBe('high');
    });

    it('should classify low severity errors correctly', () => {
      expect(ERROR_SEVERITY[DevStackErrorCode.PATTERN_NOT_FOUND]).toBe('low');
      expect(ERROR_SEVERITY[DevStackErrorCode.TOOL_UNAVAILABLE]).toBe('low');
    });
  });

  describe('formatErrorMessage', () => {
    it('should format message with code prefix', () => {
      const message = formatErrorMessage(DevStackErrorCode.PROTECTED_PATH_ACCESS);
      expect(message).toContain('[DS001]');
    });

    it('should replace placeholders with details', () => {
      const message = formatErrorMessage(
        DevStackErrorCode.PROTECTED_PATH_ACCESS,
        { path: '.env' }
      );
      expect(message).toContain('.env');
      expect(message).not.toContain('{path}');
    });

    it('should handle multiple placeholders', () => {
      const message = formatErrorMessage(
        DevStackErrorCode.TOOL_TIMEOUT,
        { toolName: 'serena', timeout: '30000' }
      );
      expect(message).toContain('serena');
      expect(message).toContain('30000');
    });

    it('should work without details', () => {
      const message = formatErrorMessage(DevStackErrorCode.DNA_NOT_FOUND);
      expect(message).toContain('[DS004]');
    });
  });

  describe('DevStackError', () => {
    describe('constructor', () => {
      it('should create error with code and message', () => {
        const error = new DevStackError(DevStackErrorCode.DNA_NOT_FOUND);

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(DevStackError);
        expect(error.code).toBe(DevStackErrorCode.DNA_NOT_FOUND);
      });

      it('should include details in message', () => {
        const error = new DevStackError(
          DevStackErrorCode.PROTECTED_PATH_ACCESS,
          { path: '.env' }
        );

        expect(error.message).toContain('.env');
      });

      it('should set severity', () => {
        const error = new DevStackError(DevStackErrorCode.SECRET_DETECTED);
        expect(error.severity).toBe('critical');
      });

      it('should set timestamp', () => {
        const error = new DevStackError(DevStackErrorCode.DNA_NOT_FOUND);
        expect(error.timestamp).toBeDefined();
        expect(new Date(error.timestamp).toISOString()).toBe(error.timestamp);
      });

      it('should store details', () => {
        const details = { path: '.env', user: 'admin' };
        const error = new DevStackError(
          DevStackErrorCode.PROTECTED_PATH_ACCESS,
          details
        );

        expect(error.details).toEqual(details);
      });

      it('should handle cause error', () => {
        const cause = new Error('Original error');
        const error = new DevStackError(
          DevStackErrorCode.EXECUTION_FAILED,
          {},
          cause
        );

        expect((error as any).cause).toBe(cause);
      });
    });

    describe('recoverable property', () => {
      it('should mark recoverable errors', () => {
        const error = new DevStackError(DevStackErrorCode.DNA_NOT_FOUND);
        expect(error.recoverable).toBe(true);
      });

      it('should mark non-recoverable errors', () => {
        const error = new DevStackError(DevStackErrorCode.SECRET_DETECTED);
        expect(error.recoverable).toBe(false);
      });
    });

    describe('toJSON', () => {
      it('should serialize error to JSON', () => {
        const error = new DevStackError(
          DevStackErrorCode.PROTECTED_PATH_ACCESS,
          { path: '.env' }
        );

        const json = error.toJSON();

        expect(json.name).toBe('DevStackError');
        expect(json.code).toBe(DevStackErrorCode.PROTECTED_PATH_ACCESS);
        expect(json.details).toEqual({ path: '.env' });
      });
    });
  });

  describe('createError', () => {
    it('should create DevStackError', () => {
      const error = createError(DevStackErrorCode.DNA_NOT_FOUND);

      expect(error).toBeInstanceOf(DevStackError);
      expect(error.code).toBe(DevStackErrorCode.DNA_NOT_FOUND);
    });

    it('should pass details', () => {
      const error = createError(
        DevStackErrorCode.PROTECTED_PATH_ACCESS,
        { path: '.env' }
      );

      expect(error.details).toEqual({ path: '.env' });
    });

    it('should pass cause', () => {
      const cause = new Error('Original');
      const error = createError(
        DevStackErrorCode.EXECUTION_FAILED,
        {},
        cause
      );

      expect((error as any).cause).toBe(cause);
    });
  });

  describe('isDevStackError', () => {
    it('should return true for DevStackError', () => {
      const error = new DevStackError(DevStackErrorCode.DNA_NOT_FOUND);
      expect(isDevStackError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');
      expect(isDevStackError(error)).toBe(false);
    });

    it('should return false for non-error objects', () => {
      expect(isDevStackError(null)).toBe(false);
      expect(isDevStackError(undefined)).toBe(false);
      expect(isDevStackError({})).toBe(false);
      expect(isDevStackError('error')).toBe(false);
    });
  });

  describe('getRecoverySuggestion', () => {
    it('should return suggestions for all error codes', () => {
      Object.values(DevStackErrorCode).forEach(code => {
        const suggestions = getRecoverySuggestion(code);
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeGreaterThan(0);
      });
    });

    it('should provide actionable suggestions', () => {
      const suggestions = getRecoverySuggestion(DevStackErrorCode.DNA_NOT_FOUND);
      expect(suggestions.some(s => s.includes('learn') || s.includes('scan'))).toBe(true);
    });

    it('should provide specific suggestions for blocked operations', () => {
      const suggestions = getRecoverySuggestion(DevStackErrorCode.PROTECTED_PATH_ACCESS);
      expect(suggestions.some(s => s.includes('path'))).toBe(true);
    });

    it('should provide specific suggestions for secrets', () => {
      const suggestions = getRecoverySuggestion(DevStackErrorCode.SECRET_DETECTED);
      expect(suggestions.some(s => s.includes('secret'))).toBe(true);
    });
  });

  describe('Error code coverage', () => {
    it('should have DS001-DS020 codes', () => {
      const codes = Object.values(DevStackErrorCode);
      expect(codes).toContain('DS001');
      expect(codes).toContain('DS010');
      expect(codes).toContain('DS020');
    });
  });
});
