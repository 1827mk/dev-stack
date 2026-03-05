# Tool Selection Skill

## Purpose
Select the optimal tool for a given capability, following the MCP-first priority system.

## Critical Rule: MCP FIRST

```
┌─────────────────────────────────────────────────────────────┐
│  ⛔ ALWAYS TRY MCP TOOLS FIRST                              │
│                                                             │
│  Priority Order:                                            │
│  1. MCP Server Tools (serena, filesystem, doc-forge, etc.) │
│  2. Plugin Skills (if available)                           │
│  3. Built-in Tools (Read, Write, Edit, Bash) - LAST       │
│                                                             │
│  ⚠️ If using built-in tools: LOG WARNING                   │
└─────────────────────────────────────────────────────────────┘
```

## Tool Priority System

### Priority Levels

| Priority | Type | Tools | When to Use |
|----------|------|-------|-------------|
| 1 (Primary) | MCP Server | serena.*, filesystem.*, doc-forge.*, context7.*, memory.* | ALWAYS try first |
| 2 (Secondary) | Plugin Skills | task-analysis, workflow-design, tool-selection | Context-aware operations |
| 3 (Fallback) | Built-in | Read, Write, Edit, Bash, Grep, Glob | ONLY when MCP unavailable |

## Capability Mapping

### Code Operations

```yaml
read_code:
  primary:
    - tool: mcp__serena__find_symbol
      description: Find and read code symbols by name
    - tool: mcp__serena__get_symbols_overview
      description: Get file structure and symbols
  fallback:
    - tool: Read
      warning: "Using Read instead of serena.find_symbol"
    - tool: Grep
      warning: "Using Grep instead of serena.search_for_pattern"

write_code:
  primary:
    - tool: mcp__serena__replace_symbol_body
      description: Replace entire symbol body
    - tool: mcp__serena__insert_after_symbol
      description: Insert code after a symbol
    - tool: mcp__serena__insert_before_symbol
      description: Insert code before a symbol
  fallback:
    - tool: Edit
      warning: "Using Edit instead of serena.replace_symbol_body"
    - tool: Write
      warning: "Using Write instead of serena.insert_*"

search_code:
  primary:
    - tool: mcp__serena__search_for_pattern
      description: Search codebase with regex
    - tool: mcp__serena__find_referencing_symbols
      description: Find symbol references
  fallback:
    - tool: Grep
      warning: "Using Grep instead of serena.search_for_pattern"
    - tool: Glob
      warning: "Using Glob for file search"
```

### File Operations

```yaml
read_file:
  primary:
    - tool: mcp__filesystem__read_text_file
      description: Read file contents as text
    - tool: mcp__filesystem__read_multiple_files
      description: Read multiple files at once
  fallback:
    - tool: Read
      warning: "Using Read instead of filesystem.read_text_file"

write_file:
  primary:
    - tool: mcp__filesystem__write_file
      description: Write content to file
  fallback:
    - tool: Write
      warning: "Using Write instead of filesystem.write_file"

list_directory:
  primary:
    - tool: mcp__filesystem__list_directory
      description: List directory contents
    - tool: mcp__filesystem__directory_tree
      description: Get recursive directory tree
  fallback:
    - tool: Bash
      command: "ls -la"
      warning: "Using Bash(ls) instead of filesystem.list_directory"

search_files:
  primary:
    - tool: mcp__filesystem__search_files
      description: Search files by pattern
  fallback:
    - tool: Glob
      warning: "Using Glob instead of filesystem.search_files"

edit_file:
  primary:
    - tool: mcp__filesystem__edit_file
      description: Line-based file editing
  fallback:
    - tool: Edit
      warning: "Using Edit instead of filesystem.edit_file"
```

### Documentation Operations

```yaml
read_docs:
  primary:
    - tool: mcp__doc-forge__document_reader
      description: Read PDF, DOCX, etc.
    - tool: mcp__doc-forge__excel_read
      description: Read Excel files
    - tool: mcp__doc-forge__html_to_markdown
      description: Convert HTML to markdown
  fallback:
    - tool: Read
      warning: "Using Read for document - limited format support"

convert_docs:
  primary:
    - tool: mcp__doc-forge__docx_to_html
    - tool: mcp__doc-forge__docx_to_pdf
    - tool: mcp__doc-forge__format_convert
    - tool: mcp__doc-forge__pdf_merger
    - tool: mcp__doc-forge__pdf_splitter
  fallback:
    - tool: Bash
      warning: "External tools may not be available"

read_api_docs:
  primary:
    - tool: mcp__context7__resolve-library-id
      description: Resolve library ID for docs
    - tool: mcp__context7__query-docs
      description: Query library documentation
  fallback:
    - tool: WebSearch
      warning: "Using WebSearch instead of context7"
```

### Memory Operations

```yaml
memory_store:
  primary:
    - tool: mcp__memory__create_entities
      description: Store entities in knowledge graph
    - tool: mcp__memory__create_relations
      description: Create entity relations
    - tool: mcp__memory__add_observations
      description: Add observations to entities
    - tool: mcp__serena__write_memory
      description: Write to Serena memory
  fallback:
    - tool: Write
      file: ".claude/memory.json"
      warning: "Using file-based memory instead of MCP"

memory_recall:
  primary:
    - tool: mcp__memory__search_nodes
      description: Search knowledge graph
    - tool: mcp__memory__read_graph
      description: Read entire graph
    - tool: mcp__memory__open_nodes
      description: Open specific nodes
    - tool: mcp__serena__read_memory
      description: Read from Serena memory
  fallback:
    - tool: Read
      file: ".claude/memory.json"
      warning: "Using file-based memory instead of MCP"
```

### Quality Operations

```yaml
run_tests:
  primary:
    - tool: Bash
      command: "npm test"
      description: Run test suite
  fallback:
    - tool: Bash
      command: "pytest"  # Python fallback
      warning: "Using pytest instead of npm test"

run_linter:
  primary:
    - tool: Bash
      command: "npm run lint"
      description: Run linter
  fallback:
    - tool: Bash
      command: "eslint ."  # Direct eslint
      warning: "Using direct eslint command"
```

### Git Operations

```yaml
git_status:
  primary:
    - tool: Bash
      command: "git status"
  fallback: none

git_commit:
  primary:
    - tool: Bash
      command: "git commit"
  fallback: none

git_push:
  primary:
    - tool: Bash
      command: "git push"
  fallback: none
```

## Selection Algorithm

```python
def select_tool(capability, scope=None):
    """
    Select the best tool for a capability.
    
    Args:
        capability: The capability needed (e.g., "read_code")
        scope: Optional scope context (dev, docs, quality, git)
    
    Returns:
        Selected tool and any warnings
    """
    
    # Step 1: Get capability mapping
    mapping = CAPABILITY_MAPPING.get(capability)
    if not mapping:
        return error(f"Unknown capability: {capability}")
    
    # Step 2: Try PRIMARY (MCP) tools first
    for tool_config in mapping.get("primary", []):
        tool_name = tool_config["tool"]
        if is_mcp_tool_available(tool_name):
            return {
                "tool": tool_name,
                "priority": "primary",
                "description": tool_config.get("description"),
                "warning": None
            }
    
    # Step 3: Log warning - falling back
    log_warning(f"All MCP tools for {capability} unavailable")
    
    # Step 4: Use FALLBACK (built-in) tools
    for tool_config in mapping.get("fallback", []):
        tool_name = tool_config["tool"]
        return {
            "tool": tool_name,
            "priority": "fallback",
            "description": tool_config.get("description"),
            "warning": tool_config.get("warning"),
            "command": tool_config.get("command")
        }
    
    # Step 5: No tool available
    return error(f"No tool available for capability: {capability}")
```

## MCP Availability Check

```python
def is_mcp_tool_available(tool_name):
    """
    Check if an MCP tool is available.
    
    MCP tools follow the pattern: mcp__{server}__{tool}
    """
    if not tool_name.startswith("mcp__"):
        return True  # Built-in tools always available
    
    # Parse server name
    parts = tool_name.split("__")
    if len(parts) < 2:
        return False
    
    server_name = parts[1]
    
    # Check server availability
    # This would be implemented based on actual MCP server status
    return check_mcp_server_status(server_name)
```

## Warning Logging

### When to Log Warning
- Using fallback tool when MCP is expected
- MCP server not responding
- Tool capability degraded

### Warning Format
```markdown
⚠️ FALLBACK WARNING
────────────────────────────────────────
Capability: [capability]
Primary Tool: [mcp tool] (unavailable)
Fallback Tool: [built-in tool] (used)
Reason: [why MCP unavailable]
Impact: [what functionality is affected]
────────────────────────────────────────
```

## Scope-Based Filtering

### Dev Scope
```yaml
allowed_capabilities:
  - read_code
  - write_code
  - search_code
  - analyze_code
  - read_file
  - write_file
  - list_directory
```

### Docs Scope
```yaml
allowed_capabilities:
  - read_docs
  - write_docs
  - read_file
  - write_file
  - read_api_docs
  - convert_docs
```

### Quality Scope
```yaml
allowed_capabilities:
  - run_tests
  - run_linter
  - read_file  # For reading test results
  - search_code  # For finding test files
```

### Git Scope
```yaml
allowed_capabilities:
  - git_status
  - git_commit
  - git_push
```

## Example Usage

### Example 1: Read Code
```python
# Request
select_tool("read_code", scope="dev")

# Response (MCP available)
{
    "tool": "mcp__serena__find_symbol",
    "priority": "primary",
    "description": "Find and read code symbols by name",
    "warning": None
}

# Response (MCP unavailable)
{
    "tool": "Read",
    "priority": "fallback",
    "warning": "⚠️ FALLBACK WARNING: Using Read instead of serena.find_symbol"
}
```

### Example 2: Multi-Capability Task
```python
# Task: "Fix the login bug"
capabilities = ["search_code", "read_code", "write_code"]

for cap in capabilities:
    tool = select_tool(cap, scope="dev")
    print(f"{cap}: {tool['tool']} ({tool['priority']})")
    
# Output:
# search_code: mcp__serena__search_for_pattern (primary)
# read_code: mcp__serena__find_symbol (primary)
# write_code: mcp__serena__replace_symbol_body (primary)
```

## Best Practices

1. **Always try MCP first** - Never skip to fallback
2. **Log all fallback usage** - Track when built-in tools are used
3. **Check scope compatibility** - Ensure capability is allowed in scope
4. **Handle unavailability gracefully** - Don't fail, just warn
5. **Report tool usage** - Include in final report
6. **Monitor MCP health** - Track availability over time

## Metrics to Track

```yaml
metrics:
  - mcp_tool_usage_rate:
      target: ">= 90%"
      description: "Percentage of times MCP tools are used vs fallback"
  
  - fallback_warning_count:
      target: "< 10 per session"
      description: "Number of fallback warnings logged"
  
  - tool_selection_accuracy:
      target: "100%"
      description: "Correct tool selected for capability"
```
