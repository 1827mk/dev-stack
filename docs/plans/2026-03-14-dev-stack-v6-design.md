# Dev-Stack v6 Design Document

**Created:** 2026-03-14
**Status:** Approved
**Type:** Plugin Redesign

---

## Executive Summary

**Dev-Stack v6** เป็น Meta-Orchestrator Plugin สำหรับ Claude Code ที่ทำหน้าที่เป็น "สมองสั่งการ" บริหารจัดการ context engineering, MCP servers, plugins และ skills

**Core Value Proposition:**
> **User สั่งงานด้วยภาษาคน → AI เลือก tools → Execute อัตโนมัติ**
> ลดการพึ่งพาผู้ใช้เหลือ 5% | Claude Code ทำ 95%

---

## Requirements Summary

| # | Requirement | Decision |
|---|-------------|----------|
| 1 | Role | **Meta-Orchestrator** (route + context + coordinate) |
| 2 | Automation Level | **Hybrid Context-Dependent** (auto ง่าย + confirm ยาก) |
| 3 | Integration | **Layered Architecture** (Dev-Stack → MCP → Native) |
| 4 | Features | **Full-featured** (Memory + Security + Learning + Recovery) |
| 5 | Implementation | **Evolve** จาก dev-stack v5.2.0 |
| 6 | MVP Priority | **Foundation First** |
| 7 | User Interface | **Natural Language + Auto-select tools** |
| 8 | Execution Mode | **Hybrid Autonomy** (auto ง่าย + confirm ยาก) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DEV-STACK v6 ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  USER INPUT (Natural Language: Thai/English/Mixed)                │
│       ↓                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: INTENT ROUTER                                      │   │
│  │  • Language Detection (Thai/Eng/Mixed)                       │   │
│  │  • Context-Aware Intent Derivation                           │   │
│  │  • Complexity Scoring (0.0-1.0)                              │   │
│  │  • Dynamic Workflow Generation                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       ↓                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: CONTEXT ENGINE                                     │   │
│  │  • Project DNA (Enhanced)                                    │   │
│  │  • Pattern Memory (HNSW-Indexed)                             │   │
│  │  • Just-In-Time Retrieval                                    │   │
│  │  • Token Budget Manager                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       ↓                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: TOOL SELECTOR                                      │   │
│  │  • Capability Registry (Single Source of Truth)              │   │
│  │  • Primary + Fallback Selection                              │   │
│  │  • Auto-discovery (MCP/Plugins)                              │   │
│  │  • Smart Routing                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       ↓                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: ORCHESTRATION ENGINE                               │   │
│  │  • 6-Phase Pipeline (THINK→RESEARCH→BUILD→TEST→LEARN→VERIFY) │   │
│  │  • 4 Execution Modes (Auto/Plan/Confirm/Interactive)         │   │
│  │  • Parallel Swarm Execution                                  │   │
│  │  • Failure Recovery                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       ↓                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LAYER 5: SECURITY & GUARDRAILS                              │   │
│  │  • Scope Guard (Protected Paths)                             │   │
│  │  • Secret Scanner (Pattern Detection)                        │   │
│  │  • Bash Guard (Dangerous Commands)                           │   │
│  │  • Audit Logger (Full Trail)                                 │   │
│  │  • Risk Assessment (Pre-Execution)                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       ↓                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LAYER 6: PERSISTENCE & RECOVERY                             │   │
│  │  • Session Checkpoint (Auto-save)                            │   │
│  │  • Cross-Session Memory (HNSW)                               │   │
│  │  • Rollback System (5 Levels)                                │   │
│  │  • Learning Engine (Success/Failure Patterns)                │   │
│  │  • Time Travel (Undo/Redo/Replay)                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Intelligent Intent Router

### Purpose
วิเคราะห์ user request และสร้าง execution plan แบบ context-aware

### Components

#### 1.1 Language Detection
- Thai → Thai system prompts
- English → English system prompts
- Mixed → Primary language + bilingual context

#### 1.2 Context Analysis (Before Intent)
Analyze before classifying:
- Target files/components (what will be affected?)
- Current state (is it broken? working? new?)
- Root cause hints (error messages, logs, patterns)
- Related patterns (what worked before in similar cases?)

Tools: serena, grep, glob, read (quick scan)

#### 1.3 Context-Aware Intent Derivation

Instead of fixed categories, derive intent from:

```
VERB + TARGET + CONTEXT = ACTION_PLAN
```

**Examples:**

| User Request | Derived Intent | Workflow |
|--------------|----------------|----------|
| "ทำให้หน้าแรกโหลดเร็วขึ้น" | optimize_api_and_assets | profile → reduce_calls → lazy_load → verify |
| "แก้ไขให้ระบบ login ทำงาน" | fix_jwt_token_validation | reproduce → diagnose → fix → verify |
| "เพิ่มปุ่ม logout" | add_logout_to_existing_auth | add_to_header → wire_to_auth → test |

#### 1.4 Complexity + Risk Assessment

**Complexity Factors:**
- Files affected (1-5 = 0.1, 6-20 = 0.3, 20+ = 0.5)
- Risk level (style = 0.1, logic = 0.4, security = 0.8)
- Dependencies (none = 0.0, many = 0.3, breaking = 0.6)
- Cross-cutting (no = 0.0, yes = 0.4)

**Score Calculation:**
```
complexity = (files × 0.2) + (risk × 0.4) + (deps × 0.25) + (crosscut × 0.15)
```

**Decision Matrix:**

| Score | Level | Mode |
|-------|-------|------|
| 0.0 - 0.3 | SIMPLE | AUTO-EXECUTE |
| 0.3 - 0.6 | MEDIUM | SHOW PLAN + PROCEED |
| 0.6 - 1.0 | COMPLEX | CONFIRM BEFORE EXECUTE |

#### 1.5 Dynamic Workflow Generation

Base Workflow Templates (adapt per context):

| Intent Pattern | Workflow |
|----------------|----------|
| ADD_* | understand → find_pattern → implement → test |
| FIX_* | reproduce → diagnose → fix → verify |
| IMPROVE_* | baseline → analyze → optimize → benchmark |
| CHANGE_* | understand → plan → transform → validate |
| EXPLORE_* | scan → analyze → summarize → suggest |

AI adapts steps based on:
- What exists in codebase
- What patterns are available
- What MCP/tools can help

---

## Layer 2: Context Engine

### Purpose
จัดการ context ให้ AI มีข้อมูลที่เหมาะสม ณ เวลาที่เหมาะสม

**Philosophy:** "Right information, Right time, Right amount"

### Components

#### 2.1 Project DNA (Enhanced)

**Location:** `.dev-stack/dna/project.md`

**Structure:**
```markdown
# Project DNA

## Identity
- Name, Type, Primary Language
- Tech Stack (framework, db, tools)

## Architecture
- Entry Points (main files, routes)
- Key Directories (src/, lib/, components/)
- Data Flow (how data moves)

## Patterns
- Coding Style (naming, formatting)
- Component Patterns (how components are structured)
- API Patterns (REST, GraphQL, etc.)

## Risk Areas
- Legacy Code (fragile, no tests)
- High Coupling (change one = break many)
- Security Sensitive (auth, payments)

## Learnings
- What Works (successful patterns)
- What NOT To Do (anti-patterns discovered)
- User Preferences (how user likes things done)
```

**Update Triggers:**
- `/dev-stack:learn` (manual)
- Major file changes detected (auto-scan)
- User teaches new pattern (explicit)

#### 2.2 Pattern Memory (HNSW-Indexed)

**Location:** `.dev-stack/memory/patterns.db` (SQLite + HNSW)

**Schema:**
```sql
CREATE TABLE patterns (
  id UUID PRIMARY KEY,
  type TEXT, -- 'code_pattern' | 'solution' | 'anti_pattern'
  name TEXT,
  description TEXT,
  code_example TEXT,
  tags JSON,
  embedding BLOB, -- Vector for HNSW search
  success_count INTEGER,
  failure_count INTEGER,
  last_used TIMESTAMP,
  source_project TEXT
);
```

**Operations:**
- `SEARCH(query, k=5)` → Top 5 similar patterns
- `STORE(pattern, embedding)` → Save new pattern
- `UPDATE(id, success/failure)` → Update stats
- `TRANSFER(from_project, to_project)` → Copy patterns

**Performance:** 150x-12,500x faster than linear search

#### 2.3 Just-In-Time Retrieval

**Philosophy:** "Load context when needed, not everything"

| Strategy | What | When |
|----------|------|------|
| UPFRONT | DNA summary, Checkpoint, Protected paths | Always (~500 tokens) |
| ON-DEMAND | File contents, Pattern examples, Docs | When needed (lazy) |
| PROGRESSIVE | Symbols → Signatures → Implementation | Layer by layer |

**Progressive Disclosure:**
- Layer 1: File names + symbols (quick scan)
- Layer 2: Function signatures + types
- Layer 3: Full implementation (only if needed)

#### 2.4 Token Budget Manager

**Budget Allocation (per task):**

| Category | Tokens | Notes |
|----------|--------|-------|
| DNA + Checkpoint | 1,000 | Fixed |
| Intent Analysis | 2,000 | Dynamic |
| Context Retrieval | 10,000 | Dynamic |
| Execution Buffer | 150,000 | For tools |
| Response Reserve | 30,000 | Output |
| Safety Margin | 7,000 | Overflow |

**Strategies:**
- If context > 80% → Trigger compression
- If context > 90% → Force compact
- Prioritize: DNA > Active Task > History > Tool Results

---

## Layer 3: Tool Selector

### Purpose
เลือก tools อัตโนมัติ ผู้ใช้ไม่ต้องรู้จักชื่อ tools

**Philosophy:** "User ไม่ต้องรู้จัก tools, AI เลือกเอง"

### Components

#### 3.1 Capability Registry (Single Source of Truth)

**Location:** `config/capabilities.yaml`

**Structure:**
```yaml
capabilities:
  code.scan:
    primary: serena:onboarding
    fallback: mcp__filesystem__directory_tree
    description: "Full codebase scan"
    timeout_s: 120

  code.find_symbol:
    primary: serena:find_symbol
    fallback: Grep
    description: "Find specific symbol"

  memory.search:
    primary: memory:search_nodes
    fallback: Grep (in .dev-stack/memory/)
    description: "Search learned patterns"

  exec.code:
    primary: Bash
    fallback: none
    description: "Run shell commands"
    requires_guard: true
```

**Benefits:**
- Never hardcode tool names in agents
- Easy to swap tools (update registry only)
- Fallback handling built-in
- Timeout awareness for each capability

#### 3.2 Tool Selection Logic

**Flow:**
1. **CAPABILITY MAPPING**
   - Task → Required Capabilities → Lookup Registry

2. **AVAILABILITY CHECK**
   - Primary tool available? → Use it
   - Fallback exists? → Use fallback
   - No fallback? → Notify user, suggest alternative

3. **TOOL COMPOSITION**
   - Chain multiple tools for complex operations

**Example:**
```
Task: "Refactor authentication module"

Tool Chain:
1. serena:get_symbols_overview (understand structure)
2. serena:find_referencing_symbols (find usages)
3. memory:search_nodes (find patterns)
4. serena:replace_symbol_body (apply changes)
5. Bash: npm test (verify)
```

#### 3.3 Tool Categories (Auto-discovered)

| Category | Tools |
|----------|-------|
| Code Intelligence | serena, LSP, Grep, Glob |
| Memory/Learning | memory MCP, sequentialthinking |
| File Operations | Read, Write, Edit, Bash |
| Web/Research | WebSearch, fetch, webReader |
| Documentation | context7, doc-forge |
| Coordination | Agent, TaskCreate, SendMessage |
| Plugins | superpowers, frontend-design, etc. |

**Discovery:**
- Scan `.mcp.json` for MCP servers
- Scan `.claude/plugins/` for plugin skills/agents
- Update registry on startup

---

## Layer 4: Orchestration Engine

### Purpose
ประสานงาน execution แบบ THINK → RESEARCH → BUILD → VERIFY

### Components

#### 4.1 Enhanced Workflow Pipeline

```
  ┌─────────┐      ┌──────────┐      ┌─────────┐
  │  THINK  │ ───→ │ RESEARCH │ ───→ │  BUILD  │
  └─────────┘      └──────────┘      └─────────┘
       │                  │                 │
       ↓                  ↓                 ↓
  ┌─────────┐      ┌──────────┐      ┌─────────┐
  │ VERIFY  │ ←─── │  LEARN   │ ←─── │  TEST   │
  └─────────┘      └──────────┘      └─────────┘
```

| Phase | Agent | Output |
|-------|-------|--------|
| THINK | thinker | impact_map.md (files affected, patterns, risks, plan) |
| RESEARCH | researcher | findings.md (only if unknowns exist) |
| BUILD | code-builder | Code changes (follows DNA patterns) |
| TEST | verifier | test_results.md |
| LEARN | dna-scanner | Updated DNA + patterns |
| VERIFY | verifier | verification_report.md |

#### 4.2 Execution Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| AUTO | Complexity < 0.3 + Low risk | Execute all phases, report at end |
| PLAN_FIRST | Complexity 0.3-0.6 + Medium risk | Show plan, user approves, then execute |
| CONFIRM | Complexity > 0.6 + High risk | Confirm each step, show before/after |
| INTERACTIVE | Unknown context + New territory | Work together, ask questions |

#### 4.3 Parallel Execution (Swarm)

**When to use parallel:**
- Multiple independent files to modify
- Research + Code analysis simultaneously
- Testing different approaches

**Swarm Topologies:**

| Topology | Use Case |
|----------|----------|
| hierarchical | Default, coordinator → workers |
| mesh | Peer-to-peer, workers collaborate |
| adaptive | Switches based on load |

**Example Parallel Flow:**
```
Task: "Add logging to all API endpoints"

THINK (sequential):
  └── Identify 15 API files to modify

BUILD (parallel):
  ├── Agent 1: routes/users.ts
  ├── Agent 2: routes/products.ts
  ├── Agent 3: routes/orders.ts
  └── Agent 4: routes/auth.ts

VERIFY (sequential):
  └── Run all tests, verify logging works
```

#### 4.4 Failure Recovery

| Failure Type | Recovery Action |
|--------------|-----------------|
| Tool timeout | Retry with fallback tool |
| Test failure | Analyze → Fix → Re-run |
| Build error | Rollback → Diagnose → Retry |
| Agent stuck | Kill → Spawn new → Resume |
| Partial success | Checkpoint → Continue → Verify |
| Total failure | Rollback to base SHA → Report |

**Recovery Flow:**
```
Error Detected → Classify Error → Recoverable?
                                      │
                    Yes ←─────────────┴─────→ No
                     │                          │
                     ▼                          ▼
              Apply Recovery            Rollback + Notify
                     │
                     ▼
                 Success?
                ╱      ╲
              Yes        No
               │          │
               ▼          ▼
            Resume   Escalate to User
```

---

## Layer 5: Security & Guardrails

### Purpose
ป้องกัน AI ทำลายสิ่งที่ไม่ควรทำลาย

**Philosophy:** "Safety First, Always"

### Guards

#### 5.1 Scope Guard (Protected Paths)

**Blocks:** Write, Edit, Delete operations

| Protected Path | Reason |
|----------------|--------|
| .env, .env.* | Secrets |
| migrations/ | Database integrity |
| .git/ | Version control |
| *.pem, *.key, *.crt | Certificates |
| credentials.*, secrets.* | Credentials |
| .claude/settings.local.json | User settings |
| production.*, staging.* | Environment configs |
| package-lock.json | Dependency lock |

**Behavior:** BLOCK → Show error + Suggest alternative → Log to audit

#### 5.2 Secret Scanner (Pattern Detection)

**Scans:** Before Write, Edit, Bash commands

| Pattern | Type |
|---------|------|
| API_KEY=... | API Key |
| password=... | Password |
| token=... | Token |
| sk-..., sk_live-... | Stripe/OpenAI keys |
| AKIA... | AWS Access Key |
| PRIVATE KEY pattern | Private Key |
| mongodb+srv://... | Connection String |
| jwt_secret=... | JWT Secret |

**Behavior:** DETECT → BLOCK → Show warning → Suggest env vars

#### 5.3 Bash Guard (Dangerous Commands)

| Blocked Pattern | Risk Level |
|-----------------|------------|
| rm -rf / | CRITICAL |
| rm -rf * | CRITICAL |
| rm -rf . | CRITICAL |
| sudo rm -rf | CRITICAL |
| fork bomb pattern | CRITICAL |
| dd if=/dev/zero | HIGH |
| > /dev/sda | HIGH |
| chmod -R 777 / | HIGH |
| chown -R * | HIGH |
| git push --force | MEDIUM (with warning) |
| git reset --hard | MEDIUM (with warning) |
| DROP DATABASE | CRITICAL |
| TRUNCATE TABLE | HIGH |

**Behavior:**
- CRITICAL → BLOCK always
- HIGH → BLOCK + Escalate to user
- MEDIUM → WARN + Require explicit confirmation

#### 5.4 Audit Logger

**Location:** `.dev-stack/logs/audit.jsonl`

**Schema:**
```json
{
  "timestamp": "2026-03-14T12:30:45.123Z",
  "session_id": "sess_abc123",
  "tool": "Write",
  "action": "write_file",
  "target": "src/auth/login.ts",
  "result": "success",
  "reason": null,
  "guard": null,
  "user_approved": false,
  "rollback_available": true
}
```

**Benefits:**
- Full traceability (what, when, why)
- Debug support (what went wrong)
- Compliance (audit trail for security)
- Learning (what patterns cause blocks)

#### 5.5 Risk Assessment (Pre-Execution)

| Risk Factor | Weight | Examples |
|-------------|--------|----------|
| Protected path touched | 0.4 | .env, migrations/ |
| Secret in code | 0.4 | API keys, tokens |
| Many files changed | 0.2 | >10 files |
| Breaking change possible | 0.3 | API signature |
| No tests for code | 0.2 | Untested modules |
| Cross-cutting changes | 0.3 | Auth, logging |
| Database schema change | 0.4 | ALTER TABLE |

**Risk Score:** Σ (factor × weight)

| Risk Level | Score | Action |
|------------|-------|--------|
| LOW | 0.0 - 0.2 | Auto-execute |
| MEDIUM | 0.2 - 0.5 | Show plan, proceed |
| HIGH | 0.5 - 0.8 | Require confirmation |
| CRITICAL | 0.8 - 1.0 | Block + Escalate |

---

## Layer 6: Persistence & Recovery

### Purpose
ไม่ลืม ไม่หาย ย้อนกลับได้เสมอ

**Philosophy:** "Remember Everything, Recover Anything"

### Components

#### 6.1 Session Checkpoint

**Location:** `.dev-stack/memory/checkpoint.md`

**Triggers:**
- PreCompact hook (before context compression)
- Every 50 turns (configurable)
- Before risky operations
- Manual: `/dev-stack:checkpoint`

**Schema:**
```markdown
# Dev-Stack Checkpoint
Updated: 2026-03-14T12:30:45.123Z

## Session State
Session ID: sess_abc123
Started: 2026-03-14T10:00:00.000Z
Turns: 47

## Current Task
User Request: "เพิ่มระบบ authentication ให้ API"
Derived Intent: add_jwt_auth_to_api
Phase: BUILD (3/6)
Status: in_progress

## Progress
✅ THINK: Impact analysis complete
✅ RESEARCH: JWT patterns found
🔄 BUILD: Implementing middleware (2/5 files)
⏳ TEST: Not started
⏳ LEARN: Not started
⏳ VERIFY: Not started

## Files Touched
+ src/auth/jwt.ts (created)
~ src/middleware/auth.ts (modified)
~ src/routes/api.ts (in progress)

## Base SHA
e0c15cb2a3f4b5c6d7e8f9a0b1c2d3e4f5a6b7c8

## Key Decisions
• Using JWT over Session (user approved)
• Token expiry: 24h (following existing pattern)

## Next Steps
1. Complete api.ts middleware integration
2. Add remaining routes
3. Write tests
4. Verify all endpoints
```

**Recovery:** Session-start hook loads checkpoint automatically

#### 6.2 Cross-Session Memory

**Location:** `.dev-stack/memory/patterns.db` (SQLite + HNSW)

| Type | Examples | TTL |
|------|----------|-----|
| Success Pattern | "auth_middleware_jwt" | ∞ |
| Failure Pattern | "dont_modify_migrations" | ∞ |
| User Preference | "likes_functional_components" | ∞ |
| Project DNA | "typescript_react_express" | ∞ |
| Anti-Pattern | "avoid_any_type" | ∞ |
| Workflow | "feature_add_flow" | ∞ |

**Operations:**
- STORE(pattern, context, outcome)
- SEARCH(query, k=5) → Similar patterns
- UPDATE(id, success_rate)
- TRANSFER(project_a → project_b)

#### 6.3 Rollback System

**Command:** `/dev-stack:rollback`

| Level | Scope | What it does |
|-------|-------|--------------|
| 1 | Last action | Undo single file change |
| 2 | Last phase | Undo entire BUILD phase |
| 3 | Last task | Undo entire task |
| 4 | To checkpoint | Return to saved state |
| 5 | To base SHA | git reset --hard (full) |

**Safety:**
- Show diff before rollback
- Require confirmation
- Keep checkpoint (for recovery)
- Log rollback to audit

#### 6.4 Learning Engine

**Learning Loop:**
```
Task Complete
     │
     ▼
┌─────────────────┐
│ What worked?    │──→ Store as SUCCESS pattern
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ What failed?    │──→ Store as FAILURE pattern
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ User feedback?  │──→ Update pattern confidence
└─────────────────┘
     │
     ▼
Update DNA + Memory Graph
```

**Pattern Types:**

| Pattern Type | Stored As | Used For |
|--------------|-----------|----------|
| Code Pattern | code_example + tags | Replication |
| Workflow | step_sequence | Automation |
| Decision | choice + reasoning | Future ops |
| Anti-Pattern | what_not_to_do | Prevention |
| User Preference | setting + context | Personalize |

**Cross-Project Transfer:**
```bash
/dev-stack:transfer --pattern="auth_flow" --to=project-b
```

#### 6.5 Time Travel (Action History)

**Commands:**
- `/dev-stack:history` → Show recent actions
- `/dev-stack:undo [n]` → Undo last n actions
- `/dev-stack:redo [n]` → Redo undone actions
- `/dev-stack:replay [id]` → Replay specific action

---

## Commands Summary

| Command | Description |
|---------|-------------|
| `/dev-stack:agent` | Start full workflow |
| `/dev-stack:agent --quick` | Skip thinking phase |
| `/dev-stack:learn` | Force DNA rescan |
| `/dev-stack:status` | Show dashboard |
| `/dev-stack:rollback` | Safe rollback |
| `/dev-stack:checkpoint` | Manual checkpoint |
| `/dev-stack:history` | Show action history |
| `/dev-stack:undo [n]` | Undo actions |
| `/dev-stack:redo [n]` | Redo actions |
| `/dev-stack:transfer` | Transfer patterns between projects |

---

## File Structure

```
.dev-stack/
├── dna/
│   └── project.md           # Project DNA
├── memory/
│   ├── checkpoint.md        # Session checkpoint
│   ├── patterns.db          # HNSW-indexed patterns
│   └── sentinels/           # Session sentinels
├── logs/
│   ├── audit.jsonl          # Audit trail
│   └── files-touched.txt    # Changed files list
└── config/
    └── capabilities.yaml    # Tool registry
```

---

## Success Metrics

### Developer Experience
- [ ] Zero "I forgot what we were doing" moments (checkpoint)
- [ ] Zero accidental file deletions (scope-guard)
- [ ] Zero secret leaks (secret-scanner)
- [ ] Average 30% fewer revision cycles (thinking workflow)

### Technical
- [ ] All hooks complete in <100ms
- [ ] Checkpoint file <50KB
- [ ] Zero performance impact on normal operations
- [ ] 100% audit coverage
- [ ] Pattern search <50ms (HNSW)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Intent Router with context-aware derivation
- [ ] Context Engine (DNA + Pattern Memory)
- [ ] Tool Selector with Capability Registry
- [ ] Basic Security Guards

### Phase 2: Orchestration (Week 3-4)
- [ ] 6-Phase Pipeline implementation
- [ ] Execution Modes (Auto/Plan/Confirm/Interactive)
- [ ] Parallel Swarm execution
- [ ] Failure Recovery system

### Phase 3: Persistence (Week 5-6)
- [ ] Session Checkpoint system
- [ ] Cross-Session Memory (HNSW)
- [ ] Rollback System (5 levels)
- [ ] Learning Engine

### Phase 4: Polish (Week 7)
- [ ] Time Travel (Undo/Redo/Replay)
- [ ] Status Dashboard
- [ ] Documentation
- [ ] Testing & refinement

---

## Appendix: Key Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Fixed vs Dynamic Intent | Dynamic | Context-aware, more flexible |
| Categories vs Derivation | Derivation | VERB + TARGET + CONTEXT = better plans |
| Hardcoded vs Registry tools | Registry | Easy to swap, fallback support |
| Single vs Multi-layer | 6 Layers | Clear separation of concerns |
| Auto vs Confirm | Hybrid | Auto for safe, confirm for risky |

---

*Document Version: 1.0*
*Last Updated: 2026-03-14*
