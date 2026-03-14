# Analysis: wshobson/agents
**Source**: https://github.com/wshobson/agents
**Type**: Agent Collection & Plugin Directory
**Analyzed**: 2026-03-12

---

## Overview

wshobson/agents เป็น comprehensive collection ของ Claude Code agents, skills, และ plugins ที่มีจำนวนมากที่สุดใน ecosystem ปัจจุบัน โดยมี three-tier model strategy เป็นจุดเด่น

---

## Key Features

### 1. Component Statistics
| Component | Count | Description |
|-----------|-------|-------------|
| Agents | 112 | Specialized agents across domains |
| Skills | 146 | Agent skills with progressive disclosure |
| Plugins | 72 | Focused plugins for specific tasks |
| Orchestrators | 16 | Workflow orchestration patterns |

### 2. Three-Tier Model Strategy
| Tier | Count | Purpose | Examples |
|------|-------|---------|----------|
| Opus | 42 | Deep reasoning, architecture, security audits | security-auditor, architect-reviewer |
| Inherit | 42 | Use parent conversation model | Context-dependent |
| Sonnet | 51 | Everyday coding, debugging, refactoring | python-pro, backend-developer |
| Haiku | 18 | Quick tasks, docs, dependency checks | documentation-engineer |

### 3. Agent Categories
- **Core Development**: API designers, backend/frontend developers
- **Language Specialists**: TypeScript, Python, Go, Rust, Java, etc.
- **Infrastructure**: DevOps, cloud architects, Kubernetes specialists
- **Quality & Security**: Code reviewers, penetration testers, compliance auditors
- **Data & AI**: ML engineers, data scientists, LLM architects
- **Developer Experience**: Build engineers, documentation writers
- **Specialized Domains**: Blockchain, fintech, IoT, game development
- **Business & Product**: Product managers, technical writers
- **Meta & Orchestration**: Multi-agent coordinators, workflow orchestrators

### 4. Model Routing Philosophy
```yaml
# Example agent frontmatter
---
name: security-auditor
model: opus  # Deep reasoning for security audits
tools: Read, Grep, Glob  # Read-only for analysis
---
```

### 5. Agent Teams Plugin
- Parallel workflow execution
- Swarm coordination patterns
- Task distribution across agents
- Inter-agent communication

---

## Comparison with Dev-Stack

| Feature | Dev-Stack | wshobson/agents |
|---------|-----------|-----------------|
| Agents | 7 | 112 |
| Skills | 2 | 146 |
| Model Strategy | Single model | Three-tier (Opus/Sonnet/Haiku) |
| Categories | 1 (orchestration) | 10+ domains |
| Plugin Count | 1 | 72 |
| Installation | Manual | Plugin marketplace |

---

## Gaps Identified

### Critical
1. **No Model Tier Strategy** - Dev-Stack ใช้ model เดียวสำหรับทุก task
2. **Limited Agent Coverage** - Dev-Stack มีเพียง 7 agents เทียบกับ 112
3. **No Skill Library** - Dev-Stack มี 2 skills เทียบกับ 146

### Important
4. **No Plugin Marketplace** - Dev-Stack ไม่มี marketplace integration
5. **Limited Domain Coverage** - Dev-Stack focus เฉพาะ orchestration
6. **No Cost Optimization** - ไม่มี Haiku routing สำหรับ simple tasks

### Nice-to-Have
7. **No Interactive Installer** - Dev-Stack ต้องติดตั้ง manual
8. **No Category Organization** - Dev-Stack ไม่มี domain categorization

---

## Unique Features in wshobson/agents

### Smart Model Routing
```
opus     → Deep reasoning (security audits, architecture reviews)
sonnet   → Everyday coding (writing, debugging, refactoring)
haiku    → Quick tasks (docs, search, dependency checks)
inherit  → Use whatever model main conversation uses
```

### Tool Assignment by Role
- **Read-only agents**: `Read, Grep, Glob` - analyze without modifying
- **Research agents**: `Read, Grep, Glob, WebFetch, WebSearch` - gather information
- **Code writers**: `Read, Write, Edit, Bash, Glob, Grep` - create and execute
- **Documentation**: `Read, Write, Edit, Glob, Grep, WebFetch, WebSearch` - document with research

### Granular Tool Permissions
Each agent has minimal necessary permissions. Can extend by adding MCP servers or external tools.

---

## Recommendations for Dev-Stack

1. **Implement Three-Tier Model Strategy**
   - Map existing agents to appropriate tiers
   - thinker → Opus, code-builder → Sonnet, simple tasks → Haiku
   - Add model field to agent frontmatter

2. **Expand Agent Library**
   - Start with 10-15 high-value agents
   - Focus on domains not covered: security, data, DevOps
   - Create language-specific specialists

3. **Add Skill Library**
   - Convert common patterns into reusable skills
   - Implement progressive disclosure
   - Add skill triggers for auto-activation

4. **Create Plugin Marketplace Entry**
   - Package dev-stack as installable plugin
   - Add to awesome-claude-plugins index
   - Create installation wizard

---

## Actionable Items

- [ ] Add `model` field to all dev-stack agent definitions
- [ ] Map agents to model tiers (Opus/Sonnet/Haiku)
- [ ] Create 10+ new specialized agents
- [ ] Convert common workflows to skills
- [ ] Implement plugin marketplace integration
- [ ] Add cost optimization guide
