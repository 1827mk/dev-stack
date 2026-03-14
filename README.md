# Dev-Stack v6 Meta-Orchestrator Plugin

**Version**: 6.0.0
**Status**: Development
**Priority**: P1 (Natural Language Task Execution)

---

## Overview

Dev-Stack v6 is a Meta-Orchestrator plugin for Claude Code that enables:

- **Natural Language Task Execution**: Give instructions in Thai/English/mixed without knowing tool names
- **Context-Aware Intent Derivation**: System understands intent based on current codebase context
- **Hybrid Execution Modes**: AUTO, PLAN_FIRST, CONFIRM, INTERACTIVE based on complexity
- **Session Continuity**: Automatic checkpoints for resuming work after context compression
- **Pattern Learning**: System learns from successful patterns and suggests them for future tasks

---

## 6-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      LAYER 1: Intent Router                      │
│   Language detection, complexity scoring, intent derivation     │
├─────────────────────────────────────────────────────────────────┤
│                      LAYER 2: Context Engine                     │
│   Project DNA, JIT context loading, token budget management     │
├─────────────────────────────────────────────────────────────────┤
│                      LAYER 3: Tool Selector                      │
│   Capability registry, MCP discovery, tool chaining             │
├─────────────────────────────────────────────────────────────────┤
│                   LAYER 4: Orchestration Engine                  │
│   6-phase workflow, parallel execution, failure recovery        │
├─────────────────────────────────────────────────────────────────┤
│                   LAYER 5: Security & Guards                     │
│   Scope guard, secret scanner, bash guard, risk assessor        │
├─────────────────────────────────────────────────────────────────┤
│                 LAYER 6: Persistence & Recovery                  │
│   Checkpoints, pattern storage, 5-level rollback                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Installation

```bash
# Clone or copy to Claude plugins directory
cp -r .claude-plugin ~/.claude/plugins/dev-stack

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test
```

---

## Commands

| Command | Description |
|---------|-------------|
| `/dev-stack:agent` | Execute task with full 6-phase workflow |
| `/dev-stack:agent --quick` | Skip THINK phase for faster execution |
| `/dev-stack:learn` | Force full DNA rescan |
| `/dev-stack:status` | Show current state dashboard |
| `/dev-stack:checkpoint` | Manual checkpoint save |
| `/dev-stack:history` | Show action history |
| `/dev-stack:undo [n]` | Undo last n actions |
| `/dev-stack:redo [n]` | Redo undone actions |
| `/dev-stack:rollback` | Revert changes with diff preview |
| `/dev-stack:transfer` | Transfer patterns between projects |

---

## Quick Start

```bash
# First-time setup - scan project DNA
/dev-stack:learn

# Check status
/dev-stack:status

# Give a task in natural language (Thai/English/mixed)
/dev-stack:agent หาว่า authentication ทำงานยังไง

# Quick mode for simple tasks
/dev-stack:agent --quick เพิ่มปุ่ม logout
```

---

## Configuration

### Protected Paths

Edit `.dev-stack/config/scope.json` to customize protected paths.

### Capabilities

Edit `.claude-plugin/config/capabilities.yaml` to add/modify tool mappings.

---

## Development

```bash
# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Lint
npm run lint
```

---

## Project Structure

```
.claude-plugin/
├── plugin.json           # Plugin manifest
├── config/
│   └── capabilities.yaml # Tool capability registry
├── hooks/
│   ├── session-start.ts  # SessionStart hook
│   ├── pre-compact.ts    # PreCompact hook (checkpoint)
│   ├── pre-tool-use.ts   # PreToolUse hook (guards)
│   └── post-tool-use.ts  # PostToolUse hook (audit)
├── agents/
│   ├── intent-router.md  # Layer 1: Intent Router
│   ├── context-engine.md # Layer 2: Context Engine
│   ├── tool-selector.md  # Layer 3: Tool Selector
│   ├── orchestrator.md   # Layer 4: Orchestration Engine
│   ├── guard-engine.md   # Layer 5: Security Guards
│   └── persistence.md    # Layer 6: Persistence
├── skills/
│   ├── agent.md          # /dev-stack:agent command
│   ├── learn.md          # /dev-stack:learn command
│   ├── status.md         # /dev-stack:status command
│   ├── rollback.md       # /dev-stack:rollback command
│   └── history.md        # /dev-stack:history command
└── lib/
    ├── dna/              # DNA scanner and types
    ├── patterns/         # Pattern storage and search
    ├── checkpoint/       # Checkpoint manager
    ├── guards/           # Security guards
    └── audit/            # Audit logging

.dev-stack/
├── dna/
│   └── project.md        # Project DNA
├── memory/
│   ├── checkpoint.md     # Session checkpoint
│   └── patterns.db       # HNSW-indexed patterns
├── logs/
│   └── audit.jsonl       # Audit trail
└── config/
    └── scope.json        # Scope configuration
```

---

## License

MIT

---

*Dev-Stack v6 | Created: 2026-03-14*
