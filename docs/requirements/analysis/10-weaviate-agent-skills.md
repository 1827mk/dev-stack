# Analysis: Weaviate Agent Skills
**Source**: https://github.com/weaviate/agent-skills
**Type**: Weaviate Integration Skills + Multi-Agent Patterns
**Analyzed**: 2026-03-12

---

## Overview

Weaviate Agent Skills เป็น official skills collection จาก Weaviate สำหรับช่วย developers สร้าง AI applications ด้วย Weaviate vector database โดยมี skills, commands, และ cookbooks ครบวงจร

---

## Key Features

### 1. Installation Methods

| Method | Command | Platform |
|--------|---------|----------|
| npx skills | `npx skills add weaviate/agent-skills` | Cursor, Claude Code, Gemini CLI |
| Plugin Manager | `/plugin marketplace add weaviate/agent-skills` | Claude Code |
| Manual | `git clone` + `--plugin-dir` | Any |

### 2. Available Skills

#### Weaviate Core Skills
| Skill | Description |
|-------|-------------|
| Create Collections | Schema creation |
| Explore Collections | Aggregation, Metadata, Schema |
| Query Collections | Keyword, Vector, Hybrid Search with filters |
| Import Data | Multi-vector, PDF ingestion |
| Query Agent | AI-powered query answering |

#### Cookbooks (Blueprints)
| Cookbook | Description |
|----------|-------------|
| Multimodal PDF Ingestion | PDF → vector store |
| Data Explorer | Collection exploration UI |
| RAG | Basic, Advanced, Agentic |
| Agents | Agent patterns |
| Query Agent Chatbot | Conversational AI |
| Frontend Interface | Optional UI |

### 3. Commands (Claude Code Plugin)

```bash
# Interactive onboarding
/weaviate:quickstart

# Ask with AI-generated answer + citations
/weaviate:ask query "..." collections "..."

# Search with different types
/weaviate:search query "..." collection "..." type "keyword|semantic|hybrid"

# Collection management
/weaviate:collections
/weaviate:collections name "..."

# Data exploration
/weaviate:explore "..." limit 10
/weaviate:fetch collection "..." id "UUID"
```

### 4. Environment Setup

```bash
# Required
export WEAVIATE_URL="https://your-cluster.weaviate.cloud"
export WEAVIATE_API_KEY="your-api-key"

# Auto-detected external providers
# ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.
```

### 5. Requirements
- Python 3.11+
- uv (recommended) or pip
- Weaviate Cloud instance

---

## Multi-Agent Architecture Patterns (Victoria Slocum)

**Source**: https://x.com/victorialslocum/status/2029501587446489528

### 6 Production Patterns

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| **Hierarchical** | Top-level coordinator routes to specialists | Query across different data sources |
| **Human-in-the-Loop** | Critical decisions routed to humans | High-stakes, regulated environments |
| **Shared Tools** | Same APIs, different tasks | General-purpose tools, specialized reasoning |
| **Sequential** | Pipeline: Agent 1 → Agent 2 → Agent 3 | Clear stages with specialized expertise |
| **Shared Database + Different Tools** | Same vector store, different operations | Centralized knowledge, different ops |
| **Memory Transformation** | Agents modify data in place | Continuous enrichment/cleanup |

### Hybrid Approach Reality
> "Most production systems use hybrid approaches combining multiple patterns. You might have a hierarchical coordinator that routes to sequential pipelines, with human-in-the-loop gates at critical decision points, all working with a shared database."

---

## Comparison with Dev-Stack

| Feature | Dev-Stack | Weaviate Agent Skills |
|---------|-----------|----------------------|
| Vector Database Integration | No | Yes (Weaviate native) |
| RAG Patterns | No | Basic, Advanced, Agentic |
| Query Agent | No | Yes |
| PDF Ingestion | No | Multimodal support |
| Multi-Agent Patterns | 7 agents, hierarchical | 6 documented patterns |
| Skills | 2 | 5+ + Cookbooks |
| Commands | 4 | 7+ |
| External Dependencies | None | Weaviate Cloud required |

---

## Gaps Identified

### Critical
1. **No Vector Database Integration** - Dev-Stack ไม่มี vector store
2. **No RAG Patterns** - Dev-Stack ไม่มี retrieval patterns
3. **No PDF Ingestion** - Dev-Stack ไม่รองรับ document ingestion

### Important
4. **Limited Multi-Agent Patterns** - Dev-Stack มีเฉพาะ hierarchical
5. **No Query Agent** - Dev-Stack ไม่มี AI-powered query
6. **No Cookbooks** - Dev-Stack ไม่มี end-to-end blueprints

### Nice-to-Have
7. **No Human-in-the-Loop** - Dev-Stack ไม่มี approval gates
8. **No Sequential Pipeline** - Dev-Stack ไม่มี pipeline pattern
9. **No Memory Transformation** - Dev-Stack ไม่ modify data in place

---

## Multi-Agent Pattern Details

### 1. Hierarchical Pattern
```
User Query → Coordinator Agent
                ↓
    ┌──────────┼──────────┐
    ↓          ↓          ↓
Internal    Personal    Web
Data Agent  Accounts    Search
    ↓          ↓          ↓
    └──────────┼──────────┘
               ↓
        Synthesized Answer
```

### 2. Human-in-the-Loop Pattern
```
Agent Action → Pause → Human Approval → Continue
                   ↓
              Modify/Reject
```

### 3. Shared Tools Pattern
```
Agent A ─┐
Agent B ─┼─→ Shared APIs/Databases
Agent C ─┘
```

### 4. Sequential Pipeline Pattern
```
Agent 1: Retrieve → Agent 2: Filter → Agent 3: Synthesize
```

### 5. Shared Database + Different Tools Pattern
```
         ┌─→ Agent A (Semantic Search)
Vector   │
Store ───┼─→ Agent B (Data Transform)
         │
         └─→ Agent C (Analytics)
```

### 6. Memory Transformation Pattern
```
Agent → Read → Transform → Write Back
                     ↓
              Knowledge Base Updated
```

---

## Resources Referenced

- eBooks:
  - The Context Engineering Guide
  - Agentic Architecture Ebook
  - Advanced RAG Techniques
- Weaviate Query Agent
- Agent Skills Specification
- Claude Code Plugins

---

## Recommendations for Dev-Stack

### High Priority
1. **Add Multi-Agent Pattern Support**
   - Implement all 6 patterns as configurable options
   - Document when to use each pattern

2. **Add Human-in-the-Loop Gates**
   - Critical decision approval points
   - Configurable approval thresholds

3. **Add Sequential Pipeline**
   - Chain agents in pipeline fashion
   - Output of one = input of next

### Medium Priority
4. **Add Memory Transformation**
   - Agents can modify shared state
   - Continuous enrichment support

5. **Create Cookbooks**
   - End-to-end blueprints
   - RAG patterns (Basic, Advanced, Agentic)

### Low Priority
6. **Vector Database Integration**
   - Optional Weaviate/Pinecone support
   - Semantic search capabilities

---

## Actionable Items

- [ ] Implement 6 multi-agent patterns as agent configurations
- [ ] Add human-in-the-loop approval gates
- [ ] Create sequential pipeline support
- [ ] Add shared database pattern
- [ ] Implement memory transformation
- [ ] Create RAG cookbooks
- [ ] Add optional vector database integration
- [ ] Document pattern selection guide
