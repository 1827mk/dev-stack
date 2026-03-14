# CLI Contracts: Dev-Stack v6 Commands

**Purpose**: Define the command interface for the Dev-Stack v6 plugin

---

## Command Overview

| Command | Description | Phase |
|---------|-------------|-------|
| `/dev-stack:agent` | Execute task with full 6-phase workflow | All |
| `/dev-stack:agent --quick` | Skip THINK phase, faster execution | Simple tasks |
| `/dev-stack:learn` | Force full DNA rescan | Setup/Maintenance |
| `/dev-stack:status` | Show current state dashboard | Anytime |
| `/dev-stack:rollback` | Revert changes with diff preview | Recovery |
| `/dev-stack:checkpoint` | Manual checkpoint save | Anytime |
| `/dev-stack:history` | Show action history | Anytime |
| `/dev-stack:undo` | Undo last N actions | Recovery |
| `/dev-stack:redo` | Redo undone actions | Recovery |
| `/dev-stack:transfer` | Transfer patterns between projects | Migration |

---

## Command Specifications

### `/dev-stack:agent`

**Purpose**: Execute a task with the full 6-phase THINK → RESEARCH → BUILD → TEST → LEARN → VERIFY workflow

**Usage**:
```
/dev-stack:agent [task description]
/dev-stack:agent --quick [task description]
/dev-stack:agent --mode=auto|plan|confirm|interactive [task description]
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| task description | string | Yes | Natural language task (Thai/English/mixed) |
| --quick | flag | No | Skip THINK phase for faster execution |
| --mode | string | No | Override execution mode (auto, plan, confirm, interactive) |

**Output Format**:

```markdown
# Dev-Stack Agent: [Derived Intent]

**Mode**: AUTO | PLAN_FIRST | CONFIRM | INTERACTIVE
**Complexity**: 0.X (Low/Medium/High)
**Workflow**: [Dynamic steps]

## Progress
✅ THINK: [What was analyzed]
✅ RESEARCH: [What was found] (if applicable)
🔄 BUILD: [Current action]
⏳ TEST: Pending
⏳ LEARN: Pending
⏳ VERIFY: Pending

## Files
+ Created: [path]
~ Modified: [path]

## Next Step
[What happens next]
```

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | Success - task completed |
| 1 | Partial - some steps completed, user intervention needed |
| 2 | Blocked - guard blocked operation |
| 3 | Error - unexpected failure |
| 4 | Cancelled - user cancelled |

**Examples**:

```
User: /dev-stack:agent เพิ่มระบบ authentication ด้วย JWT

Output:
# Dev-Stack Agent: add_jwt_authentication

**Mode**: PLAN_FIRST
**Complexity**: 0.65 (High)
**Workflow**: analyze_auth_patterns → design_jwt_flow → implement_middleware → add_routes → test

## Plan (requires approval)
1. Create src/auth/jwt.ts with token generation/validation
2. Create src/middleware/auth.ts for request authentication
3. Add protected routes in src/routes/api.ts
4. Write tests in tests/auth.test.ts

Approve this plan? [y/N]: _
```

---

### `/dev-stack:learn`

**Purpose**: Force a full DNA rescan of the project to update Project DNA

**Usage**:
```
/dev-stack:learn
/dev-stack:learn --deep
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| --deep | flag | No | Include dependency analysis and pattern extraction |

**Output Format**:

```markdown
# Dev-Stack Learn: DNA Scan Complete

## Project Identity
- **Name**: [project name]
- **Type**: [web-app | api | library | cli | mobile]
- **Language**: [primary language]

## Architecture Discovered
- **Framework**: [detected framework]
- **Entry Points**: [list of main files/routes]
- **Key Directories**: [structure discovered]

## Patterns Found
- **Naming Convention**: [camelCase | snake_case | kebab-case]
- **Component Pattern**: [functional | class-based | hooks]
- **API Pattern**: [REST | GraphQL | RPC]

## Risk Areas
- **Protected Paths**: [.env, migrations/, etc.]
- **High Coupling**: [files with high interdependency]

## Learnings Stored
- [X] patterns indexed
- [X] DNA updated

**Duration**: [time in seconds]
```

---

### `/dev-stack:status`

**Purpose**: Show current Dev-Stack state including DNA, checkpoint, and logs

**Usage**:
```
/dev-stack:status
/dev-stack:status --verbose
/dev-stack:status --json
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| --verbose | flag | No | Show detailed information |
| --json | flag | No | Output in JSON format |

**Output Format**:

```markdown
# Dev-Stack Status

## Session
- **ID**: sess_abc123
- **Started**: 2026-03-14 10:00:00
- **Turns**: 47

## Current Task
- **Request**: "เพิ่มระบบ authentication"
- **Intent**: add_jwt_authentication
- **Phase**: BUILD (3/6)
- **Mode**: PLAN_FIRST

## Progress
✅ THINK: Complete
✅ RESEARCH: Complete
🔄 BUILD: 2/5 files
⏳ TEST: Pending
⏳ LEARN: Pending
⏳ VERIFY: Pending

## Files Touched
+ src/auth/jwt.ts
~ src/middleware/auth.ts

## Memory
- **Patterns**: 156 stored
- **Last Checkpoint**: 5 minutes ago
- **Base SHA**: e0c15cb

## Guards
- **Scope Guard**: Active (8 protected paths)
- **Secret Scanner**: Active
- **Bash Guard**: Active

## Audit
- **Actions Today**: 23
- **Blocked**: 2
- **Success Rate**: 91%
```

---

### `/dev-stack:rollback`

**Purpose**: Revert changes with diff preview before execution

**Usage**:
```
/dev-stack:rollback
/dev-stack:rollback --level=N
/dev-stack:rollback --to=SHA
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| --level | int | No | Rollback level (1-5) |
| --to | string | No | Rollback to specific commit SHA |

**Rollback Levels**:
| Level | Scope | Description |
|-------|-------|-------------|
| 1 | Last action | Undo single file change |
| 2 | Last phase | Undo entire BUILD phase |
| 3 | Last task | Undo entire task |
| 4 | To checkpoint | Return to saved state |
| 5 | To base SHA | Full reset to original commit |

**Output Format**:

```markdown
# Dev-Stack Rollback

**Level**: 3 (Last task)
**Task**: "เพิ่มระบบ authentication"

## Files to Revert
- src/auth/jwt.ts (delete)
- src/middleware/auth.ts (revert)
- src/routes/api.ts (revert)

## Diff Preview
```diff
--- a/src/middleware/auth.ts
+++ b/src/middleware/auth.ts
@@ -1,10 +1,3 @@
-import { verifyToken } from './jwt';
-export function authMiddleware(req, res, next) {
-  const token = req.headers.authorization;
-  if (!verifyToken(token)) {
-    return res.status(401).json({ error: 'Unauthorized' });
-  }
-  next();
-}
+// File was empty before
```

**Base SHA**: e0c15cb
**Checkpoint available**: Yes

Confirm rollback? [y/N]: _
```

---

### `/dev-stack:checkpoint`

**Purpose**: Manually save a session checkpoint

**Usage**:
```
/dev-stack:checkpoint
/dev-stack:checkpoint --note="description"
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| --note | string | No | Add note to checkpoint |

**Output Format**:

```markdown
# Checkpoint Saved

**Time**: 2026-03-14T12:30:45.123Z
**Phase**: BUILD (3/6)
**Task**: "เพิ่มระบบ authentication"

## State Captured
- Session ID: sess_abc123
- Turns: 47
- Files touched: 3
- Decisions: 2

## Files
+ src/auth/jwt.ts
~ src/middleware/auth.ts
~ src/routes/api.ts

## Next Steps
1. Complete api.ts middleware integration
2. Add remaining routes
3. Write tests
4. Verify all endpoints

Checkpoint path: .dev-stack/memory/checkpoint.md
```

---

### `/dev-stack:history`

**Purpose**: Show recent action history for time travel

**Usage**:
```
/dev-stack:history
/dev-stack:history --n=10
/dev-stack:history --json
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| --n | int | No | Number of actions to show (default: 10) |
| --json | flag | No | Output in JSON format |

**Output Format**:

```markdown
# Dev-Stack History

Recent Actions:
────────────────────────────────────────────────────────────
#15 ✅ Edit src/routes/api.ts (2 min ago)
#14 ✅ Edit src/middleware/auth.ts (5 min ago)
#13 ✅ Write src/auth/jwt.ts (8 min ago)
#12 ✅ Bash npm test (10 min ago)
#11 ⚠️ BLOCKED Write .env (12 min ago)
     └── Reason: Protected path
#10 ✅ Read src/routes/api.ts (15 min ago)

Undo last N actions: /dev-stack:undo N
```

---

### `/dev-stack:undo`

**Purpose**: Undo last N actions

**Usage**:
```
/dev-stack:undo
/dev-stack:undo 3
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| N | int | No | Number of actions to undo (default: 1) |

**Output Format**:

```markdown
# Undo Complete

**Undid**: 3 actions (#15, #14, #13)

## Files Reverted
- src/routes/api.ts → state at #12
- src/middleware/auth.ts → state at #12
- src/auth/jwt.ts → deleted

## Redo Available
/dev-stack:redo 3
```

---

### `/dev-stack:redo`

**Purpose**: Redo previously undone actions

**Usage**:
```
/dev-stack:redo
/dev-stack:redo 3
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| N | int | No | Number of actions to redo (default: 1) |

**Output Format**:

```markdown
# Redo Complete

**Redid**: 3 actions

## Files Restored
+ src/auth/jwt.ts
~ src/middleware/auth.ts
~ src/routes/api.ts

## Undo Available
/dev-stack:undo 3
```

---

### `/dev-stack:transfer`

**Purpose**: Transfer learned patterns between projects

**Usage**:
```
/dev-stack:transfer --pattern=NAME --to=PROJECT
/dev-stack:transfer --all --to=PROJECT
/dev-stack:transfer --interactive
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| --pattern | string | No | Pattern name to transfer |
| --all | flag | No | Transfer all relevant patterns |
| --to | string | Yes* | Target project path (*required unless --interactive) |
| --interactive | flag | No | Interactive selection mode |

**Output Format**:

```markdown
# Pattern Transfer

**Source**: /path/to/source-project
**Target**: /path/to/target-project

## Patterns Transferred
1. auth_middleware_jwt → auth_middleware_jwt (adapted)
   - Changed: JWT library from jose to jsonwebtoken
2. error_handler_standard → error_handler_standard (direct)
3. logging_middleware → logging_middleware (adapted)
   - Changed: Logger from winston to pino

## Skipped Patterns
- database_postgres (incompatible: target uses MongoDB)

**Success**: 3 patterns transferred, 1 skipped
```

---

## Error Messages

| Error Code | Message | Resolution |
|------------|---------|------------|
| DS001 | "DNA not found - run /dev-stack:learn first" | Run `/dev-stack:learn` to initialize project DNA |
| DS002 | "Checkpoint not found" | No checkpoint exists for this session |
| DS003 | "Protected path: {path}" | File is in scope-guard list, use alternative path |
| DS004 | "Secret detected in operation" | Secret scanner found sensitive data, use env vars |
| DS005 | "Dangerous command blocked" | Bash guard blocked dangerous command |
| DS006 | "Pattern not found: {name}" | Requested pattern doesn't exist |
| DS007 | "Rollback failed: conflicts detected" | Manual resolution required |
| DS008 | "Capability unavailable: {capability}" | Primary and fallback tools both unavailable |

---

*CLI Contracts Version: 1.0 | Created: 2026-03-14*
