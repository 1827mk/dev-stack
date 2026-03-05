# Dev-Stack Orchestrator

**Intelligent workflow orchestrator for Claude Code with MCP-first tool selection**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/1827mk/dev-stack)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-purple.svg)](https://code.claude.com)

---

## 🚀 Quick Start

### Install

```bash
# Option 1: Local (Development)
git clone https://github.com/1827mk/dev-stack.git ~/.claude/dev-stack
/plugin marketplace add ~/.claude/dev-stack
/plugin install dev-stack

# Option 2: GitHub
/plugin marketplace add https://github.com/1827mk/dev-stack
/plugin install dev-stack
```

### First Use

```
/dev-stack:info                    # View capabilities
/dev-stack:dev "fix a bug"         # Single scope task
/dev-stack:agents "add feature"    # Multi-scope task
```

---

## 📋 Available Commands

| Command | Scope | Description |
|---------|-------|-------------|
| `/dev-stack:agents` | Multi | Team orchestrator with parallel execution |
| `/dev-stack:dev` | dev | Code development only |
| `/dev-stack:git` | git | Git operations only |
| `/dev-stack:docs` | docs | Documentation only |
| `/dev-stack:quality` | quality | Testing & linting only |
| `/dev-stack:info` | - | Display capabilities |
| `/dev-stack:simplify` | - | Task breakdown only |

---

## 🎯 Key Features

### MCP-First Tool Priority
```
Priority 1: MCP Tools (serena, filesystem, doc-forge, context7, memory)
Priority 2: Plugin Skills (task-analysis, tool-selection, workflow-design)
Priority 3: Built-in Tools (Read, Write, Edit, Bash) - LAST RESORT
```

### Scope Boundaries
- **dev**: Code read/write, no git, no tests
- **git**: Git ops only, no code changes
- **docs**: Documentation only, no code changes
- **quality**: Tests/linter only, read-only

### Parallel Execution
Multi-scope tasks spawn workers in parallel for independent operations.

---

## 📚 Documentation

- [Installation Guide](INSTALL.md)
- [Architecture](plans/architecture.md)
- [Testing Plan](plans/testing-plan.md)
- [Full README](README.md)

---

## 🔧 Configuration

### MCP Servers (Optional)

```json
{
  "mcpServers": {
    "serena": { "command": "uvx", "args": ["serena"] },
    "filesystem": { "command": "npx", "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "."] },
    "doc-forge": { "command": "uvx", "args": ["doc-forge"] },
    "context7": { "command": "npx", "args": ["-y", "@anthropic-ai/mcp-server-context7"] },
    "memory": { "command": "npx", "args": ["-y", "@anthropic-ai/mcp-server-memory"] }
  }
}
```

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests: `./scripts/run-tests.sh`
5. Submit pull request

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/1827mk/dev-stack/issues)
- **Docs**: `/dev-stack:info`
