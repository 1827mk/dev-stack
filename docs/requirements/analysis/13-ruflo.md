# Analysis: Ruflo v3.5 (formerly Claude Flow)
**Source**: https://github.com/ruvnet/ruflo/
**Type**: Enterprise AI Orchestration Platform
**Analyzed**: 2026-03-12

---

## Executive Summary

Ruflo v3.5 เป็น **Enterprise-grade AI Agent Orchestration Platform** ที่มีจำนวน commits มากกว่า **5,800+ commits**, **55 alpha iterations**, และมี **215 MCP tools**, **60+ agents**, **8 AgentDB controllers**

**ความแตกต่างหลักจาก competitors อื่นๆ:**
- Production-ready ด้วย 10 Architecture Decision Records (ADRs)
- มี dual-mode collaboration (Claude Code + OpenAI Codex)
- มี plugin system ที่ publish ผ่าน IPFS
- มี RuVector Intelligence System (SONA, MoE, HNSW)

---

## Project Statistics

| Metric | Value |
|--------|-------|
| Version | 3.5.15 (2026-02-27) - First major stable release |
| Commits | 5,800+ |
| Alpha Iterations | 55 |
| MCP Tools | 215 |
| Agents | 60+ |
| AgentDB Controllers | 8 |
| Skills | 100+ (in `.agents/skills/`) |
| Packages | 3 (@claude-flow/cli, claude-flow, ruflo) |
| Code Removed (v3) | 226,606 lines |
| Storage Reclaimed | 24MB |

---

## Architecture Overview

### 10 Core Modules (@claude-flow/*)

| Module | Purpose | Key Features |
|--------|---------|--------------|
| `cli` | CLI entry point | 26 commands, 140+ subcommands, 20ms cold start |
| `codex` | Dual-mode collaboration | Claude + Codex parallel execution |
| `guidance` | Governance control plane | Policy enforcement, routing |
| `hooks` | Lifecycle hooks | 17 hooks + 12 background workers |
| `memory` | AgentDB memory | HNSW indexing, 150x-12,500x faster |
| `security` | Security module | CVE remediation, input validation |
| `integration` | Agentic-flow integration | Eliminates 10,000+ duplicate lines |
| `performance` | Performance profiling | Flash Attention, 2.49x-7.47x speedup |
| `swarm` | Swarm coordination | Unified SwarmCoordinator |
| `neural` | Neural features | SONA, ReasoningBank, pattern learning |

### Project Structure

```
ruflo/
├── .agents/                 # Agent configurations & skills
│   ├── config.toml         # Main configuration (TOML-based)
│   └── skills/             # 100+ skills (subdirectories)
├── agents/                 # Agent YAML definitions
│   ├── coder.yaml
│   ├── architect.yaml
│   ├── tester.yaml
│   ├── reviewer.yaml
│   └── security-architect.yaml
├── v3/                     # V3 implementation
│   ├── @claude-flow/       # 10 modular packages
│   ├── mcp/                # MCP server implementation
│   │   └── tools/          # MCP tool categories
│   ├── agents/             # V3 agent definitions
│   ├── docs/               # Documentation
│   └── implementation/     # Core implementation
├── plugin/                 # Plugin system
├── scripts/                # Utility scripts
└── tests/                  # Test suites
```

---

## MCP Tools (215 tools across 6 categories)

| Category | Tool Files | Description |
|----------|------------|-------------|
| **agent-tools.ts** | Swarm coordination, agent lifecycle, spawning, status, pooling |
| **config-tools.ts** | Configuration management, provider setup, settings |
| **federation-tools.ts** | Cross-project coordination, distributed agents |
| **hooks-tools.ts** | 17 lifecycle hooks + 12 background workers |
| **memory-tools.ts** | AgentDB vector search, storage, retrieval, HNSW |
| **session-tools.ts** | Session management, persistence, state tracking |
| **swarm-tools.ts** | Swarm orchestration, topologies, consensus |
| **neural-tools.ts** | SONA learning, pattern training, neural status |
| **security-tools.ts** | CVE scanning, input validation, path security |

### Key MCP Tool Examples

```typescript
// Swarm Init
swarm_init(topology: "hierarchical", maxAgents: 8, strategy: "specialized")

// Memory Search (HNSW-indexed, 150x-12,500x faster)
memory_search(query: "task keywords", namespace: "patterns")

// Agent Spawn
agent_spawn(type: "coder", name: "worker-1")

// Hooks
pre_task(description: "task")
post_task(taskId: "id", success: true, trainPatterns: true)
```

---

## Dual-Mode Collaboration (Unique Feature)

### Claude Code (🔵) + OpenAI Codex (🟢)

Ruflo สามารถรัน parallel agents จากทั้งสองแพลตฟอร์มพร้อมกัน:

| Platform | Strength | Use Case |
|----------|----------|----------|
| 🔵 Claude Code | Architecture, Design, Security Review | Complex reasoning |
| 🟢 Codex | Implementation, Refactoring, Optimization | Fast code generation |

### Collaboration Templates

```bash
# Feature template (4 agents across platforms)
npx claude-flow-codex dual run feature --task "Add OAuth login"

# Custom multi-platform swarm
npx claude-flow-codex dual run \
  --worker "claude:architect:Design API" \
  --worker "codex:coder:Implement endpoints" \
  --worker "claude:tester:Write tests" \
  --worker "codex:reviewer:Review code" \
  --namespace "api-feature"
```

### Shared Memory Namespace

All agents share state via `collaboration` namespace:
```bash
# Store cross-platform context
memory store --namespace collaboration --key "design" --value "..."

# Search across all workers
memory search --namespace collaboration --query "auth patterns"
```

---

## Agent Types (60+ types)

### Core Development
`coder`, `reviewer`, `tester`, `planner`, `researcher`

### V3 Specialized
`security-architect`, `security-auditor`, `memory-specialist`, `performance-engineer`

### Security Module (@claude-flow/security)
`InputValidator`, `PathValidator`, `SafeExecutor`, `PasswordHasher`, `TokenGenerator`

### Swarm Coordination
`hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`, `collective-intelligence-coordinator`, `swarm-memory-manager`

### Consensus & Distributed
`byzantine-coordinator`, `raft-manager`, `gossip-coordinator`, `consensus-builder`, `crdt-synchronizer`, `quorum-manager`, `security-manager`

### Performance & Optimization
`perf-analyzer`, `performance-benchmarker`, `task-orchestrator`, `memory-coordinator`, `smart-agent`

### GitHub & Repository
`github-modes`, `pr-manager`, `code-review-swarm`, `issue-tracker`, `release-manager`, `workflow-automation`, `project-board-sync`, `repo-architect`, `multi-repo-swarm`

### SPARC Methodology
`sparc-coord`, `sparc-coder`, `specification`, `pseudocode`, `architecture`, `refinement`

### Specialized Development
`backend-dev`, `mobile-dev`, `ml-developer`, `cicd-engineer`, `api-docs`, `system-architect`, `code-analyzer`, `base-template-generator`

### Testing & Validation
`tdd-london-swarm`, `production-validator`

---

## Swarm Topologies & Consensus

### Topologies
| Topology | Use Case | Description |
|----------|----------|-------------|
| `hierarchical` | Coordinated teams, anti-drift | Queen controls workers directly |
| `mesh` | Peer-to-peer | Fully connected network |
| `hierarchical-mesh` | Hybrid (recommended for V3) | Best of both |
| `adaptive` | Dynamic | Switches based on load |
| `ring` | Sequential | Each node passes to next |
| `star` | Central coordinator | Single hub |

### Consensus Algorithms
| Algorithm | Fault Tolerance | Use Case |
|------------|-----------------|----------|
| `byzantine` | f < n/3 | BFT - highest security |
| `raft` | f < n/2 | Leader-based - default |
| `gossip` | Eventual | Epidemic protocol |
| `crdt` | Conflict-free | No coordination needed |
| `quorum` | Configurable | Flexible threshold |

---

## RuVector Intelligence System

### Components

| Component | Description | Performance |
|-----------|-------------|-------------|
| **SONA** | Self-Optimizing Neural Architecture | <0.05ms adaptation |
| **MoE** | Mixture of Experts routing | Specialized task handling |
| **HNSW** | Hierarchical Navigable Small World | 150x-12,500x faster search |
| **EWC++** | Elastic Weight Consolidation | Prevents forgetting |
| **Flash Attention** | Optimized attention mechanism | 2.49x-7.47x speedup |

### 4-Step Intelligence Pipeline

```
1. RETRIEVE  → Fetch relevant patterns via HNSW
2. JUDGE     → Evaluate with verdicts (success/failure)
3. DISTILL   → Extract key learnings via LoRA
4. CONSOLIDATE → Prevent catastrophic forgetting via EWC++
```

---

## Performance Benchmarks (V3)

| Metric | v2 Baseline | v3 Target | v3 Actual | Improvement |
|--------|-------------|-----------|-----------|-------------|
| **Flash Attention** | 1x | 2.49x-7.47x | 4.2x | 320% faster |
| **Vector Search** | 1x | 150x-12,500x | 8,500x | 850,000% faster |
| **Memory Usage** | 100% | 25-50% | 16.9% | 83.1% reduction |
| **CLI Startup** | 500ms | <500ms | 20ms | 96% faster |
| **Agent Spawn** | 18.5ms | <10ms | 5ms | 73% faster |
| **Test Execution** | 1x | 10x | 12x | 1,100% faster |
| **SWE-Bench** | - | - | 84.8% | Solve rate |

### Code Quality Metrics
- **Test Coverage**: 87.3% (up from 62%)
- **Security Score**: A+ (up from C)
- **Code Complexity**: 15 avg (down from 42)
- **Bundle Size**: 3.2MB (down from 12.8MB)
- **Code Removed**: 226,606 lines
- **Storage Reclaimed**: 24MB

---

## CLI Commands (26 commands, 140+ subcommands)

### Core Commands

| Command | Subcommands | Description |
|---------|-------------|-------------|
| `init` | 4 | Project initialization with wizard, presets |
| `agent` | 8 | Agent lifecycle (spawn, list, status, stop, metrics, pool) |
| `swarm` | 6 | Multi-agent swarm coordination |
| `memory` | 11 | AgentDB memory with HNSW vector search |
| `mcp` | 9 | MCP server management |
| `task` | 6 | Task creation, assignment, lifecycle |
| `session` | 7 | Session state management |
| `config` | 7 | Configuration management |
| `status` | 3 | System status monitoring |
| `hooks` | 17 | Self-learning hooks + 12 workers |
| `hive-mind` | 6 | Byzantine fault-tolerant consensus |

### Advanced Commands

| Command | Subcommands | Description |
|---------|-------------|-------------|
| `daemon` | 5 | Background worker daemon |
| `neural` | 5 | Neural pattern training |
| `security` | 6 | Security scanning (scan, audit, cve, threats) |
| `performance` | 5 | Performance profiling |
| `providers` | 5 | AI providers (list, add, remove, test) |
| `plugins` | 5 | Plugin management |
| `deployment` | 5 | Deployment management |
| `embeddings` | 4 | Vector embeddings (75x faster) |
| `migrate` | 5 | V2 to V3 migration |

---

## Hooks System (17 hooks + 12 background workers)

### Core Hooks

| Category | Hooks | Purpose |
|----------|-------|---------|
| **Tool Lifecycle** | `pre-edit`, `post-edit`, `pre-command`, `post-command`, `pre-task`, `post-task` | Tool execution |
| **Session** | `session-start`, `session-end`, `session-restore`, `notify` | Context management |
| **Intelligence** | `route`, `explain`, `pretrain`, `build-agents`, `transfer` | Neural learning |
| **Learning** | `trajectory-start/step/end`, `pattern-store/search`, `stats`, `attention` | Reinforcement |
| **Agent Teams** | `teammate-idle`, `task-completed` | Multi-agent coordination |

### 12 Background Workers

| Worker | Priority | Description |
|--------|----------|-------------|
| `ultralearn` | normal | Deep knowledge acquisition |
| `optimize` | high | Performance optimization |
| `consolidate` | low | Memory consolidation |
| `predict` | normal | Predictive preloading |
| `audit` | critical | Security analysis |
| `map` | normal | Codebase mapping |
| `preload` | low | Resource preloading |
| `deepdive` | normal | Deep code analysis |
| `document` | normal | Auto-documentation |
| `refactor` | normal | Refactoring suggestions |
| `benchmark` | normal | Performance benchmarking |
| `testgaps` | normal | Test coverage analysis |

---

## Plugin System (20 plugins)

### Distribution via IPFS

Plugins are distributed via IPFS through Pinata for decentralized, immutable distribution.

### Core Plugins

| Plugin | Version | Description |
|--------|---------|-------------|
| `@claude-flow/embeddings` | 3.0.0-alpha.1 | Vector embeddings with sql.js, HNSW |
| `@claude-flow/security` | 3.0.0-alpha.1 | Input validation, CVE remediation |
| `@claude-flow/claims` | 3.0.0-alpha.8 | Claims-based authorization |
| `@claude-flow/neural` | 3.0.0-alpha.7 | SONA, MoE, EWC++ |
| `@claude-flow/plugins` | 3.0.0-alpha.1 | Plugin system core |
| `@claude-flow/performance` | 3.0.0-alpha.1 | Performance profiling |

### Integration Plugins

| Plugin | Version | Description |
|--------|---------|-------------|
| `@claude-flow/plugin-agentic-qe` | 3.0.0-alpha.4 | Quality engineering |
| `@claude-flow/plugin-prime-radiant` | 0.1.5 | Intelligence integration |
| `@claude-flow/plugin-gastown-bridge` | 3.0.0-alpha.1 | Bridge protocol |
| `@claude-flow/teammate-plugin` | 1.0.0-alpha.1 | Multi-agent coordination |
| `@claude-flow/plugin-code-intelligence` | 0.1.0 | Advanced code analysis |
| `@claude-flow/plugin-test-intelligence` | 0.1.0 | Test generation |
| `@claude-flow/plugin-perf-optimizer` | 0.1.0 | Performance optimization |
| `@claude-flow/plugin-neural-coordinator` | 0.1.0 | Neural coordination |

### Domain-Specific Plugins

| Plugin | Version | Description |
|--------|---------|-------------|
| `@claude-flow/plugin-healthcare-clinical` | 0.1.0 | Healthcare workflows |
| `@claude-flow/plugin-financial-risk` | 0.1.0 | Financial risk assessment |
| `@claude-flow/plugin-legal-contracts` | 0.1.0 | Legal contract analysis |

---

## Configuration (TOML-based)

### Main Config File: `.agents/config.toml`

```toml
# =============================================================================
# Claude Flow V3 - Codex Configuration
# =============================================================================

# Core Settings
model = "gpt-5.3-codex"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
web_search = "cached"

# Features
[features]
child_agents_md = true
shell_snapshot = true
request_rule = true
remote_compaction = true

# MCP Servers
[mcp_servers.claude-flow]
command = "npx"
args = ["-y", "@claude-flow/cli@latest"]
enabled = true
tool_timeout_sec = 120

# Skills
[[skills.config]]
path = ".agents/skills/swarm-orchestration"
enabled = true

# Profiles
[profiles.dev]
approval_policy = "never"
sandbox_mode = "danger-full-access"

[profiles.safe]
approval_policy = "untrusted"
sandbox_mode = "read-only"

# Security
[security]
input_validation = true
path_traversal_prevention = true
secret_scanning = true
cve_scanning = true
max_file_size = 10485760

# Performance
[performance]
max_agents = 8
task_timeout = 300
memory_limit = "512MB"
cache_enabled = true

# Neural Intelligence
[neural]
sona_enabled = true
hnsw_enabled = true
hnsw_m = 16
hnsw_ef_construction = 200
pattern_learning = true

# Swarm
[swarm]
default_topology = "hierarchical"
default_strategy = "specialized"
consensus = "raft"
anti_drift = true
checkpoint_interval = 10
```

---

## Agent YAML Example

```yaml
# coder agent configuration
type: coder
version: "3.0.0"
capabilities:
  - code-generation
  - refactoring
  - debugging
optimizations:
  - flash-attention
  - token-reduction
createdAt: "2026-02-11T22:34:36.389Z"
```

---

## Skills Directory (100+ skills)

The `.agents/skills/` directory contains 100+ skill subdirectories:

### Categories (examples)

- `agent-*.md` - Agent-related skills (coordinators, coders, architects)
- `swarm-*.md` - Swarm orchestration
- `memory-*.md` - Memory management
- `security-*.md` - Security skills
- `github-*.md` - GitHub integration
- `performance-*.md` - Performance optimization

---

## Three-Tier Model Routing (ADR-026)

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster (WASM) | <1ms | $0 | Simple transforms (var→const, add types) |
| **2** | Haiku | ~500ms | $0.0002 | Simple tasks (<30% complexity) |
| **3** | Sonnet/Opus | 2-5s | $0.003-0.015 | Complex reasoning (>30% complexity) |

### Agent Booster Intent Types

- `var-to-const`, `add-types`, `add-error-handling`
- `async-await`, `add-logging`, `remove-console`

---

## Headless Background Instances

Ruflo supports `claude -p` (print/pipe mode) for headless Claude instances:

```bash
# Single headless task
claude -p "Analyze authentication module"

# With model selection
claude -p --model haiku "Format config file"
claude -p --model opus "Design database schema"

# Parallel background execution
claude -p "Security audit" &
claude -p "Generate tests" &
claude -p "Profile memory" &
wait

# Session continuation
claude -p --session-id "abc-123" "Start analysis"
claude -p --resume "abc-123" "Continue with tests"
```

---

## Comparison: Dev-Stack vs Ruflo

| Feature | Dev-Stack | Ruflo | Gap |
|---------|-----------|-------|-----|
| **Agents** | 7 (planned) | 60+ | 8.5x |
| **MCP Tools** | 0 | 215 | ∞ |
| **CLI Commands** | 4 | 26 (140+ subcommands) | 6.5x |
| **Skills** | 2 | 100+ | 50x |
| **Dual-Mode** | No | Yes (Claude + Codex) | Major |
| **HNSW Search** | No | Yes (150x-12,500x faster) | Major |
| **SONA Learning** | No | Yes (<0.05ms adaptation) | Major |
| **Flash Attention** | No | Yes (2.49x-7.47x speedup) | Major |
| **Byzantine Consensus** | No | Yes (hive-mind) | Major |
| **Plugin System** | No | Yes (IPFS distribution) | Major |
| **TOML Config** | No | Yes (.agents/config.toml) | Nice |
| **Hooks (17+12)** | 0 | 29 | ∞ |
| **Background Workers** | 0 | 12 | ∞ |
| **Topologies (6)** | 1 (planned) | 6 | 6x |
| **Consensus (5)** | 0 | 5 | ∞ |
| **Code Reduction** | 0 | 226,606 lines | ∞ |
| **SWE-Bench** | Unknown | 84.8% | - |

---

## Critical Features Missing in Dev-Stack

### 1. MCP Tools (215 tools)
Ruflo has 215 MCP tools across 9 categories. Dev-Stack has 0.

### 2. Dual-Mode Collaboration
Ruflo can run Claude Code + OpenAI Codex agents in parallel. Dev-Stack doesn't have this.

### 3. HNSW Vector Search
Ruflo achieves 150x-12,500x faster search with AgentDB + HNSW. Dev-Stack uses Memory MCP but without HNSW.

### 4. SONA Learning System
Ruflo has <0.05ms adaptation time with Self-Optimizing Neural Architecture. Dev-Stack doesn't have self-learning.

### 5. Flash Attention
Ruflo has 2.49x-7.47x speedup via @ruvector/attention. Dev-Stack doesn't have this optimization.

### 6. Byzantine Consensus
Ruflo has hive-mind with BFT (tolerates f < n/3 faulty). Dev-Stack only has simple hierarchical.

### 7. Plugin System (IPFS)
Ruflo has 20 plugins distributed via IPFS. Dev-Stack doesn't have a plugin system.

### 8. Hooks (17 + 12 workers)
Ruflo has 29 hooks (17 lifecycle + 12 background). Dev-Stack has 0.

### 9. TOML Configuration
Ruflo uses `.agents/config.toml` with profiles, neural settings, security config. Dev-Stack uses YAML but less comprehensive.

### 10. Background Workers (12)
Ruflo has 12 background workers (audit, optimize, consolidate, etc.). Dev-Stack doesn't have this.

---

## What Dev-Stack Can Learn from Ruflo

### High Priority

1. **Add MCP Tools**
   - Create tool categories: agent, config, memory, session, swarm, neural, security
   - Start with 20-30 core tools

2. **Implement HNSW Vector Search**
   - Integrate AgentDB with HNSW indexing
   - Target 100x faster search

3. **Add Hooks System**
   - Start with 5 core hooks: pre-task, post-task, session-start, session-end
   - Add 3-5 background workers: audit, optimize, consolidate

4. **Create Plugin System**
   - Simple plugin loader first
   - IPFS distribution later

### Medium Priority

5. **Add Dual-Mode Support**
   - Allow Claude + another AI platform
   - Shared memory namespace

6. **Implement Flash Attention**
   - Integrate @ruvector/attention
   - Target 2x speedup

7. **Add More Topologies**
   - mesh, ring, star, adaptive
   - Start with mesh

8. **Create TOML Config**
   - Migrate from YAML to TOML
   - Add profiles section

### Low Priority

9. **Add Byzantine Consensus**
   - Implement BFT or Raft
   - Start with Raft (simpler)

10. **Background Workers**
    - Start with 2-3 workers
    - audit, optimize

---

## Architecture Decisions (ADRs)

Ruflo has 10 ADRs documenting key decisions:

1. **ADR-001**: Adopted agentic-flow@alpha (eliminated 10,000+ lines)
2. **ADR-002**: Domain-Driven Design with bounded contexts
3. **ADR-003**: Unified SwarmCoordinator (removed 6 duplicates)
4. **ADR-004**: Plugin-based microkernel architecture
5. **ADR-005**: MCP-first API design
6. **ADR-006**: Unified memory service (replaced 6+ systems)
7. **ADR-007**: Event sourcing for state changes
8. **ADR-008**: Migrated from Jest to Vitest (10x faster)
9. **ADR-009**: Hybrid memory backend (SQLite + AgentDB)
10. **ADR-010**: Removed Deno support, focused on Node.js 20+

---

## License & Publishing

| Package | License | npm |
|---------|---------|-----|
| `@claude-flow/cli` | MIT | `npx @claude-flow/cli@latest` |
| `claude-flow` | MIT | `npx claude-flow@latest` |
| `ruflo` | MIT | `npx ruflo@latest` |

**Publishing Requirements:**
- Must publish ALL THREE packages together
- Must update ALL dist-tags for ALL THREE packages
- Order: CLI → claude-flow → ruflo

---

## Key Takeaways

### Ruflo's Strengths

1. **Production-Ready**: 5,800+ commits, 55 alpha iterations, 10 ADRs
2. **Massive Scale**: 215 MCP tools, 60+ agents, 100+ skills
3. **Performance**: 83% memory reduction, 850,000x faster search
4. **Enterprise-Grade**: Security module, CVE remediation, A+ security score
5. **Dual-Mode**: Claude + Codex collaboration
6. **Self-Learning**: SONA, MoE, HNSW, EWC++
7. **Plugin Ecosystem**: 20 plugins via IPFS

### Dev-Stack's Position

Dev-Stack is **conceptually similar** but **far behind in implementation**:

- **Concept**: Dev-Stack's 6-layer design aligns with Ruflo's intelligence system
- **Gap**: Dev-Stack has 0 MCP tools vs Ruflo's 215
- **Gap**: Dev-Stack has 7 agents vs Ruflo's 60+
- **Gap**: Dev-Stack has no HNSW, no SONA, no Flash Attention
- **Gap**: Dev-Stack has no hooks, no background workers, no plugin system

### Recommendations

1. **Study Ruflo's MCP tools** - Copy the tool categorization
2. **Adopt TOML config** - More flexible than YAML
3. **Implement HNSW** - Essential for performance
4. **Add hooks** - Start simple, expand gradually
5. **Create plugin system** - Even a simple one helps
6. **Consider dual-mode** - Claude + another platform

---

## Sources

- Repository: https://github.com/ruvnet/ruflo/
- Main README: 286,606 bytes (truncated in fetch)
- AGENTS.md: 21,154 bytes
- CLAUDE.md: 38,302 bytes
- CHANGELOG.md: 9,797 bytes
- Package: claude-flow@3.5.15

---

**Conclusion**: Ruflo v3.5 is significantly ahead of Dev-Stack in almost every metric. Dev-Stack should adopt Ruflo's patterns (MCP tools, HNSW, hooks, plugins) while maintaining its simpler 6-layer architecture.
