/**
 * Pattern Adapter - Dev-Stack v6
 * Context-aware pattern adaptation for cross-project transfers
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Pattern,
  PatternType,
  AdaptationContext,
  PatternTransferResult,
} from './types';
import { PatternStore } from './store';

/**
 * Tech stack mapping for adaptation
 */
interface TechMapping {
  source: string;
  target: string;
  transform?: (code: string) => string;
}

/**
 * Common tech stack mappings
 */
const DEFAULT_TECH_MAPPINGS: TechMapping[] = [
  // JavaScript frameworks
  { source: 'react', target: 'vue', transform: adaptReactToVue },
  { source: 'vue', target: 'react', transform: adaptVueToReact },
  // Testing frameworks
  { source: 'jest', target: 'vitest', transform: adaptJestToVitest },
  { source: 'vitest', target: 'jest', transform: adaptVitestToJest },
  // Languages
  { source: 'javascript', target: 'typescript', transform: adaptJsToTs },
  { source: 'typescript', target: 'javascript', transform: adaptTsToJs },
];

/**
 * Pattern Adapter
 * Adapts patterns from one project context to another
 */
export class PatternAdapter {
  private store: PatternStore;
  private techMappings: Map<string, TechMapping>;

  constructor(store: PatternStore, customMappings: TechMapping[] = []) {
    this.store = store;
    this.techMappings = new Map();

    // Load default mappings
    for (const mapping of DEFAULT_TECH_MAPPINGS) {
      const key = `${mapping.source}:${mapping.target}`;
      this.techMappings.set(key, mapping);
    }

    // Load custom mappings
    for (const mapping of customMappings) {
      const key = `${mapping.source}:${mapping.target}`;
      this.techMappings.set(key, mapping);
    }
  }

  /**
   * Transfer patterns from one project to another
   */
  async transferPatterns(
    sourceProject: string,
    targetProject: string,
    context: AdaptationContext,
    filter?: {
      types?: PatternType[];
      minConfidence?: number;
      tags?: string[];
    }
  ): Promise<PatternTransferResult> {
    const result: PatternTransferResult = {
      source_project: sourceProject,
      target_project: targetProject,
      transferred: [],
      skipped: [],
      adapted: [],
      errors: [],
    };

    // Get all patterns from source project
    const patterns = await this.getPatternsForTransfer(sourceProject, filter);

    for (const pattern of patterns) {
      try {
        // Check if pattern needs adaptation
        const needsAdaptation = this.needsAdaptation(pattern, context);

        if (!needsAdaptation) {
          // Transfer directly
          await this.store.savePattern({
            ...pattern,
            source_project: targetProject,
          });
          result.transferred.push(pattern);
        } else {
          // Adapt the pattern
          const adaptedPattern = await this.adaptPattern(pattern, context);

          if (adaptedPattern) {
            await this.store.savePattern({
              type: adaptedPattern.type,
              name: adaptedPattern.name,
              description: adaptedPattern.description,
              code_example: adaptedPattern.code_example,
              template: adaptedPattern.template,
              tags: adaptedPattern.tags,
              source_project: targetProject,
            });
            result.adapted.push(adaptedPattern);
          } else {
            result.skipped.push(pattern);
          }
        }
      } catch (error) {
        result.errors.push(
          `Failed to transfer pattern ${pattern.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return result;
  }

  /**
   * Adapt a single pattern to new context
   */
  async adaptPattern(
    pattern: Pattern,
    context: AdaptationContext
  ): Promise<Pattern | null> {
    // Check if we have mapping for the tech stacks
    let adaptedCode = pattern.code_example;
    let adaptedTemplate = pattern.template;

    // Adapt code example if present
    if (adaptedCode) {
      for (const [sourceTech, targetTech] of Object.entries(context.framework_mappings)) {
        const key = `${sourceTech}:${targetTech}`;
        const mapping = this.techMappings.get(key);

        if (mapping?.transform) {
          adaptedCode = mapping.transform(adaptedCode);
        }
      }
    }

    // Adapt template if present
    if (adaptedTemplate) {
      adaptedTemplate = this.adaptTemplateVariables(adaptedTemplate, context);
    }

    // Update tags based on new tech stack
    const adaptedTags = this.adaptTags(pattern.tags, context);

    // Create adapted pattern with a new ID
    const adapted: Pattern = {
      ...pattern,
      id: uuidv4(), // Generate new ID for adapted pattern
      code_example: adaptedCode,
      template: adaptedTemplate,
      tags: adaptedTags,
      source_project: context.naming_convention.target,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: pattern.version + 1,
      // Reset statistics for new project
      success_count: 0,
      failure_count: 0,
      confidence: 0.5,
      usage_count: 0,
      // Mark as adapted from original
      status: 'active',
    };

    return adapted;
  }

  /**
   * Check if pattern needs adaptation
   */
  private needsAdaptation(pattern: Pattern, context: AdaptationContext): boolean {
    // Check if any source tech is different from target tech
    for (const [source, target] of Object.entries(context.framework_mappings)) {
      if (source !== target) {
        // Check if pattern mentions the source tech
        const patternText = `${pattern.name} ${pattern.description} ${pattern.code_example || ''}`.toLowerCase();
        if (patternText.includes(source.toLowerCase())) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get patterns eligible for transfer
   */
  private async getPatternsForTransfer(
    sourceProject: string,
    filter?: {
      types?: PatternType[];
      minConfidence?: number;
      tags?: string[];
    }
  ): Promise<Pattern[]> {
    const patterns: Pattern[] = [];

    // Get all pattern types if not specified
    const types = filter?.types ?? this.store.getAllPatternTypes();

    for (const type of types) {
      const typePatterns = this.store.getPatternsByType(type);

      for (const pattern of typePatterns) {
        // Filter by source project
        if (pattern.source_project !== sourceProject) {
          continue;
        }

        // Filter by minimum confidence
        if (filter?.minConfidence !== undefined && pattern.confidence < filter.minConfidence) {
          continue;
        }

        // Filter by tags
        if (filter?.tags && filter.tags.length > 0) {
          const hasMatchingTag = filter.tags.some(tag => pattern.tags.includes(tag));
          if (!hasMatchingTag) {
            continue;
          }
        }

        // Only include patterns with reasonable success rate
        if (pattern.success_count > 0 || pattern.usage_count >= 3) {
          patterns.push(pattern);
        }
      }
    }

    // Sort by confidence and usage
    return patterns.sort((a, b) => {
      const scoreA = a.confidence * 0.7 + (a.usage_count / 100) * 0.3;
      const scoreB = b.confidence * 0.7 + (b.usage_count / 100) * 0.3;
      return scoreB - scoreA;
    });
  }

  /**
   * Adapt template variables to new context
   */
  private adaptTemplateVariables(template: string, context: AdaptationContext): string {
    let adapted = template;

    // Replace naming conventions
    if (context.naming_convention.source !== context.naming_convention.target) {
      // Apply naming convention transformation
      adapted = this.applyNamingConvention(
        adapted,
        context.naming_convention.source,
        context.naming_convention.target
      );
    }

    // Replace tech-specific placeholders
    for (const [source, target] of Object.entries(context.framework_mappings)) {
      const sourceRegex = new RegExp(`\\{\\{\\s*${source}_\\w+\\s*\\}\\}`, 'gi');
      adapted = adapted.replace(sourceRegex, (match) =>
        match.replace(new RegExp(source, 'gi'), target)
      );
    }

    return adapted;
  }

  /**
   * Apply naming convention transformation
   */
  private applyNamingConvention(
    text: string,
    sourceConvention: string,
    targetConvention: string
  ): string {
    // Simple implementation - in production would use proper case conversion
    if (sourceConvention === 'camelCase' && targetConvention === 'snake_case') {
      return text.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }
    if (sourceConvention === 'snake_case' && targetConvention === 'camelCase') {
      return text.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }
    if (sourceConvention === 'kebab-case' && targetConvention === 'camelCase') {
      return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    return text;
  }

  /**
   * Adapt tags to new context
   */
  private adaptTags(tags: string[], context: AdaptationContext): string[] {
    const adaptedTags = new Set<string>();

    for (const tag of tags) {
      let adaptedTag = tag;

      // Map tech-specific tags
      for (const [source, target] of Object.entries(context.framework_mappings)) {
        if (tag.toLowerCase() === source.toLowerCase()) {
          adaptedTag = target;
        }
      }

      adaptedTags.add(adaptedTag);
    }

    return Array.from(adaptedTags);
  }

  /**
   * Add custom tech mapping
   */
  addTechMapping(mapping: TechMapping): void {
    const key = `${mapping.source}:${mapping.target}`;
    this.techMappings.set(key, mapping);
  }

  /**
   * Get available tech mappings
   */
  getAvailableMappings(): string[] {
    return Array.from(this.techMappings.keys());
  }
}

// ============================================
// Tech-specific transformation functions
// ============================================

/**
 * Adapt React code to Vue
 */
function adaptReactToVue(code: string): string {
  let adapted = code;

  // Convert useState to ref
  adapted = adapted.replace(
    /const\s+\[(\w+),\s*set(\w+)\]\s*=\s*useState\(([^)]*)\)/g,
    'const $1 = ref($3)'
  );

  // Convert useEffect to onMounted/watch
  adapted = adapted.replace(
    /useEffect\(\s*\(\)\s*=>\s*\{/g,
    'onMounted(() => {'
  );

  // Convert className to class
  adapted = adapted.replace(/className=/g, 'class=');

  return adapted;
}

/**
 * Adapt Vue code to React
 */
function adaptVueToReact(code: string): string {
  let adapted = code;

  // Convert ref to useState
  adapted = adapted.replace(
    /const\s+(\w+)\s*=\s*ref\(([^)]*)\)/g,
    'const [$1, set$1] = useState($2)'
  );

  // Convert onMounted to useEffect
  adapted = adapted.replace(
    /onMounted\(\s*\(\)\s*=>\s*\{/g,
    'useEffect(() => {'
  );

  // Convert class to className
  adapted = adapted.replace(/class=/g, 'className=');

  return adapted;
}

/**
 * Adapt Jest tests to Vitest
 */
function adaptJestToVitest(code: string): string {
  let adapted = code;

  // Replace jest with vi
  adapted = adapted.replace(/jest\./g, 'vi.');
  adapted = adapted.replace(/jest\s*\(/g, 'vi.');

  // Vitest uses similar API, mostly direct replacement
  return adapted;
}

/**
 * Adapt Vitest tests to Jest
 */
function adaptVitestToJest(code: string): string {
  let adapted = code;

  // Replace vi with jest
  adapted = adapted.replace(/vi\./g, 'jest.');
  adapted = adapted.replace(/vi\s*\(/g, 'jest.');

  return adapted;
}

/**
 * Adapt JavaScript to TypeScript
 */
function adaptJsToTs(code: string): string {
  let adapted = code;

  // Add type annotations to function parameters (basic)
  adapted = adapted.replace(
    /function\s+(\w+)\s*\(([^)]*)\)/g,
    (_match, name, params) => {
      const typedParams = params.split(',').map((p: string) => {
        const trimmed = p.trim();
        if (!trimmed) return trimmed;
        // Add basic type annotation
        if (trimmed.includes('=')) {
          return `${trimmed}: any`;
        }
        return `${trimmed}: any`;
      }).join(', ');
      return `function ${name}(${typedParams})`;
    }
  );

  // Add return type
  adapted = adapted.replace(
    /function\s+(\w+)\s*\([^)]*\)\s*\{/g,
    '$&: any {'
  );

  return adapted;
}

/**
 * Adapt TypeScript to JavaScript
 */
function adaptTsToJs(code: string): string {
  let adapted = code;

  // Remove type annotations
  adapted = adapted.replace(/:\s*(string|number|boolean|any|void|never|unknown|object)\s*([,)])/g, '$2');
  adapted = adapted.replace(/:\s*(string|number|boolean|any|void|never|unknown|object)\s*=/g, ' =');
  adapted = adapted.replace(/:\s*(string|number|boolean|any|void|never|unknown|object)\s*;/g, ';');

  // Remove interface/type declarations
  adapted = adapted.replace(/^(interface|type)\s+\w+[^{]*\{[^}]*\}/gm, '');

  // Remove generic type parameters
  adapted = adapted.replace(/<[^>]+>/g, '');

  return adapted;
}

// Default export
export default PatternAdapter;
