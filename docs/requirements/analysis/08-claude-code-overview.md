# Analysis: Claude Code Overview

**Source**: https://code.claude.com/docs/en/overview
**Type**: Official Claude Code Documentation
**Analyzed**: 2026-03-12
**Updated**: 2026-03-13

---

## Overview

Claude Code เป็น official AI coding assistant จาก Anthropic ที่รองรับหลาย platforms (Terminal, VS Code, Desktop, Web, JetBrains) และมี native Agent Teams API

---

## Available Environments

| Surface | Description |
|---------|-------------|
| **Terminal CLI** | Full-featured CLI for working in terminal. Edit files, run commands, manage entire project. |
| **VS Code** | Inline diffs, @-mentions, plan review, conversation history directly in editor. |
| **Desktop App** | Standalone app for running outside IDE/terminal. Visual diff review, multiple sessions, recurring tasks. |
| **Web** | Browser-based with no local setup. Long-running tasks, work on repos without local copy. |
| **JetBrains** | Plugin for IntelliJ IDEA, PyCharm, WebStorm with interactive diff viewing. |

---

## Installation Methods

### Native Install (Recommended)
- **macOS, Linux, WSL:** `curl -fsSL https://claude.ai/install.sh | bash`
- **Windows PowerShell:** `irm https://claude.ai/install.ps1 | iex`
- **Windows CMD:** `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd`

### Package Managers
- **Homebrew:** `brew install --cask claude-code`
- **WinGet:** `winget install Anthropic.ClaudeCode`

---

## Integration Options

| Use Case | Best Option |
|----------|-------------|
| Continue local session from phone/another device | Remote Control |
| Start locally, continue on mobile | Web or Claude iOS app |
| Automate PR reviews and issue triage | GitHub Actions or GitLab CI/CD |
| Automatic code review on every PR | GitHub Code Review |
| Route bug reports from Slack to pull requests | Slack |
| Debug live web applications | Chrome |
| Build custom agents for your own workflows | Agent SDK |

---

## Cross-Platform Consistency

Each surface connects to the same underlying Claude Code engine, so:
- CLAUDE.md files work across all environments
- Settings sync across surfaces
- MCP servers work everywhere

---

## Key Features

### 1. Core Capabilities
- **Code Generation**: Write, edit, refactor code
- **Code Understanding**: Explain, review, debug
- **Test Generation**: Create and run tests
- **Documentation**: Generate docs
- **Git Operations**: Commit, PR, review
- **MCP Integration**: External tool connections

### 2. Plugin System
- Agents: Specialized subagents
- Skills: Reusable workflows
- Commands: Slash commands
- Hooks: Event-driven automation
- MCP Servers: External integrations

### 3. Agent Teams API (Native)
- TeamCreate: Create coordinated teams
- TeamDelete: Clean up teams
- TaskList: Shared task management
- SendMessage: Inter-agent communication

### 4. Model Support
| Model | Use Case |
|-------|----------|
| claude-opus-4-6 | Deep reasoning, complex tasks |
| claude-sonnet-4-6 | Balanced performance |
| claude-haiku-4-5 | Fast, cost-effective |

---

## Comparison with Dev-Stack

| Feature | Dev-Stack | Claude Code Native |
|---------|-----------|-------------------|
| Multi-Surface | Terminal only | Terminal, VS Code, Desktop, Web, JetBrains |
| Agent Teams | Custom TaskList | Native TeamCreate API |
| Model Strategy | Single model | Multi-model support |
| Plugin System | Yes | Yes |
| MCP Integration | Yes | Yes |
| Hooks | 8 events | Full event system |

---

## Gaps Identified

### Important
1. **Limited Surface Support** - Dev-Stack รองรับเฉพาะ Terminal
2. **Not Using Native Agent Teams** - Dev-Stack ใช้ custom TaskList
3. **Single Model** - Dev-Stack ไม่ใช้ multi-model strategy

### Nice-to-Have
4. **No IDE Extensions** - Dev-Stack ไม่มี VS Code/JetBrains integration
5. **No Desktop App** - Dev-Stack ไม่มี native desktop app

---

## Unique Features in Claude Code Native

### Multi-Surface Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code Core                          │
│  (Shared AI Engine, MCP, Plugin System)                      │
└─────────────────────────────────────────────────────────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
   Terminal     VS Code     Desktop      Web      JetBrains
```

### Native Agent Teams API
```javascript
// Create team
TeamCreate({
  team_name: "my-project",
  description: "Working on feature X"
})

// Spawn teammates with Agent tool
Agent({
  subagent_type: "general-purpose",
  team_name: "my-project",
  name: "researcher"
})

// Send messages
SendMessage({
  type: "message",
  recipient: "researcher",
  content: "Analyze the auth module",
  summary: "Auth module analysis"
})

// Clean up
TeamDelete()
```

### Shared Task List
- Teams have 1:1 correspondence with task lists
- All teammates can access via `~/.claude/tasks/{team-name}/`
- TaskCreate, TaskUpdate, TaskList, TaskGet tools

### Inter-Agent Messaging
- Automatic message delivery
- Idle notifications
- Peer DM visibility
- Shutdown coordination

---

## Recommendations for Dev-Stack

1. **Integrate Native Agent Teams**
   - Replace custom TaskList with TeamCreate API
   - Use native SendMessage for coordination
   - Leverage TeamDelete for cleanup

2. **Add Multi-Surface Support**
   - Create VS Code extension
   - Add JetBrains plugin
   - Consider desktop app

3. **Implement Model Strategy**
   - Route thinker → Opus
   - Route code-builder → Sonnet
   - Route simple tasks → Haiku

---

## Actionable Items

- [ ] Integrate TeamCreate/TeamDelete API
- [ ] Replace custom TaskList with native
- [ ] Implement model routing
- [ ] Add VS Code extension support
- [ ] Consider JetBrains plugin
