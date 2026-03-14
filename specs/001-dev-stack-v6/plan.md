# Implementation Plan: Dev-Stack v6 Meta-Orchestrator Plugin

**Branch**: `001-dev-stack-v6` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-dev-stack-v6/spec.md`

---

## Summary

Build a 6-layer Meta-Orchestrator plugin for Claude Code that enables natural language task execution with automatic tool selection. The system uses context-aware intent derivation (not fixed categories) and hybrid execution modes (AUTO/PLAN_FIRST/CONFIRM/INTERACTIVE) based on complexity and risk assessment. Key innovation: users give instructions in Thai/English/mixed language without knowing tool names, and the system intelligently selects appropriate tools from available MCP servers and plugins.

---

## Technical Context

**Language/Version**: TypeScript 5.x (Claude Code plugins use TypeScript/JavaScript)
**Primary Dependencies**: Claude Code Plugin SDK, SQLite (via better-sqlite3 for HNSW), MCP client libraries
**Storage**: SQLite with HNSW extension for pattern similarity search, filesystem for checkpoints/logs
**Testing**: Vitest for unit tests, integration tests via Claude Code test harness
**Target Platform**: Claude Code CLI (macOS, Linux, Windows)
**Project Type**: Claude Code Plugin (extends CLI functionality)
**Performance Goals**: Pattern search <50ms, Checkpoint save <500ms, Intent derivation <2s
**Constraints**: Must work within Claude Code plugin architecture, token budget management required
**Scale/Scope**: Single plugin with 6 layers, ~15-20 files, supports 10k+ patterns

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Project constitution is template-only (no project-specific rules defined). Default gates:

| Gate | Status | Notes |
|------|--------|-------|
| Library-First | ✅ N/A | Plugin architecture, not library |
| CLI Interface | ✅ PASS | Commands exposed via `/dev-stack:*` |
| Test-First | ✅ PASS | TDD workflow planned |
| Simplicity | ✅ PASS | 6 layers with clear separation |
| YAGNI | ✅ PASS | Only features from spec included |

**Gate Result**: ✅ PASS - Proceed to Phase 0

---

## Project Structure

### Documentation (this feature)

```text
specs/001-dev-stack-v6/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── cli-contracts.md # CLI command contracts
```

### Source Code (repository root)

```text
# Plugin root (dev-stack/)
├── .claude-plugin/
│   └── plugin.json                # Plugin manifest (REQUIRED)
├── agents/                        # Agent definitions (at root)
│   ├── intent-router.md           # Layer 1: Intent Router
│   ├── context-engine.md          # Layer 2: Context Engine
│   ├── tool-selector.md           # Layer 3: Tool Selector
│   └── orchestrator.md            # Layer 4: Orchestration Engine
├── skills/                        # Skills with SKILL.md (at root)
│   ├── agent/SKILL.md             # /dev-stack:agent command
│   ├── learn/SKILL.md             # /dev-stack:learn command
│   ├── status/SKILL.md            # /dev-stack:status command
│   ├── checkpoint/SKILL.md        # /dev-stack:checkpoint command
│   ├── rollback/SKILL.md          # /dev-stack:rollback command
│   ├── history/SKILL.md           # /dev-stack:history command
│   ├── undo/SKILL.md              # /dev-stack:undo command
│   └── redo/SKILL.md              # /dev-stack:redo command
├── hooks/
│   └── hooks.json                 # Prompt-based hooks configuration
├── lib/                           # TypeScript library modules
│   ├── dna/
│   │   ├── scanner.ts             # DNA scanner
│   │   └── types.ts               # DNA types
│   ├── patterns/
│   │   ├── store.ts               # Pattern storage
│   │   ├── search.ts              # HNSW search
│   │   └── types.ts               # Pattern types
│   ├── checkpoint/
│   │   ├── manager.ts             # Checkpoint save/load
│   │   └── types.ts               # Checkpoint types
│   ├── guards/
│   │   ├── scope-guard.ts         # Protected paths
│   │   ├── secret-scanner.ts      # Secret detection
│   │   ├── bash-guard.ts          # Dangerous commands
│   │   ├── risk-assessor.ts       # Risk scoring
│   │   └── types.ts               # Guard types
│   ├── audit/
│   │   ├── logger.ts              # Audit logging
│   │   └── types.ts               # Audit types
│   ├── intent/
│   │   ├── language-detector.ts   # Language detection
│   │   ├── complexity-scorer.ts   # Complexity scoring
│   │   └── mode-selector.ts       # Execution mode selection
│   ├── context/
│   │   ├── jit-loader.ts          # Just-in-time context loading
│   │   └── token-budget.ts        # Token budget management
│   ├── orchestration/
│   │   ├── mode-transitions.ts    # Mode transition logic
│   │   ├── recovery.ts            # Failure recovery
│   │   └── task-tracker.ts        # Task tracking
│   ├── selector/
│   │   ├── capability-loader.ts   # Capability registry loader
│   │   └── tool-checker.ts        # Tool availability checker
│   └── recovery/
│       └── rollback.ts            # Rollback implementation
├── config/
│   └── capabilities.yaml          # Tool capability registry
├── scripts/
│   └── setup.sh                   # Plugin setup script
├── marketplace.json               # Marketplace configuration
└── README.md                      # Plugin documentation

.dev-stack/
├── dna/
│   └── project.md                 # Project DNA (generated)
├── memory/
│   ├── checkpoint.md              # Session checkpoint
│   ├── patterns.db                # HNSW-indexed patterns
│   └── sentinels/                 # Session sentinels
├── logs/
│   ├── audit.jsonl                # Audit trail
│   └── files-touched.txt          # Changed files
└── config/
    └── scope.json                 # Scope configuration
```

**Structure Decision**: Single plugin structure with layered architecture. Each layer is implemented as a combination of agents (for complex orchestration) and lib modules (for reusable utilities). Hooks provide the guard and persistence layers.

---

## Phase 0: Research Summary

See `research.md` for full details.

### Key Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Pattern Search | SQLite + HNSW extension | 150x-12,500x faster than linear, proven library |
| Language Detection | Custom lightweight detector | Thai/English/mixed detection not well-supported by existing libraries |
| Intent Derivation | VERB + TARGET + CONTEXT formula | More flexible than fixed categories, adapts to context |
| Complexity Scoring | Weighted factors (files, risk, deps, cross-cut) | Quantifiable, configurable thresholds |
| Execution Modes | 4 modes based on complexity + risk | Balances automation with safety |
| Checkpoint Format | Markdown with YAML frontmatter | Human-readable, version-controllable, easy to debug |

---

## Phase 1: Design Artifacts

### Data Model

See `data-model.md` for entity definitions.

**Key Entities**:
1. **Project DNA** - Persistent project knowledge
2. **Pattern** - Reusable solution with vector embedding
3. **Checkpoint** - Session state snapshot
4. **Capability** - Tool capability mapping
5. **Audit Entry** - Action audit record

### Contracts

See `contracts/cli-contracts.md` for CLI command specifications.

**Commands**:
- `/dev-stack:agent [task]` - Execute task with full workflow
- `/dev-stack:agent --quick [task]` - Skip thinking phase
- `/dev-stack:learn` - Force DNA rescan
- `/dev-stack:status` - Show dashboard
- `/dev-stack:rollback [--level=N]` - Revert changes
- `/dev-stack:history` - Show action history
- `/dev-stack:undo [n]` - Undo last n actions
- `/dev-stack:redo [n]` - Redo undone actions

### Quickstart

See `quickstart.md` for developer onboarding.

---

## Complexity Tracking

> No violations to justify - design follows simplicity principles.

| Aspect | Status |
|--------|--------|
| Layer count | 6 layers (necessary for separation of concerns) |
| File count | ~20 source files (reasonable for plugin scope) |
| Dependencies | Minimal (SQLite, HNSW, Claude SDK) |
| Patterns stored | Up to 10k+ (HNSW handles scale) |

---

## Next Steps

After this plan is approved:

1. Run `/speckit.tasks` to generate detailed task breakdown
2. Begin Phase 1 implementation (Foundation: Intent Router + Context Engine + Tool Selector + Guards)
3. Follow TDD: Write tests first, then implement

---

*Plan Version: 1.0 | Created: 2026-03-14*
