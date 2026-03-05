---
name: quality
description: |
  Quality Assurance Command - Execute testing and linting tasks within quality scope only.
  This command does NOT spawn agents - it executes directly.
  Use this for quality-related operations like running tests, linters, coverage reports.
arguments:
  - name: task
    description: The quality task description
    required: true
---

# Dev-Stack: Quality - Testing & Linting Operations

You are executing a **scoped quality task** within the `quality` scope.

## Scope Boundary

```
┌─────────────────────────────────────────────────────────────┐
│                    quality SCOPE                            │
│                                                             │
│  ✅ ALLOWED:                                                │
│  • Run tests (Bash: npm test, pytest)                      │
│  • Run linters (Bash: npm run lint, eslint)                │
│  • Check coverage (Bash: npm run coverage)                 │
│  • Read test files (filesystem.read_text_file)             │
│  • Read code (serena.find_symbol, serena.get_symbols_overview) │
│  • Search code (serena.search_for_pattern)                 │
│                                                             │
│  ❌ BLOCKED:                                                │
│  • code.write_code (modifying source code)                 │
│  • file.write_file, file.edit_file                         │
│  • git.* (all git operations)                              │
│  • Writing documentation                                   │
└─────────────────────────────────────────────────────────────┘
```

## Tool Priority

```
┌─────────────────────────────────────────────────────────────┐
│  PRIORITY ORDER FOR QUALITY OPERATIONS:                     │
│                                                             │
│  1. Bash (Primary for running tests/linters)                │
│     • npm test / pytest                                     │
│     • npm run lint / eslint .                               │
│     • npm run coverage                                      │
│                                                             │
│  2. MCP tools (Primary for reading code)                    │
│     • serena.find_symbol → Read code symbols               │
│     • serena.search_for_pattern → Search codebase          │
│     • filesystem.read_text_file → Read test files          │
│                                                             │
│  3. Built-in Tools (FALLBACK for reading)                   │
│     • Read, Grep, Glob                                      │
│     ⚠️ MUST log warning when using fallback                 │
└─────────────────────────────────────────────────────────────┘
```

## Execution Steps

### Step 1: Validate Scope

Check if the task is within `quality` scope:

| Task Type | In Scope? | Suggestion |
|-----------|-----------|------------|
| "run tests" | ✅ Yes | Proceed |
| "check code coverage" | ✅ Yes | Proceed |
| "run linter" | ✅ Yes | Proceed |
| "fix lint errors" | ❌ No | Use `/dev-stack:dev` |
| "commit changes" | ❌ No | Use `/dev-stack:git` |
| "write test documentation" | ❌ No | Use `/dev-stack:docs` |

### Step 2: Detect Project Type

Identify the project type to select correct commands:

| Project Type | Test Command | Lint Command | Coverage Command |
|--------------|--------------|--------------|------------------|
| Node.js (npm) | `npm test` | `npm run lint` | `npm run coverage` |
| Node.js (yarn) | `yarn test` | `yarn lint` | `yarn coverage` |
| Python | `pytest` | `flake8` / `pylint` | `pytest --cov` |
| Rust | `cargo test` | `cargo clippy` | `cargo tarpaulin` |
| Go | `go test ./...` | `golint` | `go test -cover` |

### Step 3: Execute

Execute the quality command:

```bash
# Run tests
npm test

# Run linter
npm run lint

# Check coverage
npm run coverage

# Run specific test file
npm test -- path/to/test.test.ts
```

### Step 4: Report

Report what was done:
- Tests run (passed/failed)
- Lint issues found
- Coverage percentage
- Recommendations for improvements

## Common Workflows

### Run All Tests

```
/dev-stack:quality "run all tests"

Expected:
1. Detect project type
2. Run appropriate test command
3. Parse results
4. Report:
   - Total tests
   - Passed/Failed
   - Failed test details (if any)
```

### Check Code Coverage

```
/dev-stack:quality "check test coverage"

Expected:
1. Run coverage command
2. Parse coverage report
3. Report:
   - Overall coverage %
   - Files with low coverage
   - Recommendations
```

### Run Linter

```
/dev-stack:quality "run the linter and show issues"

Expected:
1. Run lint command
2. Parse lint output
3. Report:
   - Total issues
   - Issues by severity
   - Files with most issues
```

### Analyze Test Failures

```
/dev-stack:quality "analyze why the tests are failing"

Expected:
1. Run tests
2. Identify failed tests
3. Read test code (using MCP tools)
4. Read source code (using MCP tools)
5. Analyze root cause
6. Report findings (but do NOT fix - that's dev scope)
```

## Test Result Interpretation

### Jest/Node.js

```
PASS  src/auth/auth.test.ts
  ✓ should authenticate user (5ms)
  ✕ should reject invalid token (2ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 failed, 2 total
```

### pytest/Python

```
========================= test session starts =========================
collected 5 items

test_auth.py ..F..                                              [100%]

========================= FAILURES ===================================
_________________________ test_invalid_token _________________________
>       assert result is False
E       assert True is False
```

## Coverage Thresholds

| Coverage % | Status | Recommendation |
|------------|--------|----------------|
| >= 90% | ✅ Excellent | Maintain current standards |
| 70-89% | ⚠️ Good | Consider increasing coverage |
| 50-69% | ⚠️ Fair | Priority to add more tests |
| < 50% | ❌ Poor | Urgent need for more tests |

## Important Rules

1. **Stay in Scope**: Never modify source code or perform git operations
2. **Read-Only Analysis**: Can analyze code but not modify it
3. **No Agents**: Execute directly, do not spawn sub-agents
4. **Report Boundary Violations**: If task requires fixing code, report to user
5. **Suggest, Don't Fix**: Provide recommendations but don't implement fixes

## Scope Boundary Examples

| User Request | Your Response |
|--------------|---------------|
| "run tests" | ✅ Execute tests |
| "fix the failing test" | ⚠️ "Fixing code is dev scope. Use `/dev-stack:dev`" |
| "analyze test failure" | ✅ Analyze and report findings |
| "add missing tests" | ⚠️ "Writing code is dev scope. Use `/dev-stack:dev`" |
