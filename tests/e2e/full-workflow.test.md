# E2E Tests - Full Workflow

## Test: E2E-001 - Complete Feature Development

**Scenario**: Add a new feature with documentation

**Input**: `/dev-stack:agents "Add user profile page with avatar upload"`

**Expected Workflow**:
```
1. ANALYZE TASK
   ├── Intent: feature
   ├── Scopes: [dev, docs]
   └── Complexity: medium

2. DESIGN WORKFLOW
   ├── Step 1: Analyze existing user module (dev)
   ├── Step 2: Create profile component (dev)
   ├── Step 3: Add avatar upload (dev)
   └── Step 4: Update API docs (docs)

3. SPAWN WORKERS
   ├── dev-worker: Steps 1-3
   └── docs-worker: Step 4 (parallel)

4. EXECUTE
   ├── dev-worker uses serena.* for code operations
   ├── docs-worker uses filesystem.* for docs
   └── Results collected

5. REPORT
   ├── Summary of changes
   ├── Files modified
   ├── Tool usage stats
   └── Recommendations
```

**Success Criteria**:
- [ ] Task analyzed correctly (feature, multi-scope)
- [ ] Workers spawned in PARALLEL
- [ ] MCP tools used (serena, filesystem)
- [ ] Component files created
- [ ] Documentation updated
- [ ] Report shows all sections
- [ ] No scope violations
- [ ] MCP usage >= 90%

---

## Test: E2E-002 - Bug Fix with Testing

**Scenario**: Fix a bug and verify with tests

**Input**: `/dev-stack:agents "Fix login validation bug and run tests"`

**Expected Workflow**:
```
1. ANALYZE TASK
   ├── Intent: bug_fix
   ├── Scopes: [dev, quality]
   └── Complexity: medium

2. DESIGN WORKFLOW (SEQUENTIAL - tests depend on fix)
   ├── Step 1: Find login validation code (dev)
   ├── Step 2: Identify bug cause (dev)
   ├── Step 3: Fix the bug (dev)
   └── Step 4: Run tests (quality) - AFTER fix

3. SPAWN WORKERS
   ├── dev-worker: Steps 1-3
   └── quality-worker: Step 4 (SEQUENTIAL - waits for dev)

4. EXECUTE
   ├── dev-worker uses serena.* for code operations
   ├── dev-worker completes
   ├── quality-worker runs tests
   └── Results collected

5. REPORT
   ├── Bug fix details
   ├── Test results
   └── Verification status
```

**Success Criteria**:
- [ ] Sequential execution (tests after fix)
- [ ] Bug fixed correctly
- [ ] Tests pass
- [ ] Report shows verification

---

## Test: E2E-003 - MCP Unavailable - Fallback Mode

**Scenario**: All MCP servers down

**Setup**: Disable all MCP servers

**Input**: `/dev-stack:dev "Add helper function to utils"`

**Expected Workflow**:
```
1. DETECT MCP STATUS
   └── All MCP servers unavailable

2. EXECUTE WITH FALLBACK
   ├── Use Read instead of serena.find_symbol
   ├── Use Edit instead of serena.replace_symbol_body
   └── LOG WARNINGS for each fallback

3. COMPLETE TASK
   ├── Task still completes
   └── Report shows fallback mode
```

**Success Criteria**:
- [ ] MCP unavailability detected
- [ ] Warning logged for each fallback
- [ ] Task still completes
- [ ] Report shows "Fallback Mode" indicator
- [ ] Fallback tools count > 0

---

## Test: E2E-004 - Complex Multi-Scope Refactor

**Scenario**: Large refactoring with multiple scopes

**Input**: `/dev-stack:agents "Refactor database layer to use repository pattern and update all docs"`

**Expected Workflow**:
```
1. ANALYZE TASK
   ├── Intent: refactor
   ├── Scopes: [dev, docs]
   └── Complexity: HIGH

2. DESIGN WORKFLOW (HYBRID)
   ├── Phase 1: Analyze current structure (dev)
   ├── Phase 2: Design repository pattern (dev)
   ├── Phase 3: Implement repositories (dev) - PARALLEL
   │   ├── User repository
   │   ├── Auth repository
   │   └── Data repository
   ├── Phase 4: Update code to use repos (dev)
   ├── Phase 5: Update docs (docs) - PARALLEL with Phase 4
   └── Phase 6: Run tests (quality)

3. SPAWN WORKERS
   ├── Multiple dev-workers for Phase 3
   ├── dev-worker for Phase 4
   ├── docs-worker for Phase 5 (parallel)
   └── quality-worker for Phase 6 (sequential)

4. EXECUTE
   ├── Parallel workers for independent repos
   ├── Sequential where dependencies exist
   └── All results aggregated

5. REPORT
   ├── Complete change summary
   ├── All files modified
   ├── Test results
   └── Migration guide (if needed)
```

**Success Criteria**:
- [ ] High complexity detected
- [ ] Parallel workers spawned for independent tasks
- [ ] Sequential execution where dependencies exist
- [ ] All files tracked
- [ ] Comprehensive report generated

---

## Test: E2E-005 - Context Preservation

**Scenario**: Long task with context compaction

**Input**: `/dev-stack:agents "Implement full authentication system with OAuth2"`

**Expected Workflow**:
```
1. START TASK
   └── Context saved on SessionStart

2. EXECUTE (LONG RUNNING)
   ├── Multiple phases
   ├── Context approaches limit
   └── PreCompact hook triggered

3. SAVE CONTEXT
   ├── Current state saved to context/session-state.json
   ├── Workers status captured
   └── Partial results stored

4. CONTINUE (POST-COMPACTION)
   ├── Context restored from saved state
   ├── Workers resume from checkpoint
   └── Task completes

5. REPORT
   ├── Full execution history
   └── Context restoration noted
```

**Success Criteria**:
- [ ] Context saved on PreCompact
- [ ] State includes worker status
- [ ] Context restored successfully
- [ ] Task continues from checkpoint
- [ ] No work lost

---

## Test: E2E-006 - Error Recovery and Partial Results

**Scenario**: Worker fails mid-task

**Input**: `/dev-stack:agents "Implement features A, B, and C"`

**Expected Workflow**:
```
1. START TASK
   └── Three features to implement

2. EXECUTE
   ├── Feature A: SUCCESS
   ├── Feature B: FAILURE (simulated)
   └── Feature C: PENDING

3. HANDLE FAILURE
   ├── Retry Feature B once
   ├── If still fails: Continue with partial results
   └── Feature C attempted

4. REPORT
   ├── Feature A: Completed
   ├── Feature B: Failed (with error)
   ├── Feature C: Completed (if attempted)
   └── Partial success noted
```

**Success Criteria**:
- [ ] Failure detected
- [ ] Retry attempted
- [ ] Partial results reported
- [ ] Report shows failure details
- [ ] Successful features tracked

---

## Test Results Summary

| Test ID | Scenario | Status | MCP Usage | Notes |
|---------|----------|--------|-----------|-------|
| E2E-001 | Feature Development | ⏳ | - | |
| E2E-002 | Bug Fix + Tests | ⏳ | - | |
| E2E-003 | Fallback Mode | ⏳ | 0% expected | |
| E2E-004 | Complex Refactor | ⏳ | - | |
| E2E-005 | Context Preservation | ⏳ | - | |
| E2E-006 | Error Recovery | ⏳ | - | |

**Pass Rate**: 0/6 (0%)

---

## Test Execution Order

1. **E2E-003** (Fallback Mode) - Tests error handling first
2. **E2E-001** (Feature Development) - Core workflow
3. **E2E-002** (Bug Fix + Tests) - Sequential dependencies
4. **E2E-006** (Error Recovery) - Error handling
5. **E2E-004** (Complex Refactor) - Advanced parallelization
6. **E2E-005** (Context Preservation) - Long-running task
