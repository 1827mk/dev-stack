/**
 * Secret Scanner Tests - Dev-Stack v6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SecretScanner } from './secret-scanner.js';

describe('SecretScanner', () => {
  let scanner: SecretScanner;

  beforeEach(() => {
    scanner = new SecretScanner();
  });

  describe('constructor', () => {
    it('should create scanner with default patterns', () => {
      expect(scanner).toBeDefined();
    });
  });

  describe('scan', () => {
    describe('API Keys', () => {
      it('should detect generic API keys', () => {
        const content = 'api_key=abc123def456ghi789jkl012mno345';
        const result = scanner.scan(content);

        expect(result.found).toBe(true);
      });

      it('should detect AWS access keys', () => {
        const content = 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE';
        const result = scanner.scan(content);

        expect(result.found).toBe(true);
        expect(result.secrets.some(s => s.pattern_name === 'aws_access_key')).toBe(true);
      });

      it('should detect GitHub tokens', () => {
        const content = 'token=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
        const result = scanner.scan(content);

        expect(result.found).toBe(true);
      });
    });

    describe('Passwords', () => {
      it('should detect password assignments', () => {
        const content = 'password=mysecretpassword123';
        const result = scanner.scan(content);

        expect(result.found).toBe(true);
      });

      it('should detect passwd assignments', () => {
        const content = 'passwd=admin123password';
        const result = scanner.scan(content);

        expect(result.found).toBe(true);
      });
    });

    describe('Tokens', () => {
      it('should detect JWT tokens', () => {
        const content = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const result = scanner.scan(content);

        expect(result.found).toBe(true);
      });
    });

    describe('Private Keys', () => {
      it('should detect RSA private keys', () => {
        const content = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy0AHB7Lso
-----END RSA PRIVATE KEY-----`;
        const result = scanner.scan(content);

        expect(result.found).toBe(true);
        expect(result.secrets.some(s => s.pattern_name === 'private_key_marker')).toBe(true);
      });

      it('should detect generic private keys', () => {
        const content = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7
-----END PRIVATE KEY-----`;
        const result = scanner.scan(content);

        expect(result.found).toBe(true);
      });
    });

    describe('Clean content', () => {
      it('should return no secrets for clean content', () => {
        const content = 'const message = "Hello, World!";';
        const result = scanner.scan(content);

        expect(result.found).toBe(false);
        expect(result.secrets).toEqual([]);
      });

      it('should allow variable names with "key" in them', () => {
        const content = 'const keyboard = "QWERTY";';
        const result = scanner.scan(content);

        // This should not be detected as a secret
        expect(result.found).toBe(false);
      });
    });
  });

  describe('hasSecrets', () => {
    it('should return true when secrets are present', () => {
      const content = 'password=secret123';
      expect(scanner.hasSecrets(content)).toBe(true);
    });

    it('should return false for clean content', () => {
      const content = 'const message = "Hello";';
      expect(scanner.hasSecrets(content)).toBe(false);
    });
  });

  describe('maskSecrets', () => {
    it('should mask detected secrets', () => {
      const content = 'password=mysecretpassword123';
      const masked = scanner.maskSecrets(content);

      expect(masked).not.toContain('mysecretpassword123');
    });

    it('should mask multiple secrets', () => {
      const content = `
        api_key=abc123def456ghi789jkl012mno345
        password=secret123password
      `;
      const masked = scanner.maskSecrets(content);

      expect(masked).not.toContain('abc123def456ghi789jkl012mno345');
      expect(masked).not.toContain('secret123password');
    });

    it('should leave clean content unchanged', () => {
      const content = 'const message = "Hello, World!";';
      const masked = scanner.maskSecrets(content);

      expect(masked).toBe(content);
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const result = scanner.scan('');
      expect(result.found).toBe(false);
    });

    it('should handle very long content', () => {
      const content = 'x'.repeat(100000) + 'password=secretpassword123';
      const result = scanner.scan(content);
      expect(result.found).toBe(true);
    });

    it('should handle multi-line content', () => {
      const content = `
        const config = {
          password: "dbpassword123"
        };
      `;
      const result = scanner.scan(content);
      expect(result.found).toBe(true);
    });
  });

  describe('test file handling', () => {
    it('should skip test files by default', () => {
      const content = 'password=secret123';
      const result = scanner.scan(content, 'test.spec.ts');
      expect(result.found).toBe(false);
    });

    it('should scan test files when allowed', () => {
      const testScanner = new SecretScanner({ allowed_in_tests: true });
      const content = 'password=secret123';
      const result = testScanner.scan(content, 'test.spec.ts');
      expect(result.found).toBe(true);
    });
  });
});
