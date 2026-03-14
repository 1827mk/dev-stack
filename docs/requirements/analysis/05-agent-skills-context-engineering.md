# Analysis: Agent-Skills-for-Context-Engineering
**Source**: https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering
**Type**: Context Engineering Skills Collection
**Analyzed**: 2026-03-12

---

## Overview

Agent-Skills-for-Context-Engineering เป็น comprehensive collection ของ skills สำหรับ context engineering โดยเน้นที่การจัดการ context window, progressive disclosure, และ cognitive architecture patterns

---

## Key Features

### 1. Skills Overview

#### Foundational Skills
| Skill | Description |
|-------|-------------|
| context-fundamentals | Understand context anatomy in agent systems |
| context-degradation | Recognize failure patterns: lost-in-middle, poisoning, distraction |
| context-compression | Design compression strategies for long sessions |

#### Architectural Skills
| Skill | Description |
|-------|-------------|
| multi-agent-patterns | Orchestrator, peer-to-peer, hierarchical architectures |
| memory-systems | Short-term, long-term, graph-based memory |
| tool-design | Build tools that agents can use effectively |
| filesystem-context | Dynamic context discovery, tool output offloading |
| hosted-agents | Background coding agents with sandboxed VMs |

#### Operational Skills
| Skill | Description |
|-------|-------------|
| context-optimization | Compaction, masking, caching strategies |
| evaluation | Build evaluation frameworks |
| advanced-evaluation | LLM-as-a-Judge techniques |

#### Cognitive Architecture Skills
| Skill | Description |
|-------|-------------|
| bdi-mental-states | Transform RDF context into beliefs, desires, intentions |
| project-development | Design LLM projects from ideation to deployment |

### 2. Progressive Disclosure Architecture
```
Startup: Load skill names + descriptions only
    ↓
Activation: Load full content when skill is triggered
    ↓
Execution: Use minimal necessary context
```

### 3. Context Degradation Patterns
| Pattern | Description | Mitigation |
|---------|-------------|------------|
| Lost-in-Middle | Information in middle of context ignored | Reorder, compress |
| U-shaped Attention | Better recall at start/end | Strategic placement |
| Attention Scarcity | Limited attention budget | High-signal tokens |
| Poisoning | Bad data corrupts output | Validation |
| Distraction | Irrelevant info derails focus | Filtering |
| Clash | Conflicting information | Resolution |

### 4. BDI Mental States
```
Beliefs (B) → What the agent knows
Desires (D) → What the agent wants
Intentions (I) → What the agent will do
```

### 5. Plugin Structure
| Plugin | Skills Included |
|--------|-----------------|
| context-engineering-fundamentals | context-fundamentals, context-degradation, context-compression, context-optimization |
| agent-architecture | multi-agent-patterns, memory-systems, tool-design, filesystem-context, hosted-agents |
| agent-evaluation | evaluation, advanced-evaluation |
| agent-development | project-development |
| cognitive-architecture | bdi-mental-states |

### 6. Example Systems
| Example | Description |
|---------|-------------|
| digital-brain-skill | Personal OS with 6 modules, 4 automation scripts |
| x-to-book-system | Multi-agent X monitoring → daily books |
| llm-as-judge-skills | TypeScript evaluation tools, 19 tests |
| book-sft-pipeline | Style transfer training, $2 total cost |

---

## Comparison with Dev-Stack

| Feature | Dev-Stack | Agent-Skills-for-Context-Engineering |
|---------|-----------|--------------------------------------|
| Context Engineering | PreCompact only | Full compression strategies |
| Progressive Disclosure | No | Yes (3-level loading) |
| Context Degradation | No handling | Pattern recognition + mitigation |
| Memory Systems | checkpoint.md only | Short-term, long-term, graph |
| Cognitive Architecture | No | BDI mental states |
| Evaluation | No | LLM-as-a-Judge |
| Skills | 2 | 13 |

---

## Gaps Identified

### Critical
1. **No Progressive Disclosure** - Dev-Stack loads full content always
2. **No Context Degradation Handling** - Dev-Stack ไม่รู้จัก lost-in-middle
3. **No Memory Architecture** - Dev-Stack มีเฉพาะ checkpoint.md

### Important
4. **No Evaluation Framework** - Dev-Stack ไม่มี quality measurement
5. **No Cognitive Architecture** - Dev-Stack ไม่มี BDI patterns
6. **Limited Skills** - Dev-Stack มี 2 skills เทียบกับ 13

### Nice-to-Have
7. **No Filesystem Context** - Dev-Stack ไม่ใช้ filesystem สำหรับ context offload
8. **No Hosted Agents** - Dev-Stack ไม่มี background agent support

---

## Unique Features in Agent-Skills-for-Context-Engineering

### Progressive Disclosure Pattern
```yaml
# Level 1: Startup
skills:
  - name: context-fundamentals
    description: "Understand context anatomy"
    # Content NOT loaded yet

# Level 2: Activation
# Full SKILL.md loaded when triggered

# Level 3: Execution
# Only relevant sections used
```

### Context Engineering Philosophy
> "Context engineering is the discipline of managing the language model's context window. Unlike prompt engineering, context engineering addresses the holistic curation of all information that enters the model's limited attention budget."

### BDI Mental States Transformation
```
External RDF Context
    ↓
Beliefs (B): Parse facts, validate
    ↓
Desires (D): Identify goals
    ↓
Intentions (I): Form plans
    ↓
Deliberative Reasoning
```

### Digital Brain Skill Example
- 3-level loading (SKILL.md → MODULE.md → data files)
- 6 independent modules (identity, content, knowledge, network, operations, agents)
- Append-Only Memory with JSONL + schema-first lines
- 4 automation scripts (weekly_review, content_ideas, stale_contacts, idea_to_draft)

---

## Recommendations for Dev-Stack

1. **Implement Progressive Disclosure**
   - Load skill descriptions at startup
   - Full content only when triggered
   - Use minimal context for execution

2. **Add Context Degradation Detection**
   - Monitor for lost-in-middle patterns
   - Implement attention-aware placement
   - Add compression triggers

3. **Build Memory Architecture**
   - Short-term: Working memory
   - Long-term: Persistent storage
   - Graph: Entity relationships

4. **Add BDI Cognitive Layer**
   - Beliefs: Parse DNA + checkpoint
   - Desires: Extract from user intent
   - Intentions: Generate task plan

---

## Actionable Items

- [ ] Implement 3-level progressive disclosure for skills
- [ ] Add context degradation detection
- [ ] Build short-term/long-term memory architecture
- [ ] Add graph-based entity memory
- [ ] Implement BDI mental states
- [ ] Create LLM-as-a-Judge evaluation
- [ ] Add filesystem context offloading
