# Persistence Agent - Dev-Stack v6

## Purpose

Coordinates all persistence operations (Layer 6): checkpoints, patterns, and audit logs. Ensures session continuity and pattern learning.

## When to Use

This agent is invoked automatically by hooks:
- **SessionStart**: Load checkpoint and restore context
- **PreCompact**: Save checkpoint before context compression
- **SessionEnd**: Final checkpoint save

## Persistence Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Persistence Layer                         │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Checkpoints   │    Patterns     │      Audit Logs         │
│                 │                 │                         │
│ .dev-stack/     │ .dev-stack/     │ .dev-stack/             │
│ memory/         │ memory/         │ logs/                   │
│ checkpoint.md   │ patterns.db     │ audit.jsonl             │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## Checkpoint System

### Checkpoint Format

Location: `.dev-stack/memory/checkpoint.md`

```markdown
---
session_id: sess-abc123
created_at: 2026-03-14T12:00:00Z
phase: BUILD
progress: 3/6
base_commit: abc123def
files_touched:
  - src/auth.ts
  - src/middleware.ts
---

# Checkpoint: BUILD Phase

## Current Task
Implement authentication middleware

## Completed Steps
1. ✅ Analyzed existing auth flow
2. ✅ Created middleware skeleton
3. ✅ Added JWT validation

## Next Steps
4. ⬜ Add rate limiting
5. ⬜ Write tests
6. ⬜ Update documentation

## Key Decisions
- Using JWT for stateless auth
- 15-minute token expiry
- Refresh token rotation enabled
```

### Checkpoint Operations

| Operation | Trigger | Action |
|-----------|---------|--------|
| Auto-save | PreCompact | Save current state |
| Manual | /checkpoint | Save with user note |
| Load | SessionStart | Restore from checkpoint |
| Clear | /rollback --full | Reset to clean state |

### Checkpoint Lifecycle

```
Session Start
     │
     ▼
┌─────────────────┐
│ Load Checkpoint │ ─── Resume or start fresh
└────────┬────────┘
         │
         ▼
    Task Execution
         │
         ├─── Auto-save (every 5 minutes)
         │
         ├─── Pre-compact save
         │
         ▼
┌─────────────────┐
│ Save Checkpoint │ ─── Before context compression
└────────┬────────┘
         │
         ▼
   Session End
```

## Pattern Storage

### Pattern Database

Location: `.dev-stack/memory/patterns.db`

SQLite database with HNSW index for similarity search.

**Schema**:
```sql
CREATE TABLE patterns (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  code_example TEXT,
  tags TEXT,
  embedding BLOB,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  confidence REAL DEFAULT 0.5,
  last_used TEXT,
  source_project TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Pattern Lifecycle

```
Task Complete
     │
     ▼
┌─────────────────┐
│ Extract Pattern │ ─── LearnEngine.learnFromTask()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate Vector │ ─── Create embedding
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Store Pattern   │ ─── PatternStore.savePattern()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update HNSW     │ ─── Add to vector index
└─────────────────┘
```

### Pattern Search

```typescript
// Find similar patterns
const results = await store.vectorSearch('authentication middleware', 5);

// Filter by confidence
const highConfidence = results.filter(r => r.pattern.confidence >= 0.8);
```

## Audit Logging

### Audit Log Format

Location: `.dev-stack/logs/audit.jsonl`

```json
{"timestamp":"2026-03-14T12:00:00Z","session_id":"sess-abc123","tool":"Write","action":"write_file","target":"src/auth.ts","result":"success"}
{"timestamp":"2026-03-14T12:01:00Z","session_id":"sess-abc123","tool":"Bash","action":"run_command","target":"npm test","result":"success"}
{"timestamp":"2026-03-14T12:02:00Z","session_id":"sess-abc123","tool":"Write","action":"write_file","target":"src/secrets.ts","result":"blocked","reason":"Secret detected","guard":"secret-scanner"}
```

### Audit Events

| Event | Description |
|-------|-------------|
| tool_invocation | Any tool called |
| guard_blocked | Guard prevented operation |
| checkpoint_saved | Checkpoint created |
| pattern_learned | New pattern stored |
| rollback_executed | Changes reverted |

## Rollback System

### Rollback Levels

| Level | Scope | Command |
|-------|-------|---------|
| 1 | Last action | `/undo` |
| 2 | Last phase | `/rollback --level=2` |
| 3 | Last task | `/rollback --level=3` |
| 4 | To checkpoint | `/rollback --level=4` |
| 5 | To base SHA | `/rollback --level=5` |

### Rollback Process

```
User Request: /rollback --level=3
     │
     ▼
┌─────────────────┐
│ Load Checkpoint │ ─── Get checkpoint for level 3
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Show Diff     │ ─── Preview changes
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Confirm    │ ─── Ask for approval
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Execute Rollback│ ─── git reset --hard
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Log Audit       │ ─── Record rollback
└─────────────────┘
```

## Time Travel Commands

| Command | Description |
|---------|-------------|
| `/history` | Show recent actions |
| `/undo [n]` | Undo last n actions |
| `/redo [n]` | Redo undone actions |
| `/checkpoint --note="msg"` | Create manual checkpoint |

## Performance Targets

| Operation | Target | Actual |
|-----------|--------|--------|
| Checkpoint save | <500ms | ~200ms |
| Checkpoint load | <100ms | ~50ms |
| Pattern search | <50ms | ~30ms |
| Audit log write | <10ms | ~5ms |

## Error Handling

### Checkpoint Corruption

If checkpoint file is corrupted:
1. Log warning
2. Offer git-based recovery
3. Start fresh session

### Pattern Database Error

If pattern database fails:
1. Try backup
2. Recreate database
3. Warn about lost patterns

### Non-Git Projects

For projects without git:
1. Disable git-based rollback levels
2. Offer checkpoint-only rollback
3. Clearly indicate limitations

## Integration Points

- **Intent Router**: Provides context for task analysis
- **Orchestrator**: Receives phase progress updates
- **Guard Engine**: Receives audit events
- **Pattern Learner**: Stores learned patterns

## Notes

- All persistence is local (no cloud sync)
- Patterns are project-specific by default
- Cross-project pattern transfer via `/transfer` command
- Audit logs are append-only for compliance
