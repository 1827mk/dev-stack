---
name: dev-stack:history
description: Show recent actions with undo/redo hints. View audit trail and action history.
---

# /dev-stack:history

Show recent actions and audit trail with undo/redo hints.

## Usage

```bash
# Show last 20 actions
/dev-stack:history

# Show last N actions
/dev-stack:history --count=50

# Show actions from specific file
/dev-stack:history --file=src/auth/login.ts

# Show actions by type
/dev-stack:history --type=write
/dev-stack:history --type=edit
/dev-stack:history --type=bash

# Show blocked actions
/dev-stack:history --blocked
```

## Output Format

```text
# Action History (Last 20)

## Recent Actions
  #  Time     Action    Target                    Result
  1  14:30:45 Write     src/auth/middleware.ts    ✓
  2  14:30:46 Edit      src/routes/index.ts       ✓
  3  14:30:47 Bash      npm test                  ✓
  4  14:30:48 Write     tests/auth.test.ts        ✓
  5  14:30:49 Bash      npm run lint              ⚠ blocked

## Undo Hints
- Undo last action: /dev-stack:undo 1
- Undo last 3 actions: /dev-stack:undo 3

## Session Stats
Total Actions: 45
Blocked: 2 (4.4%)
Files Touched: 12
Tokens Used: 125,000
```

## Action Types

| Type | Icon | Description |
|------|------|-------------|
| Write | 📝 | New file created |
| Edit | ✏️ | File modified |
| Bash | ⚡ | Command executed |
| Grep | 🔍 | Search performed |
| Read | 📖 | File read |

## Result Icons

| Icon | Meaning |
|------|---------|
| ✓ | Success |
| ⚠ | Blocked by guard |
| ✗ | Error |

## History Storage

Actions are logged to:
```
.dev-stack/logs/audit.jsonl
```

Format:
```json
{"timestamp":"2026-03-14T14:30:45.123Z","session_id":"sess_abc","tool":"Write","action":"write_file","target":"src/auth.ts","result":"success"}
```

## Exit Codes

- `0`: Success - history displayed
- `1`: No history found
- `2`: Log file corrupted
