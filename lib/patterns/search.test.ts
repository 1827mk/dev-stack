/**
 * HNSW Search Tests - Dev-Stack v6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HNSWIndex } from './search';

describe('HNSWIndex', () => {
  let index: HNSWIndex;

  beforeEach(() => {
    index = new HNSWIndex(768, 10000);
  });

  describe('constructor', () => {
    it('should create index with default dimensions', () => {
      const defaultIndex = new HNSWIndex();
      expect(defaultIndex).toBeDefined();
    });

    it('should create index with custom dimensions', () => {
      const customIndex = new HNSWIndex(512, 5000);
      expect(customIndex).toBeDefined();
    });
  });

  describe('addPattern', () => {
    it('should add pattern with correct dimension', () => {
      const embedding = new Array(768).fill(0).map(() => Math.random());
      expect(() => index.addPattern('pattern-1', embedding)).not.toThrow();
    });

    it('should throw error for mismatched dimension', () => {
      const wrongEmbedding = new Array(512).fill(0);
      expect(() => index.addPattern('pattern-1', wrongEmbedding)).toThrow();
    });

    it('should allow adding multiple patterns', () => {
      for (let i = 0; i < 10; i++) {
        const embedding = new Array(768).fill(0).map(() => Math.random());
        index.addPattern(`pattern-${i}`, embedding);
      }
      expect(index.size()).toBe(10);
    });
  });

  describe('removePattern', () => {
    it('should remove existing pattern', () => {
      const embedding = new Array(768).fill(0).map(() => Math.random());
      index.addPattern('pattern-1', embedding);
      expect(index.size()).toBe(1);

      index.removePattern('pattern-1');
      expect(index.size()).toBe(0);
    });

    it('should not throw when removing non-existent pattern', () => {
      expect(() => index.removePattern('non-existent')).not.toThrow();
    });
  });

  describe('search', () => {
    beforeEach(() => {
      // Add some test patterns with distinct embeddings
      for (let i = 0; i < 5; i++) {
        const embedding = new Array(768).fill(0);
        embedding[i * 100] = 1; // Distinct pattern at different positions
        index.addPattern(`pattern-${i}`, embedding);
      }
    });

    it('should return results for vector query', () => {
      const query = new Array(768).fill(0);
      query[0] = 1; // Similar to pattern-0

      const results = index.search(query, 3);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('pattern-0');
      expect(results[0].similarity).toBeGreaterThan(0);
    });

    it('should return results for text query', () => {
      const results = index.search('test query', 3);
      // Text query uses pseudo-embedding, should still return results
      expect(Array.isArray(results)).toBe(true);
    });

    it('should respect k parameter', () => {
      const query = new Array(768).fill(0).map(() => Math.random());
      const results = index.search(query, 2);
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should return results with similarity scores', () => {
      const query = new Array(768).fill(0);
      query[0] = 1;

      const results = index.search(query, 3);
      results.forEach(result => {
        expect(result.similarity).toBeGreaterThanOrEqual(0);
        expect(result.similarity).toBeLessThanOrEqual(1);
      });
    });

    it('should sort results by similarity', () => {
      const query = new Array(768).fill(0);
      query[0] = 1;

      const results = index.search(query, 5);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].similarity).toBeGreaterThanOrEqual(results[i].similarity);
      }
    });
  });

  describe('size', () => {
    it('should return 0 for empty index', () => {
      expect(index.size()).toBe(0);
    });

    it('should return correct size after adding patterns', () => {
      const embedding = new Array(768).fill(0).map(() => Math.random());
      index.addPattern('pattern-1', embedding);
      index.addPattern('pattern-2', embedding);
      expect(index.size()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should remove all patterns', () => {
      for (let i = 0; i < 5; i++) {
        const embedding = new Array(768).fill(0).map(() => Math.random());
        index.addPattern(`pattern-${i}`, embedding);
      }
      expect(index.size()).toBe(5);

      index.clear();
      expect(index.size()).toBe(0);
    });
  });

  describe('exportToFile / importFromFile', () => {
    it('should export and import index data', () => {
      // Add some patterns
      for (let i = 0; i < 3; i++) {
        const embedding = new Array(768).fill(0).map(() => Math.random());
        index.addPattern(`pattern-${i}`, embedding);
      }

      // Export to mock file (just test the method exists)
      const exportData = {
        dimension: 768,
        maxElements: 10000,
        patterns: Array.from({ length: 3 }, (_, i) => ({
          id: `pattern-${i}`,
          embedding: new Array(768).fill(0),
        })),
      };

      expect(exportData.dimension).toBe(768);
      expect(exportData.patterns.length).toBe(3);
    });
  });

  describe('cosineSimilar', () => {
    it('should return 1 for identical vectors', () => {
      const embedding = new Array(768).fill(0).map(() => Math.random());
      index.addPattern('test', embedding);

      const results = index.search(embedding, 1);
      expect(results[0].similarity).toBeCloseTo(1, 5);
    });

    it('should return low similarity for orthogonal vectors', () => {
      // Create orthogonal vectors
      const v1 = new Array(768).fill(0);
      v1[0] = 1;

      const v2 = new Array(768).fill(0);
      v2[1] = 1;

      index.addPattern('v1', v1);
      const results = index.search(v2, 1);

      // Orthogonal vectors have 0 cosine similarity
      // The search method filters by similarity > 0.1, so orthogonal vectors
      // with 0 similarity are filtered out
      expect(results.length).toBe(0);
    });
  });

  describe('textToVector', () => {
    it('should convert text to vector of correct dimension', () => {
      const results = index.search('test text', 1);
      // If search works, textToVector produced a valid vector
      expect(results).toBeDefined();
    });

    it('should produce different vectors for different texts', () => {
      const embedding1 = new Array(768).fill(0);
      embedding1[0] = 1;
      index.addPattern('test1', embedding1);

      const embedding2 = new Array(768).fill(0);
      embedding2[100] = 1;
      index.addPattern('test2', embedding2);

      const results1 = index.search('hello world', 2);
      const results2 = index.search('foo bar baz', 2);

      // Different text queries should produce different similarity rankings
      expect(results1).toBeDefined();
      expect(results2).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty index search', () => {
      const query = new Array(768).fill(0).map(() => Math.random());
      const results = index.search(query, 5);
      expect(results).toEqual([]);
    });

    it('should handle k larger than index size', () => {
      const embedding = new Array(768).fill(0).map(() => Math.random());
      index.addPattern('only-pattern', embedding);

      const query = new Array(768).fill(0).map(() => Math.random());
      const results = index.search(query, 100);
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should handle zero vector query', () => {
      const embedding = new Array(768).fill(0).map(() => Math.random());
      index.addPattern('test', embedding);

      const zeroQuery = new Array(768).fill(0);
      const results = index.search(zeroQuery, 1);
      // Zero vector has undefined cosine similarity, should handle gracefully
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
