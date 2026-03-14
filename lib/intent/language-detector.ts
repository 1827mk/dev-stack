/**
 * Language Detector - Dev-Stack v6
 * Detects Thai, English, and mixed language input
 */

/**
 * Language type
 */
export type LanguageType = 'thai' | 'english' | 'mixed' | 'code' | 'empty';

/**
 * Language detection result
 */
export interface LanguageDetectionResult {
  primary_language: LanguageType;
  confidence: number; // 0.0-1.0
  segments: LanguageSegment[];
  stats: {
    thai_chars: number;
    english_chars: number;
    code_chars: number;
    total_chars: number;
    thai_ratio: number;
    english_ratio: number;
    code_ratio: number;
  };
}

/**
 * Language segment
 */
export interface LanguageSegment {
  text: string;
  language: LanguageType;
  start: number;
  end: number;
}

/**
 * Unicode ranges for Thai characters
 */
const THAI_UNICODE_RANGE = {
  start: 0x0E00, // Thai start
  end: 0x0E7F    // Thai end
};

/**
 * Check if character is Thai
 */
function isThaiChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= THAI_UNICODE_RANGE.start && code <= THAI_UNICODE_RANGE.end;
}

/**
 * Check if character is English/Latin
 */
function isEnglishChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) ||   // A-Z
         (code >= 97 && code <= 122);    // a-z
}

/**
 * Check if character is code-related
 */
function isCodeChar(char: string): boolean {
  return /[{}[\]();:.,<>=!@#$%^&*+\-/\\|]/.test(char);
}

/**
 * Check if text is primarily code
 */
function isCodeText(text: string): boolean {
  const codeIndicators = [
    /function\s*\(/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /var\s+\w+\s*=/,
    /import\s+.*from/,
    /export\s+(default\s+)?/,
    /class\s+\w+/,
    /interface\s+\w+/,
    /type\s+\w+\s*=/,
    /=>\s*{/,
    /\)\s*{/,
    /}\s*\)/,
    /\.\w+\(/,
    /\w+\.\w+/,
    /``/,
    /\${/,
    /<\w+>/
  ];

  let codeMatches = 0;
  for (const pattern of codeIndicators) {
    if (pattern.test(text)) {
      codeMatches++;
    }
  }

  // If more than 3 code patterns match, it's likely code
  return codeMatches >= 3;
}

/**
 * Segment text by language
 */
function segmentByText(text: string): LanguageSegment[] {
  const segments: LanguageSegment[] = [];
  let currentSegment: LanguageSegment | null = null;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      if (currentSegment) {
        currentSegment.text += char;
        currentSegment.end = i;
      }
      continue;
    }

    let charLanguage: LanguageType;

    if (isThaiChar(char)) {
      charLanguage = 'thai';
    } else if (isEnglishChar(char)) {
      charLanguage = 'english';
    } else if (isCodeChar(char)) {
      charLanguage = 'code';
    } else {
      charLanguage = 'english'; // Default to english for other chars
    }

    // Start new segment if language changed
    if (!currentSegment || currentSegment.language !== charLanguage) {
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = {
        text: char,
        language: charLanguage,
        start: i,
        end: i
      };
    } else {
      currentSegment.text += char;
      currentSegment.end = i;
    }
  }

  // Push last segment
  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

/**
 * Detect language of input text
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  // Handle empty input
  if (!text || text.trim().length === 0) {
    return {
      primary_language: 'empty',
      confidence: 1.0,
      segments: [],
      stats: {
        thai_chars: 0,
        english_chars: 0,
        code_chars: 0,
        total_chars: 0,
        thai_ratio: 0,
        english_ratio: 0,
        code_ratio: 0
      }
    };
  }

  // Check if primarily code
  if (isCodeText(text)) {
    return {
      primary_language: 'code',
      confidence: 0.9,
      segments: segmentByText(text),
      stats: {
        thai_chars: 0,
        english_chars: 0,
        code_chars: text.length,
        total_chars: text.length,
        thai_ratio: 0,
        english_ratio: 0,
        code_ratio: 1
      }
    };
  }

  // Count characters by type
  let thaiChars = 0;
  let englishChars = 0;
  let codeChars = 0;
  let totalChars = 0;

  for (const char of text) {
    if (/\s/.test(char)) continue; // Skip whitespace

    totalChars++;

    if (isThaiChar(char)) {
      thaiChars++;
    } else if (isEnglishChar(char)) {
      englishChars++;
    } else if (isCodeChar(char)) {
      codeChars++;
    } else {
      // Other characters count as english
      englishChars++;
    }
  }

  // Calculate ratios
  const thaiRatio = totalChars > 0 ? thaiChars / totalChars : 0;
  const englishRatio = totalChars > 0 ? englishChars / totalChars : 0;
  const codeRatio = totalChars > 0 ? codeChars / totalChars : 0;

  // Determine primary language
  let primaryLanguage: LanguageType;
  let confidence: number;

  // Mixed detection thresholds
  const MIXED_THRESHOLD = 0.2; // If both languages > 20%, it's mixed

  if (thaiRatio > MIXED_THRESHOLD && englishRatio > MIXED_THRESHOLD) {
    primaryLanguage = 'mixed';
    confidence = 0.9;
  } else if (thaiRatio > englishRatio) {
    primaryLanguage = 'thai';
    confidence = thaiRatio;
  } else {
    primaryLanguage = 'english';
    confidence = englishRatio;
  }

  // Adjust confidence if code ratio is high
  if (codeRatio > 0.3) {
    // If there's significant code, reduce confidence in language detection
    confidence *= (1 - codeRatio * 0.5);
  }

  // Segment the text
  const segments = segmentByText(text);

  return {
    primary_language: primaryLanguage,
    confidence: Math.min(1.0, Math.max(0.0, confidence)),
    segments,
    stats: {
      thai_chars: thaiChars,
      english_chars: englishChars,
      code_chars: codeChars,
      total_chars: totalChars,
      thai_ratio: thaiRatio,
      english_ratio: englishRatio,
      code_ratio: codeRatio
    }
  };
}

/**
 * Check if text contains Thai
 */
export function containsThai(text: string): boolean {
  for (const char of text) {
    if (isThaiChar(char)) return true;
  }
  return false;
}

/**
 * Check if text contains English
 */
export function containsEnglish(text: string): boolean {
  for (const char of text) {
    if (isEnglishChar(char)) return true;
  }
  return false;
}

/**
 * Get language name for display
 */
export function getLanguageName(language: LanguageType): string {
  const names: Record<LanguageType, string> = {
    thai: 'ภาษาไทย',
    english: 'English',
    mixed: 'Thai/English Mixed',
    code: 'Code',
    empty: 'Empty'
  };
  return names[language];
}

/**
 * Get language emoji
 */
export function getLanguageEmoji(language: LanguageType): string {
  const emojis: Record<LanguageType, string> = {
    thai: '🇹🇭',
    english: '🇬🇧',
    mixed: '🌐',
    code: '💻',
    empty: '❓'
  };
  return emojis[language];
}

/**
 * Export singleton detector function
 */
export const languageDetector = {
  detect: detectLanguage,
  containsThai,
  containsEnglish,
  getLanguageName,
  getLanguageEmoji
};
