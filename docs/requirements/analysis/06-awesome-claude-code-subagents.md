# Analysis: awesome-claude-code-subagents
**Source**: https://github.com/VoltAgent/awesome-claude-code-subagents
**Type**: Subagent Collection (100+)
**Analyzed**: 2026-03-12

---

## Overview

awesome-claude-code-subagents เป็น definitive collection ของ Claude Code subagents ที่มีมากที่สุด (100+ agents) โดยจัดเป็น 10 categories และรองรับ plugin marketplace installation

---

## Key Features

### 1. Component Statistics
| Component | Count | Description |
|-----------|-------|-------------|
| Subagents | 100+ | Specialized AI assistants |
| Categories | 10 | Domain-specific groupings |
| Plugins | 10 | Installable plugin packages |

### 2. Categories Breakdown

#### 01. Core Development (voltagent-core-dev)
| Agent | Description |
|-------|-------------|
| api-designer | REST and GraphQL API architect |
| backend-developer | Server-side expert for scalable APIs |
| frontend-developer | UI/UX specialist for React, Vue, Angular |
| fullstack-developer | End-to-end feature development |
| graphql-architect | GraphQL schema and federation expert |
| microservices-architect | Distributed systems designer |
| mobile-developer | Cross-platform mobile specialist |
| ui-designer | Visual design and interaction specialist |
| websocket-engineer | Real-time communication specialist |
| electron-pro | Desktop application expert |

#### 02. Language Specialists (voltagent-lang)
- TypeScript, Python, Go, Rust, Java, JavaScript
- Swift, Kotlin, PHP, Ruby, C#, C++
- Framework experts: Next.js, React, Vue, Angular, Django, Rails, Spring Boot, Laravel
- 28 language/framework specialists

#### 03. Infrastructure (voltagent-infra)
- cloud-architect, devops-engineer, sre-engineer
- docker-expert, kubernetes-specialist
- terraform-engineer, terragrunt-expert
- database-administrator, network-engineer
- security-engineer, incident-responder
- 16 infrastructure specialists

#### 04. Quality & Security (voltagent-qa-sec)
- code-reviewer, architect-reviewer
- security-auditor, penetration-tester
- debugger, error-detective
- qa-expert, test-automator
- performance-engineer, chaos-engineer
- 14 quality/security specialists

#### 05. Data & AI (voltagent-data-ai)
- ai-engineer, ml-engineer, mlops-engineer
- data-engineer, data-scientist, data-analyst
- llm-architect, nlp-engineer
- prompt-engineer, database-optimizer
- 12 data/AI specialists

#### 06. Developer Experience (voltagent-dev-exp)
- build-engineer, cli-developer
- documentation-engineer, dx-optimizer
- git-workflow-manager, dependency-manager
- legacy-modernizer, refactoring-specialist
- mcp-developer, tooling-engineer
- 14 DX specialists

#### 07. Specialized Domains (voltagent-domains)
- blockchain-developer, fintech-engineer
- game-developer, embedded-systems
- iot-engineer, payment-integration
- quant-analyst, risk-manager
- seo-specialist, api-documenter
- 12 domain specialists

#### 08. Business & Product (voltagent-biz)
- product-manager, project-manager
- business-analyst, ux-researcher
- technical-writer, legal-advisor
- sales-engineer, scrum-master
- 11 business specialists

#### 09. Meta & Orchestration (voltagent-meta)
- agent-installer, agent-organizer
- multi-agent-coordinator, workflow-orchestrator
- context-manager, error-coordinator
- knowledge-synthesizer, task-distributor
- pied-piper, taskade
- 12 orchestration specialists

#### 10. Research & Analysis (voltagent-research)
- research-analyst, search-specialist
- trend-analyst, competitive-analyst
- market-researcher, data-researcher
- scientific-literature-researcher
- 7 research specialists

### 3. Smart Model Routing
| Model | Use Case | Examples |
|-------|----------|----------|
| `opus` | Deep reasoning | security-auditor, architect-reviewer, fintech-engineer |
| `sonnet` | Everyday coding | python-pro, backend-developer, devops-engineer |
| `haiku` | Quick tasks | documentation-engineer, seo-specialist, build-engineer |
| `inherit` | Use parent model | Context-dependent |

### 4. Tool Assignment Philosophy
| Agent Type | Tools |
|------------|-------|
| Read-only (reviewers, auditors) | Read, Grep, Glob |
| Research (analysts) | Read, Grep, Glob, WebFetch, WebSearch |
| Code writers (developers) | Read, Write, Edit, Bash, Glob, Grep |
| Documentation | Read, Write, Edit, Glob, Grep, WebFetch, WebSearch |

### 5. Subagent Storage Locations
| Type | Path | Availability | Precedence |
|------|------|---------------|------------|
| Project | `.claude/agents/` | Current project | Higher |
| Global | `~/.claude/agents/` | All projects | Lower |

### 6. Installation Methods
```bash
# Plugin marketplace
claude plugin marketplace add VoltAgent/awesome-claude-code-subagents
claude plugin install voltagent-lang

# Interactive installer
./install-agents.sh

# Standalone installer
curl -sO https://raw.githubusercontent.com/.../install-agents.sh
```

---

## Comparison with Dev-Stack

| Feature | Dev-Stack | awesome-claude-code-subagents |
|---------|-----------|-------------------------------|
| Agents | 7 | 100+ |
| Categories | 1 (orchestration) | 10 domains |
| Model Routing | No | Yes (opus/sonnet/haiku/inherit) |
| Tool Permissions | All tools | Minimal necessary |
| Installation | Manual | Plugin marketplace |
| Interactive Installer | No | Yes |

---

## Gaps Identified

### Critical
1. **No Model Routing** - Dev-Stack ไม่มี model field ใน agents
2. **Limited Agent Coverage** - Dev-Stack มี 7 agents เทียบกับ 100+
3. **No Categories** - Dev-Stack ไม่มี domain categorization

### Important
4. **No Tool Permission Control** - Dev-Stack ให้ agents ใช้ทุก tools
5. **No Plugin Marketplace** - Dev-Stack ต้องติดตั้ง manual
6. **No Interactive Installer** - Dev-Stack ไม่มี installation wizard

### Nice-to-Have
7. **No Language Specialists** - Dev-Stack ไม่มี language-specific agents
8. **No Business/Product Agents** - Dev-Stack ไม่ครอบคลุม business domain

---

## Unique Features in awesome-claude-code-subagents

### Subagent Template Structure
```markdown
---
name: subagent-name
description: When this agent should be invoked
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

You are a [role description]...

[Agent-specific checklists, patterns, guidelines]

## Communication Protocol
Inter-agent communication specifications...

## Development Workflow
Structured implementation phases...
```

### Independent Context Windows
- Every subagent has isolated context space
- Prevents cross-contamination between tasks
- Maintains clarity in primary conversation

### Agent Installer Subagent
```bash
# Use Claude Code to install agents
curl -s https://.../agent-installer.md -o ~/.claude/agents/agent-installer.md

# Then in Claude Code:
"Use the agent-installer to show me available categories"
"Find PHP agents and install php-pro globally"
```

### Subagent Catalog Tool
| Command | Description |
|---------|-------------|
| `/subagent-catalog:search <query>` | Find agents by name, description, category |
| `/subagent-catalog:fetch <name>` | Get full agent definition |
| `/subagent-catalog:list` | Browse all categories |
| `/subagent-catalog:invalidate` | Refresh cache |

---

## Recommendations for Dev-Stack

1. **Add Model Routing Field**
   - Add `model: opus|sonnet|haiku|inherit` to all agents
   - thinker → opus, code-builder → sonnet, simple tasks → haiku

2. **Implement Tool Permission Control**
   - thinker: Read, Grep, Glob (read-only)
   - researcher: Read, Grep, Glob, WebSearch, WebFetch
   - code-builder: Read, Write, Edit, Bash, Glob, Grep
   - verifier: Read, Glob, Grep, Bash

3. **Expand Agent Library**
   - Add language specialists (typescript-pro, python-pro, golang-pro)
   - Add infrastructure agents (devops-engineer, kubernetes-specialist)
   - Add security agents (security-auditor, penetration-tester)

4. **Create Plugin Marketplace Entry**
   - Package dev-stack as installable plugin
   - Create interactive installer
   - Add to Claude Code plugin marketplace

---

## Actionable Items

- [ ] Add `model` field to all dev-stack agent definitions
- [ ] Add `tools` restriction field to agent definitions
- [ ] Create 10+ new specialized agents
- [ ] Organize agents into categories
- [ ] Create plugin marketplace entry
- [ ] Build interactive installer
- [ ] Add subagent-catalog-like tool
