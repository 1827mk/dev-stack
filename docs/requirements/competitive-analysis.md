# Dev-Stack Competitive Analysis
Generated: 2026-03-12
Sources: 8 repositories/docs from url.md

## Executive Summary

Dev-stack ปัจจุบันเป็น orchestrator plugin ที่มีความเฉพาะตัวในแนวทาง "thinking-first" แต่ขาดความสามารถหลายอย่างเมื่อเทียบกับ ecosystem อื่นๆ โดยเฉพาะ:

| Metric | Dev-Stack | awesome-claude-code-subagents | everything-claude-code |
|--------|-----------|-------------------------------|------------------------|
| Agents | 7 | 100+ | 16 |
| Skills | 2 | 146 | 65 |
| Commands | 4 | - | 40 |
| Platforms | 1 (Claude Code) | 1 | 4+ |

## Feature Comparison Matrix

### 1. Agent Architecture

| Feature | Dev-Stack | VoltAgent | Ruflo | wshobson/agents |
|---------|-----------|-----------|-------|-----------------|
| Specialized Agents | 7 (thinker, researcher, dna-scanner, spec-writer, code-builder, verifier, frontend-specialist) | 100+ categories | Swarm orchestration | 112 agents |
| Model Tier Strategy | Single model | Three-tier (Opus/Sonnet/Haiku) | Configurable | Multi-model |
| Agent Communication | Via task list | Native Agent Teams | Swarm protocol | Orchestrator-based |
| Autonomous Execution | Semi-autonomous | Full autonomous | Swarm-based | Varied |

**Gap**: Dev-Stack ไม่มี three-tier model strategy ซึ่งส่งผลต่อ cost optimization

### 2. Workflow Patterns

| Feature | Dev-Stack | Competitors |
|---------|-----------|-------------|
| Workflow Phases | THINK → RESEARCH → GROUND → BUILD → VERIFY | Varied (TDD, debugging, etc.) |
| State Machine | Implicit | Explicit in some |
| Checkpointing | session-start, checkpoint-save | Some have, some don't |
| Rollback Support | Yes (via git SHA) | Limited |

**Strength**: Dev-Stack มี workflow ที่ชัดเจนและ rollback capability

### 3. Context Engineering

| Feature | Dev-Stack | Agent-Skills-for-Context-Engineering |
|---------|-----------|--------------------------------------|
| Context Compression | PreCompact backup only | Full compression strategies |
| Context Degradation Handling | No | Yes |
| Progressive Disclosure | No | Yes (skill content) |
| Memory Persistence | checkpoint.md, sentinels | Multiple patterns |

**Gap**: Dev-Stack ขาด context engineering patterns ที่ซับซ้อน

### 4. Security & Guards

| Feature | Dev-Stack | Competitors |
|---------|-----------|-------------|
| Scope Guard | Yes (path blocking) | Varies |
| Secret Scanner | Yes (regex patterns) | Some have |
| Bash Guard | Yes (dangerous commands) | Some have |
| Audit Logging | Yes (JSONL) | Varies |

**Strength**: Dev-Stack มี security layer ที่ครบถ้วน

### 5. Plugin Ecosystem

| Feature | Dev-Stack | awesome-claude-plugins |
|---------|-----------|------------------------|
| Plugin Ranking | N/A | GitHub metrics (stars, forks) |
| Categorization | Single plugin | 15+ categories |
| Marketplace | No | Community-driven |

### 6. Cross-Platform Support

| Platform | Dev-Stack | everything-claude-code |
|----------|-----------|------------------------|
| Claude Code CLI | Yes | Yes |
| Cursor | No | Yes |
| Codex | No | Yes |
| OpenCode | No | Yes |

**Gap**: Dev-Stack รองรับเฉพาะ Claude Code

### 7. Agent Teams Integration

| Feature | Dev-Stack | Claude Code Native |
|---------|-----------|-------------------|
| Team Creation | Via TaskList | TeamCreate tool |
| Message Passing | SendMessage tool | Native |
| Task Dependencies | Manual | Built-in |
| Parallel Execution | Agent tool | Spawn multiple |

**Gap**: Dev-Stack ไม่ได้ใช้ native Agent Teams API อย่างเต็มที่

## Gap Analysis

### Critical Gaps (Must Fix)

1. **Three-Tier Model Strategy**
   - ปัจจุบัน: ใช้ model เดียวสำหรับทุก task
   - ควรมี: Opus for thinking, Sonnet for building, Haiku for simple tasks
   - Impact: Cost optimization และ speed

2. **Context Engineering**
   - ปัจจุบัน: PreCompact backup เท่านั้น
   - ควรมี: Context compression, degradation handling, progressive disclosure
   - Impact: Context window management

3. **Agent Ecosystem Expansion**
   - ปัจจุบัน: 7 agents
   - ควรมี: Domain-specific agents (TDD, debugging, security, etc.)
   - Impact: Coverage และ specialization

### Important Gaps (Should Fix)

4. **Native Agent Teams Integration**
   - ปัจจุบัน: Custom task list system
   - ควรมี: Native TeamCreate/TeamDelete integration
   - Impact: Better coordination

5. **Progressive Disclosure for Skills**
   - ปัจจุบัน: Full skill content loaded
   - ควรมี: Progressive disclosure based on context
   - Impact: Token efficiency

6. **Continuous Learning System**
   - ปัจจุบัน: Manual DNA updates
   - ควรมี: Automatic learning from sessions (instincts)
   - Impact: Self-improvement

### Nice-to-Have Gaps

7. **Cross-Platform Support**
   - Impact: Wider adoption

8. **Plugin Marketplace Integration**
   - Impact: Discoverability

## Architecture Comparison

### Current Dev-Stack Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                           │
│  /dev-stack:agent  /dev-stack:status  /dev-stack:learn     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Hook Layer (Python)                      │
│  scope-guard │ secret-scanner │ bash-guard │ file-tracker  │
│  audit-logger │ session-start │ checkpoint-save │ backup    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Agent Layer (7 agents)                   │
│  thinker → researcher → dna-scanner → spec-writer          │
│           → code-builder → verifier                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Layer                              │
│  checkpoint.md │ DNA │ audit.jsonl │ sentinels             │
└─────────────────────────────────────────────────────────────┘
```

### Proposed Dev-Stack v2 Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                           │
│  Commands + Skills (Progressive Disclosure)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Model Router (NEW)                       │
│  Opus (thinking) │ Sonnet (building) │ Haiku (simple)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Hook Layer (Python)                      │
│  [Existing] + context-compressor + learning-engine (NEW)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Agent Teams (Native API)                 │
│  TeamCreate → Specialized Agents → TaskList → TeamDelete   │
│  thinker │ researcher │ builder │ verifier │ specialist*   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Context Engine (NEW)                     │
│  Compression │ Degradation │ Progressive Disclosure         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Learning System (NEW)                    │
│  DNA Scanner │ Instincts │ Memory Graph │ Continuous Learn  │
└─────────────────────────────────────────────────────────────┘
```

## Recommendations

### Phase 1: Foundation (2-3 weeks)
1. **Implement Model Router** - Add three-tier model strategy
2. **Integrate Native Agent Teams** - Replace custom task list with TeamCreate API
3. **Add Context Compression** - Implement basic compression strategies

### Phase 2: Enhancement (2-3 weeks)
4. **Expand Agent Library** - Add 10+ specialized agents
5. **Progressive Disclosure** - Implement skill content staging
6. **Continuous Learning v2** - Add instincts and memory graph

### Phase 3: Polish (1-2 weeks)
7. **Cross-Platform Support** - Add Cursor/Codex compatibility
8. **Documentation** - Update all docs for v2

## Key Decisions Needed

1. **Keep or Replace Custom Task System?**
   - Option A: Keep current TaskList + enhance
   - Option B: Full migration to native Agent Teams

2. **Model Strategy**
   - Option A: Hardcoded tier mapping (thinker=Opus, builder=Sonnet)
   - Option B: Dynamic routing based on task complexity

3. **Context Engineering Priority**
   - Option A: Build internal compression engine
   - Option B: Leverage existing MCP tools (sequentialthinking)

4. **Agent Ecosystem**
   - Option A: Curated set of 20-30 high-quality agents
   - Option B: Open ecosystem with 100+ agents

## Sources

1. https://github.com/quemsah/awesome-claude-plugins - 100 plugins ranked
2. https://github.com/affaan-m/everything-claude-code - Cross-platform support
3. https://github.com/wshobson/agents - 112 agents, 146 skills
4. https://github.com/ruvnet/ruflo - Swarm orchestration
5. https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering - Context patterns
6. https://github.com/VoltAgent/awesome-claude-code-subagents - 100+ subagents
7. https://github.com/kepano/obsidian-skills - Domain-specific skills
8. https://code.claude.com/docs/en/agent-teams - Native Agent Teams API
