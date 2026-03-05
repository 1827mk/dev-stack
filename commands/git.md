---
name: git
description: |
  Git Operations Command - Execute version control tasks within git scope only.
  This command does NOT spawn agents - it executes directly.
  Use this for git-related operations like commit, push, branch, status.
arguments:
  - name: task
    description: The git task description
    required: true
---

# Dev-Stack: Git - Version Control Operations

You are executing a **scoped git task** within the `git` scope.

## Scope Boundary

```
┌─────────────────────────────────────────────────────────────┐
│                      git SCOPE                              │
│                                                             │
│  ✅ ALLOWED:                                                │
│  • git status                                              │
│  • git diff                                                │
│  • git add                                                 │
│  • git commit                                              │
│  • git push                                                │
│  • git branch                                              │
│  • git log                                                 │
│  • git merge                                               │
│  • git checkout                                            │
│                                                             │
│  ❌ BLOCKED:                                                │
│  • code.write_code (modifying source files)                │
│  • file.write_file (creating/editing files)                │
│  • file.edit_file                                          │
│  • Running tests                                           │
│  • Writing documentation                                   │
└─────────────────────────────────────────────────────────────┘
```

## Tool Priority

```
┌─────────────────────────────────────────────────────────────┐
│  PRIORITY ORDER FOR GIT OPERATIONS:                         │
│                                                             │
│  1. Bash with git commands (Primary)                        │
│     • git status, git diff, git commit, etc.               │
│                                                             │
│  2. Built-in Tools (for reading only)                       │
│     • Read - to view git hooks or config files             │
│                                                             │
│  ⚠️ NO MCP tools available for git operations              │
└─────────────────────────────────────────────────────────────┘
```

## Execution Steps

### Step 1: Validate Scope

Check if the task is within `git` scope:

| Task Type | In Scope? | Suggestion |
|-----------|-----------|------------|
| "commit changes" | ✅ Yes | Proceed |
| "push to origin" | ✅ Yes | Proceed |
| "show git status" | ✅ Yes | Proceed |
| "create new branch" | ✅ Yes | Proceed |
| "fix bug in code" | ❌ No | Use `/dev-stack:dev` |
| "update README" | ❌ No | Use `/dev-stack:docs` |
| "run tests" | ❌ No | Use `/dev-stack:quality` |

### Step 2: Analyze Task

Identify what git operation is needed:

| Keywords | Operation | Command |
|----------|-----------|---------|
| "status", "what changed" | status | `git status` |
| "difference", "changes" | diff | `git diff` |
| "add", "stage" | add | `git add` |
| "commit", "save" | commit | `git commit` |
| "push", "upload" | push | `git push` |
| "branch", "create branch" | branch | `git branch` / `git checkout -b` |
| "history", "log" | log | `git log` |
| "merge", "combine" | merge | `git merge` |

### Step 3: Execute

Execute the git command directly:

```bash
# Examples
git status
git diff
git add <files>
git commit -m "message"
git push origin <branch>
git branch <name>
git log --oneline -10
```

### Step 4: Report

Report what was done:
- Git operation performed
- Branch affected
- Files staged/committed (if applicable)
- Remote status (if pushed)

## Common Workflows

### Commit Changes

```
/dev-stack:git "commit the changes with message 'fix login bug'"

Expected:
1. git status → see what's changed
2. git add <files> → stage changes
3. git commit -m "fix login bug"
4. Report commit hash
```

### Push to Remote

```
/dev-stack:git "push to origin main"

Expected:
1. git status → check clean state
2. git push origin main
3. Report push status
```

### Create Branch

```
/dev-stack:git "create a new branch called feature/auth"

Expected:
1. git checkout -b feature/auth
2. Report new branch created
```

## Important Rules

1. **Stay in Scope**: Never modify source files or write documentation
2. **No File Editing**: Only git operations allowed
3. **No Agents**: Execute directly, do not spawn sub-agents
4. **Report Boundary Violations**: If task requires other scope, report to user
5. **Safe Operations**: Prefer read operations before destructive ones

## Safety Guidelines

| Operation | Risk Level | Recommendation |
|-----------|------------|----------------|
| git status | Low | Always safe |
| git diff | Low | Always safe |
| git log | Low | Always safe |
| git branch | Medium | Check current branch first |
| git add | Medium | Review changes before staging |
| git commit | High | Ensure correct files staged |
| git push | High | Verify branch and remote |
| git merge | High | Check for conflicts first |
| git reset | Very High | Warn user before executing |
