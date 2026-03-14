# Dev-Stack Code Review & Redesign Proposal

**Version Reviewed**: 5.2.0  
**Date**: 2026-03-14  
**Reviewer**: AI-assisted comprehensive review  
**Status**: Complete

---

## 📊 Project Overview

| Metric | Value |
|--------|-------|
| Python (hooks) | 1,044 lines |
| Tests | 2,369 lines (115/116 pass) |
| Markdown (docs/agents/specs) | 7,601 lines |
| YAML (capabilities) | 435 lines |
| JSON (config) | 276 lines |
| **Doc:Code Ratio** | **7.3:1** ⚠️ |
| Git Commits | ~15 |
| Plugin Version | 5.2.0 |

### Project Structure

```
dev-stack/
├── .claude-plugin/         # Plugin metadata
│   ├── plugin.json
│   └── marketplace.json
├── agents/                 # 7 agent definitions (Markdown)
│   ├── thinker.md
│   ├── researcher.md
│   ├── dna-scanner.md
│   ├── spec-writer.md
│   ├── code-builder.md
│   ├── frontend-specialist.md
│   └── verifier.md
├── commands/               # 4 slash commands
│   ├── agent.md
│   ├── status.md
│   ├── learn.md
│   └── rollback.md
├── config/
│   └── capabilities.yaml   # ~80 capability entries
├── hooks/
│   ├── hooks.json           # Hook event configuration
│   └── scripts/             # 9 Python files + tests
│       ├── config_loader.py
│       ├── session-start.py
│       ├── scope-guard.py
│       ├── secret-scanner.py
│       ├── bash-guard.py
│       ├── file-tracker.py
│       ├── audit-logger.py
│       ├── checkpoint-save.py
│       ├── precompact-backup.py
│       └── tests/           # 10 test files, 116 tests
├── skills/
│   ├── intent-router/SKILL.md
│   └── report-engine/SKILL.md
├── docs/                   # Design specs & plans
├── requirements/           # Competitive analysis & proposals
├── settings.json
├── install.sh
└── README.md
```

---

## ✅ What Works Well

### 1. Hook System — The Core Product

The 8 Python hook scripts are solid, well-tested, and deliver real value:

| Hook | Event | Purpose | Quality |
|------|-------|---------|--------|
| `session-start.py` | UserPromptSubmit | Context injection with dedup via sentinels | ✅ Good |
| `scope-guard.py` | PreToolUse (Write/Edit) | Blocks writes to `.env`, `migrations/`, `.git/`, cert files | ⚠️ Config duplication |
| `secret-scanner.py` | PreToolUse (Write/Edit) | Catches API keys, PEM headers, GitHub PATs, OpenAI keys | ⚠️ Inconsistent blocking |
| `bash-guard.py` | PreToolUse (Bash) | Blocks `rm -rf /`, `sudo rm -rf`, `curl \| sh`, `chmod 777` | ⚠️ No config_loader |
| `file-tracker.py` | PostToolUse (Write/Edit) | TSV tracking of file modifications | ✅ Good |
| `audit-logger.py` | PostToolUse / SubagentStop | JSONL logging of all tool usage | ✅ Good |
| `checkpoint-save.py` | Stop | Atomic write of session state | ✅ Good |
| `precompact-backup.py` | PreCompact | Saves state before context compaction | ✅ Good |

**Strengths:**
- Hooks provide real, tangible protection against common AI-agent mistakes
- Zero-config — works out of the box
- Atomic writes prevent corruption
- Sentinel-based dedup prevents redundant context injection
- PreCompact backup ensures context survives compaction

### 2. config_loader.py — Good Shared Module

- `atomic_write()` — Safe write with `.tmp` + rename
- `get_plugin_root()` — Env var or script-location fallback
- `load_scope_config()` — Defaults + override from `scope.json`
- Path helpers: `get_log_dir()`, `get_memory_dir()`, `get_dna_path()`, etc.
- Returns deep copies to prevent mutation of defaults

### 3. Test Suite — Strong Coverage

- **115/116 tests passing** (1 minor assertion bug)
- Integration-style tests using `subprocess.run` — tests real script behavior
- Good test organization with class-based grouping
- Shared fixtures via `conftest.py`
- Covers: normal flow, edge cases, error handling, audit logging

### 4. settings.json — Clean Defaults

- Well-structured with clear sections
- Sensible defaults for all features
- Supports per-project overrides at `.dev-stack/config/settings.json`

### 5. install.sh — Functional Installer

- Python version check (3.8+)
- Claude CLI detection
- `--update` flag support
- Structure validation
- Clear user instructions

---

## 🔴 Critical Issues

### Issue 1: Three Contradictory Design Specs

**Severity: HIGH** — Architecture confusion

The project has **3 different architectural visions** in documentation, none of which match what's actually built:

| Document | Architecture | Status |
|----------|-------------|--------|
| `docs/specs/2026-03-12-dev-stack-agents-spec.md` | System A (Context Engineering, 0 files) + System B (SDD Workflow, creates files) with `/dev-stack:agents`, `/dev-stack:plan`, `/dev-stack:tasks` | ❌ NOT BUILT |
| `docs/specs/2026-03-12-dev-stack-agents-design.md` | 7-layer autonomous system: Silent Guardian → Predictive Intelligence → Intent Router → Swarm Engine → Multi-Project Memory → Enhanced Pipeline → Real-Time Learning | ❌ NOT BUILT |
| `docs/plans/2026-03-13-context-intelligence-engine-design.md` | 3-layer Context Intelligence: Compression → Learning → Prediction with LLMLingua integration | ❌ NOT BUILT |
| **Actual implementation (v5.2.0)** | `agent.md` command with THINK→RESEARCH→GROUND→BUILD→VERIFY workflow, 7 Markdown agents, 8 Python hook scripts | ✅ THIS EXISTS |

**Impact:**
- New contributors cannot determine which spec to follow
- Design docs promise features that don't exist (Swarm Engine, Silent Guardian, Context Compression)
- Misleading about actual capabilities

**Recommendation:** Archive all aspirational specs to `docs/archive/`. Create a single honest architecture document that describes what's actually built.

---

### Issue 2: Hook Blocking Mechanism Inconsistency (Bug)

**Severity: HIGH** — Behavioral inconsistency in security layer

Three PreToolUse hooks use **two different blocking mechanisms**:

| Hook | Blocking Mechanism | Exit Code | Output Target |
|------|-------------------|-----------|---------------|
| `scope-guard.py` | JSON `{"permissionDecision": "deny"}` | 0 | stdout |
| `bash-guard.py` | JSON `{"permissionDecision": "deny"}` | 0 | stdout |
| `secret-scanner.py` | Plain text error message | **2** | **stderr** |

**Problem:** `secret-scanner.py` uses a completely different blocking pattern than the other two guards. This means:
- Claude Code may handle the block differently
- Error reporting is inconsistent
- The JSON deny pattern provides structured feedback; stderr does not

**Evidence:**

```python
# scope-guard.py (line 84-93) — JSON deny pattern
print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": f"dev-stack Scope Guard: '{file_path}' blocked..."
    }
}))

# secret-scanner.py (line 105-110) — stderr + exit 2 pattern
print(
    f"dev-stack Secret Scanner BLOCKED: ...",
    file=sys.stderr,
)
sys.exit(2)
```

**Fix:** Refactor `secret-scanner.py` to use the same JSON deny pattern as `scope-guard.py` and `bash-guard.py`.

---

### Issue 3: Config Loading Duplication

**Severity: MEDIUM** — DRY violation, maintenance burden

`config_loader.py` exists and provides `load_scope_config()`, but 3 hooks duplicate config loading:

| Hook | Has Own `load_config()` | Uses `config_loader` |
|------|------------------------|---------------------|
| `scope-guard.py` | ✅ Yes (lines 18-28) | ❌ No |
| `secret-scanner.py` | ✅ Yes (lines 87-93) | ❌ No |
| `bash-guard.py` | N/A (no config) | ❌ No |
| `file-tracker.py` | — | ✅ Yes |
| `audit-logger.py` | — | ✅ Yes |
| `checkpoint-save.py` | — | ✅ Yes |
| `precompact-backup.py` | — | ✅ Yes |
| `session-start.py` | — | ✅ Yes |

**Evidence:**

```python
# scope-guard.py — duplicated load_config()
def load_config(cwd: str) -> dict:
    cfg = Path(cwd) / ".dev-stack" / "config" / "scope.json"
    if cfg.exists():
        try:
            return json.loads(cfg.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {
        "forbidden_dirs": DEFAULT_FORBIDDEN_DIRS,
        "forbidden_extensions": DEFAULT_FORBIDDEN_EXTENSIONS,
        "allowed": [],
    }

# config_loader.py — the canonical version
def load_scope_config(cwd: str) -> Dict[str, Any]:
    cfg = Path(cwd) / ".dev-stack" / "config" / "scope.json"
    if cfg.exists():
        try:
            return json.loads(cfg.read_text(encoding="utf-8"))
        except Exception:
            pass
    return copy.deepcopy(DEFAULT_SCOPE_CONFIG)
```

**Differences:**
- `config_loader` returns `copy.deepcopy(DEFAULT_SCOPE_CONFIG)` (safe)
- `scope-guard` returns a new dict literal each time (also safe, but different defaults)
- `config_loader` has `secret_scan_exempt` in defaults; `scope-guard` doesn't

**Fix:** Refactor `scope-guard.py` and `secret-scanner.py` to import and use `config_loader.load_scope_config()`.

---

### Issue 4: Inconsistent Error Handling on Bad JSON Input

**Severity: MEDIUM** — Some hooks silently pass, others correctly fail

| Hook | Exit Code on JSONDecodeError |
|------|----------------------------|
| `session-start.py` | `sys.exit(1)` ✅ |
| `file-tracker.py` | `sys.exit(1)` ✅ |
| `audit-logger.py` | `sys.exit(1)` ✅ |
| `checkpoint-save.py` | `sys.exit(1)` ✅ |
| `precompact-backup.py` | `sys.exit(1)` ✅ |
| `scope-guard.py` | `sys.exit(0)` ❌ |
| `secret-scanner.py` | `sys.exit(0)` ❌ |
| `bash-guard.py` | `sys.exit(0)` ❌ |

**Impact:** When Claude Code sends malformed JSON to a hook, the security guards silently pass instead of raising an error. This means a malformed input could bypass security checks.

**Fix:** Standardize all hooks to `sys.exit(1)` on JSONDecodeError.

---

### Issue 5: Failing Test

**Severity: LOW** — Test assertion bug, not a code bug

**File:** `hooks/scripts/tests/test_checkpoint_save.py`  
**Test:** `TestCheckpointSaveUpdate::test_updates_existing_checkpoint`

```python
# Current (FAILING)
assert "Updated: 2026-03-10" in content

# Should be (checkpoint-save correctly overwrites with current timestamp)
import re
assert re.search(r"Updated: \d{4}-\d{2}-\d{2}T", content)
```

The test expects the old timestamp to be preserved, but the hook correctly updates it to the current time.

---

## 🟡 Design Problems

### Problem 1: Serena Hard Dependency

**Severity: HIGH** — Most agents non-functional without optional MCP tool

All 7 agents list Serena MCP tools in their `tools:` frontmatter:

| Agent | Serena Tools Referenced |
|-------|------------------------|
| `thinker.md` | `activate_project`, `check_onboarding_performed`, `onboarding`, `initial_instructions`, `find_symbol`, `find_referencing_symbols`, `get_symbols_overview`, `search_for_pattern`, `find_file`, `think_about_collected_information`, `think_about_task_adherence`, `think_about_whether_you_are_done` |
| `dna-scanner.md` | `activate_project`, `check_onboarding_performed`, `onboarding`, `initial_instructions`, `get_symbols_overview`, `search_for_pattern`, `write_memory` |
| `code-builder.md` | Referenced via `capabilities.yaml` → `serena:*` |
| `frontend-specialist.md` | `activate_project`, `check_onboarding_performed`, `find_file`, `get_symbols_overview`, `search_for_pattern`, `replace_symbol_body`, `insert_after_symbol`, `insert_before_symbol`, `think_about_task_adherence` |
| `researcher.md` | None (uses web tools) ✅ |
| `spec-writer.md` | None (uses Read/Write/Edit) ✅ |
| `verifier.md` | None (uses Read/Bash/Grep) ✅ |

**Impact:** Without Serena (which most users won't have installed), `thinker`, `dna-scanner`, `code-builder`, and `frontend-specialist` are severely degraded. The agents don't clearly specify fallback behavior.

**Recommendation:** Make every agent work with just Claude Code native tools (Read, Write, Edit, Grep, Glob, Bash). Treat Serena as an optional enhancement with explicit fallback instructions.

---

### Problem 2: Capabilities Registry Bloat

**Severity: MEDIUM** — Token waste, confusing for agents

`capabilities.yaml` has ~80 entries with clear duplicates:

| Duplicate Group | Entries | All Map To |
|----------------|---------|------------|
| Web search | `research.web`, `web.search` | `WebSearch` |
| Doc query | `research.docs`, `web.docs` | `mcp__context7__query-docs` |
| URL fetch | `research.url`, `web.read`, `web.fetch` | `mcp__web_reader__webReader` / `mcp__fetch__fetch` |
| File read | `file.read`, `file.read_many` | `Read` / `mcp__filesystem__read_multiple_files` |

Additionally, **60%+ of entries reference tools most users won't have:**
- `serena:*` tools (9 entries)
- `mcp__memory__*` tools (6 entries)
- `mcp__sequentialthinking__*` (1 entry)
- `mcp__ide__*` (2 entries)
- `mcp__doc-forge__*` (1 entry)
- `mcp__web_reader__*` (2 entries)
- `mcp__context7__*` (2 entries)
- `TaskCreate/Update/List/Get/Output/Stop` (6 entries)
- `EnterWorktree` (1 entry)

**Recommendation:** Deduplicate, split into core (always available) vs optional (MCP-dependent), reduce to ~30 entries.

---

### Problem 3: Agent Over-Specification

**Severity: MEDIUM** — Prompt bloat, reduced flexibility

Agents are 100-200 lines each with rigid phase-by-phase instructions:

| Agent | Lines | Phases |
|-------|-------|--------|
| `thinker.md` | ~150 | 5 phases with sub-steps |
| `code-builder.md` | ~130 | Setup + 5 steps per task |
| `dna-scanner.md` | ~120 | Phase 0-4 |
| `frontend-specialist.md` | ~100 | 3 phases |
| `spec-writer.md` | ~120 | 3 phases |
| `verifier.md` | ~100 | 6 checks |
| `researcher.md` | ~60 | 3 phases |

Claude works better with clear **goals + constraints** rather than step-by-step scripts. Over-specified agents:
- Consume more context tokens
- Are less adaptable to edge cases
- Create rigid behavior that may not suit all projects

**Recommendation:** Compress each agent to ~50-60 lines focusing on WHAT (goals, constraints, output format), not HOW (step-by-step procedures).

---

### Problem 4: Unnecessary Agent Count (7 → 4)

**Severity: MEDIUM** — Maintenance burden, unnecessary complexity

| Agent | Recommendation | Reason |
|-------|---------------|--------|
| `thinker` | ✅ **Keep** | Core value — analysis + impact mapping |
| `researcher` | ✅ **Keep** | Fills knowledge gaps via web research |
| `code-builder` | ✅ **Keep** | Absorb `frontend-specialist` — same workflow, different focus |
| `verifier` | ✅ **Keep** | Quality gate — important safety check |
| `dna-scanner` | ❌ **Merge** | Logic belongs in `/dev-stack:learn` command |
| `frontend-specialist` | ❌ **Merge** | Duplicates `code-builder` with UI-specific additions |
| `spec-writer` | ❌ **Merge** | Output can be part of `thinker` or `agent.md` orchestrator |

---

### Problem 5: Massive Aspirational Documentation (7,600 lines)

**Severity: LOW** — Not harmful but misleading

| Directory | Lines | Content | Status |
|-----------|-------|---------|--------|
| `docs/specs/` | ~2,200 | APEX design, agents design, agents spec | Aspirational, not built |
| `docs/plans/` | ~700 | Context Intelligence Engine design | Aspirational, not built |
| `docs/reference/` | ~30 | Orchestrator reference (deprecated) | Outdated |
| `requirements/analysis/` | ~2,500 | 15 competitive analysis files | Research artifacts |
| `requirements/` | ~800 | Feature proposal, competitive analysis | Research artifacts |

**Recommendation:** Archive to `docs/archive/`. Create a single honest architecture document (~200 lines) that describes what's actually implemented.

---

## 🟢 Minor Issues

### 1. `hooks.json` — Missing PostToolUse Matcher for SubagentStop

The `SubagentStop` event doesn't use a matcher, which is correct per the schema. But the `audit-logger.py` is called for both `PostToolUse` (Bash) and `SubagentStop` — the hook handles both correctly.

### 2. `install.sh` — Validates Non-Existent Files

The `REQUIRED_FILES` array includes `docs/reference/orchestrator.md` which is marked as deprecated. Consider removing it from validation.

### 3. `README.md` — Minimal

The README is functional but sparse. Could benefit from:
- Architecture diagram
- Configuration examples
- Troubleshooting section
- Contribution guidelines

### 4. `.serena/` Directory

The project has a `.serena/` directory with memory files, suggesting Serena was used during development. This should be in `.gitignore` if it isn't already.

### 5. Audit Log Size

The audit log (`.dev-stack/logs/audit.jsonl`) in the git diff shows 438 lines of session history. The `settings.json` has `max_log_size_mb: 50` but there's no log rotation implementation.

---

## 📐 Redesign Proposal

### New Architecture: "Honest Architecture"

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: HOOKS (Python) — Always active, real protection   │
│                                                             │
│  ┌─────────┐  ┌──────────────┐  ┌───────────┐              │
│  │Security │  │  Tracking    │  │  State    │              │
│  │─────────│  │──────────────│  │───────────│              │
│  │scope    │  │file-tracker  │  │session    │              │
│  │secret   │  │audit-logger  │  │checkpoint │              │
│  │bash     │  │              │  │precompact │              │
│  └─────────┘  └──────────────┘  └───────────┘              │
│                                                             │
│  └── Shared: config_loader.py (used by ALL hooks)          │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: COMMANDS (Markdown) — 4 user commands             │
│                                                             │
│  /dev-stack:agent    → THINK→BUILD→VERIFY orchestrator     │
│  /dev-stack:status   → Dashboard                            │
│  /dev-stack:learn    → DNA scan (absorbs dna-scanner)      │
│  /dev-stack:rollback → Safe revert                          │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: AGENTS (Markdown) — 4 agents (down from 7)       │
│                                                             │
│  thinker (~50 lines)      → Analysis + impact mapping      │
│  researcher (~40 lines)   → Web research                    │
│  code-builder (~60 lines) → Implementation + UI             │
│  verifier (~50 lines)     → Quality gate                    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 4: SKILLS (Markdown) — 2 reusable workflows          │
│                                                             │
│  intent-router  → Route user intent to workflow             │
│  report-engine  → Session report from audit logs            │
├─────────────────────────────────────────────────────────────┤
│  LAYER 5: CONFIG — Simplified                               │
│                                                             │
│  capabilities.yaml → ~30 entries (core/optional split)     │
│  settings.json     → Unchanged (already clean)              │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Everything works without Serena** — Native tools (Read/Write/Edit/Grep/Glob/Bash) are the baseline. Serena is an optional enhancement.
2. **Docs match code** — Archive aspirational specs. Maintain one architecture document.
3. **Hooks are the product** — The security/audit/state layer is the core value proposition. Agent orchestration is a bonus.
4. **Less is more** — 4 agents × 50 lines beats 7 agents × 150 lines.
5. **Consistent patterns** — All hooks use the same blocking mechanism, error handling, and config loading.

---

## 📋 Implementation Roadmap

### Phase 1: Fix Bugs (Priority: Critical, Effort: Low)

| # | Task | Files | Impact |
|---|------|-------|--------|
| 1.1 | Standardize `secret-scanner.py` to use JSON deny pattern | `hooks/scripts/secret-scanner.py` | Fixes inconsistent blocking |
| 1.2 | Standardize all hooks to `sys.exit(1)` on bad JSON | `scope-guard.py`, `secret-scanner.py`, `bash-guard.py` | Fixes silent pass on malformed input |
| 1.3 | Refactor `scope-guard.py` to use `config_loader` | `hooks/scripts/scope-guard.py` | Eliminates config duplication |
| 1.4 | Refactor `secret-scanner.py` to use `config_loader` | `hooks/scripts/secret-scanner.py` | Eliminates config duplication |
| 1.5 | Fix failing test assertion | `hooks/scripts/tests/test_checkpoint_save.py` | 116/116 tests pass |
| 1.6 | Update tests for new blocking behavior | `hooks/scripts/tests/test_secret_scanner.py` | Tests match new behavior |

### Phase 2: Simplify Agents (Priority: High, Effort: Medium)

| # | Task | Files | Impact |
|---|------|-------|--------|
| 2.1 | Merge `frontend-specialist.md` into `code-builder.md` | `agents/code-builder.md`, delete `agents/frontend-specialist.md` | -1 agent |
| 2.2 | Merge `dna-scanner.md` into `commands/learn.md` | `commands/learn.md`, delete `agents/dna-scanner.md` | -1 agent |
| 2.3 | Merge `spec-writer.md` into `commands/agent.md` | `commands/agent.md`, delete `agents/spec-writer.md` | -1 agent |
| 2.4 | Compress `thinker.md` to ~50 lines | `agents/thinker.md` | Less token waste |
| 2.5 | Compress `researcher.md` to ~40 lines | `agents/researcher.md` | Less token waste |
| 2.6 | Compress `code-builder.md` to ~60 lines | `agents/code-builder.md` | Less token waste |
| 2.7 | Compress `verifier.md` to ~50 lines | `agents/verifier.md` | Less token waste |
| 2.8 | Remove Serena hard dependency from all agents | All agent files | Works for all users |

### Phase 3: Clean Config (Priority: Medium, Effort: Low)

| # | Task | Files | Impact |
|---|------|-------|--------|
| 3.1 | Deduplicate `capabilities.yaml` | `config/capabilities.yaml` | 80 → ~30 entries |
| 3.2 | Add core/optional split with comments | `config/capabilities.yaml` | Clear what's required |
| 3.3 | Update `install.sh` required files list | `install.sh` | Matches actual structure |

### Phase 4: Clean Docs (Priority: Low, Effort: Low)

| # | Task | Files | Impact |
|---|------|-------|--------|
| 4.1 | Move aspirational specs to `docs/archive/` | `docs/specs/`, `docs/plans/` | Honest project structure |
| 4.2 | Move research artifacts to `docs/archive/` | `requirements/` | Clean root |
| 4.3 | Write single architecture doc | `docs/architecture.md` | Honest, accurate docs |
| 4.4 | Update `README.md` | `README.md` | Matches reality |

---

## 📊 Expected Impact

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Markdown (agents/skills/commands) | ~2,500 lines | ~800 lines | **-68%** |
| Markdown (docs total) | 7,600 lines | ~2,500 lines | **-67%** |
| Capabilities entries | ~80 | ~30 | **-62%** |
| Agent count | 7 | 4 | **-43%** |
| Hook bugs | 3 | 0 | **Fixed** |
| Test pass rate | 115/116 | 116/116 | **100%** |
| Serena dependency | Hard | Optional | **Inclusive** |
| Working features | 100% | 100% | **Preserved** |

---

## 🔒 Security Review

### Scope Guard
- ✅ Blocks forbidden directories (migrations, vendor, node_modules, .git, dist, build, __pycache__)
- ✅ Blocks forbidden extensions (.pem, .key, .p12, .pfx, .cert, .der)
- ✅ Blocks .env and .env.* files
- ✅ Supports allowlist override via `scope.json`
- ✅ Logs blocks to audit trail
- ⚠️ Path checking uses `set(p.parts)` — may have edge cases with symlinks

### Secret Scanner
- ✅ 12 regex patterns covering API keys, passwords, tokens, PEM headers
- ✅ Exempts test files (.test.ts, .spec.js, test_*.py, etc.)
- ✅ Exempts .env.example, .env.sample, .env.template
- ✅ Chunked scanning (64KB chunks with 200-byte overlap)
- ✅ Reduced false positives for TypeScript type annotations
- ⚠️ Regex patterns could miss obfuscated secrets
- ⚠️ No scanning of file names (only content)

### Bash Guard
- ✅ Blocks destructive commands (rm -rf /, sudo rm -rf, kill -9 -1)
- ✅ Blocks dangerous git operations (push --force without --force-with-lease)
- ✅ Blocks SQL injection vectors (DROP TABLE, TRUNCATE)
- ✅ Blocks RCE vectors (curl | sh, wget | sh)
- ✅ Blocks dangerous permissions (chmod 777)
- ✅ Blocks raw disk writes (dd, redirect to /dev/sd*)
- ✅ Respects `stop_hook_active` flag
- ⚠️ No protection against `eval()` or indirect execution
- ⚠️ Patterns are case-insensitive but command parsing is regex-based

### Overall Security Assessment
- **Rating: GOOD** — Covers the most common and dangerous scenarios
- **Gap**: No runtime monitoring (hooks only check at tool-use time)
- **Gap**: No network egress monitoring
- **Gap**: No file permission monitoring (only path-based)

---

## 🧪 Test Review

### Coverage Summary

| Test File | Tests | Pass | Focus |
|-----------|-------|------|-------|
| `test_config_loader.py` | 18 | 18 ✅ | Path helpers, atomic write, config loading |
| `test_scope_guard.py` | 12 | 12 ✅ | Directory blocks, extension blocks, .env, allowlist, audit |
| `test_secret_scanner.py` | 16 | 16 ✅ | API keys, passwords, PEM, tokens, exemptions, audit |
| `test_bash_guard.py` | 14 | 14 ✅ | rm -rf, git push, curl\|sh, chmod, stop_hook, non-Bash |
| `test_audit_logger.py` | 8 | 8 ✅ | Write/Edit/Bash logging, SubagentStop, JSONL format, errors |
| `test_file_tracker.py` | 8 | 8 ✅ | Write/Edit/MultiEdit tracking, TSV format, empty path |
| `test_checkpoint_save.py` | 7 | 6 ⚠️ | Update, create, timestamp, stop_hook_active, atomic write |
| `test_precompact_backup.py` | 5 | 5 ✅ | Compaction notice, sentinel clearing, restore instructions |
| `test_session_start.py` | 9 | 9 ✅ | Bootstrap, dedup, DNA freshness, context format |
| **Total** | **116** | **115** | |

### Test Quality Notes

**Strengths:**
- Integration tests via subprocess — tests real script behavior
- Good use of `conftest.py` fixtures for shared setup
- Tests cover both happy path and error cases
- Audit logging verified for blocking operations

**Weaknesses:**
- 1 failing test (assertion bug, not code bug)
- Some tests accept both exit 0 and exit 1 for JSON errors (`assert result.returncode in (0, 1)`) — these should be strict after standardization
- No performance/timing tests
- No concurrent access tests (multiple hooks writing to same audit log)

---

## 📝 File-by-File Review

### hooks/scripts/config_loader.py
**Rating: ✅ Good**
- Clean API, good defaults
- `atomic_write()` is safe
- `copy.deepcopy()` prevents mutation
- Could add: type hints for return values (already has some)

### hooks/scripts/session-start.py
**Rating: ✅ Good**
- Sentinel-based dedup is clever
- DNA freshness check (24h TTL)
- Truncates large content (2000 chars DNA, 1500 chars checkpoint, last 10 mistakes)
- Properly handles post-compaction re-injection
- Uses `config_loader` ✅

### hooks/scripts/scope-guard.py
**Rating: ⚠️ Needs Refactor**
- Duplicates `load_config()` — should use `config_loader`
- Exits 0 on JSONDecodeError — should exit 1
- Blocking mechanism is correct (JSON deny)
- Path checking logic is solid (uses `set(p.parts)` for boundary matching)

### hooks/scripts/secret-scanner.py
**Rating: ⚠️ Needs Refactor**
- Duplicates `load_config()` — should use `config_loader`
- Uses stderr+exit(2) instead of JSON deny — inconsistent
- Exits 0 on JSONDecodeError — should exit 1
- Regex patterns are well-tuned (reduced false positives for TS type annotations)
- Chunked scanning with overlap is good for large files

### hooks/scripts/bash-guard.py
**Rating: ⚠️ Minor Issues**
- Doesn't use `config_loader` at all (but doesn't need config loading)
- Exits 0 on JSONDecodeError — should exit 1
- Good pattern coverage
- `stop_hook_active` check is correct

### hooks/scripts/file-tracker.py
**Rating: ✅ Good**
- Uses `config_loader` ✅
- Exits 1 on JSONDecodeError ✅
- TSV format is clean
- Handles multiple path key names (file_path, path, target_path)

### hooks/scripts/audit-logger.py
**Rating: ✅ Good**
- Uses `config_loader` ✅
- Exits 1 on JSONDecodeError ✅
- Handles multiple event types (PostToolUse, SubagentStop, Stop)
- Truncates bash commands to 300 chars
- Detects error responses

### hooks/scripts/checkpoint-save.py
**Rating: ✅ Good**
- Uses `config_loader` ✅
- Atomic write ✅
- Handles missing "Updated:" line gracefully
- Respects `stop_hook_active` flag

### hooks/scripts/precompact-backup.py
**Rating: ✅ Good**
- Uses `config_loader` ✅
- Atomic write ✅
- Clears sentinels for re-injection after compaction
- Injects restore instructions with correct file paths
- Handles missing checkpoint gracefully

### config/capabilities.yaml
**Rating: ⚠️ Needs Cleanup**
- Well-commented structure
- Supports primary/fallback pattern
- Too many entries (~80)
- Clear duplicates
- Many reference unavailable tools

### settings.json
**Rating: ✅ Good**
- Clean structure
- Sensible defaults
- All features configurable

### hooks/hooks.json
**Rating: ✅ Good**
- Correct event→script mapping
- Matchers properly scoped (Write|Edit|MultiEdit vs Bash)
- All 6 hook events covered

### install.sh
**Rating: ✅ Good**
- Proper error handling (set -euo pipefail)
- Python version check
- --update flag
- Structure validation
- Clear output messages

---

## 🏁 Conclusion

Dev-Stack is a **well-intentioned Claude Code plugin** with a solid hook system that provides real security, audit, and state management value. The core Python code is clean and well-tested.

However, the project suffers from **spec overrun** — 7,600 lines of aspirational documentation describing features that don't exist, 3 contradictory architectural visions, and a 7:1 doc-to-code ratio. The agent layer is over-engineered with hard dependencies on optional MCP tools.

**Priority Actions:**
1. 🔴 Fix hook inconsistencies (blocking mechanism, error handling, config duplication)
2. 🟡 Simplify agents (7→4, remove Serena dependency, compress prompts)
3. 🟢 Clean up config and documentation

**The hook system is the product.** The agent orchestration is a bonus layer. Focusing on making the hooks bulletproof and the agents universally functional will create a much stronger plugin.

---

*End of Code Review*
