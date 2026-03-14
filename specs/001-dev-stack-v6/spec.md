# Feature Specification: Dev-Stack v6 Meta-Orchestrator Plugin

**Feature Branch**: `001-dev-stack-v6`
**Created**: 2026-03-14
**Updated**: 2026-03-14
**Status**: Draft
**Input**: User description: "สร้าง plugin dev-stack v6 ที่เป็น Meta-Orchestrator บริหารจัดการ context engineering, MCP servers, plugins และ skills โดย user สั่งงานด้วยภาษาคนแล้ว AI เลือก tools เอง"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Natural Language Task Execution (Priority: P1)

As a developer, I want to give instructions in natural language (Thai/English/mixed) without knowing tool names, so that I can focus on what I want done rather than how to do it.

**Why this priority**: This is the core value proposition - eliminating the need to memorize tool names and workflows. Without this, the plugin provides no user benefit.

**Independent Test**: Can be fully tested by giving a simple task in Thai like "อ่านไฟล์นี้และสรุปให้หน่อย" and verifying the system selects appropriate tools (serena, read) and produces a summary without user specifying tool names.

**Acceptance Scenarios**:

1. **Given** a user says "หาว่า authentication ทำงานยังไง", **When** the system processes this request, **Then** it automatically selects code intelligence tools (serena:find_symbol, serena:find_referencing_symbols) without user specifying them
2. **Given** a user says "ทำให้หน้าแรกโหลดเร็วขึ้น", **When** the system analyzes the context, **Then** it derives intent as "optimize_api_and_assets" and generates appropriate workflow steps
3. **Given** a user provides mixed Thai-English input "Fix bug ในหน้า checkout", **When** the system detects language, **Then** it correctly identifies mixed language and handles both parts appropriately

**Input Edge Cases**:

4. **Given** a user provides empty input, **When** the system receives it, **Then** it prompts for clarification with examples
5. **Given** a user provides extremely long input (>10,000 characters), **When** the system processes it, **Then** it truncates to token limit and confirms understanding with user
6. **Given** a user provides code-heavy input (mostly code, little natural language), **When** the system analyzes it, **Then** it extracts intent from code structure and variable names
7. **Given** a user provides emoji-only input, **When** the system receives it, **Then** it prompts for text clarification in INTERACTIVE mode

---

### User Story 2 - Context-Aware Intent Derivation (Priority: P1)

As a developer, I want the system to understand my intent based on the current codebase context, not just keywords, so that it can suggest the most appropriate action plan.

**Why this priority**: This differentiates the plugin from simple keyword-based routers. Context-aware derivation enables intelligent decisions that match the actual project state.

**Independent Test**: Can be tested by giving the same request in different project contexts (e.g., "ทำให้เร็วขึ้น" in a project with API bottlenecks vs one with large assets) and verifying different derived intents.

**Acceptance Scenarios**:

1. **Given** user says "ทำให้หน้าแรกโหลดเร็วขึ้น" and the project has many API calls, **When** the system analyzes context, **Then** it derives intent as "optimize_api_calls" with workflow focusing on API optimization
2. **Given** user says "ทำให้หน้าแรกโหลดเร็วขึ้น" and the project has large unoptimized images, **When** the system analyzes context, **Then** it derives intent as "optimize_assets" with workflow focusing on asset optimization
3. **Given** user says "แก้ไขระบบ login ไม่ทำงาน" and error logs show token validation failures, **When** the system analyzes context, **Then** it derives intent as "fix_token_validation" with specific diagnostic workflow

**Context Edge Cases**:

4. **Given** a brand new project with no DNA, **When** user gives first task, **Then** system runs initial DNA scan and proceeds with default assumptions
5. **Given** a monorepo with multiple sub-projects, **When** user gives task without specifying sub-project, **Then** system asks which sub-project or uses current working directory
6. **Given** a config-only project with no source code, **When** user gives task, **Then** system derives intent from config file structure and documentation

---

### User Story 3 - Hybrid Execution with Risk-Based Decisions (Priority: P2)

As a developer, I want simple tasks to execute automatically while complex tasks require my confirmation, so that I save time on routine work but maintain control over important changes.

**Why this priority**: This balances automation with safety. Users get efficiency gains without losing control of critical decisions.

**Independent Test**: Can be tested by submitting tasks of varying complexity and verifying correct execution mode selection (AUTO, PLAN_FIRST, CONFIRM, INTERACTIVE).

**Acceptance Scenarios**:

1. **Given** a task with complexity score below 0.3 (simple), **When** the system evaluates risk, **Then** it executes in AUTO mode without asking for confirmation
2. **Given** a task with complexity score 0.3-0.6 and medium risk, **When** the system evaluates risk, **Then** it shows a plan first and asks for approval before executing
3. **Given** a task with complexity score above 0.6 involving security-sensitive files, **When** the system evaluates risk, **Then** it requires confirmation before each step
4. **Given** a task in an unknown codebase area, **When** the system has low confidence, **Then** it switches to INTERACTIVE mode and asks clarifying questions

**Mode Transitions**:

5. **Given** task is in INTERACTIVE mode and user provides clear answers, **When** confidence increases, **Then** system may downgrade to CONFIRM mode
6. **Given** task is in PLAN_FIRST mode and user rejects plan, **When** user provides feedback, **Then** system revises plan and asks for approval again

**Execution Edge Cases**:

7. **Given** a task that requires no tool use (e.g., simple calculation), **When** system analyzes it, **Then** it completes without external tools and reports success
8. **Given** a task that requires all available tools, **When** system plans execution, **Then** it sequences tools appropriately with progress tracking
9. **Given** concurrent task requests from user, **When** system receives them, **Then** it queues tasks and processes sequentially unless explicitly parallel

---

### User Story 4 - Session Continuity via Checkpoints (Priority: P2)

As a developer, I want my work to be automatically saved at checkpoints, so that I can resume where I left off even after context compression or session restart.

**Why this priority**: This prevents loss of work and context, which is critical for long-running tasks that span multiple sessions.

**Independent Test**: Can be tested by starting a multi-step task, triggering checkpoint save, simulating session restart, and verifying the system resumes from the checkpoint.

**Acceptance Scenarios**:

1. **Given** a task is in progress at BUILD phase (3 of 6), **When** checkpoint save triggers, **Then** checkpoint is saved with current phase, files touched, and next steps
2. **Given** a new session starts, **When** the system loads, **Then** it reads checkpoint and displays "Continuing from: BUILD phase (3/6) - Implementing middleware"
3. **Given** user wants to rollback, **When** they issue rollback command, **Then** system shows diff and offers 5 rollback levels (last action, last phase, last task, to checkpoint, to base SHA)

**Recovery Scenarios**:

4. **Given** a session crashes mid-task, **When** user restarts, **Then** system loads checkpoint and offers to resume from last known state
5. **Given** checkpoint file is corrupted, **When** system tries to load it, **Then** it reports corruption, offers git-based rollback, and starts fresh session
6. **Given** multiple sessions exist for same project, **When** system loads checkpoint, **Then** it detects conflicts and prompts user to choose or merge

**Scalability**:

7. **Given** a session with 100+ turns, **When** checkpoint saves, **Then** it compresses older history and keeps only essential state
8. **Given** checkpoint file exceeds 1MB, **When** system saves, **Then** it archives old checkpoints and keeps only current session

---

### User Story 5 - Pattern Learning and Reuse (Priority: P3)

As a developer, I want the system to learn from successful patterns in my project and suggest them for similar future tasks, so that I can benefit from accumulated knowledge.

**Why this priority**: This provides long-term value by making the system smarter over time, but is not essential for basic functionality.

**Independent Test**: Can be tested by completing a task successfully, then starting a similar task and verifying the learned pattern is suggested.

**Acceptance Scenarios**:

1. **Given** user successfully implements authentication, **When** the task completes, **Then** the pattern is stored with success count incremented
2. **Given** user starts a new task about authentication, **When** the system searches patterns, **Then** it returns the stored authentication pattern with high relevance score
3. **Given** user transfers to another project, **When** they request pattern transfer, **Then** relevant patterns are copied and adapted to the new project context

**Pattern Confidence**:

4. **Given** a pattern has 5+ successful uses and 0 failures, **When** confidence is calculated, **Then** it is 1.0 (maximum confidence)
5. **Given** a pattern has mixed success/failure, **When** confidence is calculated, **Then** it is success_count / (success_count + failure_count)

**Recovery Scenarios**:

6. **Given** pattern database is corrupted, **When** system detects corruption, **Then** it recreates database from backup or starts fresh with warning
7. **Given** pattern database has 10,000+ patterns, **When** similarity search runs, **Then** it returns results in under 50ms using HNSW index

---

### Edge Cases (General)

- What happens when user request is completely ambiguous (e.g., "แก้ไข")? System should ask clarifying questions in INTERACTIVE mode
- How does system handle when primary tool is unavailable? It should use fallback tool or notify user with alternatives
- What happens when context analysis finds conflicting patterns? System should present options to user for selection
- How does system handle tasks that span multiple sessions with conflicts? System should detect conflicts and notify user before proceeding
- What happens when risk assessment produces unexpected high score? System should explain the risk factors and require explicit confirmation

---

## Requirements *(mandatory)*

### Functional Requirements

**Intent Router (Layer 1)**

- **FR-001**: System MUST detect and handle Thai, English, and mixed-language user input using character script analysis and language model detection
- **FR-001a**: System MUST handle language detection edge cases: emoji-only input (prompt for clarification), code-heavy input (extract intent from code structure), and mixed script input (process each segment appropriately)
- **FR-002**: System MUST analyze codebase context (target files, current state, root cause hints) before deriving intent
- **FR-003**: System MUST derive intent from VERB + TARGET + CONTEXT formula, not from fixed categories
- **FR-004**: System MUST calculate complexity score (0.0-1.0) based on: files affected (0.0-0.3), risk level (0.0-0.3), dependencies (0.0-0.2), cross-cutting concerns (0.0-0.2)
- **FR-004a**: System MUST handle complexity scoring failures by defaulting to INTERACTIVE mode and asking user for guidance
- **FR-005**: System MUST select execution mode based on complexity and risk: AUTO (<0.3), PLAN_FIRST (0.3-0.6), CONFIRM (0.6-0.8), INTERACTIVE (>0.8 or unknown)
- **FR-006**: System MUST generate dynamic workflow adapted to the specific task context

**Context Engine (Layer 2)**

- **FR-007**: System MUST maintain Project DNA with identity, architecture, patterns, risk areas, and learnings
- **FR-007a**: System MUST refresh Project DNA when: package.json/requirements.txt changes, new directory structure detected, or user explicitly requests with /dev-stack:learn
- **FR-007b**: System MUST support DNA schema versioning with automatic migration from older versions
- **FR-008**: System MUST store patterns in indexed database for fast similarity search
- **FR-009**: System MUST load context using Just-In-Time retrieval: upfront (essential), on-demand (specific), progressive (as needed)
- **FR-009a**: System MUST allocate token budget: 40% for DNA/context, 30% for task execution, 20% for response, 10% buffer
- **FR-009b**: System MUST handle token budget overflow by: summarizing older context, prioritizing recent decisions, and notifying user of compression
- **FR-010**: System MUST manage token budget to prevent context overflow

**Tool Selector (Layer 3)**

- **FR-011**: System MUST maintain Capability Registry mapping capabilities to tools with primary and fallback options
- **FR-012**: System MUST auto-discover available MCP servers and plugins on startup using MCP protocol and plugin directory scan
- **FR-012a**: System MUST detect tool unavailability and skip or notify based on capability criticality
- **FR-012b**: System MUST handle tool selection timeout (30s default) by: using fallback, notifying user, or switching to alternative approach
- **FR-013**: System MUST select tools based on capability match, not hardcoded tool names
- **FR-014**: System MUST compose tool chains for complex operations with explicit sequencing and data passing between tools

**Orchestration Engine (Layer 4)**

- **FR-015**: System MUST execute 6-phase pipeline with defined entry/exit criteria:
  - THINK: Analyze request → Exit when intent clear
  - RESEARCH: Gather info → Exit when no unknowns or user confirms proceed
  - BUILD: Implement → Exit when all files created/modified
  - TEST: Verify → Exit when tests pass or user accepts partial
  - LEARN: Extract patterns → Exit when patterns stored
  - VERIFY: Final check → Exit when all acceptance criteria met
- **FR-015a**: System MUST support phase transitions: skip RESEARCH if no unknowns, loop back to THINK if new info emerges, skip LEARN if pattern already exists
- **FR-016**: System MUST support parallel execution for independent tasks within same phase
- **FR-017**: System MUST recover from failures using appropriate strategies: retry (transient errors), rollback (data corruption), escalate (user intervention needed)
- **FR-017a**: System MUST support mode de-escalation: INTERACTIVE → CONFIRM (when answers clear), CONFIRM → PLAN_FIRST (when trusted), PLAN_FIRST → AUTO (when complexity drops)
- **FR-018**: System MUST track progress using task list integration with real-time status updates

**Security and Guardrails (Layer 5)**

- **FR-019**: System MUST block operations on protected paths (environment files, migrations, git directory, credentials files)
- **FR-019a**: System MUST NOT allow guard bypass - all operations must pass through guards regardless of user permission level
- **FR-020**: System MUST scan for secrets before any Write, Edit, or Bash operation using pattern matching for API keys, passwords, tokens, private keys
- **FR-021**: System MUST block dangerous Bash commands (recursive delete all, fork bombs, disk overwrites, database drops)
- **FR-022**: System MUST log all actions to audit trail in JSONL format
- **FR-023**: System MUST assess risk before execution with defined thresholds: LOW (<0.3, auto-proceed), MEDIUM (0.3-0.6, confirm once), HIGH (>0.6, confirm each step), CRITICAL (>0.8, require explicit approval)

**Persistence and Recovery (Layer 6)**

- **FR-024**: System MUST save session checkpoint before context compression with: session ID, phase, files touched, decisions, next steps
- **FR-024a**: System MUST resolve checkpoint conflicts by: timestamp comparison, user prompt for choice, or merge if non-overlapping
- **FR-025**: System MUST persist patterns across sessions in indexed database with HNSW for similarity search
- **FR-025a**: System MUST calculate pattern confidence as: success_count / (success_count + failure_count), minimum 1 interaction required
- **FR-026**: System MUST support 5-level rollback: (1) last action, (2) last phase, (3) last task, (4) to checkpoint, (5) to base commit
- **FR-026a**: System MUST handle non-git projects by: disabling git-based rollback levels, offering checkpoint-only rollback, and clearly indicating limitations
- **FR-027**: System MUST learn from task completion (success patterns, failure patterns, user feedback)
- **FR-028**: System MUST provide time travel commands (history, undo, redo, replay)

### Key Entities

- **Project DNA**: Persistent knowledge about a project including identity, architecture, patterns, risk areas, and learnings. Represents the accumulated understanding of the codebase that persists across sessions. Schema versioned for migration compatibility.
- **Pattern**: Reusable solution or approach with name, description, code example, tags, vector embedding, success and failure counts, confidence score (calculated), and source project. Used for similarity-based retrieval and learning.
- **Checkpoint**: Session state snapshot including current task, phase, progress, files touched, base commit SHA, key decisions, and next steps. Enables session continuity and rollback. Supports conflict resolution for multi-session scenarios.
- **Capability**: Mapping of a functional capability to tools (primary and fallback) with description, timeout, and guard requirements. Enables tool-agnostic capability requests.
- **Audit Entry**: Record of every action with timestamp, session ID, tool, action, target, result, reason (if blocked), and guard (if blocked). Provides full traceability.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete simple tasks (complexity below 0.3) without specifying any tool names in 95% of cases (measured by: tool selection audit log analysis)
- **SC-002**: System correctly derives context-aware intent in 80% of test cases across different project contexts (measured by: intent accuracy evaluation suite)
- **SC-003**: Checkpoint save and restore completes in under 500 milliseconds (measured by: performance benchmark with 100-turn session)
- **SC-004**: Pattern similarity search returns top 5 results in under 50 milliseconds (measured by: benchmark with 10,000 patterns)
- **SC-005**: Zero accidental modifications to protected paths (measured by: scope guard audit log review)
- **SC-006**: Zero secret leaks to code files (measured by: secret scanner audit log review)
- **SC-007**: 90% of blocked dangerous commands are caught before execution (measured by: test command suite with 100 dangerous patterns)
- **SC-008**: Session resume from checkpoint restores all context with no loss of task progress (measured by: session continuity test suite)
- **SC-009**: Users report 50% reduction in context loss moments (measured by: user survey comparing before/after implementation)
- **SC-010**: Average 30% reduction in revision cycles due to thinking-first workflow (measured by: development metrics comparison)

---

## Assumptions

- Users have Claude Code CLI installed and configured (fallback: display installation instructions)
- Users have at least one MCP server available for code intelligence (fallback: use built-in filesystem tools with degraded functionality)
- Projects are git repositories for rollback functionality (fallback: disable git-based rollback, offer checkpoint-only rollback)
- Users work in Thai, English, or mixed languages
- Local database storage is available for pattern persistence (fallback: use in-memory storage with warning about non-persistence)
- Users accept the 5% user / 95% AI autonomy model

---

## Dependencies

### Version Requirements

- **Claude Code CLI**: Version 1.0.0 or higher
- **MCP Protocol**: Version 2024-11-05 or compatible
- **SQLite**: Version 3.40+ (for HNSW extension support)
- **HNSW Extension**: sqlite-vss or equivalent for vector similarity search
- **Node.js**: Version 18+ (for plugin runtime)
- **TypeScript**: Version 5.x (for plugin development)

### External Services

- **MCP Servers**: At least one code intelligence server (serena recommended)
- **Git**: Version 2.0+ for rollback functionality

---

## Out of Scope

- Mobile app interfaces
- Real-time collaborative editing
- Cloud-based pattern sharing between users
- IDE-specific integrations (VS Code, JetBrains, etc.)
- Voice input support
- Multi-user authentication and permissions
