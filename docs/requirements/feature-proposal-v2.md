# Dev-Stack v2 Feature Proposal
**Focus**: Claude Code plugin only (no cross-platform)
**Goal**: Make Claude Code more powerful, not duplicate existing features
**Created**: 2026-03-12

---

## Claude Code มีอะไรแล้ว (ไม่ต้องทำซ้ำ)

### ✅ Native Features (ใช้ของ Claude Code โดยตรง)
| Feature | Status | Action |
|---------|--------|--------|
| Agent Teams (TeamCreate/TeamDelete) | ✅ Native | ใช้ API นี้ ไม่ต้องสร้างใหม่ |
| Multi-surface (Terminal, VS Code, Desktop) | ✅ Native | ไม่ต้องทำ cross-platform |
| MCP Server Integration | ✅ Native | ใช้ .mcp.json |
| Plugin System | ✅ Native | ใช้ plugin.json |
| Slash Commands | ✅ Native | ใช้ commands/ |
| Subagents | ✅ Native | ใช้ agents/ |
| Skills | ✅ Native | ใช้ skills/ |
| Hooks (PreToolUse, PostToolUse, Stop, etc.) | ✅ Native | ใช้ hooks/ |

### ✅ Built-in Tools (Claude Code มีอยู่แล้ว)
| Tool | Description |
|------|-------------|
| Read, Write, Edit | File operations |
| Bash | Shell commands |
| Glob, Grep | Search |
| WebSearch, WebFetch | Internet access |
| Agent | Spawn subagents |
| LSP | Code intelligence |

---

## Gap Analysis: Claude Code ขาดอะไร?

### 🔴 Critical Gaps (ผู้ใช้เจอปัญหาจริง)

#### 1. **ไม่มี Thinking Discipline**
```
ปัญหา: Claude Code มักกระโดดไปเขียนโค้ดทันที ไม่คิดก่อน
ผลกระทบ: เขียนผิด, ต้องแก้หลายรอบ, เสียเวลา
```

#### 2. **ไม่มี Security Guardrails**
```
ปัญหา: สามารถลบ/แก้ไขไฟล์สำคัญได้ (migrations/, .env, .git/)
ผลกระทบ: ทำลาย production, leak secrets
```

#### 3. **ไม่มี Session Memory**
```
ปัญหา: ทุกครั้งที่ compact context ข้อมูลหายหมด
ผลกระทบ: ต้องอธิบายใหม่ทุกครั้ง, ไม่เรียนรู้จากครั้งก่อน
```

#### 4. **ไม่มี Audit Trail**
```
ปัญหา: ไม่รู้ว่า agent ทำอะไรบ้าง แก้ไฟล์อะไร
ผลกระทบ: Debug ยาก, review ยาก, ไม่มี traceability
```

#### 5. **ไม่มี Safe Rollback**
```
ปัญหา: ถ้า agent ทำพัง ต้อง manual git reset
ผลกระทบ: เสียเวลา, เสี่ยงเสียงาน
```

---

## Dev-Stack v2 Features (ที่จะทำให้ Claude Code เทพขึ้น)

### 🎯 Core Value Proposition
> **"Thinking-First Development Assistant with Safety Rails"**

---

### Phase 1: Foundation (ควรมีทุก project)

#### 1.1 Enforced Thinking Workflow
**ปัญหาที่แก้**: Claude กระโดยเขียนโค้ดทันที
**Solution**: THINK → RESEARCH → BUILD → VERIFY workflow

```yaml
# Workflow enforcement
workflow:
  phases:
    - name: THINK
      agent: thinker
      required: true
      output: impact_map.md
    - name: RESEARCH
      agent: researcher
      required: true  # only if unknowns detected
      output: findings.md
    - name: BUILD
      agent: code-builder
      requires: [THINK]
      output: code changes
    - name: VERIFY
      agent: verifier
      required: true
      output: verification_report.md
```

**User Experience**:
```
User: "Add authentication to the API"

❌ Without dev-stack:
   Claude: [immediately writes code]

✅ With dev-stack:
   THINK: "Analyzing impact on auth/, middleware/, routes/, tests/"
   RESEARCH: "Found JWT library already installed, checking patterns"
   BUILD: [writes code with context]
   VERIFY: "All tests pass, security scan clean"
```

---

#### 1.2 Security Guardrails (Hooks)
**ปัญหาที่แก้**: ทำลายไฟล์สำคัญได้
**Solution**: 3-layer protection

| Guard | Blocks | Action |
|-------|--------|--------|
| scope-guard | migrations/, .env, .git/, *.pem, *.key | Block write |
| secret-scanner | API keys, passwords, tokens in code | Block commit |
| bash-guard | rm -rf /, sudo rm, git push --force | Block execution |

**User Experience**:
```
❌ Without dev-stack:
   Claude: [writes to .env and commits API key]

✅ With dev-stack:
   > scope-guard: BLOCKED - cannot write to .env
   > Hint: Use .env.example instead
```

---

#### 1.3 Session Memory & Checkpoint
**ปัญหาที่แก้**: Context compact แล้วข้อมูลหาย
**Solution**: Automatic checkpointing

```yaml
checkpoint:
  triggers:
    - before_compact: true  # PreCompact hook
    - every_50_turns: true
    - on_user_request: /dev-stack:checkpoint

  persistence:
    - checkpoint.md: session state
    - files-touched.txt: changed files list
    - audit.jsonl: action log
    - base_sha: git commit for rollback
```

**User Experience**:
```
❌ Without dev-stack:
   [context compacts]
   Claude: "What were we working on?"

✅ With dev-stack:
   [context compacts]
   [session-start hook loads checkpoint]
   Claude: "Continuing from: Adding JWT auth to /api/* routes"
```

---

#### 1.4 Audit Trail
**ปัญหาที่แก้**: ไม่รู้ว่า agent ทำอะไร
**Solution**: Comprehensive logging

```yaml
audit:
  format: JSONL
  fields:
    - timestamp
    - tool: Read|Write|Edit|Bash
    - file: target path
    - action: read|write|execute
    - result: success|blocked|error
    - reason: why blocked (if applicable)

  outputs:
    - .dev-stack/logs/audit.jsonl
    - .dev-stack/logs/files-touched.txt
```

**User Experience**:
```
/dev-stack:status

📊 Session Summary:
  Files changed: 12
  Commands run: 8
  Hooks blocked: 2 (1 secret, 1 scope)
  Duration: 15 minutes

📁 Files Touched:
  + src/auth/jwt.ts
  + src/middleware/auth.ts
  ~ src/routes/api.ts
  - src/deprecated/auth-old.ts
```

---

#### 1.5 Safe Rollback
**ปัญญาที่แก้**: Agent ทำพัง ต้องแก้ manual
**Solution**: One-command rollback

```yaml
rollback:
  trigger: /dev-stack:rollback
  safety:
    - show_diff: true  # แสดงก่อนว่าจะย้อนอะไร
    - require_confirm: true
    - keep_checkpoint: true  # เก็บ checkpoint ไว้

  actions:
    - git reset --hard {base_sha}
    - restore uncommitted files from checkpoint
    - log rollback to audit
```

**User Experience**:
```
/dev-stack:rollback

⚠️ This will revert 12 files to commit e0c15cb

Files to be reverted:
  - src/auth/jwt.ts (modified)
  - src/middleware/auth.ts (modified)
  + src/deprecated/auth-old.ts (deleted)

Confirm? [y/N]: y
✅ Rolled back to e0c15cb
📁 Checkpoint saved at .dev-stack/checkpoint.md
```

---

### Phase 2: Enhancement (ทำให้ดียิ่งขึ้น)

#### 2.1 Project DNA (Auto-Learning)
**Value**: Claude เรียนรู้ project อัตโนมัติ

```yaml
dna:
  auto_scan:
    trigger: /dev-stack:learn
    or: when project structure changes significantly

  captures:
    - architecture: entry points, patterns
    - conventions: coding style, naming
    - risk_areas: legacy code, high-cascade changes
    - what_not_to_do: from previous mistakes

  output: .dev-stack/dna/project.md
```

**User Experience**:
```
/dev-stack:learn

🔍 Scanning project...

✅ DNA Updated:
  - Detected: TypeScript + React + Node.js
  - Framework: Express.js with middleware pattern
  - Test: Jest (but no coverage threshold)
  - Risk: src/legacy/ has no tests

💡 Suggestions:
  - Add tests for src/legacy/
  - Consider migration plan for deprecated code
```

---

#### 2.2 Smart Model Routing
**Value**: ประหยัด cost + เพิ่ม speed

```yaml
model_routing:
  rules:
    thinker: opus      # Deep reasoning
    researcher: sonnet # Web search, analysis
    code-builder: sonnet # Writing code
    verifier: sonnet   # Testing, validation
    simple_tasks: haiku # Quick docs, formatting

  cost_optimization:
    - use_haiku_for_drafts: true
    - escalate_to_opus_if: [complex_reasoning, security_review]
```

---

#### 2.3 Progressive Skill Loading
**Value**: ประหยัด context

```yaml
skill_loading:
  levels:
    1_startup: skill_name + description only
    2_activation: full SKILL.md content
    3_execution: relevant sections only

  triggers:
    - keywords in user request
    - agent type matching
    - explicit /skill:command
```

---

#### 2.4 Intent Router
**Value**: เข้าใจ user ตั้งแต่แรก

```yaml
intent_router:
  analysis:
    - language: Thai | English | Mixed
    - task_type: feature | bugfix | refactor | docs | test
    - scope: file | module | project
    - urgency: now | later | scheduled

  output: workflow_plan.md
```

---

### Phase 3: Polish (ปรับปรุง UX)

#### 3.1 Status Dashboard
```bash
/dev-stack:status

┌─────────────────────────────────────────────────────────────┐
│ dev-stack v2.0 - Health: ✅ Good                            │
├─────────────────────────────────────────────────────────────┤
│ 📊 Session                                                   │
│   Duration: 15m 23s                                          │
│   Turns: 47                                                  │
│   Files changed: 12                                          │
│   Hooks blocked: 2                                           │
├─────────────────────────────────────────────────────────────┤
│ 🧠 Context                                                   │
│   Checkpoint: ✅ Saved (2m ago)                              │
│   DNA: ⚠️ Stale (3 days ago)                                 │
│   Base SHA: e0c15cb                                          │
├─────────────────────────────────────────────────────────────┤
│ 🔒 Security                                                  │
│   Scope Guard: ✅ Active                                     │
│   Secret Scanner: ✅ Active                                  │
│   Bash Guard: ✅ Active                                      │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2 Interactive Commands
```bash
/dev-stack:agent          # Start full workflow
/dev-stack:agent --quick  # Skip thinking phase
/dev-stack:learn          # Force DNA rescan
/dev-stack:status         # Show dashboard
/dev-stack:rollback       # Safe rollback
/dev-stack:checkpoint     # Manual checkpoint
```

---

## Feature Priority Matrix

| Priority | Feature | Impact | Effort | Value |
|----------|---------|--------|--------|-------|
| P0 | Security Guards | High | Low | ⭐⭐⭐⭐⭐ |
| P0 | Session Checkpoint | High | Low | ⭐⭐⭐⭐⭐ |
| P0 | Thinking Workflow | High | Medium | ⭐⭐⭐⭐⭐ |
| P1 | Audit Trail | Medium | Low | ⭐⭐⭐⭐ |
| P1 | Safe Rollback | High | Medium | ⭐⭐⭐⭐ |
| P1 | Status Dashboard | Medium | Low | ⭐⭐⭐⭐ |
| P2 | Project DNA | High | High | ⭐⭐⭐ |
| P2 | Model Routing | Medium | Medium | ⭐⭐⭐ |
| P2 | Intent Router | Medium | Medium | ⭐⭐⭐ |
| P3 | Progressive Loading | Low | High | ⭐⭐ |

---

## What We Will NOT Do (Avoid Scope Creep)

| Feature | Reason |
|---------|--------|
| Cross-platform (Cursor, Codex) | Focus Claude Code only |
| Custom Agent Teams | Use native TeamCreate API |
| Multi-LLM providers | Claude Code uses Claude only |
| VS Code extension | Claude Code has native support |
| Plugin marketplace | Submit to existing awesome-claude-plugins |
| 100+ agents | Keep curated set of 7-10 high-quality agents |
| Complex learning system | Simple DNA + checkpoint is enough |

---

## Success Metrics

### Developer Experience
- [ ] Zero "I forgot what we were doing" moments (checkpoint)
- [ ] Zero accidental file deletions (scope-guard)
- [ ] Zero secret leaks (secret-scanner)
- [ ] Average 30% fewer revision cycles (thinking workflow)

### Technical
- [ ] All hooks complete in <100ms
- [ ] Checkpoint file <50KB
- [ ] Zero performance impact on normal operations
- [ ] 100% audit coverage

---

## Implementation Roadmap

### Week 1-2: Foundation
- [ ] Refine existing hooks (scope-guard, secret-scanner, bash-guard)
- [ ] Enhance checkpoint system
- [ ] Add audit logging
- [ ] Create rollback command

### Week 3-4: Workflow
- [ ] Implement THINK → BUILD → VERIFY enforcement
- [ ] Add status dashboard
- [ ] Create intent router skill
- [ ] Update all agents with model routing

### Week 5-6: Polish
- [ ] Add Project DNA auto-learning
- [ ] Progressive skill loading
- [ ] Documentation update
- [ ] Testing & refinement

---

## Conclusion

Dev-Stack v2 จะเป็น plugin ที่:

1. **ไม่ทำซ้ำ** Claude Code features
2. **เติมเต็ม** สิ่งที่ Claude Code ขาด
3. **บังคับใช้** thinking discipline
4. **ป้องกัน** ความผิดพลาด
5. **จดจำ** ทุก session
6. **ย้อนกลับ** ได้เสมอ

**Core Value**: Thinking-First Development Assistant with Safety Rails
