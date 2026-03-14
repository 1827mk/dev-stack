---
name: orchestrator
description: |
  DEPRECATED as standalone subagent. Orchestration logic now lives in
  /dev-stack:agent command (main conversation) which can spawn subagents.
  This file is kept as reference documentation only.
  Subagents cannot spawn other subagents — see agent.md for the correct pattern.
---

# Orchestrator — Architecture Reference

> **Note:** This agent no longer runs as a subagent.
> Orchestration is handled directly by the `agent.md` command (main conversation).
> Reason: subagents cannot spawn other subagents per Claude Code architecture.
> See `commands/agent.md` for the full orchestration logic.

## Workflow Order (for reference)

```
MAIN CONVERSATION (agent.md)
  ↓
[1] thinker subagent      — understand + impact map + unknowns
  ↓ (if unknowns)
[2] researcher subagent   — web research to fill gaps
  ↓
[3] GROUND TRUTH          — synthesize + user approval (main conversation)
  ↓
[4] dna-scanner subagent  — if DNA missing or stale
  ↓
[5] spec-writer subagent  — spec.md + tasks.md
  ↓
[6] code-builder subagent — implement with post-edit diagnostics
  ↓
[7] verifier subagent     — evidence-based final gate
  ↓
[8] report-engine skill   — session summary
```

## Context Package Format (for reference)

When main conversation spawns any subagent, always include:
- `capabilities_yaml`: absolute path
- `dna_path`: absolute path (if exists)
- `user_request`: verbatim
- `base_sha`: git SHA or "no-git"
- `cwd`: current working directory
- task-specific fields per agent
