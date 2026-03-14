# Analysis: Headroom
**Source**: https://github.com/chopratejas/headroom
**Type**: Context Optimization Layer for LLM Applications
**Analyzed**: 2026-03-12

---

## Overview

Headroom เป็น Context Optimization Layer สำหรับ LLM Applications ที่ compress tool outputs ซึ่งมักมี 70-95% redundant boilerplate ออกไป ช่วยประหยัด tokens ได้มากโดยไม่สูญเสียความแม่นยำ

**License**: Apache 2.0
**Python**: 3.10+

---

## Key Features

### 1. Core Value Proposition
> "Tool outputs are 70-95% redundant boilerplate. Headroom compresses that away."

| Scenario | Before | After | Savings |
|----------|--------|-------|---------|
| Code search (100 results) | 17,765 | 1,408 | **92%** |
| SRE incident debugging | 65,694 | 5,118 | **92%** |
| Codebase exploration | 78,502 | 41,254 | **47%** |
| GitHub issue triage | 54,174 | 14,761 | **73%** |

### 2. Integration Methods

| Method | Code Changes | Description |
|--------|--------------|-------------|
| **Proxy** | Zero | One env var: `ANTHROPIC_BASE_URL=http://localhost:8787` |
| **Python `compress()`** | One function | `result = compress(messages, model="...")` |
| **LiteLLM Callback** | One line | `litellm.callbacks = [HeadroomCallback()]` |
| **ASGI Middleware** | One line | `app.add_middleware(CompressionMiddleware)` |
| **Agno** | Wrap model | `HeadroomAgnoModel(your_model)` |
| **LangChain** | Wrap model | `HeadroomChatModel(your_llm)` (experimental) |

### 3. Pipeline Architecture

```
App → Headroom → LLM Provider → Response

Inside Headroom:
1. CacheAligner    → Stabilizes prefix for KV cache
2. ContentRouter   → Detects content type, picks compressor
3. IntelligentContext → Score-based token fitting
4. Query Echo      → Re-injects user question
```

### 4. Compressors

| Compressor | Purpose | Technique |
|------------|---------|-----------|
| **SmartCrusher** | Any JSON type | Statistical analysis, anomaly detection |
| **CodeCompressor** | Code | AST-aware compression (Python, JS, Go, Rust, Java, C++) |
| **LLMLingua-2** | Text | ML-based 20x compression |

### 5. CCR (Compress-Cache-Retrieve)

**Reversible Compression**:
- Headroom never throws data away
- Compresses aggressively and retrieves precisely
- Tells the LLM **what was omitted** ("87 passed, 2 failed, 1 error")
- LLM retrieves when it needs more via `headroom_retrieve` tool

### 6. Failure Learning (NEW)

```bash
headroom learn                   # Analyze past Claude Code sessions
headroom learn --apply           # Write learnings to CLAUDE.md and MEMORY.md
headroom learn --all --apply     # Learn across all your projects
```

- Reads conversation history
- Finds every failed tool call
- Correlates with what eventually succeeded
- Writes specific corrections into project files
- Next session starts smarter

### 7. All Features

| Feature | Description |
|---------|-------------|
| Content Router | Auto-detects content type, routes to optimal compressor |
| SmartCrusher | Universal JSON compression |
| CodeCompressor | AST-aware compression |
| LLMLingua-2 | ML-based 20x text compression |
| CCR | Reversible compression |
| Compression Summaries | Tells LLM what was omitted |
| Query Echo | Re-injects user question after compressed data |
| CacheAligner | Stabilizes prefixes for KV cache hits |
| IntelligentContext | Score-based context management |
| Image Compression | 40-90% token reduction via ML router |
| Memory | Persistent memory across conversations |
| Compression Hooks | Customize with pre/post hooks |
| Read Lifecycle | Detects stale/superseded Read outputs |
| `headroom learn` | Offline failure learning |

---

## Accuracy Benchmarks

### Standard Benchmarks (Baseline vs Headroom)

| Benchmark | Category | N | Baseline | Headroom | Delta |
|-----------|----------|---|----------|----------|-------|
| GSM8K | Math | 100 | 0.870 | 0.870 | **0.000** |
| TruthfulQA | Factual | 100 | 0.530 | 0.560 | **+0.030** |

### Compression Benchmarks

| Benchmark | Category | N | Accuracy | Compression |
|-----------|----------|---|----------|-------------|
| SQuAD v2 | QA | 100 | **97%** | 19% |
| BFCL | Tool/Function | 100 | **97%** | 32% |
| Tool Outputs | Agent | 8 | **100%** | 20% |
| CCR Needle Retention | Lossless | 50 | **100%** | 77% |

### Needle in Haystack Test
- 100 production log entries
- One critical error at position 67
- Input tokens: 10,144 → 1,260 (**87.6% reduction**)
- Both found: "payment-gateway, error PG-5523"

---

## Cloud Providers

```bash
headroom proxy --backend bedrock --region us-east-1     # AWS Bedrock
headroom proxy --backend vertex_ai --region us-central1 # Google Vertex
headroom proxy --backend azure                          # Azure OpenAI
headroom proxy --backend openrouter                     # OpenRouter (400+ models)
```

---

## Installation

```bash
pip install headroom-ai                # Core library
pip install "headroom-ai[all]"         # Everything (recommended)
pip install "headroom-ai[proxy]"       # Proxy server
pip install "headroom-ai[mcp]"         # MCP for Claude Code
pip install "headroom-ai[agno]"        # Agno integration
pip install "headroom-ai[langchain]"   # LangChain (experimental)
pip install "headroom-ai[evals]"       # Evaluation framework
```

---

## Comparison with Dev-Stack

| Feature | Dev-Stack | Headroom |
|---------|-----------|----------|
| Context Compression | PreCompact backup only | Full pipeline (4 stages) |
| Content-Type Detection | No | Yes (ContentRouter) |
| Code Compression | No | Yes (AST-aware) |
| JSON Compression | No | Yes (SmartCrusher) |
| Reversible Compression | No | Yes (CCR) |
| Compression Summaries | No | Yes |
| Query Echo | No | Yes |
| KV Cache Alignment | No | Yes (CacheAligner) |
| Failure Learning | No | Yes (`headroom learn`) |
| Proxy Mode | No | Yes (zero code changes) |
| Image Compression | No | Yes (40-90%) |
| Persistent Memory | checkpoint.md | Yes |

---

## Gaps Identified

### Critical
1. **No Context Compression Pipeline** - Dev-Stack มีแค่ PreCompact backup
2. **No Content-Type Detection** - Dev-Stack ไม่แยกประเภท content
3. **No Reversible Compression** - Dev-Stack ไม่มี CCR

### Important
4. **No Failure Learning** - Dev-Stack ไม่เรียนรู้จาก failures
5. **No Compression Summaries** - Dev-Stack ไม่บอกว่าตัดอะไรออก
6. **No Query Echo** - Dev-Stack ไม่ re-inject question

### Nice-to-Have
7. **No Code Compression** - Dev-Stack ไม่มี AST-aware compression
8. **No Image Compression** - Dev-Stack ไม่ compress images
9. **No Proxy Mode** - Dev-Stack ไม่มี zero-code integration

---

## Unique Features

### SmartCrusher Algorithm
```
100 log entries → SmartCrusher → 6 entries kept:
- First 3 (boundary)
- FATAL error at position 67 (anomaly detection)
- Last 2 (recency)
```
Error preserved by **statistical analysis of field variance**, not keyword matching.

### Compression Summaries
When compressing 500 items to 20:
- Tells LLM what was omitted: "87 passed, 2 failed, 1 error"
- LLM knows when to ask for more
- Enables intelligent retrieval

### Failure Learning Flow
```
1. Read conversation history
2. Find every failed tool call
3. Correlate with what eventually succeeded
4. Write specific corrections to CLAUDE.md/MEMORY.md
5. Next session starts smarter
```

### Latency
- Overhead: 15-200ms compression latency
- Net positive for Sonnet/Opus (time saved > compression time)

---

## Recommendations for Dev-Stack

### High Priority
1. **Add Context Compression Pipeline**
   - CacheAligner for KV cache stability
   - ContentRouter for content-type detection
   - IntelligentContext for score-based fitting

2. **Add Compression Summaries**
   - Tell LLM what was omitted
   - Enable intelligent retrieval decisions

3. **Add Failure Learning**
   - Analyze past failures
   - Write corrections to project files
   - Session-to-session learning

### Medium Priority
4. **Add CCR (Compress-Cache-Retrieve)**
   - Reversible compression
   - Never throw data away
   - Retrieve on demand

5. **Add Query Echo**
   - Re-inject user question after compressed data
   - Better attention on user intent

6. **Add Code Compression**
   - AST-aware compression
   - Language-specific handling

### Low Priority
7. **Add Proxy Mode**
   - Zero code changes integration
   - Works with any tool

8. **Add Image Compression**
   - ML-based router
   - 40-90% reduction

---

## Actionable Items

- [ ] Implement 4-stage compression pipeline (CacheAligner → ContentRouter → IntelligentContext → QueryEcho)
- [ ] Add SmartCrusher for JSON compression
- [ ] Add CodeCompressor for AST-aware code compression
- [ ] Implement CCR (Compress-Cache-Retrieve)
- [ ] Add compression summaries ("X omitted, Y kept")
- [ ] Implement failure learning (`dev-stack learn`)
- [ ] Add Query Echo for better attention
- [ ] Add proxy mode for zero-code integration
- [ ] Add image compression support
