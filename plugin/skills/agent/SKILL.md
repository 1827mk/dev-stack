---
name: agent
description: Meta-orchestrator for task execution. Use when starting complex tasks, multi-step workflows, or when you need structured thinking before action. Supports Thai/English/mixed input.
---

# Dev-Stack Agent Skill

## Usage
```
/dev-stack:agent [task description]
/dev-stack:agent --quick [task]  # Skip THINK/RESEARCH
```

## 6-Phase Workflow

| Phase | Purpose | Duration | Output |
|-------|---------|----------|--------|
| THINK | Understand intent | 5-30s | `{derived_intent, complexity, mode}` |
| RESEARCH | Gather context | 10-60s | `{symbols, patterns, unknowns}` |
| BUILD | Implement | 30-300s | `{files_modified, guards, checkpoint}` |
| TEST | Verify | 10-120s | `{tests_run, passed, type_errors}` |
| LEARN | Capture patterns | 5-30s | `{patterns_captured, dna_updated}` |
| VERIFY | Final check | 5-15s | `{intent_satisfied, rollback_available}` |

## Execution Modes

| Score | Mode | Behavior |
|-------|------|----------|
| <0.3 | AUTO | Execute immediately |
| 0.3-0.6 | PLAN_FIRST | Show plan, ask approval |
| 0.6-0.8 | CONFIRM | Confirm each step |
| >0.8 | INTERACTIVE | Ask questions, step-by-step |

## Verb Mapping

| Thai | English | Verb |
|------|---------|------|
| หา,ค้นหา | find,search | `find` |
| แก้ไข,ซ่อม | fix,repair | `fix` |
| เพิ่ม,สร้าง | add,create | `add` |
| ลบ | delete,remove | `remove` |
| เปลี่ยน | change,update | `update` |
| อ่าน,ดู | read,view | `read` |
| ทดสอบ | test,check | `test` |
| วิเคราะห์ | analyze | `analyze` |

## Complexity Factors

| Factor | Weight |
|--------|--------|
| Files affected | 0.25 |
| Risk level | 0.20 |
| Dependencies | 0.15 |
| Cross-cutting | 0.15 |
| User clarity | 0.10 |
| Reversibility | 0.05 |

## Tool Mapping (Capability → Tools)

| Capability | Primary | Fallback |
|------------|---------|----------|
| code.find_symbol | serena:find_symbol | Grep |
| code.read | serena:get_symbols | Read |
| code.edit | serena:replace_symbol | Edit |
| file.write | Write | mcp_filesystem:write |
| memory.search | mcp_memory:search | Grep |
| exec.bash | Bash | - |

## Auto Guards
- **Scope**: Block protected paths (.env, .git, migrations)
- **Secret**: Mask API keys, passwords, tokens
- **Bash**: Block dangerous commands
- **Risk**: Flag high-risk operations

## Output Format
```yaml
result:
  status: success|partial|failed
  intent: {derived}
  complexity: {score}
  changes: [{file, action}]
  tests: {run, passed, failed}
  checkpoint_id: {id}
  rollback_available: true
```

## Quick Mode (--quick)
- Skip THINK, RESEARCH phases
- Go straight to BUILD
- Still runs guards, audit, checkpoints

## Notes
- All actions logged to `.dev-stack/logs/audit.jsonl`
- Checkpoints in `.dev-stack/memory/checkpoint.md`
- Use capability names, not tool names
