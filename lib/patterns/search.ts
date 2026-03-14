/**
 * HNSW Search - Dev-Stack v6
 * Vector similarity search for patterns using HNSW index
 *
 * @module HNSWIndex
 *
 * ## Implementation Note (MVP vs Production)
 *
 * This is an **MVP implementation** using in-memory HNSW-like search with
 * hash-based pseudo-embeddings. For production use:
 *
 * ### Replace textToVector() with real embeddings:
 * 1. **OpenAI Embeddings**: Use text-embedding-3-small via MCP server
 * 2. **Local Model**: Use sentence-transformers with transformers.js
 * 3. **Anthropic API**: Use their embedding endpoint
 *
 * ### Consider sqlite-vss for persistence:
 * - Enables HNSW indexing in SQLite
 * - 150x-12,500x faster than linear search
 * - Supports production scale (10,000+ patterns)
 *
 * Performance Target (SC-004): Pattern search < 50ms for 10,000 patterns
 */

import * as fs from 'fs';

/**
 * Search result from HNSW index
 */
export interface SearchResult {
  id: string;
  similarity: number;
}

/**
 * HNSW Index for pattern similarity search
 *
 * In production, this would use sqlite-vss extension or full HNSW.
 * For this implementation, we provide a basic in-memory HNSW-like search
 * that can handle small to medium pattern databases efficiently.
 */
export class HNSWIndex {
  private patterns: Map<string, number[]> = new Map();
  private dimension: number;
  private maxElements: number;

  constructor(dimension: number = 768, maxElements: number = 10000) {
    this.dimension = dimension;
    this.maxElements = maxElements;
  }

  /**
   * Add pattern to index
   */
  addPattern(id: string, embedding: number[]): void {
    if (embedding.length !== this.dimension) {
      throw new Error(`Embedding dimension mismatch: expected ${this.dimension}, got ${embedding.length}`);
    }
    this.patterns.set(id, embedding);
  }

  /**
   * Remove pattern from index
   */
  removePattern(id: string): void {
    this.patterns.delete(id);
  }

  /**
   * Search for similar patterns
   * Accepts either a query vector or a text string
   */
  search(query: number[] | string, k: number = 5): SearchResult[] {
    const results: SearchResult[] = [];

    // Convert query to vector if it's a string
    const queryVector = typeof query === 'string'
      ? this.textToVector(query)
      : query;

    // Calculate cosine similarity for each pattern
    for (const [id, embedding] of this.patterns) {
      const similarity = this.cosineSimilar(queryVector, embedding);

      if (similarity > 0.1) { // Threshold
        results.push({ id, similarity });
      }
    }

    // Sort by similarity and return top-k
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, k).map(r => ({
      id: r.id,
      similarity: r.similarity,
    }));
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilar(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Convert text to vector (placeholder implementation)
   *
   * ⚠️ MVP WARNING: This is a simple hash-based pseudo-embedding.
   * It does NOT capture semantic meaning - only character-level similarity.
   *
   * For production, replace with real embeddings:
   * @example
   * // Using OpenAI via MCP
   * const embedding = await mcpClient.embeddings.create({
   *   model: "text-embedding-3-small",
   *   input: text
   * });
   */
  private textToVector(text: string): number[] {
    const vector = new Array(this.dimension).fill(0);

    // Simple hash-based pseudo-embedding
    for (let i = 0; i < text.length && i < this.dimension; i++) {
      const charCode = text.charCodeAt(i % this.dimension);
      const hash = (charCode * 31) / 127; // Normalize to 0-1
      vector[i] = (hash - 0.5) * 2 - 1;
    }

    return vector;
  }

  /**
   * Get index size
   */
  size(): number {
    return this.patterns.size;
  }

  /**
   * Clear index
   */
  clear(): void {
    this.patterns.clear();
  }

  /**
   * Export index to file (for persistence)
   */
  exportToFile(filePath: string): void {
    const data = {
      dimension: this.dimension,
      maxElements: this.maxElements,
      patterns: Array.from(this.patterns.entries()).map(([id, embedding]) => ({
        id,
        embedding,
      })),
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Import index from file
   */
  importFromFile(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    this.dimension = data.dimension;
    this.maxElements = data.maxElements;
    this.patterns.clear();

    for (const { id, embedding } of data.patterns) {
      this.patterns.set(id, embedding);
    }
  }
}

// Default export
export default HNSWIndex;
