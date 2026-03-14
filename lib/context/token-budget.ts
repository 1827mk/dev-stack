/**
 * Token Budget Manager - Dev-Stack v6
 * Manages 200k token budget allocation and overflow handling
 */

/**
 * Budget category
 */
export type BudgetCategory =
  | 'system_prompt'
  | 'project_dna'
  | 'current_task'
  | 'working_memory'
  | 'pattern_memory'
  | 'code_context'
  | 'buffer';

/**
 * Budget allocation
 */
export interface BudgetAllocation {
  system_prompt: number;    // 20k
  project_dna: number;      // 15k
  current_task: number;     // 40k
  working_memory: number;   // 30k
  pattern_memory: number;   // 20k
  code_context: number;     // 50k
  buffer: number;           // 25k
}

/**
 * Context item tracking
 */
export interface ContextItem {
  id: string;
  category: BudgetCategory;
  source: string;
  tokens: number;
  loaded_at: string;
  last_accessed: string;
  access_count: number;
  relevance_score: number;
}

/**
 * Budget status
 */
export type BudgetStatus = 'ok' | 'warning' | 'critical' | 'emergency';

/**
 * Budget usage report
 */
export interface BudgetReport {
  total: number;
  used: number;
  remaining: number;
  utilization: number;
  status: BudgetStatus;
  by_category: Record<BudgetCategory, { allocated: number; used: number; remaining: number }>;
  top_consumers: ContextItem[];
  recommendations: string[];
}

/**
 * Default budget allocation (200k total)
 *
 * Token-Efficient Mode: Reduce allocation by 50% for cost-sensitive scenarios
 * Usage: createTokenBudgetManager({ _efficient: true })
 */
export const DEFAULT_ALLOCATION: BudgetAllocation = {
  system_prompt: 20000,   // Agent/skill prompts
  project_dna: 15000,     // Project context
  current_task: 40000,    // Active task
  working_memory: 30000,  // Session state
  pattern_memory: 20000,  // Learned patterns
  code_context: 50000,    // Code files
  buffer: 25000           // Overflow
};

/**
 * Token-efficient allocation (100k total) - for cost-sensitive scenarios
 */
export const EFFICIENT_ALLOCATION: BudgetAllocation = {
  system_prompt: 10000,
  project_dna: 8000,
  current_task: 20000,
  working_memory: 15000,
  pattern_memory: 10000,
  code_context: 25000,
  buffer: 12000
};

/**
 * Token Budget Manager class
 */
export class TokenBudgetManager {
  private totalBudget: number;
  private allocation: BudgetAllocation;
  private loadedContext: Map<string, ContextItem> = new Map();
  private categoryUsage: Record<BudgetCategory, number>;
  private efficientMode: boolean;

  constructor(allocation: Partial<BudgetAllocation> & { _efficient?: boolean } = {}) {
    const { _efficient, ...alloc } = allocation;
    this.efficientMode = _efficient ?? false;

    const baseAllocation = this.efficientMode ? EFFICIENT_ALLOCATION : DEFAULT_ALLOCATION;
    this.allocation = { ...baseAllocation, ...alloc };
    this.totalBudget = Object.values(this.allocation).reduce((a, b) => a + b, 0);

    // Initialize category usage
    this.categoryUsage = {
      system_prompt: 0,
      project_dna: 0,
      current_task: 0,
      working_memory: 0,
      pattern_memory: 0,
      code_context: 0,
      buffer: 0
    };
  }

  /**
   * Check if context can be loaded
   */
  canLoad(category: BudgetCategory, tokens: number): boolean {
    const allocated = this.allocation[category];
    const used = this.categoryUsage[category];
    const remaining = allocated - used;

    // Check category budget
    if (tokens <= remaining) {
      return true;
    }

    // Can use buffer if available
    const bufferRemaining = this.allocation.buffer - this.categoryUsage.buffer;
    const overflow = tokens - remaining;

    return overflow <= bufferRemaining;
  }

  /**
   * Load context item
   */
  loadContext(
    id: string,
    category: BudgetCategory,
    source: string,
    tokens: number,
    relevanceScore: number = 0.5
  ): boolean {
    if (!this.canLoad(category, tokens)) {
      return false;
    }

    const now = new Date().toISOString();
    const categoryUsed = this.categoryUsage[category];
    const allocated = this.allocation[category];
    const overflow = Math.max(0, tokens - (allocated - categoryUsed));

    // Use category budget first
    const categoryTokens = Math.min(tokens, allocated - categoryUsed);
    this.categoryUsage[category] += categoryTokens;

    // Use buffer for overflow
    if (overflow > 0) {
      this.categoryUsage.buffer += overflow;
    }

    const item: ContextItem = {
      id,
      category,
      source,
      tokens,
      loaded_at: now,
      last_accessed: now,
      access_count: 1,
      relevance_score: relevanceScore
    };

    this.loadedContext.set(id, item);
    return true;
  }

  /**
   * Access context item (update access time and count)
   */
  accessContext(id: string): boolean {
    const item = this.loadedContext.get(id);
    if (!item) return false;

    item.last_accessed = new Date().toISOString();
    item.access_count++;
    return true;
  }

  /**
   * Unload context item
   */
  unloadContext(id: string): boolean {
    const item = this.loadedContext.get(id);
    if (!item) return false;

    // Calculate how much to return to each budget
    const categoryUsed = this.categoryUsage[item.category];
    const allocated = this.allocation[item.category];
    const overflow = Math.max(0, item.tokens - (allocated - (categoryUsed - item.tokens)));

    // Return category budget
    const categoryTokens = Math.min(item.tokens, categoryUsed);
    this.categoryUsage[item.category] -= categoryTokens;

    // Return buffer if overflow was used
    if (overflow > 0 && this.categoryUsage.buffer >= overflow) {
      this.categoryUsage.buffer -= overflow;
    }

    this.loadedContext.delete(id);
    return true;
  }

  /**
   * Evict least recently used items from category
   */
  evictLRU(category: BudgetCategory, tokensNeeded: number): number {
    const items = Array.from(this.loadedContext.values())
      .filter(item => item.category === category)
      .sort((a, b) => new Date(a.last_accessed).getTime() - new Date(b.last_accessed).getTime());

    let freed = 0;
    for (const item of items) {
      if (freed >= tokensNeeded) break;

      this.unloadContext(item.id);
      freed += item.tokens;
    }

    return freed;
  }

  /**
   * Get current usage
   */
  getUsage(): { used: number; remaining: number; utilization: number } {
    const used = Object.values(this.categoryUsage).reduce((a, b) => a + b, 0);
    const remaining = this.totalBudget - used;
    const utilization = (used / this.totalBudget) * 100;

    return { used, remaining, utilization };
  }

  /**
   * Get budget status
   */
  getStatus(): BudgetStatus {
    const { utilization } = this.getUsage();

    if (utilization >= 95) return 'emergency';
    if (utilization >= 90) return 'critical';
    if (utilization >= 80) return 'warning';
    return 'ok';
  }

  /**
   * Get category usage
   */
  getCategoryUsage(category: BudgetCategory): { allocated: number; used: number; remaining: number } {
    return {
      allocated: this.allocation[category],
      used: this.categoryUsage[category],
      remaining: this.allocation[category] - this.categoryUsage[category]
    };
  }

  /**
   * Get top consumers
   */
  getTopConsumers(limit: number = 5): ContextItem[] {
    return Array.from(this.loadedContext.values())
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, limit);
  }

  /**
   * Get full budget report
   */
  getReport(): BudgetReport {
    const { used, remaining, utilization } = this.getUsage();
    const status = this.getStatus();

    const byCategory: Record<BudgetCategory, { allocated: number; used: number; remaining: number }> = {
      system_prompt: this.getCategoryUsage('system_prompt'),
      project_dna: this.getCategoryUsage('project_dna'),
      current_task: this.getCategoryUsage('current_task'),
      working_memory: this.getCategoryUsage('working_memory'),
      pattern_memory: this.getCategoryUsage('pattern_memory'),
      code_context: this.getCategoryUsage('code_context'),
      buffer: this.getCategoryUsage('buffer')
    };

    const recommendations: string[] = [];

    if (status === 'warning') {
      recommendations.push('Consider compressing old context');
      recommendations.push('Archive completed task context');
    }

    if (status === 'critical') {
      recommendations.push('Evict least recently used context');
      recommendations.push('Pause progressive loading');
    }

    if (status === 'emergency') {
      recommendations.push('Stop loading new context immediately');
      recommendations.push('Consider breaking task into smaller pieces');
      recommendations.push('Start fresh session for new tasks');
    }

    // Check for imbalanced usage
    for (const [category, usage] of Object.entries(byCategory)) {
      if (usage.used > usage.allocated * 1.5) {
        recommendations.push(`${category} is over budget, using buffer space`);
      }
    }

    return {
      total: this.totalBudget,
      used,
      remaining,
      utilization,
      status,
      by_category: byCategory,
      top_consumers: this.getTopConsumers(),
      recommendations
    };
  }

  /**
   * Compress context (summarize old items)
   */
  compress(ratio: number = 0.5): number {
    const items = Array.from(this.loadedContext.values())
      .filter(item => item.category !== 'system_prompt')
      .sort((a, b) => new Date(a.last_accessed).getTime() - new Date(b.last_accessed).getTime());

    let freed = 0;
    const toCompress = items.slice(0, Math.floor(items.length * ratio));

    for (const item of toCompress) {
      // Simulate compression by reducing tokens by 50%
      const compressedTokens = Math.floor(item.tokens * 0.5);
      const saved = item.tokens - compressedTokens;

      // Update item
      item.tokens = compressedTokens;

      // Update category usage
      this.categoryUsage[item.category] -= saved;

      freed += saved;
    }

    return freed;
  }

  /**
   * Reset budget (clear all context)
   */
  reset(): void {
    this.loadedContext.clear();

    for (const category of Object.keys(this.categoryUsage) as BudgetCategory[]) {
      this.categoryUsage[category] = 0;
    }
  }

  /**
   * Get all loaded context
   */
  getLoadedContext(): ContextItem[] {
    return Array.from(this.loadedContext.values());
  }

  /**
   * Get context by category
   */
  getContextByCategory(category: BudgetCategory): ContextItem[] {
    return Array.from(this.loadedContext.values())
      .filter(item => item.category === category);
  }

  /**
   * Find context by source pattern
   */
  findContext(pattern: string): ContextItem[] {
    const regex = new RegExp(pattern, 'i');
    return Array.from(this.loadedContext.values())
      .filter(item => regex.test(item.source));
  }

  /**
   * Check if efficient mode is enabled
   */
  isEfficientMode(): boolean {
    return this.efficientMode;
  }

  /**
   * Get current mode name
   */
  getMode(): 'default' | 'efficient' {
    return this.efficientMode ? 'efficient' : 'default';
  }
}

/**
 * Export singleton factory
 */
export function createTokenBudgetManager(allocation?: Partial<BudgetAllocation>): TokenBudgetManager {
  return new TokenBudgetManager(allocation);
}
