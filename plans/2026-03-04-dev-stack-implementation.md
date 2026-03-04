# Dev-Stack Orchestrator Plugin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Claude Code plugin that orchestrates tools and workflows with capability-based tool selection and context preservation.

**Architecture:** Plugin provides 7 commands (team orchestrator + 4 scoped + 2 info), 3 agents (orchestrator, worker, researcher), 3 skills (analysis, selection, workflow), and 4 hooks for context management. Uses 2-level tool priority (Primary MCP → Fallback Built-in).

**Tech Stack:** Claude Code Plugin System (commands, agents, skills, hooks), YAML/JSON config, Bash scripts

---

## Phase 1: Core Infrastructure

### Task 1: Create Plugin Directory Structure

**Files:**
- Create directories: `.claude-plugin/`, `commands/`, `skills/`, `agents/`, `hooks/`, `scripts/`, `config/`, `context/`

**Step 1: Create all required directories**

```bash
cd /Users/tanaphat.oiu/I-Me/MyProject/dev-stack && mkdir -p .claude-plugin commands skills/task-analysis skills/tool-selection skills/workflow-design agents hooks scripts config context
```

**Step 2: Verify directory structure**

Run: `ls -la`
Expected: See all directories created

**Step 3: Create .gitkeep for context directory**

```bash
touch context/.gitkeep
```

**Step 4: Commit**

```bash
git add . && git commit -m "feat(dev-stack): create plugin directory structure"
```

---

### Task 2: Create Plugin Manifest

**Files:**
- Create: `.claude-plugin/plugin.json`

**Step 1: Create plugin.json**

```json
{
  "name": "dev-stack",
  "version": "2.0.0",
  "description": "Intelligent workflow orchestrator for Claude Code - coordinates tools, agents, and workflows",
  "author": {
    "name": "Dev-Stack Team"
  },
  "keywords": ["orchestration", "workflow", "agents", "tools"],
  "commands": "./commands",
  "agents": "./agents",
  "skills": "./skills",
  "hooks": "./hooks/hooks.json"
}
```

**Step 2: Validate JSON syntax**

Run: `cat .claude-plugin/plugin.json | python3 -m json.tool`
Expected: Valid JSON output

**Step 3: Commit**

```bash
git add .claude-plugin/plugin.json && git commit -m "feat(dev-stack): add plugin manifest"
```

---

### Task 3: Create Capability Mapping Config

**Files:**
- Create: `config/capabilities.yaml`

**Step 1: Create capabilities.yaml**

```yaml
# Dev-Stack Capability Mapping v2.0
# Maps human-readable capabilities to actual tools
# Priority: Primary (MCP) → Fallback (Built-in)

version: "2.0"

# =============================================================================
# CODE OPERATIONS
# =============================================================================
code:
  read_code:
    description: "Read and analyze code symbols"
    primary:
      - tool: "mcp__serena__find_symbol"
        when: "Need specific symbol (function, class, method)"
      - tool: "mcp__serena__get_symbols_overview"
        when: "Need file structure overview"
      - tool: "mcp__serena__find_file"
        when: "Need to locate file by pattern"
    fallback:
      - tool: "Read"
        when: "MCP unavailable or need full file"
      - tool: "Grep"
        when: "Need to search content"

  write_code:
    description: "Write or modify code"
    primary:
      - tool: "mcp__serena__replace_symbol_body"
        when: "Replace entire symbol definition"
      - tool: "mcp__serena__insert_after_symbol"
        when: "Add code after existing symbol"
      - tool: "mcp__serena__insert_before_symbol"
        when: "Add imports or code before symbol"
      - tool: "mcp__serena__rename_symbol"
        when: "Rename symbol across codebase"
    fallback:
      - tool: "Edit"
        when: "String-based file editing"
      - tool: "Write"
        when: "Create new file or full rewrite"

  search_code:
    description: "Search patterns in codebase"
    primary:
      - tool: "mcp__serena__search_for_pattern"
        when: "Regex search in codebase"
      - tool: "mcp__serena__find_referencing_symbols"
        when: "Find all references to symbol"
    fallback:
      - tool: "Grep"
        when: "Content search"
      - tool: "Glob"
        when: "File pattern search"

  analyze_code:
    description: "Analyze code structure and quality"
    primary:
      - tool: "mcp__serena__get_symbols_overview"
        when: "Get file structure"
      - tool: "mcp__serena__think_about_collected_information"
        when: "Evaluate completeness"
    fallback:
      - tool: "Read"
        when: "Manual analysis"

# =============================================================================
# FILE OPERATIONS
# =============================================================================
file:
  read_file:
    description: "Read file contents"
    primary:
      - tool: "mcp__filesystem__read_text_file"
        when: "Read single text file"
      - tool: "mcp__filesystem__read_multiple_files"
        when: "Read multiple files at once"
    fallback:
      - tool: "Read"
        when: "Built-in file reader"

  write_file:
    description: "Write file contents"
    primary:
      - tool: "mcp__filesystem__write_file"
        when: "Write content to file"
    fallback:
      - tool: "Write"
        when: "Built-in file writer"

  edit_file:
    description: "Edit file with line-based operations"
    primary:
      - tool: "mcp__filesystem__edit_file"
        when: "Line-based editing"
    fallback:
      - tool: "Edit"
        when: "String replacement editing"

  list_dir:
    description: "List directory contents"
    primary:
      - tool: "mcp__filesystem__list_directory"
        when: "Simple directory listing"
      - tool: "mcp__filesystem__directory_tree"
        when: "Recursive tree view"
    fallback:
      - tool: "Bash"
        args: "ls -la"

  find_file:
    description: "Find files by pattern"
    primary:
      - tool: "mcp__filesystem__search_files"
        when: "Glob pattern search"
      - tool: "mcp__serena__find_file"
        when: "Code-aware file search"
    fallback:
      - tool: "Glob"
        when: "Built-in glob"

# =============================================================================
# DOCUMENTATION OPERATIONS
# =============================================================================
docs:
  read_docs:
    description: "Read various document formats"
    primary:
      - tool: "mcp__doc-forge__document_reader"
        when: "PDF, DOCX, HTML, CSV files"
    fallback:
      - tool: "Read"
        when: "Text-based docs"

  write_docs:
    description: "Write documentation"
    primary:
      - tool: "mcp__doc-forge__format_convert"
        when: "Convert between formats"
      - tool: "mcp__filesystem__write_file"
        when: "Write markdown/text"
    fallback:
      - tool: "Write"
        when: "Direct file write"

  read_api_docs:
    description: "Query library documentation"
    primary:
      - tool: "mcp__context7__resolve-library-id"
        when: "Find library ID first"
      - tool: "mcp__context7__query-docs"
        when: "Query documentation"
    fallback:
      - tool: "WebSearch"
        when: "Web search for docs"

# =============================================================================
# QUALITY ASSURANCE
# =============================================================================
quality:
  run_tests:
    description: "Execute test suite"
    primary:
      - tool: "Bash"
        args: "npm test"
        when: "Node.js project"
      - tool: "Bash"
        args: "pytest"
        when: "Python project"
    fallback: []

  run_linter:
    description: "Run code linter"
    primary:
      - tool: "Bash"
        args: "npm run lint"
        when: "Node.js with lint script"
      - tool: "Bash"
        args: "eslint ."
        when: "Direct eslint"
    fallback: []

  check_coverage:
    description: "Check test coverage"
    primary:
      - tool: "Bash"
        args: "npm run coverage"
        when: "Coverage script available"
    fallback: []

# =============================================================================
# GIT OPERATIONS
# =============================================================================
git:
  status:
    description: "Check git status"
    primary:
      - tool: "Bash"
        args: "git status"
    fallback: []

  diff:
    description: "Show git diff"
    primary:
      - tool: "Bash"
        args: "git diff"
    fallback: []

  commit:
    description: "Commit changes"
    primary:
      - tool: "Bash"
        args: "git commit"
        confirm: true
    fallback: []

  push:
    description: "Push to remote"
    primary:
      - tool: "Bash"
        args: "git push"
        confirm: true
    fallback: []

  branch:
    description: "Branch operations"
    primary:
      - tool: "Bash"
        args: "git branch"
    fallback: []

  pr:
    description: "Create pull request"
    primary:
      - tool: "Bash"
        args: "gh pr create"
    fallback: []

# =============================================================================
# RESEARCH & WEB
# =============================================================================
research:
  web_fetch:
    description: "Fetch web content"
    primary:
      - tool: "mcp__fetch__fetch"
        when: "Fetch URL content"
      - tool: "mcp__web_reader__webReader"
        when: "Read URL as markdown"
    fallback:
      - tool: "WebSearch"
        when: "Search web"

# =============================================================================
# MEMORY & CONTEXT
# =============================================================================
memory:
  store:
    description: "Store persistent information"
    primary:
      - tool: "mcp__memory__create_entities"
        when: "Knowledge graph storage"
      - tool: "mcp__serena__write_memory"
        when: "Project-specific memory"
    fallback:
      - tool: "Write"
        when: "File-based storage"

  recall:
    description: "Retrieve stored information"
    primary:
      - tool: "mcp__memory__search_nodes"
        when: "Search knowledge graph"
      - tool: "mcp__serena__read_memory"
        when: "Read project memory"
    fallback:
      - tool: "Read"
        when: "File-based retrieval"

# =============================================================================
# SCOPE DEFINITIONS
# =============================================================================
scopes:
  dev:
    capabilities: [read_code, write_code, search_code, analyze_code]
    skills: [superpowers:brainstorming, superpowers:tdd, superpowers:systematic-debugging]
    boundary: "Code changes only - no tests, docs, or git"

  docs:
    capabilities: [read_code, read_docs, write_docs, read_api_docs]
    skills: [claude-md-management:claude-md-improver]
    boundary: "Documentation only - no code changes"

  quality:
    capabilities: [read_code, run_tests, run_linter, check_coverage]
    skills: [superpowers:tdd, superpowers:verification-before-completion]
    boundary: "Testing only - no code changes except test files"

  git:
    capabilities: [git_status, git_diff, git_commit, git_push, git_branch, git_pr]
    skills: [superpowers:finishing-a-development-branch]
    boundary: "Git operations only - require confirmation for writes"
```

**Step 2: Validate YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('config/capabilities.yaml'))"`
Expected: No errors

**Step 3: Commit**

```bash
git add config/capabilities.yaml && git commit -m "feat(dev-stack): add capability mapping config"
```

---

### Task 4: Create Hooks Configuration

**Files:**
- Create: `hooks/hooks.json`

**Step 1: Create hooks.json**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/session-start.sh"
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/save-context.sh"
          }
        ]
      }
    ],
    "SubagentStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/track-agent.sh start"
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/track-agent.sh stop"
          }
        ]
      }
    ]
  }
}
```

**Step 2: Validate JSON syntax**

Run: `cat hooks/hooks.json | python3 -m json.tool`
Expected: Valid JSON output

**Step 3: Commit**

```bash
git add hooks/hooks.json && git commit -m "feat(dev-stack): add hooks configuration"
```

---

## Phase 2: Commands - Core

### Task 5: Create info Command

**Files:**
- Create: `commands/info.md`

**Step 1: Create info.md**

```markdown
---
name: info
description: |
  Display dev-stack plugin capabilities, available commands, and current configuration.
  Use to understand what this plugin can do and how to use it.
argument-hint:
---

# Dev-Stack Plugin Info

Display comprehensive information about the dev-stack plugin.

## Available Commands

| Command | Type | Description |
|---------|------|-------------|
| `/dev-stack:agents` | Team | Orchestrate multi-scope tasks with specialized agents |
| `/dev-stack:dev` | Scoped | Development tasks (code changes, features, bugs) |
| `/dev-stack:git` | Scoped | Git operations (commit, push, PR) |
| `/dev-stack:docs` | Scoped | Documentation tasks (README, API docs) |
| `/dev-stack:quality` | Scoped | Quality tasks (tests, coverage, review) |
| `/dev-stack:info` | Info | Display this information |
| `/dev-stack:simplify` | Analysis | Break down complex tasks without execution |

## Tool Priority System

```
Primary (MCP Tools) → Fallback (Built-in)
────────────────────────────────────────────
serena, filesystem    →  Read, Write, Edit
doc-forge             →  Read
context7              →  WebSearch
```

## Available Capabilities

### Code Operations
- `read_code` - Read and analyze code symbols
- `write_code` - Write or modify code
- `search_code` - Search patterns in codebase
- `analyze_code` - Analyze code structure

### File Operations
- `read_file`, `write_file`, `edit_file`, `list_dir`, `find_file`

### Documentation
- `read_docs`, `write_docs`, `read_api_docs`

### Quality
- `run_tests`, `run_linter`, `check_coverage`

### Git
- `git_status`, `git_diff`, `git_commit`, `git_push`, `git_branch`, `git_pr`

## Scope Boundaries

| Scope | Can Do | Cannot Do |
|-------|--------|-----------|
| dev | Code changes | Tests, docs, git |
| docs | Documentation | Code changes |
| quality | Tests only | Production code |
| git | Git operations | Code changes |

## Usage Examples

```
/dev-stack:agents เพิ่ม feature auth พร้อม UI สวยๆ
/dev-stack:dev แก้บัค login form validation
/dev-stack:docs สร้าง API documentation
/dev-stack:quality run tests and check coverage
/dev-stack:git commit และ push การเปลี่ยนแปลง
```

## Output

Display the above information in a formatted manner.
```

**Step 2: Commit**

```bash
git add commands/info.md && git commit -m "feat(dev-stack): add /dev-stack:info command"
```

---

### Task 6: Create dev Command (Scoped Development)

**Files:**
- Create: `commands/dev.md`

**Step 1: Create dev.md**

```markdown
---
name: dev
description: |
  Execute development tasks within dev scope only.
  Use for bug fixes, feature implementation, refactoring.
  Stays within code boundaries - does NOT write tests, docs, or git commits.
argument-hint: <development task>
allowed-tools: mcp__serena__*, mcp__filesystem__*, Read, Write, Edit, Grep, Glob, Bash
---

# Development Agent

You are a scoped development agent for code changes.

## Task

$ARGUMENTS

## Scope: Development Only

### ✅ Within Scope (DO)
- Read, write, edit code
- Refactor, optimize
- Bug fixes, features
- Code analysis with serena
- Use brainstorming skill for design
- Use TDD skill for implementation approach

### ❌ Out of Scope (DO NOT - use other commands)
- Writing tests → `/dev-stack:quality`
- Writing docs → `/dev-stack:docs`
- Git commits → `/dev-stack:git`

## Tool Selection

Follow capability mapping from config/capabilities.yaml:

| Capability | Primary | Fallback |
|------------|---------|----------|
| read_code | serena.find_symbol | Read |
| write_code | serena.replace_symbol_body | Edit, Write |
| search_code | serena.search_for_pattern | Grep |

**Always try primary tools first, fall back only when unavailable.**

## Workflow

1. **Understand**: Use `read_code` capability to understand existing code
2. **Design**: Use @superpowers:brainstorming skill if task is complex
3. **Implement**: Use `write_code` capability to make changes
4. **Verify**: Run basic syntax checks (if applicable)

## Boundary Detection

If task requires:
- Tests → Suggest: "Use `/dev-stack:quality` for testing"
- Docs → Suggest: "Use `/dev-stack:docs` for documentation"
- Git → Suggest: "Use `/dev-stack:git` for version control"

## Output Format

```markdown
## Development Complete

### Changes Made
- [List of files modified]

### Summary
[Brief description of changes]

### Next Steps (if any)
- Tests needed → /dev-stack:quality
- Docs needed → /dev-stack:docs
- Commit needed → /dev-stack:git
```
```

**Step 2: Commit**

```bash
git add commands/dev.md && git commit -m "feat(dev-stack): add /dev-stack:dev command"
```

---

### Task 7: Create agents Command (Team Orchestrator)

**Files:**
- Create: `commands/agents.md`

**Step 1: Create agents.md**

```markdown
---
name: agents
description: |
  Orchestrate complex multi-scope tasks with a team of specialized agents.
  Use when task spans multiple domains (dev + docs + quality).
  Analyzes task, designs workflow, spawns agents, monitors progress, generates report.
argument-hint: <complex task description>
---

# Team Orchestrator

You are the team orchestrator for complex multi-scope tasks.

## Task

$ARGUMENTS

## Your Role

1. **Analyze** task and identify required scopes
2. **Select** appropriate capabilities and tools
3. **Design** workflow steps
4. **Spawn** specialized agents for each scope
5. **Monitor** progress
6. **Aggregate** results
7. **Report** final summary

## Scope Detection

Analyze the task to identify which scopes are needed:

| Keywords | Scope | Agent |
|----------|-------|-------|
| code, feature, bug, fix, refactor | dev | worker (scope=dev) |
| test, coverage, quality | quality | worker (scope=quality) |
| doc, readme, documentation | docs | worker (scope=docs) |
| commit, push, PR, git | git | worker (scope=git) |

## Tool Selection Priority

| Scope | Primary Tools | Fallback |
|-------|--------------|----------|
| dev | serena, filesystem | Read, Write, Edit |
| docs | doc-forge, filesystem | Write |
| quality | Bash, serena | Read, Bash |
| git | Bash | - |

## Workflow Design

### Step 1: Research Phase
- Use researcher agent to understand codebase
- Identify existing patterns and conventions
- Gather context for planning

### Step 2: Planning Phase
- Use @superpowers:brainstorming skill to design approach
- Break down into subtasks
- Identify dependencies

### Step 3: Execution Phase
- Spawn worker agents for each scope
- Execute in parallel when no dependencies
- Execute sequentially when dependencies exist

### Step 4: Review Phase
- Verify each agent's output
- Check for cross-scope consistency

### Step 5: Report Phase
- Aggregate all results
- Generate summary report

## Agent Spawning

Use the Agent tool to spawn specialized agents:

```
Agent(
  subagent_type="dev-stack:worker",
  prompt="[scope-specific task with context]"
)
```

## Output Format

```markdown
## Execution Report

### Task: [original task]
### Duration: [time]
### Agents Spawned: [count]

| Agent | Scope | Status | Duration |
|-------|-------|--------|----------|
| worker-1 | dev | ✅ complete | 2m 30s |
| worker-2 | quality | ✅ complete | 1m 45s |

### Summary
[Aggregated results from all agents]

### Files Changed
- [List all modified files]

### Recommendations
[Any follow-up actions needed]
```
```

**Step 2: Commit**

```bash
git add commands/agents.md && git commit -m "feat(dev-stack): add /dev-stack:agents team orchestrator"
```

---

## Phase 3: Commands - Additional

### Task 8: Create git Command

**Files:**
- Create: `commands/git.md`

**Step 1: Create git.md**

```markdown
---
name: git
description: |
  Execute git operations within git scope.
  Use for version control tasks: status, commit, push, PR.
  Requires confirmation for write operations (commit, push).
argument-hint: <git operation>
allowed-tools: Bash(git *), Bash(gh *)
---

# Git Operations Agent

You are a scoped agent for git operations.

## Task

$ARGUMENTS

## Scope: Git Only

### ✅ Within Scope
- git status, diff, log
- git add, commit (with confirmation)
- git push (with confirmation)
- git branch, checkout
- gh pr create

### ❌ Out of Scope
- Code changes → `/dev-stack:dev`
- Tests → `/dev-stack:quality`
- Docs → `/dev-stack:docs`

## Safety Rules

⚠️ **Write operations require user confirmation:**
- `git commit` → Ask before committing
- `git push` → Ask before pushing
- `git reset --hard` → **BLOCK** (destructive)

## Common Operations

### Check Status
```bash
git status
git diff
```

### Commit Changes
1. Review changes: `git diff`
2. Stage files: `git add <files>`
3. **Ask user**: "Commit these changes?"
4. Commit: `git commit -m "message"`

### Push to Remote
1. Check status: `git status`
2. **Ask user**: "Push to remote?"
3. Push: `git push`

### Create PR
```bash
gh pr create --title "Title" --body "Description"
```

## Output Format

```markdown
## Git Operation Complete

### Operation: [status|commit|push|pr]
### Result: [success/failure]

### Details
[Relevant output]
```
```

**Step 2: Commit**

```bash
git add commands/git.md && git commit -m "feat(dev-stack): add /dev-stack:git command"
```

---

### Task 9: Create docs Command

**Files:**
- Create: `commands/docs.md`

**Step 1: Create docs.md**

```markdown
---
name: docs
description: |
  Execute documentation tasks within docs scope.
  Use for README, API docs, guides, comments.
  Stays within documentation boundaries - does NOT modify production code.
argument-hint: <documentation task>
allowed-tools: mcp__doc-forge__*, mcp__filesystem__*, mcp__context7__*, Read, Write, WebSearch
---

# Documentation Agent

You are a scoped agent for documentation tasks.

## Task

$ARGUMENTS

## Scope: Documentation Only

### ✅ Within Scope
- Write/update README
- Create API documentation
- Write guides and tutorials
- Update code comments
- Convert doc formats (markdown, HTML)
- Query external docs via context7

### ❌ Out of Scope
- Code changes → `/dev-stack:dev`
- Tests → `/dev-stack:quality`
- Git → `/dev-stack:git`

## Tool Selection

| Capability | Primary | Fallback |
|------------|---------|----------|
| read_docs | doc-forge.document_reader | Read |
| write_docs | filesystem.write_file | Write |
| read_api_docs | context7.query-docs | WebSearch |

## Workflow

1. **Research**: Read existing code/docs
2. **Structure**: Organize documentation sections
3. **Write**: Create or update documentation
4. **Format**: Ensure consistent formatting

## Documentation Standards

- Use markdown for most docs
- Include code examples
- Add proper headings hierarchy
- Link to related docs

## Output Format

```markdown
## Documentation Complete

### Files Updated
- [List of documentation files]

### Summary
[Brief description of documentation changes]
```
```

**Step 2: Commit**

```bash
git add commands/docs.md && git commit -m "feat(dev-stack): add /dev-stack:docs command"
```

---

### Task 10: Create quality Command

**Files:**
- Create: `commands/quality.md`

**Step 1: Create quality.md**

```markdown
---
name: quality
description: |
  Execute quality assurance tasks within quality scope.
  Use for running tests, coverage, linting, code review.
  Can modify test files but NOT production code.
argument-hint: <quality task>
allowed-tools: mcp__serena__*, Bash(npm test*), Bash(pytest*), Bash(npm run lint*), Read, Write, Edit
---

# Quality Assurance Agent

You are a scoped agent for quality tasks.

## Task

$ARGUMENTS

## Scope: Quality Only

### ✅ Within Scope
- Run tests
- Check coverage
- Run linters
- Write/update test files
- Code review (read-only)
- Quality reports

### ❌ Out of Scope
- Production code changes → `/dev-stack:dev`
- Documentation → `/dev-stack:docs`
- Git → `/dev-stack:git`

## Tool Selection

| Capability | Primary | Fallback |
|------------|---------|----------|
| run_tests | Bash(npm test) | Bash(pytest) |
| run_linter | Bash(npm run lint) | - |
| read_code | serena.find_symbol | Read |

## Workflow

1. **Analyze**: Understand what needs testing
2. **Run**: Execute existing tests first
3. **Write**: Add new tests if needed
4. **Verify**: Ensure all tests pass
5. **Report**: Summarize coverage and results

## Test Detection

Auto-detect test framework:
- `package.json` → npm test
- `pytest.ini` → pytest
- `go.mod` → go test

## Output Format

```markdown
## Quality Report

### Tests Run
- Total: [count]
- Passed: [count]
- Failed: [count]

### Coverage
- [Coverage percentage if available]

### Issues Found
- [List any quality issues]

### Recommendations
- [Suggestions for improvement]
```
```

**Step 2: Commit**

```bash
git add commands/quality.md && git commit -m "feat(dev-stack): add /dev-stack:quality command"
```

---

### Task 11: Create simplify Command

**Files:**
- Create: `commands/simplify.md`

**Step 1: Create simplify.md**

```markdown
---
name: simplify
description: |
  Analyze and break down complex tasks into subtasks.
  Does NOT execute - only provides task breakdown and recommendations.
  Use for planning before execution.
argument-hint: <complex task>
disable-model-invocation: false
---

# Task Simplification Agent

You are an analysis agent that breaks down complex tasks.

## Task

$ARGUMENTS

## Purpose

Analyze the task and provide:
1. Task breakdown into subtasks
2. Required capabilities identification
3. Scope detection
4. Recommended workflow
5. **DO NOT execute anything**

## Analysis Process

### Step 1: Parse Intent

Extract key information:
- **Action verbs**: "เพิ่ม", "แก้ไข", "สร้าง", "อ่าน"
- **Target objects**: "feature", "bug", "code", "docs", "tests"
- **Scope hints**: "auth", "UI", "API", "database"

### Step 2: Identify Capabilities

Map task to required capabilities:

| Task mentions... | Required capabilities |
|------------------|----------------------|
| Code changes | read_code, write_code |
| Tests | run_tests, read_code |
| Documentation | write_docs, read_code |
| Git operations | git_commit, git_push |

### Step 3: Detect Scopes

Identify which scopes are needed:
- dev: Code modifications
- docs: Documentation
- quality: Testing
- git: Version control

### Step 4: Estimate Complexity

- **Simple**: Single scope, clear requirements
- **Medium**: Multiple capabilities, some ambiguity
- **Complex**: Multi-scope, needs coordination

## Output Format

```markdown
## Task Analysis

### Original Task
[restated task]

### Detected Scopes
- [ ] dev - [reason]
- [ ] docs - [reason]
- [ ] quality - [reason]
- [ ] git - [reason]

### Required Capabilities
| Capability | Primary Tool | Fallback |
|------------|--------------|----------|
| [capability] | [tool] | [fallback] |

### Task Breakdown

| # | Subtask | Scope | Priority |
|---|---------|-------|----------|
| 1 | [subtask] | [scope] | High |
| 2 | [subtask] | [scope] | Medium |

### Recommended Workflow

```
Step 1: [action] (scope: X)
   ↓
Step 2: [action] (scope: Y)
   ↓
Step 3: [action] (scope: Z)
```

### Suggested Command

```
/dev-stack:agents [task]
```

### Estimated Complexity
[Simple/Medium/Complex]
```
```

**Step 2: Commit**

```bash
git add commands/simplify.md && git commit -m "feat(dev-stack): add /dev-stack:simplify command"
```

---

## Phase 4: Agents

### Task 12: Create orchestrator Agent

**Files:**
- Create: `agents/orchestrator.md`

**Step 1: Create orchestrator.md**

```markdown
---
name: orchestrator
description: |
  Main coordinator for complex multi-scope tasks.
  Use when task requires multiple specialized agents working together.
  Analyzes, spawns agents, monitors, and aggregates results.
tools: Agent, Task, Read, Bash
model: sonnet
---

# Team Orchestrator Agent

You are the main orchestrator for complex tasks.

## Role

Coordinate multiple agents to accomplish complex tasks that span multiple scopes.

## Capabilities

1. **Task Analysis**: Break down complex tasks
2. **Agent Selection**: Choose appropriate agents
3. **Workflow Design**: Create execution order
4. **Progress Monitoring**: Track agent status
5. **Result Aggregation**: Combine outputs

## Available Worker Types

| Agent | Scope | Best For |
|-------|-------|----------|
| worker | dev | Code changes |
| worker | docs | Documentation |
| worker | quality | Testing |
| researcher | exploration | Codebase analysis |

## Workflow Template

### 1. Research Phase
- Spawn researcher agent
- Understand codebase context
- Identify patterns

### 2. Planning Phase
- Design approach
- Break into subtasks
- Identify dependencies

### 3. Execution Phase
- Spawn worker agents
- Execute in order (parallel when possible)
- Monitor progress

### 4. Aggregation Phase
- Collect results
- Generate summary report

## Agent Spawning

```
Agent(
  subagent_type="dev-stack:worker",
  prompt="[specific task with full context]"
)
```

## Monitoring

Track spawned agents:
- Status: pending/running/complete/failed
- Duration: track time
- Results: collect outputs

## Output

Generate comprehensive execution report with all agent results.
```

**Step 2: Commit**

```bash
git add agents/orchestrator.md && git commit -m "feat(dev-stack): add orchestrator agent"
```

---

### Task 13: Create worker Agent

**Files:**
- Create: `agents/worker.md`

**Step 1: Create worker.md**

```markdown
---
name: worker
description: |
  Executes tasks within a specific scope (dev, docs, quality, git).
  Stays within scope boundaries - does NOT cross into other scopes.
  Use for scoped execution after orchestration.
tools: mcp__serena__*, mcp__filesystem__*, mcp__doc-forge__*, Read, Write, Edit, Bash
model: sonnet
maxTurns: 20
---

# Scoped Worker Agent

You are a scoped worker that executes tasks within defined boundaries.

## Scope Configuration

Your scope is defined by the orchestrator. Stay within it!

| Scope | Allowed | Blocked |
|-------|---------|---------|
| dev | Code read/write | Tests, docs, git |
| docs | Docs read/write | Code, tests |
| quality | Tests read/write | Production code |
| git | Git operations | Code, docs, tests |

## Tool Access by Scope

### dev scope
- **Primary**: serena (find_symbol, replace_symbol_body, search_for_pattern)
- **Fallback**: Read, Write, Edit, Grep, Glob
- **Skills**: @superpowers:brainstorming, @superpowers:tdd

### docs scope
- **Primary**: doc-forge, filesystem
- **Fallback**: Write, WebSearch
- **Skills**: @claude-md-management:claude-md-improver

### quality scope
- **Primary**: Bash(tests), serena
- **Fallback**: Read
- **Skills**: @superpowers:tdd, @superpowers:verification-before-completion

## Boundary Rules

⚠️ **CRITICAL**: Never cross scope boundaries!

- `scope=dev`: Only production code
- `scope=docs`: Only documentation files
- `scope=quality`: Only test files
- `scope=git`: Only git commands

## When to Stop

1. Task completed → Return result
2. Need other scope → Return with suggestion
3. Max turns reached → Return progress

## Output Format

```markdown
## Worker Complete

### Scope: [dev|docs|quality|git]
### Task: [original task]

### Changes Made
- [List of changes]

### Result
[Output or summary]

### Boundary Hit (if any)
Task requires [other scope]. Suggest using appropriate agent.
```
```

**Step 2: Commit**

```bash
git add agents/worker.md && git commit -m "feat(dev-stack): add worker agent"
```

---

### Task 14: Create researcher Agent

**Files:**
- Create: `agents/researcher.md`

**Step 1: Create researcher.md**

```markdown
---
name: researcher
description: |
  Fast exploration agent for codebase research.
  Read-only access - does NOT modify files.
  Use for understanding codebase before planning.
tools: mcp__serena__find_symbol, mcp__serena__search_for_pattern, mcp__serena__get_symbols_overview, mcp__serena__find_file, mcp__serena__list_dir, Read, Grep, Glob
model: haiku
---

# Researcher Agent

You are a fast, read-only exploration agent.

## Role

Explore and understand codebase without making any changes.

## Tools (Read-Only)

**Primary (MCP)**:
- serena.find_symbol - Find code symbols
- serena.search_for_pattern - Search codebase
- serena.get_symbols_overview - File structure
- serena.find_file - Locate files

**Fallback (Built-in)**:
- Read - Read files
- Grep - Search content
- Glob - Find files

## Use Cases

1. **Codebase Exploration**: Understand project structure
2. **Code Search**: Find relevant code for tasks
3. **Pattern Analysis**: Identify conventions and patterns
4. **Context Gathering**: Provide context for planning

## Output Format

```markdown
## Research Summary

### Codebase Structure
[Overview of project structure]

### Relevant Files

| File | Purpose | Key Symbols |
|------|---------|-------------|
| path/to/file | [purpose] | [symbols] |

### Patterns Detected
[Conventions, patterns, style]

### Key Findings
[Important discoveries]

### Recommendations
[Suggestions for implementation]
```

## Constraints

- **Read-only**: Never use Write, Edit, or Bash
- **Fast**: Use haiku model for speed
- **Thorough**: Check multiple sources
```

**Step 2: Commit**

```bash
git add agents/researcher.md && git commit -m "feat(dev-stack): add researcher agent"
```

---

## Phase 5: Skills

### Task 15: Create task-analysis Skill

**Files:**
- Create: `skills/task-analysis/SKILL.md`

**Step 1: Create SKILL.md**

```markdown
---
name: task-analysis
description: |
  Analyze user tasks and identify required capabilities.
  Use before starting any complex task to understand scope.
  Maps natural language tasks to capability requirements.
argument-hint: <task description>
---

# Task Analysis Skill

## Purpose

Analyze user's natural language task and identify:
1. Required capabilities
2. Scope boundaries
3. Complexity level
4. Suggested approach

## Analysis Process

### Step 1: Parse Intent

Extract key information from task:
- **Action verbs**: "เพิ่ม", "แก้ไข", "สร้าง", "อ่าน", "เขียน", "ทดสอบ"
- **Target objects**: "feature", "bug", "code", "docs", "tests", "UI"
- **Scope hints**: "auth", "API", "database", "frontend", "backend"

### Step 2: Identify Capabilities

Map task keywords to capabilities:

| Task mentions... | Required capabilities |
|------------------|----------------------|
| อ่าน/ดู/วิเคราะห์ code | read_code, analyze_code |
| แก้ไข/เพิ่ม/สร้าง code | write_code, read_code |
| ค้นหา/หา | search_code, read_code |
| เขียน docs/README | write_docs, read_code |
| ทดสอบ/test | run_tests, write_code (tests) |
| commit/push | git_commit, git_push |

### Step 3: Detect Scope Boundaries

Identify which scopes are needed:

| Detected Scope | Reason |
|----------------|--------|
| dev | Code changes detected |
| docs | Documentation mentioned |
| quality | Testing mentioned |
| git | Git operations mentioned |

### Step 4: Estimate Complexity

- **Simple**: Single scope, clear requirements
- **Medium**: 2 scopes, some ambiguity
- **Complex**: 3+ scopes, needs coordination

## Output Template

```markdown
## Task Analysis

### Original Task
[Restated task]

### Detected Scopes
- Primary: [scope]
- Secondary: [scope] (if any)

### Required Capabilities
| Capability | When to Use |
|------------|-------------|
| [capability] | [reason] |

### Scope Boundaries
✅ In Scope: [what's included]
❌ Out of Scope: [what's not]

### Recommended Command
`/dev-stack:[command] [task]`

### Complexity: [Simple/Medium/Complex]
```

## Usage

This skill is automatically loaded when analyzing tasks. Use it to:
- Understand task requirements
- Plan approach before execution
- Identify potential scope conflicts
```

**Step 2: Commit**

```bash
git add skills/task-analysis/SKILL.md && git commit -m "feat(dev-stack): add task-analysis skill"
```

---

### Task 16: Create tool-selection Skill

**Files:**
- Create: `skills/tool-selection/SKILL.md`

**Step 1: Create SKILL.md**

```markdown
---
name: tool-selection
description: |
  Select appropriate tools based on capabilities and availability.
  Uses capability mapping to choose primary or fallback tools.
  Warns when falling back to built-in tools.
---

# Tool Selection Skill

## Purpose

Given required capabilities, select the best available tools based on priority.

## Priority System

```
Level 1: Primary (MCP Tools) - Better capabilities
    ↓ (if unavailable)
Level 2: Fallback (Built-in) - Always available
```

## Selection Logic

For each required capability:

1. Check `config/capabilities.yaml` for mapping
2. Test if primary tool is available
3. If available → Use primary
4. If not → Use fallback + Warn user

## Capability Mapping Reference

| Capability | Primary | Fallback |
|------------|---------|----------|
| read_code | serena.find_symbol | Read |
| write_code | serena.replace_symbol_body | Edit |
| search_code | serena.search_for_pattern | Grep |
| read_file | filesystem.read_text_file | Read |
| write_file | filesystem.write_file | Write |
| read_docs | doc-forge.document_reader | Read |
| read_api_docs | context7.query-docs | WebSearch |

## Availability Check

### MCP Tools (Primary)
Check if MCP server is running:
- `mcp__serena__*` - Serena for code analysis
- `mcp__filesystem__*` - Filesystem operations
- `mcp__doc-forge__*` - Document processing
- `mcp__context7__*` - Documentation lookup

### Built-in Tools (Fallback)
Always available:
- Read, Write, Edit
- Bash, Grep, Glob
- WebSearch

## Warning Template

When using fallback:

```
⚠️ Using fallback tool for [capability]
   Primary: [primary_tool] (unavailable)
   Fallback: [fallback_tool]

   Consider starting MCP server for better capabilities.
```

## Output Template

```markdown
## Tool Selection

| Capability | Selected Tool | Reason |
|------------|---------------|--------|
| [capability] | [tool] | [primary/fallback] |

### Warnings
[Any fallback warnings]
```
```

**Step 2: Commit**

```bash
git add skills/tool-selection/SKILL.md && git commit -m "feat(dev-stack): add tool-selection skill"
```

---

### Task 17: Create workflow-design Skill

**Files:**
- Create: `skills/workflow-design/SKILL.md`

**Step 1: Create SKILL.md**

```markdown
---
name: workflow-design
description: |
  Design step-by-step execution workflows for tasks.
  Creates execution plans with capability dependencies.
  Supports templates: feature, bug-fix, documentation.
---

# Workflow Design Skill

## Purpose

Create structured execution plans for tasks with:
- Step-by-step breakdown
- Capability dependencies
- Execution order (sequential/parallel)

## Workflow Templates

### Template 1: Feature Development
```yaml
name: feature
steps:
  1_research:
    capabilities: [search_code, read_code]
    outputs: [codebase_context]
  2_design:
    capabilities: [analyze_code]
    skills: [brainstorming]
    outputs: [design_doc]
  3_implement:
    capabilities: [write_code]
    scope: dev
    outputs: [code_changes]
  4_test:
    capabilities: [run_tests]
    scope: quality
    outputs: [test_results]
  5_document:
    capabilities: [write_docs]
    scope: docs
    outputs: [documentation]
```

### Template 2: Bug Fix
```yaml
name: bug-fix
steps:
  1_locate:
    capabilities: [search_code, read_code]
    outputs: [bug_location]
  2_understand:
    capabilities: [analyze_code]
    outputs: [root_cause]
  3_fix:
    capabilities: [write_code]
    scope: dev
    outputs: [fix]
  4_verify:
    capabilities: [run_tests]
    scope: quality
    outputs: [verification]
```

### Template 3: Documentation
```yaml
name: documentation
steps:
  1_read_code:
    capabilities: [read_code, analyze_code]
    outputs: [code_understanding]
  2_write_docs:
    capabilities: [write_docs]
    scope: docs
    outputs: [documentation]
```

## Dependency Rules

- `write_code` requires `read_code` first
- `run_tests` should follow `write_code`
- `git_commit` should follow `run_tests`

## Execution Order

### Sequential
When steps depend on previous outputs:
```
Step 1 → Step 2 → Step 3
```

### Parallel
When steps are independent:
```
Step 1 ─┬→ Step 2a
        └→ Step 2b
```

## Output Template

```markdown
## Workflow Design

**Template**: [template_name]
**Total Steps**: [N]

| Step | Name | Capabilities | Scope | Dependencies |
|------|------|--------------|-------|--------------|
| 1 | [name] | [caps] | [scope] | - |
| 2 | [name] | [caps] | [scope] | step 1 |

### Execution Order
[Sequential/Parallel with diagram]

### Estimated Steps
[Number of execution steps]
```
```

**Step 2: Commit**

```bash
git add skills/workflow-design/SKILL.md && git commit -m "feat(dev-stack): add workflow-design skill"
```

---

## Phase 6: Hook Scripts

### Task 18: Create session-start.sh

**Files:**
- Create: `scripts/session-start.sh`

**Step 1: Create session-start.sh**

```bash
#!/bin/bash
# SessionStart Hook - Display welcome or restore context
# Location: ${CLAUDE_PLUGIN_ROOT}/scripts/session-start.sh

CONTEXT_FILE="${CLAUDE_PLUGIN_ROOT}/context/current-task.json"

if [ -f "$CONTEXT_FILE" ]; then
    echo ""
    echo "📂 Found previous session context"
    if command -v jq &> /dev/null; then
        TASK=$(jq -r '.task // "Unknown"' "$CONTEXT_FILE" 2>/dev/null)
        STATUS=$(jq -r '.status // "unknown"' "$CONTEXT_FILE" 2>/dev/null)
        echo "   Task: $TASK"
        echo "   Status: $STATUS"
    else
        cat "$CONTEXT_FILE"
    fi
    echo ""
else
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                      🚀 DEV-STACK v2.0                        ║"
    echo "║              Tool Orchestration Plugin                        ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "║  /dev-stack:agents <task>   Multi-scope orchestration        ║"
    echo "║  /dev-stack:dev <task>      Development tasks                ║"
    echo "║  /dev-stack:docs <task>     Documentation                    ║"
    echo "║  /dev-stack:quality <task>  Testing & quality                ║"
    echo "║  /dev-stack:git <task>      Git operations                   ║"
    echo "║  /dev-stack:info            Show capabilities                ║"
    echo "║  /dev-stack:simplify <task> Task breakdown only              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
fi
```

**Step 2: Make executable**

```bash
chmod +x scripts/session-start.sh
```

**Step 3: Commit**

```bash
git add scripts/session-start.sh && git commit -m "feat(dev-stack): add session-start hook script"
```

---

### Task 19: Create save-context.sh

**Files:**
- Create: `scripts/save-context.sh`

**Step 1: Create save-context.sh**

```bash
#!/bin/bash
# PreCompact Hook - Save context before session compaction
# Location: ${CLAUDE_PLUGIN_ROOT}/scripts/save-context.sh

CONTEXT_DIR="${CLAUDE_PLUGIN_ROOT}/context"
CONTEXT_FILE="${CONTEXT_DIR}/current-task.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Ensure context directory exists
mkdir -p "$CONTEXT_DIR"

# Read stdin (hook input from Claude Code)
read -r HOOK_INPUT

# Create context JSON
cat > "$CONTEXT_FILE" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "reason": "session_compaction",
  "resumable": true,
  "hook_data": ${HOOK_INPUT:-"{}"}
}
EOF

echo ""
echo "💾 Context saved before compaction"
echo "   File: ${CONTEXT_FILE}"
echo "   Time: ${TIMESTAMP}"
echo ""
```

**Step 2: Make executable**

```bash
chmod +x scripts/save-context.sh
```

**Step 3: Commit**

```bash
git add scripts/save-context.sh && git commit -m "feat(dev-stack): add save-context hook script"
```

---

### Task 20: Create track-agent.sh

**Files:**
- Create: `scripts/track-agent.sh`

**Step 1: Create track-agent.sh**

```bash
#!/bin/bash
# SubagentStart/SubagentStop Hook - Track agent lifecycle
# Location: ${CLAUDE_PLUGIN_ROOT}/scripts/track-agent.sh
# Usage: track-agent.sh [start|stop]

ACTION=$1
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_FILE="${CLAUDE_PLUGIN_ROOT}/context/agent-log.jsonl"

# Ensure context directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Read stdin for agent info
read -r AGENT_INFO

# Extract agent name if jq available
if command -v jq &> /dev/null; then
    AGENT_NAME=$(echo "$AGENT_INFO" | jq -r '.agent_name // .subagent_type // "unknown"' 2>/dev/null)
else
    AGENT_NAME="unknown"
fi

if [ "$ACTION" = "start" ]; then
    echo "{\"event\": \"agent_start\", \"timestamp\": \"${TIMESTAMP}\", \"agent\": \"${AGENT_NAME}\", \"data\": ${AGENT_INFO:-"{}"}}" >> "$LOG_FILE"
    echo "🚀 Agent started: ${AGENT_NAME}"
elif [ "$ACTION" = "stop" ]; then
    echo "{\"event\": \"agent_stop\", \"timestamp\": \"${TIMESTAMP}\", \"agent\": \"${AGENT_NAME}\", \"data\": ${AGENT_INFO:-"{}"}}" >> "$LOG_FILE"
    echo "✅ Agent completed: ${AGENT_NAME}"
else
    echo "Usage: $0 [start|stop]"
    exit 1
fi
```

**Step 2: Make executable**

```bash
chmod +x scripts/track-agent.sh
```

**Step 3: Commit**

```bash
git add scripts/track-agent.sh && git commit -m "feat(dev-stack): add track-agent hook script"
```

---

### Task 21: Create generate-report.sh

**Files:**
- Create: `scripts/generate-report.sh`

**Step 1: Create generate-report.sh**

```bash
#!/bin/bash
# Stop Hook - Generate final execution report
# Location: ${CLAUDE_PLUGIN_ROOT}/scripts/generate-report.sh

CONTEXT_DIR="${CLAUDE_PLUGIN_ROOT}/context"
REPORT_FILE="${CONTEXT_DIR}/execution-report.md"
AGENT_LOG="${CONTEXT_DIR}/agent-log.jsonl"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Generate report
cat > "$REPORT_FILE" << EOF
# Dev-Stack Execution Report

**Generated**: ${TIMESTAMP}

## Summary

EOF

# Add agent log if exists
if [ -f "$AGENT_LOG" ]; then
    echo "### Agent Activity" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "| Time | Event | Agent |" >> "$REPORT_FILE"
    echo "|------|-------|-------|" >> "$REPORT_FILE"

    if command -v jq &> /dev/null; then
        jq -r '"| \(.timestamp) | \(.event) | \(.agent) |"' "$AGENT_LOG" >> "$REPORT_FILE" 2>/dev/null
    else
        cat "$AGENT_LOG" >> "$REPORT_FILE"
    fi

    echo "" >> "$REPORT_FILE"
fi

echo ""
echo "📊 Report generated: ${REPORT_FILE}"
echo ""
```

**Step 2: Make executable**

```bash
chmod +x scripts/generate-report.sh
```

**Step 3: Commit**

```bash
git add scripts/generate-report.sh && git commit -m "feat(dev-stack): add generate-report hook script"
```

---

## Phase 7: Documentation

### Task 22: Create README.md

**Files:**
- Create: `README.md`

**Step 1: Create README.md**

```markdown
# Dev-Stack Orchestrator Plugin

> Intelligent workflow orchestrator for Claude Code

## Overview

Dev-Stack is a Claude Code plugin that orchestrates tools and workflows automatically. It analyzes tasks, selects appropriate tools, and executes workflows with context preservation.

## Features

- **🎯 Smart Task Analysis**: Automatically detects task scope and requirements
- **🔧 Capability-Based Tool Selection**: Primary (MCP) → Fallback (Built-in) priority
- **🤖 Team Orchestration**: Spawns specialized agents for complex multi-scope tasks
- **💾 Context Preservation**: Saves and restores context across sessions
- **📊 Progress Tracking**: Real-time agent monitoring and reporting

## Installation

1. Clone or copy this directory to your plugins folder
2. Enable the plugin:
   ```bash
   claude plugin enable dev-stack
   ```

## Commands

| Command | Description |
|---------|-------------|
| `/dev-stack:agents <task>` | Orchestrate complex multi-scope tasks |
| `/dev-stack:dev <task>` | Development tasks (code changes) |
| `/dev-stack:git <task>` | Git operations |
| `/dev-stack:docs <task>` | Documentation tasks |
| `/dev-stack:quality <task>` | Testing and quality |
| `/dev-stack:info` | Display capabilities |
| `/dev-stack:simplify <task>` | Task breakdown only |

## Usage Examples

### Complex Multi-Scope Task
```
/dev-stack:agents เพิ่ม feature auth พร้อม UI สวยๆ
```
This will:
1. Analyze task → detect dev + docs + quality scopes
2. Design workflow → create execution plan
3. Spawn agents → execute in parallel/sequence
4. Generate report → show results

### Single Scope Task
```
/dev-stack:dev แก้บัค login form validation
```
This will:
1. Stay within dev scope
2. Use serena for code analysis
3. Make targeted code changes
4. Suggest next steps (tests, docs)

### Task Analysis Only
```
/dev-stack:simplify เพิ่ม OAuth2 พร้อม 2FA
```
This will:
1. Analyze task complexity
2. Break into subtasks
3. Show workflow design
4. **NOT execute anything**

## Tool Priority

| Level | Tools | When Used |
|-------|-------|-----------|
| Primary | MCP (serena, filesystem, doc-forge) | When available |
| Fallback | Built-in (Read, Write, Edit) | When MCP unavailable |

## Scope Boundaries

| Scope | Can Do | Cannot Do |
|-------|--------|-----------|
| dev | Code changes | Tests, docs, git |
| docs | Documentation | Code changes |
| quality | Tests only | Production code |
| git | Git operations | Code changes |

## Configuration

Configuration files are in `config/`:
- `capabilities.yaml` - Tool capability mapping

## Hooks

| Hook | Purpose |
|------|---------|
| SessionStart | Welcome message or restore context |
| PreCompact | Save context before compaction |
| SubagentStart | Track agent start |
| SubagentStop | Track agent completion |

## Development

### Project Structure
```
dev-stack/
├── .claude-plugin/plugin.json
├── commands/          # 7 commands
├── agents/            # 3 agents
├── skills/            # 3 skills
├── hooks/             # hooks.json
├── scripts/           # hook scripts
├── config/            # configuration
└── context/           # context storage
```

### Adding New Capabilities

1. Edit `config/capabilities.yaml`
2. Add capability mapping with primary/fallback tools
3. Update relevant commands/agents

## License

MIT
```

**Step 2: Commit**

```bash
git add README.md && git commit -m "docs(dev-stack): add README"
```

---

### Task 23: Final Verification

**Step 1: Verify all files exist**

```bash
find .claude-plugin commands agents skills hooks scripts config -type f | sort
```

Expected output:
```
.claude-plugin/plugin.json
agents/orchestrator.md
agents/researcher.md
agents/worker.md
commands/agents.md
commands/dev.md
commands/docs.md
commands/git.md
commands/info.md
commands/quality.md
commands/simplify.md
config/capabilities.yaml
hooks/hooks.json
scripts/generate-report.sh
scripts/save-context.sh
scripts/session-start.sh
scripts/track-agent.sh
skills/task-analysis/SKILL.md
skills/tool-selection/SKILL.md
skills/workflow-design/SKILL.md
```

**Step 2: Verify JSON files are valid**

```bash
python3 -m json.tool .claude-plugin/plugin.json > /dev/null && echo "plugin.json: OK"
python3 -m json.tool hooks/hooks.json > /dev/null && echo "hooks.json: OK"
```

Expected: Both files valid

**Step 3: Verify YAML is valid**

```bash
python3 -c "import yaml; yaml.safe_load(open('config/capabilities.yaml'))" && echo "capabilities.yaml: OK"
```

Expected: YAML valid

**Step 4: Verify scripts are executable**

```bash
ls -la scripts/*.sh | grep -c "^-rwx"
```

Expected: 4 (all scripts executable)

**Step 5: Final commit**

```bash
git add . && git commit -m "feat(dev-stack): complete plugin implementation"
```

---

## Summary

| Phase | Tasks | Components |
|-------|-------|------------|
| 1. Core Infrastructure | 1-4 | Directory structure, plugin.json, capabilities.yaml, hooks.json |
| 2. Commands - Core | 5-7 | info, dev, agents |
| 3. Commands - Additional | 8-11 | git, docs, quality, simplify |
| 4. Agents | 12-14 | orchestrator, worker, researcher |
| 5. Skills | 15-17 | task-analysis, tool-selection, workflow-design |
| 6. Hook Scripts | 18-21 | session-start, save-context, track-agent, generate-report |
| 7. Documentation | 22-23 | README, verification |

**Total: 23 Tasks**
