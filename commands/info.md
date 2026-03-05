---
name: info
description: |
  Display plugin capabilities, tool mappings, and scope definitions.
  Use this command to understand what the dev-stack plugin can do.
arguments:
  - name: section
    description: Optional section to display (tools, scopes, all)
    required: false
    default: all
---

# Dev-Stack: Info - Capabilities Display

Display information about the dev-stack plugin capabilities.

## Usage

```
/dev-stack:info          # Show all information
/dev-stack:info tools    # Show tool mappings only
/dev-stack:info scopes   # Show scope definitions only
```

## Plugin Overview

**Name**: dev-stack
**Version**: 2.0.0
**Description**: Intelligent workflow orchestrator with MCP-first tool selection

## Available Commands

| Command | Type | Spawns Agents | Scope | Purpose |
|---------|------|---------------|-------|---------|
| `/dev-stack:agents` | Team | Yes | Multi | Complex multi-scope tasks |
| `/dev-stack:dev` | Scoped | No | dev | Code development |
| `/dev-stack:git` | Scoped | No | git | Version control |
| `/dev-stack:docs` | Scoped | No | docs | Documentation |
| `/dev-stack:quality` | Scoped | No | quality | Testing/linting |
| `/dev-stack:info` | Info | No | - | Display capabilities |
| `/dev-stack:simplify` | Analysis | No | - | Task breakdown |

## Tool Priority System

```
┌─────────────────────────────────────────────────────────────┐
│  PRIORITY ORDER:                                            │
│                                                             │
│  Priority 1: MCP SERVER TOOLS (ALWAYS TRY FIRST)           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ serena      → Code operations                       │   │
│  │ filesystem  → File operations                       │   │
│  │ doc-forge   → Documentation                         │   │
│  │ context7    → API documentation                     │   │
│  │ memory      → Persistent memory                     │   │
│  │ fetch       → Web content                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Priority 2: PLUGIN SKILLS                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ task-analysis   → Parse intent, detect scope        │   │
│  │ tool-selection  → Map capability to optimal tool    │   │
│  │ workflow-design → Plan execution steps              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Priority 3: BUILT-IN TOOLS (LAST RESORT ONLY)             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Read, Write, Edit, Bash, Grep, Glob, WebSearch      │   │
│  │ ⚠️ ONLY use when MCP tools are unavailable          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Capability Mapping

### CODE Operations

| Capability | Primary (MCP) | Fallback (Built-in) |
|------------|---------------|---------------------|
| `read_code` | serena.find_symbol | Read, Grep |
| `write_code` | serena.replace_symbol_body | Edit, Write |
| `search_code` | serena.search_for_pattern | Grep, Glob |
| `analyze_code` | serena.get_symbols_overview | Read |

### FILE Operations

| Capability | Primary (MCP) | Fallback (Built-in) |
|------------|---------------|---------------------|
| `read_file` | filesystem.read_text_file | Read |
| `write_file` | filesystem.write_file | Write |
| `edit_file` | filesystem.edit_file | Edit |
| `list_dir` | filesystem.list_directory | Bash(ls) |

### DOCS Operations

| Capability | Primary (MCP) | Fallback (Built-in) |
|------------|---------------|---------------------|
| `read_docs` | doc-forge.document_reader | Read |
| `write_docs` | filesystem.write_file | Write |
| `read_api_docs` | context7.query-docs | WebSearch |

## Scope Definitions

### dev Scope 💻

```
ALLOWED:
  • code.read_code, code.write_code, code.search_code, code.analyze_code
  • file.read_file, file.write_file, file.edit_file, file.list_dir

BLOCKED:
  • git.* (all git operations)
  • quality.run_tests
```

### git Scope 📦

```
ALLOWED:
  • git.status, git.diff, git.commit, git.add, git.push, git.branch

BLOCKED:
  • code.write_code
  • file.write_file, file.edit_file
```

### docs Scope 📄

```
ALLOWED:
  • docs.read_docs, docs.write_docs, docs.convert_docs, docs.read_api_docs
  • file.read_file, file.write_file

BLOCKED:
  • code.write_code
  • git.* (all git operations)
```

### quality Scope ✅

```
ALLOWED:
  • quality.run_tests, quality.run_linter, quality.check_coverage
  • code.read_code, code.search_code

BLOCKED:
  • code.write_code
  • file.write_file, file.edit_file
  • git.* (all git operations)
```

## Agents

| Agent | Model | Max Turns | Purpose |
|-------|-------|-----------|---------|
| orchestrator | sonnet | Unlimited | Coordinate complex tasks |
| worker | sonnet | 20 | Scoped execution |
| researcher | haiku | 10 | Fast codebase exploration |

## Configuration Files

| File | Purpose |
|------|---------|
| `config/capabilities.yaml` | Tool capability mapping |
| `config/plugin.yaml` | Plugin settings |
| `hooks/hooks.json` | Hook configuration |

## Example Output

When you run `/dev-stack:info`, you will see:
1. Plugin overview
2. Available commands
3. Tool priority system
4. Capability mappings
5. Scope definitions
6. Agent configurations
