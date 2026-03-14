/**
 * JIT Context Loader - Dev-Stack v6
 * Just-In-Time context loading with upfront, on-demand, and progressive strategies
 */

import * as fs from 'fs';
import * as path from 'path';
import { TokenBudgetManager, BudgetCategory, createTokenBudgetManager } from './token-budget.js';

/**
 * Loading strategy
 */
export type LoadingStrategy = 'upfront' | 'on_demand' | 'progressive';

/**
 * Context source definition
 */
export interface ContextSource {
  id: string;
  strategy: LoadingStrategy;
  category: BudgetCategory;
  path: string;
  loader: () => Promise<string>;
  priority: number; // 1-10, higher = more important
  relevance_checker?: (task: string) => number; // 0.0-1.0
}

/**
 * Loaded context result
 */
export interface LoadedContext {
  id: string;
  source: string;
  content: string;
  tokens: number;
  strategy: LoadingStrategy;
  category: BudgetCategory;
  relevance: number;
}

/**
 * Loading result
 */
export interface LoadingResult {
  loaded: LoadedContext[];
  skipped: { source: string; reason: string }[];
  budget_report: ReturnType<TokenBudgetManager['getReport']>;
}

/**
 * JIT Context Loader class
 */
export class JITLoader {
  private projectRoot: string;
  private budgetManager: TokenBudgetManager;
  private sources: Map<string, ContextSource> = new Map();
  private loadedContent: Map<string, string> = new Map();

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.budgetManager = createTokenBudgetManager();
    this.registerDefaultSources();
  }

  /**
   * Register default context sources
   */
  private registerDefaultSources(): void {
    // Upfront sources (loaded at session start)
    this.registerSource({
      id: 'project-dna',
      strategy: 'upfront',
      category: 'project_dna',
      path: '.dev-stack/dna/project.md',
      loader: () => this.loadFile('.dev-stack/dna/project.md'),
      priority: 10
    });

    this.registerSource({
      id: 'capability-registry',
      strategy: 'upfront',
      category: 'system_prompt',
      path: '.claude-plugin/config/capabilities.yaml',
      loader: () => this.loadFile('.claude-plugin/config/capabilities.yaml'),
      priority: 10
    });

    this.registerSource({
      id: 'scope-config',
      strategy: 'upfront',
      category: 'system_prompt',
      path: '.dev-stack/config/scope.json',
      loader: () => this.loadFile('.dev-stack/config/scope.json'),
      priority: 9
    });

    this.registerSource({
      id: 'checkpoint',
      strategy: 'upfront',
      category: 'working_memory',
      path: '.dev-stack/memory/checkpoint.md',
      loader: () => this.loadFile('.dev-stack/memory/checkpoint.md'),
      priority: 8
    });
  }

  /**
   * Register a context source
   */
  registerSource(source: ContextSource): void {
    this.sources.set(source.id, source);
  }

  /**
   * Unregister a context source
   */
  unregisterSource(id: string): void {
    this.sources.delete(id);
  }

  /**
   * Load upfront context (at session start)
   */
  async loadUpfront(): Promise<LoadingResult> {
    const loaded: LoadedContext[] = [];
    const skipped: { source: string; reason: string }[] = [];

    // Get upfront sources sorted by priority
    const upfrontSources = Array.from(this.sources.values())
      .filter(s => s.strategy === 'upfront')
      .sort((a, b) => b.priority - a.priority);

    for (const source of upfrontSources) {
      try {
        const content = await source.loader();

        if (!content) {
          skipped.push({ source: source.id, reason: 'File not found or empty' });
          continue;
        }

        const tokens = this.estimateTokens(content);
        const relevance = 1.0; // Upfront sources always relevant

        if (this.budgetManager.canLoad(source.category, tokens)) {
          this.budgetManager.loadContext(source.id, source.category, source.path, tokens, relevance);

          loaded.push({
            id: source.id,
            source: source.path,
            content,
            tokens,
            strategy: 'upfront',
            category: source.category,
            relevance
          });

          this.loadedContent.set(source.id, content);
        } else {
          skipped.push({ source: source.id, reason: 'Budget exceeded' });
        }
      } catch (error) {
        skipped.push({
          source: source.id,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      loaded,
      skipped,
      budget_report: this.budgetManager.getReport()
    };
  }

  /**
   * Load on-demand context (at task start)
   */
  async loadOnDemand(task: {
    keywords: string[];
    targets: string[];
    intent: string;
  }): Promise<LoadingResult> {
    const loaded: LoadedContext[] = [];
    const skipped: { source: string; reason: string }[] = [];

    // Register task-specific sources
    for (const target of task.targets) {
      const sourceId = `task-file-${target}`;
      this.registerSource({
        id: sourceId,
        strategy: 'on_demand',
        category: 'current_task',
        path: target,
        loader: () => this.loadFile(target),
        priority: 10,
        relevance_checker: (t) => this.calculateRelevance(t, target, task.keywords)
      });
    }

    // Get on-demand sources
    const onDemandSources = Array.from(this.sources.values())
      .filter(s => s.strategy === 'on_demand')
      .sort((a, b) => {
        const relevanceA = a.relevance_checker?.(task.intent) ?? 0.5;
        const relevanceB = b.relevance_checker?.(task.intent) ?? 0.5;
        return (relevanceB * b.priority) - (relevanceA * a.priority);
      });

    for (const source of onDemandSources) {
      try {
        const content = await source.loader();

        if (!content) {
          skipped.push({ source: source.id, reason: 'File not found or empty' });
          continue;
        }

        const tokens = this.estimateTokens(content);
        const relevance = source.relevance_checker?.(task.intent) ?? 0.5;

        if (this.budgetManager.canLoad(source.category, tokens)) {
          this.budgetManager.loadContext(source.id, source.category, source.path, tokens, relevance);

          loaded.push({
            id: source.id,
            source: source.path,
            content,
            tokens,
            strategy: 'on_demand',
            category: source.category,
            relevance
          });

          this.loadedContent.set(source.id, content);
        } else {
          skipped.push({ source: source.id, reason: 'Budget exceeded' });
        }
      } catch (error) {
        skipped.push({
          source: source.id,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      loaded,
      skipped,
      budget_report: this.budgetManager.getReport()
    };
  }

  /**
   * Load progressive context (during execution)
   */
  async loadProgressive(needs: {
    expand_imports?: string[];
    find_references?: string[];
    similar_patterns?: string[];
    documentation?: string[];
  }): Promise<LoadingResult> {
    const loaded: LoadedContext[] = [];
    const skipped: { source: string; reason: string }[] = [];

    // Register progressive sources
    const progressiveSources: ContextSource[] = [];

    if (needs.expand_imports) {
      for (const imp of needs.expand_imports) {
        progressiveSources.push({
          id: `import-${imp}`,
          strategy: 'progressive',
          category: 'code_context',
          path: imp,
          loader: () => this.loadFile(imp),
          priority: 7
        });
      }
    }

    if (needs.similar_patterns) {
      progressiveSources.push({
        id: 'similar-patterns',
        strategy: 'progressive',
        category: 'pattern_memory',
        path: '.dev-stack/memory/patterns.db',
        loader: async () => {
          // This would query the HNSW pattern store
          return JSON.stringify(needs.similar_patterns);
        },
        priority: 6
      });
    }

    // Sort by priority
    progressiveSources.sort((a, b) => b.priority - a.priority);

    for (const source of progressiveSources) {
      try {
        const content = await source.loader();

        if (!content) {
          skipped.push({ source: source.id, reason: 'No content' });
          continue;
        }

        const tokens = this.estimateTokens(content);

        if (this.budgetManager.canLoad(source.category, tokens)) {
          this.budgetManager.loadContext(source.id, source.category, source.path, tokens, 0.5);

          loaded.push({
            id: source.id,
            source: source.path,
            content,
            tokens,
            strategy: 'progressive',
            category: source.category,
            relevance: 0.5
          });

          this.loadedContent.set(source.id, content);
        } else {
          // Try to evict LRU from same category
          this.budgetManager.evictLRU(source.category, tokens);

          if (this.budgetManager.canLoad(source.category, tokens)) {
            this.budgetManager.loadContext(source.id, source.category, source.path, tokens, 0.5);

            loaded.push({
              id: source.id,
              source: source.path,
              content,
              tokens,
              strategy: 'progressive',
              category: source.category,
              relevance: 0.5
            });

            this.loadedContent.set(source.id, content);
          } else {
            skipped.push({ source: source.id, reason: 'Budget exceeded after eviction' });
          }
        }
      } catch (error) {
        skipped.push({
          source: source.id,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      loaded,
      skipped,
      budget_report: this.budgetManager.getReport()
    };
  }

  /**
   * Load file content
   */
  private async loadFile(relativePath: string): Promise<string> {
    const fullPath = path.join(this.projectRoot, relativePath);

    if (!fs.existsSync(fullPath)) {
      return '';
    }

    try {
      return fs.readFileSync(fullPath, 'utf8');
    } catch {
      return '';
    }
  }

  /**
   * Estimate token count
   */
  private estimateTokens(content: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(
    taskIntent: string,
    filePath: string,
    keywords: string[]
  ): number {
    let score = 0;

    // Check keyword matches in file path
    for (const keyword of keywords) {
      if (filePath.toLowerCase().includes(keyword.toLowerCase())) {
        score += 0.2;
      }
    }

    // Check intent keywords
    const intentWords = taskIntent.toLowerCase().split(/[\s_-]+/);
    for (const word of intentWords) {
      if (filePath.toLowerCase().includes(word)) {
        score += 0.1;
      }
    }

    return Math.min(1, score);
  }

  /**
   * Get loaded content
   */
  getLoadedContent(id: string): string | undefined {
    return this.loadedContent.get(id);
  }

  /**
   * Get all loaded content
   */
  getAllLoadedContent(): Map<string, string> {
    return new Map(this.loadedContent);
  }

  /**
   * Get budget manager
   */
  getBudgetManager(): TokenBudgetManager {
    return this.budgetManager;
  }

  /**
   * Clear loaded context
   */
  clear(): void {
    this.loadedContent.clear();
    this.budgetManager.reset();
  }
}

/**
 * Export singleton factory
 */
export function createJITLoader(projectRoot: string): JITLoader {
  return new JITLoader(projectRoot);
}
