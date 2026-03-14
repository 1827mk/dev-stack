---
name: learn
description: Force a full DNA rescan of the project to update Project DNA. Use when project has changed significantly or setting up plugin for the first time.
---

# Dev-Stack Learn Skill

## Purpose

Force a full DNA rescan of the project to update the Project DNA file. Use when the project has changed significantly or when setting up the plugin for the first time.

## Usage

```
/dev-stack:learn              # Standard DNA scan
/dev-stack:learn --deep       # Deep scan including dependency analysis
/dev-stack:learn --force      # Force rescan even if DNA is recent
```

## Workflow

### Step 1: Check Existing DNA

Read `.dev-stack/dna/project.md` if it exists:

- If exists and not forced: Check `updated_at` timestamp
- If updated within last 24h and not forced: Prompt user to confirm rescan
- If forced or older than 24h: Proceed with scan

### Step 2: Initialize Scanner

Create DNA scanner with options:

```typescript
const scanner = createDNAScanner(projectRoot, {
  deep: options.deep ?? false,
  force: options.force ?? false,
  include_patterns: ['**/*'],
  exclude_patterns: [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**'
  ],
  max_files: 1000
});
```

### Step 3: Run Scan

Execute the scan:

```typescript
const dna = await scanner.scan();
```

This will:

1. Scan all project files (respecting exclude patterns)
2. Detect project type, language, and framework
3. Identify tech stack (database, ORM, auth, etc.)
4. Find entry points and key directories
5. Detect coding style and conventions
6. Identify protected paths and risk areas
7. Calculate total files and lines of code

### Step 4: Preserve Learnings

If existing DNA has learnings, preserve them:

```yaml
# Preserve what_works
what_works:
  - pattern: "Using Zod for validation"
    context: "API request validation"
    success_count: 5

# Preserve what_not_to_do
what_not_to_do:
  - anti_pattern: "Direct database queries in components"
    reason: "Causes N+1 query problems"
    failure_count: 2

# Preserve user_preferences
user_preferences:
  - preference: "Use functional components"
    value: "hooks pattern preferred"
    confidence: 0.9
```

### Step 5: Write DNA File

Write to `.dev-stack/dna/project.md` with format:

```markdown
---
id: uuid
name: project-name
type: web-app | api | library | cli | mobile
primary_language: TypeScript | Python | Go | etc.
created_at: ISO datetime
updated_at: ISO datetime
version: 1.0.0

# Tech Stack
framework: Next.js | React | Vue | etc.
database: PostgreSQL | MongoDB | etc.
testing: Vitest | Jest | etc.
orm: Prisma | TypeORM | etc.
auth: NextAuth | Auth0 | etc.

# Architecture
architecture_pattern: monolith | microservices | serverless | modular
entry_points:
  - path: src/index.ts
    type: main
key_directories:
  - path: src/components
    purpose: UI components
    file_count: 42

# Coding Style
naming: camelCase | snake_case | PascalCase | kebab-case
formatter: prettier | black | none
component_pattern: functional | class-based | hooks | composition
indent_size: 2 | 4
max_line_length: 80 | 100 | 120

# Protected Paths
protected_paths:
  - path: .env
    reason: Contains secrets

# Risk Areas
risk_areas:
  - area: Authentication
    risk_level: high
    description: Auth code requires careful handling

# Stats
total_files: 150
total_lines: 25000
last_scan_duration_ms: 1200
---

# Project DNA

## Overview

[Auto-generated description of the project based on scan results]

## Tech Stack Details

[Detailed breakdown of detected technologies]

## Architecture

[Description of project structure and patterns]

## Conventions

[Detected coding conventions and patterns]

## Protected Areas

[List of protected paths and why they're protected]

## Risk Areas

[Areas requiring extra caution]

---

## What Works

[Patterns that have been successful - preserved from previous scans]

---

## What Not To Do

[Anti-patterns to avoid - preserved from previous scans]

---

## User Preferences

[Learned user preferences - preserved from previous scans]

---

## Notes

[Additional context and observations]
```

### Step 6: Report Results

Output scan summary:

```yaml
dna_scan:
  status: complete
  duration_ms: {scan_duration}

project:
  name: {project_name}
  type: {project_type}
  language: {primary_language}

tech_stack:
  framework: {framework}
  database: {database}
  testing: {testing}

stats:
  files_scanned: {file_count}
  total_lines: {line_count}

key_findings:
  - {notable_finding_1}
  - {notable_finding_2}

risk_areas:
  count: {risk_area_count}
  highest_risk: {area_with_highest_risk}

next_steps:
  - "DNA is ready for context-aware task execution"
  - "Run /dev-stack:agent to start using learned patterns"
```

## Deep Scan (--deep flag)

When `--deep` is specified, additionally:

1. **Dependency Analysis**
   - Scan `package.json` dependencies
   - Identify unused dependencies
   - Flag outdated packages

2. **Import Graph**
   - Build import dependency graph
   - Identify circular dependencies
   - Find most-imported modules

3. **Code Metrics**
   - Cyclomatic complexity
   - Coupling scores
   - Cohesion analysis

4. **Pattern Detection**
   - Common code patterns
   - Repeated code blocks
   - Potential refactoring targets

## Error Handling

### Scan Errors

```yaml
error:
  type: scan_failed
  reason: {error_message}
  partial_results: {what_was_scanned}
  suggestion: "Fix the error and retry, or use --force to continue"
```

### Budget Exceeded

```yaml
error:
  type: file_limit_exceeded
  limit: {max_files}
  suggestion: "Increase --max-files or add more exclude patterns"
```

### Permission Denied

```yaml
error:
  type: permission_denied
  path: {blocked_path}
  suggestion: "Check file permissions or exclude the path"
```

## Examples

### Standard Scan

```
/dev-stack:learn
```

Output:
```
🔍 Scanning project...

✅ DNA scan complete (1.2s)

📊 Project: dev-stack
   Type: plugin
   Language: TypeScript

🛠️ Tech Stack:
   Framework: Claude Code Plugin
   Database: SQLite
   Testing: Vitest

📁 Stats:
   Files: 45
   Lines: 8,500

⚠️ Risk Areas:
   - Authentication (high): Auth-related code detected

💾 DNA saved to .dev-stack/dna/project.md
```

### Deep Scan

```
/dev-stack:learn --deep
```

Output:
```
🔍 Scanning project (deep mode)...

✅ DNA scan complete (4.5s)

📊 Project: dev-stack
   Type: plugin
   Language: TypeScript

🛠️ Tech Stack:
   Framework: Claude Code Plugin
   Database: SQLite
   Testing: Vitest
   ORM: better-sqlite3

📈 Code Metrics:
   Avg Complexity: 3.2
   High Coupling Areas: 2
   Circular Dependencies: 0

📦 Dependencies:
   Total: 12
   Unused: 0
   Outdated: 3 (minor)

📁 Stats:
   Files: 45
   Lines: 8,500
   Patterns Detected: 15

⚠️ Risk Areas:
   - Authentication (high): Auth-related code detected

💾 DNA saved to .dev-stack/dna/project.md
```

## Notes

- DNA is automatically loaded at session start
- Manual rescan recommended after major refactoring
- Learnings (what_works, what_not_to_do) are preserved across scans
- Deep scan takes longer but provides richer insights
- Use --force to rescan even if DNA was recently updated
