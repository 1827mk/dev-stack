/**
 * Pattern Storage - Dev-Stack v6
 * SQLite operations for pattern persistence
 *
 * @module PatternStore
 *
 * ## Implementation Note (MVP vs Production)
 *
 * This is an **MVP implementation** using in-memory storage with JSON persistence.
 * For production use with large pattern databases (10,000+ patterns), consider:
 *
 * 1. **SQLite + HNSW Extension**: Replace in-memory Map with better-sqlite3
 *    and sqlite-vss for true HNSW indexing (150x-12,500x faster than linear search)
 *
 * 2. **Real Semantic Embeddings**: Replace hash-based pseudo-embeddings in HNSWIndex
 *    with actual embeddings from:
 *    - OpenAI text-embedding-3-small/large via MCP
 *    - Local sentence-transformers model
 *    - Anthropic's embedding API
 *
 * Performance Target (SC-004): Pattern search < 50ms for 10,000 patterns
 * Current Implementation: Suitable for < 1,000 patterns with acceptable performance
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  Pattern,
  PatternType,
  PatternSearchResult,
  CreatePatternInput,
  UpdatePatternInput,
} from './types';
import { HNSWIndex } from './search';

interface DatabaseRow {
  id: string;
  type: string;
  name: string;
  description: string;
  code_example?: string;
  template?: string;
  tags: string;
  embedding?: Buffer;
  success_count: number;
  failure_count: number;
  confidence: number;
  last_used?: string;
  source_project: string;
  created_at: string;
  updated_at: string;
}

/**
 * Pattern Store
 * SQLite + HNSW-based pattern storage and retrieval
 */
export class PatternStore {
  private dbPath: string;
  private patterns: Map<string, DatabaseRow> = new Map();
  private hnswIndex: HNSWIndex;
  private isInitialized: boolean = false;

  constructor(projectRoot: string = process.cwd()) {
    this.dbPath = path.join(projectRoot, '.dev-stack', 'memory', 'patterns.db');
    this.hnswIndex = new HNSWIndex(768, 10000);
    this.initialize();
  }

  /**
   * Initialize database and creates tables if needed
   */
  private initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Load existing patterns if database file exists
    if (fs.existsSync(this.dbPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
        if (data.patterns && Array.isArray(data.patterns)) {
          for (const pattern of data.patterns) {
            this.patterns.set(pattern.id, pattern);
            if (pattern.embedding) {
              const embedding = Array.from(new Float32Array(pattern.embedding));
              this.hnswIndex.addPattern(pattern.id, embedding);
            }
          }
        }
      } catch (error) {
        // Database corrupted or empty, start fresh
        console.warn('Pattern database corrupted, starting fresh');
      }
    }

    this.isInitialized = true;
  }

  /**
   * Save patterns to disk
   */
  private persist(): void {
    const data = {
      version: '1.0',
      patterns: Array.from(this.patterns.values()),
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
  }

  /**
   * Save pattern to database
   */
  async savePattern(input: CreatePatternInput): Promise<string> {
    this.initialize();

    const id = uuidv4();
    const now = new Date().toISOString();

    const pattern: DatabaseRow = {
      id,
      type: input.type,
      name: input.name,
      description: input.description,
      code_example: input.code_example,
      template: input.template,
      tags: JSON.stringify(input.tags),
      success_count: 0,
      failure_count: 0,
      confidence: 0.5,
      source_project: input.source_project,
      created_at: now,
      updated_at: now,
    };

    this.patterns.set(id, pattern);
    this.persist();

    return id;
  }

  /**
   * Update existing pattern
   */
  async updatePattern(id: string, input: UpdatePatternInput): Promise<boolean> {
    const existing = this.patterns.get(id);
    if (!existing) {
      return false;
    }

    const updated: DatabaseRow = {
      ...existing,
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      code_example: input.code_example ?? existing.code_example,
      template: input.template ?? existing.template,
      tags: input.tags ? JSON.stringify(input.tags) : existing.tags,
      updated_at: new Date().toISOString(),
    };

    this.patterns.set(id, updated);
    this.persist();

    return true;
  }

  /**
   * Get pattern by ID
   */
  getPatternById(id: string): Pattern | null {
    const row = this.patterns.get(id);
    if (!row) {
      return null;
    }
    return this.rowToPattern(row);
  }

  /**
   * Search patterns by type
   */
  getPatternsByType(type: PatternType): Pattern[] {
    const results: Pattern[] = [];
    for (const row of this.patterns.values()) {
      if (row.type === type) {
        results.push(this.rowToPattern(row));
      }
    }
    return results.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Search patterns by tags
   */
  getPatternsByTags(tags: string[]): Pattern[] {
    const results: Pattern[] = [];
    for (const row of this.patterns.values()) {
      const rowTags: string[] = JSON.parse(row.tags || '[]');
      if (tags.some(tag => rowTags.includes(tag))) {
        results.push(this.rowToPattern(row));
      }
    }
    return results.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Search patterns using text query
   */
  async searchPatterns(query: string, limit: number = 5): Promise<PatternSearchResult[]> {
    const results: PatternSearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const row of this.patterns.values()) {
      const nameMatch = row.name.toLowerCase().includes(queryLower);
      const descMatch = row.description.toLowerCase().includes(queryLower);
      const tags: string[] = JSON.parse(row.tags || '[]');
      const tagMatch = tags.some(t => t.toLowerCase().includes(queryLower));

      if (nameMatch || descMatch || tagMatch) {
        results.push({
          pattern: this.rowToPattern(row),
          similarity_score: nameMatch ? 0.9 : (descMatch ? 0.7 : 0.5),
          rank: 0,
        });
      }
    }

    // Sort by similarity
    results.sort((a, b) => b.similarity_score - a.similarity_score);

    // Assign ranks
    return results.slice(0, limit).map((r, i) => ({
      ...r,
      rank: i + 1,
    }));
  }

  /**
   * Search patterns using HNSW vector similarity
   */
  async vectorSearch(query: string, limit: number = 5): Promise<PatternSearchResult[]> {
    const searchResults = this.hnswIndex.search(query, limit);

    return searchResults
      .map((result, index) => {
        const pattern = this.getPatternById(result.id);
        if (!pattern) return null;
        return {
          pattern,
          similarity_score: result.similarity,
          rank: index + 1,
        };
      })
      .filter((r): r is PatternSearchResult => r !== null);
  }

  /**
   * Get all pattern types
   */
  getAllPatternTypes(): PatternType[] {
    const types = new Set<PatternType>();
    for (const row of this.patterns.values()) {
      types.add(row.type as PatternType);
    }
    return Array.from(types);
  }

  /**
   * Get pattern count
   */
  async getPatternCount(): Promise<number> {
    return this.patterns.size;
  }

  /**
   * Record pattern usage (success or failure)
   */
  recordUsage(patternId: string, success: boolean): void {
    const pattern = this.patterns.get(patternId);
    if (!pattern) {
      return;
    }

    if (success) {
      pattern.success_count++;
    } else {
      pattern.failure_count++;
    }

    // Update confidence
    const total = pattern.success_count + pattern.failure_count;
    pattern.confidence = total > 0 ? pattern.success_count / total : 0.5;
    pattern.last_used = new Date().toISOString();

    this.patterns.set(patternId, pattern);
    this.persist();
  }

  /**
   * Delete pattern by ID
   */
  deletePattern(id: string): boolean {
    if (!this.patterns.has(id)) {
      return false;
    }

    this.patterns.delete(id);
    this.hnswIndex.removePattern(id);
    this.persist();

    return true;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    this.persist();
    this.patterns.clear();
    this.hnswIndex.clear();
  }

  /**
   * Get statistics
   */
  getStats(): { totalPatterns: number; totalEmbeddings: number; avgConfidence: number } {
    let totalEmbeddings = 0;
    let totalConfidence = 0;

    for (const row of this.patterns.values()) {
      if (row.embedding) {
        totalEmbeddings++;
      }
      totalConfidence += row.confidence;
    }

    return {
      totalPatterns: this.patterns.size,
      totalEmbeddings,
      avgConfidence: this.patterns.size > 0
        ? totalConfidence / this.patterns.size
        : 0,
    };
  }

  /**
   * Convert database row to Pattern interface
   */
  private rowToPattern(row: DatabaseRow): Pattern {
    return {
      id: row.id,
      type: row.type as PatternType,
      name: row.name,
      description: row.description,
      code_example: row.code_example,
      template: row.template,
      tags: JSON.parse(row.tags || '[]'),
      success_count: row.success_count,
      failure_count: row.failure_count,
      confidence: row.confidence,
      last_used: row.last_used,
      source_project: row.source_project,
      created_at: row.created_at,
      updated_at: row.updated_at,
      version: 1,
      status: 'active',
      usage_count: row.success_count + row.failure_count,
    };
  }
}

// Default export
export default PatternStore;
