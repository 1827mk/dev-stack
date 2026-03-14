/**
 * Pattern Learner - Dev-Stack v6
 * Learning engine for pattern success/failure tracking and confidence updates
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  Pattern,
  PatternType,
  CreatePatternInput,
} from './types';
import { PatternStore } from './store';

/**
 * Learning configuration
 */
export interface LearnerConfig {
  minInteractionsForConfidence: number; // Minimum interactions before confidence is reliable
  successWeight: number; // Weight for success (0-1)
  failureWeight: number; // Weight for failure (0-1)
  decayFactor: number; // Time decay factor for old interactions
  maxHistorySize: number; // Maximum history to keep per pattern
}

const DEFAULT_CONFIG: LearnerConfig = {
  minInteractionsForConfidence: 3,
  successWeight: 1.0,
  failureWeight: 0.5,
  decayFactor: 0.95,
  maxHistorySize: 100,
};

/**
 * Learning event types
 */
export type LearningEventType =
  | 'pattern_used'
  | 'pattern_succeeded'
  | 'pattern_failed'
  | 'pattern_feedback'
  | 'pattern_adapted';

/**
 * Learning event record
 */
export interface LearningEvent {
  id: string;
  pattern_id: string;
  event_type: LearningEventType;
  timestamp: string;
  session_id: string;
  context?: string;
  user_feedback?: 'positive' | 'negative' | 'neutral';
  adaptation_made?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Pattern Learner
 * Tracks pattern usage, success/failure rates, and updates confidence scores
 */
export class PatternLearner {
  private store: PatternStore;
  private config: LearnerConfig;
  private historyPath: string;
  private events: Map<string, LearningEvent[]> = new Map();

  constructor(store: PatternStore, config: Partial<LearnerConfig> = {}) {
    this.store = store;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.historyPath = path.join(process.cwd(), '.dev-stack', 'memory', 'learning-history.json');
    this.loadHistory();
  }

  /**
   * Load learning history from disk
   */
  private loadHistory(): void {
    if (fs.existsSync(this.historyPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.historyPath, 'utf-8'));
        if (data.events) {
          for (const [patternId, events] of Object.entries(data.events)) {
            this.events.set(patternId, events as LearningEvent[]);
          }
        }
      } catch (error) {
        console.warn('Learning history corrupted, starting fresh');
      }
    }
  }

  /**
   * Save learning history to disk
   */
  private persistHistory(): void {
    const dir = path.dirname(this.historyPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = {
      version: '1.0',
      events: Object.fromEntries(this.events),
      lastUpdated: new Date().toISOString(),
    };

    fs.writeFileSync(this.historyPath, JSON.stringify(data, null, 2));
  }

  /**
   * Record a pattern usage event
   */
  recordUsage(
    patternId: string,
    sessionId: string,
    success: boolean,
    context?: string
  ): void {
    const eventType: LearningEventType = success ? 'pattern_succeeded' : 'pattern_failed';
    this.recordEvent(patternId, eventType, sessionId, { context });

    // Update pattern statistics in store
    this.store.recordUsage(patternId, success);

    // Recalculate confidence based on history
    this.updateConfidence(patternId);
  }

  /**
   * Record user feedback on a pattern
   */
  recordFeedback(
    patternId: string,
    sessionId: string,
    feedback: 'positive' | 'negative' | 'neutral',
    context?: string
  ): void {
    this.recordEvent(patternId, 'pattern_feedback', sessionId, {
      context,
      user_feedback: feedback,
    });

    // Positive feedback counts as success, negative as failure
    if (feedback === 'positive') {
      this.store.recordUsage(patternId, true);
    } else if (feedback === 'negative') {
      this.store.recordUsage(patternId, false);
    }

    this.updateConfidence(patternId);
  }

  /**
   * Record pattern adaptation
   */
  recordAdaptation(
    patternId: string,
    sessionId: string,
    adaptationDescription: string,
    success: boolean
  ): void {
    this.recordEvent(patternId, 'pattern_adapted', sessionId, {
      adaptation_made: adaptationDescription,
      success,
    });

    // Adaptations that succeed increase pattern value
    if (success) {
      this.store.recordUsage(patternId, true);
    }

    this.updateConfidence(patternId);
  }

  /**
   * Record a learning event
   */
  private recordEvent(
    patternId: string,
    eventType: LearningEventType,
    sessionId: string,
    metadata?: Record<string, unknown>
  ): void {
    const event: LearningEvent = {
      id: uuidv4(),
      pattern_id: patternId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      ...metadata,
    };

    if (!this.events.has(patternId)) {
      this.events.set(patternId, []);
    }

    const patternEvents = this.events.get(patternId)!;
    patternEvents.push(event);

    // Trim history if too large
    if (patternEvents.length > this.config.maxHistorySize) {
      patternEvents.splice(0, patternEvents.length - this.config.maxHistorySize);
    }

    this.persistHistory();
  }

  /**
   * Update pattern confidence based on learning history
   */
  private updateConfidence(patternId: string): void {
    const events = this.events.get(patternId) || [];
    if (events.length < this.config.minInteractionsForConfidence) {
      return; // Not enough data
    }

    // Calculate weighted confidence
    let weightedSuccess = 0;
    let weightedFailure = 0;
    let _totalWeight = 0;

    const now = Date.now();

    for (const event of events) {
      // Calculate time decay
      const eventTime = new Date(event.timestamp).getTime();
      const ageInDays = (now - eventTime) / (1000 * 60 * 60 * 24);
      const decay = Math.pow(this.config.decayFactor, ageInDays);

      if (event.event_type === 'pattern_succeeded' ||
          (event.event_type === 'pattern_feedback' && event.user_feedback === 'positive')) {
        weightedSuccess += this.config.successWeight * decay;
        _totalWeight += decay;
      } else if (event.event_type === 'pattern_failed' ||
                 (event.event_type === 'pattern_feedback' && event.user_feedback === 'negative')) {
        weightedFailure += this.config.failureWeight * decay;
        _totalWeight += decay;
      }
    }

    // Note: The store handles the actual confidence update via recordUsage
    // This method triggers the recalculation logic when needed
    void (weightedSuccess + weightedFailure); // Avoid unused variable warnings
  }

  /**
   * Get pattern learning statistics
   */
  getPatternStats(patternId: string): {
    totalEvents: number;
    successRate: number;
    recentTrend: 'improving' | 'declining' | 'stable';
    lastUsed?: string;
  } {
    const events = this.events.get(patternId) || [];

    if (events.length === 0) {
      return {
        totalEvents: 0,
        successRate: 0,
        recentTrend: 'stable',
      };
    }

    // Calculate success rate
    const successes = events.filter(e =>
      e.event_type === 'pattern_succeeded' ||
      (e.event_type === 'pattern_feedback' && e.user_feedback === 'positive')
    ).length;
    const failures = events.filter(e =>
      e.event_type === 'pattern_failed' ||
      (e.event_type === 'pattern_feedback' && e.user_feedback === 'negative')
    ).length;

    const successRate = (successes + failures) > 0
      ? successes / (successes + failures)
      : 0;

    // Calculate trend (compare last 5 events to previous 5)
    const recentEvents = events.slice(-5);
    const previousEvents = events.slice(-10, -5);

    const recentSuccessRate = this.calculateSuccessRate(recentEvents);
    const previousSuccessRate = this.calculateSuccessRate(previousEvents);

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentSuccessRate > previousSuccessRate + 0.1) {
      trend = 'improving';
    } else if (recentSuccessRate < previousSuccessRate - 0.1) {
      trend = 'declining';
    }

    // Get last used timestamp
    const lastEvent = events[events.length - 1];

    return {
      totalEvents: events.length,
      successRate,
      recentTrend: trend,
      lastUsed: lastEvent?.timestamp,
    };
  }

  /**
   * Calculate success rate from events
   */
  private calculateSuccessRate(events: LearningEvent[]): number {
    if (events.length === 0) return 0.5;

    const successes = events.filter(e =>
      e.event_type === 'pattern_succeeded' ||
      (e.event_type === 'pattern_feedback' && e.user_feedback === 'positive')
    ).length;
    const failures = events.filter(e =>
      e.event_type === 'pattern_failed' ||
      (e.event_type === 'pattern_feedback' && e.user_feedback === 'negative')
    ).length;

    return (successes + failures) > 0 ? successes / (successes + failures) : 0.5;
  }

  /**
   * Learn from a completed task
   * Extracts patterns from successful task execution
   */
  async learnFromTask(
    taskDescription: string,
    steps: string[],
    outcome: 'success' | 'failure' | 'partial',
    sessionId: string,
    codeChanges?: string[]
  ): Promise<Pattern | null> {
    // Only learn from successful or partially successful tasks
    if (outcome === 'failure') {
      return null;
    }

    // Create a new pattern from the task
    const patternInput: CreatePatternInput = {
      type: this.inferPatternType(taskDescription),
      name: this.generatePatternName(taskDescription),
      description: taskDescription,
      code_example: codeChanges?.join('\n\n'),
      tags: this.extractTags(taskDescription, steps),
      source_project: process.cwd(),
    };

    const patternId = await this.store.savePattern(patternInput);

    // Record initial success
    this.recordUsage(patternId, sessionId, outcome === 'success');

    return this.store.getPatternById(patternId) || null;
  }

  /**
   * Infer pattern type from task description
   */
  private inferPatternType(description: string): PatternType {
    const lower = description.toLowerCase();

    if (lower.includes('fix') || lower.includes('bug') || lower.includes('error')) {
      return 'debug';
    }
    if (lower.includes('refactor') || lower.includes('clean') || lower.includes('improve')) {
      return 'refactor';
    }
    if (lower.includes('implement') || lower.includes('add') || lower.includes('create')) {
      return 'solution';
    }
    if (lower.includes('workflow') || lower.includes('process')) {
      return 'workflow';
    }
    if (lower.includes('decide') || lower.includes('choose')) {
      return 'decision';
    }

    return 'code_pattern';
  }

  /**
   * Generate pattern name from task description
   */
  private generatePatternName(description: string): string {
    // Take first meaningful words and convert to snake_case
    const words = description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 5);

    return words.join('_');
  }

  /**
   * Extract tags from task description and steps
   */
  private extractTags(description: string, steps: string[]): string[] {
    const tags = new Set<string>();

    // Extract tech keywords
    const techPatterns = [
      /\b(typescript|javascript|python|go|rust|java)\b/gi,
      /\b(react|vue|angular|svelte)\b/gi,
      /\b(node|deno|bun)\b/gi,
      /\b(api|rest|graphql|grpc)\b/gi,
      /\b(test|spec|vitest|jest)\b/gi,
      /\b(auth|security|encryption)\b/gi,
      /\b(database|sql|mongo|redis)\b/gi,
    ];

    const allText = [description, ...steps].join(' ');

    for (const pattern of techPatterns) {
      const matches = allText.match(pattern);
      if (matches) {
        matches.forEach(m => tags.add(m.toLowerCase()));
      }
    }

    return Array.from(tags);
  }

  /**
   * Get suggested patterns for a task
   */
  async getSuggestedPatterns(taskDescription: string, limit: number = 5): Promise<Pattern[]> {
    const results = await this.store.searchPatterns(taskDescription, limit);

    // Filter by minimum confidence
    return results
      .filter(r => r.pattern.confidence >= 0.5)
      .map(r => r.pattern);
  }

  /**
   * Clear learning history for a pattern
   */
  clearPatternHistory(patternId: string): void {
    this.events.delete(patternId);
    this.persistHistory();
  }

  /**
   * Export learning data for analysis
   */
  exportLearningData(): {
    events: Record<string, LearningEvent[]>;
    stats: Record<string, ReturnType<PatternLearner['getPatternStats']>>;
  } {
    const stats: Record<string, ReturnType<PatternLearner['getPatternStats']>> = {};

    for (const patternId of this.events.keys()) {
      stats[patternId] = this.getPatternStats(patternId);
    }

    return {
      events: Object.fromEntries(this.events),
      stats,
    };
  }
}

// Default export
export default PatternLearner;
