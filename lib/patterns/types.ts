/**
 * Pattern Types - Dev-Stack v6
 * Patterns are reusable solutions with vector embeddings for similarity search
 */

/**
 * Pattern type enumeration
 */
export type PatternType =
  | 'code_pattern'
  | 'solution'
  | 'anti_pattern'
  | 'workflow'
  | 'decision'
  | 'refactor'
  | 'debug';

/**
 * Pattern status
 */
export type PatternStatus = 'active' | 'deprecated' | 'experimental' | 'archived';

/**
 * Pattern confidence level
 */
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'verified';

/**
 * Vector embedding type
 */
export interface VectorEmbedding {
  vector: number[];
  dimensions: number;
  model: string; // e.g., 'ada-002', 'local-768'
  created_at: string;
}

/**
 * Pattern - Main interface
 * Reusable solution or approach with vector embedding
 */
export interface Pattern {
  // Identity
  id: string; // UUID
  type: PatternType;
  name: string; // Human-readable name (e.g., 'auth_middleware_jwt')
  description: string;

  // Content
  code_example?: string;
  template?: string; // Template with placeholders
  documentation?: string;

  // Classification
  tags: string[];
  category?: string;
  subcategory?: string;

  // Embedding
  embedding?: VectorEmbedding | null;

  // Statistics
  success_count: number;
  failure_count: number;
  confidence: number; // Calculated: success / (success + failure)
  status: PatternStatus;

  // Usage
  last_used?: string; // ISO datetime
  usage_count: number;

  // Source
  source_project: string;
  source_file?: string;
  source_commit?: string;

  // Context
  applicable_contexts?: string[]; // When this pattern applies
  prerequisites?: string[]; // What must be true
  consequences?: string[]; // What happens when applied

  // Metadata
  created_at: string;
  updated_at: string;
  version: number;
}

/**
 * Pattern search result
 */
export interface PatternSearchResult {
  pattern: Pattern;
  similarity_score: number; // 0.0-1.0
  rank: number;
  highlight?: string; // Matched content highlight
}

/**
 * HNSW search options
 */
export interface HNSWSearchOptions {
  query: string;
  top_k: number;
  min_similarity: number; // Minimum similarity threshold
  filters?: PatternFilters;
  include_embedding?: boolean;
}

/**
 * Pattern filters
 */
export interface PatternFilters {
  types?: PatternType[];
  tags?: string[];
  min_confidence?: number;
  max_confidence?: number;
  min_success_count?: number;
  source_project?: string;
  status?: PatternStatus[];
  created_after?: string;
  created_before?: string;
}

/**
 * Pattern creation input
 */
export interface CreatePatternInput {
  type: PatternType;
  name: string;
  description: string;
  code_example?: string;
  template?: string;
  tags: string[];
  source_project: string;
  source_file?: string;
  applicable_contexts?: string[];
  prerequisites?: string[];
  consequences?: string[];
}

/**
 * Pattern update input
 */
export interface UpdatePatternInput {
  name?: string;
  description?: string;
  code_example?: string;
  template?: string;
  tags?: string[];
  status?: PatternStatus;
  applicable_contexts?: string[];
}

/**
 * Pattern usage record
 */
export interface PatternUsage {
  pattern_id: string;
  session_id: string;
  used_at: string;
  success: boolean;
  context: string;
  user_feedback?: 'positive' | 'negative' | 'neutral';
  adaptation_made?: string;
}

/**
 * Pattern transfer result
 */
export interface PatternTransferResult {
  source_project: string;
  target_project: string;
  transferred: Pattern[];
  skipped: Pattern[];
  adapted: Pattern[];
  errors: string[];
}

/**
 * Pattern adaptation context
 */
export interface AdaptationContext {
  source_tech_stack: Record<string, string>;
  target_tech_stack: Record<string, string>;
  naming_convention: {
    source: string;
    target: string;
  };
  framework_mappings: Record<string, string>;
}

/**
 * Pattern database schema
 */
export interface PatternDatabaseSchema {
  patterns: Pattern[];
  metadata: {
    version: string;
    total_patterns: number;
    last_indexed: string;
    embedding_model: string;
    embedding_dimensions: number;
  };
  indexes: {
    hnsw: {
      m: number;
      ef_construction: number;
      ef_search: number;
    };
    tags: string[];
    types: PatternType[];
  };
}

/**
 * Similarity metrics
 */
export type SimilarityMetric = 'cosine' | 'euclidean' | 'dot_product' | 'manhattan';
