#!/bin/bash
# Dev-Stack Orchestrator - Context Save Script
# Runs on PreCompact hook to save session state

set -e

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-.}"
CONTEXT_DIR="$PLUGIN_ROOT/context"
MEMORY_FILE="$CONTEXT_DIR/session-state.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Ensure context directory exists
mkdir -p "$CONTEXT_DIR"

# Create session state JSON
# This would typically receive data from the plugin via stdin or environment
# For now, we create a template that the plugin can populate

cat > "$MEMORY_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "task": "\${CLAUDE_TASK:-Unknown}",
  "phase": "\${CLAUDE_PHASE:-Unknown}",
  "status": "\${CLAUDE_STATUS:-in_progress}",
  "workers": {
    "spawned": \${CLAUDE_WORKERS_SPAWNED:-0},
    "completed": \${CLAUDE_WORKERS_COMPLETED:-0},
    "failed": \${CLAUDE_WORKERS_FAILED:-0}
  },
  "tool_usage": {
    "mcp_tools": \${CLAUDE_MCP_TOOLS_USED:-0},
    "fallback_tools": \${CLAUDE_FALLBACK_TOOLS_USED:-0}
  },
  "files_modified": \${CLAUDE_FILES_MODIFIED:-[]},
  "partial_results": \${CLAUDE_PARTIAL_RESULTS:-[]}
}
EOF

# Log the save action
echo "[Context Save] $TIMESTAMP - Session state saved to $MEMORY_FILE"

# If there are any temporary files to save, do it here
if [ -d "$CONTEXT_DIR/tmp" ]; then
    # Move any temp files to persistent storage
    mv "$CONTEXT_DIR/tmp/"* "$CONTEXT_DIR/" 2>/dev/null || true
fi

exit 0
