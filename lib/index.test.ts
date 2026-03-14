/**
 * Tests for lib/index.ts - Main Entry Point
 * Ensures all exports are properly defined and accessible
 */

import { describe, it, expect } from 'vitest';

// Guards
import {
  BashGuard,
  bashGuard,
  ScopeGuard,
  scopeGuard,
  SecretScanner,
  secretScanner,
  RiskAssessor,
  riskAssessor,
} from './index';

// Patterns
import {
  PatternStore,
  PatternAdapter,
  PatternLearner,
  HNSWIndex,
} from './index';

// Checkpoint
import { CheckpointManager, checkpointManager } from './index';

// DNA Scanner
import { DNAScanner, createDNAScanner, DEFAULT_SCAN_OPTIONS } from './index';

// Orchestration - Task Tracker
import { TaskTracker, createTaskTracker } from './index';

// Orchestration - Recovery
import {
  FailureRecoveryManager,
  createFailureRecoveryManager,
  DEFAULT_RETRY_CONFIG,
} from './index';

// Orchestration - Mode Transitions
import { ModeTransitionManager, createModeTransitionManager } from './index';

// Context - JIT Loader
import { JITLoader, createJITLoader } from './index';

// Context - Token Budget
import { TokenBudgetManager, createTokenBudgetManager, DEFAULT_ALLOCATION } from './index';

// Intent - Complexity Scorer
import { ComplexityScorer, complexityScorer } from './index';

// Intent - Language Detector
import {
  languageDetector,
  detectLanguage,
  containsThai,
  containsEnglish,
  getLanguageName,
  getLanguageEmoji,
} from './index';

// Intent - Mode Selector
import { ModeSelector, modeSelector, MODE_THRESHOLDS } from './index';

// Selector - Capability Loader
import { CapabilityLoader, capabilityLoader } from './index';

// Selector - Tool Checker
import { ToolAvailabilityChecker, toolChecker } from './index';

// Audit
import { AuditLogger, auditLogger } from './index';

// Errors
import {
  DevStackError,
  formatErrorMessage,
  createError,
  isDevStackError,
  getRecoverySuggestion,
  DevStackErrorCode,
  ERROR_MESSAGES,
  ErrorSeverity,
  ERROR_SEVERITY
} from './index';

// Recovery
import { RollbackManager } from './index';

describe('Guard Exports', () => {
  it('should export BashGuard class and instance', () => {
      expect(BashGuard).toBeDefined();
      expect(bashGuard).toBeDefined();
      expect(typeof BashGuard).toBe('function');
      expect(typeof bashGuard).toBe('object');
    });

    it('should export ScopeGuard class and instance', () => {
      expect(ScopeGuard).toBeDefined();
      expect(scopeGuard).toBeDefined();
      expect(typeof ScopeGuard).toBe('function');
      expect(typeof scopeGuard).toBe('object');
    });

    it('should export SecretScanner class and instance', () => {
      expect(SecretScanner).toBeDefined();
      expect(secretScanner).toBeDefined();
      expect(typeof SecretScanner).toBe('function');
      expect(typeof secretScanner).toBe('object');
    });

    it('should export RiskAssessor class and instance', () => {
      expect(RiskAssessor).toBeDefined();
      expect(riskAssessor).toBeDefined();
      expect(typeof RiskAssessor).toBe('function');
      expect(typeof riskAssessor).toBe('object');
    });
  });

  describe('Pattern Exports', () => {
    it('should export PatternStore class', () => {
      expect(PatternStore).toBeDefined();
      expect(typeof PatternStore).toBe('function');
    });

    it('should export PatternAdapter class', () => {
      expect(PatternAdapter).toBeDefined();
      expect(typeof PatternAdapter).toBe('function');
    });

    it('should export PatternLearner class', () => {
      expect(PatternLearner).toBeDefined();
      expect(typeof PatternLearner).toBe('function');
    });

    it('should export HNSWIndex class', () => {
      expect(HNSWIndex).toBeDefined();
      expect(typeof HNSWIndex).toBe('function');
    });
  });

  describe('Checkpoint Exports', () => {
    it('should export CheckpointManager class', () => {
      expect(CheckpointManager).toBeDefined();
      expect(typeof CheckpointManager).toBe('function');
      // Note: checkpointManager is a singleton, but but });

  });

  describe('DNA Scanner Exports', () => {
    it('should export DNAScanner class', () => {
      expect(DNAScanner).toBeDefined();
      expect(typeof DNAScanner).toBe('function');
    });

    it('should export createDNAScanner factory function', () => {
      expect(createDNAScanner).toBeDefined();
      expect(typeof createDNAScanner).toBe('function');
    });

    it('should export DEFAULT_SCAN_OPTIONS', () => {
      expect(DEFAULT_SCAN_OPTIONS).toBeDefined();
      expect(typeof DEFAULT_SCAN_OPTIONS).toBe('object');
    });
  });

  describe('Orchestration Exports', () => {
    it('should export TaskTracker class', () => {
      expect(TaskTracker).toBeDefined();
      expect(typeof TaskTracker).toBe('function');
    });

    it('should export createTaskTracker factory function', () => {
      expect(createTaskTracker).toBeDefined();
      expect(typeof createTaskTracker).toBe('function');
    });

    it('should export FailureRecoveryManager class', () => {
      expect(FailureRecoveryManager).toBeDefined();
      expect(typeof FailureRecoveryManager).toBe('function');
    });

    it('should export createFailureRecoveryManager factory function', () => {
      expect(createFailureRecoveryManager).toBeDefined();
      expect(typeof createFailureRecoveryManager).toBe('function');
    });

    it('should export DEFAULT_RETRY_CONFIG', () => {
      expect(DEFAULT_RETRY_CONFIG).toBeDefined();
      expect(typeof DEFAULT_RETRY_CONFIG).toBe('object');
    });
  });

  describe('Orchestration - Mode Transitions', () => {
    it('should export ModeTransitionManager class', () => {
      expect(ModeTransitionManager).toBeDefined();
      expect(typeof ModeTransitionManager).toBe('function');
    });

    it('should export createModeTransitionManager factory function', () => {
      expect(createModeTransitionManager).toBeDefined();
      expect(typeof createModeTransitionManager).toBe('function');
    });
  });

  describe('Context - JIT Loader', () => {
    it('should export JITLoader class', () => {
      expect(JITLoader).toBeDefined();
      expect(typeof JITLoader).toBe('function');
    });

    it('should export createJITLoader factory function', () => {
      expect(createJITLoader).toBeDefined();
      expect(typeof createJITLoader).toBe('function');
    });
  });

  describe('Context - Token Budget', () => {
    it('should export TokenBudgetManager class', () => {
      expect(TokenBudgetManager).toBeDefined();
      expect(typeof TokenBudgetManager).toBe('function');
    });

    it('should export createTokenBudgetManager factory function', () => {
      expect(createTokenBudgetManager).toBeDefined();
      expect(typeof createTokenBudgetManager).toBe('function');
    });

    it('should export DEFAULT_ALLOCATION', () => {
      expect(DEFAULT_ALLOCATION).toBeDefined();
      expect(typeof DEFAULT_ALLOCATION).toBe('object');
    });
  });

  describe('Intent - Complexity Scorer', () => {
    it('should export ComplexityScorer class', () => {
      expect(ComplexityScorer).toBeDefined();
      expect(typeof ComplexityScorer).toBe('function');
    });

    it('should export complexityScorer instance', () => {
      expect(complexityScorer).toBeDefined();
      expect(typeof complexityScorer).toBe('object');
    });

    it('should export ModeSelector class and instance', () => {
      expect(ModeSelector).toBeDefined();
      expect(typeof ModeSelector).toBe('function');
    });

    it('should export modeSelector instance', () => {
      expect(modeSelector).toBeDefined();
      expect(typeof modeSelector).toBe('object');
    });

    it('should export MODE_THRESHOLDS', () => {
      expect(MODE_THRESHOLDS).toBeDefined();
      expect(typeof MODE_THRESHOLDS).toBe('object');
    });
  });

  describe('Intent - Language Detector', () => {
    it('should export languageDetector instance', () => {
      expect(languageDetector).toBeDefined();
      expect(typeof languageDetector).toBe('object');
    });

    it('should export detectLanguage function', () => {
      expect(detectLanguage).toBeDefined();
      expect(typeof detectLanguage).toBe('function');
    });

    it('should export containsThai function', () => {
      expect(containsThai).toBeDefined();
      expect(typeof containsThai).toBe('function');
    });

    it('should export containsEnglish function', () => {
      expect(containsEnglish).toBeDefined();
      expect(typeof containsEnglish).toBe('function');
    });

    it('should export getLanguageName function', () => {
      expect(getLanguageName).toBeDefined();
      expect(typeof getLanguageName).toBe('function');
    });

    it('should export getLanguageEmoji function', () => {
      expect(getLanguageEmoji).toBeDefined();
      expect(typeof getLanguageEmoji).toBe('function');
    });
  });

  describe('Selector Exports', () => {
    it('should export CapabilityLoader class and instance', () => {
      expect(CapabilityLoader).toBeDefined();
      expect(capabilityLoader).toBeDefined();
      expect(typeof CapabilityLoader).toBe('function');
      expect(typeof capabilityLoader).toBe('object');
    });

    it('should export ToolAvailabilityChecker class and instance', () => {
      expect(ToolAvailabilityChecker).toBeDefined();
      expect(toolChecker).toBeDefined();
      expect(typeof ToolAvailabilityChecker).toBe('function');
      expect(typeof toolChecker).toBe('object');
    });
  });

  describe('Audit Exports', () => {
    it('should export AuditLogger class and instance', () => {
      expect(AuditLogger).toBeDefined();
      expect(auditLogger).toBeDefined();
      expect(typeof AuditLogger).toBe('function');
      expect(typeof auditLogger).toBe('object');
    });
  });

  describe('Error Exports', () => {
    it('should export DevStackError class', () => {
      expect(DevStackError).toBeDefined();
      expect(typeof DevStackError).toBe('function');
    });

    it('should export error utility functions', () => {
      expect(formatErrorMessage).toBeDefined();
      expect(createError).toBeDefined();
      expect(isDevStackError).toBeDefined();
      expect(getRecoverySuggestion).toBeDefined();
      expect(typeof formatErrorMessage).toBe('function');
      expect(typeof createError).toBe('function');
      expect(typeof isDevStackError).toBe('function');
      expect(typeof getRecoverySuggestion).toBe('function');
    });

      it('should export error constants', () => {
      expect(DevStackErrorCode).toBeDefined();
      expect(ERROR_MESSAGES).toBeDefined();
      // ErrorSeverity is a type alias - not available at runtime
      // Just check the ERROR_SEVERITY object exists
      expect(ERROR_SEVERITY).toBeDefined();
    });
  });

  describe('recovery Exports', () => {
    it('should export RollbackManager class', () => {
      expect(RollbackManager).toBeDefined();
      expect(typeof RollbackManager).toBe('function');
    });
  });
});
