---
name: dev-stack:undo
description: Undo last N actions. Reverts file changes in reverse order.
---

# /dev-stack:undo

Undo the last N actions. Reverts file changes in reverse chronological order.

## Usage

```bash
# Undo last action
/dev-stack:undo

# Undo last N actions
/dev-stack:undo 3

# Preview undo without executing
/dev-stack:undo --preview

# Force undo without confirmation
/dev-stack:undo 2 --force
```

## How It Works

1. **Reads audit log** to find recent actions
2. **Filters to reversible actions** (Write, Edit)
3. **Shows preview** of what will be undone
4. **Asks for confirmation**
5. **Reverts changes** in reverse order

## Output

```text
# Undo Preview: 3 Actions

## Actions to Undo (in order)
1. Write: src/auth/middleware.ts (delete file)
2. Edit: src/routes/index.ts (revert changes)
3. Write: tests/auth.test.ts (delete file)

## Files Affected
- src/auth/middleware.ts [DELETE]
- src/routes/index.ts [REVERT]
- tests/auth.test.ts [DELETE]

## Warnings
- 3 files will be affected
- Cannot undo Bash commands

Continue? (y/n)
```

## Reversible Actions

| Action | Undo Method |
|--------|-------------|
| Write | Delete file |
| Edit | Git checkout original |
| MultiEdit | Git checkout original |

## Non-Reversible Actions

| Action | Reason |
|--------|--------|
| Bash | Commands already executed |
| Read | No state change |
| Grep | No state change |
| LSP | No state change |

## Safety Rules

- **Always show preview first** (unless `--force`)
- **Cannot undo if git is unavailable** for Edit operations
- **Cannot undo protected paths**
- **Max undo depth**: 20 actions

## Exit Codes

- `0`: Success - actions undone
- `1`: Cancelled by user
- `2`: No reversible actions found
- `3`: Git error during revert
- `4`: Protected path conflict
