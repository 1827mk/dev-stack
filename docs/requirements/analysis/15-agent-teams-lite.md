# Analysis: Agent Teams Lite
**Source**: https://github.com/Gentleman-Programming/agent-teams-lite
**Analyzed**: 2026-03-12

---

## Executive Summary

**Agent Teams Lite** = Orchestrator + 9+ specialized sub-agents สำหรับ structured feature development

**Key Concept**: Orchestrator **NEVER does real work** — delegate everything to sub-agents with fresh context

**Philosophy**: "Because building without a plan is just vibe coding with extra steps."

---

## ที่มาและแนวคิดหลัก

### Core Architecture

```
YOU: "I want to add CSV export to the app"

ORCHESTRATOR (delegate-only, minimal context):
  → launches EXPLORER sub-agent     → returns: codebase analysis
  → shows you summary, you approve
  → launches PROPOSER sub-agent     → returns: proposal artifact
  → launches SPEC WRITER sub-agent  → returns: spec artifact
  → launches DESIGNER sub-agent     → returns: design artifact
  → launches TASK PLANNER sub-agent → returns: tasks artifact
  → shows you everything, you approve
  → launches IMPLEMENTER sub-agent  → returns: code written, tasks checked off
  → launches VERIFIER sub-agent     → returns: verification artifact
  → launches ARCHIVER sub-agent     → returns: change closed
```

---

## Sub-Agents (9+ Skills)

| Sub-Agent | Skill File | Purpose |
|-----------|------------|---------|
| **Init** | `sdd-init/SKILL.md` | Detect stack, bootstrap persistence, build skill registry |
| **Explorer** | `sdd-explore/SKILL.md` | Read codebase, compare approaches, identify risks |
| **Proposer** | `sdd-propose/SKILL.md` | Create `proposal.md` (intent, scope, rollback) |
| **Spec Writer** | `sdd-spec/SKILL.md` | Write delta specs (ADDED/MODIFIED/REMOVED) |
| **Designer** | `sdd-design/SKILL.md` | Create `design.md` (architecture decisions) |
| **Task Planner** | `sdd-tasks/SKILL.md` | Breakdown into phased task checklist |
| **Implementer** | `sdd-apply/SKILL.md` | Write code, mark tasks complete (v2.0: TDD support) |
| **Verifier** | `sdd-verify/SKILL.md` | Validate against specs (v2.0: real test execution) |
| **Archiver** | `sdd-archive/SKILL.md` | Merge delta specs, close change |
| **Skill Registry** | `skill-registry/SKILL.md` | Scan skills + conventions, write registry |

---

## Workflow DAG (Structured Phases)

```
proposal (root node)
    ↓
    ├── specs → ←┐
    │            │
    └── design ──┴→ tasks → apply → verify → archive
```

**Dependencies:**
- `specs` และ `design` ขนานกัน (parallel)
- `tasks` รอทั้งคู่
- `apply` implement tasks
- `verify` validate กับ specs
- `archive` merge และ close

---

## Key Features

### 1. Sub-Agent Result Contract

```json
{
  "status": "ok | warning | blocked | failed",
  "executive_summary": "short decision-grade summary",
  "detailed_report": "optional long-form analysis",
  "artifacts": [
    {
      "name": "design",
      "store": "engram | openspec | hybrid | none",
      "ref": "observation-id | file-path | null"
    }
  ],
  "next_recommended": ["tasks"],
  "risks": ["optional risk list"]
}
```

### 2. Artifact Persistence (Pluggable)

| Mode | Description | Files? |
|------|-------------|--------|
| **engram** | Cross-session, repo-clean (recommended) | No |
| **openspec** | File-based (`openspec/` folder) | Yes |
| **hybrid** | Both engram + files | Yes |
| **none** | Ephemeral | No |

**Default Policy:** Conservative
- If engram available → use engram
- If user asks for files → use openspec
- If user wants both → use hybrid
- Otherwise → none

### 3. Skill Registry (Auto-Discovery)

**Purpose:** สแกนหา coding skills + project conventions

```
1. Scan: ~/.claude/skills/, .cursorrules, CLAUDE.md, agents.md
2. Write: .atl/skill-registry.md (mode-independent, always created)
3. If engram available → save to engram too
4. Every sub-agent reads registry as Step 1 before working
```

**Read Priority:** Engram first (fast) → `.atl/skill-registry.md` fallback

**What it contains:**
- User skills table: trigger → skill name → path
- Project conventions found

### 4. Delta Specs (Smart Updates)

แทนที่จะเขียน spec ใหม่ทั้งหมด → เขียนเฉพาะที่เปลี่ยน:

```markdown
## ADDED Requirements
### Requirement: CSV Export
The system SHALL support exporting data to CSV format.

## MODIFIED Requirements
### Requirement: Data Export
The system SHALL support multiple export formats.
(Previously: The system SHALL support JSON export.)
```

เมื่อ archive → merge เข้า main specs อัตโนมัติ

---

## Commands

| Command | Purpose |
|---------|---------|
| `/sdd-init` | Initialize SDD context, detect stack, build skill registry |
| `/sdd-explore <topic>` | Investigate idea, read codebase, no files created |
| `/sdd-new <name>` | Start new change (exploration + proposal via sub-agents) |
| `/sdd-continue` | Run next dependency-ready phase via sub-agent |
| `/sdd-ff <name>` | Fast-forward (proposal → specs → design → tasks) |
| `/sdd-apply` | Implement tasks in batches, check off items |
| `/sdd-verify` | Validate implementation against specs |
| `/sdd-archive` | Close change, persist final state |
| `/skill-registry` | Create/update skill registry |

---

## Example Workflow

```bash
User: /sdd-new add-dark-mode

AI:  Launching explorer sub-agent...
     ✓ Codebase analyzed. React + Tailwind detected.
     ✓ Current theme: hardcoded light mode in globals.css

     Launching proposal sub-agent...
     ✓ proposal.md created
       Intent: Add dark mode toggle with system preference detection
       Scope: Theme context, toggle component, CSS variables

     Want me to continue with specs and design?

User: Go ahead

AI:  ✓ specs/ui/spec.md — 3 requirements, 7 scenarios
     ✓ design.md — CSS variables approach, React Context, localStorage
     ✓ tasks.md — 3 phases, 8 tasks

     Ready to implement. Run /sdd-apply to start.

User: /sdd-apply

AI:  Implementing Phase 1 (Foundation)...
     ✓ Loaded skills: react-19, typescript, tailwind-4
     ✓ 1.1 Created ThemeContext (React 19 patterns)
     ✓ 1.2 Added CSS custom properties via Tailwind theme
     ✓ 1.3 Added localStorage persistence

     3/8 tasks complete. Continue with Phase 2?
```

---

## File Structure (Generated)

```
openspec/
├── config.yaml                        # Project context
├── specs/                             # Source of truth
│   ├── auth/spec.md
│   ├── export/spec.md
│   └── ui/spec.md
└── changes/
    ├── add-csv-export/                # Active change
    │   ├── proposal.md
    │   ├── specs/                     # Delta specs
    │   │   └── export/spec.md
    │   ├── design.md
    │   └── tasks.md
    └── archive/                       # Completed changes
        └── 2026-02-16-fix-auth/
```

---

## Comparison: vs Other Approaches

| Aspect | Agent Teams Lite | OpenSpec | /dev-stack:agents |
|--------|------------------|----------|------------------|
| **Dependencies** | Zero (pure Markdown) | npm install | MCP tools |
| **Sub-agents** | ✅ True delegation | ❌ Inline | ❌ None |
| **Context usage** | Orchestrator lightweight | Everything in one context | Single context bundle |
| **Customization** | Edit Markdown | Edit YAML + rebuild | Edit config |
| **Tool support** | Any (Markdown) | 20+ via CLI | Any (MCP) |
| **Setup** | Copy files | CLI init | Hooks + config |
| **File creation** | Many (proposal, specs, design, tasks) | Many | Optional (--save only) |
| **Skill Registry** | ✅ Auto-discovery | ❌ No | ❌ No |

---

## Key Differences from /dev-stack:agents

### Philosophy

| Aspect | Agent Teams Lite | /dev-stack:agents |
|--------|------------------|------------------|
| **Orchestrator role** | Delegate-only | Context prep only |
| **Execution** | Sub-agents do everything | AI executes directly |
| **Workflow** | SDD phases (exploration → archive) | THINK → GATHER → ANALYZE → PLAN |
| **Artifacts** | proposal.md, specs/, design.md, tasks.md | Context bundle (or .md) |
| **Files created** | Many by default | Optional (document mode only) |

### When to Use Which

| Scenario | Use |
|----------|-----|
| **Large feature, need full documentation** | Agent Teams Lite |
| **Team collaboration, audit trail** | Agent Teams Lite |
| **Quick bug fix, need context fast** | /dev-stack:agents |
| **Don't want file clutter** | /dev-stack:agents (interactive mode) |
| **Want AI to execute directly** | /dev-stack:agents |

---

## Strengths

### ✅ ทาง Agent Teams Lite ทำดี

1. **Sub-Agent Delegation**
   - Fresh context per phase
   - Specialized skills for each phase
   - Orchestrator stays lightweight

2. **Skill Registry**
   - Auto-discover coding skills
   - Project conventions scanning
   - Every sub-agent loads before working

3. **Structured Workflow**
   - DAG-based dependencies
   - Parallel phases (spec ∥ design)
   - Clear progression

4. **Artifact Persistence Options**
   - engram (repo-clean)
   - openspec (file-based)
   - hybrid (both)
   - none (ephemeral)

5. **Delta Specs**
   - Track changes only
   - Auto-merge on archive
   - Clean audit trail

6. **Zero Dependencies**
   - Pure Markdown files
   - No npm, no Python, no Docker
   - Works everywhere

---

## Weaknesses

### ❌ จุดที่ Agent Teams Lite อาจด้อย

1. **File Clutter**
   - Creates many files by default
   - proposal.md, specs/, design.md, tasks.md
   - Can overwhelm simple projects

2. **Over-Engineering for Small Tasks**
   - Full SDD workflow for simple bug fix?
   - Too much overhead

3. **No MCP Tool Integration**
   - Doesn't leverage MCP tools
   - Manual file reading only

4. **Steeper Learning Curve**
   - 9+ sub-agents to understand
   - Commands to memorize

5. **No Context Engineering**
   - Focus on orchestration, not context prep
   - Doesn't minimize context

---

## What /dev-stack:agents Can Learn

### High Value Adoption

| Concept | จาก Agent Teams Lite | ปรับใช้ยังไง |
|---------|---------------------|----------------|
| **Skill Registry** | Auto-discover skills | Scan MCP tools + conventions |
| **Sub-Agent Pattern** | Delegate to specialists | Use for complex tasks only |
| **Delta Approach** | Track changes only | Delta context, not full specs |
| **Persistence Modes** | engram/openspec/hybrid/none | Memory MCP/File/None |
| **DAG Dependencies** | Parallel phases | Parallel gather operations |

### Keep /dev-stack:agents Philosophy

| Aspect | Keep Reason |
|---------|-------------|
| **Context Engineering focus** | Prep, not execute |
| **Interactive mode (no files)** | No file clutter |
| **Mode detection** | Auto-detect user intent |
| **MCP-first** | Leverage existing tools |
| **Lightweight** | Single command |

---

## Recommended Hybrid Approach

```
/dev-stack:agents v2 (Best of Both)

KEEP FROM v1:
• MCP-first (Serena, Memory, Sequential Thinking)
• Context Engineering philosophy
• Interactive mode (no files)
• Mode detection

ADD FROM Agent Teams Lite:
• Skill Registry (MCP tools + conventions scan)
• Sub-agent delegation (complex tasks only)
• Memory MCP persistence (modes)
• Structured phase output format

WORKFLOW:
1. MODE DETECT (interactive/document)
2. BUILD SKILL REGISTRY (MCP + conventions)
3. THINK (Sequential Thinking)
4. GATHER (Serena → Filesystem)
5. ANALYZE (Memory MCP + Registry)
6. PLAN (Structured output)
7. OUTPUT
   ├─ Interactive: Return context
   └─ Document: Save .md OR persist to Memory MCP

COMPLEX TASKS → Delegate to sub-agents
SIMPLE TASKS → Direct context prep
```

---

## Sources

- Repository: https://github.com/Gentleman-Programming/agent-teams-lite
- Documentation: README.md
- Engram Integration: https://github.com/Gentleman-Programming/engram

---

## Conclusion

**Agent Teams Lite** เป็น orchestrator ที่เน้น **sub-agent delegation** และ **structured documentation**

**แตกต่างจาก /dev-stack:agents** ที่เน้น **context preparation** และ **AI execution directly**

**ควร adopt:**
- Skill Registry concept
- Sub-agent pattern (สำหรับงานซับซ้อน)
- Persistence modes
- Delta approach

**รักษา:**
- Context Engineering philosophy
- Interactive mode (no file clutter)
- MCP-first approach
- Mode detection

---

**Status**: ✅ Analysis Complete
**Recommendation**: เก็บ concepts ดีๆ ไว้ evolve /dev-stack:agents v2
