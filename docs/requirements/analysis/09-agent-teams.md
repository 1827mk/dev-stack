# Analysis: Claude Code Agent Teams
**Source**: https://code.claude.com/docs/en/agent-teams
**Type**: Native Agent Coordination API
**Analyzed**: 2026-03-12

---

## Overview

Agent Teams เป็น native Claude Code API สำหรับ coordinated multi-agent work โดยมี TeamCreate, TaskList, SendMessage และ TeamDelete เป็น core tools

---

## Key Features

### 1. Team Creation
```javascript
TeamCreate({
  team_name: "my-project",
  description: "Working on feature X",
  agent_type: "general-purpose"  // Optional: team lead role
})
```

**Creates:**
- Team file at `~/.claude/teams/{team-name}.json`
- Task list directory at `~/.claude/tasks/{team-name}/`

### 2. Team Configuration
```json
{
  "members": [
    {
      "name": "team-lead",
      "agentId": "abc-123",
      "agentType": "general-purpose"
    },
    {
      "name": "researcher",
      "agentId": "def-456",
      "agentType": "Explore"
    }
  ]
}
```

### 3. Spawning Teammates
```javascript
Agent({
  subagent_type: "general-purpose",
  team_name: "my-project",
  name: "researcher",
  prompt: "Your task here..."
})
```

### 4. Inter-Agent Messaging
```javascript
// Direct message
SendMessage({
  type: "message",
  recipient: "researcher",
  content: "Please analyze the auth module",
  summary: "Auth module analysis"
})

// Broadcast (use sparingly)
SendMessage({
  type: "broadcast",
  content: "Critical issue found",
  summary: "Critical blocking issue"
})

// Shutdown request
SendMessage({
  type: "shutdown_request",
  recipient: "researcher",
  content: "Task complete, wrapping up"
})

// Shutdown response
SendMessage({
  type: "shutdown_response",
  request_id: "abc-123",
  approve: true  // or false with reason
})
```

### 5. Task Management
```javascript
// Create task
TaskCreate({
  subject: "Implement auth module",
  description: "Add JWT authentication",
  activeForm: "Implementing auth module"
})

// Update task
TaskUpdate({
  taskId: "1",
  status: "in_progress",
  owner: "researcher"
})

// List tasks
TaskList()

// Get task details
TaskGet({ taskId: "1" })
```

### 6. Team Cleanup
```javascript
TeamDelete()
```

**Removes:**
- Team directory
- Task directory
- Team context from session

---

## Comparison with Dev-Stack

| Feature | Dev-Stack | Native Agent Teams |
|---------|-----------|-------------------|
| Team Creation | No | TeamCreate |
| Task System | Custom TaskList | Native TaskList |
| Messaging | SendMessage tool | Native SendMessage |
| Task Dependencies | Manual | Built-in |
| Parallel Execution | Agent tool | Spawn multiple |
| Cleanup | Manual | TeamDelete |

---

## Gaps Identified

### Critical
1. **Not Using Native TeamCreate** - Dev-Stack ไม่ได้ใช้ native API
2. **Custom Task System** - Dev-Stack ใช้ custom implementation
3. **No Team Cleanup** - Dev-Stack ไม่มี TeamDelete

### Important
4. **No Native Messaging** - Dev-Stack ไม่ใช้ native SendMessage
5. **No Task Dependencies** - Dev-Stack ไม่มี built-in dependencies
6. **Manual Coordination** - Dev-Stack ต้องจัดการ coordination เอง

---

## Unique Features in Native Agent Teams

### Team Configuration File
```
~/.claude/teams/{team-name}/config.json
```
Contains member info:
- `name`: Human-readable name (for messaging)
- `agentId`: Unique identifier
- `agentType`: Role/type

### Automatic Message Delivery
- Messages delivered automatically
- No need to poll for messages
- Notification when messages waiting

### Idle State Management
- Teammates go idle after every turn
- Idle = waiting for input, NOT done
- Can be woken up with messages

### Task List Coordination
- Shared task list for all teammates
- Access at `~/.claude/tasks/{team-name}/`
- TaskCreate, TaskUpdate, TaskList, TaskGet

### Shutdown Protocol
```
shutdown_request → shutdown_response (approve/reject)
```

### Plan Approval Flow
```
plan_approval_request → plan_approval_response (approve/reject)
```

---

## Teammate Workflow

1. **After completing task**: Check TaskList for next work
2. **Claim task**: TaskUpdate with `owner`
3. **If blocked**: Notify team lead or help resolve
4. **When done**: Mark task completed via TaskUpdate

---

## Message Types

| Type | Purpose |
|------|---------|
| `message` | Direct message to single teammate |
| `broadcast` | Message to ALL teammates (use sparingly) |
| `shutdown_request` | Request graceful shutdown |
| `shutdown_response` | Approve/reject shutdown |
| `plan_approval_request` | Request plan approval |
| `plan_approval_response` | Approve/reject plan |

---

## Recommendations for Dev-Stack

1. **Migrate to Native Agent Teams**
   - Replace custom TaskList with native
   - Use TeamCreate for team setup
   - Use TeamDelete for cleanup

2. **Use Native Messaging**
   - Replace custom SendMessage with native
   - Implement shutdown protocol
   - Add plan approval flow

3. **Add Task Dependencies**
   - Use built-in blockedBy/blocks
   - Implement dependency resolution

4. **Update Agent Spawning**
   - Use team_name parameter
   - Set descriptive names
   - Configure agent types

---

## Actionable Items

- [ ] Replace custom TaskList with native TeamCreate
- [ ] Implement native SendMessage usage
- [ ] Add shutdown protocol support
- [ ] Add plan approval flow
- [ ] Implement TeamDelete cleanup
- [ ] Add task dependency support
- [ ] Update agent spawning with team_name
