# Tasks: Dev-Stack v6 Meta-Orchestrator Plugin

**Input**: Design documents from `/specs/001-dev-stack-v6/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic plugin structure

- [x] T001 Create plugin directory structure per implementation plan (agents/, skills/, hooks/, lib/, config/)
- [x] T002 [P] Create plugin manifest in .claude-plugin/plugin.json with plugin metadata
- [x] T003 [P] Initialize TypeScript project with dependencies in package.json (better-sqlite3, @anthropic-ai/sdk)
- [x] T004 [P] Configure Vitest for unit testing in vitest.config.ts
- [x] T005 [P] Create .dev-stack/ runtime directories structure (.dev-stack/dna/, .dev-stack/memory/, .dev-stack/logs/, .dev-stack/config/)
- [x] T006 Create initial capabilities registry in config/capabilities.yaml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Core Types and Utilities

- [x] T007 [P] Define DNA types in lib/dna/types.ts (ProjectDNA, TechStack, RiskArea interfaces)
- [x] T008 [P] Define Pattern types in lib/patterns/types.ts (Pattern, PatternType, SearchResult interfaces)
- [x] T009 [P] Define Checkpoint types in lib/checkpoint/types.ts (Checkpoint, SessionState, PhaseProgress interfaces)
- [x] T010 [P] Define Audit types in lib/audit/types.ts (AuditEntry, AuditResult, GuardInfo interfaces)
- [x] T011 [P] Define Guard types in lib/guards/types.ts (ScopeGuard, RiskLevel, GuardResult interfaces)

### Security Guards (Layer 5) - Required for all stories

- [x] T012 [P] Implement scope guard in lib/guards/scope-guard.ts (protected paths validation)
- [x] T013 [P] Implement secret scanner in lib/guards/secret-scanner.ts (API key, password, token detection)
- [x] T014 [P] Implement bash guard in lib/guards/bash-guard.ts (dangerous command blocking)
- [x] T015 Implement risk assessor in lib/guards/risk-assessor.ts (complexity scoring 0.0-1.0)

### Audit Infrastructure

- [x] T016 Implement audit logger in lib/audit/logger.ts (JSONL append, entry validation)

### Hook Infrastructure

- [x] T017 Implement PreToolUse hook in hooks/hooks.json (prompt-based guard prompts)
- [x] T018 Implement PostToolUse hook in hooks/hooks.json (audit logging prompt)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Natural Language Task Execution (Priority: P1) 🎯 MVP

**Goal**: Users can give instructions in natural language (Thai/English/mixed) without knowing tool names

**Independent Test**: Give a task in Thai like "หาว่า authentication ทำงานยังไง" and verify system selects appropriate tools without user specifying them

### Implementation for User Story 1

- [x] T019 [P] [US1] Create language detector module in lib/intent/language-detector.ts (Thai/English/mixed detection)
- [x] T020 [P] [US1] Implement Intent Router agent prompt in agents/intent-router.md (VERB + TARGET + CONTEXT formula)
- [x] T021 [US1] Implement Tool Selector agent prompt in agents/tool-selector.md (capability-based selection, fallback handling)
- [x] T022 [US1] Create capability registry loader in lib/selector/capability-loader.ts (YAML parsing, validation)
- [x] T023 [US1] Implement tool availability checker in lib/selector/tool-checker.ts (MCP discovery, plugin detection)
- [x] T024 [US1] Create /dev-stack:agent skill in skills/agent/SKILL.md (6-phase workflow: THINK→RESEARCH→BUILD→TEST→LEARN→VERIFY)
- [x] T025 [US1] Add complexity scoring logic in lib/intent/complexity-scorer.ts (files, risk, deps, cross-cutting factors)
- [x] T026 [US1] Implement execution mode selector in lib/intent/mode-selector.ts (AUTO, PLAN_FIRST, CONFIRM, INTERACTIVE)
- [x] T027 [US1] Add quick mode support (--quick flag) in skills/agent/SKILL.md (skip THINK phase)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can give natural language tasks and system selects tools automatically

---

## Phase 4: User Story 2 - Context-Aware Intent Derivation (Priority: P1)

**Goal**: System understands intent based on current codebase context, not just keywords

**Independent Test**: Give the same request in different project contexts and verify different derived intents

### Implementation for User Story 2

- [x] T028 [P] [US2] Implement DNA scanner in lib/dna/scanner.ts (project analysis, pattern extraction)
- [x] T029 [P] [US2] Create Context Engine agent prompt in agents/context-engine.md (JIT retrieval, token budget)
- [x] T030 [US2] Implement token budget manager in lib/context/token-budget.ts (200k allocation, overflow handling)
- [x] T031 [US2] Create JIT context loader in lib/context/jit-loader.ts (upfront, on-demand, progressive loading)
- [x] T032 [US2] Create /dev-stack:learn skill in skills/learn/SKILL.md (force DNA rescan, --deep flag)
- [x] T033 [US2] Add context analysis step to intent router in agents/intent-router.md (analyze before derive)
- [x] T034 [US2] Implement Project DNA storage in .dev-stack/dna/project.md format (YAML frontmatter + Markdown body)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - system understands context and selects tools appropriately

---

## Phase 5: User Story 3 - Hybrid Execution with Risk-Based Decisions (Priority: P2)

**Goal**: Simple tasks execute automatically while complex tasks require confirmation

**Independent Test**: Submit tasks of varying complexity and verify correct execution mode selection

### Implementation for User Story 3

- [x] T035 [P] [US3] Create Orchestration Engine agent prompt in agents/orchestrator.md (6-phase pipeline, parallel execution)
- [x] T036 [P] [US3] Implement execution mode transitions in lib/orchestration/mode-transitions.ts (AUTO→PLAN_FIRST→CONFIRM→INTERACTIVE)
- [x] T037 [US3] Add plan-first mode logic in skills/agent/SKILL.md (show plan, ask approval)
- [x] T038 [US3] Add confirm mode logic in skills/agent/SKILL.md (confirm before each step)
- [x] T039 [US3] Add interactive mode logic in skills/agent/SKILL.md (ask clarifying questions)
- [x] T040 [US3] Implement failure recovery in lib/orchestration/recovery.ts (retry, rollback, escalate)
- [x] T041 [US3] Add task list integration in lib/orchestration/task-tracker.ts (progress tracking)

**Checkpoint**: At this point, hybrid execution is working - simple tasks auto-execute, complex tasks require approval

---

## Phase 6: User Story 4 - Session Continuity via Checkpoints (Priority: P2)

**Goal**: Work is automatically saved at checkpoints and can be resumed after session restart

**Independent Test**: Start a multi-step task, trigger checkpoint save, simulate session restart, verify resume from checkpoint

### Implementation for User Story 4

- [x] T042 [P] [US4] Implement checkpoint manager in lib/checkpoint/manager.ts (save/load operations)
- [x] T043 [P] [US4] Create checkpoint storage format in .dev-stack/memory/checkpoint.md (YAML frontmatter + Markdown body)
- [x] T044 [US4] Implement SessionStart hook in hooks/hooks.json (prompt-based checkpoint loading)
- [x] T045 [US4] Implement PreCompact hook in hooks/hooks.json (prompt-based checkpoint save)
- [x] T046 [US4] Create /dev-stack:status skill in skills/status/SKILL.md (show dashboard: DNA, checkpoint, logs, guards)
- [x] T047 [US4] Create /dev-stack:rollback skill in skills/rollback/SKILL.md (5-level rollback with diff preview)
- [x] T048 [US4] Implement rollback levels in lib/recovery/rollback.ts (action, phase, task, checkpoint, base SHA)
- [x] T049 [US4] Create /dev-stack:checkpoint skill in skills/checkpoint/SKILL.md (manual checkpoint with --note flag)
- [x] T050 [US4] Create /dev-stack:history skill in skills/history/SKILL.md (show recent actions, undo/redo hints)
- [x] T051 [US4] Create /dev-stack:undo skill in skills/undo/SKILL.md (undo last N actions)
- [x] T052 [US4] Create /dev-stack:redo skill in skills/redo/SKILL.md (redo undone actions)

**Checkpoint**: At this point, session continuity is working - checkpoints save automatically and users can rollback

---

## Phase 7: User Story 5 - Pattern Learning and Reuse (Priority: P3)

**Goal**: System learns from successful patterns and suggests them for similar future tasks

**Independent Test**: Complete a task successfully, then start a similar task and verify the learned pattern is suggested

### Implementation for User Story 5

- [x] T053 [P] [US5] Implement pattern storage in lib/patterns/store.ts (SQLite operations)
- [x] T054 [P] [US5] Implement HNSW search in lib/patterns/search.ts (vector similarity, top-k retrieval)
- [x] T055 [US5] Create pattern database schema in .dev-stack/memory/patterns.db (patterns table, HNSW index)
- [x] T056 [US5] Implement learning engine in lib/patterns/learner.ts (success/failure tracking, confidence updates)
- [x] T057 [US5] Add pattern learning step to 6-phase pipeline in agents/orchestrator.md (LEARN phase)
- [x] T058 [US5] Create /dev-stack:transfer skill in skills/transfer/SKILL.md (cross-project pattern transfer)
- [x] T059 [US5] Implement pattern adaptation in lib/patterns/adapter.ts (context-aware modifications)

**Checkpoint**: All user stories should now be independently functional - pattern learning adds long-term value

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T060 [P] Create setup script in scripts/setup.sh (dependency installation, directory creation)
- [x] T061 [P] Add error messages module in lib/errors/messages.ts (DS001-DS008 error codes)
- [x] T062 [P] Implement Guard Engine agent prompt in agents/guard-engine.md (unified guard orchestration)
- [x] T063 [P] Implement Persistence agent prompt in agents/persistence.md (checkpoint, pattern, audit coordination)
- [x] T064 Add scope.json configuration in .dev-stack/config/scope.json (protected paths customization)
- [x] T065 Create README.md for plugin at plugin root (installation, usage, configuration)
- [x] T066 Validate quickstart.md scenarios work correctly (run all examples from quickstart.md)
- [x] T067 Performance testing: verify pattern search <50ms, checkpoint <500ms, intent derivation <2s
- [x] T068 Security testing: verify zero leaks, zero protected path violations, 90% dangerous command blocking

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 (both P1) can proceed in parallel
  - US3 and US4 (both P2) can proceed in parallel after P1 stories
  - US5 (P3) can proceed after P2 stories
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but independently testable
- **User Story 3 (P2)**: Depends on US1 execution mode logic - Builds on intent router
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent checkpoint system
- **User Story 5 (P3)**: Depends on US1 workflow completion - Needs patterns to learn from

### Within Each User Story

- Types before implementations
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- US1 and US2 can be worked on in parallel (both P1)
- US3 and US4 can be worked on in parallel (both P2)
- All tests for a user story marked [P] can run in parallel

---

## Parallel Example: User Story 1 + User Story 2 (Both P1)

```bash
# Launch US1 and US2 in parallel (both are P1 priority):
Task: "T019 [US1] Create language detector module in lib/intent/language-detector.ts"
Task: "T020 [US1] Implement Intent Router agent prompt in agents/intent-router.md"
Task: "T028 [US2] Implement DNA scanner in lib/dna/scanner.ts"
Task: "T029 [US2] Create Context Engine agent prompt in agents/context-engine.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test natural language task execution independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + User Story 2 (P1)
   - Developer B: User Story 3 + User Story 4 (P2)
   - Developer C: User Story 5 (P3)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are relative to repository root

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 68 |
| **Phase 1: Setup** | 6 tasks |
| **Phase 2: Foundational** | 11 tasks |
| **Phase 3: US1** | 9 tasks |
| **Phase 4: US2** | 7 tasks |
| **Phase 5: US3** | 7 tasks |
| **Phase 6: US4** | 11 tasks |
| **Phase 7: US5** | 7 tasks |
| **Phase 8: Polish** | 9 tasks |
| **Parallel Opportunities** | 35 tasks marked [P] |
| **MVP Scope** | Phase 1 + Phase 2 + Phase 3 (26 tasks) |

---

*Tasks Version: 1.0 | Created: 2026-03-14*
