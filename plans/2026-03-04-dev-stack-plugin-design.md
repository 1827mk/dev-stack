# Dev-Stack Orchestrator Plugin v2.0 - Design Document

**Created**: 2026-03-04
**Status**: Approved
**Approach**: Full Plugin with Tools Discovery

---

## Executive Summary

สร้าง Claude Code Plugin สำหรับ orchestrate tools และ workflows โดยอัตโนมัติ พร้อม context preservation

**Core Flow**: `Task Input → Analysis → Capability Selection → Tool Selection → Workflow → Execution → Report`

---

## 1. Plugin Structure

```
dev-stack/
├── .claude-plugin/
│   └── plugin.json                    # Plugin manifest
│
├── commands/                          # 7 commands
│   ├── agents.md                      # /dev-stack:agents - Team orchestrator
│   ├── dev.md                         # /dev-stack:dev - Development scope
│   ├── git.md                         # /dev-stack:git - Git operations
│   ├── docs.md                        # /dev-stack:docs - Documentation
│   ├── quality.md                     # /dev-stack:quality - Testing
│   ├── info.md                        # /dev-stack:info - Capabilities
│   └── simplify.md                    # /dev-stack:simplify - Task breakdown
│
├── skills/                            # 3 skills
│   ├── task-analysis/
│   │   └── SKILL.md
│   ├── tool-selection/
│   │   └── SKILL.md
│   └── workflow-design/
│       └── SKILL.md
│
├── agents/                            # 3 agents
│   ├── orchestrator.md                # Main coordinator
│   ├── worker.md                      # Scoped execution
│   └── researcher.md                  # Codebase exploration
│
├── hooks/
│   └── hooks.json                     # Hook configuration
│
├── scripts/
│   ├── session-start.sh
│   ├── save-context.sh
│   ├── track-agent.sh
│   └── generate-report.sh
│
├── config/
│   ├── capabilities.yaml              # Capability mapping
│   └── plugin.yaml                    # Plugin settings
│
└── context/                           # Context checkpoints
    └── .gitkeep
```

---

## 2. Commands Design

| Command | Type | Spawns Agents | Scope | Purpose |
|---------|------|---------------|-------|---------|
| `/dev-stack:agents` | Team | Yes | Multi | Complex multi-scope tasks |
| `/dev-stack:dev` | Scoped | No | dev | Code changes |
| `/dev-stack:git` | Scoped | No | git | Version control |
| `/dev-stack:docs` | Scoped | No | docs | Documentation |
| `/dev-stack:quality` | Scoped | No | quality | Testing |
| `/dev-stack:info` | Info | No | - | Display capabilities |
| `/dev-stack:simplify` | Analysis | No | - | Task breakdown only |

### Key Behaviors

1. **Team Orchestrator (`/dev-stack:agents`)**:
   - Analyzes task → Identifies scopes
   - Spawns specialized agents
   - Monitors progress → Aggregates results
   - Generates report

2. **Scoped Commands (`/dev-stack:dev|git|docs|quality`)**:
   - Stay within scope boundaries
   - Use capability-based tool selection
   - Do NOT spawn sub-agents
   - Report when task crosses scope boundary

---

## 3. Agents Design

### orchestrator.md
- **Role**: Main coordinator for complex tasks
- **Tools**: Agent, Task, Read, Bash
- **Model**: sonnet
- **Responsibilities**: Analyze, select agents, design workflow, monitor, aggregate

### worker.md
- **Role**: Scoped execution agent
- **Tools**: serena, filesystem, doc-forge, Read, Write, Edit, Bash
- **Model**: sonnet
- **Max Turns**: 20
- **Scope Config**: dev, docs, quality
- **Boundary Rules**: Never cross scope boundaries

### researcher.md
- **Role**: Fast codebase exploration
- **Tools**: serena.find_symbol, serena.search_for_pattern, Read, Grep, Glob
- **Model**: haiku
- **Read-only**: No file modifications

---

## 4. Tool Capability Mapping

### Priority System (2 Levels)

| Level | Description |
|-------|-------------|
| **Primary** | MCP tools (better capabilities) |
| **Fallback** | Built-in tools (always available) |

### Capability Mapping

| **Capability** | **Primary Tool** | **Fallback Tool** |
|----------------|------------------|-------------------|
| **CODE** |||
| `read_code` | serena.find_symbol, serena.get_symbols_overview | Read, Grep |
| `write_code` | serena.replace_symbol_body, serena.insert_after_symbol | Edit, Write |
| `search_code` | serena.search_for_pattern | Grep, Glob |
| `analyze_code` | serena.get_symbols_overview | Read |
| **FILE** |||
| `read_file` | filesystem.read_text_file | Read |
| `write_file` | filesystem.write_file | Write |
| `list_dir` | filesystem.list_directory | Bash(ls) |
| **DOCS** |||
| `read_docs` | doc-forge.document_reader | Read |
| `write_docs` | filesystem.write_file | Write |
| `read_api_docs` | context7.query-docs | WebSearch |
| **QUALITY** |||
| `run_tests` | Bash(npm test) | - |
| `run_linter` | Bash(npm run lint) | - |
| **GIT** |||
| `git_status` | Bash(git status) | - |
| `git_commit` | Bash(git commit) | - |
| `git_push` | Bash(git push) | - |
| **MEMORY** |||
| `memory_store` | memory.create_entities, serena.write_memory | Write(file) |
| `memory_recall` | memory.search_nodes, serena.read_memory | Read(file) |

---

## 5. Hooks Design

### hooks.json Configuration

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/scripts/session-start.sh" }]
      }
    ],
    "PreCompact": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/scripts/save-context.sh" }]
      }
    ],
    "SubagentStart": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/scripts/track-agent.sh start" }]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/scripts/track-agent.sh stop" }]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/scripts/generate-report.sh" }]
      }
    ]
  }
}
```

### Hook Scripts

| Script | Purpose | Output |
|--------|---------|--------|
| `session-start.sh` | Welcome message or restore context | Banner / Context |
| `save-context.sh` | Save task state before compaction | JSON file |
| `track-agent.sh` | Track agent lifecycle | Log file |
| `generate-report.sh` | Generate final execution report | Markdown |

---

## 6. Skills Design

### task-analysis
- Parse user intent from natural language
- Identify required capabilities
- Detect scope boundaries
- Estimate complexity

### tool-selection
- Check capability mapping in config/capabilities.yaml
- Select primary tools if available
- Fall back to built-in tools
- Warn when using fallback

### workflow-design
- Design step-by-step execution plan
- Define capability dependencies
- Support templates: feature, bug-fix, documentation

---

## 7. Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Plugin structure setup
- [ ] plugin.json manifest
- [ ] config/capabilities.yaml
- [ ] hooks/hooks.json

### Phase 2: Commands
- [ ] /dev-stack:agents (Team Orchestrator)
- [ ] /dev-stack:dev (Scoped Development)
- [ ] /dev-stack:info (Capabilities Display)

### Phase 3: Additional Commands
- [ ] /dev-stack:git
- [ ] /dev-stack:docs
- [ ] /dev-stack:quality
- [ ] /dev-stack:simplify

### Phase 4: Agents
- [ ] orchestrator.md
- [ ] worker.md
- [ ] researcher.md

### Phase 5: Skills
- [ ] task-analysis/SKILL.md
- [ ] tool-selection/SKILL.md
- [ ] workflow-design/SKILL.md

### Phase 6: Hooks & Scripts
- [ ] session-start.sh
- [ ] save-context.sh
- [ ] track-agent.sh
- [ ] generate-report.sh

### Phase 7: Testing & Documentation
- [ ] Test all commands
- [ ] Test agent spawning
- [ ] Test context preservation
- [ ] README.md

---

## 8. Success Criteria

| ID | Criteria | Target |
|----|----------|--------|
| SC-001 | Tool selection accuracy | >= 90% |
| SC-002 | Scoped commands boundary compliance | 100% |
| SC-003 | Multi-scope agent spawning accuracy | 100% |
| SC-004 | Report completeness | 100% |
| SC-005 | Context restoration success rate | >= 95% |
| SC-006 | Agent tracking accuracy | 100% |

---

## 9. Out of Scope

- Custom MCP server creation
- Custom skill creation (use plugin-dev)
- CI/CD pipeline integration
- Multi-user collaboration
- Cloud deployment
- Webhook notifications (P3 - future)

---

## 10. References

- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code Skills Guide](https://code.claude.com/docs/en/skills)
- [Claude Code Subagents Guide](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
