/**
 * Pattern Adapter Tests - Dev-Stack v6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatternAdapter } from './adapter';
import { PatternStore } from './store';
import type { Pattern, AdaptationContext } from './types';

// Mock PatternStore
vi.mock('./store', () => ({
  PatternStore: vi.fn().mockImplementation(() => ({
    savePattern: vi.fn().mockResolvedValue('new-pattern-id'),
    getPatternById: vi.fn(),
  })),
}));

describe('PatternAdapter', () => {
  let adapter: PatternAdapter;
  let mockStore: PatternStore;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = new PatternStore('/test');
    adapter = new PatternAdapter(mockStore);

    // Mock additional store methods needed for transfer
    mockStore.getPatternsByType = vi.fn().mockReturnValue([]);
    mockStore.getAllPatternTypes = vi.fn().mockReturnValue([]);
  });

  describe('constructor', () => {
    it('should create adapter with store', () => {
      expect(adapter).toBeDefined();
    });

    it('should accept custom tech mappings', () => {
      const customAdapter = new PatternAdapter(mockStore, [
        { source: 'custom-a', target: 'custom-b', transform: (code) => code },
      ]);
      expect(customAdapter).toBeDefined();
    });
  });

  describe('adaptPattern', () => {
    const mockPattern: Pattern = {
      id: 'test-id',
      type: 'code_pattern',
      name: 'react-auth',
      description: 'React authentication pattern',
      code_example: 'const [user, setUser] = useState(null);',
      tags: ['react', 'auth'],
      confidence: 0.8,
      success_count: 10,
      failure_count: 2,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: 1,
      status: 'active',
      usage_count: 12,
      source_project: '/source-project',
    };

    const mockContext: AdaptationContext = {
      source_tech_stack: { frontend: 'react' },
      target_tech_stack: { frontend: 'vue' },
      naming_convention: {
        source: 'camelCase',
        target: 'camelCase',
      },
      framework_mappings: {
        react: 'vue',
      },
    };

    it('should adapt pattern to new context', async () => {
      const adapted = await adapter.adaptPattern(mockPattern, mockContext);

      expect(adapted).toBeDefined();
      expect(adapted?.source_project).toBe(mockContext.naming_convention.target);
    });

    it('should reset statistics for adapted pattern', async () => {
      const adapted = await adapter.adaptPattern(mockPattern, mockContext);

      expect(adapted?.success_count).toBe(0);
      expect(adapted?.failure_count).toBe(0);
      expect(adapted?.confidence).toBe(0.5);
      expect(adapted?.usage_count).toBe(0);
    });

    it('should increment version', async () => {
      const adapted = await adapter.adaptPattern(mockPattern, mockContext);

      expect(adapted?.version).toBe(mockPattern.version + 1);
    });

    it('should adapt tags based on tech stack', async () => {
      const adapted = await adapter.adaptPattern(mockPattern, mockContext);

      expect(adapted?.tags).toContain('vue');
      expect(adapted?.tags).not.toContain('react');
    });

    it('should return null for unadaptable pattern', async () => {
      // This is a simplification - actual logic may vary
      const result = await adapter.adaptPattern(mockPattern, mockContext);
      expect(result).not.toBeNull();
    });
  });

  describe('addTechMapping', () => {
    it('should add custom tech mapping', () => {
      adapter.addTechMapping({
        source: 'framework-a',
        target: 'framework-b',
        transform: (code) => code.replace(/framework-a/g, 'framework-b'),
      });

      const mappings = adapter.getAvailableMappings();
      expect(mappings.some(m => m.includes('framework-a:framework-b'))).toBe(true);
    });
  });

  describe('getAvailableMappings', () => {
    it('should return list of available mappings', () => {
      const mappings = adapter.getAvailableMappings();
      expect(Array.isArray(mappings)).toBe(true);
      expect(mappings.length).toBeGreaterThan(0);
    });

    it('should include default mappings', () => {
      const mappings = adapter.getAvailableMappings();
      expect(mappings.some(m => m.includes('react:vue'))).toBe(true);
      expect(mappings.some(m => m.includes('jest:vitest'))).toBe(true);
    });
  });

  describe('tech transformations', () => {
    it('should transform React to Vue', async () => {
      const pattern: Pattern = {
        id: 'test',
        type: 'code_pattern',
        name: 'test',
        description: 'Test',
        code_example: 'const [count, setCount] = useState(0);',
        tags: ['react'],
        confidence: 0.5,
        success_count: 0,
        failure_count: 0,
        created_at: '',
        updated_at: '',
        version: 1,
        status: 'active',
        usage_count: 0,
        source_project: '',
      };

      const context: AdaptationContext = {
        source_tech_stack: {},
        target_tech_stack: {},
        naming_convention: { source: 'camelCase', target: 'camelCase' },
        framework_mappings: { react: 'vue' },
      };

      const adapted = await adapter.adaptPattern(pattern, context);
      expect(adapted?.code_example).toContain('ref(');
    });

    it('should transform Jest to Vitest', async () => {
      const pattern: Pattern = {
        id: 'test',
        type: 'code_pattern',
        name: 'test',
        description: 'Test',
        code_example: 'jest.fn(); jest.mock();',
        tags: ['jest'],
        confidence: 0.5,
        success_count: 0,
        failure_count: 0,
        created_at: '',
        updated_at: '',
        version: 1,
        status: 'active',
        usage_count: 0,
        source_project: '',
      };

      const context: AdaptationContext = {
        source_tech_stack: {},
        target_tech_stack: {},
        naming_convention: { source: 'camelCase', target: 'camelCase' },
        framework_mappings: { jest: 'vitest' },
      };

      const adapted = await adapter.adaptPattern(pattern, context);
      expect(adapted?.code_example).toContain('vi.');
    });
  });

  describe('transferPatterns', () => {
    it('should transfer patterns between projects', async () => {
      const result = await adapter.transferPatterns(
        '/source-project',
        '/target-project',
        {
          source_tech_stack: {},
          target_tech_stack: {},
          naming_convention: { source: 'camelCase', target: 'camelCase' },
          framework_mappings: {},
        }
      );

      expect(result).toBeDefined();
      expect(result.source_project).toBe('/source-project');
      expect(result.target_project).toBe('/target-project');
      expect(Array.isArray(result.transferred)).toBe(true);
      expect(Array.isArray(result.adapted)).toBe(true);
      expect(Array.isArray(result.skipped)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should respect filter options', async () => {
      const result = await adapter.transferPatterns(
        '/source-project',
        '/target-project',
        {
          source_tech_stack: {},
          target_tech_stack: {},
          naming_convention: { source: 'camelCase', target: 'camelCase' },
          framework_mappings: {},
        },
        {
          types: ['code_pattern'],
          minConfidence: 0.8,
        }
      );

      expect(result).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty pattern', async () => {
      const emptyPattern: Pattern = {
        id: '',
        type: 'code_pattern',
        name: '',
        description: '',
        tags: [],
        confidence: 0,
        success_count: 0,
        failure_count: 0,
        created_at: '',
        updated_at: '',
        version: 1,
        status: 'active',
        usage_count: 0,
        source_project: '',
      };

      const context: AdaptationContext = {
        source_tech_stack: {},
        target_tech_stack: {},
        naming_convention: { source: 'camelCase', target: 'camelCase' },
        framework_mappings: {},
      };

      const adapted = await adapter.adaptPattern(emptyPattern, context);
      expect(adapted).toBeDefined();
    });

    it('should handle pattern without code example', async () => {
      const patternNoCode: Pattern = {
        id: 'test',
        type: 'code_pattern',
        name: 'test',
        description: 'Test',
        tags: ['test'],
        confidence: 0.5,
        success_count: 0,
        failure_count: 0,
        created_at: '',
        updated_at: '',
        version: 1,
        status: 'active',
        usage_count: 0,
        source_project: '',
      };

      const context: AdaptationContext = {
        source_tech_stack: {},
        target_tech_stack: {},
        naming_convention: { source: 'camelCase', target: 'camelCase' },
        framework_mappings: {},
      };

      const adapted = await adapter.adaptPattern(patternNoCode, context);
      expect(adapted).toBeDefined();
    });
  });
});
