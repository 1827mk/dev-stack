# Commands - Integration Tests

## Test: CMD-001 - Simple Single-Scope Task

**Command**: `/dev-stack:agents "fix bug in login validation"`

**Expected Behavior**:
1. Task analyzed → scope: dev
2. Single worker spawned
3. Worker uses MCP tools (serena.*)
4. Task completed
5. Report generated

**Validation**:
- [ ] Task analyzed correctly
- [ ] Single worker spawned (not parallel)
- [ ] MCP tools used (not built-in)
- [ ] Report generated with all sections

---

## Test: CMD-002 - Multi-Scope Task (PARALLEL)

**Command**: `/dev-stack:agents "add user profile page and update docs"`

**Expected Behavior**:
1. Task analyzed → scopes: [dev, docs]
2. **TWO workers spawned IN PARALLEL**
3. dev-worker: Creates component files
4. docs-worker: Updates documentation
5. Results aggregated
6. Report shows parallel execution

**Validation**:
- [ ] Both scopes identified
- [ ] Workers spawned in PARALLEL
- [ ] Results aggregated correctly
- [ ] Report shows parallel execution stats

---

## Test: CMD-003 - Complex Task Breakdown

**Command**: `/dev-stack:agents "refactor auth system with better error handling"`

**Expected Behavior**:
1. Task broken down into subtasks
2. Workflow designed with dependencies
3. Steps executed in order
4. All changes tracked

**Validation**:
- [ ] Task broken down correctly
- [ ] Workflow shows dependencies
- [ ] Execution order correct
- [ ] All changes documented

---

## Test: CMD-004 - Agent Failure Recovery

**Command**: `/dev-stack:agents "implement feature xyz"` (with simulated failure)

**Expected Behavior**:
1. Worker fails mid-task
2. System retries OR reports partial results
3. Report includes failure information

**Validation**:
- [ ] Failure detected
- [ ] Retry attempted OR partial results reported
- [ ] Report includes failure details

---

## Test: CMD-005 - Report Generation

**Command**: `/dev-stack:agents "fix typo in README"`

**Expected Behavior**:
1. Task completed
2. Report generated with all sections:
   - Summary
   - Execution Details
   - Tool Usage Summary
   - Files Modified
   - Recommendations

**Validation**:
- [ ] Report generated
- [ ] All required sections present
- [ ] Tool usage stats included

---

## Test: CMD-006 - MCP Tools Used

**Command**: `/dev-stack:agents "read the auth module structure"`

**Expected Behavior**:
1. Worker uses serena.find_symbol (PRIMARY)
2. Worker does NOT use Read (fallback)
3. Report shows MCP tool usage

**Validation**:
- [ ] serena.* tools used
- [ ] No fallback tools used
- [ ] MCP usage rate >= 90%

---

## Test: CMD-007 - Fallback Warning

**Command**: `/dev-stack:agents "read code"` (with MCP disabled)

**Expected Behavior**:
1. MCP detected as unavailable
2. Built-in tools used with warning
3. Report shows fallback mode indicator

**Validation**:
- [ ] MCP unavailability detected
- [ ] Warning logged
- [ ] Task still completes
- [ ] Report shows fallback mode

---

## Test: CMD-010 - /dev-stack:dev Valid Task

**Command**: `/dev-stack:dev "add helper function to utils"`

**Expected Behavior**:
1. Task executed in dev scope
2. No agents spawned (direct execution)
3. MCP tools used
4. Files modified correctly

**Validation**:
- [ ] Scope is dev
- [ ] No agent spawned
- [ ] MCP tools used

---

## Test: CMD-011 - /dev-stack:dev Scope Boundary - Git

**Command**: `/dev-stack:dev "commit the changes"`

**Expected Behavior**:
1. Scope violation detected
2. Error message shown
3. Suggestion to use /dev-stack:git

**Validation**:
- [ ] Scope violation detected
- [ ] Error message clear
- [ ] Suggestion provided

---

## Test: CMD-012 - /dev-stack:dev Scope Boundary - Docs

**Command**: `/dev-stack:dev "update the README"`

**Expected Behavior**:
1. Scope violation detected
2. Error message shown
3. Suggestion to use /dev-stack:docs

**Validation**:
- [ ] Scope violation detected
- [ ] Error message clear
- [ ] Suggestion provided

---

## Test: CMD-020 - /dev-stack:git Status

**Command**: `/dev-stack:git "show status"`

**Expected Behavior**:
1. git status executed
2. Output displayed
3. No code modifications

**Validation**:
- [ ] Git status shown
- [ ] No file modifications

---

## Test: CMD-021 - /dev-stack:git Commit

**Command**: `/dev-stack:git "commit with message 'fix: login bug'"`

**Preconditions**: Changes staged

**Expected Behavior**:
1. git commit executed
2. Commit created with message
3. No code modifications

**Validation**:
- [ ] Commit created
- [ ] Message correct
- [ ] No code changes

---

## Test: CMD-030 - /dev-stack:docs Create

**Command**: `/dev-stack:docs "create API guide for auth endpoints"`

**Expected Behavior**:
1. Documentation created
2. doc-forge MCP used (if available)
3. filesystem.write_file used for output

**Validation**:
- [ ] Documentation created
- [ ] Correct MCP tools used
- [ ] No code modifications

---

## Test: CMD-040 - /dev-stack:quality Run Tests

**Command**: `/dev-stack:quality "run all tests"`

**Expected Behavior**:
1. Tests executed
2. Results displayed
3. No code modifications

**Validation**:
- [ ] Tests executed
- [ ] Results shown
- [ ] No code changes

---

## Test: CMD-050 - /dev-stack:info

**Command**: `/dev-stack:info`

**Expected Behavior**:
1. All capabilities listed
2. Tool priority shown (MCP → Built-in)
3. Scopes displayed

**Validation**:
- [ ] Capabilities displayed
- [ ] Tool priority clear
- [ ] All scopes shown

---

## Test: CMD-060 - /dev-stack:simplify

**Command**: `/dev-stack:simplify "build user authentication system"`

**Expected Behavior**:
1. Task broken down
2. Structured task list generated
3. **NO EXECUTION** - analysis only

**Validation**:
- [ ] Task broken down
- [ ] No files modified
- [ ] No commands executed

---

## Test Results Summary

| Test ID | Command | Status | Notes |
|---------|---------|--------|-------|
| CMD-001 | agents simple | ⏳ | |
| CMD-002 | agents parallel | ⏳ | |
| CMD-003 | agents complex | ⏳ | |
| CMD-004 | agents failure | ⏳ | |
| CMD-005 | report generation | ⏳ | |
| CMD-006 | MCP tools used | ⏳ | |
| CMD-007 | fallback warning | ⏳ | |
| CMD-010 | dev valid | ⏳ | |
| CMD-011 | dev boundary git | ⏳ | |
| CMD-012 | dev boundary docs | ⏳ | |
| CMD-020 | git status | ⏳ | |
| CMD-021 | git commit | ⏳ | |
| CMD-030 | docs create | ⏳ | |
| CMD-040 | quality tests | ⏳ | |
| CMD-050 | info | ⏳ | |
| CMD-060 | simplify | ⏳ | |

**Pass Rate**: 0/16 (0%)
