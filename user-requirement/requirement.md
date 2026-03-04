# User Requirement Document (URD)
## Dev-Stack Orchestrator Plugin

> **Document Version:** 2.1
> **Created:** 2026-03-04
> **Updated:** 2026-03-04
> **Project Type:** Claude Code Plugin Development
> **Priority:** High
> **Status:** Ready for Implementation

---

## Document Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  DOCUMENT PRIORITY (เมื่อมีข้อมูลขัดแย้ง)                    │
├─────────────────────────────────────────────────────────────┤
│  1. requirement.md (THIS FILE) ← PRIMARY SOURCE             │
│  2. spec.md              ← Technical specifications         │
│  3. tools_name.md        ← Tools reference                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Executive Summary

### 1.1 Project Overview

สร้าง **Claude Code Plugin** ที่ทำหน้าที่เป็น **Intelligent Workflow Orchestrator** สำหรับ:

1. **เลือก Agents อัตโนมัติ** - วิเคราะห์งานแล้วเลือก agents ที่เหมาะสมกับงานนั้นๆ
2. **ออกแบบ Workflow อิสระ** - สร้าง step-by-step workflow ที่ยืดหยุ่นตามความต้องการ
3. **ประสิทธิภาพสูง** - ประหยัด tokens และเวลา พร้อม reporting ที่ชัดเจน

**Core Flow**: `Task Input → Analysis → Tool Selection → Workflow → Execution → Report`

### 1.2 Core Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLUGIN CORE CONCEPT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "เลือก agents ต่างๆ ให้เหมาะกับงาน และออกแบบ step workflow    │
│   ได้อิสระ เพื่อให้การทำงานต่างๆ สำเร็จอย่างมีประสิทธิภาพ       │
│   ประหยัด tokens และเวลา"                                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TWO OPERATION MODES:                                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ MODE 1: /dev-stack:agents (Team Orchestrator)           │   │
│  │                                                          │   │
│  │ User Input → Create TEAM of Agents                      │   │
│  │                    ↓                                     │   │
│  │     ┌──────────┬──────────┬──────────┬──────────┐       │   │
│  │     │ Agent A  │ Agent B  │ Agent C  │ Agent D  │       │   │
│  │     │ (scope)  │ (scope)  │ (scope)  │ (scope)  │       │   │
│  │     ├──────────┼──────────┼──────────┼──────────┤       │   │
│  │     │ sub-task │ sub-task │ sub-task │ sub-task │       │   │
│  │     │ sub-task │ sub-task │ sub-task │ sub-task │       │   │
│  │     └──────────┴──────────┴──────────┴──────────┘       │   │
│  │                    ↓                                     │   │
│  │              Aggregated Result                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ MODE 2: /dev-stack:* (Scoped Single Agent)              │   │
│  │                                                          │   │
│  │ User Input → Create SINGLE Agent by Scope               │   │
│  │                    ↓                                     │   │
│  │     ┌────────────────────────────────────────┐          │   │
│  │     │         Agent (specific scope)         │          │   │
│  │     │                                        │          │   │
│  │     │  sub-task (within scope only)          │          │   │
│  │     │  sub-task (within scope only)          │          │   │
│  │     │  sub-task (within scope only)          │          │   │
│  │     └────────────────────────────────────────┘          │   │
│  │                    ↓                                     │   │
│  │              Scoped Result                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Operation Modes Comparison

| Aspect | `/dev-stack:agents` | `/dev-stack:*` (scoped) |
|--------|---------------------|-------------------------|
| **Agent Count** | Multiple (Team) | Single |
| **Scope Coverage** | Multi-scope | Single scope |
| **Sub-tasks** | Across all agents | Within agent scope only |
| **Use Case** | Complex, cross-functional tasks | Focused, single-domain tasks |
| **Example** | "เพิ่ม auth + UI สวยๆ + tests" | "แก้บัคใน login form" |

### 1.4 Problem Statement

| Pain Point | Current Situation | Desired Outcome |
|------------|-------------------|-----------------|
| **Tool Selection** | ต้องเลือก tools/skills เองทีละตัว | ระบบวิเคราะห์และเลือกอัตโนมัติ |
| **Workflow Management** | ไม่มี workflow ที่ชัดเจน | สร้าง step-by-step workflow อัตโนมัติ |
| **Context Overflow** | Token context ใช้เยอะเกินไป | ระบบจัดการ context มีประสิทธิภาพ |
| **Progress Tracking** | ไม่รู้ว่า agent ไหนทำอะไร | มี report แสดงผลชัดเจน |

### 1.5 Success Metrics

| ID | Criteria | Target |
|----|----------|--------|
| SC-001 | Tool selection accuracy | ≥ 90% |
| SC-002 | Scoped commands boundary compliance | 100% |
| SC-003 | Multi-scope agent spawning accuracy | 100% |
| SC-004 | Report completeness | 100% |
| SC-005 | Context restoration success rate | ≥ 95% |
| SC-006 | Real-time agent tracking | 100% |
| SC-007 | Budget limit enforcement | 100% |
| SC-008 | User onboarding time (via `/dev-stack:info`) | ≤ 5 minutes |
| SC-009 | Token reduction vs manual | ≥ 30% |
| SC-010 | Time reduction vs manual | ≥ 20% |

---

## 2. Core Principles (Mandatory)

### 2.1 Tool Priority Hierarchy

```
MCP Servers (72) > Plugins (15) > Skills (26) > Built-in (22)
```

- เลือก tool จาก priority สูงสุดก่อน
- Fallback ไป priority ถัดไปเมื่อ unavailable
- ต้อง prioritize **quality over speed** เสมอ

### 2.2 Development Methodologies

| Methodology | Purpose | When to Use |
|-------------|---------|-------------|
| **SDD** (Spec-Driven) | Primary approach | ทุก task |
| **DDD** (Domain Driven) | Domain modeling | Domain logic |
| **TDD** (Test Driven) | Implementation | Code changes |
| **BDD** (Behavior Driven) | Acceptance testing | User features |

### 2.3 Long-Running Task Support

- ✅ Task ไม่จำเป็นต้องจบในวันเดียว
- ✅ Context preservation สำหรับ switch tasks
- ✅ Branch switching ด้วย git worktrees
- ✅ Resume จาก checkpoint

---

## 3. Functional Requirements

### 3.1 Core Features

#### FR-001: Intelligent Task Analysis
```
INPUT:  คำสั่งภาษาธรรมชาติ (เช่น "เพิ่ม feature auth พร้อมหน้าบ้านสวยๆ")
OUTPUT:
  - Task breakdown เป็น sub-tasks
  - Tool/skill selection สำหรับแต่ละ sub-task
  - Workflow sequence ที่เหมาะสม
```

#### FR-002: Workflow Orchestration
```
CAPABILITY:
  - สร้าง workflow จาก task analysis
  - จัดลำดับการทำงานของ tools/skills
  - ควบคุมการทำงานของ sub-agents
  - จัดการ dependencies ระหว่าง tasks
```

#### FR-003: Context Management
```
OBJECTIVE: ลด token usage ตลอดการทำงาน
STRATEGY:
  - ใช้ hooks เพื่อ re-inject context หลัง compaction
  - เก็บเฉพาะข้อมูลจำเป็นใน context
  - Summarize intermediate results
  - ใช้ memory/knowledge graph เก็บข้อมูลถาวร
```

#### FR-004: Progress Reporting
```
OUTPUT FORMAT:
  - Real-time progress ของแต่ละ agent
  - Summary report เมื่องานเสร็จสิ้น
  - Error/exception reporting
  - Performance metrics
```

### 3.2 Command Structure

#### FR-005: Team Orchestrator Command (`/dev-stack:agents`)

**Purpose:** สร้าง **Team of Agents** สำหรับงานที่ซับซ้อนและครอบคลุมหลาย scope

```
┌─────────────────────────────────────────────────────────────────┐
│  /dev-stack:agents "<user intent>"                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT:  "เพิ่ม feature auth พร้อม UI สวยๆ และ tests"         │
│                                                                 │
│  ANALYSIS PHASE:                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Parse user intent                                      │   │
│  │ • Identify required scopes: [backend, frontend, testing] │   │
│  │ • Select appropriate agents for each scope               │   │
│  │ • Design workflow steps for each agent                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                      │
│  TEAM CREATION:                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ Dev Agent    │  │ UI Agent     │  │ QA Agent     │  │   │
│  │  │ (backend)    │  │ (frontend)   │  │ (testing)    │  │   │
│  │  ├──────────────┤  ├──────────────┤  ├──────────────┤  │   │
│  │  │ Sub-tasks:   │  │ Sub-tasks:   │  │ Sub-tasks:   │  │   │
│  │  │ • Setup auth │  │ • Design UI  │  │ • Unit tests │  │   │
│  │  │ • API routes │  │ • Components │  │ • Integration│  │   │
│  │  │ • Database   │  │ • Styling    │  │ • Coverage   │  │   │
│  │  │ • Middleware │  │ • Responsive │  │ • E2E        │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                      │
│  EXECUTION: Parallel or Sequential based on dependencies        │
│                          ↓                                      │
│  OUTPUT: Aggregated results + Full report                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior:**
```
User: /dev-stack:agents "เพิ่ม feature auth พร้อม UI สวยๆ"
  ↓
System:
  1. วิเคราะห์ intent → ระบุ scopes ที่เกี่ยวข้อง
  2. เลือก agents ที่เหมาะสม → สร้าง team
  3. ออกแบบ workflow อิสระ → กำหนด sub-tasks แต่ละ agent
  4. Execute → แต่ละ agent ทำ sub-tasks ของตัวเอง
  5. Monitor & report → ติดตาม progress ทุก agent
  6. Aggregate results → สรุปผลลัพธ์รวม
```

#### FR-006: Scoped Commands (Single Agent)

**Purpose:** สร้าง **Single Agent** ที่ทำงานเฉพาะใน scope ที่กำหนด

```
┌─────────────────────────────────────────────────────────────────┐
│  /dev-stack:<scope> "<user intent>"                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT:  /dev-stack:dev "แก้บัค login form validation"         │
│                                                                 │
│  ANALYSIS PHASE:                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Parse user intent                                      │   │
│  │ • Scope is FIXED to command (dev, docs, quality, git)   │   │
│  │ • Select tools/skills within scope only                 │   │
│  │ • Design workflow steps within scope                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                      │
│  SINGLE AGENT CREATION:                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │         Dev Agent (development scope only)        │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ Sub-tasks (ONLY within dev scope):                │  │   │
│  │  │ • Read login form code                            │  │   │
│  │  │ • Identify validation bug                         │  │   │
│  │  │ • Fix the bug                                     │  │   │
│  │  │ • Update related code                             │  │   │
│  │  │                                                   │  │   │
│  │  │ ❌ NOT included (outside scope):                  │  │   │
│  │  │   - Writing tests (use /dev-stack:quality)        │  │   │
│  │  │   - Updating docs (use /dev-stack:docs)           │  │   │
│  │  │   - Git commit (use /dev-stack:git)               │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                      │
│  OUTPUT: Scoped result + Scope-specific report                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Command | Scope | Agent Focus | Sub-tasks Limited To |
|---------|-------|-------------|---------------------|
| `/dev-stack:dev` | Development | Code changes only | Edit, refactor, implement features, fix bugs |
| `/dev-stack:git` | Version Control | Git operations only | Commit, push, PR, branch management |
| `/dev-stack:docs` | Documentation | Docs only | README, API docs, comments, guides |
| `/dev-stack:quality` | Quality Assurance | Testing only | Unit tests, integration, coverage, linting |
| `/dev-stack:info` | Information | Display info | Show plugin capabilities |
| `/dev-stack:simplify` | Analysis | Breakdown only | Task analysis without execution |

**Key Difference from `/dev-stack:agents`:**
```
/dev-stack:agents:
  - สร้างทีม agents หลายตัว
  - แต่ละ agent มี sub-tasks ตามหน้าที่ของตัวเอง
  - ครอบคลุมหลาย scope พร้อมกัน

/dev-stack:<scope>:
  - สร้าง agent เดียว
  - sub-tasks ทั้งหมดอยู่ใน scope ที่กำหนดเท่านั้น
  - ไม่ข้ามขอบเขตไปยัง scope อื่น
```

**Edge Case:**
```
IF scoped command receives multi-scope task:
  → Error message + Suggest using /dev-stack:agents instead
```

#### FR-007: Intelligent Agent Selection

**Purpose:** Plugin มีอิสระในการเลือก agents ที่เหมาะสมกับงาน

```python
# Pseudo-code for agent selection
def select_agents(user_intent: str, mode: CommandMode) -> List[Agent]:
    """
    Plugin ตัดสินใจเองว่าต้องใช้ agents ไหนบ้าง
    โดยพิจารณาจาก:
    """

    # 1. Intent Analysis
    required_capabilities = analyze_required_capabilities(user_intent)

    # 2. Scope Identification
    scopes = identify_scopes(user_intent)

    # 3. Agent Matching
    candidates = []
    for scope in scopes:
        matching_agents = find_agents_with_scope(scope)
        # เลือก agent ที่มี tools/skills เหมาะสมที่สุด
        best_agent = rank_and_select(matching_agents, required_capabilities)
        candidates.append(best_agent)

    # 4. Workflow Dependencies
    # ตรวจสอบว่า agents ต้องทำงานตามลำดับหรือขนานกัน
    execution_plan = determine_execution_order(candidates, dependencies)

    return candidates, execution_plan
```

**Agent Selection Criteria:**

| Criteria | Weight | Description |
|----------|--------|-------------|
| **Scope Match** | 40% | Agent ต้องมี scope ตรงกับงาน |
| **Tool Availability** | 25% | Agent ต้องมี tools ที่จำเป็น |
| **Skill Match** | 20% | Agent ต้องมี skills ที่เกี่ยวข้อง |
| **Token Efficiency** | 15% | เลือก agent ที่ประหยัด tokens |

#### FR-008: Flexible Workflow Design

**Purpose:** Plugin มีอิสระในการออกแบบ workflow steps

```
┌─────────────────────────────────────────────────────────────────┐
│              WORKFLOW DESIGN FREEDOM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Plugin สามารถ:                                                │
│                                                                 │
│  1. กำหนดจำนวน steps เอง                                       │
│     - ไม่ fixed เป็น 5 phases เสมอไป                           │
│     - ปรับตามความซับซ้อนของงาน                                  │
│                                                                 │
│  2. เลือก tools/skills เอง                                     │
│     - จาก pool ที่มี (22 built-in + 72 MCP + 26 skills)        │
│     - ใช้เฉพาะที่จำเป็น                                        │
│                                                                 │
│  3. กำหนด execution order เอง                                  │
│     - Sequential: A → B → C                                     │
│     - Parallel: A, B, C (พร้อมกัน)                             │
│     - Hybrid: A → (B, C ขนาน) → D                              │
│                                                                 │
│  4. ปรับ workflow ระหว่างทำงาน                                 │
│     - ถ้าพบปัญหา → ปรับ steps                                  │
│     - ถ้าได้ผลเร็ว → ข้าม steps ที่ไม่จำเป็น                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Workflow Templates (Examples):**

```yaml
# Template 1: Quick Bug Fix
workflow:
  name: quick_bugfix
  steps:
    - agent: dev
      subtasks:
        - read_code
        - identify_bug
        - fix_bug
      tools: [Read, Edit]
      estimated_tokens: 5000

# Template 2: Full Feature
workflow:
  name: full_feature
  steps:
    - phase: analysis
      agent: orchestrator
      subtasks: [analyze_codebase, identify_patterns]
    - phase: planning
      agent: orchestrator
      skills: [brainstorming, writing-plans]
    - phase: implementation
      agents: [dev, frontend]
      parallel: true
    - phase: testing
      agent: quality
      skills: [tdd, verification]
    - phase: documentation
      agent: docs

# Template 3: Code Review & Refactor
workflow:
  name: review_refactor
  steps:
    - agent: quality
      subtasks: [analyze_quality, identify_issues]
    - agent: dev
      subtasks: [refactor_code, optimize_performance]
    - agent: docs
      subtasks: [update_comments]
```

#### FR-009: Token & Time Optimization

**Purpose:** ประหยัด tokens และเวลาอย่างมีประสิทธิภาพ

```
┌─────────────────────────────────────────────────────────────────┐
│                 OPTIMIZATION STRATEGIES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TOKEN OPTIMIZATION:                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Context Compaction: บีบอัด context เก่า                 │   │
│  │ • Selective Loading: โหลดเฉพาะข้อมูลจำเป็น               │   │
│  │ • Memory Offload: เก็บข้อมูลใน memory แทน context        │   │
│  │ • Summarization: สรุปผลก่อนส่งต่อ                       │   │
│  │ • Parallel Execution: ลด overhead จากการรอ              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TIME OPTIMIZATION:                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Smart Agent Selection: เลือก agent ที่เร็วที่สุด       │   │
│  │ • Parallel Tasks: ทำงานพร้อมกันเมื่อเป็นไปได้            │   │
│  │ • Caching: เก็บผลลัพธ์ที่ใช้ซ้ำ                          │   │
│  │ • Early Termination: หยุดเมื่อได้ผลลัพธ์ที่ดีพอ           │   │
│  │ • Skip Unnecessary: ข้าม steps ที่ไม่จำเป็น              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### FR-010: Fully Configurable Plugin

**Purpose:** Plugin ต้อง configurable ได้ทุกอย่าง ไม่ยึดติดกับ tools list หรือ workflow ที่ fix ไว้

```
┌─────────────────────────────────────────────────────────────────┐
│              CONFIGURABILITY REQUIREMENTS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. TOOLS CONFIGURATION                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Tool list โหลดจาก config file (ไม่ hardcode)          │   │
│  │ • รองรับ tools ใหม่ที่เพิ่มเข้ามาภายหลัง                 │   │
│  │ • ปรับ tool priority ได้จาก config                      │   │
│  │ • Enable/disable tools รายตัวได้                        │   │
│  │ • เพิ่ม custom tools ได้                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  2. WORKFLOW CONFIGURATION                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Workflow templates โหลดจาก config files               │   │
│  │ • สร้าง custom workflow templates ได้                   │   │
│  │ • ปรับ phases/steps ได้ตามต้องการ                       │   │
│  │ • Import/export workflow configs                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  3. AGENT CONFIGURATION                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • กำหนด agent types ได้จาก config                       │   │
│  │ • ปรับ agent capabilities ได้                          │   │
│  │ • กำหนด max_turns ต่อ agent ได้                        │   │
│  │ • กำหนด allowed_tools ต่อ agent ได้                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  4. SCOPE CONFIGURATION                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • เพิ่ม/แก้ไข scopes ได้ (ไม่จำกัดแค่ dev,git,docs,qa)   │   │
│  │ • กำหนด tools สำหรับแต่ละ scope ได้                     │   │
│  │ • กำหนด skills สำหรับแต่ละ scope ได้                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Configuration File Structure:**

```yaml
# config/plugin.yaml
plugin:
  name: dev-stack
  version: 1.0.0
  auto_update_tools: true  # เปิด/ปิด auto-update tools

# Tools โหลดจากไฟล์แยก (auto-generated by script)
tools:
  config_file: ./config/tools.yaml
  auto_discover: true
  priority_order:
    - mcp_servers
    - plugins
    - skills
    - builtin
  # สามารถ override หรือเพิ่ม tools ได้
  custom_tools: []
  disabled_tools: []

# Scopes - ปรับได้ตามต้องการ
scopes:
  dev:
    description: "Development tasks"
    tools: [serena, filesystem, Read, Write, Edit]
    skills: [brainstorming, writing-plans, tdd]
    agent_config:
      max_turns: 20
  git:
    description: "Git operations"
    tools: [Bash]
    skills: [finishing-a-development-branch]
  docs:
    description: "Documentation"
    tools: [doc-forge, filesystem, Write]
    skills: [claude-md-management]
  quality:
    description: "Testing & Quality"
    tools: [Bash, serena]
    skills: [tdd, verification-before-completion]
  # เพิ่ม scope ใหม่ได้
  deploy:
    description: "Deployment"
    tools: [Bash]
    skills: []

# Workflows - โหลดจาก directory
workflows:
  templates_dir: ./config/workflows/
  default_workflow: standard

# Agents
agents:
  default_max_turns: 20
  default_timeout: 300
  spawn_timeout: 60

# Hooks
hooks:
  PreCompact: save_context
  SessionStart: restore_context
  SubagentStart: track_start
  SubagentStop: track_stop

# Reporting
reporting:
  webhook_url: null
  format: markdown
  include_metrics: true
```

#### FR-011: Tools Discovery & Auto-Update Script

**Purpose:** มี script สำหรับตรวจสอบและ update tools list จาก Claude Code อัตโนมัติ

```
┌─────────────────────────────────────────────────────────────────┐
│              TOOLS DISCOVERY SCRIPT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SCRIPT: scripts/update-tools.ts (หรือ .js)                    │
│                                                                 │
│  CAPABILITIES:                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. DISCOVER TOOLS                                        │   │
│  │    • Query Claude Code สำหรับ built-in tools           │   │
│  │    • Scan MCP servers จาก settings.json                │   │
│  │    • List installed plugins และ skills                 │   │
│  │    • Detect new tools ที่เพิ่มเข้ามา                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. UPDATE CONFIG FILES                                   │   │
│  │    • Generate tools.yaml จาก discovery result          │   │
│  │    • Merge กับ custom tools ที่มีอยู่                   │   │
│  │    • Preserve user modifications                        │   │
│  │    • Create backup ก่อน update                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3. VALIDATION                                            │   │
│  │    • Validate tool availability                         │   │
│  │    • Check MCP server status                            │   │
│  │    • Report missing/unavailable tools                   │   │
│  │    • Suggest fixes สำหรับ issues                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 4. OUTPUT FORMATS                                        │   │
│  │    • YAML (default)                                     │   │
│  │    • JSON (optional)                                    │   │
│  │    • Markdown report (for documentation)                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Script Usage:**

```bash
# ตรวจสอบและ update tools
npm run tools:update

# หรือ
node scripts/update-tools.js --update

# Options
node scripts/update-tools.js [options]

Options:
  --update, -u      Update tools.yaml after discovery
  --check, -c       Check only, don't update (dry-run)
  --format, -f      Output format: yaml, json, markdown (default: yaml)
  --output, -o      Output file path (default: ./config/tools.yaml)
  --verbose, -v     Show detailed output
  --backup, -b      Create backup before update (default: true)
  --help, -h        Show help
```

**Generated tools.yaml Structure:**

```yaml
# Auto-generated by update-tools script
# Generated: 2026-03-04T10:30:00Z
# Do not edit manually - use custom_tools section in plugin.yaml

metadata:
  last_updated: 2026-03-04T10:30:00Z
  total_tools: 145
  claude_code_version: "x.x.x"

builtin_tools:
  count: 22
  tools:
    - name: Task
      description: "Launch specialized agent for complex tasks"
    - name: Read
      description: "Read files"
    # ... all 22 built-in tools

mcp_servers:
  count: 9
  servers:
    serena:
      status: running
      tools_count: 26
      tools:
        - name: mcp__serena__find_symbol
          description: "Find symbol in codebase"
        # ... all serena tools
    filesystem:
      status: running
      tools_count: 15
      tools:
        - name: mcp__filesystem__read_text_file
          description: "Read text file"
        # ... all filesystem tools
    # ... all MCP servers

plugins:
  count: 15
  list:
    - typescript-lsp@claude-plugins-official
    - superpowers@claude-plugins-official
    # ... all plugins

skills:
  count: 26
  packages:
    superpowers:
      count: 14
      skills:
        - superpowers:brainstorming
        - superpowers:writing-plans
        # ... all superpowers skills
    plugin-dev:
      count: 8
      skills:
        - plugin-dev:create-plugin
        # ... all plugin-dev skills
    # ... all skill packages

# User customizations (preserved across updates)
custom_tools:
  # Add your custom tools here
  # - name: my_custom_tool
  #   type: mcp
  #   server: my_server
  #   description: "My custom tool"

disabled_tools:
  # Tools to exclude from selection
  # - tool_name_to_disable
```

**Hook Integration (Auto-run on SessionStart):**

```yaml
# ใน plugin.yaml
hooks:
  SessionStart:
    - action: check_tools_update
      condition: auto_update_tools == true
      handler: run_tools_discovery_script
```

**Implementation Details:**

```typescript
// scripts/update-tools.ts

interface ToolDiscovery {
  // 1. Query Claude Code built-in tools
  async discoverBuiltinTools(): Promise<Tool[]>

  // 2. Scan MCP servers from settings.json
  async discoverMcpTools(): Promise<McpServer[]>

  // 3. List installed plugins
  async discoverPlugins(): Promise<Plugin[]>

  // 4. List installed skills
  async discoverSkills(): Promise<Skill[]>

  // 5. Validate all discovered tools
  async validateTools(): Promise<ValidationResult>

  // 6. Generate config file
  async generateConfig(format: 'yaml' | 'json'): Promise<string>

  // 7. Merge with existing custom tools
  async mergeCustomTools(existing: Tool[], discovered: Tool[]): Promise<Tool[]>
}
```

---

## 4. User Stories (Mandatory)

### 4.1 P1 - Critical (2 stories)

#### US-1: Multi-Scope Task Orchestration

**As a** developer
**I want** to execute complex multi-scope tasks with a single command
**So that** I don't have to manually coordinate between different tools

**Acceptance Criteria:**
```
Given: ผู้ใช้สั่ง "/dev-stack:agents เพิ่ม OAuth2 พร้อมหน้า login"
When: plugin ประมวลผล
Then:
  - Task ถูกแตกเป็น sub-tasks (research → design → implement → test)
  - Sub-agents ทำงาน parallel ตาม scope
  - Final report แสดง agent ไหนทำอะไร
```

#### US-2: Single Scope Development

**As a** developer
**I want** plugin to auto-select appropriate tools for single-scope tasks
**So that** I can focus on the task, not tool selection

**Acceptance Criteria:**
```
Given: ผู้ใช้สั่ง "/dev-stack:dev แก้บัค login"
When: plugin ประมวลผล
Then:
  - Auto-select tools: serena → debugging → code edit → test
  - Stay within dev scope
  - No sub-agents spawned
```

### 4.2 P2 - Important (5 stories)

#### US-3: Git Operations with Safety

```
Given: ผู้ใช้สั่ง "/dev-stack:git push"
When: plugin ประมวลผล
Then:
  - Confirmation prompt ก่อน push
  - Pre-push checks (tests, lint)
  - Report หลัง push
```

#### US-4: Context Preservation

```
Given: ผู้ใช้ทำ task ที่ซับซ้อน
When: session compact หรือ restart
Then:
  - Context ถูก save ผ่าน PreCompact hook
  - Context ถูก restore ผ่าน SessionStart hook
  - สามารถทำงานต่อได้โดยไม่ต้อง re-analyze
```

#### US-5: Sub-Agent Tracking

```
Given: Sub-agents ทำงานอยู่
When: execution ดำเนินไป
Then:
  - Real-time status แสดงว่า agent ไหนทำอะไร
  - Execution time tracking
  - Summary เมื่อเสร็จ
```

#### US-6: Tool Budget Control

```
Given: config กำหนด max_turns: 20, allowed_tools: ["serena", "filesystem"]
When: agent ทำงาน
Then:
  - Agent หยุดภายใน 20 turns
  - Agent ใช้ได้แค่ tools ที่กำหนด
  - Warning เมื่อใกล้ถึง limit
```

#### US-7: Documentation & Quality

```
Given: ผู้ใช้สั่ง "/dev-stack:docs" หรือ "/dev-stack:quality"
When: plugin ประมวลผล
Then:
  - Auto-select doc-forge หรือ testing tools
  - Generate output ใน format ที่ถูกต้อง
```

### 4.3 P3 - Nice to Have (3 stories)

#### US-8: Task Breakdown (simplify)

```
Given: ผู้ใช้สั่ง "/dev-stack:simplify เพิ่ม OAuth2 พร้อม 2FA"
When: plugin ประมวลผล
Then:
  - Task ถูกแตกเป็น subtasks
  - แสดง dependency graph
  - แนะนำ execution order
```

#### US-9: External Reporting (Webhooks)

```
Given: config กำหนด webhook_url
When: task เสร็จ
Then:
  - Report ถูกส่งไป webhook
  - Format เป็น JSON หรือ Markdown
```

#### US-10: Dynamic Configuration

```
Given: CLI flag --max-turns 50
When: สั่ง task
Then:
  - Override config ด้วยค่าจาก flag
  - Merge priority: CLI > local > default
```

---

## 5. Available Tools Reference

### 5.1 Tool Inventory Summary

| Category | Count | Priority |
|----------|-------|----------|
| **MCP Server Tools** | 72 | Highest |
| **Plugin Tools** | 15 | High |
| **Skills** | 26 | Medium |
| **Built-in Tools** | 22 | Lowest |
| **Grand Total** | **145** | - |

### 5.2 MCP Server Tools (72) - Highest Priority

#### 5.2.1 serena (26 tools) - Code Analysis & Editing

| Tool | Description | Use Case |
|------|-------------|----------|
| `mcp__serena__activate_project` | Activate project by name or path | Start project |
| `mcp__serena__find_symbol` | Find symbol (class, method, function) | Code navigation |
| `mcp__serena__find_referencing_symbols` | Find symbols referencing a symbol | Dependency analysis |
| `mcp__serena__get_symbols_overview` | Get overview of symbols in file | Quick scan |
| `mcp__serena__replace_symbol_body` | Replace symbol body | Code editing |
| `mcp__serena__insert_after_symbol` | Insert code after symbol | Add code |
| `mcp__serena__insert_before_symbol` | Insert code before symbol | Add imports |
| `mcp__serena__rename_symbol` | Rename symbol across codebase | Refactoring |
| `mcp__serena__search_for_pattern` | Search pattern in codebase | Find code |
| `mcp__serena__find_file` | Find files matching pattern | File search |
| `mcp__serena__list_dir` | List directory contents | Navigation |
| `mcp__serena__write_memory` | Write project memory | Context persistence |
| `mcp__serena__read_memory` | Read memory file | Context restore |
| `mcp__serena__list_memories` | List all memories | Memory management |
| `mcp__serena__think_about_*` | Reflection tools | Decision making |

#### 5.2.2 filesystem (15 tools) - File Operations

| Tool | Description | Use Case |
|------|-------------|----------|
| `mcp__filesystem__read_text_file` | Read text file | Read code |
| `mcp__filesystem__write_file` | Write file | Create/update files |
| `mcp__filesystem__edit_file` | Edit file (line-based) | Modify files |
| `mcp__filesystem__list_directory` | List directory contents | Navigation |
| `mcp__filesystem__search_files` | Search files with glob pattern | Find files |
| `mcp__filesystem__create_directory` | Create directory | Setup structure |
| `mcp__filesystem__move_file` | Move or rename file | Organize files |
| `mcp__filesystem__read_multiple_files` | Read multiple files at once | Bulk read |
| `mcp__filesystem__directory_tree` | Show directory tree as JSON | Structure view |
| `mcp__filesystem__get_file_info` | Get file metadata | File info |

#### 5.2.3 memory (9 tools) - Knowledge Graph

| Tool | Description | Use Case |
|------|-------------|----------|
| `mcp__memory__create_entities` | Create entities in knowledge graph | Store info |
| `mcp__memory__create_relations` | Create relations between entities | Link info |
| `mcp__memory__search_nodes` | Search nodes | Find info |
| `mcp__memory__read_graph` | Read entire knowledge graph | View all |
| `mcp__memory__add_observations` | Add observations to entities | Update info |
| `mcp__memory__open_nodes` | Open nodes by name | Retrieve info |

#### 5.2.4 doc-forge (16 tools) - Document Processing

| Tool | Description | Use Case |
|------|-------------|----------|
| `mcp__doc-forge__document_reader` | Read documents (PDF, DOCX, TXT, HTML, CSV) | Read docs |
| `mcp__doc-forge__docx_to_pdf` | Convert DOCX to PDF | Format conversion |
| `mcp__doc-forge__excel_read` | Read Excel to JSON | Data extraction |
| `mcp__doc-forge__pdf_merger` | Merge PDFs | Combine docs |
| `mcp__doc-forge__pdf_splitter` | Split PDF | Split docs |
| `mcp__doc-forge__html_to_markdown` | Convert HTML to markdown | Format conversion |
| `mcp__doc-forge__format_convert` | Convert format (MD, HTML, XML, JSON) | Format conversion |

#### 5.2.5 context7 (2 tools) - Documentation Lookup

| Tool | Description | Use Case |
|------|-------------|----------|
| `mcp__context7__resolve-library-id` | Resolve library ID for docs | Find docs |
| `mcp__context7__query-docs` | Query library documentation | Get docs |

#### 5.2.6 Other MCP Tools

| Server | Tools | Description |
|--------|-------|-------------|
| **fetch** (1) | `fetch` | Fetch URL content |
| **web_reader** (1) | `webReader` | Read URL as markdown |
| **sequentialthinking** (1) | `sequentialthinking` | Step-by-step thinking |
| **4_5v_mcp** (1) | `analyze_image` | AI vision analysis |

### 5.3 Built-in Tools (22) - Lowest Priority

| Tool | Description | When to Use |
|------|-------------|-------------|
| `Read` | Read files | Fallback for file reading |
| `Write` | Write or overwrite files | Fallback for file writing |
| `Edit` | Edit files with string replacement | Fallback for editing |
| `Glob` | Find files by pattern | Fallback for file search |
| `Grep` | Search content in files | Fallback for content search |
| `Bash` | Execute bash commands | System operations |
| `Task` | Launch specialized agent | Spawn sub-agents |
| `TaskOutput` | Get output from task | Check sub-agent results |
| `WebSearch` | Search the web | Research |
| `Skill` | Invoke a skill | Use skills |
| `AskUserQuestion` | Ask user questions | Clarification |
| `TaskCreate/Get/Update/List` | Task management | Track progress |
| `EnterPlanMode/ExitPlanMode` | Planning mode | Design phase |
| `EnterWorktree` | Create isolated git worktree | Parallel development |

### 5.4 Skills (26) - Medium Priority

#### 5.4.1 superpowers (14 skills) - Development Workflows

| Skill | Description | When to Use |
|-------|-------------|-------------|
| `superpowers:brainstorming` | Requirements exploration | Before creative work |
| `superpowers:writing-plans` | Implementation planning | Before coding |
| `superpowers:test-driven-development` | TDD workflow | Implementation |
| `superpowers:systematic-debugging` | Debug workflow | Bug fixing |
| `superpowers:verification-before-completion` | Verify before completion | Before finishing |
| `superpowers:requesting-code-review` | Request code review | After implementation |
| `superpowers:executing-plans` | Execute implementation plans | Implementation |
| `superpowers:dispatching-parallel-agents` | Parallel task dispatch | Multi-task |
| `superpowers:subagent-driven-development` | Parallel agent execution | Complex tasks |

#### 5.4.2 Other Skills

| Package | Skills | Description |
|---------|--------|-------------|
| **plugin-dev** (8) | create-plugin, command-development, skill-development, agent-development, hook-development, mcp-integration, plugin-settings, plugin-structure | Plugin development |
| **frontend-design** (1) | frontend-design | UI/Frontend |
| **claude-md-management** (2) | revise-claude-md, claude-md-improver | CLAUDE.md management |
| **claude-code-setup** (1) | claude-automation-recommender | Setup recommendations |

### 5.5 Tool Selection by Scope

#### Development Scope (`/dev-stack:dev`)
```
Primary: serena (find_symbol, replace_symbol_body, search_for_pattern)
Secondary: filesystem (read_text_file, write_file, edit_file)
Fallback: Read, Write, Edit
Skills: brainstorming, writing-plans, tdd, systematic-debugging
```

#### Git Scope (`/dev-stack:git`)
```
Primary: Bash (git commands)
Secondary: filesystem (file operations for commits)
Skills: finishing-a-development-branch
```

#### Documentation Scope (`/dev-stack:docs`)
```
Primary: doc-forge (document_reader, format_convert)
Secondary: filesystem (write_file)
Fallback: Write
Skills: claude-md-management
```

#### Quality Scope (`/dev-stack:quality`)
```
Primary: Bash (test runners)
Secondary: serena (code analysis)
Skills: tdd, verification-before-completion, requesting-code-review
```

---

## 6. Technical Requirements

### 6.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Dev-Stack Plugin                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Commands  │  │    Skills   │  │    Hooks    │        │
│  │  (7 items)  │  │  (TBD)      │  │  (6 hooks)  │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │
│         └────────────────┼────────────────┘                │
│                          ▼                                 │
│              ┌─────────────────────┐                       │
│              │   Orchestrator      │                       │
│              │   Agent (Main)      │                       │
│              └──────────┬──────────┘                       │
│                         │                                  │
│         ┌───────────────┼───────────────┐                  │
│         ▼               ▼               ▼                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │ Sub-Agent  │  │ Sub-Agent  │  │ Sub-Agent  │          │
│  │  (Code)    │  │  (Docs)    │  │  (Test)    │          │
│  └────────────┘  └────────────┘  └────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Hook Requirements

| Hook | Purpose | Priority |
|------|---------|----------|
| **PreCompact** | Save context before compaction | P2 |
| **SessionStart** | Restore context on new session | P2 |
| **SubagentStart** | Track when sub-agent starts | P2 |
| **SubagentStop** | Track when sub-agent completes | P2 |
| **Stop** | Send webhook reports | P3 |
| **PostToolUse** | Check context size | P2 |

### 6.3 Configuration Requirements

```yaml
# ============================================================
# Dev-Stack Plugin Configuration
# ============================================================
# This file is fully configurable - no hardcoded values in code
# Tools are loaded from tools.yaml (auto-generated by update-tools script)

plugin:
  name: dev-stack
  version: 1.0.0

  # Auto-update tools on session start
  auto_update_tools: true
  tools_update_interval: "1d"  # Check daily

# ============================================================
# TOOLS CONFIGURATION (Dynamic - loaded from external file)
# ============================================================
tools:
  # Tools list loaded from this file (auto-generated)
  config_file: ./config/tools.yaml

  # Enable auto-discovery of new tools
  auto_discover: true

  # Priority order for tool selection
  priority_order:
    - mcp_servers    # Highest priority
    - plugins
    - skills
    - builtin        # Lowest priority

  # Custom tools to add (preserved across updates)
  custom_tools: []

  # Tools to disable/exclude
  disabled_tools: []

  # Fallback behavior when primary tool unavailable
  fallback_enabled: true

# ============================================================
# SCOPE DEFINITIONS (Fully configurable)
# ============================================================
# Add/modify/remove scopes as needed
scopes:
  dev:
    description: "Development tasks - code changes, features, bugs"
    tools:
      primary: [serena, filesystem]
      fallback: [Read, Write, Edit, Grep, Glob]
    skills: [brainstorming, writing-plans, tdd, systematic-debugging]
    agent_config:
      max_turns: 20
      timeout: 300

  git:
    description: "Git operations - commit, push, PR"
    tools:
      primary: [Bash]
      fallback: []
    skills: [finishing-a-development-branch]
    agent_config:
      max_turns: 10
      require_confirmation: true  # For write operations

  docs:
    description: "Documentation - README, API docs, guides"
    tools:
      primary: [doc-forge, filesystem]
      fallback: [Write, WebSearch]
    skills: [claude-md-management]
    agent_config:
      max_turns: 15

  quality:
    description: "Quality assurance - tests, coverage, linting"
    tools:
      primary: [Bash, serena]
      fallback: [Read, Grep]
    skills: [tdd, verification-before-completion, requesting-code-review]
    agent_config:
      max_turns: 25

  # Example: Add new scope
  # deploy:
  #   description: "Deployment operations"
  #   tools:
  #     primary: [Bash]
  #     fallback: []
  #   skills: []
  #   agent_config:
  #     max_turns: 10
  #     require_confirmation: true

# ============================================================
# WORKFLOW TEMPLATES
# ============================================================
workflows:
  # Directory containing workflow templates
  templates_dir: ./config/workflows/

  # Default workflow for /dev-stack:agents
  default_workflow: standard

  # Custom workflow templates (can add more)
  custom_templates: []

# ============================================================
# AGENT CONFIGURATION
# ============================================================
agents:
  # Default settings (can override per scope)
  default_max_turns: 20
  default_timeout: 300  # seconds

  # Sub-agent spawning
  spawn_enabled: true
  max_concurrent_agents: 5
  spawn_timeout: 60  # seconds

  # Agent tracking
  track_progress: true
  log_level: info  # debug, info, warn, error

# ============================================================
# HOOKS CONFIGURATION
# ============================================================
hooks:
  PreCompact:
    enabled: true
    action: save_context
    handler: ./hooks/pre-compact.ts

  SessionStart:
    enabled: true
    actions:
      - restore_context
      - check_tools_update  # Auto-update tools if enabled

  SubagentStart:
    enabled: true
    action: track_start
    handler: ./hooks/subagent-start.ts

  SubagentStop:
    enabled: true
    action: track_stop
    handler: ./hooks/subagent-stop.ts

  Stop:
    enabled: true
    action: send_webhook

  PostToolUse:
    enabled: true
    action: check_context_size
    threshold: 0.8  # Warn at 80% context usage

# ============================================================
# REPORTING CONFIGURATION
# ============================================================
reporting:
  # Webhook for external reporting
  webhook_url: null
  webhook_timeout: 30

  # Report format
  format: markdown  # markdown | json

  # Include metrics
  include_metrics: true
  include_token_usage: true
  include_timing: true

# ============================================================
# DEVELOPMENT METHODOLOGIES
# ============================================================
methodologies:
  default: SDD
  supported:
    - SDD  # Spec-Driven Development
    - DDD  # Domain Driven Design
    - TDD  # Test Driven Development
    - BDD  # Behavior Driven Development

# ============================================================
# CONTEXT MANAGEMENT
# ============================================================
context:
  # Context preservation
  save_dir: ./context/
  max_checkpoints: 10

  # Compaction settings
  auto_compact: true
  compact_threshold: 0.9  # Compact at 90% context

  # Memory integration
  use_memory_mcp: true
  memory_namespace: dev-stack
```

**Configuration Directory Structure:**

```
dev-stack/
├── config/
│   ├── plugin.yaml        # Main config (this file)
│   ├── tools.yaml         # Auto-generated tools list
│   └── workflows/         # Workflow templates
│       ├── standard.yaml
│       ├── quick-fix.yaml
│       └── full-feature.yaml
├── scripts/
│   └── update-tools.ts    # Tools discovery script
├── hooks/
│   ├── pre-compact.ts
│   ├── subagent-start.ts
│   └── subagent-stop.ts
└── context/               # Context checkpoints
    └── *.json
```

### 6.4 Context Preservation Format

```json
{
  "task_id": "uuid",
  "user_intent": "original request",
  "workflow_state": {
    "current_phase": "implementation",
    "completed_steps": ["analysis", "planning"],
    "pending_steps": ["testing", "docs"]
  },
  "sub_agents": [
    {
      "name": "dev-agent",
      "status": "completed",
      "result": "summary of work done",
      "duration_seconds": 120
    }
  ],
  "checkpoint": {
    "timestamp": "2026-03-04T10:30:00Z",
    "can_resume": true
  }
}
```

---

## 7. Edge Cases & Error Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| Scoped command แต่ task ต้องการหลาย scopes | Error + suggest `/dev-stack:agents` |
| Tool unavailable | Fallback to next priority |
| Sub-agent fail | Report error + halt execution |
| Config file invalid | Use default + warning |
| Context file corrupted | Warning + fresh session |
| Webhook unavailable | Log error + continue task |
| Agent ถึง max_turns | Halt + suggest increase limit |
| allowed_tools insufficient | Error + suggest add tools |
| Git write operation | Require user confirmation |
| Destructive operation | Show warning before execution |

---

## 8. Implementation Phases

### Phase 0: Configuration Infrastructure (Prerequisite)
- [ ] Create config directory structure
- [ ] Create `config/plugin.yaml` with default values
- [ ] Create `scripts/update-tools.ts` (Tools Discovery Script)
  - [ ] Discover built-in tools from Claude Code
  - [ ] Discover MCP tools from settings.json
  - [ ] Discover plugins and skills
  - [ ] Generate `config/tools.yaml`
  - [ ] Add backup/restore functionality
- [ ] Create config loader module
  - [ ] Load plugin.yaml
  - [ ] Load tools.yaml
  - [ ] Merge with defaults
  - [ ] Validate configuration
- [ ] Add npm scripts for tools management
  ```json
  {
    "tools:update": "node scripts/update-tools.js --update",
    "tools:check": "node scripts/update-tools.js --check",
    "tools:report": "node scripts/update-tools.js --format markdown"
  }
  ```

### Phase 1: Core Infrastructure (MVP)
- [ ] Plugin structure setup
- [ ] Configuration system (load from YAML files)
- [ ] Dynamic tool loading (no hardcoded tools)
- [ ] `/dev-stack:info` command (show current config)
- [ ] `/dev-stack:simplify` command
- [ ] Basic task analysis
- [ ] Tool selection logic (from config)

### Phase 2: Single Agent Commands
- [ ] `/dev-stack:dev` command (scope from config)
- [ ] `/dev-stack:docs` command
- [ ] `/dev-stack:quality` command
- [ ] `/dev-stack:git` command
- [ ] Scope boundary enforcement (configurable)

### Phase 3: Multi-Agent Orchestration
- [ ] `/dev-stack:agents` command
- [ ] Sub-agent spawning
- [ ] Progress monitoring
- [ ] Result aggregation
- [ ] Parallel execution

### Phase 4: Context Management
- [ ] PreCompact hook
- [ ] SessionStart hook (with tools update check)
- [ ] Memory integration
- [ ] Checkpoint system
- [ ] Token optimization

### Phase 5: Reporting & Polish
- [ ] Report generation
- [ ] Performance metrics
- [ ] Webhook integration
- [ ] Documentation
- [ ] Testing

### Phase 6: Developer Experience
- [ ] Config validation CLI
- [ ] Config migration scripts
- [ ] Example configs for common setups
- [ ] Interactive config generator
- [ ] Debug mode for troubleshooting

---

## 9. Constraints & Assumptions

### 9.1 Constraints

| Constraint | Description |
|------------|-------------|
| **Claude Code Version** | ต้อง compatible กับ Claude Code CLI เวอร์ชันปัจจุบัน |
| **Token Limit** | ต้องทำงานภายใน context window ที่มี |
| **Tool Availability** | ขึ้นกับ MCP servers ที่ติดตั้งไว้ |
| **Plugin API** | ต้อง follow Claude Code plugin specification |

### 9.2 Assumptions

- ✅ MCP servers 9 ตัวพร้อมใช้งาน (serena, filesystem, memory, doc-forge, context7, fetch, web_reader, sequentialthinking, 4_5v_mcp)
- ✅ superpowers skills พร้อมใช้งาน
- ✅ Git repository initialized
- ✅ Config files in YAML format

### 9.3 Out of Scope

- ❌ Custom MCP server creation
- ❌ Custom skill creation (use plugin-dev)
- ❌ CI/CD pipeline integration
- ❌ Multi-user collaboration
- ❌ Cloud deployment

---

## 10. Report Format

```markdown
# Dev-Stack Execution Report

## 📋 Task Summary
**Request:** [user request]
**Command:** [command used]
**Started:** [timestamp]
**Completed:** [timestamp]
**Duration:** [duration]

## 🔄 Workflow Executed

| Step | Agent | Tools Used | Status | Duration |
|------|-------|------------|--------|----------|
| 1. Analysis | Orchestrator | serena, filesystem | ✅ Complete | 2m 30s |
| 2. Planning | Orchestrator | brainstorming, writing-plans | ✅ Complete | 1m 45s |
| 3. Implementation | Code Agent | Edit, Write, TDD | ✅ Complete | 8m 20s |
| 4. Testing | Quality Agent | Bash, verification | ✅ Complete | 3m 15s |
| 5. Review | Orchestrator | code-review | ✅ Complete | 2m 00s |

## 📊 Token Usage
- **Total Used:** [X] tokens
- **Saved by Context Management:** [Y] tokens ([Z]% reduction)

## ✅ Deliverables
- [ ] Feature implemented: [details]
- [ ] Tests passing: [X]/[Y]
- [ ] Documentation updated: [details]
- [ ] Security review: [status]

## 📝 Notes & Learnings
- [Key decisions made]
- [Issues encountered and resolved]
- [Recommendations for future]
```

---

## 11. References

### 11.1 Documentation Links
- Claude Code Docs: https://code.claude.com/docs/
- CLI Reference: https://code.claude.com/docs/en/cli-reference
- Hooks Guide: https://code.claude.com/docs/en/hooks-guide
- Plugin Development: See `plugin-dev:*` skills

### 11.2 Related Files
- Tools Reference: `./tools_name.md`
- Feature Spec: `./spec.md`

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **Workflow** | ลำดับการทำงานของ tools/skills ที่จัดเรียงเพื่อบรรลุเป้าหมาย |
| **Orchestrator** | Agent หลักที่ควบคุมการทำงานของ agents อื่นๆ |
| **Sub-agent** | Agent ย่อยที่ทำงานภายใต้ orchestrator |
| **Context Management** | การจัดการ token/context window เพื่อประสิทธิภาพ |
| **Task Breakdown** | การแบ่ง task ใหญ่เป็น sub-tasks ย่อย |
| **Scope** | ขอบเขตการทำงาน (dev, git, docs, quality) |
| **SDD** | Spec-Driven Development |
| **TDD** | Test Driven Development |
| **DDD** | Domain Driven Design |
| **BDD** | Behavior Driven Development |

---

## 13. Changelog

### Version 2.1 (2026-03-04)
- ✨ **FR-010: Fully Configurable Plugin** - Plugin configurable ได้ทุกอย่าง ไม่ยึดติด tools list
- ✨ **FR-011: Tools Discovery Script** - Script ตรวจสอบและ update tools จาก Claude Code อัตโนมัติ
- 📊 **Expanded Configuration** - เพิ่ม scope, workflow, agent config ที่ปรับได้
- 📁 **Config Directory Structure** - โครงสร้างไฟล์ config ที่ชัดเจน
- 🔄 **Auto-update Tools** - Hook สำหรับ auto-update tools ตอน SessionStart
- 📝 **Phase 0 Added** - เพิ่ม phase สำหรับ configuration infrastructure
- 🛠️ **npm scripts** - เพิ่ม scripts สำหรับจัดการ tools

### Version 2.0 (2026-03-04)
- 🔄 **MAJOR RESTRUCTURE** - รวม spec.md และ tools_name.md เข้ากับ requirement.md
- ✨ เพิ่ม **Section 5: Available Tools Reference** - รายการ tools ทั้งหมด 145 ตัว
- ✨ เพิ่ม **Section 4: User Stories** - 10 user stories จาก spec.md
- ✨ เพิ่ม **Section 6: Technical Requirements** - Architecture, Hooks, Config
- ✨ เพิ่ม **Section 7: Edge Cases** - จัดการ error scenarios
- 📝 เพิ่ม Tool Selection by Scope - แนวทางการเลือก tools ตาม scope
- 📊 เพิ่ม Configuration Requirements - โครงสร้าง config file

### Version 1.1 (2026-03-04)
- ✨ เพิ่ม **Core Philosophy** section
- ✨ เพิ่ม **Operation Modes Comparison**
- ✨ เพิ่ม **FR-007 to FR-009**

### Version 1.0 (2026-03-04)
- 🎉 Initial document creation

---

## 14. Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| Requester | User | ✅ Approved | 2026-03-04 |
| Developer | AI Assistant | 🔄 Pending Implementation | - |

---

> **IMPORTANT:** เอกสารนี้เป็น **PRIMARY SOURCE** สำหรับการพัฒนา Dev-Stack Plugin
> - หากข้อมูลขัดแย้งกับ spec.md หรือ tools_name.md → ใช้ requirement.md
> - หากต้องการรายละเอียดเพิ่มเติม → ดู spec.md และ tools_name.md
