/**
 * Test Setup for Dev-Stack v6 Plugin
 * Global test configuration and mocks
 */

import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment for tests
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DEV_STACK_TEST_MODE = 'true';

  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  vi.spyOn(console, 'trace').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Global test utilities
declare global {
  let testUtils: {
    createMockDNA: () => import('./dna/types').ProjectDNA;
    createMockPattern: () => import('./patterns/types').Pattern;
    createMockCheckpoint: () => import('./checkpoint/types').Checkpoint;
  };
}

// Export test fixtures
export const fixtures = {
  thaiInput: 'หาว่า authentication ทำงานยังไง',
  englishInput: 'Find how authentication works',
  mixedInput: 'Fix bug ในหน้า checkout',
  emptyInput: '',
  longInput: 'a'.repeat(15000),
  codeInput: `
    function authenticate(user: User) {
      return jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    }
  `
};

export const mockProjectDNA = {
  id: 'test-project-001',
  name: 'test-api',
  type: 'api' as const,
  primary_language: 'TypeScript',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: '1.0.0',
  tech_stack: {
    framework: 'Express',
    database: 'PostgreSQL',
    testing: 'Vitest'
  },
  entry_points: [
    { path: 'src/index.ts', type: 'main' as const }
  ],
  key_directories: [
    { path: 'src/routes', purpose: 'API routes' },
    { path: 'src/middleware', purpose: 'Express middleware' }
  ],
  coding_style: {
    naming: 'camelCase' as const,
    formatter: 'prettier' as const,
    component_pattern: 'functional' as const
  },
  protected_paths: [
    { path: '.env', reason: 'Environment secrets' }
  ],
  high_coupling: [],
  what_works: [],
  what_not_to_do: [],
  user_preferences: []
};

export const mockPattern = {
  id: 'pattern-001',
  type: 'solution' as const,
  name: 'auth_middleware_jwt',
  description: 'JWT authentication middleware pattern',
  code_example: 'export function authMiddleware(req, res, next) { ... }',
  tags: ['auth', 'middleware', 'security'],
  embedding: null,
  success_count: 5,
  failure_count: 1,
  confidence: 0.83,
  last_used: new Date().toISOString(),
  source_project: 'test-project-001',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockCheckpoint = {
  session_id: 'session-001',
  created_at: new Date().toISOString(),
  base_sha: 'abc123def456',
  task_hash: 'task-hash-001',
  started_at: new Date().toISOString(),
  turns: 10,
  user_request: 'Add authentication system',
  derived_intent: 'add_jwt_authentication',
  complexity_score: 0.65,
  execution_mode: 'PLAN_FIRST' as const,
  phase: 'BUILD' as const,
  phase_progress: '3/6',
  completed_steps: [
    { step: 'THINK', status: 'success' as const },
    { step: 'RESEARCH', status: 'success' as const }
  ],
  pending_steps: [
    { step: 'TEST', estimated_tokens: 1000 }
  ],
  files_created: ['src/auth/jwt.ts'],
  files_modified: ['src/middleware/auth.ts'],
  files_deleted: [],
  decisions: [
    { decision: 'Use JWT for authentication', reasoning: 'Stateless, scalable', user_approved: true }
  ],
  next_actions: [
    { action: 'Write tests for JWT validation', priority: 'high' as const }
  ]
};
