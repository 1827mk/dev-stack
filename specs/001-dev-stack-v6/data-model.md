# Data Model: Dev-Stack v6

**Purpose**: Define all entities, their relationships, and validation rules for the Meta-Orchestrator system.

---

## Entity Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DEV-STACK v6 ENTITIES                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────┐         ┌───────────────┐                      │
│  │  Project DNA  │─────────│    Pattern    │                      │
│  │  (singleton)  │  1    * │  (indexed)    │                      │
│  └───────────────┘         └───────────────┘                      │
│         │                          │                                │
│         │ 1                        │ *                              │
│         ▼                          ▼                                │
│  ┌───────────────┐         ┌───────────────┐                      │
│  │  Checkpoint   │─────────│ Capability    │                      │
│  │  (session)    │  1    * │  (registry)   │                      │
│  └───────────────┘         └───────────────┘                      │
│         │                                                   │
│         │ 1                                                 │
│         ▼                                                   │
│  ┌───────────────┐                                          │
│  │  Audit Entry  │                                          │
│  │  (log)        │                                          │
│  └───────────────┘                                          │
│                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Entity Definitions

### 1. Project DNA

**Purpose**: Persistent knowledge about a project that survives across sessions

**Storage**: `.dev-stack/dna/project.md` (Markdown with YAML frontmatter)

**Schema**:

```yaml
---
id: string              # UUID
name: string            # Project name
type: string            # web-app | api | library | cli | mobile
primary_language: string # TypeScript | Python | Go | Rust | etc.
created_at: datetime
updated_at: datetime
version: string         # DNA version (e.g., "1.0.0")
---

# Identity
tech_stack:
  framework: string     # Next.js | Express | FastAPI | etc.
  database: string      # PostgreSQL | MongoDB | SQLite | etc.
  testing: string       # Vitest | Jest | pytest | etc.

# Architecture
entry_points:
  - path: string
    type: string        # route | handler | main | index
key_directories:
  - path: string
    purpose: string

# Patterns
coding_style:
  naming: string       # camelCase | snake_case | kebab-case
  formatter: string    # prettier | black | rustfmt
component_pattern: string # functional | class-based | hooks

# Risk Areas
protected_paths:
  - path: string
    reason: string
high_coupling:
  - files: string[]
    risk: string

# Learnings
what_works:
  - pattern: string
    context: string
what_not_to_do:
  - anti_pattern: string
    reason: string
user_preferences:
  - preference: string
    value: string
```

**Validation Rules**:
- `name` MUST be non-empty string
- `type` MUST be one of: web-app, api, library, cli, mobile
- `primary_language` MUST be non-empty string
- `version` MUST follow semver format

---

### 2. Pattern

**Purpose**: Reusable solution or approach with vector embedding for similarity search

**Storage**: `.dev-stack/memory/patterns.db` (SQLite + HNSW index)

**Schema**:

```sql
CREATE TABLE patterns (
  id TEXT PRIMARY KEY,           -- UUID
  type TEXT NOT NULL,            -- 'code_pattern' | 'solution' | 'anti_pattern' | 'workflow' | 'decision'
  name TEXT NOT NULL,            -- Human-readable name (e.g., "auth_middleware_jwt")
  description TEXT,              -- What this pattern does
  code_example TEXT,             -- Actual code if applicable
  tags TEXT,                     -- JSON array of tags (e.g., ["auth", "middleware", "security"])
  embedding BLOB,                -- Vector embedding for HNSW search
  success_count INTEGER DEFAULT 0, -- How many times this pattern led to success
  failure_count INTEGER DEFAULT 0, -- How many times this pattern led to failure
  confidence REAL DEFAULT 0.5,   -- Calculated: success / (success + failure)
  last_used TEXT,                -- ISO datetime
  source_project TEXT,           -- Which project this came from
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_patterns_type ON patterns(type);
CREATE INDEX idx_patterns_confidence ON patterns(confidence DESC);
```

**HNSW Index** (for similarity search):
- Dimension: 1536 (OpenAI ada-002) or 768 (local embedding)
- Metric: cosine similarity
- M: 16 (connections per layer)
- ef_construction: 200 (build-time candidates)

**Validation Rules**:
- `name` MUST be unique within a project
- `type` MUST be one of: code_pattern, solution, anti_pattern, workflow, decision
- `confidence` MUST be between 0.0 and 1.0
- `success_count + failure_count` MUST be > 0 for confidence calculation

---

### 3. Checkpoint

**Purpose**: Session state snapshot for continuity and rollback

**Storage**: `.dev-stack/memory/checkpoint.md` (Markdown with YAML frontmatter)

**Schema**:

```yaml
---
session_id: string        # UUID for this session
created_at: datetime
base_sha: string          # Git commit SHA at checkpoint creation
task_hash: string         # Hash of user request for identification
---

# Session State
started_at: datetime
turns: integer            # Number of conversation turns

# Current Task
user_request: string      # Original user request in natural language
derived_intent: string    # System-derived intent (e.g., "optimize_api_and_assets")
complexity_score: float   # 0.0 - 1.0
execution_mode: string    # AUTO | PLAN_FIRST | CONFIRM | INTERACTIVE
phase: string             # THINK | RESEARCH | BUILD | TEST | LEARN | VERIFY
phase_progress: string    # e.g., "3/6" for phase 3 of 6

# Progress
completed_steps:
  - step: string
    status: string        # success | partial | failed
pending_steps:
  - step: string
    estimated_tokens: integer

# Files Touched
files_created:
  - path: string
files_modified:
  - path: string
    original_sha: string
files_deleted:
  - path: string

# Key Decisions
decisions:
  - decision: string
    reasoning: string
    user_approved: boolean

# Next Steps
next_actions:
  - action: string
    priority: string       # high | medium | low
```

**Validation Rules**:
- `session_id` MUST be valid UUID
- `complexity_score` MUST be between 0.0 and 1.0
- `execution_mode` MUST be one of: AUTO, PLAN_FIRST, CONFIRM, INTERACTIVE
- `phase` MUST be one of: THINK, RESEARCH, BUILD, TEST, LEARN, VERIFY
- `base_sha` MUST be valid git commit SHA (if git available)

---

### 4. Capability

**Purpose**: Mapping of functional capability to tools (primary and fallback)

**Storage**: `config/capabilities.yaml`

**Schema**:

```yaml
version: string              # Schema version (e.g., "1.0")

capabilities:
  code.scan:
    primary: string          # Primary tool (e.g., "serena:onboarding")
    fallback: string | null  # Fallback tool if primary unavailable
    description: string      # Human-readable description
    timeout_s: integer       # Timeout in seconds
    requires_guard: boolean  # Whether security guard is required

  code.find_symbol:
    primary: string
    fallback: string | null
    description: string
    timeout_s: integer
    requires_guard: boolean

  # ... more capabilities
```

**Example**:

```yaml
version: "1.0"

capabilities:
  code.scan:
    primary: "serena:onboarding"
    fallback: "mcp__filesystem__directory_tree"
    description: "Full codebase scan for understanding structure"
    timeout_s: 120
    requires_guard: false

  code.find_symbol:
    primary: "serena:find_symbol"
    fallback: "Grep"
    description: "Find specific symbol (class, function, variable)"
    timeout_s: 30
    requires_guard: false

  code.edit:
    primary: "serena:replace_symbol_body"
    fallback: "Edit"
    description: "Edit code at symbol level"
    timeout_s: 60
    requires_guard: true

  memory.search:
    primary: "memory:search_nodes"
    fallback: "Grep"
    description: "Search learned patterns in memory graph"
    timeout_s: 30
    requires_guard: false

  exec.code:
    primary: "Bash"
    fallback: null
    description: "Execute shell commands"
    timeout_s: 300
    requires_guard: true
```

**Validation Rules**:
- `primary` MUST be non-empty string
- `timeout_s` MUST be positive integer
- `requires_guard` MUST be boolean
- Capability names MUST be unique

---

### 5. Audit Entry

**Purpose**: Record of every action for traceability and compliance

**Storage**: `.dev-stack/logs/audit.jsonl` (JSON Lines format)

**Schema**:

```typescript
interface AuditEntry {
  timestamp: string;        // ISO 8601 datetime
  session_id: string;       // Session UUID
  tool: string;             // Tool name (e.g., "Write", "serena:find_symbol")
  action: string;           // Action type (e.g., "write_file", "find_symbol")
  target: string;           // Target path or identifier
  result: 'success' | 'blocked' | 'error';
  reason?: string;          // If blocked: reason for block
  guard?: string;           // If blocked: which guard blocked it
  user_approved?: boolean;  // If confirmation was required
  rollback_available: boolean;
  duration_ms?: number;     // Execution duration
  tokens_used?: number;     // Token count if applicable
}
```

**Example**:

```json
{"timestamp":"2026-03-14T12:30:45.123Z","session_id":"sess_abc123","tool":"Write","action":"write_file","target":"src/auth/login.ts","result":"success","rollback_available":true,"duration_ms":150,"tokens_used":500}
{"timestamp":"2026-03-14T12:30:46.456Z","session_id":"sess_abc123","tool":"Write","action":"write_file","target":".env","result":"blocked","reason":"Protected path: .env is in scope-guard list","guard":"scope-guard","rollback_available":false}
{"timestamp":"2026-03-14T12:30:47.789Z","session_id":"sess_abc123","tool":"Bash","action":"execute_command","target":"rm -rf /","result":"blocked","reason":"Dangerous command: recursive delete all","guard":"bash-guard","rollback_available":false}
```

**Validation Rules**:
- `timestamp` MUST be valid ISO 8601 datetime
- `result` MUST be one of: success, blocked, error
- If `result` is "blocked", `reason` and `guard` MUST be present
- Each line MUST be valid JSON

---

## Entity Relationships

```
Project DNA (1) ──────< has >────── (*) Pattern
     │
     │
     └───────< creates >──────── (*) Checkpoint
                                         │
                                         │
                                         └──────< generates >─── (*) Audit Entry

Capability Registry (1) ───< maps to >─── (*) Tools (external)
```

---

## State Transitions

### Task Phase Transitions

```
THINK ──> RESEARCH ──> BUILD ──> TEST ──> LEARN ──> VERIFY
  │         │          │         │         │         │
  │         │          │         │         │         └──> COMPLETE or ROLLBACK
  │         │          │         │         │
  │         │          │         │         └──> Store pattern
  │         │          │         │
  │         │          │         └──> Pass/Fail → continue or fix
  │         │          │
  │         │          └──> Can rollback to here
  │         │
  │         └──> Can skip if no unknowns
  │
  └──> Always required
```

### Execution Mode Transitions

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
AUTO ─────> PLAN_FIRST ─────> CONFIRM ─────> INTERACTIVE │
                    │              │              │        │
                    │              │              │        │
                    └──────────────┴──────────────┴────────┘
                                      │
                                      ▼
                                   ESCALATE
```

---

## File Locations

```
.dev-stack/
├── dna/
│   └── project.md           # Project DNA (singleton)
├── memory/
│   ├── checkpoint.md        # Session checkpoint
│   ├── patterns.db          # SQLite + HNSW patterns
│   └── sentinels/           # Session sentinels
├── logs/
│   └── audit.jsonl          # Audit trail (append-only)
└── config/
    └── capabilities.yaml    # Capability registry
```

---

*Data Model Version: 1.0 | Created: 2026-03-14*
