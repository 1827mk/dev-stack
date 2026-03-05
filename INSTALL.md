# Dev-Stack Orchestrator - Installation Guide

**Plugin ID**: `dev-stack`
**Version**: 2.0.0
**Author**: Dev-Stack Team

---

## Quick Install

### Option 1: GitHub Marketplace (Recommended)

```bash
# Step 1: Add marketplace from GitHub
/plugin marketplace add 1827mk/dev-stack

# Step 2: Install plugin
/plugin install dev-stack@dev-stack-marketplace
```

### Option 2: Local Marketplace (For Development)

```bash
# Step 1: Clone repository
git clone https://github.com/1827mk/dev-stack.git ~/.claude/dev-stack

# Step 2: Add local marketplace
/plugin marketplace add ~/.claude/dev-stack

# Step 3: Install plugin
/plugin install dev-stack@dev-stack-marketplace
```

### Option 3: Direct Git URL

```bash
# Add marketplace from Git URL
/plugin marketplace add https://github.com/1827mk/dev-stack.git

# Install plugin
/plugin install dev-stack@dev-stack-marketplace
```

---

## Prerequisites

### Required
- Claude Code CLI installed
- Git

### Optional (Recommended for Full Functionality)
- MCP Server: `serena` - Code operations
- MCP Server: `filesystem` - File operations
- MCP Server: `doc-forge` - Document operations
- MCP Server: `context7` - API documentation
- MCP Server: `memory` - Knowledge graph

---

## Verify Installation

After installation, verify by running:

```
/dev-stack:info
```

Expected output:
- Available commands (7)
- Tool priority system
- Capability mappings
- Scope definitions

---

## MCP Server Setup (Optional)

### serena (Code Operations)
```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["serena"]
    }
  }
}
```

### filesystem (File Operations)
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "/path/to/allowed/dir"]
    }
  }
}
```

### doc-forge (Document Operations)
```json
{
  "mcpServers": {
    "doc-forge": {
      "command": "uvx",
      "args": ["doc-forge"]
    }
  }
}
```

### context7 (API Documentation)
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-context7"]
    }
  }
}
```

### memory (Knowledge Graph)
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-memory"]
    }
  }
}
```

---

## First Steps After Installation

### 1. Check Available Commands
```
/dev-stack:info
```

### 2. Test with Simple Task
```
/dev-stack:dev "read the main configuration file"
```

### 3. Try Multi-Scope Task
```
/dev-stack:agents "add a hello world function and update the readme"
```

### 4. Analyze Complex Task
```
/dev-stack:simplify "build a complete REST API with authentication"
```

---

## Troubleshooting

### Plugin Not Found
```bash
# View all marketplaces
/plugin
# Then go to Marketplaces tab

# Update marketplace to get latest plugins
/plugin marketplace update dev-stack-marketplace
```

### Commands Not Working
```bash
# View installed plugins
/plugin
# Then go to Installed tab

# Check plugin is enabled
/plugin enable dev-stack@dev-stack-marketplace
```

### MCP Tools Not Available
- Plugin will use built-in tools as fallback
- Check MCP server status in Claude Code settings
- Warnings will be logged when using fallback

---

## Uninstall

```bash
# Disable plugin (keeps installed)
/plugin disable dev-stack@dev-stack-marketplace

# Or completely remove
/plugin uninstall dev-stack@dev-stack-marketplace
```

---

## Update

```bash
# Update marketplace listing
/plugin marketplace update dev-stack-marketplace

# Update plugin to latest version
/plugin update dev-stack@dev-stack-marketplace
```

---

## Support

- **Issues**: https://github.com/1827mk/dev-stack/issues
- **Documentation**: `/dev-stack:info`
- **Examples**: See `examples/` directory
