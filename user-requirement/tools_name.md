# Claude Code - Available Tools Reference

> Updated: 2026-02-28 (Verified from system tools list)

---

## 1. Built-in Tools (22)

| Tool | Description |
|------|-------------|
| `Task` | Launch specialized agent for complex tasks |
| `TaskOutput` | Get output from running/completed task |
| `Bash` | Execute bash commands |
| `Glob` | Find files by pattern matching |
| `Grep` | Search content in files with regex |
| `Read` | Read files (images, PDFs, notebooks supported) |
| `Edit` | Edit files with string replacement |
| `Write` | Write or overwrite files |
| `NotebookEdit` | Edit Jupyter notebook cells |
| `WebSearch` | Search the web |
| `TaskStop` | Stop background task |
| `AskUserQuestion` | Ask user questions during task |
| `Skill` | Invoke a skill |
| `EnterPlanMode` | Enter planning mode |
| `ExitPlanMode` | Exit planning mode after approval |
| `TaskCreate` | Create task in task list |
| `TaskGet` | Get task details |
| `TaskUpdate` | Update task status |
| `TaskList` | List all tasks |
| `ListMcpResourcesTool` | List MCP resources |
| `ReadMcpResourceTool` | Read MCP resource |
| `EnterWorktree` | Create and switch to isolated git worktree |

---

## 2. MCP Server Tools (72) - ✅ VERIFIED RUNNING

### 2.1 context7 (2) ✅

| Tool | Description |
|------|-------------|
| `mcp__context7__resolve-library-id` | Resolve library ID for documentation lookup |
| `mcp__context7__query-docs` | Query library documentation |

### 2.2 doc-forge (16) ✅

| Tool | Description |
|------|-------------|
| `mcp__doc-forge__document_reader` | Read documents (PDF, DOCX, TXT, HTML, CSV) |
| `mcp__doc-forge__docx_to_html` | Convert DOCX to HTML |
| `mcp__doc-forge__docx_to_pdf` | Convert DOCX to PDF |
| `mcp__doc-forge__excel_read` | Read Excel to JSON |
| `mcp__doc-forge__format_convert` | Convert format (Markdown, HTML, XML, JSON) |
| `mcp__doc-forge__html_cleaner` | Clean HTML |
| `mcp__doc-forge__html_extract_resources` | Extract resources from HTML (images, videos, links) |
| `mcp__doc-forge__html_formatter` | Format HTML |
| `mcp__doc-forge__html_to_markdown` | Convert HTML to markdown |
| `mcp__doc-forge__html_to_text` | Convert HTML to text |
| `mcp__doc-forge__pdf_merger` | Merge PDFs |
| `mcp__doc-forge__pdf_splitter` | Split PDF |
| `mcp__doc-forge__text_diff` | Compare text files |
| `mcp__doc-forge__text_encoding_converter` | Convert text encoding |
| `mcp__doc-forge__text_formatter` | Format text |
| `mcp__doc-forge__text_splitter` | Split text file |

### 2.3 fetch (1) ✅

| Tool | Description |
|------|-------------|
| `mcp__fetch__fetch` | Fetch URL content with markdown extraction |

### 2.4 filesystem (15) ✅

| Tool | Description |
|------|-------------|
| `mcp__filesystem__create_directory` | Create directory |
| `mcp__filesystem__directory_tree` | Show directory tree as JSON |
| `mcp__filesystem__edit_file` | Edit file (line-based) |
| `mcp__filesystem__get_file_info` | Get file metadata |
| `mcp__filesystem__list_allowed_directories` | List allowed directories |
| `mcp__filesystem__list_directory` | List directory contents |
| `mcp__filesystem__list_directory_with_sizes` | List directory with file sizes |
| `mcp__filesystem__move_file` | Move or rename file |
| `mcp__filesystem__read_file` | Read file (deprecated, use read_text_file) |
| `mcp__filesystem__read_media_file` | Read image/audio files as base64 |
| `mcp__filesystem__read_multiple_files` | Read multiple files at once |
| `mcp__filesystem__read_text_file` | Read text file |
| `mcp__filesystem__search_files` | Search files with glob pattern |
| `mcp__filesystem__write_file` | Write file |

### 2.5 memory (9) ✅

| Tool | Description |
|------|-------------|
| `mcp__memory__add_observations` | Add observations to entities |
| `mcp__memory__create_entities` | Create entities in knowledge graph |
| `mcp__memory__create_relations` | Create relations between entities |
| `mcp__memory__delete_entities` | Delete entities |
| `mcp__memory__delete_observations` | Delete observations |
| `mcp__memory__delete_relations` | Delete relations |
| `mcp__memory__open_nodes` | Open nodes by name |
| `mcp__memory__read_graph` | Read entire knowledge graph |
| `mcp__memory__search_nodes` | Search nodes |

### 2.6 sequentialthinking (1) ✅

| Tool | Description |
|------|-------------|
| `mcp__sequentialthinking__sequentialthinking` | Step-by-step thinking process |

### 2.7 serena (26) ✅

| Tool | Description |
|------|-------------|
| `mcp__serena__activate_project` | Activate project by name or path |
| `mcp__serena__check_onboarding_performed` | Check if project onboarding was done |
| `mcp__serena__find_file` | Find files matching pattern |
| `mcp__serena__find_referencing_symbols` | Find symbols referencing a symbol |
| `mcp__serena__find_symbol` | Find symbol (class, method, function) |
| `mcp__serena__get_current_config` | Show current agent configuration |
| `mcp__serena__get_symbols_overview` | Get overview of symbols in file |
| `mcp__serena__initial_instructions` | Read Serena usage manual |
| `mcp__serena__insert_after_symbol` | Insert code after symbol |
| `mcp__serena__insert_before_symbol` | Insert code before symbol |
| `mcp__serena__list_dir` | List directory contents |
| `mcp__serena__list_memories` | List all memories |
| `mcp__serena__onboarding` | Start project onboarding process |
| `mcp__serena__open_dashboard` | Open Serena web dashboard |
| `mcp__serena__read_memory` | Read memory file |
| `mcp__serena__rename_memory` | Rename memory file |
| `mcp__serena__rename_symbol` | Rename symbol across codebase |
| `mcp__serena__replace_symbol_body` | Replace symbol body |
| `mcp__serena__search_for_pattern` | Search pattern in codebase |
| `mcp__serena__think_about_collected_information` | Evaluate information completeness |
| `mcp__serena__think_about_task_adherence` | Check if still on track |
| `mcp__serena__think_about_whether_you_are_done` | Check if task is complete |
| `mcp__serena__write_memory` | Write project memory |
| `mcp__serena__delete_memory` | Delete memory file |
| `mcp__serena__edit_memory` | Edit memory content |

### 2.8 web_reader (1) ✅

| Tool | Description |
|------|-------------|
| `mcp__web_reader__webReader` | Read URL as markdown (LLM-friendly) |

### 2.9 4_5v_mcp (1) ✅

| Tool | Description |
|------|-------------|
| `mcp__4_5v_mcp__analyze_image` | Analyze images using AI vision models (remote URLs only) |

---

## 3. Skills (26) - ✅ VERIFIED FROM SETTINGS

### 3.1 superpowers (14) ✅

| Skill | Description |
|-------|-------------|
| `superpowers:brainstorming` | Requirements exploration before creative work |
| `superpowers:dispatching-parallel-agents` | Parallel task dispatch |
| `superpowers:executing-plans` | Execute implementation plans |
| `superpowers:finishing-a-development-branch` | Branch completion workflow |
| `superpowers:receiving-code-review` | Handle review feedback |
| `superpowers:requesting-code-review` | Request code review |
| `superpowers:subagent-driven-development` | Parallel agent execution |
| `superpowers:systematic-debugging` | Debug workflow |
| `superpowers:test-driven-development` | TDD workflow |
| `superpowers:using-git-worktrees` | Git worktree management |
| `superpowers:using-superpowers` | Introduction to skills |
| `superpowers:verification-before-completion` | Verify before completion |
| `superpowers:writing-plans` | Implementation planning |
| `superpowers:writing-skills` | Create and edit skills |

### 3.2 claude-md-management (2) ✅

| Skill | Description |
|-------|-------------|
| `claude-md-management:revise-claude-md` | Update CLAUDE.md with learnings from session |
| `claude-md-management:claude-md-improver` | Audit and improve CLAUDE.md files |

### 3.3 frontend-design (1) ✅

| Skill | Description |
|-------|-------------|
| `frontend-design:frontend-design` | Production-grade frontend interfaces |

### 3.4 plugin-dev (8) ✅

| Skill | Description |
|-------|-------------|
| `plugin-dev:agent-development` | Create agents for plugins |
| `plugin-dev:command-development` | Create slash commands |
| `plugin-dev:hook-development` | Create hooks (PreToolUse, PostToolUse, etc.) |
| `plugin-dev:mcp-integration` | Integrate MCP servers into plugins |
| `plugin-dev:plugin-settings` | Configure plugin settings |
| `plugin-dev:plugin-structure` | Plugin directory structure and manifest |
| `plugin-dev:skill-development` | Create skills for plugins |
| `plugin-dev:create-plugin` | End-to-end plugin creation workflow |

### 3.5 claude-code-setup (1) ✅

| Skill | Description |
|-------|-------------|
| `claude-code-setup:claude-automation-recommender` | Analyze codebase and recommend automations |

---

## 4. Task Tool Agent Types (Built-in to Task tool)

### 4.1 General Agents

| Agent | Description |
|-------|-------------|
| `Bash` | Command execution specialist |
| `general-purpose` | Complex multi-step tasks, code search |
| `Explore` | Fast codebase exploration (quick/medium/thorough) |
| `Plan` | Architecture design, implementation strategy |

### 4.2 Review Agents (via Task tool)

| Agent | Description |
|-------|-------------|
| `superpowers:code-reviewer` | Review against plan and coding standards |

### 4.3 Plugin Development Agents

| Agent | Description |
|-------|-------------|
| `plugin-dev:agent-creator` | Create custom agents for plugins |
| `plugin-dev:skill-reviewer` | Review skill quality |
| `plugin-dev:plugin-validator` | Validate plugin structure |

### 4.4 Other

| Agent | Description |
|-------|-------------|
| `statusline-setup` | Configure status line settings |
| `claude-code-guide` | Claude Code CLI help and features |

---

## 5. Enabled Plugins (from ~/.claude/settings.json)

| Plugin | Status |
|--------|--------|
| `typescript-lsp@claude-plugins-official` | ✅ Enabled |
| `pyright-lsp@claude-plugins-official` | ✅ Enabled |
| `gopls-lsp@claude-plugins-official` | ✅ Enabled |
| `rust-analyzer-lsp@claude-plugins-official` | ✅ Enabled |
| `clangd-lsp@claude-plugins-official` | ✅ Enabled |
| `kotlin-lsp@claude-plugins-official` | ✅ Enabled |
| `jdtls-lsp@claude-plugins-official` | ✅ Enabled |
| `swift-lsp@claude-plugins-official` | ✅ Enabled |
| `superpowers@claude-plugins-official` | ✅ Enabled |
| `security-guidance@claude-plugins-official` | ✅ Enabled |
| `frontend-design@claude-plugins-official` | ✅ Enabled |
| `learning-output-style@claude-plugins-official` | ✅ Enabled |
| `claude-md-management@claude-plugins-official` | ✅ Enabled |
| `plugin-dev@claude-plugins-official` | ✅ Enabled |
| `claude-code-setup@claude-plugins-official` | ✅ Enabled |

---

## 6. Summary

| Category | Count |
|----------|-------|
| Built-in Tools | 22 |
| MCP: context7 | 2 |
| MCP: doc-forge | 16 |
| MCP: fetch | 1 |
| MCP: filesystem | 15 |
| MCP: memory | 9 |
| MCP: sequentialthinking | 1 |
| MCP: serena | 26 |
| MCP: web_reader | 1 |
| MCP: 4_5v_mcp | 1 |
| **MCP Subtotal** | **72** |
| Skills: superpowers | 14 |
| Skills: claude-md-management | 2 |
| Skills: frontend-design | 1 |
| Skills: plugin-dev | 8 |
| Skills: claude-code-setup | 1 |
| **Skills Subtotal** | **26** |
| Task Agents | 10 |
| Enabled Plugins | 15 |
| **Grand Total** | **145** |

---

## 7. Quick Reference by Use Case

### File Operations
- Built-in: `Read`, `Write`, `Edit`, `Glob`, `Grep`
- MCP filesystem: `read_text_file`, `write_file`, `edit_file`, `list_directory`, `search_files`
- MCP serena: `list_dir`, `find_file`

### Code Analysis
- MCP serena: `find_symbol`, `find_referencing_symbols`, `get_symbols_overview`, `search_for_pattern`

### Documentation & Research
- MCP context7: `resolve-library-id`, `query-docs`
- MCP web_reader: `webReader`
- MCP fetch: `fetch`
- Built-in: `WebSearch`

### Document Processing
- MCP doc-forge: `document_reader`, `pdf_merger`, `pdf_splitter`, `excel_read`, `docx_to_pdf`

### Memory & Knowledge Graph
- MCP memory: `create_entities`, `create_relations`, `search_nodes`, `read_graph`
- MCP serena: `write_memory`, `read_memory`, `list_memories`

### Task Management
- Built-in: `TaskCreate`, `TaskGet`, `TaskUpdate`, `TaskList`
- MCP serena: `think_about_*` tools for reflection

### Plugin Development
- Skills: `plugin-dev:create-plugin`, `plugin-dev:plugin-structure`
- Skills: `plugin-dev:command-development`, `plugin-dev:skill-development`
- Skills: `plugin-dev:agent-development`, `plugin-dev:hook-development`
- Skills: `plugin-dev:mcp-integration`, `plugin-dev:plugin-settings`

---

## 8. Removed/Deprecated Items

> Items ที่ถูกลบออกจากระบบตั้งแต่อัปเดตครั้งก่อน:

### Removed MCP Servers
| Server | Tools Removed | Status |
|--------|---------------|--------|
| `docker` | 1 | ❌ Removed |
| `drawio` | 20 | ❌ Removed |
| `mermaid` | 1 | ❌ Removed |
| `n8n-mcp` | 21 | ❌ Removed |
| `ide` | 2 | ❌ Removed |

### Removed Skills
| Skill Package | Status |
|---------------|--------|
| `dev-commit:skills` | ❌ Removed |
| `orchestrator-dev:*` (all agents) | ❌ Removed |
| `pr-review-toolkit` | ❌ Removed |
| `commit-commands` | ❌ Removed |
| `ralph-loop` | ❌ Removed |
| `code-review` | ❌ Removed |
| `code-simplifier` | ❌ Removed |
| `feature-dev` | ❌ Removed |
| `claude-developer-platform` | ❌ Removed |

### Removed Plugins
| Plugin | Status |
|--------|--------|
| `dev-commit@skill-dev-commit` | ❌ Removed |
| `orchestrator-dev@orchestrator-dev-marketplace` | ❌ Removed |

---

## 9. Running MCP Servers (Verified by `ps aux`)

```
1. context7     - tsx /Users/tanaphat.oiu/I-Me/context7/packages/mcp/src/index.ts
2. fetch        - mcp-server-fetch (Python)
3. serena       - serena start-mcp-server --context claude-code
4. doc-forge    - mcp-doc-forge/dist/index.cjs
5. filesystem   - modelcontextprotocol/servers/src/filesystem
6. memory       - modelcontextprotocol/servers/src/memory
7. sequentialthinking - modelcontextprotocol/servers/src/sequentialthinking
8. 4_5v_mcp     - AI vision analysis
9. web_reader   - URL to markdown converter
```

---

## 10. Changelog

### 2026-02-28
- ➖ Removed `docker` MCP server (1 tool)
- ➖ Removed `drawio` MCP server (20 tools)
- ➖ Removed `mermaid` MCP server (1 tool)
- ➖ Removed `n8n-mcp` MCP server (21 tools)
- ➖ Removed `ide` MCP server (2 tools)
- ➖ Removed `dev-commit:skills` skill
- ➖ Removed `orchestrator-dev` plugin and all agents
- ➕ Added `EnterWorktree` built-in tool
- 🔄 Updated counts: MCP tools 117→72, Skills 28→26, Total 201→145
- 🔄 Removed: 45 MCP tools, 2 skills, 2 plugins

### 2026-02-27
- ➕ Added `ToolSearch` built-in tool
- ➕ Added `drawio` MCP server (20 tools)
- ➕ Added `plugin-dev` skills (8 skills)
- ➕ Added `claude-code-setup` skill (1 skill)
- ➕ Added `plugin-dev` and `claude-code-setup` to plugins list
- 🔄 Updated counts: MCP tools 98→117, Skills 19→28, Total 167→201
