/**
 * DNA Types - Dev-Stack v6
 * Project DNA represents persistent knowledge about a project
 */

/**
 * Supported project types
 */
export type ProjectType = 'web-app' | 'api' | 'library' | 'cli' | 'mobile';

/**
 * Naming convention preference
 */
export type NamingConvention = 'camelCase' | 'snake_case' | 'PascalCase' | 'kebab-case';

/**
 * Code formatter preference
 */
export type FormatterType = 'prettier' | 'black' | 'rustfmt' | 'gofmt' | 'none';

/**
 * Component pattern preference
 */
export type ComponentPattern = 'functional' | 'class-based' | 'hooks' | 'composition';

/**
 * API pattern type
 */
export type ApiPattern = 'REST' | 'GraphQL' | 'RPC' | 'gRPC' | 'mixed';

/**
 * Technology stack definition
 */
export interface TechStack {
  framework: string;
  database: string;
  testing: string;
  orm?: string;
  auth?: string;
  cache?: string;
  queue?: string;
  deployment?: string;
}

/**
 * Entry point definition
 */
export interface EntryPoint {
  path: string;
  type: 'main' | 'route' | 'handler' | 'index' | 'worker' | 'cron';
  description?: string;
}

/**
 * Key directory definition
 */
export interface KeyDirectory {
  path: string;
  purpose: string;
  file_count?: number;
}

/**
 * Coding style preferences
 */
export interface CodingStyle {
  naming: NamingConvention;
  formatter: FormatterType;
  component_pattern: ComponentPattern;
  api_pattern?: ApiPattern;
  indent_size?: number;
  max_line_length?: number;
}

/**
 * Protected path definition
 */
export interface ProtectedPath {
  path: string;
  reason: string;
  pattern?: string; // glob pattern
}

/**
 * High coupling area definition
 */
export interface HighCouplingArea {
  files: string[];
  risk: string;
  coupling_score?: number; // 0.0-1.0
}

/**
 * Successful pattern record
 */
export interface WhatWorks {
  pattern: string;
  context: string;
  success_count?: number;
}

/**
 * Anti-pattern record
 */
export interface WhatNotToDo {
  anti_pattern: string;
  reason: string;
  failure_count?: number;
}

/**
 * User preference record
 */
export interface UserPreference {
  preference: string;
  value: string;
  confidence?: number; // 0.0-1.0
}

/**
 * Risk area definition
 */
export interface RiskArea {
  area: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation?: string;
}

/**
 * Project DNA - Main interface
 * Represents the accumulated understanding of the codebase
 */
export interface ProjectDNA {
  // Identity
  id: string; // UUID
  name: string;
  type: ProjectType;
  primary_language: string;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  version: string; // DNA schema version (semver)

  // Tech Stack
  tech_stack: TechStack;

  // Architecture
  entry_points: EntryPoint[];
  key_directories: KeyDirectory[];
  architecture_pattern?: 'monolith' | 'microservices' | 'serverless' | 'modular';

  // Patterns
  coding_style: CodingStyle;
  conventions?: Record<string, string>;

  // Risk Areas
  protected_paths: ProtectedPath[];
  high_coupling: HighCouplingArea[];
  risk_areas?: RiskArea[];

  // Learnings
  what_works: WhatWorks[];
  what_not_to_do: WhatNotToDo[];
  user_preferences: UserPreference[];

  // Metadata
  total_files?: number;
  total_lines?: number;
  last_scan_duration_ms?: number;
}

/**
 * DNA scan options
 */
export interface ScanOptions {
  deep: boolean; // Include dependency analysis
  force: boolean; // Force rescan even if DNA exists
  include_patterns: string[]; // File patterns to include
  exclude_patterns: string[]; // File patterns to exclude
  max_files: number; // Maximum files to scan
}

/**
 * DNA diff result
 */
export interface DNADiff {
  added: Partial<ProjectDNA>;
  removed: Partial<ProjectDNA>;
  changed: Partial<ProjectDNA>;
  similarity_score: number; // 0.0-1.0
}

/**
 * DNA storage format (YAML frontmatter + Markdown body)
 */
export interface DNAStorage {
  frontmatter: Omit<ProjectDNA, 'what_works' | 'what_not_to_do' | 'user_preferences'>;
  body: {
    learnings: string; // Markdown content
    patterns: string; // Markdown content
    notes: string; // Markdown content
  };
}
