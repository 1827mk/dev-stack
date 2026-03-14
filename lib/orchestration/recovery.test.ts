/**
 * Recovery Tests - Dev-Stack v6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FailureRecoveryManager,
  createFailureRecoveryManager
} from './recovery.js';

describe('FailureRecoveryManager', () => {
  let recovery: FailureRecoveryManager;
  const projectRoot = '/tmp/test-project';

  beforeEach(() => {
    recovery = new FailureRecoveryManager(projectRoot);
  });

  describe('constructor', () => {
    it('should create recovery with default config', () => {
      expect(recovery).toBeDefined();
    });

    it('should accept custom retry config', () => {
      const customRecovery = new FailureRecoveryManager(projectRoot, {
        max_attempts: 5,
        backoff_ms: [100, 200, 300, 400, 500],
        retryable_types: ['network_timeout', 'rate_limit', 'validation_error']
      });
      expect(customRecovery).toBeDefined();
    });
  });

  describe('recordFailure', () => {
    it('should record a failure', () => {
      const record = recovery.recordFailure(
        'network_timeout',
        'fetch_data',
        'Network request timed out'
      );
      expect(record.id).toBeDefined();
      expect(record.type).toBe('network_timeout');
      expect(record.operation).toBe('fetch_data');
      expect(record.message).toBe('Network request timed out');
      expect(record.recovered).toBe(false);
    });

    it('should include context', () => {
      const record = recovery.recordFailure(
        'validation_error',
        'validate_input',
        'Invalid input',
        { field: 'email', value: 'invalid' }
      );
      expect(record.context).toEqual({ field: 'email', value: 'invalid' });
    });
  });

  describe('determineStrategy', () => {
    it('should return retry for retryable types', () => {
      const failure = recovery.recordFailure(
        'network_timeout',
        'fetch_data',
        'Network timeout'
      );
      const strategy = recovery.determineStrategy(failure);
      expect(strategy).toBe('retry');
    });

    it('should return retry for rate_limit', () => {
      const failure = recovery.recordFailure(
        'rate_limit',
        'api_call',
        'Rate limit exceeded'
      );
      const strategy = recovery.determineStrategy(failure);
      expect(strategy).toBe('retry');
    });

    it('should return abort for critical failures', () => {
      const failure = recovery.recordFailure(
        'permission_denied',
        'write_file',
        'Permission denied'
      );
      const strategy = recovery.determineStrategy(failure);
      expect(strategy).toBe('abort');
    });

    it('should return abort for guard_blocked', () => {
      const failure = recovery.recordFailure(
        'guard_blocked',
        'delete_file',
        'Blocked by scope guard'
      );
      const strategy = recovery.determineStrategy(failure);
      expect(strategy).toBe('abort');
    });

    it('should return abort for user_abort', () => {
      const failure = recovery.recordFailure(
        'user_abort',
        'operation',
        'User cancelled'
      );
      const strategy = recovery.determineStrategy(failure);
      expect(strategy).toBe('abort');
    });

    it('should return skip for test_failure', () => {
      const failure = recovery.recordFailure(
        'test_failure',
        'run_tests',
        'Test failed'
      );
      const strategy = recovery.determineStrategy(failure);
      expect(strategy).toBe('skip');
    });

    it('should return escalate for unknown errors', () => {
      const failure = recovery.recordFailure(
        'unknown_error',
        'unknown',
        'Unknown error occurred'
      );
      const strategy = recovery.determineStrategy(failure);
      expect(strategy).toBe('escalate');
    });
  });

  describe('executeRetry', () => {
    it('should retry and succeed', async () => {
      const failure = recovery.recordFailure(
        'network_timeout',
        'fetch_data',
        'Network timeout'
      );

      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValueOnce('success');

      const result = await recovery.executeRetry(failure, operation);
      expect(result.success).toBe(true);
      expect(result.strategy).toBe('retry');
    });

    it('should fail after max retries', async () => {
      const failure = recovery.recordFailure(
        'network_timeout',
        'fetch_data',
        'Network timeout'
      );

      const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

      const result = await recovery.executeRetry(failure, operation);
      expect(result.success).toBe(false);
      expect(result.attempts).toBeGreaterThan(1);
    });
  });

  describe('getRollbackTargets', () => {
    it('should return rollback targets', () => {
      const targets = recovery.getRollbackTargets();
      expect(targets.length).toBeGreaterThan(0);
      expect(targets.some(t => t.level === 'action')).toBe(true);
      expect(targets.some(t => t.level === 'phase')).toBe(true);
      expect(targets.some(t => t.level === 'task')).toBe(true);
      expect(targets.some(t => t.level === 'base')).toBe(true);
    });
  });

  describe('executeRollback', () => {
    it('should execute action rollback', async () => {
      const result = await recovery.executeRollback({
        level: 'action',
        description: 'Undo last action',
        affected_files: []
      });
      expect(result.success).toBe(true);
      expect(result.rollback_performed).toBe(true);
    });

    it('should execute phase rollback', async () => {
      const result = await recovery.executeRollback({
        level: 'phase',
        description: 'Undo current phase',
        affected_files: []
      });
      expect(result.success).toBe(true);
    });

    it('should execute task rollback', async () => {
      const result = await recovery.executeRollback({
        level: 'task',
        description: 'Undo entire task',
        affected_files: []
      });
      expect(result.success).toBe(true);
    });

    it('should execute base rollback', async () => {
      const result = await recovery.executeRollback({
        level: 'base',
        description: 'Reset to base SHA',
        affected_files: []
      });
      expect(result.success).toBe(true);
    });
  });

  describe('executeEscalation', () => {
    it('should create escalation result', () => {
      const failure = recovery.recordFailure(
        'unknown_error',
        'operation',
        'Unknown error'
      );
      const result = recovery.executeEscalation(failure);
      expect(result.success).toBe(false);
      expect(result.strategy).toBe('escalate');
    });
  });

  describe('executeSkip', () => {
    it('should skip non-critical failure', () => {
      const failure = recovery.recordFailure(
        'test_failure',
        'run_tests',
        'Test failed'
      );
      const result = recovery.executeSkip(failure);
      expect(result.success).toBe(true);
      expect(result.strategy).toBe('skip');
      expect(failure.recovered).toBe(true);
    });
  });

  describe('executeAbort', () => {
    it('should abort for critical failure', () => {
      const failure = recovery.recordFailure(
        'permission_denied',
        'write_file',
        'Permission denied'
      );
      const result = recovery.executeAbort(failure);
      expect(result.success).toBe(false);
      expect(result.strategy).toBe('abort');
    });
  });

  describe('recover', () => {
    it('should execute retry strategy', async () => {
      const failure = recovery.recordFailure(
        'network_timeout',
        'fetch_data',
        'Network timeout'
      );

      const operation = vi.fn().mockResolvedValue('success');
      const result = await recovery.recover(failure, operation);
      expect(result.strategy).toBe('retry');
    });

    it('should execute skip strategy for test_failure', async () => {
      const failure = recovery.recordFailure(
        'test_failure',
        'run_tests',
        'Test failed'
      );
      const result = await recovery.recover(failure);
      expect(result.strategy).toBe('skip');
      expect(result.success).toBe(true);
    });

    it('should execute abort strategy for critical failures', async () => {
      const failure = recovery.recordFailure(
        'permission_denied',
        'write_file',
        'Permission denied'
      );
      const result = await recovery.recover(failure);
      expect(result.strategy).toBe('abort');
      expect(result.success).toBe(false);
    });

    it('should execute escalate strategy for unknown errors', async () => {
      const failure = recovery.recordFailure(
        'unknown_error',
        'operation',
        'Unknown error'
      );
      const result = await recovery.recover(failure);
      expect(result.strategy).toBe('escalate');
    });
  });

  describe('getFailureHistory', () => {
    it('should return empty history initially', () => {
      const history = recovery.getFailureHistory();
      expect(history).toEqual([]);
    });

    it('should return failure history', () => {
      recovery.recordFailure('network_timeout', 'op1', 'msg1');
      recovery.recordFailure('validation_error', 'op2', 'msg2');

      const history = recovery.getFailureHistory();
      expect(history.length).toBe(2);
    });
  });

  describe('getUnrecoveredFailures', () => {
    it('should return unrecovered failures', () => {
      recovery.recordFailure('network_timeout', 'op1', 'msg1');
      recovery.recordFailure('validation_error', 'op2', 'msg2');

      const unrecovered = recovery.getUnrecoveredFailures();
      expect(unrecovered.length).toBe(2);
    });

    it('should not include recovered failures', () => {
      const failure = recovery.recordFailure('test_failure', 'op1', 'msg1');
      recovery.executeSkip(failure);

      const unrecovered = recovery.getUnrecoveredFailures();
      expect(unrecovered.length).toBe(0);
    });
  });

  describe('getSummary', () => {
    it('should return summary', () => {
      recovery.recordFailure('network_timeout', 'op1', 'msg1');
      recovery.recordFailure('validation_error', 'op2', 'msg2');

      const summary = recovery.getSummary();
      expect(summary.total_failures).toBe(2);
      expect(summary.unrecovered).toBe(2);
    });

    it('should count by type', () => {
      recovery.recordFailure('network_timeout', 'op1', 'msg1');
      recovery.recordFailure('network_timeout', 'op2', 'msg2');
      recovery.recordFailure('validation_error', 'op3', 'msg3');

      const summary = recovery.getSummary();
      expect(summary.by_type['network_timeout']).toBe(2);
      expect(summary.by_type['validation_error']).toBe(1);
    });
  });

  describe('createFailureRecoveryManager factory', () => {
    it('should create instance', () => {
      const manager = createFailureRecoveryManager(projectRoot);
      expect(manager).toBeInstanceOf(FailureRecoveryManager);
    });

    it('should accept custom config', () => {
      const manager = createFailureRecoveryManager(projectRoot, {
        max_attempts: 5
      });
      expect(manager).toBeDefined();
    });
  });
});
