# Research URLs - Claude Code Documentation

This file documents all Claude Code documentation URLs researched during plugin development.

---

## URLs Researched

### 1. Hooks System
- **URL**: https://code.claude.com/docs/en/hooks-guide
- **Purpose**: Understanding hook events (SessionStart, PreCompact, etc.)
- **Key Learnings**:
  - SessionStart with `compact` matcher for context re-injection
  - Hook configuration format in hooks.json
  - `${CLAUDE_PLUGIN_ROOT}` environment variable

### 2. Plugin Overview
- **URL**: https://code.claude.com/docs/en/overview
- **Purpose**: Understanding plugin system basics
- **Key Learnings**:
  - Plugin structure and components
  - Core concepts of plugin development

### 3. CLI Reference
- **URL**: https://code.claude.com/docs/en/cli-reference
- **Purpose**: Understanding CLI commands and flags
- **Key Learnings**:
  - `--plugin-dir` flag for testing plugins locally

### 4. Plugins Documentation
- **URL**: https://code.claude.com/docs/en/plugins
- **Purpose**: Plugin development guide
- **Key Learnings**:
  - Plugin structure
  - Configuration files

### 5. Plugin Marketplaces
- **URL**: https://code.claude.com/docs/en/plugin-marketplaces
- **Purpose**: Understanding marketplace distribution
- **Key Learnings**:
  - marketplace.json structure
  - Required fields: name, owner, plugins
  - Plugin sources (relative path, GitHub, Git URL)

### 6. Discover Plugins
- **URL**: https://code.claude.com/docs/en/discover-plugins
- **Purpose**: Plugin discovery and installation
- **Key Learnings**:
  - How plugins are discovered
  - Installation methods

### 7. Plugins Reference
- **URL**: https://code.claude.com/docs/en/plugins-reference
- **Purpose**: Detailed plugin configuration reference
- **Key Learnings**:
  - plugin.json schema
  - Agent configuration
  - Commands directory structure

### 8. Sub-Agents
- **URL**: https://code.claude.com/docs/en/sub-agents
- **Purpose**: Understanding agent configuration format
- **Key Learnings**:
  - Agent frontmatter format (name, description, model, color, tools)
  - Description must include `<example>` blocks with triggering conditions
  - Required fields: name, description, model, color
  - Tools field uses array format: `["Tool1", "Tool2"]`

### 9. Agent Development Skill
- **Source**: plugin-dev:agent-development skill (via Skill tool)
- **Purpose**: Understanding how to create agents correctly
- **Key Learnings**:
  - Required frontmatter fields: name, description, model, color
  - Description format must `<example>` blocks with:
    - Context
    - user request
    - assistant response
    - `<commentary>` explaining why agent triggers
  - Color options: blue, cyan, green, yellow, magenta, red
  - Tools array format: `["Tool1", "Tool2"]` (no comments)
  - Model options: inherit, sonnet, opus, haiku

### 8. Sub-Agents (CRITICAL - Need to Research)
- **URL**: https://code.claude.com/docs/en/sub-agents
- **Purpose**: Understanding agent frontmatter format
- **Status**: **PENDING PROPER RESEARCH**
- **Issue**: This is likely where the "agents: Invalid input" error originates

---

## Current Issue

**Error**: `agents: Invalid input`

**Cause**: Agent frontmatter format is incorrect. Need to research sub-agents documentation to understand:
1. Correct YAML frontmatter format
2. Valid tools list format
3. Description field constraints
4. Any other required/optional fields

---

## Action Items

- [x] Fetch and study sub-agents documentation thoroughly
- [x] Understand exact frontmatter format requirements
- [x] Fix all agent files (orchestrator.md, worker.md, researcher.md)
  - Added required `color` field
  - Added proper `<example>` blocks in description
  - Removed comments from tools list
- [x] Re-run validation tests - ALL 46 TESTS PASSED ✅

---

## Notes

- User feedback: "มั่วมากๆ" (very confused/random)
- Root cause: Not properly researching documentation before making changes
- Solution: Always fetch and study documentation first, then make informed changes
