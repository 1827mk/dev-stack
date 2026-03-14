---
name: dev-stack:redo
description: Redo previously undone actions. Re-applies changes in original order.
---

# /dev-stack:redo

Redo actions that were previously undone. Re-applies changes in original order.

## Usage

```bash
# Redo last undone action
/dev-stack:redo

# Redo last N undone actions
/dev-stack:redo 3

# Preview redo without executing
/dev-stack:redo --preview

# Force redo without confirmation
/dev-stack:redo 2 --force
```

## How It Works

1. **Reads undo stack** from memory
2. **Shows preview** of what will be re-done
3. **Asks for confirmation**
4. **Re-applies changes** in original order

## Undo Stack

When you run `/dev-stack:undo`, the undone actions are stored in an undo stack:

```text
Undo Stack (3 items):
1. Write: src/auth/middleware.ts (content stored)
2. Edit: src/routes/index.ts (diff stored)
3. Write: tests/auth.test.ts (content stored)
```

## Output

```text
# Redo Preview: 3 Actions

## Actions to Redo (in order)
1. Write: src/auth/middleware.ts (recreate file)
2. Edit: src/routes/index.ts (apply diff)
3. Write: tests/auth.test.ts (recreate file)

## Files Affected
- src/auth/middleware.ts [CREATE]
- src/routes/index.ts [MODIFY]
- tests/auth.test.ts [CREATE]

## Warnings
- Files will be overwritten if they exist

Continue? (y/n)
```

## Redo Stack Management

- **Stack cleared** on new action after undo
- **Max stack size**: 50 items
- **Stack persists** until session ends or new action

## Limitations

- **Cannot redo Bash commands** - already executed
- **Cannot redo if files changed** after undo
- **Cannot redo across sessions**

## Exit Codes

- `0`: Success - actions redone
- `1`: Cancelled by user
- `2**: No redo stack available
- `3`: File conflict detected
- `4`: Protected path conflict

## Related Commands

- `/dev-stack:undo` - Undo actions
- `/dev-stack:history` - View action history
- `/dev-stack:rollback` - Full rollback to checkpoint
