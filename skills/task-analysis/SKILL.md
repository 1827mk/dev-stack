# Task Analysis Skill

## Purpose
Parse natural language task descriptions to identify:
1. **Intent** - What the user wants to accomplish
2. **Scopes** - Which operational scopes are needed (dev, git, docs, quality)
3. **Capabilities** - What capabilities are required
4. **Complexity** - How complex the task is (low, medium, high)

## Tool Priority

```
┌─────────────────────────────────────────────────────────────┐
│  USE THESE TOOLS FOR TASK ANALYSIS:                        │
│                                                             │
│  🔴 PRIMARY: MCP Tools                                     │
│     ├── memory.search_nodes → Recall past similar tasks    │
│     ├── memory.read_graph → Get task patterns              │
│     └── serena.read_memory → Read saved patterns           │
│                                                             │
│  🟢 FALLBACK: Built-in                                     │
│     └── Read (for reading pattern files)                   │
└─────────────────────────────────────────────────────────────┘
```

## Input Format

```json
{
  "task": "User's natural language task description",
  "context": {
    "project_type": "web|api|cli|library",
    "language": "typescript|python|etc",
    "available_scopes": ["dev", "git", "docs", "quality"]
  }
}
```

## Output Format

```json
{
  "intent": "feature|bug_fix|refactor|documentation|testing|git_operation",
  "description": "Clear description of what needs to be done",
  "scopes": {
    "primary": "dev",
    "additional": ["docs"]
  },
  "capabilities": [
    "read_code",
    "write_code",
    "search_code"
  ],
  "complexity": "low|medium|high",
  "breakdown": [
    {
      "step": 1,
      "description": "Step description",
      "scope": "dev",
      "capability": "read_code"
    }
  ],
  "ambiguities": [
    "Any unclear aspects that need clarification"
  ]
}
```

## Intent Detection Patterns

### Feature Development
```
Patterns:
  - "add", "create", "implement", "build", "develop"
  - "new feature", "new functionality"
  
Intent: feature
Scope: dev (primary), docs (if API/user-facing)
Complexity: medium to high
```

### Bug Fix
```
Patterns:
  - "fix", "bug", "error", "issue", "problem"
  - "not working", "broken", "crashes"
  
Intent: bug_fix
Scope: dev (primary), quality (for tests)
Complexity: low to medium
```

### Refactoring
```
Patterns:
  - "refactor", "restructure", "reorganize"
  - "clean up", "improve", "optimize"
  
Intent: refactor
Scope: dev (primary)
Complexity: medium to high
```

### Documentation
```
Patterns:
  - "document", "write docs", "update readme"
  - "add comments", "explain", "describe"
  
Intent: documentation
Scope: docs (primary)
Complexity: low to medium
```

### Testing
```
Patterns:
  - "test", "write tests", "add coverage"
  - "run tests", "check tests"
  
Intent: testing
Scope: quality (primary), dev (if writing test code)
Complexity: low to medium
```

### Git Operations
```
Patterns:
  - "commit", "push", "branch", "merge"
  - "git status", "git log", "version control"
  
Intent: git_operation
Scope: git (primary)
Complexity: low
```

## Scope Detection Rules

### Single Scope Detection
```
Task: "Fix the login bug"
→ Keywords: "fix", "bug"
→ Scope: dev ✓

Task: "Update the README"
→ Keywords: "README", "update"
→ Scope: docs ✓

Task: "Run the tests"
→ Keywords: "run", "tests"
→ Scope: quality ✓

Task: "Commit the changes"
→ Keywords: "commit"
→ Scope: git ✓
```

### Multi-Scope Detection
```
Task: "Add authentication and update docs"
→ Keywords: "add" (dev), "docs" (docs)
→ Scopes: [dev, docs]

Task: "Fix the bug and run tests"
→ Keywords: "fix" (dev), "tests" (quality)
→ Scopes: [dev, quality]

Task: "Refactor code and commit"
→ Keywords: "refactor" (dev), "commit" (git)
→ Scopes: [dev, git]
```

## Complexity Estimation

### Low Complexity
```
Indicators:
  - Single file modification
  - Simple text changes
  - Adding a small function
  - Running existing tests
  - Simple git operations
  
Examples:
  - "Fix typo in README"
  - "Add console.log for debugging"
  - "Run npm test"
```

### Medium Complexity
```
Indicators:
  - Multiple files (2-5)
  - New feature in existing module
  - Bug fix with investigation needed
  - Documentation update
  - Moderate refactoring
  
Examples:
  - "Add validation to login form"
  - "Fix the authentication bug"
  - "Update API documentation"
```

### High Complexity
```
Indicators:
  - Many files (>5)
  - New module/feature from scratch
  - Architecture changes
  - Cross-cutting concerns
  - Database schema changes
  
Examples:
  - "Implement user authentication system"
  - "Migrate to TypeScript"
  - "Refactor database layer"
```

## Capability Mapping

### For Dev Scope
```yaml
capabilities:
  - read_code      # serena.find_symbol
  - write_code     # serena.replace_symbol_body
  - search_code    # serena.search_for_pattern
  - analyze_code   # serena.get_symbols_overview
```

### For Docs Scope
```yaml
capabilities:
  - read_docs      # doc-forge.document_reader
  - write_docs     # filesystem.write_file
  - read_api_docs  # context7.query-docs
```

### For Quality Scope
```yaml
capabilities:
  - run_tests      # Bash(npm test)
  - run_linter     # Bash(npm run lint)
```

### For Git Scope
```yaml
capabilities:
  - git_status     # Bash(git status)
  - git_commit     # Bash(git commit)
  - git_push       # Bash(git push)
```

## Ambiguity Detection

### Request Clarification When:
1. **Vague scope**: "update the project" → Which part?
2. **Missing context**: "fix it" → Fix what?
3. **Conflicting intents**: "fix and add feature" → Which first?
4. **Unknown terms**: Domain-specific jargon
5. **Multiple interpretations**: Could mean different things

### Clarification Prompt Template
```markdown
I need clarification on your task:

**Ambiguity**: [What's unclear]

**Possible interpretations**:
1. [Option 1]
2. [Option 2]

**Please clarify**: [Specific question]
```

## Example Analyses

### Example 1: Simple Bug Fix
```json
Input: "Fix the login validation bug"

Output:
{
  "intent": "bug_fix",
  "description": "Fix a bug in the login validation logic",
  "scopes": {
    "primary": "dev",
    "additional": []
  },
  "capabilities": ["read_code", "search_code", "write_code"],
  "complexity": "low",
  "breakdown": [
    {"step": 1, "description": "Find login validation code", "scope": "dev", "capability": "search_code"},
    {"step": 2, "description": "Identify the bug", "scope": "dev", "capability": "read_code"},
    {"step": 3, "description": "Fix the validation logic", "scope": "dev", "capability": "write_code"}
  ],
  "ambiguities": []
}
```

### Example 2: Multi-Scope Feature
```json
Input: "Add user profile page and update the API docs"

Output:
{
  "intent": "feature",
  "description": "Create user profile page and document the API",
  "scopes": {
    "primary": "dev",
    "additional": ["docs"]
  },
  "capabilities": ["write_code", "read_code", "write_docs", "read_api_docs"],
  "complexity": "medium",
  "breakdown": [
    {"step": 1, "description": "Create profile component", "scope": "dev", "capability": "write_code"},
    {"step": 2, "description": "Add profile API endpoint", "scope": "dev", "capability": "write_code"},
    {"step": 3, "description": "Update API documentation", "scope": "docs", "capability": "write_docs"}
  ],
  "ambiguities": []
}
```

### Example 3: Ambiguous Task
```json
Input: "Update the project"

Output:
{
  "intent": "unknown",
  "description": "Update something in the project",
  "scopes": {
    "primary": "unknown",
    "additional": []
  },
  "capabilities": [],
  "complexity": "unknown",
  "breakdown": [],
  "ambiguities": [
    "What part of the project should be updated?",
    "What kind of update? (code, docs, dependencies)"
  ]
}
```

## Memory Integration

### Store Task Patterns
```python
# After successful task analysis
memory.create_entities([{
    "name": f"task_pattern_{intent}",
    "entityType": "task_pattern",
    "observations": [
        f"Intent: {intent}",
        f"Typical scopes: {scopes}",
        f"Typical capabilities: {capabilities}",
        f"Complexity: {complexity}"
    ]
}])
```

### Recall Past Patterns
```python
# Before analyzing new task
memory.search_nodes(query=f"task pattern {keywords}")
```

## Best Practices

1. **Be specific in output** - Clear, actionable descriptions
2. **Detect all scopes** - Don't miss multi-scope tasks
3. **Estimate complexity accurately** - Affects worker allocation
4. **Flag ambiguities** - Better to ask than assume
5. **Use memory** - Learn from past analyses
6. **Validate scope boundaries** - Ensure capabilities match scopes
