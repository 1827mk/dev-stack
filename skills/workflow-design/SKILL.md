# Workflow Design Skill

## Purpose
Design execution workflows by:
1. **Sequencing steps** in logical order
2. **Identifying dependencies** between steps
3. **Determining parallelization** opportunities
4. **Applying templates** for common patterns

## Tool Priority

```
┌─────────────────────────────────────────────────────────────┐
│  USE THESE TOOLS FOR WORKFLOW DESIGN:                      │
│                                                             │
│  🔴 PRIMARY: MCP Tools                                     │
│     ├── memory.search_nodes → Recall workflow templates    │
│     ├── memory.read_graph → Get saved workflows            │
│     └── serena.read_memory → Read workflow patterns        │
│                                                             │
│  🟢 FALLBACK: Built-in                                     │
│     └── Read (for reading template files)                  │
└─────────────────────────────────────────────────────────────┘
```

## Input Format

```json
{
  "task_analysis": {
    "intent": "feature",
    "scopes": ["dev", "docs"],
    "capabilities": ["read_code", "write_code", "write_docs"],
    "complexity": "medium"
  },
  "context": {
    "project_type": "web",
    "files_involved": ["src/auth/login.ts", "docs/api.md"]
  }
}
```

## Output Format

```json
{
  "workflow_id": "wf_001",
  "execution_mode": "parallel|sequential|hybrid",
  "steps": [
    {
      "id": "step_1",
      "description": "Step description",
      "scope": "dev",
      "capability": "read_code",
      "tool": "mcp__serena__find_symbol",
      "dependencies": [],
      "parallel_group": 1
    }
  ],
  "parallel_groups": [
    {
      "group_id": 1,
      "steps": ["step_1", "step_2"],
      "rationale": "Independent tasks"
    }
  ],
  "estimated_turns": 10,
  "risks": ["Potential merge conflicts"]
}
```

## Execution Modes

### Parallel Execution
```
When: Steps have no dependencies
Benefit: Faster completion
Example: Multi-scope tasks (dev + docs)

    ┌──────────────┐
    │   Step 1     │──┐
    │   (dev)      │  │
    └──────────────┘  │
                      ├──→ Aggregate Results
    ┌──────────────┐  │
    │   Step 2     │──┘
    │   (docs)     │
    └──────────────┘
```

### Sequential Execution
```
When: Steps depend on previous results
Benefit: Correct ordering
Example: Fix bug → Run tests

    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │   Step 1     │────→│   Step 2     │────→│   Step 3     │
    │   (analyze)  │     │   (fix)      │     │   (verify)   │
    └──────────────┘     └──────────────┘     └──────────────┘
```

### Hybrid Execution
```
When: Mix of dependent and independent steps
Benefit: Optimal resource usage
Example: Feature dev (parallel) → Tests (after dev)

         ┌──────────────┐
         │   Step 1     │──┐
         │   (dev)      │  │
         └──────────────┘  │
                           ├──→ ┌──────────────┐
         ┌──────────────┐  │    │   Step 3     │
         │   Step 2     │──┘    │   (quality)  │
         │   (docs)     │       └──────────────┘
         └──────────────┘
```

## Workflow Templates

### Template: Feature Development
```yaml
name: feature_development
description: Add new feature to codebase
applicable_when:
  intent: feature
  complexity: medium | high

steps:
  - id: analyze
    description: Analyze existing code structure
    scope: dev
    capability: analyze_code
    tool: mcp__serena__get_symbols_overview
    dependencies: []
    
  - id: design
    description: Design feature implementation
    scope: dev
    capability: read_code
    tool: mcp__serena__find_symbol
    dependencies: [analyze]
    
  - id: implement
    description: Implement the feature
    scope: dev
    capability: write_code
    tool: mcp__serena__replace_symbol_body
    dependencies: [design]
    
  - id: document
    description: Update documentation
    scope: docs
    capability: write_docs
    tool: mcp__filesystem__write_file
    dependencies: [implement]
    parallel: false  # After implementation

execution_mode: sequential
estimated_turns: 15
```

### Template: Bug Fix
```yaml
name: bug_fix
description: Fix a bug in the codebase
applicable_when:
  intent: bug_fix
  complexity: low | medium

steps:
  - id: locate
    description: Locate the bug
    scope: dev
    capability: search_code
    tool: mcp__serena__search_for_pattern
    dependencies: []
    
  - id: analyze
    description: Analyze bug cause
    scope: dev
    capability: read_code
    tool: mcp__serena__find_symbol
    dependencies: [locate]
    
  - id: fix
    description: Apply the fix
    scope: dev
    capability: write_code
    tool: mcp__serena__replace_symbol_body
    dependencies: [analyze]
    
  - id: verify
    description: Verify the fix
    scope: quality
    capability: run_tests
    tool: Bash
    dependencies: [fix]

execution_mode: sequential
estimated_turns: 10
```

### Template: Documentation
```yaml
name: documentation
description: Create or update documentation
applicable_when:
  intent: documentation
  complexity: low | medium

steps:
  - id: gather
    description: Gather information
    scope: docs
    capability: read_code
    tool: mcp__serena__get_symbols_overview
    dependencies: []
    
  - id: draft
    description: Draft documentation
    scope: docs
    capability: write_docs
    tool: mcp__filesystem__write_file
    dependencies: [gather]
    
  - id: review
    description: Review documentation
    scope: docs
    capability: read_docs
    tool: mcp__doc-forge__document_reader
    dependencies: [draft]

execution_mode: sequential
estimated_turns: 8
```

### Template: Refactoring
```yaml
name: refactoring
description: Refactor code structure
applicable_when:
  intent: refactor
  complexity: medium | high

steps:
  - id: analyze
    description: Analyze current structure
    scope: dev
    capability: analyze_code
    tool: mcp__serena__get_symbols_overview
    dependencies: []
    
  - id: plan
    description: Plan refactoring approach
    scope: dev
    capability: read_code
    tool: mcp__serena__find_symbol
    dependencies: [analyze]
    
  - id: refactor
    description: Apply refactoring
    scope: dev
    capability: write_code
    tool: mcp__serena__replace_symbol_body
    dependencies: [plan]
    
  - id: verify
    description: Run tests to verify
    scope: quality
    capability: run_tests
    tool: Bash
    dependencies: [refactor]

execution_mode: sequential
estimated_turns: 20
```

### Template: Multi-Scope Feature
```yaml
name: multi_scope_feature
description: Feature requiring multiple scopes
applicable_when:
  intent: feature
  scopes: [dev, docs]
  complexity: medium | high

steps:
  # Parallel Group 1: Implementation
  - id: dev_analyze
    description: Analyze code for feature
    scope: dev
    capability: analyze_code
    tool: mcp__serena__get_symbols_overview
    dependencies: []
    parallel_group: 1
    
  - id: dev_implement
    description: Implement feature
    scope: dev
    capability: write_code
    tool: mcp__serena__replace_symbol_body
    dependencies: [dev_analyze]
    parallel_group: 1

  # Parallel Group 2: Documentation (can start independently)
  - id: docs_plan
    description: Plan documentation structure
    scope: docs
    capability: read_docs
    tool: mcp__doc-forge__document_reader
    dependencies: []
    parallel_group: 2
    
  - id: docs_write
    description: Write documentation
    scope: docs
    capability: write_docs
    tool: mcp__filesystem__write_file
    dependencies: [docs_plan, dev_implement]  # Wait for implementation
    parallel_group: 3  # New group after both complete

execution_mode: hybrid
parallel_groups:
  - group_id: 1
    steps: [dev_analyze]
    workers: [dev-worker]
  - group_id: 2
    steps: [docs_plan]
    workers: [docs-worker]
    
estimated_turns: 15
```

## Dependency Resolution

### Dependency Types

```yaml
dependency_types:
  hard:
    description: "Must complete before dependent step starts"
    example: "fix → verify"
    
  soft:
    description: "Preferred order but can proceed without"
    example: "docs_plan → docs_write (can start with partial info)"
    
  parallel:
    description: "No dependency, can run concurrently"
    example: "dev_analyze ∥ docs_plan"
```

### Dependency Graph

```
Example: Multi-scope feature

     ┌─────────────────┐
     │   Task Start    │
     └────────┬────────┘
              │
     ┌────────┴────────┐
     │                 │
┌────┴────┐      ┌─────┴────┐
│ dev_    │      │ docs_    │
│ analyze │      │ plan     │
└────┬────┘      └─────┬────┘
     │                 │
┌────┴────┐            │
│ dev_    │            │
│implement│            │
└────┬────┘            │
     │                 │
     └────────┬────────┘
              │
        ┌─────┴─────┐
        │ docs_     │
        │ write     │
        └───────────┘
```

## Step Estimation

### Turn Estimation Formula
```
estimated_turns = base_turns + (complexity_factor × scope_count)

Where:
  base_turns = 5 (minimum)
  complexity_factor:
    - low: 1
    - medium: 2
    - high: 3
  scope_count: number of unique scopes
```

### Examples
```
Feature (medium, 2 scopes):
  turns = 5 + (2 × 2) = 9 turns

Bug Fix (low, 1 scope):
  turns = 5 + (1 × 1) = 6 turns

Refactor (high, 2 scopes):
  turns = 5 + (3 × 2) = 11 turns
```

## Risk Assessment

### Common Risks
```yaml
risks:
  merge_conflicts:
    trigger: "Multiple workers modifying same files"
    mitigation: "Coordinate file access, sequential if needed"
    
  scope_violation:
    trigger: "Worker crosses scope boundary"
    mitigation: "Strict scope enforcement, stop on violation"
    
  dependency_cycle:
    trigger: "Circular dependencies in steps"
    mitigation: "Detect and break cycles during planning"
    
  mcp_unavailability:
    trigger: "MCP server down during execution"
    mitigation: "Fallback to built-in tools with warning"
    
  timeout:
    trigger: "Step exceeds max turns"
    mitigation: "Save progress, report partial results"
```

## Workflow Validation

### Pre-Execution Checks
```python
def validate_workflow(workflow):
    errors = []
    
    # Check for cycles
    if has_cycle(workflow.steps):
        errors.append("Workflow contains dependency cycle")
    
    # Check scope compatibility
    for step in workflow.steps:
        if not is_capability_in_scope(step.capability, step.scope):
            errors.append(f"Capability {step.capability} not allowed in scope {step.scope}")
    
    # Check tool availability
    for step in workflow.steps:
        if not is_tool_available(step.tool):
            errors.append(f"Tool {step.tool} not available")
    
    return errors
```

## Memory Integration

### Store Workflow Patterns
```python
# After successful workflow execution
memory.create_entities([{
    "name": f"workflow_{workflow_id}",
    "entityType": "workflow_pattern",
    "observations": [
        f"Intent: {intent}",
        f"Scopes: {scopes}",
        f"Steps: {len(steps)}",
        f"Execution mode: {execution_mode}",
        f"Actual turns: {actual_turns}",
        f"Success: {success}"
    ]
}])
```

### Recall Patterns
```python
# Before designing new workflow
memory.search_nodes(query=f"workflow pattern {intent} {complexity}")
```

## Best Practices

1. **Minimize dependencies** - More parallelization opportunities
2. **Group by scope** - Same-scope steps can share worker
3. **Estimate conservatively** - Better to overestimate turns
4. **Validate before execution** - Catch issues early
5. **Learn from execution** - Store successful patterns
6. **Handle failures gracefully** - Plan for partial results

## Example Workflows

### Example 1: Simple Bug Fix
```json
Input: "Fix login validation bug"

Output:
{
  "workflow_id": "wf_bug_001",
  "execution_mode": "sequential",
  "steps": [
    {
      "id": "locate",
      "description": "Find login validation code",
      "scope": "dev",
      "capability": "search_code",
      "tool": "mcp__serena__search_for_pattern",
      "dependencies": []
    },
    {
      "id": "analyze",
      "description": "Analyze validation logic",
      "scope": "dev",
      "capability": "read_code",
      "tool": "mcp__serena__find_symbol",
      "dependencies": ["locate"]
    },
    {
      "id": "fix",
      "description": "Fix validation bug",
      "scope": "dev",
      "capability": "write_code",
      "tool": "mcp__serena__replace_symbol_body",
      "dependencies": ["analyze"]
    }
  ],
  "parallel_groups": [],
  "estimated_turns": 6,
  "risks": []
}
```

### Example 2: Multi-Scope Feature
```json
Input: "Add user profile and update docs"

Output:
{
  "workflow_id": "wf_feature_001",
  "execution_mode": "hybrid",
  "steps": [
    {
      "id": "dev_analyze",
      "description": "Analyze existing user module",
      "scope": "dev",
      "capability": "analyze_code",
      "tool": "mcp__serena__get_symbols_overview",
      "dependencies": [],
      "parallel_group": 1
    },
    {
      "id": "dev_implement",
      "description": "Implement profile feature",
      "scope": "dev",
      "capability": "write_code",
      "tool": "mcp__serena__replace_symbol_body",
      "dependencies": ["dev_analyze"],
      "parallel_group": 1
    },
    {
      "id": "docs_plan",
      "description": "Plan documentation updates",
      "scope": "docs",
      "capability": "read_docs",
      "tool": "mcp__doc-forge__document_reader",
      "dependencies": [],
      "parallel_group": 2
    },
    {
      "id": "docs_write",
      "description": "Write profile documentation",
      "scope": "docs",
      "capability": "write_docs",
      "tool": "mcp__filesystem__write_file",
      "dependencies": ["dev_implement", "docs_plan"],
      "parallel_group": 3
    }
  ],
  "parallel_groups": [
    {"group_id": 1, "steps": ["dev_analyze"], "workers": ["dev-worker"]},
    {"group_id": 2, "steps": ["docs_plan"], "workers": ["docs-worker"]}
  ],
  "estimated_turns": 12,
  "risks": ["dev_implement must complete before docs_write"]
}
```
