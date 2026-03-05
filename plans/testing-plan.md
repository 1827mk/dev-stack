# Dev-Stack Orchestrator Plugin - Testing Plan

**Version**: 2.0.0
**Last Updated**: 2026-03-05

---

## 1. Testing Strategy Overview

### 1.1 Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │  ← Full workflow tests
                    │   (Few)         │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │   Integration Tests     │  ← Command + Agent interaction
                │   (Some)                │
                └────────────┬────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │           Unit Tests                     │  ← Individual components
        │           (Many)                         │
        └─────────────────────────────────────────┘
```

### 1.2 Test Categories

| Category | What | Where | Automation |
|----------|------|-------|------------|
| Unit | Individual functions, skills | Isolated | Full |
| Integration | Command → Skill → Tool | Plugin context | Full |
| E2E | Full user workflows | Real environment | Partial |
| Manual | UX, edge cases | User testing | None |

### 1.3 Tool Priority Testing

**Critical**: Test that MCP tools are always preferred over built-in tools

```
┌─────────────────────────────────────────────────────────────┐
│  TEST PRIORITY ORDER:                                       │
│                                                             │
│  1. Test MCP tools work correctly (Primary)                │
│  2. Test fallback to built-in when MCP unavailable         │
│  3. Test warning is logged when using fallback             │
│  4. Test MCP tool usage rate >= 90%                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Unit Tests

### 2.1 Skills Testing

#### task-analysis Skill

| Test ID | Description | Input | Expected Output |
|---------|-------------|-------|-----------------|
| TA-001 | Parse simple dev task | "fix the login bug" | `{scope: "dev", intent: "bug_fix", complexity: "low"}` |
| TA-002 | Parse multi-scope task | "add feature and update docs" | `{scopes: ["dev", "docs"], intent: "feature", complexity: "medium"}` |
| TA-003 | Parse git task | "commit and push changes" | `{scope: "git", intent: "version_control", complexity: "low"}` |
| TA-004 | Detect ambiguous task | "update the project" | Request clarification |
| TA-005 | Estimate complexity | Complex multi-file refactor | `{complexity: "high"}` |

#### tool-selection Skill (CRITICAL)

| Test ID | Description | Capability | MCP Status | Expected Tool | Warning? |
|---------|-------------|------------|------------|---------------|----------|
| TS-001 | MCP tool available | read_code | Available | serena.find_symbol | No |
| TS-002 | MCP unavailable, use fallback | read_code | Unavailable | Read, Grep | **Yes** |
| TS-003 | Multiple MCP tools | read_code + write_code | Available | serena.* | No |
| TS-004 | Invalid capability | unknown_cap | - | Error | No |
| TS-005 | Scope filtering | run_tests (dev scope) | - | Error: wrong scope | No |
| TS-006 | filesystem MCP for files | read_file | Available | filesystem.read_text_file | No |
| TS-007 | doc-forge MCP for docs | read_docs | Available | doc-forge.document_reader | No |
| TS-008 | context7 MCP for API docs | read_api_docs | Available | context7.query-docs | No |
| TS-009 | memory MCP for persistence | memory_store | Available | memory.create_entities | No |
| TS-010 | All MCP down, all fallback | All | All Unavailable | Built-in tools | **Yes (multiple)** |

#### workflow-design Skill

| Test ID | Description | Input | Expected Output |
|---------|-------------|-------|-----------------|
| WD-001 | Simple workflow | Single scope task | Linear step sequence |
| WD-002 | Multi-scope workflow | Multi-scope task | Parallel + dependent steps |
| WD-003 | Template: feature | "add user auth" | Feature template applied |
| WD-004 | Template: bug-fix | "fix login bug" | Bug-fix template applied |
| WD-005 | Template: docs | "write API docs" | Documentation template applied |

---

### 2.2 Configuration Testing

#### capabilities.yaml

| Test ID | Description | Validation |
|---------|-------------|------------|
| CFG-001 | Valid YAML syntax | Parse without error |
| CFG-002 | All capabilities have PRIMARY MCP tool | Each capability mapped to MCP |
| CFG-003 | All capabilities have FALLBACK built-in tool | Each capability has fallback |
| CFG-004 | No duplicate capability names | Unique keys |
| CFG-005 | Valid MCP tool references | Tools exist in system |
| CFG-006 | MCP tools marked as PRIMARY | Priority = 1 |
| CFG-007 | Built-in tools marked as FALLBACK | Priority = 3 |

#### plugin.yaml

| Test ID | Description | Validation |
|---------|-------------|------------|
| CFG-010 | Valid YAML syntax | Parse without error |
| CFG-011 | Required fields present | name, version, description |
| CFG-012 | Valid version format | SemVer compatible |
| CFG-013 | All referenced files exist | Commands, agents, skills exist |

#### hooks.json

| Test ID | Description | Validation |
|---------|-------------|------------|
| CFG-020 | Valid JSON syntax | Parse without error |
| CFG-021 | All hook types valid | SessionStart, PreCompact, etc. |
| CFG-022 | Script paths valid | Scripts exist and executable |
| CFG-023 | No duplicate hook types | Unique hook events |

---

## 3. Integration Tests

### 3.1 Command Tests

#### /dev-stack:agents

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| CMD-001 | Simple single-scope task | 1. Run `/dev-stack:agents "fix bug"` | Single worker spawned, task completed |
| CMD-002 | Multi-scope task | 1. Run `/dev-stack:agents "add feature + update docs"` | **Multiple workers spawned in PARALLEL**, results aggregated |
| CMD-003 | Complex task breakdown | 1. Run `/dev-stack:agents "refactor auth system"` | Task broken down, workflow designed, executed |
| CMD-004 | Agent failure recovery | 1. Force agent failure | Retry or report with partial results |
| CMD-005 | Report generation | 1. Complete any task | Report generated with all sections |
| CMD-006 | **MCP tools used** | 1. Run task requiring code read | **serena.* used (not Read)** |
| CMD-007 | **Fallback warning** | 1. Disable MCP server 2. Run task | **Built-in used + warning logged** |

#### /dev-stack:dev

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| CMD-010 | Valid dev task | 1. Run `/dev-stack:dev "add helper function"` | Task completed within dev scope |
| CMD-011 | Scope boundary - git | 1. Run `/dev-stack:dev "commit changes"` | Error: use /dev-stack:git |
| CMD-012 | Scope boundary - docs | 1. Run `/dev-stack:dev "update README"` | Error: use /dev-stack:docs |
| CMD-013 | **Tool selection (MCP)** | 1. Run task requiring code read | **Uses serena (not Read)** |
| CMD-014 | **Tool selection (fallback)** | 1. Disable MCP 2. Run task | Uses Read + **warning logged** |
| CMD-015 | File modification | 1. Run task modifying code | Files modified correctly |

#### /dev-stack:git

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| CMD-020 | git status | 1. Run `/dev-stack:git "show status"` | Status displayed |
| CMD-021 | git commit | 1. Stage changes 2. Run commit command | Changes committed |
| CMD-022 | Scope boundary - dev | 1. Run `/dev-stack:git "edit file"` | Error: use /dev-stack:dev |
| CMD-023 | No changes to commit | 1. Run commit with no staged changes | Appropriate message |

#### /dev-stack:docs

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| CMD-030 | Create markdown doc | 1. Run `/dev-stack:docs "create API guide"` | Documentation created |
| CMD-031 | Read documentation | 1. Run `/dev-stack:docs "read README"` | Content displayed |
| CMD-032 | **doc-forge MCP used** | 1. Run task reading PDF | **doc-forge used (not Read)** |
| CMD-033 | Scope boundary - code | 1. Run `/dev-stack:docs "fix bug"` | Error: use /dev-stack:dev |

#### /dev-stack:quality

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| CMD-040 | Run tests | 1. Run `/dev-stack:quality "run tests"` | Tests executed, results shown |
| CMD-041 | Run linter | 1. Run `/dev-stack:quality "check code style"` | Linter run, issues reported |
| CMD-042 | Scope boundary - dev | 1. Run `/dev-stack:quality "fix lint errors"` | Error: use /dev-stack:dev |

#### /dev-stack:info

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| CMD-050 | Display capabilities | 1. Run `/dev-stack:info` | All capabilities listed |
| CMD-051 | Display tool priority | 1. Run `/dev-stack:info tools` | **Primary (MCP) → Fallback (Built-in)** shown |
| CMD-052 | Display scopes | 1. Run `/dev-stack:info scopes` | All scopes with boundaries shown |

#### /dev-stack:simplify

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| CMD-060 | Break down task | 1. Run `/dev-stack:simplify "build auth system"` | Structured task list generated |
| CMD-061 | Identify scopes | 1. Run with multi-scope task | All required scopes identified |
| CMD-062 | No execution | 1. Run any simplify command | No files modified |

---

### 3.2 Agent Tests

#### Orchestrator Agent

| Test ID | Scenario | Expected Behavior |
|---------|----------|-------------------|
| AGT-001 | Spawn single worker | Correct worker type selected |
| AGT-002 | **Spawn multiple workers (PARALLEL)** | **Parallel execution**, results aggregated |
| AGT-003 | Monitor progress | Progress tracked, reported |
| AGT-004 | Handle worker failure | Retry or report partial results |
| AGT-005 | Generate final report | Complete report with all sections |

#### Worker Agent

| Test ID | Scenario | Expected Behavior |
|---------|----------|-------------------|
| AGT-010 | Stay in scope | Never crosses scope boundary |
| AGT-011 | **Use MCP tools first** | **serena, filesystem, doc-forge preferred** |
| AGT-012 | **Fallback with warning** | Built-in used only when MCP unavailable + warning |
| AGT-013 | Complete task | Task finished within max turns |
| AGT-014 | Report progress | Regular progress updates |
| AGT-015 | Handle errors | Errors reported, not silently ignored |

#### Researcher Agent

| Test ID | Scenario | Expected Behavior |
|---------|----------|-------------------|
| AGT-020 | Search codebase | Fast, relevant results |
| AGT-021 | No modifications | Read-only, never writes |
| AGT-022 | Symbol navigation | Correct symbol lookup |
| AGT-023 | Pattern search | Accurate pattern matching |
| AGT-024 | **MCP tools preferred** | **serena.find_symbol used (not Grep)** |

---

### 3.3 Hook Tests

| Test ID | Hook | Scenario | Expected Behavior |
|---------|------|----------|-------------------|
| HOOK-001 | SessionStart | New session | Welcome banner displayed |
| HOOK-002 | SessionStart | Session with saved context | Context restored |
| HOOK-003 | PreCompact | Active task | Context saved to file |
| HOOK-004 | SubagentStart | Agent spawned | Agent logged |
| HOOK-005 | SubagentStop | Agent completed | Agent completion logged |
| HOOK-006 | Stop | Session end | Final report generated |

---

## 4. E2E Tests

### 4.1 Full Workflow Tests

#### Feature Development Workflow

```
Test: E2E-001
Name: Complete Feature Development
Steps:
  1. User runs: /dev-stack:agents "Add user profile page with avatar upload"
  2. System analyzes task → identifies scopes: dev, docs
  3. Skills: task-analysis → workflow-design → tool-selection
  4. Orchestrator spawns workers IN PARALLEL
  5. dev-worker creates component files (using serena.*)
  6. docs-worker updates documentation (using filesystem.*)
  7. Results aggregated
  8. Report generated

Expected:
  - Component files created
  - Documentation updated
  - Report shows all changes
  - No scope violations
  - **MCP tools used (serena, filesystem) - NOT built-in tools**
```

#### Bug Fix Workflow

```
Test: E2E-002
Name: Bug Fix with Testing
Steps:
  1. User runs: /dev-stack:dev "Fix login validation bug"
  2. System analyzes bug
  3. Worker identifies affected files (using serena.find_symbol)
  4. Worker fixes bug (using serena.replace_symbol_body)
  5. Worker runs tests
  6. Report generated

Expected:
  - Bug fixed
  - Tests pass
  - No scope violations
  - **serena.* used for code operations**
```

#### MCP Fallback Test

```
Test: E2E-003
Name: MCP Unavailable - Fallback to Built-in
Steps:
  1. Disable all MCP servers
  2. User runs: /dev-stack:dev "Add helper function"
  3. System detects MCP unavailable
  4. Uses built-in tools (Read, Write, Edit)
  5. **Warning logged**
  6. Task completes

Expected:
  - Task completed using built-in tools
  - **Warning logged for each fallback use**
  - Report shows "Fallback mode" indicator
```

---

## 5. Test Execution Plan

### 5.1 Phase-based Testing

| Phase | Tests to Run | Pass Criteria |
|-------|--------------|---------------|
| Phase 1: Infrastructure | CFG-* | All config files valid |
| Phase 2: Core Commands | CMD-001 to CMD-015, AGT-* | Commands work, MCP tools used |
| Phase 3: Additional Commands | CMD-020 to CMD-062 | All commands functional |
| Phase 4: Agents | AGT-* | All agents behave correctly, MCP preferred |
| Phase 5: Skills | TA-*, TS-*, WD-* | All skills produce correct output |
| Phase 6: Hooks | HOOK-* | All hooks trigger correctly |
| Phase 7: E2E | E2E-* | Full workflows complete |

### 5.2 Regression Testing

Run after each change:
1. All unit tests (fast feedback)
2. Integration tests for changed components
3. **Tool selection tests (TS-*)** - Verify MCP priority
4. E2E tests for affected workflows

### 5.3 Test Commands

```bash
# Run all unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run tool selection tests (critical)
npm run test -- --grep "TS-*"

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all

# Run specific test category
npm run test -- --grep "CMD-*"
```

---

## 6. Test Data

### 6.1 Sample Tasks

| Category | Task | Expected Scope | Complexity | Expected Primary Tool |
|----------|------|----------------|------------|----------------------|
| Simple | "fix typo in README" | docs | low | filesystem.write_file |
| Simple | "run tests" | quality | low | Bash(npm test) |
| Simple | "show git status" | git | low | Bash(git status) |
| Medium | "add logging to auth module" | dev | medium | serena.* |
| Medium | "update API documentation" | docs | medium | filesystem.* |
| Medium | "fix failing tests" | quality | medium | Bash(npm test) |
| Complex | "refactor database layer" | dev | high | serena.* |
| Complex | "add user authentication" | dev, docs | high | serena.* + filesystem.* |
| Complex | "migrate to TypeScript" | dev, quality | high | serena.* |

### 6.2 Test Codebase

Create a minimal test project:

```
test-project/
├── src/
│   ├── index.ts
│   ├── auth/
│   │   └── login.ts
│   └── utils/
│       └── helpers.ts
├── tests/
│   └── auth.test.ts
├── docs/
│   └── README.md
├── package.json
└── tsconfig.json
```

---

## 7. Success Criteria Validation

### 7.1 Test Coverage

| Criteria | Target | Measurement |
|----------|--------|-------------|
| SC-001: Tool selection accuracy (MCP first) | >= 90% | TS-* tests pass rate |
| SC-002: Scope boundary compliance | 100% | CMD-* boundary tests |
| SC-003: Agent spawning accuracy | 100% | AGT-001, AGT-002 tests |
| SC-004: Report completeness | 100% | Manual review checklist |
| SC-005: Context restoration | >= 95% | HOOK-002, HOOK-003 tests |
| SC-006: Agent tracking | 100% | HOOK-004, HOOK-005 tests |
| **SC-007: MCP tool usage rate** | **>= 90%** | **Tool usage logs** |

### 7.2 Quality Gates

| Gate | Criteria | Action if Failed |
|------|----------|------------------|
| Code Review | All tests pass | Fix before merge |
| Integration | No scope violations | Debug boundary logic |
| **Tool Selection** | **MCP used when available** | **Fix tool-selection skill** |
| E2E | Full workflow completes | Fix blocking issues |
| Performance | Response < 5s | Optimize slow paths |

---

## 8. Bug Report Template

```markdown
## Bug Report

**Test ID**: [e.g., CMD-001]
**Severity**: [Critical | High | Medium | Low]
**Component**: [Command | Agent | Skill | Hook | Config]

### Description
[Clear description of the bug]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Environment
- Plugin Version: [e.g., 2.0.0]
- Claude Code Version: [e.g., 1.0.0]
- OS: [e.g., macOS 14.0]
- **MCP Servers Available**: [Yes/No - which ones]

### Logs
```
[Paste relevant logs - include tool selection warnings]
```

### Screenshots
[If applicable]
```

---

## 9. Test Checklist (Pre-Release)

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] All scope boundary tests pass
- [ ] All hook tests pass
- [ ] **All tool selection tests pass (TS-*)**
- [ ] **MCP tools used when available**
- [ ] **Warnings logged when using fallback**
- [ ] Context preservation verified
- [ ] Report generation verified
- [ ] Documentation updated
- [ ] Performance benchmarks met
- [ ] No critical bugs open
