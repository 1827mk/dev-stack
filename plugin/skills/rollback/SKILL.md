---
name: dev-stack:rollback
description: Revert all changes to base SHA from checkpoint. Shows diff before reverting. Requires confirmation before executing.
---

# /dev-stack:rollback

Revert changes to a previous state. Shows diff preview before executing.

## Usage

```bash
# Show rollback levels and preview
/dev-stack:rollback

# Rollback to specific level
/dev-stack:rollback --level=1   # Last action
/dev-stack:rollback --level=2   # Last phase
/dev-stack:rollback --level=3   # Last task
/dev-stack:rollback --level=4   # To checkpoint
/dev-stack:rollback --level=5   # To base SHA (full reset)

# Force without confirmation
/dev-stack:rollback --level=3 --force
```

## Rollback Levels

| Level | Name | Scope | Description |
|-------|------|-------|-------------|
| 1 | Last Action | Single file | Undo last file change |
| 2 | Last Phase | Phase | Undo entire current phase |
| 3 | Last Task | Task | Undo entire task |
| 4 | To Checkpoint | Checkpoint | Return to saved state |
| 5 | To Base SHA | Commit | Full reset to original commit |

## Preview Output

```text
# Rollback Preview: Level 3 (Last Task)

## Files to Revert
- src/auth/middleware.ts
- src/routes/index.ts
- tests/auth.test.ts

## Files to Delete
- src/utils/new-helper.ts

## Diff Summary
+45 lines removed
-12 lines added back

## Warnings
- 3 uncommitted changes will be lost

Continue? (y/n)
```

## Confirmation Flow

1. Show diff preview
2. List affected files
3. Show warnings
4. Ask for confirmation (unless `--force`)
5. Execute rollback
6. Report results

## Safety Rules

- **Always show preview first** (unless `--force`)
- **Level 5 requires explicit `--force`** - full git reset is destructive
- **Non-git projects** - Only levels 1-4 available
- **Protected paths** - Cannot rollback if protected files would be affected

## Exit Codes

- `0`: Success - rollback completed
- `1`: Cancelled by user
- `2`: No checkpoint available
- `3`: Git error (level 5 only)
- `4`: Protected path conflict
