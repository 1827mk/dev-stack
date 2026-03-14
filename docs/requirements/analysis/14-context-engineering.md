# Analysis: Context Engineering
**Sources**: 4 sources (GitHub, contextengineering.ai, Anthropic, TowardsAI)
**Analyzed**: 2026-03-12

---

## Executive Summary

**Context Engineering** คือ evolution ถัดไปจาก Prompt Engineering - เน้นการ curate และ manage context ที่ AI มีอยู่ให้เหมาะสมที่สุด แทนที่จะโฟกัสที่การเขียน prompt อย่างเดียว

**Key Quote (Tobi Lütke, Shopify):**
> "I really like the term 'context engineering' over 'prompt engineering'. It describes the core skill better: the art of providing all the context for the task to be plausibly solvable by the LLM."

**Key Quote (Andrej Karpathy):**
> "+1 for 'Context Engineering' over 'Prompt Engineering'..."

---

## ที่มาและแนวคิดหลัก

### 1. GitHub: bralca/context-engineering-mcp

**ประเภท**: MCP Server สำหรับ Context Engineering
**URL**: https://github.com/bralca/context-engineering-mcp

#### Key Features

| Feature | Description |
|---------|-------------|
| **8 Feature Categories** | Landing pages, UI components, APIs, performance, analytics, auth, data management, integrations |
| **Automated Documentation** | PRDs, Technical Blueprints, 40+ Task Lists, Risk Assessment |
| **Codebase Analysis** | Tech stack detection, Architecture patterns, Database integration, Legacy support |
| **Cross-Platform** | Cursor, Claude Code, VS Code (MCP-compatible) |

#### Performance Benefits

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Feature Planning Time | 4-8 hours | 15-30 minutes | **10-16X faster** |
| Context Switching | Every conversation | Never | **100% elimination** |
| Token Usage (Complex) | 50,000+ tokens | ~500 tokens | **100X reduction** |

#### Real-World Use Cases

```
1. "I want to add Stripe payments" → Complete payment flow planned
2. "Real-time notification system" → WebSocket integration mapped
3. "Multi-tenant support" → Migration strategy created
```

---

### 2. contextengineering.ai (Main Product)

**ประเภท**: Commercial Context Engineering Platform
**URL**: https://contextengineering.ai
**Founder**: Alex Carra

#### Problem Solved

| Problem | What Happens | Solution |
|---------|---------------|----------|
| **Context Loss** | AI loses track across conversations | Perfect context every time |
| **Inconsistent Patterns** | AI generates code that doesn't match | Learns your patterns |
| **Manual Explanations** | Repeatedly explaining tech stack | Automatic understanding |
| **Feature Complexity** | Building complex features = chaos | Structured plans |

#### How It Works

```
User: "I want user auth"
   ↓
1. AI tries to build everything at once
2. 20 tasks in one response (confused)
3. Task 8 forgot task 3 (conflicts)
4. No documentation trail
5. Small change breaks everything
6. "Working" with mocked data
7. Burns through usage quota
```

**With Context Engineering:**

```
User: "I want user auth"
   ↓
1. Analyzes setup, creates structured plan
2. Breaks into clear phases (DB → Routes → Middleware → Frontend → Tests)
3. Each task references previous (no conflicts)
4. Complete documentation trail (PRD → Blueprint → Tasks)
5. Changes are surgical
6. Production-ready implementation
7. Optimized token usage
```

#### Key Benefits

- ✅ Code never leaves your machine
- ✅ Uses your existing Claude/GPT via MCP
- ✅ Zero additional AI costs
- ✅ Works with Claude Code, Cursor, VS Code

#### Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | Concept Development Tool, Plan Feature Tool, 100% Private |
| **PRO** | $69 (Launch special) | Unlimited everything, launch price locked forever |

---

### 3. Anthropic: Effective Context Engineering for AI Agents

**ประเภท**: Official Anthropic Engineering Article
**URL**: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

#### Core Definition

> **"Context engineering refers to the set of strategies for curating and maintaining the optimal set of tokens (information) during LLM inference"**

**Key Principle:**
> **"Find the smallest set of high-signal tokens that maximize the likelihood of some desired outcome"**

#### Context vs Prompt Engineering

| Aspect | Prompt Engineering | Context Engineering |
|--------|-------------------|---------------------|
| **Focus** | Writing effective prompts | Curating optimal context |
| **Scope** | System prompts primarily | Entire context state |
| **Evolution** | One-time setup | Iterative, ongoing |
| **Concern** | How to write instructions | What information to include |

#### Why Important: Context Rot

**Research Finding (Chroma):**
- As tokens increase → Model's ability to recall decreases
- Called **"Context Rot"**
- LLMs have limited "attention budget"
- n² pairwise relationships = complexity grows exponentially

#### Anatomy of Effective Context

##### 1. System Prompts
- **Right Altitude**: Specific enough to guide, flexible enough to adapt
- **Avoid**: Brittle if-else logic OR vague high-level guidance
- **Best**: Clear sections (XML/Markdown headers)
- **Minimal**: Smallest set that fully outlines behavior

```
Bad: If X then Y else Z (brittle)
Bad: Be helpful (too vague)
Good: <background>...</background><instructions>...</instructions>
```

##### 2. Tools
- **Well-understood by LLMs**
- **Minimal overlap in functionality**
- **Self-contained, robust to error**
- **Clear input parameters**
- **Avoid**: Bloated tool sets with ambiguous decision points

##### 3. Examples (Few-Shot Prompting)
- **Diverse, canonical examples** > laundry list of edge cases
- Examples = "pictures worth a thousand words"

#### Context Retrieval Strategies

##### 1. Pre-Inference Retrieval (Traditional)
```
Embedding-based search → Load relevant data upfront
```
**Pros**: Fast
**Cons**: Stale indexing, might miss relevant info

##### 2. Just-In-Time Retrieval (Agentic)
```
Maintain lightweight identifiers (file paths, queries, links)
→ Dynamically load at runtime using tools
```
**Pros**: Fresh data, progressive discovery, efficient
**Cons**: Slower, requires proper guidance

**Example**: Claude Code
- CLAUDE.md files upfront
- Glob/grep for just-in-time exploration
- Head/tail for large data analysis

##### 3. Hybrid Strategy (Best of Both)
```
Some data upfront (speed) + Autonomous exploration (flexibility)
```

**Decision Boundary**:
- Static content → upfront
- Dynamic content → just-in-time

#### Long-Horizon Tasks (Techniques)

##### 1. Compaction
```
Conversation nearing limit → Summarize → Reinitiate
```
- Preserve: Architectural decisions, unresolved bugs, implementation details
- Discard: Redundant tool outputs, old messages
- **Tool result clearing** = safest lightest compaction

##### 2. Structured Note-Taking (Agentic Memory)
```
Agent writes notes to memory outside context window
→ Pull back later
```
- Examples: Todo lists, NOTES.md files
- **Claude playing Pokémon**: Maintains tallies across thousands of steps
- Benefits: Persistent memory, minimal overhead

##### 3. Sub-Agent Architectures
```
Main agent: High-level plan, coordinates
Sub-agents: Focused tasks, deep exploration
→ Return condensed summary (1,000-2,000 tokens)
```
**Best for**: Complex research and analysis with parallel exploration

#### When to Use Each Approach

| Technique | Best For |
|-----------|----------|
| **Compaction** | Extensive back-and-forth conversations |
| **Note-Taking** | Iterative development with clear milestones |
| **Multi-Agent** | Complex research/analysis, parallel exploration |

---

## Patterns & Principles Summary

### Core Principles

1. **Context is Finite**
   - Attention budget degrades with more tokens
   - Treat as precious resource

2. **Minimal High-Signal Tokens**
   - Smallest set that maximizes desired outcome
   - Quality > Quantity

3. **Right Altitude Prompts**
   - Specific enough to guide
   - Flexible enough to adapt
   - Avoid brittle logic OR vague guidance

4. **Progressive Disclosure**
   - Discover context through exploration
   - Layer by layer understanding

5. **Just-In-Time Retrieval**
   - Load context when needed
   - Maintain lightweight identifiers

### Context Retrieval Spectrum

```
Pre-Inference ────────── Just-In-Time ────────── Hybrid
    (Embedding)           (Agentic Tools)        (Both +)

Static Index            Fresh Data            Speed +
Stale                   Slow                  Flexibility

Use when:               Use when:             Use when:
Content static          Content dynamic       Mixed types
Need speed              Need accuracy          Complex tasks
```

### Long-Horizon Techniques

```
┌─────────────────────────────────────────────────────────────┐
│  Long-Horizon Task Techniques                                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. COMPACTION                                               │
│     Summarize → Reinitiate                                   │
│     Keep: Decisions, bugs, implementation                    │
│     Discard: Tool outputs, old messages                       │
│                                                               │
│  2. STRUCTURED NOTE-TAKING                                  │
│     Write notes outside context                               │
│     Pull back when needed                                     │
│     Examples: Todo lists, NOTES.md                            │
│                                                               │
│  3. SUB-AGENT ARCHITECTURES                                  │
│     Main: High-level coordination                             │
│     Sub: Focused deep exploration                            │
│     Return: Condensed summary (1-2K tokens)                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Comparison: Existing Solutions vs Our Approach

### Context Engineering MCP (bralca)

| Aspect | Implementation |
|--------|----------------|
| **Architecture** | MCP Server (HTTP) |
| **Storage** | Remote (contextengineering.ai) |
| **Pricing** | Free + PRO ($69) |
| **Categories** | 8 feature categories |
| **Output** | PRD, Blueprint, Tasks (40+) |
| **Token Savings** | 10-50X for complex projects |

### Our /dev-stack:agents Approach

| Aspect | Our Implementation |
|--------|-------------------|
| **Architecture** | Local command (no server) |
| **Storage** | Local (.dev-stack/context/) |
| **Pricing** | Free (open source) |
| **Categories** | Project-specific (from DNA) |
| **Output** | Enhanced prompt + context bundle |
| **Token Savings** | Similar concept, local-first |

---

## What We Should Adopt

### High Priority (Must Have)

1. **Context Bundle Generation**
   - Gather: DNA, files, patterns
   - Output: Structured enhanced prompt
   - Save: .dev-stack/context/[task].md

2. **Just-In-Time Retrieval Pattern**
   - Lightweight upfront context
   - Tools for dynamic exploration
   - Progressive disclosure

3. **Structured Note-Taking**
   - Agent writes notes to file
   - Pull back when needed
   - Cross-session continuity

### Medium Priority (Should Have)

4. **Compaction Strategy**
   - Summarize when context full
   - Keep critical decisions
   - Discard redundant outputs

5. **Minimal Tool Set**
   - Well-defined, non-overlapping
   - Clear purposes
   - Token-efficient returns

### Low Priority (Nice to Have)

6. **Sub-Agent Coordination**
   - Main agent coordinates
   - Sub-agents explore deeply
   - Condensed summaries

7. **Feature Categorization**
   - Auto-detect feature type
   - Tailored planning workflows
   - Multi-category support

---

## Recommended Architecture for /dev-stack:agents

```
┌─────────────────────────────────────────────────────────────┐
│  /dev-stack:agents (Context Prep Command)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  INPUT: User task description                               │
│    ↓                                                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ GATHER PHASE                                              │  │
│  │ • Read project DNA                                       │  │
│  │ • Scan directory structure                               │  │
│  │ • Find relevant files (pattern matching)                 │  │
│  │ • Read files up to context limit                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│    ↓                                                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ANALYZE PHASE                                             │  │
│  │ • Identify tech stack                                    │  │
│  │ • Recognize architecture patterns                        │  │
│  │ • Find existing code patterns                            │  │
│  │ • Check what already exists                              │  │
│  └─────────────────────────────────────────────────────────┘  │
│    ↓                                                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ PLAN PHASE                                                │  │
│  │ • Breakdown into steps                                   │  │
│  │ • Identify dependencies                                  │  │
│  │ • Mark what NOT to do                                    │  │
│  │ • Create execution plan                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│    ↓                                                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ OUTPUT PHASE                                              │  │
│  │ • Generate enhanced prompt                               │  │
│  │ • Include all context                                    │  │
│  │ • Save to .dev-stack/context/                             │  │
│  │ • Display summary to user                                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  OUTPUT: Enhanced prompt bundle (markdown)                  │
│    → AI (Claude/GPT/Claude Code) executes perfectly         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Output Format (Enhanced Prompt)

```markdown
# Context Bundle: [Task Name]

## Project Overview
**Type**: Next.js 14 + TypeScript + Prisma + PostgreSQL
**Structure**: App Router, Server Components, lib/ utilities

## Tech Stack Analysis
### Frontend
- Framework: Next.js 14 (App Router)
- UI: shadcn/ui + Tailwind CSS
- State: React hooks + Server Actions

### Backend
- API: Next.js API Routes
- ORM: Prisma
- DB: PostgreSQL (local Docker)

### Patterns Identified
- Server components for data fetching
- Client components for interactivity
- lib/ for shared utilities
- components/ui/ for reusable components

## Relevant Files (Read)
1. **app/page.tsx** - Current landing page structure
2. **prisma/schema.prisma** - Existing User model
3. **lib/auth.ts** - Auth utilities (incomplete)
4. **components/ui/button.tsx** - Button component example

## Current State
- ✅ User model exists in schema
- ✅ UI components system established
- ❌ No authentication implemented
- ❌ No session management
- ❌ No API routes for auth

## Execution Plan

### Phase 1: Database Schema
1. [ ] Add Session model to Prisma schema
2. [ ] Add Account model for OAuth providers
3. [ ] Run migration

### Phase 2: Dependencies
1. [ ] Install next-auth
2. [ ] Configure auth options

### Phase 3: API Routes
1. [ ] Create app/api/auth/[...nextauth]/route.ts
2. [ ] Add callback handler
3. [ ] Add sign-out handler

### Phase 4: Frontend
1. [ ] Create app/signin/page.tsx
2. [ ] Create app/signin/button.tsx
3. [ ] Add session provider

### Phase 5: Integration
1. [ ] Update layout with session
2. [ ] Test login flow
3. [ ] Test protected routes

## Constraints & DO NOT
- ✅ DO: Use existing patterns (components/, lib/)
- ✅ DO: Follow Next.js 14 conventions
- ❌ DO NOT: Create new DB (use existing)
- ❌ DO NOT: Use other auth libs (use next-auth)
- ❌ DO NOT: Break existing UI patterns

## Token Budget
- Context used: ~3,500 tokens
- Remaining for execution: ~196,500 tokens
- Optimized for: Single-pass execution

---

**PLEASE PROCEED**

Execute the plan above step by step. Let me know if you need clarification on any step.

*Generated by /dev-stack:agents context engineering*
```

---

## Key Takeaways

1. **Context > Prompts** - Well-curated context beats clever prompts
2. **Less is More** - Minimal high-signal tokens > exhaustive context
3. **Just-In-Time** - Load context when needed, not everything upfront
4. **Local-First** - Keep data on your machine when possible
5. **Progressive** - Discover context layer by layer, not all at once

---

## Sources

1. https://github.com/bralca/context-engineering-mcp
2. https://contextengineering.ai
3. https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
4. https://pub.towardsai.net/context-engineer-your-agents-for-efficient-mcp-use-a44578d2b1c5 (403 - content protected)

---

**Conclusion**: Context Engineering is a proven, production-ready approach. Our /dev-stack:agents should focus on **local-first context preparation** following these principles.
