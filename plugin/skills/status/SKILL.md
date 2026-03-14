---
name: dev-stack:status
description: Show dev-stack state - DNA, checkpoint, logs, plugin health. Run anytime to see current project status.
---

# /dev-stack:status

Show current dev-stack plugin state including:

- **DNA Status**: Project DNA availability and freshness
- **Checkpoint**: Current checkpoint and session state
- **Logs**: Recent audit log entries
- **Guards**: Guard status and statistics

## Usage

```
/dev-stack:status
```

## Output Sections

### 1. DNA Status

```text
DNA Status: ✅ fresh
Project: my-project
Language: TypeScript
Framework: Next.js
Last Scan: 2 hours ago
```

### 2. Checkpoint State

```text
Checkpoint: ⚠️ active
Session: session-abc123
Phase: BUILD (3/6)
Task: "Add authentication middleware"
Base SHA: 3b31c8ad
Files Touched: 5 created, 3 modified
```

### 3. Audit Log

```text
Recent Actions (last 10):
- [14:30:45] Write: src/auth/middleware.ts ✓
- [14:30:46] Edit: src/routes/index.ts ✓
- [14:30:47] Bash: npm test ✓
```

### 4. Guard Statistics

```text
Guards This Session:
- Scope Guard: 0 blocked
- Secret Scanner: 0 blocked
- Bash Guard: 0 blocked
- Risk Assessor: 3 high-risk flagged
```

## Implementation

Read from:
- `.dev-stack/dna/project.md` - Project DNA
- `.dev-stack/memory/checkpoint.md` - Session checkpoint
- `.dev-stack/logs/audit.jsonl` - Audit trail
- `.dev-stack/config/scope.json` - Scope configuration

## Exit Codes

- `0`: Success - status displayed
- `1`: No DNA found - run `/dev-stack:learn`
- `2`: Checkpoint corrupted - recovery needed
