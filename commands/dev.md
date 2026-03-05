---
name: dev
description: |
  Scoped Development Command - Execute code-related tasks within dev scope only.
  This command does NOT spawn agents - it executes directly.
  Use this for simple, single-scope development tasks.
arguments:
  - name: task
    description: The development task description
    required: true
---

# Dev-Stack: Dev - Scoped Development

You are executing a **scoped development task** within the `dev` scope.

## Scope Boundary

```
┌─────────────────────────────────────────────────────────────┐
│                      dev SCOPE                              │
│                                                             │
│  ✅ ALLOWED:                                                │
│  • Read code (serena.find_symbol)                          │
│  • Write code (serena.replace_symbol_body)                 │
│  • Search code (serena.search_for_pattern)                 │
│  • Analyze code (serena.get_symbols_overview)              │
│  • Read files (filesystem.read_text_file)                  │
│  • Write files (filesystem.write_file)                     │
│  • Edit files (filesystem.edit_file)                       │
│                                                             │
│  ❌ BLOCKED:                                                │
│  • Git operations (commit, push, branch)                   │
│  • Running tests                                           │
│  • Documentation writing                                   │
└─────────────────────────────────────────────────────────────┘
```

## Tool Priority (CRITICAL)

```
┌─────────────────────────────────────────────────────────────┐
│  PRIORITY ORDER FOR CODE OPERATIONS:                        │
│                                                             │
│  1. serena MCP (Primary)                                    │
│     • find_symbol         → Read specific code symbols      │
│     • replace_symbol_body → Modify code                     │
│     • insert_after_symbol → Add new code                    │
│     • search_for_pattern  → Search codebase                 │
│     • get_symbols_overview → Understand structure           │
│                                                             │
│  2. filesystem MCP (Primary for files)                      │
│     • read_text_file      → Read file contents              │
│     • write_file          → Write new files                 │
│     • edit_file           → Edit existing files             │
│                                                             │
│  3. Built-in Tools (FALLBACK ONLY)                          │
│     • Read, Write, Edit, Grep, Glob                        │
│     ⚠️ MUST log warning when using fallback                 │
└─────────────────────────────────────────────────────────────┘
```

## Execution Steps

### Step 1: Validate Scope

Check if the task is within `dev` scope:

| Task Type | In Scope? | Suggestion |
|-----------|-----------|------------|
| "fix bug in login.ts" | ✅ Yes | Proceed |
| "add new API endpoint" | ✅ Yes | Proceed |
| "commit the changes" | ❌ No | Use `/dev-stack:git` |
| "update README" | ❌ No | Use `/dev-stack:docs` |
| "run tests" | ❌ No | Use `/dev-stack:quality` |

### Step 2: Select Tools

Based on the task, select appropriate tools:

| Operation | Primary Tool | Fallback |
|-----------|--------------|----------|
| Read code symbol | serena.find_symbol | Read, Grep |
| Modify code | serena.replace_symbol_body | Edit |
| Add new code | serena.insert_after_symbol | Edit, Write |
| Search code | serena.search_for_pattern | Grep |
| Read file | filesystem.read_text_file | Read |
| Write file | filesystem.write_file | Write |

### Step 3: Execute

Execute the task directly (NO agent spawning):
1. Read/analyze existing code using MCP tools
2. Make necessary modifications using MCP tools
3. Verify changes are correct

### Step 4: Report

Report what was done:
- Files modified
- Code changes summary
- Tools used (note if fallback was used)

## Example Usage

```
/dev-stack:dev "Fix the null pointer exception in the login handler"

Expected behavior:
1. Validate scope → dev ✅
2. Find login handler code → serena.find_symbol
3. Analyze the issue
4. Fix the code → serena.replace_symbol_body
5. Report changes
```

## Important Rules

1. **Stay in Scope**: Never perform git, docs, or quality operations
2. **MCP First**: Always try serena/filesystem MCP tools before built-in
3. **No Agents**: Execute directly, do not spawn sub-agents
4. **Report Boundary Violations**: If task requires other scope, report to user
5. **Log Fallback Usage**: Warn when using built-in tools
