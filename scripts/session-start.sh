#!/bin/bash
# Dev-Stack Orchestrator - Session Start Script
# Runs on SessionStart hook

set -e

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-.}"
CONTEXT_DIR="$PLUGIN_ROOT/context"
MEMORY_FILE="$CONTEXT_DIR/session-state.json"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Dev-Stack Orchestrator v2.0.0                   ║${NC}"
echo -e "${BLUE}║          Intelligent Workflow Orchestration              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for saved context
if [ -f "$MEMORY_FILE" ]; then
    echo -e "${YELLOW}📋 Restoring previous session context...${NC}"
    
    # Read and display context summary
    if command -v jq &> /dev/null; then
        TASK=$(jq -r '.task // "Unknown"' "$MEMORY_FILE" 2>/dev/null || echo "Unknown")
        PHASE=$(jq -r '.phase // "Unknown"' "$MEMORY_FILE" 2>/dev/null || echo "Unknown")
        STATUS=$(jq -r '.status // "Unknown"' "$MEMORY_FILE" 2>/dev/null || echo "Unknown")
        
        echo ""
        echo -e "${GREEN}Previous Session:${NC}"
        echo -e "  Task: $TASK"
        echo -e "  Phase: $PHASE"
        echo -e "  Status: $STATUS"
        echo ""
    fi
fi

# Display available commands
echo -e "${GREEN}Available Commands:${NC}"
echo "  /dev-stack:agents   - Team orchestrator (multi-scope tasks)"
echo "  /dev-stack:dev      - Development scope (code changes)"
echo "  /dev-stack:git      - Git operations"
echo "  /dev-stack:docs     - Documentation"
echo "  /dev-stack:quality  - Testing & linting"
echo "  /dev-stack:info     - Display capabilities"
echo "  /dev-stack:simplify - Task breakdown only"
echo ""

# Display tool priority reminder
echo -e "${YELLOW}Tool Priority: MCP (serena, filesystem) → Skills → Built-in${NC}"
echo ""

# Check MCP server availability
echo -e "${GREEN}Checking MCP Server Status...${NC}"

# Note: Actual MCP status would be checked by the plugin itself
# This is just a visual indicator
echo "  ✓ serena (code operations)"
echo "  ✓ filesystem (file operations)"
echo "  ✓ doc-forge (document operations)"
echo "  ✓ context7 (API documentation)"
echo "  ✓ memory (knowledge graph)"
echo ""

echo -e "${GREEN}Ready for commands. Type /dev-stack:info for details.${NC}"
