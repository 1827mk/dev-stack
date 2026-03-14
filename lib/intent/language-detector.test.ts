/**
 * Language Detector Tests - Dev-Stack v6
 */

import { describe, it, expect } from 'vitest';
import {
  detectLanguage,
  containsThai,
  containsEnglish,
  getLanguageName,
  getLanguageEmoji
} from './language-detector.js';

describe('Language Detector', () => {
  describe('detectLanguage', () => {
    describe('Thai detection', () => {
      it('should detect Thai text', () => {
        const result = detectLanguage('สวัสดีครับ');
        expect(result.primary_language).toBe('thai');
        expect(result.confidence).toBeGreaterThan(0.8);
      });

      it('should detect Thai with English numbers', () => {
        const result = detectLanguage('โหลดไฟล์ 123 ครั้ง');
        expect(result.primary_language).toBe('thai');
      });

      it('should detect Thai technical terms', () => {
        const result = detectLanguage('แก้ไข้ error ในระบบ authentication');
        expect(result.primary_language).toBe('mixed');
      });
    });

    describe('English detection', () => {
      it('should detect English text', () => {
        const result = detectLanguage('Hello, World!');
        expect(result.primary_language).toBe('english');
        expect(result.confidence).toBeGreaterThan(0.8);
      });

      it('should detect English technical text', () => {
        const result = detectLanguage('Read the file and parse the JSON');
        expect(result.primary_language).toBe('english');
      });
    });

    describe('Mixed detection', () => {
      it('should detect mixed Thai-English', () => {
        const result = detectLanguage('Fix bug ในหน้า login');
        expect(result.primary_language).toBe('mixed');
        expect(result.stats.thai_chars).toBeGreaterThan(0);
        expect(result.stats.english_chars).toBeGreaterThan(0);
      });

      it('should detect code with Thai comments', () => {
        // Code detection requires 3+ code patterns to match
        const result = detectLanguage(`// สร้าง function
const fn = () => {};
let x = 1;
export default fn;`);
        expect(result.primary_language).toBe('code');
      });
    });

    describe('Code detection', () => {
      it('should detect code-heavy input', () => {
        // Code detection requires 3+ code patterns to match
        const result = detectLanguage(`function test() {
  const x = 1;
  let y = 2;
  return x + y;
}
export default test;`);
        expect(result.primary_language).toBe('code');
      });

      it('should detect emoji-only input', () => {
        const result = detectLanguage('🔥🚀🎉');
        // Emoji-only should be classified as english (default for non-matching chars)
        // or could be 'empty' depending on implementation
        expect(['english', 'empty']).toContain(result.primary_language);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty input', () => {
        const result = detectLanguage('');
        expect(result.primary_language).toBe('empty');
      });

      it('should handle whitespace-only input', () => {
        const result = detectLanguage('   \n\t  ');
        expect(result.primary_language).toBe('empty');
      });

      it('should handle numbers only', () => {
        const result = detectLanguage('123 456 789');
        // Numbers only should default to english or could be considered code
        expect(['english', 'code']).toContain(result.primary_language);
      });
    });
  });

  describe('containsThai', () => {
    it('should return true for Thai text', () => {
      expect(containsThai('สวัสดี')).toBe(true);
    });

    it('should return false for English text', () => {
      expect(containsThai('Hello')).toBe(false);
    });

    it('should return true for mixed text with Thai', () => {
      expect(containsThai('Hello สวัสดี')).toBe(true);
    });
  });

  describe('containsEnglish', () => {
    it('should return true for English text', () => {
      expect(containsEnglish('Hello')).toBe(true);
    });

    it('should return false for Thai text', () => {
      expect(containsEnglish('สวัสดี')).toBe(false);
    });

    it('should return true for mixed text with English', () => {
      expect(containsEnglish('Hello สวัสดี')).toBe(true);
    });
  });

  describe('getLanguageName', () => {
    it('should return Thai name for Thai', () => {
      expect(getLanguageName('thai')).toBe('ภาษาไทย');
    });

    it('should return English name for English', () => {
      expect(getLanguageName('english')).toBe('English');
    });

    it('should return name for mixed', () => {
      expect(getLanguageName('mixed')).toBe('Thai/English Mixed');
    });

    it('should return name for code', () => {
      expect(getLanguageName('code')).toBe('Code');
    });
  });

  describe('getLanguageEmoji', () => {
    it('should return Thai flag for Thai', () => {
      expect(getLanguageEmoji('thai')).toBe('🇹🇭');
    });

    it('should return UK flag for English', () => {
      expect(getLanguageEmoji('english')).toBe('🇬🇧');
    });

    it('should return globe for mixed', () => {
      expect(getLanguageEmoji('mixed')).toBe('🌐');
    });

    it('should return computer for code', () => {
      expect(getLanguageEmoji('code')).toBe('💻');
    });
  });
});
