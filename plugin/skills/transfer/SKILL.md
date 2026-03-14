---
name: transfer
description: Transfer learned patterns from one project to another with automatic adaptation
invocable: true
---

# /dev-stack:transfer

Transfer learned patterns from one project to another with automatic adaptation for different tech stacks and naming conventions.

## Usage

```bash
/dev-stack:transfer [source-project] [options]
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `source-project` | Path to source project to transfer patterns from | Current project |

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--target` | Target project path | Current working directory |
| `--types` | Pattern types to transfer (comma-separated) | All types |
| `--min-confidence` | Minimum confidence threshold | 0.5 |
| `--tags` | Filter by tags (comma-separated) | All tags |
| `--dry-run` | Preview transfer without making changes | false |
| `--adapt` | Enable automatic tech stack adaptation | true |

## Examples

### Transfer all patterns from another project

```bash
/dev-stack:transfer ~/projects/my-old-project
```

### Transfer only code patterns with high confidence

```bash
/dev-stack:transfer ~/projects/my-old-project --types=code_pattern --min-confidence=0.8
```

### Preview transfer without making changes

```bash
/dev-stack:transfer ~/projects/my-old-project --dry-run
```

### Transfer with specific tags

```bash
/dev-stack:transfer ~/projects/my-old-project --tags=auth,security,middleware
```

## Workflow

1. **Analyze Source Project**
   - Scan source project's pattern database
   - Filter patterns based on options
   - Report pattern count and types

2. **Analyze Target Context**
   - Detect target project's tech stack
   - Identify naming conventions
   - Map framework differences

3. **Adapt Patterns**
   - Convert code examples to target tech stack
   - Update template variables
   - Map naming conventions

4. **Transfer Patterns**
   - Save adapted patterns to target database
   - Update pattern metadata
   - Reset usage statistics for new context

5. **Report Results**
   - Show transferred patterns count
   - List adapted patterns with changes
   - Report any skipped or failed patterns

## Tech Stack Adaptation

The transfer skill automatically adapts patterns between these tech stacks:

| Source | Target | Adaptations |
|--------|--------|-------------|
| React | Vue | Component syntax, hooks to composition API |
| Vue | React | Options API to hooks, class to className |
| Jest | Vitest | jest.* to vi.* |
| Vitest | Jest | vi.* to jest.* |
| JavaScript | TypeScript | Type annotations |
| TypeScript | JavaScript | Remove type annotations |

## Output Format

```
Pattern Transfer Report
=======================

Source: ~/projects/my-old-project
Target: ~/projects/my-new-project

Transferred: 12 patterns
├── Direct copy: 5
├── Adapted: 6
└── Skipped: 1

Adapted Patterns:
- auth_middleware_jwt → auth_middleware_oauth (React → Vue)
- api_error_handler → api_error_handler (Jest → Vitest)

Errors: None
```

## Notes

- Patterns are never overwritten; transferred patterns get new IDs
- Original source project is preserved
- Confidence scores reset to 0.5 for transferred patterns
- Usage history starts fresh in target project
- Failed transfers are logged but don't stop the process

## See Also

- `/dev-stack:learn` - Force DNA rescan to discover new patterns
- `/dev-stack:status` - View current pattern database
- `/dev-stack:agent` - Execute tasks using learned patterns
