# Guard Engine Agent - Dev-Stack v6

## Purpose

Orchestrates all security guards (Layer 5) to ensure safe operations. Runs before and after every tool invocation.

## When to Use

This agent is invoked automatically by hooks:
- **PreToolUse**: Before any tool execution
- **PostToolUse**: After any tool execution

## Guard Pipeline

```
User Request
     │
     ▼
┌─────────────────┐
│  Scope Guard    │ ─── Protected paths check
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Secret Scanner  │ ─── API keys, passwords, tokens
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Bash Guard     │ ─── Dangerous command blocking
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Risk Assessor   │ ─── Complexity scoring 0.0-1.0
└────────┬────────┘
         │
         ▼
    Execute Tool
         │
         ▼
┌─────────────────┐
│  Audit Logger   │ ─── JSONL audit trail
└─────────────────┘
```

## Guard Types

### 1. Scope Guard (`lib/guards/scope-guard.ts`)

**Purpose**: Prevent modifications to protected paths.

**Protected Paths** (default):
- `.env`, `.env.local`, `.env.*.local`
- `**/secrets/**`, `**/credentials/**`
- `.git/**`
- `**/*.pem`, `**/*.key`

**Behavior**:
- READ operations: Allow with logging
- WRITE operations: Block with error
- Configuration: `.dev-stack/config/scope.json`

### 2. Secret Scanner (`lib/guards/secret-scanner.ts`)

**Purpose**: Detect and block secrets from being written to files.

**Detection Patterns**:
- API keys: `sk-*`, `api_key_*`, `apikey_*`
- AWS keys: `AKIA*`, `aws_*`
- Passwords: `password=*`, `passwd=*`
- Tokens: `token_*`, `bearer_*`
- Private keys: `-----BEGIN PRIVATE KEY-----`

**Behavior**:
- Pre-write scan: Block if secret detected
- Post-read scan: Warn if secret in output

### 3. Bash Guard (`lib/guards/bash-guard.ts`)

**Purpose**: Block dangerous shell commands.

**Blocked Commands**:
- `rm -rf /` - Delete everything
- `rm -rf ~` - Delete home
- `:(){:|:&};:` - Fork bomb
- `mkfs` - Format disk
- `dd if=/dev/zero` - Disk overwrite

**Behavior**:
- Exact match: Block immediately
- Pattern match: Require confirmation

### 4. Risk Assessor (`lib/guards/risk-assessor.ts`)

**Purpose**: Calculate risk score for operations.

**Scoring Factors**:
- Files affected: 0.0-0.3
- Risk level: 0.0-0.3
- Dependencies: 0.0-0.2
- Cross-cutting concerns: 0.0-0.2

**Risk Levels**:
| Score | Level | Action |
|-------|-------|--------|
| <0.3 | LOW | Auto-proceed |
| 0.3-0.6 | MEDIUM | Confirm once |
| 0.6-0.8 | HIGH | Confirm each step |
| >0.8 | CRITICAL | Explicit approval |

## Audit Logging

All guard actions are logged to `.dev-stack/logs/audit.jsonl`:

```json
{
  "timestamp": "2026-03-14T12:00:00Z",
  "session_id": "sess-abc123",
  "tool": "Write",
  "action": "write_file",
  "target": "src/auth.ts",
  "result": "blocked",
  "reason": "Secret detected: API key pattern",
  "guard": "secret-scanner"
}
```

## Hook Integration

### PreToolUse Hook

```json
{
  "event": "PreToolUse",
  "prompt": "Run guard pipeline for {tool} with arguments {args}. Block if any guard fails."
}
```

### PostToolUse Hook

```json
{
  "event": "PostToolUse",
  "prompt": "Log action to audit trail. Check for secrets in output. Update risk assessment."
}
```

## Error Codes

| Code | Guard | Message |
|------|-------|---------|
| DS001 | Scope | Protected path access denied |
| DS002 | Secret | Secret detected in content |
| DS003 | Bash | Dangerous command blocked |

## Recovery

When a guard blocks an operation:

1. **Scope Guard**: User can modify `scope.json` (not recommended)
2. **Secret Scanner**: User must remove secret from content
3. **Bash Guard**: User must use safer alternative
4. **Risk Assessor**: User can override with explicit confirmation

## Configuration

Guards can be configured in `.dev-stack/config/scope.json`:

```json
{
  "protected_paths": ["custom/path/**"],
  "dangerous_commands": ["custom-dangerous-cmd"],
  "notifications": {
    "on_protected_access": true,
    "on_dangerous_command": true
  }
}
```

## Performance

- Guard execution: <10ms per operation
- Audit logging: <5ms per entry
- No impact on normal operations

## Notes

- Guards CANNOT be bypassed - all operations pass through guards
- Audit log is append-only for compliance
- Guard configuration changes require session restart
