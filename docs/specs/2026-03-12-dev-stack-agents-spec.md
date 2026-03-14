# Dev-Stack: Context Engineering + SDD Orchestrator

**Version**: 3.1.0
**Status**: Design Spec - Ready for Implementation
**Updated**: 2026-03-12
**Changes**: Added hook scripts, command templates, implementation priority

---

## Overview

Dev-Stack provides **two complementary systems** for different use cases:

### System A: Context Engineering (Fast, No Files)
```
/dev-stack:agents [task]    Think + Plan → Return context for AI execution
```
- **Use for**: Quick bug fixes, code reviews, 80% of daily tasks
- **Creates**: 0 files (clean repo)
- **Output**: Context bundle → AI executes immediately

### System B: SDD Workflow (Documentation, Files)
```
/dev-stack:plan [spec]      Create implementation_plan.md
/dev-stack:tasks [plan]     Generate task_list.md
```
- **Use for**: Large features, team collaboration, audit trails
- **Creates**: Markdown files in `.dev-stack/specs/`
- **Output**: Complete documentation

### Support Commands
```
/dev-stack:status           Show current state (context-aware)
/dev-stack:registry         Manual rebuild
```

---

## Philosophy

| Aspect | Context Engineering | SDD Workflow |
|--------|---------------------|--------------|
| **Goal** | Prepare context for AI | Document full specification |
| **Speed** | Seconds (5-30s) | Minutes (2-5min) |
| **Files** | 0 | 2-4 files |
| **Use case** | 80% daily work | 20% complex features |
| **Audience** | You + AI | Team + Future you |

**Core Principle**: **Context > Prompts**. We prepare optimal context, not execute code ourselves.

---

## Command Reference

| Command | Purpose | Mode | Files? | When to Use |
|---------|---------|------|--------|-------------|
| **`/dev-stack:agents [task]`** | Context preparation | Interactive | ❌ No | Quick fixes, reviews, research |
| **`/dev-stack:plan [spec]`** | Technical implementation plan | Document | ✅ Yes | Large features, architecture |
| **`/dev-stack:tasks [plan]`** | Task breakdown | Document | ✅ Yes | Implementation checklist |
| **`/dev-stack:status`** | Show current state | - | - | Check what's going on |
| **`/dev-stack:registry`** | Rebuild registry | - | ✅ Yes | After MCP/tool changes |

---

## Comparison: Spec-Kit vs Agent Teams Lite vs Us

| Feature | Spec-Kit | Agent Teams Lite | **Ours** |
|---------|----------|------------------|----------|
| **Commands** | 6 steps | 9 sub-agents | **2 systems + 2 support** |
| **Workflow** | constitution→specify→clarify→plan→tasks→implement | SDD (exploration→archive) | **agents → plan → tasks** |
| **Execution** | ✅ Executes code | ✅ Executes code | ❌ **Context only** |
| **Files** | Always created | Always (4+) | **Optional** |
| **Registry** | ❌ No | ✅ Yes | **✅ Built-in** |
| **Time (simple)** | ~5 min | ~15 min | **~30 sec** |
| **Time (complex)** | ~20 min | ~45 min | **~5 min** |
| **Dependencies** | npm install | None | MCP servers |
| **Learning curve** | Medium | High | **Low** |

### Key Differentiators

1. **No Execution** - We prepare context, AI executes
2. **Two Systems** - Fast path (agents) + Documentation path (plan/tasks)
3. **Optional Files** - Default = no files (clean repo)
4. **MCP-First** - Uses existing tools (Serena, Memory, Sequential Thinking)
5. **Auto-Registry** - Built into workflow

---

## Architecture

### System A: Context Engineering Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  /dev-stack:agents [task]                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USER REQUEST: "fix email bug"                                  │
│     ↓                                                            │
│  THINK (Sequential Thinking MCP)                                │
│  "What's broken? What do I need to check?"                      │
│     ↓                                                            │
│  GATHER (Serena + Filesystem MCP)                               │
│  • Search patterns → Find files → Read content                  │
│     ↓                                                            │
│  ANALYZE (Memory MCP + DNA)                                     │
│  • Check previous patterns • Identify tech stack               │
│     ↓                                                            │
│  PLAN                                                            │
│  • Root cause • Fix approach • Constraints                      │
│     ↓                                                            │
│  OUTPUT                                                          │
│  ✓ Context bundle returned to AI                               │
│  ✓ NO file created                                              │
│  ✓ AI executes immediately                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### System B: SDD Workflow Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  /dev-stack:plan → /dev-stack:tasks                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1: PLAN                                                  │
│  /dev-stack:plan "add authentication"                           │
│     ↓                                                            │
│  THINK → GATHER → ANALYZE (same as agents)                      │
│     ↓                                                            │
│  OUTPUT: .dev-stack/specs/auth/implementation_plan.md           │
│  • Technical approach                                           │
│  • Architecture decisions                                       │
│  • Tech stack selection                                         │
│  • Security considerations                                      │
│                                                                 │
│  PHASE 2: TASKS                                                 │
│  /dev-stack:tasks "add authentication"                          │
│     ↓                                                            │
│  Load: implementation_plan.md                                   │
│     ↓                                                            │
│  BREAKDOWN                                                       │
│  • Phases → Steps → Dependencies                                │
│  • Risk assessment                                              │
│  • Validation criteria                                          │
│     ↓                                                            │
│  OUTPUT: .dev-stack/specs/auth/task_list.md                     │
│  • Phase 1: Database (3 tasks)                                  │
│  • Phase 2: Backend (5 tasks)                                   │
│  • Phase 3: Frontend (4 tasks)                                  │
│  • Phase 4: Testing (3 tasks)                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
.claude-plugin/
├── commands/
│   ├── dev-stack-agents.md         # /dev-stack:agents
│   ├── dev-stack-plan.md           # /dev-stack:plan
│   ├── dev-stack-tasks.md          # /dev-stack:tasks
│   ├── dev-stack-status.md         # /dev-stack:status
│   └── dev-stack-registry.md       # /dev-stack:registry
├── hooks/
│   ├── scripts/
│   │   ├── agents-mode-detect.py   # Detect agents command
│   │   ├── agents-output.sh        # Handle agents output
│   │   ├── plan-workflow.py        # Plan workflow logic
│   │   ├── tasks-workflow.py       # Tasks workflow logic
│   │   └── registry-builder.sh     # Registry building
│   └── config.yaml                 # Hook configuration
├── config/
│   └── agents.yaml                 # Main configuration
└── skills/
    └── (existing skills)

.dev-stack/
├── specs/                          # SDD Workflow output only
│   └── [topic]/
│       ├── implementation_plan.md  # From /dev-stack:plan
│       └── task_list.md            # From /dev-stack:tasks
├── registry.md                     # Auto-created by agents
├── dna/
│   └── project.md                  # Project DNA
└── state/
    └── last-agents-run.json        # Last run state
```

**Note**: `specs/` directory ONLY created by SDD workflow. `/dev-stack:agents` NEVER creates files.

---

## System A: /dev-stack:agents

### Workflow Detail

#### Phase 1: THINK (Sequential Thinking MCP)

**Purpose**: Break down problem before gathering context

```
Tool: mcp__sequentialthinking__sequentialthinking (if available)
Fallback: Direct reasoning

Process:
1. "User wants to [task description]"
2. "What do I need to understand?"
3. "What could go wrong?"
4. "What information is most critical?"
```

**Output**: Reasoned analysis of task complexity

#### Phase 2: GATHER (Serena + Filesystem MCP)

**Purpose**: Collect all relevant codebase information

```
Tool: mcp__serena__ (preferred) or filesystem (fallback)

Step 1: Pattern Search
├─ serena:search_for_pattern("[keywords]", ".")
└─ Returns: List of files matching the pattern

Step 2: Symbol Overview
├─ serena:get_symbols_overview("[target-file]")
└─ Returns: Classes, functions, their relationships

Step 3: Symbol Details
├─ serena:find_symbol("[symbol-name]", "[file]")
└─ Returns: Full symbol implementation with docs

Step 4: Referencing Symbols
├─ serena:find_referencing_symbols("[symbol]", "[file]")
└─ Returns: All places that use this symbol

Step 5: Read Files
├─ filesystem:read_multiple_files([file-list])
└─ Returns: Content of all relevant files
```

**Fallback Strategy**:
```
IF serena available:
  → Use serena tools (fast, semantic)
ELSE:
  → Use filesystem:directory_tree + grep
  → Notify user: "⚠️  Basic search mode (install Serena for better results)"
```

#### Phase 3: ANALYZE (Memory MCP + DNA)

**Purpose**: Understand current state + check learned patterns

```
Tool: memory MCP + internal analysis

Step 1: Check DNA
├─ Read: .dev-stack/dna/project.md
└─ Returns: Project structure, patterns, conventions

Step 2: Search Memory
├─ memory:search_nodes({query: "[task keywords]"})
└─ Returns: Previous similar tasks + solutions

Step 3: Identify Current State
├─ Analyze gathered code
├─ Identify tech stack
├─ Recognize patterns
└─ Returns: Current architecture assessment

Step 4: Find Patterns
├─ Extract coding conventions
├─ Identify naming patterns
├─ Note architectural decisions
└─ Returns: Style guide observations
```

#### Phase 4: PLAN (Structured Planning)

**Purpose**: Create clear, executable plan

**Output Structure**:
```markdown
# Context Bundle: [Task Name]

**Generated**: [Timestamp]
**Project**: [Project Name]
**Task ID**: [Unique ID]

---

## 1. Project Overview

### Tech Stack
- **Frontend**: [Framework + Version]
- **Backend**: [Framework + Language]
- **Database**: [ORM + Database]

### Architecture
- **Pattern**: [MVC | Microservices | Monolith]
- **Structure**: [Key directories]
- **Conventions**: [Naming, organization]

### Current State
- ✅ [What exists]
- ❌ [What's missing]
- ⚠️  [What needs attention]

---

## 2. Task Analysis

### User Request
> "[Original user request]"

### Task Type
- **Category**: [Bug Fix | Feature | Refactor | Test | Docs]
- **Complexity**: [Simple | Medium | Complex]

---

## 3. Gathered Information

### Relevant Files Found
#### File: [path/to/file.ts]
```typescript
[code snippet]
```
**Purpose**: [What this file does]
**Issues**: [Problems identified]

### Dependencies Identified
- **Internal**: [Depends on these files]
- **External**: [NPM packages, APIs]

---

## 4. Root Cause Analysis (for Bug Fixes)

### Problem
[Description of what's broken]

### Root Cause
[The underlying issue]

---

## 5. Execution Plan

### Phase 1: [Name]
1. [ ] [Specific action]
2. [ ] [Specific action]

### Phase 2: [Name]
...

---

## 6. Constraints & DO NOT

### ✅ DO
- [Pattern/Convention to follow]
- [Files to modify]
- [Approaches to use]

### ❌ DO NOT
- [Anti-patterns to avoid]
- [Files NOT to touch]
- [Approaches that won't work]

---

## 7. Token Budget

- **Context Used**: ~[X] tokens
- **Remaining for Execution**: ~[Y] tokens

---

**PLEASE PROCEED**

[Clear, actionable next step]

*Context prepared by /dev-stack:agents*
```

#### Phase 5: OUTPUT (Return Context Only)

**Interactive Mode (Only Mode)**:
```bash
# NO FILE CREATED
# Return context to AI in memory

echo "✓ Context prepared"
echo "✓ Task: $TASK_TYPE"
echo "✓ Scope: $SCOPE"
echo ""

# Return context to conversation
cat /tmp/agents-context.txt

# AI continues immediately without file clutter
```

**Terminal Output**:
```
✓ Context prepared
✓ Task: Fix email bug
✓ Root cause: Missing error handling
✓ Plan: Add try-catch + logging

[Context injected - AI can proceed]
```

#### Auto-Registry Integration (After Output)

**Trigger**: After `/dev-stack:agents` completes

**Configuration**:
```yaml
# config/agents.yaml
workflow:
  auto_registry: true        # Enable/disable
  registry_cache: 3600       # Seconds (1 hour)
  registry_async: false      # Run synchronously
```

**Logic**:
```bash
# After context output, check if registry needs rebuild
LAST_BUILD=$(stat -f %m .dev-stack/registry.md 2>/dev/null || echo "0")
NOW=$(date +%s)
AGE=$((NOW - LAST_BUILD))

if [[ $AGE -gt $REGISTRY_CACHE ]]; then
    # Run registry builder
    .claude-plugin/hooks/scripts/registry-builder.sh
fi
```

**Behavior**:
- Runs **after** context is returned (non-blocking if async)
- Checks cache duration before rebuilding
- Updates `.dev-stack/registry.md`
- Stores to Memory MCP (if available)
- Shows: `✓ Registry updated (cached for 1 hour)`

---

## System B: /dev-stack:plan

### Workflow Detail

#### Input
- User provides: feature/requirement description
- OR: Loads from existing `/dev-stack:agents` output

#### Process

**Phase 1: THINK** (same as agents)
**Phase 2: GATHER** (same as agents)
**Phase 3: ANALYZE** (same as agents)

**Phase 4: TECHNICAL PLAN**

Output: `implementation_plan.md`

```markdown
# Implementation Plan: [Feature Name]

**Generated**: [Timestamp]
**Author**: /dev-stack:plan
**Status**: Draft

---

## Executive Summary

[One-paragraph overview of what we're building and why]

---

## Requirements Overview

### Functional Requirements
1. [REQ-001] [Requirement description]
2. [REQ-002] [Requirement description]

### Non-Functional Requirements
- Performance: [Requirements]
- Security: [Requirements]
- Scalability: [Requirements]

---

## Technical Approach

### Architecture Decision

**Option Chosen**: [Describe approach]

**Why this approach**:
- Reason 1
- Reason 2

**Alternatives Considered**:
- Option A: [Why rejected]
- Option B: [Why rejected]

---

## Tech Stack

### Frontend
- Framework: [Name + Version]
- UI Library: [Name]
- State Management: [Name]

### Backend
- Framework: [Name + Version]
- API Style: [REST | GraphQL | RPC]
- Auth: [Method]

### Database
- ORM: [Name]
- Database: [Name]
- Hosting: [Local | Cloud]

---

## Data Model

### New Tables/Collections

#### [Table Name]
```sql
CREATE TABLE [table_name] (
  id SERIAL PRIMARY KEY,
  [field1] [type],
  [field2] [type],
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Relationships**:
- Belongs to: [Other table]
- Has many: [Other table]

---

## API Design

### New Endpoints

#### POST /api/[resource]
**Purpose**: [What it does]

**Request**:
```json
{
  "field1": "value",
  "field2": "value"
}
```

**Response**:
```json
{
  "id": 123,
  "field1": "value",
  "created_at": "2026-03-12T..."
}
```

**Errors**:
- 400: [Validation error]
- 401: [Auth error]
- 409: [Conflict]

---

## Security Considerations

- [Security consideration 1]
- [Security consideration 2]
- [Security consideration 3]

---

## Implementation Phases

### Phase 1: [Name] (Priority: High)
**Goal**: [What this phase accomplishes]

**Technical Tasks**:
- [ ] [Task 1 with file location]
- [ ] [Task 2 with file location]

**Dependencies**: [What needs to be done first]
**Estimated**: [X hours/days]

### Phase 2: [Name] (Priority: Medium)
...

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk 1] | [High/Med/Low] | [How to address] |
| [Risk 2] | [High/Med/Low] | [How to address] |

---

## Testing Strategy

### Unit Tests
- [What to test]

### Integration Tests
- [What to test]

### E2E Tests
- [What to test]

---

## Rollout Plan

1. [Step 1]
2. [Step 2]
3. [Step 3]

---

## Open Questions

- [Question 1]
- [Question 2]

---

*Generated by /dev-stack:plan*
```

---

## System B: /dev-stack:tasks

### Workflow Detail

#### Input
- Loads: `implementation_plan.md` from `/dev-stack:plan`

#### Process

**Phase 1: LOAD PLAN**
```bash
# Read existing plan
PLAN_FILE=".dev-stack/specs/[topic]/implementation_plan.md"
# Parse phases, requirements, technical approach
```

**Phase 2: BREAKDOWN**
- For each phase → create actionable tasks
- Identify dependencies between tasks
- Add validation criteria
- Estimate effort

**Phase 3: OUTPUT**

Output: `task_list.md`

```markdown
# Task List: [Feature Name]

**Generated**: [Timestamp]
**Based on**: implementation_plan.md
**Status**: Ready for Implementation

---

## Overview

**Total Phases**: [X]
**Total Tasks**: [Y]
**Estimated Effort**: [Z hours]

---

## Phase 1: [Phase Name]

**Goal**: [From implementation plan]
**Estimated**: [X hours]
**Priority**: High

### Tasks

#### [1.1] [Task Name]
**File**: [path/to/file.ts]
**Description**: [What to do]
**Acceptance Criteria**:
- [ ] [Criteria 1]
- [ ] [Criteria 2]

**Dependencies**: None
**Assigned**: [Who]
**Status**: ☐ Pending

---

#### [1.2] [Task Name]
**File**: [path/to/file.ts]
**Description**: [What to do]

**Acceptance Criteria**:
- [ ] [Criteria 1]
- [ ] [Criteria 2]

**Dependencies**: [1.1]
**Assigned**: [Who]
**Status**: ☐ Pending

---

## Phase 2: [Phase Name]

**Goal**: [From implementation plan]
**Estimated**: [X hours]
**Priority**: Medium

### Tasks

#### [2.1] [Task Name]
...

---

## Cross-Cutting Tasks

### [X.1] Setup
- [ ] [Task]

### [X.2] Testing
- [ ] [Task]

### [X.3] Documentation
- [ ] [Task]

---

## Dependencies Graph

```
[1.1] → [1.2] → [1.3]
              ↓
            [2.1] → [2.2]
              ↓
            [3.1]
```

---

## Definition of Done

Per task:
- [ ] Code written
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

Per phase:
- [ ] All tasks complete
- [ ] Integration tests passing
- [ ] No regressions

---

## Notes

- [Additional notes for implementers]
- [Edge cases to watch]
- [Performance considerations]

---

*Generated by /dev-stack:tasks*
```

---

## Support Commands

### /dev-stack:status

**Purpose**: Context-aware status display

**Output**:
```
Dev-Stack Status v3.0

Project: dev-stack
Type: Claude Code Plugin
Language: Python 3.8+

MCP Tools:
  ✅ Serena (semantic search)
  ✅ Memory (knowledge graph)
  ✅ Sequential Thinking
  ✅ Filesystem
  ✅ Doc-Forge

DNA:
  ✅ .dev-stack/dna/project.md (Updated: 2h ago)

Registry:
  ✅ .dev-stack/registry.md (15 skills, 8 conventions)

Last Activity:
  Context Engineering: 5 minutes ago
    Task: fix email bug
    Status: completed

  SDD Workflow:
    Current: auth (Phase 2/4)
    Plan: implementation_plan.md created
    Tasks: task_list.md created

Stats:
  Context prepared: 47 tasks
  This week: 12
  Success rate: 94%
```

### /dev-stack:registry

**Purpose**: Manual rebuild of skill registry

**What it scans**:
- MCP tools available
- Project conventions (.cursorrules, CLAUDE.md, agents.md)
- Coding skills (~/.claude/skills/)
- Tech stack detection

**Output**:
```
Scanning MCP tools...
  ✓ Serena: semantic search, code analysis
  ✓ Memory: knowledge graph, persistent learning
  ✓ Sequential Thinking: complex reasoning
  ✓ Filesystem: file operations
  ✓ Doc-Forge: document processing

Scanning conventions...
  ✓ Found: .cursorrules
  ✓ Found: CLAUDE.md
  ✓ Found: package.json

Building registry...
  ✓ Registry created: 15 skills, 8 conventions
  ✓ Saved to: .dev-stack/registry.md
  ✓ Memory MCP: Updated (if available)
```

---

## MCP Tool Requirements

### Required (High Priority)

| MCP Tool | Tools Used | Purpose | Fallback |
|----------|-----------|---------|----------|
| **serena** | get_symbols_overview, search_for_pattern, find_symbol | Semantic code search | filesystem + grep |
| **filesystem** | directory_tree, read_multiple_files | File operations | N/A (built-in) |

### Optional (Recommended)

| MCP Tool | Tools Used | Purpose | If Missing |
|----------|-----------|---------|-----------|
| **memory** | search_nodes, create_entities, create_relations, open_nodes | Persistent learning | Session-only |
| **sequentialthinking** | sequentialthinking | Complex reasoning | Direct reasoning |
| **doc-forge** | document_reader | Read docs/pdfs | Skip or ask user |

### Memory MCP Tools Reference

| Tool | Purpose | Used In Phase |
|------|---------|---------------|
| `mcp__memory__search_nodes` | Search knowledge graph | GATHER, ANALYZE |
| `mcp__memory__create_entities` | Store patterns/learnings | After completion |
| `mcp__memory__create_relations` | Link related concepts | After completion |
| `mcp__memory__open_nodes` | Get full entity details | GATHER |

---

## Hook Scripts Implementation

### Overview

Dev-Stack uses Claude Code's hook system to intercept and process commands. Hooks run at specific events in the execution lifecycle.

### Hook File Structure

```
.claude-plugin/hooks/
├── scripts/
│   ├── agents-mode-detect.py       # UserPromptSubmit hook
│   ├── agents-output.sh            # Output handling
│   ├── plan-workflow.py            # Plan workflow
│   ├── tasks-workflow.py           # Tasks workflow
│   ├── status-handler.py           # Status command
│   └── registry-builder.sh         # Registry building
├── config.yaml                     # Hook configuration
└── shared/
    └── context-prep.py             # Shared context prep logic
```

### Hook: UserPromptSubmit (agents-mode-detect.py)

**Purpose**: Detect when user runs `/dev-stack:agents` command and trigger workflow

**Event**: `UserPromptSubmit`
**Script**: `.claude-plugin/hooks/scripts/agents-mode-detect.py`

```python
#!/usr/bin/env python3
"""
Hook: UserPromptSubmit
Detects /dev-stack:agents command and triggers context preparation workflow
"""

import os
import sys
import json

def on_user_prompt_submit(user_input: str) -> str:
    """
    Called when user submits a prompt.
    Detects dev-stack commands and stores context for processing.
    """
    # Skip if not a dev-stack command
    if not user_input.strip().startswith("/dev-stack:"):
        return user_input

    # Parse command
    parts = user_input.strip().split()
    command = parts[0]

    # Map commands to task types
    command_map = {
        "/dev-stack:agents": "context_prep",
        "/dev-stack:plan": "technical_plan",
        "/dev-stack:tasks": "task_breakdown",
        "/dev-stack:status": "show_status",
        "/dev-stack:registry": "build_registry"
    }

    if command not in command_map:
        return user_input

    # Store context for hooks
    context = {
        "command": command,
        "task_type": command_map[command],
        "args": parts[1:] if len(parts) > 1 else [],
        "raw_input": user_input
    }

    # Store in temp file for downstream hooks
    temp_dir = "/tmp/dev-stack"
    os.makedirs(temp_dir, exist_ok=True)

    with open(f"{temp_dir}/context.json", "w") as f:
        json.dump(context, f)

    return user_input

if __name__ == "__main__":
    user_input = sys.stdin.read()
    result = on_user_prompt_submit(user_input)
    print(result)
```

---

### Hook: Output (agents-output.sh)

**Purpose**: Handle output from agents workflow - return context or save file

**Event**: `PostToolUse` or custom output trigger
**Script**: `.claude-plugin/hooks/scripts/agents-output.sh`

```bash
#!/bin/bash
#
# Hook: Output Handler
# Returns context to AI (agents) or saves file (plan/tasks)
#

set -euo pipefail

# Load context
CONTEXT_FILE="/tmp/dev-stack/context.json"
if [[ ! -f "$CONTEXT_FILE" ]]; then
    echo "Error: Context file not found" >&2
    exit 1
fi

COMMAND=$(jq -r '.command' "$CONTEXT_FILE")
TASK_TYPE=$(jq -r '.task_type' "$CONTEXT_FILE")

# Read prepared context bundle
BUNDLE_FILE="/tmp/dev-stack/context-bundle.md"
if [[ ! -f "$BUNDLE_FILE" ]]; then
    echo "Error: Context bundle not found" >&2
    exit 1
fi

CONTEXT_BUNDLE=$(cat "$BUNDLE_FILE")

# Output based on command
case "$COMMAND" in
    "/dev-stack:agents")
        # Context Engineering: Return context only, NO files
        echo "✓ Context prepared"
        echo "✓ Task: $TASK_TYPE"
        echo ""
        echo "$CONTEXT_BUNDLE"
        ;;

    "/dev-stack:plan"|"/dev-stack:tasks")
        # SDD Workflow: Save to file
        TOPIC=$(echo "$TASK_TYPE" | sed 's/technical_plan://;s/task_breakdown://')
        TIMESTAMP=$(date +%Y%m%d-%H%M%S)

        # Create specs directory
        SPECS_DIR=".dev-stack/specs/$(echo "$TOPIC" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"
        mkdir -p "$SPECS_DIR"

        # Determine output filename
        if [[ "$COMMAND" == "/dev-stack:plan" ]]; then
            OUTPUT="$SPECS_DIR/implementation_plan.md"
        else
            OUTPUT="$SPECS_DIR/task_list.md"
        fi

        # Write output
        echo "$CONTEXT_BUNDLE" > "$OUTPUT"

        echo "✓ Created: $OUTPUT"
        echo "✓ Topic: $TOPIC"
        ;;

    "/dev-stack:status")
        # Show status
        cat "/tmp/dev-stack/status.txt" 2>/dev/null || echo "No status available"
        ;;

    "/dev-stack:registry")
        # Registry building handled by separate script
        echo "✓ Registry updated"
        ;;
esac
```

---

### Hook: Registry Builder (registry-builder.sh)

**Purpose**: Build or update skill registry from MCP tools + project conventions

**Event**: Triggered by `/dev-stack:registry` or auto-run after agents
**Script**: `.claude-plugin/hooks/scripts/registry-builder.sh`

```bash
#!/bin/bash
#
# Hook: Registry Builder
# Scans MCP tools, project conventions, and builds skill registry
#

set -euo pipefail

REGISTRY_FILE=".dev-stack/registry.md"
TEMP_DIR="/tmp/dev-stack"
mkdir -p "$TEMP_DIR"

# Step 1: Scan MCP tools
echo "## MCP Tools Registry" > "$REGISTRY_FILE"
echo "" >> "$REGISTRY_FILE"
echo "**Updated**: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$REGISTRY_FILE"
echo "" >> "$REGISTRY_FILE"

# Check available MCP tools (from Claude Code environment)
echo "### Available MCP Servers" >> "$REGISTRY_FILE"
echo "" >> "$REGISTRY_FILE"

# Serena
if command -v serena &>/dev/null || [[ -n "${SERENA_AVAILABLE:-}" ]]; then
    echo "- ✅ **Serena** - Semantic code search" >> "$REGISTRY_FILE"
    echo "  - Tools: search_for_pattern, get_symbols_overview, find_symbol" >> "$REGISTRY_FILE"
else
    echo "- ⚠️  **Serena** - Not installed (optional but recommended)" >> "$REGISTRY_FILE"
fi

# Memory MCP
if [[ -n "${MEMORY_MCP_AVAILABLE:-}" ]]; then
    echo "- ✅ **Memory** - Knowledge graph, persistent learning" >> "$REGISTRY_FILE"
    echo "  - Tools: search_nodes, create_entities, create_relations" >> "$REGISTRY_FILE"
fi

# Sequential Thinking
if [[ -n "${SEQUENTIAL_THINKING_AVAILABLE:-}" ]]; then
    echo "- ✅ **Sequential Thinking** - Complex reasoning" >> "$REGISTRY_FILE"
fi

# Filesystem (always available)
echo "- ✅ **Filesystem** - File operations (built-in)" >> "$REGISTRY_FILE"

# Step 2: Scan project conventions
echo "" >> "$REGISTRY_FILE"
echo "### Project Conventions" >> "$REGISTRY_FILE"
echo "" >> "$REGISTRY_FILE"

# Check for convention files
for file in ".cursorrules" "CLAUDE.md" ".cursorrules.local" "CLAUDE.md.local"; do
    if [[ -f "$file" ]]; then
        echo "- ✅ **$file** - Project conventions found" >> "$REGISTRY_FILE"
    fi
done

# Step 3: Detect tech stack
echo "" >> "$REGISTRY_FILE"
echo "### Detected Tech Stack" >> "$REGISTRY_FILE"
echo "" >> "$REGISTRY_FILE"

# Check package.json
if [[ -f "package.json" ]]; then
    echo "#### Frontend/Node.js" >> "$REGISTRY_FILE"
    echo "\`\`\`" >> "$REGISTRY_FILE"
    jq -r '.dependencies | to_entries[] | "- \(.key): \(.value)"' package.json 2>/dev/null | head -10 >> "$REGISTRY_FILE" || true
    echo "\`\`\`" >> "$REGISTRY_FILE"
fi

# Check requirements.txt, pyproject.toml, etc.
if [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]]; then
    echo "#### Python" >> "$REGISTRY_FILE"
    echo "- Detected Python project" >> "$REGISTRY_FILE"
fi

# Step 4: Store to Memory MCP (if available)
if [[ -n "${MEMORY_MCP_AVAILABLE:-}" ]]; then
    # Would call memory MCP to store registry
    echo "# Storing registry to Memory MCP..." > "$TEMP_DIR/registry-log.txt"
fi

# Output summary
echo "✓ Registry built: $REGISTRY_FILE"
wc -l < "$REGISTRY_FILE" | xargs echo "  Lines:"
```

---

### Hook Configuration (hooks/config.yaml)

```yaml
# .claude-plugin/hooks/config.yaml

version: "1.0"

hooks:
  # UserPromptSubmit: Detect commands and store context
  - event: UserPromptSubmit
    script: scripts/agents-mode-detect.py
    enabled: true
    timeout: 5000  # ms

  # PostToolUse: Handle output after workflow
  - event: PostToolUse
    script: scripts/agents-output.sh
    enabled: true
    timeout: 10000

# Shared settings
shared:
  temp_dir: /tmp/dev-stack
  state_dir: .dev-stack/state
  log_dir: .dev-stack/logs

# Auto-registry settings
auto_registry:
  enabled: true
  trigger: after_agents  # Run after /dev-stack:agents completes
  cache_duration: 3600   # Rebuild if older than 1 hour
  async: false           # Run synchronously
```

---

### Shared Logic (shared/context-prep.py)

**Purpose**: Reusable functions for context preparation workflow

```python
#!/usr/bin/env python3
"""
Shared context preparation logic
Used by agents, plan, and tasks workflows
"""

import os
import json
from typing import Dict, List, Any

class ContextPreparator:
    """Handles THINK → GATHER → ANALYZE → PLAN workflow"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.temp_dir = "/tmp/dev-stack"
        os.makedirs(self.temp_dir, exist_ok=True)

    def think(self, task_description: str) -> Dict[str, Any]:
        """
        Phase 1: THINK
        Use Sequential Thinking MCP if available
        """
        # Implementation would call sequentialthinking MCP
        return {
            "task_complexity": "medium",
            "key_questions": ["What exists?", "What needs to change?"],
            "risks": []
        }

    def gather(self, task: str, keywords: List[str]) -> Dict[str, Any]:
        """
        Phase 2: GATHER
        Use Serena + Filesystem MCP
        """
        # Implementation would:
        # 1. Search for patterns
        # 2. Get symbol overviews
        # 3. Read relevant files
        return {
            "files_found": [],
            "patterns": [],
            "dependencies": []
        }

    def analyze(self, gathered: Dict) -> Dict[str, Any]:
        """
        Phase 3: ANALYZE
        Use Memory MCP + DNA
        """
        # Implementation would:
        # 1. Check DNA
        # 2. Search memory for patterns
        # 3. Identify tech stack
        return {
            "tech_stack": [],
            "conventions": [],
            "previous_patterns": []
        }

    def plan(self, analysis: Dict, task_type: str) -> str:
        """
        Phase 4: PLAN
        Generate context bundle or plan document
        """
        # Generate markdown based on task_type
        if task_type == "context_prep":
            return self._generate_context_bundle(analysis)
        elif task_type == "technical_plan":
            return self._generate_implementation_plan(analysis)
        elif task_type == "task_breakdown":
            return self._generate_task_list(analysis)

    def _generate_context_bundle(self, analysis: Dict) -> str:
        """Generate context bundle for agents command"""
        return "# Context Bundle\n\n..."

    def _generate_implementation_plan(self, analysis: Dict) -> str:
        """Generate implementation plan for plan command"""
        return "# Implementation Plan\n\n..."

    def _generate_task_list(self, analysis: Dict) -> str:
        """Generate task list for tasks command"""
        return "# Task List\n\n..."
```

---

## Configuration

### config/agents.yaml

```yaml
# Dev-Stack configuration

name: dev-stack
version: "3.0.0"
description: "Context engineering + SDD orchestrator"

# MCP tool preferences
mcp_tools:
  code_analysis:
    primary: serena
    fallback: filesystem
    tools_required:
      - mcp__serena__get_symbols_overview
      - mcp__serena__search_for_pattern
      - mcp__serena__find_symbol
      - mcp__serena__find_referencing_symbols

  file_operations:
    primary: filesystem
    tools_required:
      - mcp__filesystem__directory_tree
      - mcp__filesystem__read_multiple_files
      - mcp__filesystem__list_directory

  memory:
    primary: memory
    optional: true
    tools_used:
      - mcp__memory__search_nodes
      - mcp__memory__create_entities
      - mcp__memory__open_nodes

  reasoning:
    primary: sequentialthinking
    optional: true
    fallback: direct
    tools_used:
      - mcp__sequentialthinking__sequentialthinking

# Workflow settings
workflow:
  context_limit: 50000  # max tokens for context gathering
  file_limit: 20  # max files to read
  auto_registry: true  # auto-build registry on agents run

# Output settings
output:
  format: markdown
  location: .dev-stack/specs/  # SDD workflow only
  display_summary: true

# Memory persistence
persistence:
  enabled: true
  mcp_server: memory
  entity_prefix: "dev-stack"
  store_patterns: true
  store_context: false  # Only store in SDD mode

# Graceful degradation
fallback:
  enabled: true
  notify_user: true
  basic_search_fallback: true
```

---

## Command File Templates

### Overview

All commands are defined as markdown files in `.claude-plugin/commands/`. Each command has YAML frontmatter defining its metadata.

### File Structure

```
.claude-plugin/commands/
├── dev-stack-agents.md         # /dev-stack:agents
├── dev-stack-plan.md           # /dev-stack:plan
├── dev-stack-tasks.md          # /dev-stack:tasks
├── dev-stack-status.md         # /dev-stack:status
└── dev-stack-registry.md       # /dev-stack:registry
```

---

### Command: /dev-stack:agents

**File**: `.claude-plugin/commands/dev-stack-agents.md`

```markdown
---
name: dev-stack:agents
summary: Context Engineering Orchestrator - เตรียม context ให้ AI ทำงาน
description: |
  Analyze task, gather relevant codebase information, and prepare
  optimized context for AI execution. No files created by default.
args:
  - name: task
    description: งานที่ต้องการ (fix bug, add feature, review, research)
    required: true
    positional: true
---

# Context Engineering Orchestrator

## Purpose

Prepare optimal context for AI to execute tasks efficiently by:
1. **THINK**: Understanding task complexity
2. **GATHER**: Collecting relevant code
3. **ANALYZE**: Identifying patterns and constraints
4. **PLAN**: Creating executable approach

## Usage

```
/dev-stack:agents [task description]
```

## Examples

```bash
# Quick bug fix
/dev-stack:agents fix email sending bug

# Feature investigation
/dev-stack:agents how does authentication work

# Code review
/dev-stack:agents review src/auth/login.ts

# Refactoring
/dev-stack:agents refactor user service to use async/await
```

## Output

Returns context bundle directly to AI (no files created):

```markdown
# Context Bundle: [Task Name]

## Project Overview
- Tech Stack
- Architecture
- Current State

## Task Analysis
- User Request
- Task Type
- Complexity

## Gathered Information
- Relevant Files
- Dependencies
- Patterns

## Execution Plan
- Phases
- Steps
- Constraints

## Token Budget
- Used: ~X tokens
- Remaining: ~Y tokens
```

## How It Works

1. **UserPromptSubmit Hook** detects command
2. **THINK Phase**: Sequential Thinking MCP analyzes task
3. **GATHER Phase**: Serena + Filesystem MCP collect code
4. **ANALYZE Phase**: Memory MCP + DNA identify patterns
5. **PLAN Phase**: Generate context bundle
6. **Output Hook**: Return context to AI

## MCP Tools Required

- ✅ **Serena**: Semantic code search (fallback: filesystem)
- ✅ **Filesystem**: File operations (built-in)
- ⚠️ **Memory**: Knowledge graph (optional)
- ⚠️ **Sequential Thinking**: Complex reasoning (optional)

## Files Created

**None** - This command never creates files. Context returned to AI directly.

## Related Commands

- `/dev-stack:plan` - Create technical implementation plan (creates files)
- `/dev-stack:tasks` - Generate task breakdown (creates files)
- `/dev-stack:status` - Show current state
- `/dev-stack:registry` - Build/update registry
```

---

### Command: /dev-stack:plan

**File**: `.claude-plugin/commands/dev-stack-plan.md`

```markdown
---
name: dev-stack:plan
summary: Create technical implementation plan for features
description: |
  Generate comprehensive technical implementation plan with
  architecture decisions, tech stack selection, and API design.
args:
  - name: spec
    description: Feature or requirement to plan
    required: true
    positional: true
---

# Technical Implementation Plan

## Purpose

Create detailed technical implementation plan including:
- Architecture decisions
- Tech stack selection
- API design
- Data model
- Security considerations
- Implementation phases

## Usage

```
/dev-stack:plan "[feature description]"
```

## Examples

```bash
# Authentication system
/dev-stack:plan "add OAuth 2.0 authentication"

# Payment integration
/dev-stack:plan "integrate Stripe payment gateway"

# API redesign
/dev-stack:plan "REST API to GraphQL migration"
```

## Output

Creates: `.dev-stack/specs/[topic]/implementation_plan.md`

## Output Structure

```markdown
# Implementation Plan: [Feature Name]

## Executive Summary
[One-paragraph overview]

## Requirements Overview
- Functional Requirements
- Non-Functional Requirements

## Technical Approach
- Architecture Decision
- Why This Approach
- Alternatives Considered

## Tech Stack
- Frontend
- Backend
- Database

## Data Model
- New Tables/Collections
- Relationships

## API Design
- New Endpoints
- Request/Response Formats
- Error Handling

## Security Considerations
[Security requirements]

## Implementation Phases
- Phase 1: [Name] (Priority, Estimated)
- Phase 2: [Name] (Priority, Estimated)

## Risks & Mitigations
| Risk | Impact | Mitigation |

## Testing Strategy
- Unit Tests
- Integration Tests
- E2E Tests
```

## Related Commands

- `/dev-stack:agents` - Quick context prep (no files)
- `/dev-stack:tasks` - Generate task list from plan
- `/dev-stack:status` - Show progress
```

---

### Command: /dev-stack:tasks

**File**: `.claude-plugin/commands/dev-stack-tasks.md`

```markdown
---
name: dev-stack:tasks
summary: Generate actionable task list from implementation plan
description: |
  Break down implementation plan into phased, actionable tasks
  with dependencies and acceptance criteria.
args:
  - name: plan
    description: Plan topic to break down (reads implementation_plan.md)
    required: true
    positional: true
---

# Task Breakdown Generator

## Purpose

Convert implementation plan into actionable task list with:
- Phased breakdown
- Task dependencies
- Acceptance criteria
- Effort estimation

## Usage

```
/dev-stack:tasks "[plan topic]"
```

## Examples

```bash
# From existing plan
/dev-stack:tasks "oauth authentication"

# Loads: .dev-stack/specs/oauth-authentication/implementation_plan.md
# Creates: .dev-stack/specs/oauth-authentication/task_list.md
```

## Output

Creates: `.dev-stack/specs/[topic]/task_list.md`

## Output Structure

```markdown
# Task List: [Feature Name]

## Overview
- Total Phases: X
- Total Tasks: Y
- Estimated Effort: Z hours

## Phase 1: [Phase Name]
**Goal**: [From plan]
**Estimated**: X hours

### Tasks
#### [1.1] [Task Name]
**File**: path/to/file.ts
**Description**: [What to do]
**Acceptance Criteria**:
- [ ] [Criteria 1]
- [ ] [Criteria 2]
**Dependencies**: None
**Status**: ☐ Pending

## Dependencies Graph
```
[1.1] → [1.2] → [1.3]
              ↓
            [2.1]
```

## Definition of Done
Per task:
- [ ] Code written
- [ ] Tests passing
- [ ] Code reviewed

Per phase:
- [ ] All tasks complete
- [ ] Integration tests passing
```

## Related Commands

- `/dev-stack:plan` - Create implementation plan first
- `/dev-stack:agents` - Quick context prep
- `/dev-stack:status` - Show progress
```

---

### Command: /dev-stack:status

**File**: `.claude-plugin/commands/dev-stack-status.md`

```markdown
---
name: dev-stack:status
summary: Show current dev-stack state and recent activity
description: |
  Display project status, MCP tools availability, DNA state,
  registry info, and recent activity.
---

# Dev-Stack Status

## Purpose

Show current state including:
- Project information
- MCP tools availability
- DNA status
- Registry status
- Recent activity
- Statistics

## Usage

```
/dev-stack:status
```

## Output

```
Dev-Stack Status v3.0

Project: dev-stack
Type: Claude Code Plugin
Language: Python 3.8+

MCP Tools:
  ✅ Serena (semantic search)
  ✅ Memory (knowledge graph)
  ✅ Sequential Thinking
  ✅ Filesystem
  ✅ Doc-Forge

DNA:
  ✅ .dev-stack/dna/project.md (Updated: 2h ago)

Registry:
  ✅ .dev-stack/registry.md (15 skills, 8 conventions)

Last Activity:
  Context Engineering: 5 minutes ago
    Task: fix email bug
    Status: completed

  SDD Workflow:
    Current: auth (Phase 2/4)
    Plan: implementation_plan.md created
    Tasks: task_list.md created

Stats:
  Context prepared: 47 tasks
  This week: 12
  Success rate: 94%
```

## Information Displayed

| Section | Description |
|---------|-------------|
| **Project** | Name, type, language |
| **MCP Tools** | Available tools and status |
| **DNA** | Project DNA status |
| **Registry** | Skills and conventions count |
| **Last Activity** | Recent agents/plan/tasks runs |
| **Stats** | Usage statistics |
```

---

### Command: /dev-stack:registry

**File**: `.claude-plugin/commands/dev-stack-registry.md`

```markdown
---
name: dev-stack:registry
summary: Build or update skill and convention registry
description: |
  Scan MCP tools, project conventions, and tech stack to build
  comprehensive skill registry for context preparation.
---

# Registry Builder

## Purpose

Build comprehensive registry including:
- Available MCP tools
- Project conventions (.cursorrules, CLAUDE.md)
- Detected tech stack
- Coding patterns

## Usage

```
/dev-stack:registry
```

## When to Use

- First time setup
- After installing new MCP tool
- Project structure changed
- Want to refresh registry

## What It Scans

1. **MCP Tools**
   - Serena (semantic search)
   - Memory (knowledge graph)
   - Sequential Thinking
   - Filesystem (built-in)
   - Doc-Forge (documents)

2. **Project Conventions**
   - .cursorrules
   - CLAUDE.md
   - .cursorrules.local
   - CLAUDE.md.local

3. **Tech Stack**
   - package.json (Node.js)
   - requirements.txt (Python)
   - pyproject.toml (Python)
   - go.mod (Go)
   - Cargo.toml (Rust)

4. **Coding Patterns**
   - Frameworks detected
   - Testing frameworks
   - Build tools

## Output

Creates: `.dev-stack/registry.md`

Also stores to Memory MCP (if available).

## Registry Structure

```markdown
# Dev-Stack Registry

**Updated**: [Timestamp]

## MCP Tools Registry
### Available MCP Servers
- ✅ **Serena** - Semantic code search
  - Tools: search_for_pattern, get_symbols_overview, find_symbol
- ✅ **Memory** - Knowledge graph

## Project Conventions
- ✅ **.cursorrules** - Project conventions found
- ✅ **CLAUDE.md** - AI instructions found

## Detected Tech Stack
### Frontend/Node.js
- react: ^18.2.0
- typescript: ^5.0.0

### Python
- Django: 4.2
- pytest: 7.4
```

## Auto-Registry

Registry is also built automatically:
- After `/dev-stack:agents` completes
- Cached for 1 hour
- Runs synchronously by default

Configure in `config/agents.yaml`:
```yaml
workflow:
  auto_registry: true      # Enable auto-registry
  registry_cache: 3600     # Cache duration (seconds)
```
```

---

## Examples

### Example 1: Quick Bug Fix (Context Engineering)

**User Input**:
```bash
/dev-stack:agents fix email sending bug
```

**Workflow**:
```
THINK → GATHER → ANALYZE → PLAN → OUTPUT

Output:
✓ Context prepared
✓ Task: Fix email bug
✓ Root cause: sendEmail() has no error handling
✓ Plan: Add try-catch + logging + retry

[Context injected - AI proceeds]
```

**Files Created**: 0

---

### Example 2: Large Feature (SDD Workflow)

**User Input**:
```bash
/dev-stack:plan add OAuth authentication
```

**Workflow**:
```
THINK → GATHER → ANALYZE → TECHNICAL PLAN

Output:
✓ Created: .dev-stack/specs/auth/implementation_plan.md
✓ Sections: Requirements, Tech Stack, API Design, Security
✓ Phases: 4 (Database, Backend, Frontend, Testing)
```

---

**User Input**:
```bash
/dev-stack:tasks add OAuth authentication
```

**Workflow**:
```
LOAD PLAN → BREAKDOWN → OUTPUT

Output:
✓ Created: .dev-stack/specs/auth/task_list.md
✓ Total: 15 tasks across 4 phases
✓ Estimated: 8 hours
```

---

### Example 3: Code Review (Context Engineering)

**User Input**:
```bash
/dev-stack:agents review PR #123
```

**Workflow**:
```
THINK → GATHER (read PR files) → ANALYZE → PLAN → OUTPUT

Output:
✓ Context prepared
✓ Files: 3 changed, 156 lines
✓ Issues found: 2 potential bugs, 1 style issue
✓ Review complete
```

**Files Created**: 0

---

## Decision Guide

### When to use which command?

| Situation | Use | Files? |
|-----------|-----|--------|
| Quick bug fix | `/dev-stack:agents` | No |
| Code review | `/dev-stack:agents` | No |
| Research/investigate | `/dev-stack:agents` | No |
| Large feature | `/dev-stack:plan` → `/dev-stack:tasks` | Yes |
| Team collaboration | `/dev-stack:plan` → `/dev-stack:tasks` | Yes |
| Need audit trail | `/dev-stack:plan` → `/dev-stack:tasks` | Yes |
| Check state | `/dev-stack:status` | - |
| After MCP changes | `/dev-stack:registry` | Yes |

---

## Command Comparison

| Scenario | Spec-Kit | Agent Teams Lite | **Ours** |
|----------|----------|------------------|----------|
| Fix bug | 5 min | 15 min | **30 sec** |
| Add feature | 20 min | 45 min | **5 min (agents)** or **10 min (plan+tasks)** |
| Code review | 10 min | N/A | **30 sec** |
| Large feature | 20 min | 45 min | **10 min (plan+tasks)** |
| Files created | Always | 4+ | **0 (agents) or 2 (plan+tasks)** |

---

## Success Metrics

### User-Facing

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time Savings | >50% | Compare manual vs assisted |
| Context Quality | >90% signal | User feedback rating |
| Error Reduction | >70% | Fewer AI mistakes |
| Token Efficiency | >80% | Less token waste |
| File Clutter (agents) | 0 files | Interactive mode creates nothing |
| Documentation Quality (plan/tasks) | >90% complete | Team feedback |

### Technical

| Metric | Target | Measurement |
|--------|--------|-------------|
| Context Prep Time (agents) | <10s | Average prep time |
| Plan Generation (plan) | <2min | Full technical plan |
| Task Breakdown (tasks) | <1min | Full task list |
| MCP Tool Success Rate | >95% | Tools returning correctly |
| Fallback Success Rate | >80% | Graceful degradation |
| Registry Build Time | <30s | Full scan + save |

---

## Implementation Priority

### Phase 1: Foundation (Week 1-2)

**Goal**: Core infrastructure and basic agents command

**Tasks**:
- [ ] Create hook script structure
  - [ ] `.claude-plugin/hooks/scripts/` directory
  - [ ] `agents-mode-detect.py` (UserPromptSubmit)
  - [ ] `agents-output.sh` (Output handling)
  - [ ] `registry-builder.sh` (Registry building)
  - [ ] `hooks/config.yaml` (Hook configuration)

- [ ] Create command definitions
  - [ ] `dev-stack-agents.md` command
  - [ ] `dev-stack-status.md` command
  - [ ] `dev-stack-registry.md` command

- [ ] Implement `/dev-stack:agents` workflow
  - [ ] THINK phase (Sequential Thinking MCP)
  - [ ] GATHER phase (Serena + Filesystem MCP)
  - [ ] ANALYZE phase (Memory MCP + DNA)
  - [ ] PLAN phase (Context bundle generation)
  - [ ] OUTPUT phase (Return context, no files)

- [ ] Implement `/dev-stack:registry` command
  - [ ] MCP tool scanning
  - [ ] Project convention detection
  - [ ] Tech stack detection
  - [ ] Registry file generation

- [ ] Implement `/dev-stack:status` command
  - [ ] Project info display
  - [ ] MCP tools status
  - [ ] DNA status
  - [ ] Recent activity

**Deliverables**:
- Working `/dev-stack:agents` command
- Working `/dev-stack:registry` command
- Working `/dev-stack:status` command
- Hook script infrastructure

---

### Phase 2: SDD Workflow (Week 3-4)

**Goal**: plan and tasks commands with file output

**Tasks**:
- [ ] Create SDD command definitions
  - [ ] `dev-stack-plan.md` command
  - [ ] `dev-stack-tasks.md` command

- [ ] Implement `/dev-stack:plan` workflow
  - [ ] THINK → GATHER → ANALYZE (reuse from agents)
  - [ ] TECHNICAL PLAN phase (generate plan document)
  - [ ] File output to `.dev-stack/specs/[topic]/implementation_plan.md`
  - [ ] Plan template with all sections

- [ ] Implement `/dev-stack:tasks` workflow
  - [ ] LOAD PLAN phase (read implementation_plan.md)
  - [ ] BREAKDOWN phase (generate tasks)
  - [ ] File output to `.dev-stack/specs/[topic]/task_list.md`
  - [ ] Task template with dependencies

- [ ] Create `.dev-stack/specs/` directory structure
  - [ ] Auto-create topic directories
  - [ ] File naming conventions

**Deliverables**:
- Working `/dev-stack:plan` command
- Working `/dev-stack:tasks` command
- SDD workflow complete

---

### Phase 3: Polish & Testing (Week 5)

**Goal**: Complete testing and refinement

**Tasks**:
- [ ] Testing
  - [ ] Unit tests for hook scripts
  - [ ] Integration tests for workflows
  - [ ] End-to-end tests
  - [ ] MCP fallback testing

- [ ] Documentation
  - [ ] User guide
  - [ ] Developer guide
  - [ ] API documentation
  - [ ] Troubleshooting guide

- [ ] Performance optimization
  - [ ] Context gathering optimization
  - [ ] Registry caching
  - [ ] MCP call batching

- [ ] Edge case handling
  - [ ] Ambiguous task detection
  - [ ] Large file handling
  - [ ] Network failures
  - [ ] MCP tool failures

**Deliverables**:
- Test suite passing
- Complete documentation
- Performance benchmarks met

---

### Phase 4: Advanced Features (Future)

**Tasks**:
- [ ] Multi-project memory sharing
- [ ] Real-time collaboration support
- [ ] Learning from failures analysis
- [ ] Pattern suggestion system
- [ ] Test generation from specs
- [ ] Documentation auto-update

---

## Future Enhancements

### Advanced Features (Post-MVP)
- [ ] Multi-project memory sharing across projects
- [ ] Real-time collaboration support for teams
- [ ] Learning from failures analysis
- [ ] Pattern suggestion system
- [ ] Test generation from implementation plans
- [ ] Documentation auto-update from code changes

---

## Dependencies

### Required MCP Servers

| MCP | Status | Purpose |
|-----|--------|---------|
| serena | ✅ You have | Semantic code search |
| filesystem | ✅ Built-in | File operations |
| memory | ✅ You have | Knowledge graph |
| sequentialthinking | ✅ You have | Complex reasoning |
| doc-forge | ✅ You have | Document processing |

### Optional

| MCP | Purpose |
|-----|---------|
| fetch | Web fetching |
| context7 | Documentation lookup |

---

## Glossary

- **Context Engineering**: Preparing optimal context for AI agents
- **Context Bundle**: Enhanced prompt with all relevant information
- **SDD**: Spec-Driven Development (plan → tasks → implement)
- **MCP**: Model Context Protocol
- **DNA**: Project structure and patterns
- **Registry**: Auto-discovered skills and conventions

---

## References

- Context Engineering: `/requirements/analysis/14-context-engineering.md`
- Agent Teams Lite: `/requirements/analysis/15-agent-teams-lite.md`
- Anthropic Article: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Serena Documentation: Available via MCP

---

**Status**: ✅ Ready for Implementation (v3.0)

**Implementation**: See [Implementation Priority](#implementation-priority) section above

**Quick Start**:
1. Create hook script structure
2. Implement `/dev-stack:agents` command
3. Implement `/dev-stack:registry` command
4. Add `/dev-stack:plan` and `/dev-stack:tasks` commands
5. Complete testing and documentation

**Estimated Time**: 4-5 weeks for MVP
