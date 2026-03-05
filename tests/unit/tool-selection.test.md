# Tool Selection Skill - Unit Tests

## Test: TS-001 - MCP Tool Available

**Scenario**: Read code capability with MCP available

**Input**:
```json
{
  "capability": "read_code",
  "scope": "dev",
  "mcp_status": {
    "serena": "available"
  }
}
```

**Expected Output**:
```json
{
  "tool": "mcp__serena__find_symbol",
  "priority": "primary",
  "description": "Find and read code symbols by name",
  "warning": null
}
```

**Validation**:
- [ ] MCP tool selected (serena)
- [ ] Priority is "primary"
- [ ] No warning logged

---

## Test: TS-002 - MCP Unavailable, Use Fallback

**Scenario**: Read code capability with MCP unavailable

**Input**:
```json
{
  "capability": "read_code",
  "scope": "dev",
  "mcp_status": {
    "serena": "unavailable"
  }
}
```

**Expected Output**:
```json
{
  "tool": "Read",
  "priority": "fallback",
  "warning": "⚠️ FALLBACK WARNING: Using Read instead of serena.find_symbol"
}
```

**Validation**:
- [ ] Built-in tool selected (Read)
- [ ] Priority is "fallback"
- [ ] Warning is logged

---

## Test: TS-003 - Multiple MCP Tools

**Scenario**: Multiple MCP tools available for capability

**Input**:
```json
{
  "capability": "read_code",
  "scope": "dev",
  "mcp_status": {
    "serena": "available",
    "filesystem": "available"
  }
}
```

**Expected Output**:
```json
{
  "tool": "mcp__serena__find_symbol",
  "priority": "primary",
  "alternatives": ["mcp__serena__get_symbols_overview", "mcp__filesystem__read_text_file"]
}
```

**Validation**:
- [ ] Primary MCP tool selected
- [ ] Alternative tools available
- [ ] No fallback used

---

## Test: TS-004 - Invalid Capability

**Scenario**: Unknown capability requested

**Input**:
```json
{
  "capability": "unknown_capability",
  "scope": "dev"
}
```

**Expected Output**:
```json
{
  "error": "Unknown capability: unknown_capability",
  "suggestion": "Check config/capabilities.yaml for valid capabilities"
}
```

**Validation**:
- [ ] Error returned
- [ ] Helpful suggestion provided

---

## Test: TS-005 - Scope Filtering

**Scenario**: Capability not allowed in scope

**Input**:
```json
{
  "capability": "git_commit",
  "scope": "dev"
}
```

**Expected Output**:
```json
{
  "error": "Capability git_commit not allowed in scope dev",
  "suggestion": "Use /dev-stack:git command for git operations"
}
```

**Validation**:
- [ ] Error returned
- [ ] Scope violation detected
- [ ] Suggestion for correct command

---

## Test: TS-006 - Filesystem MCP for Files

**Scenario**: File read with filesystem MCP

**Input**:
```json
{
  "capability": "read_file",
  "scope": "dev",
  "mcp_status": {
    "filesystem": "available"
  }
}
```

**Expected Output**:
```json
{
  "tool": "mcp__filesystem__read_text_file",
  "priority": "primary",
  "warning": null
}
```

**Validation**:
- [ ] filesystem MCP used
- [ ] Priority is "primary"

---

## Test: TS-007 - Doc-forge MCP for Docs

**Scenario**: Read documentation with doc-forge MCP

**Input**:
```json
{
  "capability": "read_docs",
  "scope": "docs",
  "mcp_status": {
    "doc-forge": "available"
  }
}
```

**Expected Output**:
```json
{
  "tool": "mcp__doc-forge__document_reader",
  "priority": "primary",
  "warning": null
}
```

**Validation**:
- [ ] doc-forge MCP used
- [ ] Priority is "primary"

---

## Test: TS-008 - Context7 MCP for API Docs

**Scenario**: Query API documentation

**Input**:
```json
{
  "capability": "read_api_docs",
  "scope": "docs",
  "mcp_status": {
    "context7": "available"
  }
}
```

**Expected Output**:
```json
{
  "tool": "mcp__context7__query-docs",
  "priority": "primary",
  "warning": null
}
```

**Validation**:
- [ ] context7 MCP used
- [ ] Priority is "primary"

---

## Test: TS-009 - Memory MCP for Persistence

**Scenario**: Store data in memory

**Input**:
```json
{
  "capability": "memory_store",
  "scope": "dev",
  "mcp_status": {
    "memory": "available"
  }
}
```

**Expected Output**:
```json
{
  "tool": "mcp__memory__create_entities",
  "priority": "primary",
  "warning": null
}
```

**Validation**:
- [ ] memory MCP used
- [ ] Priority is "primary"

---

## Test: TS-010 - All MCP Down, All Fallback

**Scenario**: All MCP servers unavailable

**Input**:
```json
{
  "capability": "read_code",
  "scope": "dev",
  "mcp_status": {
    "serena": "unavailable",
    "filesystem": "unavailable"
  }
}
```

**Expected Output**:
```json
{
  "tool": "Read",
  "priority": "fallback",
  "warning": "⚠️ FALLBACK WARNING: All MCP tools unavailable. Using built-in Read."
}
```

**Validation**:
- [ ] Built-in tool used
- [ ] Warning logged
- [ ] Task still completes

---

## Test Results Summary

| Test ID | Description | MCP Status | Expected Tool | Warning? | Status |
|---------|-------------|------------|---------------|----------|--------|
| TS-001 | MCP available | Available | serena.find_symbol | No | ⏳ |
| TS-002 | MCP unavailable | Unavailable | Read | **Yes** | ⏳ |
| TS-003 | Multiple MCP | Available | serena.* | No | ⏳ |
| TS-004 | Invalid capability | - | Error | No | ⏳ |
| TS-005 | Scope filtering | - | Error | No | ⏳ |
| TS-006 | filesystem MCP | Available | filesystem.read_text_file | No | ⏳ |
| TS-007 | doc-forge MCP | Available | doc-forge.document_reader | No | ⏳ |
| TS-008 | context7 MCP | Available | context7.query-docs | No | ⏳ |
| TS-009 | memory MCP | Available | memory.create_entities | No | ⏳ |
| TS-010 | All MCP down | All Unavailable | Read | **Yes** | ⏳ |

**Pass Rate**: 0/10 (0%)
**MCP Tool Usage Target**: >= 90%
