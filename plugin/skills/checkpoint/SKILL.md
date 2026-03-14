---
name: dev-stack:checkpoint
description: Create manual checkpoint with optional note. Saves current session state for recovery.
---

# /dev-stack:checkpoint

Create a manual checkpoint of the current session state.

## Usage

```bash
# Create checkpoint with timestamp
/dev-stack:checkpoint

# Create checkpoint with note
/dev-stack:checkpoint --note="Before refactoring auth"

# Create checkpoint with custom label
/dev-stack:checkpoint --label="pre-deploy"
```

## Checkpoint Contents

When you create a checkpoint, it saves:

1. **Session State**
   - Current phase and progress
   - Turn count and tokens used
   - Execution mode

2. **File Changes**
   - Files created
   - Files modified (with original SHAs)
   - Files deleted

3. **Decisions**
   - All recorded decisions
   - User approvals

4. **Next Steps**
   - Pending actions
   - Priorities

## Output

```text
# Checkpoint Created

Checkpoint ID: cp_abc123def456
Created: 2026-03-14T15:30:00Z
Session: session-xyz789

## Current State
Phase: BUILD (3/6)
Task: "Add authentication middleware"
Note: "Before refactoring auth"

## Files Tracked
Created: 5 files
Modified: 3 files
Deleted: 0 files

## Recovery
To restore: /dev-stack:rollback --level=4
```

## Automatic Checkpoints

Checkpoints are also created automatically:

- **PreCompact**: Before context compression
- **Phase Transitions**: When moving between phases
- **High-Risk Actions**: Before dangerous operations

## Storage

Checkpoints are stored in:
```
.dev-stack/memory/checkpoint.md
.dev-stack/memory/sentinels/session-*.sentinel
```

## Exit Codes

- `0`: Success - checkpoint created
- `1`: No active task to checkpoint
- `2`: Storage error
