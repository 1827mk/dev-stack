# Competitive Analysis Index
Generated: 2026-03-12
Sources: 18 URLs from url.md

---

## Analysis Files

| # | File | Source | Type | Key Findings |
|---|------|--------|------|--------------|
| 01 | [awesome-claude-plugins.md](./01-awesome-claude-plugins.md) | github.com/quemsah/awesome-claude-plugins | Plugin Directory | 100+ plugins indexed, GitHub metrics ranking |
| 02 | [everything-claude-code.md](./02-everything-claude-code.md) | github.com/affaan-m/everything-claude-code | Cross-Platform Harness | 16 agents, 65 skills, 40 commands, 4+ platforms |
| 03 | [wshobson-agents.md](./03-wshobson-agents.md) | github.com/wshobson/agents | Agent Collection | 112 agents, 146 skills, 72 plugins, 3-tier model |
| 04 | [ruflo.md](./04-ruflo.md) | github.com/ruvnet/ruflo (old analysis) | Enterprise Orchestration | 60+ agents, RuVector intelligence, swarm consensus |
| 13 | [ruflo-v3.md](./13-ruflo.md) | github.com/ruvnet/ruflo (DEEP DIVE) | Enterprise Platform v3.5 | **5,800+ commits, 215 MCP tools, dual-mode, HNSW, SONA** |
| 14 | [context-engineering.md](./14-context-engineering.md) | 4 sources (GitHub, Anthropic, etc.) | Context Engineering Pattern | **Context prep layer, 10-16X faster, just-in-time retrieval** |
| 15 | [agent-teams-lite.md](./15-agent-teams-lite.md) | github.com/Gentleman-Programming/agent-teams-lite | Sub-Agent Orchestrator | **9+ sub-agents, skill registry, SDD workflow, engram persistence** |
| 05 | [agent-skills-context-engineering.md](./05-agent-skills-context-engineering.md) | github.com/muratcankoylan/Agent-Skills-for-Context-Engineering | Context Engineering | 13 skills, BDI mental states, progressive disclosure |
| 06 | [awesome-claude-code-subagents.md](./06-awesome-claude-code-subagents.md) | github.com/VoltAgent/awesome-claude-code-subagents | Subagent Collection | 100+ subagents, 10 categories, plugin marketplace |
| 07 | [obsidian-skills.md](./07-obsidian-skills.md) | github.com/kepano/obsidian-skills | Domain Skills | 5 skills for Obsidian PKM |
| 08 | [claude-code-overview.md](./08-claude-code-overview.md) | code.claude.com/docs/en/overview | Official Docs | Multi-surface, native Agent Teams |
| 09 | [agent-teams.md](./09-agent-teams.md) | code.claude.com/docs/en/agent-teams | Native API | TeamCreate, TaskList, SendMessage |
| 10 | [weaviate-agent-skills.md](./10-weaviate-agent-skills.md) | github.com/weaviate/agent-skills + X | Vector DB Skills | 6 multi-agent patterns, RAG, Query Agent |
| 11 | [academic-research-skills.md](./11-academic-research-skills.md) | github.com/Imbad0202/academic-research-skills | Academic Pipeline | 32 agents, 10-stage pipeline, integrity verification |
| 12 | [headroom.md](./12-headroom.md) | github.com/chopratejas/headroom | Context Optimization | 47-92% compression, CCR, failure learning |

---

## Dev-Stack vs Competitors Summary

| Metric | Dev-Stack | Best Competitor | Gap |
|--------|-----------|-----------------|-----|
| Agents | 7 | 112 (wshobson) / 60+ (Ruflo) | 16x |
| Skills | 2 | 146 (wshobson) / 100+ (Ruflo) | 73x |
| Commands | 4 | 140+ (Ruflo) | 35x |
| MCP Tools | 0 | 215 (Ruflo v3.5) | ∞ |
| Platforms | 1 | 4+ (ECC) | 4x |
| Model Tiers | 1 | 3 (all competitors) | 3x |
| Learning System | DNA only | SONA (Ruflo <0.05ms) | Major |
| Vector Search | No | HNSW 150x-12,500x (Ruflo) | Major |
| Flash Attention | No | 2.49x-7.47x (Ruflo) | Major |
| Dual-Mode | No | Yes (Ruflo Claude+Codex) | Major |
| Hooks | 0 | 29 (Ruflo: 17+12 workers) | ∞ |
| Plugin System | No | Yes (Ruflo IPFS) | Major |
| Multi-Agent Patterns | 1 (hierarchical) | 6 (Weaviate) / 6 (Ruflo) | 6x |
| Consensus | No | 5 algorithms (Ruflo) | ∞ |
| RAG Support | No | Yes (Weaviate) | Major |
| Vector DB Integration | Memory MCP only | AgentDB+HNSW (Ruflo) | Major |
| Integrity Verification | No | Yes (Academic) | Major |
| Quality Rubrics | No | Yes (Academic) | Major |
| Socratic Coaching | No | Yes (Academic) | Major |
| Peer Review System | No | Yes (Academic) | Major |
| Pipeline Stages | 5 | 10 (Academic) | 2x |
| Context Compression | PreCompact only | 47-92% (Headroom) | Major |
| Failure Learning | No | Yes (Headroom) | Major |
| Reversible Compression | No | Yes (Headroom CCR) | Major |
| Commits/Iterations | 0 | 5,800+ / 55 alpha (Ruflo) | ∞ |
| Code Reduction | 0 | 226,606 lines (Ruflo v3) | ∞ |

---

## Critical Gaps (Must Fix)

### 1. Three-Tier Model Strategy
- **Current**: Single model for all tasks
- **Target**: Opus (thinking) → Sonnet (building) → Haiku (simple)
- **Impact**: Cost optimization, speed

### 2. Native Agent Teams Integration
- **Current**: Custom TaskList system
- **Target**: TeamCreate/TeamDelete API
- **Impact**: Better coordination, cleanup

### 3. Context Engineering
- **Current**: PreCompact backup only
- **Target**: Compression, degradation handling, progressive disclosure
- **Impact**: Context window management

### 4. Agent Ecosystem Expansion
- **Current**: 7 agents
- **Target**: 20-30 curated agents
- **Impact**: Coverage, specialization

### 5. Multi-Agent Pattern Support (NEW)
- **Current**: Hierarchical only
- **Target**: 6 patterns (Hierarchical, Human-in-Loop, Shared Tools, Sequential, Shared DB, Memory Transform)
- **Impact**: Production-ready architectures

### 6. RAG Integration (NEW)
- **Current**: No retrieval support
- **Target**: Basic, Advanced, Agentic RAG patterns
- **Impact**: Knowledge-intensive applications

### 7. Integrity Verification (NEW)
- **Current**: No anti-hallucination system
- **Target**: 100% reference & data verification, WebSearch audit trail
- **Impact**: Trust, reproducibility

### 8. Quality Rubrics & Socratic Coaching (NEW)
- **Current**: No scoring or guidance
- **Target**: 0-100 rubrics, convergence criteria, guided mode
- **Impact**: Quality assurance, user experience

### 9. Context Compression Pipeline (NEW)
- **Current**: PreCompact backup only
- **Target**: 4-stage pipeline (CacheAligner → ContentRouter → IntelligentContext → QueryEcho)
- **Impact**: 47-92% token savings

### 10. Failure Learning (NEW)
- **Current**: No learning from failures
- **Target**: Analyze past failures, write corrections to project files
- **Impact**: Session-to-session improvement

---

## Important Gaps (Should Fix)

| Gap | Solution | Priority |
|-----|----------|----------|
| No Skills Library | Create 10+ core skills | High |
| No Progressive Disclosure | 3-level skill loading | High |
| No Multi-Provider | Add OpenAI, Gemini, Ollama | Medium |
| No Learning Loop | Implement RETRIEVE→JUDGE→DISTILL | Medium |
| No Plugin Marketplace | Submit to awesome-claude-plugins | Medium |
| No Tool Permission Control | Add tools field to agents | Medium |

---

## Nice-to-Have Gaps

| Gap | Solution | Priority |
|-----|----------|----------|
| Cross-Platform Support | Cursor/Codex adapters | Low |
| VS Code Extension | Create IDE extension | Low |
| Swarm Consensus | Raft, BFT protocols | Low |
| Vector Search | HNSW implementation | Low |

---

## Recommended Implementation Order

### Phase 1: Foundation (2-3 weeks)
1. Add `model` field to all agents (Opus/Sonnet/Haiku)
2. Add `tools` field for permission control
3. Integrate native TeamCreate/TeamDelete API
4. Implement basic context compression

### Phase 2: Enhancement (2-3 weeks)
5. Create 10+ core skills with progressive disclosure
6. Add 10+ new specialized agents
7. Implement learning loop (basic)
8. Add plugin marketplace entry

### Phase 3: Polish (1-2 weeks)
9. Add multi-provider support
10. Create VS Code extension
11. Add cross-platform adapters
12. Update documentation

---

## Key Decisions Needed

1. **Keep or Replace Custom Task System?**
   - Option A: Keep current TaskList + enhance
   - Option B: Full migration to native Agent Teams

2. **Model Strategy**
   - Option A: Hardcoded tier mapping (thinker=Opus, builder=Sonnet)
   - Option B: Dynamic routing based on task complexity

3. **Agent Ecosystem**
   - Option A: Curated set of 20-30 high-quality agents
   - Option B: Open ecosystem with 100+ agents

4. **Learning System**
   - Option A: Basic pattern storage
   - Option B: Full RuVector-like intelligence layer

---

## Files Structure

```
requirements/
├── url.md                              # Source URLs
├── competitive-analysis.md             # Master comparison
└── analysis/
    ├── 01-awesome-claude-plugins.md
    ├── 02-everything-claude-code.md
    ├── 03-wshobson-agents.md
    ├── 04-ruflo.md
    ├── 05-agent-skills-context-engineering.md
    ├── 06-awesome-claude-code-subagents.md
    ├── 07-obsidian-skills.md
    ├── 08-claude-code-overview.md
    ├── 09-agent-teams.md
    ├── 10-weaviate-agent-skills.md     # Weaviate + Multi-Agent Patterns
    ├── 11-academic-research-skills.md  # Academic Pipeline (32 agents)
    ├── 12-headroom.md                  # Context Optimization (47-92% compression)
    ├── 13-ruflo.md                     # Ruflo v3.5 DEEP DIVE
    ├── 14-context-engineering.md       # Context Engineering Pattern
    ├── 15-agent-teams-lite.md          # NEW: Sub-Agent Orchestrator
    └── README.md                       # This file
```
