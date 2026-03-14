# Analysis: everything-claude-code
**Source**: https://github.com/affaan-m/everything-claude-code
**Type**: Cross-Platform Agent Harness
**Analyzed**: 2026-03-12

---

## Overview

everything-claude-code (ECC) เป็น agent harness performance optimization system ที่รองรับหลาย platforms (Claude Code, Codex, OpenCode, Cursor, Antigravity) โดยมีจุดเด่นที่ cross-platform parity และ comprehensive tooling

---

## Key Features

### 1. Component Statistics
| Component | Count | Description |
|-----------|-------|-------------|
| Agents | 16 | Specialized subagents (planner, architect, tdd-guide, code-reviewer, etc.) |
| Skills | 65 | Workflow definitions and domain knowledge |
| Commands | 40 | Slash commands for quick execution |
| Hook Events | 8+ | Trigger-based automations |
| Rules | 34 | Always-follow guidelines |
| MCP Servers | 14 | External tool integrations |

### 2. Cross-Platform Support
| Platform | Support Level | Notes |
|----------|---------------|-------|
| Claude Code CLI | Full | Primary target |
| Cursor IDE | Full | 15 hook events, DRY adapter pattern |
| Codex (app + CLI) | Full | AGENTS.md based, no hooks yet |
| OpenCode | Full | 20+ event types, 6 native tools |
| Antigravity | Full | Tight integration |

### 3. Hook Architecture
- **SessionStart**: Load context (DNA, checkpoint, mistakes)
- **PreToolUse**: scope-guard, secret-scanner, bash-guard
- **PostToolUse**: file-tracker, audit-logger
- **Stop**: checkpoint-save
- **PreCompact**: precompact-backup

### 4. Continuous Learning v2
- Instinct-based learning with confidence scoring
- Import/Export instincts for sharing
- `/evolve` command to cluster instincts into skills
- `/instinct-status`, `/instinct-import`, `/instinct-export` commands

### 5. Ecosystem Tools
- **AgentShield**: Security auditor (1282 tests, 102 rules)
- **Plankton**: Write-time code quality enforcement
- **Skill Creator**: Generate skills from git history
- **NanoClaw v2**: Model routing, skill hot-load, session management

### 6. Model Strategy
- Default: Sonnet (60% cost reduction)
- `MAX_THINKING_TOKENS`: 10,000 (70% reduction)
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`: 50 (compact earlier)

---

## Comparison with Dev-Stack

| Feature | Dev-Stack | everything-claude-code |
|---------|-----------|------------------------|
| Platforms | 1 (Claude Code) | 4+ (Claude Code, Cursor, Codex, OpenCode) |
| Agents | 7 | 16 |
| Skills | 2 | 65 |
| Commands | 4 | 40 |
| Hook Events | 8 | 8-20+ (platform dependent) |
| Continuous Learning | DNA only | Instincts v2 with confidence scoring |
| Security Tools | 3 (scope-guard, secret-scanner, bash-guard) | AgentShield (102 rules) |
| Cross-Platform | No | Full parity |
| Model Strategy | Single model | Sonnet default + Opus for complex |

---

## Gaps Identified

### Critical
1. **No Cross-Platform Support** - Dev-Stack รองรับเฉพาะ Claude Code
2. **Limited Skills** - Dev-Stack มีเพียง 2 skills เทียบกับ 65
3. **No Continuous Learning v2** - Dev-Stack ไม่มี instincts system

### Important
4. **No Security Auditor** - Dev-Stack มี basic guards แต่ไม่มี comprehensive auditor
5. **No Skill Creator** - Dev-Stack ไม่มี automated skill generation
6. **Limited Commands** - Dev-Stack มี 4 commands เทียบกับ 40

### Nice-to-Have
7. **No Token Optimization Guide** - Dev-Stack ไม่มี explicit cost optimization
8. **No PM2 Integration** - Dev-Stack ไม่มี service lifecycle management

---

## Unique Features in ECC

### DRY Adapter Pattern (Cursor)
```
Cursor stdin JSON → adapter.js → transforms → scripts/hooks/*.js
                                              (shared with Claude Code)
```

### Instinct System
```yaml
# Example instinct file structure
---
name: react-patterns
confidence: 0.85
created: 2026-03-12
---
Action: Use React.memo for expensive components
Evidence: Reduced render time by 40% in 5 sessions
Examples: [component paths]
```

### Multi-Language Rules
```
rules/
  common/          # Universal principles
  typescript/      # TS/JS specific
  python/          # Python specific
  golang/          # Go specific
  swift/           # Swift specific
  php/             # PHP specific
```

---

## Recommendations for Dev-Stack

1. **Add Cross-Platform Support**
   - Create adapter layer for Cursor/Codex
   - Use AGENTS.md as universal context file

2. **Implement Instinct System**
   - Add confidence scoring to DNA
   - Create import/export commands
   - Auto-cluster into skills

3. **Expand Skills Library**
   - Start with 10-15 core skills
   - Add domain-specific skills incrementally

4. **Add Model Strategy**
   - Default to Sonnet for cost
   - Route to Opus for thinking tasks
   - Add token optimization guide

---

## Actionable Items

- [ ] Create AGENTS.md at repo root for cross-tool compatibility
- [ ] Implement instincts system with confidence scoring
- [ ] Add model routing (Sonnet default, Opus for thinking)
- [ ] Create adapter pattern for Cursor hooks
- [ ] Add 10+ core skills (TDD, security, patterns)
- [ ] Implement skill creator from git history
