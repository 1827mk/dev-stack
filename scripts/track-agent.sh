#!/bin/bash
# Dev-Stack Orchestrator - Agent Tracking Script
# Runs on SubagentStart and SubagentStop hooks

set -e

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-.}"
CONTEXT_DIR="$PLUGIN_ROOT/context"
TRACKING_FILE="$CONTEXT_DIR/agent-tracking.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Ensure context directory exists
mkdir -p "$CONTEXT_DIR"

# Get action from argument
ACTION="${1:-status}"
AGENT_ID="${CLAUDE_AGENT_ID:-unknown}"
AGENT_TYPE="${CLAUDE_AGENT_TYPE:-unknown}"
AGENT_SCOPE="${CLAUDE_AGENT_SCOPE:-unknown}"

# Function to log agent event
log_event() {
    local event_type="$1"
    local agent_id="$2"
    local agent_type="$3"
    local scope="$4"
    local details="$5"
    
    echo "[$TIMESTAMP] $event_type | Agent: $agent_id | Type: $agent_type | Scope: $scope | $details" >> "$TRACKING_FILE"
}

# Function to calculate duration
calculate_duration() {
    local start_time="$1"
    local end_time="$2"
    
    if command -v python3 &> /dev/null; then
        python3 -c "
from datetime import datetime
start = datetime.fromisoformat('$start_time'.replace('Z', '+00:00'))
end = datetime.fromisoformat('$end_time'.replace('Z', '+00:00'))
print(int((end - start).total_seconds()))
" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

case "$ACTION" in
    start)
        # Log agent start
        log_event "START" "$AGENT_ID" "$AGENT_TYPE" "$AGENT_SCOPE" "Agent spawned"
        
        # Store start time for duration calculation
        echo "$AGENT_ID:$TIMESTAMP" >> "$CONTEXT_DIR/agent-start-times.tmp"
        
        echo "[Agent Track] $TIMESTAMP - Agent $AGENT_ID ($AGENT_TYPE) started in scope: $AGENT_SCOPE"
        ;;
        
    stop)
        # Calculate duration
        START_TIME=""
        if [ -f "$CONTEXT_DIR/agent-start-times.tmp" ]; then
            START_TIME=$(grep "^$AGENT_ID:" "$CONTEXT_DIR/agent-start-times.tmp" | cut -d: -f2 | head -1)
            # Remove the start time entry
            grep -v "^$AGENT_ID:" "$CONTEXT_DIR/agent-start-times.tmp" > "$CONTEXT_DIR/agent-start-times.tmp.new" 2>/dev/null || true
            mv "$CONTEXT_DIR/agent-start-times.tmp.new" "$CONTEXT_DIR/agent-start-times.tmp" 2>/dev/null || true
        fi
        
        if [ -n "$START_TIME" ]; then
            DURATION=$(calculate_duration "$START_TIME" "$TIMESTAMP")
            DETAILS="Duration: ${DURATION}s"
        else
            DETAILS="Duration: unknown"
        fi
        
        # Get agent status from environment
        STATUS="${CLAUDE_AGENT_STATUS:-completed}"
        DETAILS="$DETAILS | Status: $STATUS"
        
        # Log agent stop
        log_event "STOP" "$AGENT_ID" "$AGENT_TYPE" "$AGENT_SCOPE" "$DETAILS"
        
        echo "[Agent Track] $TIMESTAMP - Agent $AGENT_ID ($AGENT_TYPE) stopped | $DETAILS"
        ;;
        
    status)
        # Display current tracking status
        if [ -f "$TRACKING_FILE" ]; then
            echo "=== Agent Tracking Log ==="
            tail -20 "$TRACKING_FILE"
            echo "=========================="
        else
            echo "No agent tracking data available."
        fi
        ;;
        
    summary)
        # Generate summary of agent activity
        if [ -f "$TRACKING_FILE" ]; then
            echo "=== Agent Activity Summary ==="
            
            # Count starts and stops
            STARTS=$(grep -c "START" "$TRACKING_FILE" 2>/dev/null || echo "0")
            STOPS=$(grep -c "STOP" "$TRACKING_FILE" 2>/dev/null || echo "0")
            
            echo "Total agents spawned: $STARTS"
            echo "Total agents completed: $STOPS"
            echo ""
            
            # Show by type
            echo "By Type:"
            grep "START" "$TRACKING_FILE" | awk -F'|' '{print $3}' | sort | uniq -c
            
            echo ""
            echo "By Scope:"
            grep "START" "$TRACKING_FILE" | awk -F'|' '{print $4}' | sort | uniq -c
            
            echo "============================="
        else
            echo "No agent tracking data available."
        fi
        ;;
        
    *)
        echo "Usage: $0 {start|stop|status|summary}"
        echo ""
        echo "Commands:"
        echo "  start   - Log agent start (called on SubagentStart)"
        echo "  stop    - Log agent stop (called on SubagentStop)"
        echo "  status  - Show recent tracking log"
        echo "  summary - Show agent activity summary"
        exit 1
        ;;
esac

exit 0
