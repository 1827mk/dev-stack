---
name: docs
description: |
  Documentation Command - Execute documentation tasks within docs scope only.
  This command does NOT spawn agents - it executes directly.
  Use this for documentation-related operations like creating/updating docs, reading docs.
arguments:
  - name: task
    description: The documentation task description
    required: true
---

# Dev-Stack: Docs - Documentation Operations

You are executing a **scoped documentation task** within the `docs` scope.

## Scope Boundary

```
┌─────────────────────────────────────────────────────────────┐
│                      docs SCOPE                             │
│                                                             │
│  ✅ ALLOWED:                                                │
│  • Read documentation (doc-forge.document_reader)          │
│  • Write markdown/text (filesystem.write_file)             │
│  • Convert doc formats (doc-forge.format_convert)          │
│  • Read API docs (context7.query-docs)                     │
│  • Read files (filesystem.read_text_file)                  │
│  • List directories (filesystem.list_directory)            │
│                                                             │
│  ❌ BLOCKED:                                                │
│  • code.write_code (modifying source code)                 │
│  • git.* (all git operations)                              │
│  • quality.run_tests                                       │
└─────────────────────────────────────────────────────────────┘
```

## Tool Priority (CRITICAL)

```
┌─────────────────────────────────────────────────────────────┐
│  PRIORITY ORDER FOR DOCS OPERATIONS:                        │
│                                                             │
│  1. doc-forge MCP (Primary for documents)                   │
│     • document_reader   → Read PDF, DOCX, HTML, CSV        │
│     • excel_read        → Read Excel files                 │
│     • format_convert    → Convert between formats          │
│     • docx_to_html      → DOCX to HTML                     │
│     • docx_to_pdf       → DOCX to PDF                      │
│     • html_to_markdown  → HTML to Markdown                 │
│                                                             │
│  2. filesystem MCP (Primary for writing)                    │
│     • write_file        → Write markdown/text files        │
│     • read_text_file    → Read text files                  │
│                                                             │
│  3. context7 MCP (Primary for API docs)                     │
│     • resolve-library-id → Find library ID                 │
│     • query-docs        → Query library documentation      │
│                                                             │
│  4. Built-in Tools (FALLBACK ONLY)                          │
│     • Read, Write, WebSearch                               │
│     ⚠️ MUST log warning when using fallback                 │
└─────────────────────────────────────────────────────────────┘
```

## Execution Steps

### Step 1: Validate Scope

Check if the task is within `docs` scope:

| Task Type | In Scope? | Suggestion |
|-----------|-----------|------------|
| "create README" | ✅ Yes | Proceed |
| "update API docs" | ✅ Yes | Proceed |
| "read the PDF documentation" | ✅ Yes | Proceed |
| "convert DOCX to markdown" | ✅ Yes | Proceed |
| "fix bug in code" | ❌ No | Use `/dev-stack:dev` |
| "commit changes" | ❌ No | Use `/dev-stack:git` |
| "run tests" | ❌ No | Use `/dev-stack:quality` |

### Step 2: Select Tools

Based on the task, select appropriate tools:

| Operation | Primary Tool | Fallback |
|-----------|--------------|----------|
| Read PDF | doc-forge.document_reader | Read (text only) |
| Read DOCX | doc-forge.document_reader | Read (text only) |
| Read Excel | doc-forge.excel_read | Read (CSV only) |
| Write markdown | filesystem.write_file | Write |
| Convert formats | doc-forge.format_convert | Manual conversion |
| Query API docs | context7.query-docs | WebSearch |

### Step 3: Execute

Execute the documentation task directly:
1. Read existing documentation using MCP tools
2. Create or update documentation using filesystem.write_file
3. Verify changes are correct

### Step 4: Report

Report what was done:
- Files created/modified
- Documentation changes summary
- Tools used (note if fallback was used)

## Common Workflows

### Create README

```
/dev-stack:docs "create a README.md for the auth module"

Expected:
1. Analyze auth module structure
2. Create README with sections:
   - Overview
   - Installation
   - Usage
   - API Reference
3. Write file using filesystem.write_file
4. Report file created
```

### Update API Documentation

```
/dev-stack:docs "update the API documentation with new endpoints"

Expected:
1. Read existing API docs
2. Identify new endpoints from code
3. Update documentation
4. Write changes using filesystem.write_file
5. Report updates made
```

### Read External Documentation

```
/dev-stack:docs "read the React hooks documentation from context7"

Expected:
1. Resolve library ID: context7.resolve-library-id
2. Query docs: context7.query-docs
3. Summarize findings
4. Report information found
```

## Document Templates

### README Template

```markdown
# Module Name

Brief description of what this module does.

## Installation

```bash
npm install module-name
```

## Usage

```javascript
import { func } from 'module-name';
func();
```

## API Reference

### `functionName(param1, param2)`

Description of the function.

**Parameters:**
- `param1` (Type): Description
- `param2` (Type): Description

**Returns:** Type - Description

## Examples

Code examples here.

## License

MIT
```

### API Docs Template

```markdown
# API Reference

## Endpoints

### GET /api/resource

Description of the endpoint.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | Resource ID |

**Response:**
```json
{
  "id": "string",
  "name": "string"
}
```

**Status Codes:**
- 200: Success
- 404: Not found
- 500: Server error
```

## Important Rules

1. **Stay in Scope**: Never modify source code or perform git operations
2. **MCP First**: Always try doc-forge/filesystem MCP tools before built-in
3. **No Agents**: Execute directly, do not spawn sub-agents
4. **Report Boundary Violations**: If task requires other scope, report to user
5. **Log Fallback Usage**: Warn when using built-in tools
