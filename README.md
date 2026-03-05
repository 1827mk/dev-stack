# Dev-Stack Orchestrator Plugin

**Version**: 2.0.0
**Author**: Dev-Stack Team
**Claude Code Plugin for Intelligent Workflow Orchestration**

---

## Overview

Dev-Stack Orchestrator เป็น Claude Code Plugin ที่ช่วยจัดการ tools และ workflows โดยอัตโนมัติ พร้อมระบบ context preservation

### Core Flow

```
Task Input → Analysis → Capability Selection → Tool Selection → Workflow → Execution → Report
```

### Key Features

- 🔄 **Multi-Scope Task Handling** - รองรับ tasks ที่ต้องทำหลาย scope พร้อมกัน
- 🤖 **Parallel Worker Spawning** - สร้าง workers ทำงานพร้อมกันสำหรับ independent tasks
- 🛠️ **MCP-First Tool Priority** - ใช้ MCP tools เป็นหลัก, built-in เป็น fallback
- 🛡️ **Scope Boundary Enforcement** - ป้องกันการทำงานนอก scope ที่กำหนด
- 📊 **Comprehensive Reporting** - สร้าง report หลังทำงานเสร็จ
- 💾 **Context Preservation** - บันทึก context เมื่อ context compact

---

## Installation

### Prerequisites

- Claude Code CLI installed
- MCP servers configured (optional but recommended):
  - `serena` - Code operations
  - `filesystem` - File operations
  - `doc-forge` - Document operations
  - `context7` - API documentation
  - `memory` - Knowledge graph

### Setup

1. Clone or copy this plugin to your project:
```bash
cp -r dev-stacks /path/to/your/project/
```

2. Ensure Claude Code can discover the plugin:
```bash
# Plugin should be in project root as .claude-plugin/
# Or configure in Claude Code settings
```

---

## Commands

### `/dev-stack:agents` - Team Orchestrator

**Main orchestrator command for complex multi-scope tasks**

```
/dev-stack:agents "add user authentication and update docs"
```

**Behavior**:
1. Analyzes task → identifies scopes (dev, docs)
2. Spawns workers in PARALLEL for independent tasks
3. Monitors execution
4. Aggregates results
5. Generates report

**Use when**:
- Task involves multiple scopes
- Need coordinated execution
- Want parallel processing

---

### `/dev-stack:dev` - Development Scope

**Scoped command for code changes only**

```
/dev-stack:dev "add validation to login form"
```

**Scope**: `dev` only

**Allowed**:
- Read/write code
- Analyze code structure
- Create new files

**Blocked**:
- Git operations
- Running tests
- Creating documentation

---

### `/dev-stack:git` - Git Operations

**Scoped command for version control**

```
/dev-stack:git "commit the changes with message 'fix login'"
```

**Scope**: `git` only

**Allowed**:
- git status
- git commit
- git push
- git branch operations

**Blocked**:
- Code modifications
- Running tests

---

### `/dev-stack:docs` - Documentation

**Scoped command for documentation**

```
/dev-stack:docs "create API documentation for auth module"
```

**Scope**: `docs` only

**Allowed**:
- Read/write documentation
- Convert document formats
- Query API docs (context7)

**Blocked**:
- Code modifications
- Git operations

---

### `/dev-stack:quality` - Testing & Linting

**Scoped command for quality checks**

```
/dev-stack:quality "run tests and check coverage"
```

**Scope**: `quality` only

**Allowed**:
- Run tests
- Run linters
- Check coverage

**Blocked**:
- Code modifications
- Git operations

---

### `/dev-stack:info` - Capabilities Display

**Display available capabilities and tool mappings**

```
/dev-stack:info
/dev-stack:info tools
/dev-stack:info scopes
```

---

### `/dev-stack:simplify` - Task Breakdown

**Break down complex tasks without execution**

```
/dev-stack:simplify "build authentication system"
```

**Output**: Structured task list with:
- Identified scopes
- Subtasks
- Complexity estimates
- Recommended approach

**No files modified** - analysis only

---

## Tool Priority System

### Priority Order

```
┌─────────────────────────────────────────────────────────────┐
│  1. MCP SERVER TOOLS (Primary)                             │
│     ├── serena.* for code operations                       │
│     ├── filesystem.* for file operations                   │
│     ├── doc-forge.* for document operations                │
│     ├── context7.* for API documentation                   │
│     └── memory.* for persistence                           │
│                                                             │
│  2. PLUGIN SKILLS (Secondary)                              │
│     ├── task-analysis                                      │
│     ├── tool-selection                                     │
│     └── workflow-design                                    │
│                                                             │
│  3. BUILT-IN TOOLS (Fallback - LAST RESORT)                │
│     ├── Read, Write, Edit, Bash, Grep, Glob               │
│     └── ⚠️ Warning logged when using fallback             │
└─────────────────────────────────────────────────────────────┘
```

### Why MCP First?

- **Better Capabilities**: MCP tools like serena provide semantic code understanding
- **More Accurate**: Symbol-based operations vs string-based
- **Safer**: Atomic operations with better error handling
- **Faster**: Optimized for specific tasks

---

## Scope Boundaries

### Scope Matrix

| Operation | dev | git | docs | quality |
|-----------|-----|-----|------|---------|
| Read code | ✅ | ❌ | ✅ | ✅ |
| Write code | ✅ | ❌ | ❌ | ❌ |
| Git commit | ❌ | ✅ | ❌ | ❌ |
| Write docs | ❌ | ❌ | ✅ | ❌ |
| Run tests | ❌ | ❌ | ❌ | ✅ |

### Boundary Violation Handling

When a scope boundary is violated:
1. Operation is blocked
2. Error message displayed
3. Correct command suggested

Example:
```
User: /dev-stack:dev "commit the changes"
Error: Scope violation - 'commit' is not allowed in 'dev' scope
Suggestion: Use /dev-stack:git for git operations
```

---

## Parallel Execution

### When Parallel?

Tasks are executed in parallel when:
- Multiple scopes identified
- Steps have no dependencies
- Workers can work independently

### Example

```
Task: "Add user profile page and update API docs"

Analysis:
├── Scopes: [dev, docs]
└── Dependencies: None (independent)

Execution:
├── [PARALLEL] dev-worker: Create profile component
└── [PARALLEL] docs-worker: Update API documentation

Results: Aggregated after both complete
```

### Sequential When Needed

```
Task: "Fix bug and run tests"

Analysis:
├── Scopes: [dev, quality]
└── Dependencies: Tests depend on fix

Execution:
├── [1] dev-worker: Fix the bug
└── [2] quality-worker: Run tests (waits for fix)
```

---

## Context Preservation

### Automatic Save Triggers

- **PreCompact**: Context saved before context compaction
- **SessionEnd**: Final state saved

### Saved Information

```json
{
  "task": "Original task description",
  "phase": "Current execution phase",
  "workers_status": {
    "worker_1": "completed",
    "worker_2": "in_progress"
  },
  "partial_results": [...]
}
```

### Restoration

Context is automatically restored on session start if previous session had saved state.

---

## Reports

### Report Structure

```markdown
# Dev-Stack Execution Report

## Summary
- Task: [description]
- Status: [success/partial/failed]
- Workers: [count]

## Execution Details
### [Scope] Worker
- Actions taken
- Files modified
- Tools used

## Tool Usage Summary
- MCP Tools: [count] ([percentage]%)
- Fallback Tools: [count] ([percentage]%) ⚠️

## Files Modified
- [list of files]

## Recommendations
- [follow-up actions]
```

---

## Configuration

### capabilities.yaml

Defines capability → tool mapping with MCP-first priority.

```yaml
code:
  read_code:
    primary:
      - tool: "mcp__serena__find_symbol"
    fallback:
      - tool: "Read"
```

### plugin.yaml

Plugin settings including:
- Tool priority configuration
- Agent settings
- Scope definitions
- Logging options

---

## Hooks

| Hook | Script | Purpose |
|------|--------|---------|
| SessionStart | session-start.sh | Welcome banner, context restore |
| PreCompact | save-context.sh | Save session state |
| SubagentStart | track-agent.sh | Log agent spawn |
| SubagentStop | track-agent.sh | Log agent completion |
| Stop | generate-report.sh | Generate final report |

---

## Troubleshooting

### MCP Tools Not Working

1. Check MCP server status:
```bash
# Check if serena is running
# Check MCP configuration
```

2. Fallback mode:
- Plugin will use built-in tools
- Warnings logged
- Task still completes

### Scope Violations

1. Check which scope you're using
2. Use correct command for operation
3. Or use `/dev-stack:agents` for multi-scope

### Context Not Restoring

1. Check `context/` directory exists
2. Verify `session-state.json` is valid
3. Check file permissions

---

## Examples

### Example 1: Simple Bug Fix

```
User: /dev-stack:dev "fix the login validation bug"

Analysis:
├── Intent: bug_fix
├── Scope: dev
└── Complexity: low

Execution:
1. Find login validation code (serena.find_symbol)
2. Analyze the bug (serena.get_symbols_overview)
3. Fix the validation (serena.replace_symbol_body)

Report: Bug fixed, 1 file modified
```

### Example 2: Feature with Docs

```
User: /dev-stack:agents "add user profile with avatar upload"

Analysis:
├── Intent: feature
├── Scopes: [dev, docs]
└── Complexity: medium

Execution:
├── [PARALLEL] dev-worker: Create profile component
├── [PARALLEL] dev-worker: Add avatar upload
└── [SEQUENTIAL] docs-worker: Update API docs

Report: Feature complete, 3 files modified, docs updated
```

### Example 3: Quality Check

```
User: /dev-stack:quality "run tests and fix any failures"

Note: /dev-stack:quality can only run tests, not fix code

Suggestion: Use /dev-stack:agents "fix failing tests"
```

---

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests: `./tests/run-tests.sh`
5. Submit pull request

---

## License

MIT License - See LICENSE file for details

---

## Support

- **Issues**: GitHub Issues
- **Documentation**: `/dev-stack:info`
- **Examples**: `examples/` directory
