# Quickstart: Dev-Stack v6

**Purpose**: Get developers productive with Dev-Stack v6 in 5 minutes

---

## Prerequisites

- Claude Code CLI installed
- Git repository (for rollback features)
- At least one MCP server available (serena recommended)

---

## Installation

1. **Install the plugin**:
   ```bash
   # Clone or copy to your Claude plugins directory
   cp -r dev-stack ~/.claude/plugins/
   ```

2. **Verify installation**:
   ```bash
   /dev-stack:status
   ```

---

## First-Time Setup

### Step 1: Initialize Project DNA

```bash
/dev-stack:learn
```

This scans your codebase and creates `.dev-stack/dna/project.md` with:
- Project identity and tech stack
- Architecture overview
- Coding patterns discovered
- Risk areas identified

**Expected output**:
```
# Dev-Stack Learn: DNA Scan Complete

## Project Identity
- Name: my-api
- Type: api
- Language: TypeScript

## Architecture Discovered
- Framework: Express
- Entry Points: src/index.ts, src/routes/*.ts
...
```

### Step 2: Verify Status

```bash
/dev-stack:status
```

Should show:
- ✅ DNA loaded
- ✅ Guards active
- ✅ Memory initialized

---

## Basic Usage

### Natural Language Task Execution

```bash
# Thai input
/dev-stack:agent หาว่า authentication ทำงานยังไง

# English input
/dev-stack:agent Find how authentication works

# Mixed input
/dev-stack:agent Fix bug ในหน้า checkout
```

**What happens automatically**:
1. System detects language (Thai/English/mixed)
2. Analyzes codebase context
3. Derives intent from VERB + TARGET + CONTEXT
4. Selects appropriate tools (serena, grep, read)
5. Executes and returns summary

### Quick Mode (Skip Thinking)

For simple tasks:
```bash
/dev-stack:agent --quick เพิ่มปุ่ม logout
```

Skips the THINK phase for faster execution on low-complexity tasks.

---

## Understanding Execution Modes

Dev-Stack v6 automatically selects execution mode based on task complexity:

| Mode | Complexity | Behavior |
|------|------------|----------|
| **AUTO** | < 0.3 | Executes without asking |
| **PLAN_FIRST** | 0.3 - 0.6 | Shows plan, asks approval |
| **CONFIRM** | 0.6 - 0.8 | Confirms each step |
| **INTERACTIVE** | > 0.8 or unknown | Works with you step by step |

**Example**:
```
User: /dev-stack:agent เพิ่มระบบ authentication ด้วย JWT

Output:
# Dev-Stack Agent: add_jwt_authentication

**Mode**: PLAN_FIRST (complexity: 0.65)
**Workflow**: analyze_auth_patterns → design_jwt_flow → implement_middleware

## Plan
1. Create src/auth/jwt.ts with token generation/validation
2. Create src/middleware/auth.ts
3. Add protected routes

Approve? [y/N]: _
```

---

## Session Continuity

### Checkpoints

Checkpoints are saved automatically before context compression:
```bash
# Manual checkpoint
/dev-stack:checkpoint --note="Before auth refactor"

# Checkpoint location
cat .dev-stack/memory/checkpoint.md
```

### Resuming

When you start a new session:
```bash
/dev-stack:status
```

Shows:
```
Continuing from: BUILD phase (3/6)
Task: "เพิ่มระบบ authentication"
```

---

## Recovery Operations

### View History

```bash
/dev-stack:history
```

Shows recent actions:
```
#15 ✅ Edit src/routes/api.ts (2 min ago)
#14 ✅ Edit src/middleware/auth.ts (5 min ago)
#13 ✅ Write src/auth/jwt.ts (8 min ago)
```

### Undo Actions

```bash
# Undo last action
/dev-stack:undo

# Undo last 3 actions
/dev-stack:undo 3
```

### Rollback Levels

```bash
# Level 1: Last action
/dev-stack:rollback --level=1

# Level 2: Last phase
/dev-stack:rollback --level=2

# Level 3: Last task
/dev-stack:rollback --level=3

# Level 4: To checkpoint
/dev-stack:rollback --level=4

# Level 5: To base commit
/dev-stack:rollback --level=5
```

---

## Security Features

### Protected Paths

Dev-Stack v6 automatically blocks operations on:
- `.env`, `.env.*` - Environment secrets
- `migrations/` - Database integrity
- `.git/` - Version control
- `*.pem`, `*.key` - Certificates
- `credentials.*`, `secrets.*` - Credential files

**Example**:
```
User: Write new API key to .env

Output:
❌ BLOCKED: Protected path: .env
💡 Suggestion: Use .env.example instead
```

### Secret Scanner

Automatically detects and blocks:
- API keys
- Passwords
- Tokens
- Private keys
- Connection strings

### Bash Guard

Blocks dangerous commands:
- `rm -rf /` - Recursive delete all
- Fork bombs
- Disk overwrites
- Database drops

---

## Pattern Learning

### View Learned Patterns

```bash
# Patterns are stored in
.dev-stack/memory/patterns.db

# Search patterns (future feature)
/dev-stack:agent --search-patterns "auth"
```

### Transfer Patterns

```bash
# Transfer specific pattern to another project
/dev-stack:transfer --pattern=auth_middleware_jwt --to=../other-project

# Transfer all relevant patterns
/dev-stack:transfer --all --to=../other-project
```

---

## Common Workflows

### Adding a Feature

```bash
# 1. Describe what you want (in Thai/English)
/dev-stack:agent เพิ่มระบบ notification สำหรับ user

# 2. Review the plan
# 3. Approve or modify
# 4. System executes BUILD → TEST → VERIFY
```

### Fixing a Bug

```bash
# 1. Describe the bug
/dev-stack:agent แก้ไข login ไม่ทำงานเมื่อ token expired

# 2. System will:
# - RESEARCH: Find root cause
# - BUILD: Fix the issue
# - TEST: Verify fix
# - LEARN: Store the solution
```

### Optimizing Performance

```bash
# Context-aware optimization
/dev-stack:agent ทำให้หน้าแรกโหลดเร็วขึ้น

# System analyzes:
# - API call patterns
# - Asset sizes
# - Caching opportunities
# Then suggests targeted optimizations
```

---

## Troubleshooting

### DNA Not Found

```
Error: DS001 - DNA not found

Solution: Run /dev-stack:learn
```

### Tool Unavailable

```
Error: DS008 - Capability unavailable: code.scan

Solution: Ensure serena MCP server is running
Check: .mcp.json configuration
```

### Blocked Operation

```
Error: DS003 - Protected path: .env

Solution: Use alternative path or environment variables
```

---

## File Structure

After using Dev-Stack v6, you'll see:

```
.dev-stack/
├── dna/
│   └── project.md           # Your project's DNA
├── memory/
│   ├── checkpoint.md        # Session checkpoints
│   └── patterns.db          # Learned patterns
├── logs/
│   └── audit.jsonl          # Action audit trail
└── config/
    └── capabilities.yaml    # Tool mappings
```

---

## Tips

1. **Be descriptive**: More context = better intent derivation
2. **Use natural language**: No need to memorize tool names
3. **Check status regularly**: `/dev-stack:status` shows current state
4. **Create checkpoints**: Before major changes, `/dev-stack:checkpoint`
5. **Review history**: `/dev-stack:history` before undoing

---

## Next Steps

- Read the full spec: `specs/001-dev-stack-v6/spec.md`
- Understand data model: `specs/001-dev-stack-v6/data-model.md`
- View CLI contracts: `specs/001-dev-stack-v6/contracts/cli-contracts.md`

---

*Quickstart Version: 1.0 | Created: 2026-03-14*
