# Task Analysis Skill - Unit Tests

## Test: TA-001 - Parse Simple Dev Task

**Input**: "fix the login bug"

**Expected Output**:
```json
{
  "intent": "bug_fix",
  "description": "Fix a bug in the login functionality",
  "scopes": {
    "primary": "dev",
    "additional": []
  },
  "capabilities": ["search_code", "read_code", "write_code"],
  "complexity": "low",
  "ambiguities": []
}
```

**Validation**:
- [ ] Intent correctly identified as "bug_fix"
- [ ] Primary scope is "dev"
- [ ] Complexity is "low" or "medium"
- [ ] No ambiguities flagged

---

## Test: TA-002 - Parse Multi-Scope Task

**Input**: "add user profile page and update docs"

**Expected Output**:
```json
{
  "intent": "feature",
  "description": "Add user profile page and update documentation",
  "scopes": {
    "primary": "dev",
    "additional": ["docs"]
  },
  "capabilities": ["write_code", "read_code", "write_docs"],
  "complexity": "medium",
  "ambiguities": []
}
```

**Validation**:
- [ ] Intent correctly identified as "feature"
- [ ] Both scopes (dev, docs) identified
- [ ] Complexity is "medium" or higher
- [ ] All required capabilities listed

---

## Test: TA-003 - Parse Git Task

**Input**: "commit and push changes"

**Expected Output**:
```json
{
  "intent": "git_operation",
  "description": "Commit and push changes to remote",
  "scopes": {
    "primary": "git",
    "additional": []
  },
  "capabilities": ["git_commit", "git_push"],
  "complexity": "low",
  "ambiguities": []
}
```

**Validation**:
- [ ] Intent correctly identified as "git_operation"
- [ ] Primary scope is "git"
- [ ] Complexity is "low"

---

## Test: TA-004 - Detect Ambiguous Task

**Input**: "update the project"

**Expected Output**:
```json
{
  "intent": "unknown",
  "description": "Update something in the project",
  "scopes": {
    "primary": "unknown",
    "additional": []
  },
  "capabilities": [],
  "complexity": "unknown",
  "ambiguities": [
    "What part of the project should be updated?",
    "What kind of update? (code, docs, dependencies)"
  ]
}
```

**Validation**:
- [ ] Intent is "unknown" or clarification requested
- [ ] Ambiguities array is not empty
- [ ] Clarification questions are relevant

---

## Test: TA-005 - Estimate High Complexity

**Input**: "implement user authentication with OAuth2, MFA, and session management"

**Expected Output**:
```json
{
  "intent": "feature",
  "description": "Implement comprehensive authentication system",
  "scopes": {
    "primary": "dev",
    "additional": ["docs"]
  },
  "capabilities": ["write_code", "read_code", "write_docs"],
  "complexity": "high",
  "ambiguities": []
}
```

**Validation**:
- [ ] Complexity is "high"
- [ ] Multiple components recognized
- [ ] All relevant scopes identified

---

## Test: TA-006 - Quality Scope Detection

**Input**: "run tests and check code coverage"

**Expected Output**:
```json
{
  "intent": "testing",
  "description": "Run tests and check code coverage",
  "scopes": {
    "primary": "quality",
    "additional": []
  },
  "capabilities": ["run_tests", "check_coverage"],
  "complexity": "low",
  "ambiguities": []
}
```

**Validation**:
- [ ] Intent correctly identified as "testing"
- [ ] Primary scope is "quality"
- [ ] Correct capabilities listed

---

## Test: TA-007 - Documentation Scope Detection

**Input**: "update the API documentation for the new endpoints"

**Expected Output**:
```json
{
  "intent": "documentation",
  "description": "Update API documentation for new endpoints",
  "scopes": {
    "primary": "docs",
    "additional": []
  },
  "capabilities": ["read_code", "write_docs", "read_api_docs"],
  "complexity": "medium",
  "ambiguities": []
}
```

**Validation**:
- [ ] Intent correctly identified as "documentation"
- [ ] Primary scope is "docs"
- [ ] read_code capability included (to understand endpoints)

---

## Test: TA-008 - Refactoring Detection

**Input**: "refactor the authentication module to use dependency injection"

**Expected Output**:
```json
{
  "intent": "refactor",
  "description": "Refactor authentication module to use dependency injection",
  "scopes": {
    "primary": "dev",
    "additional": []
  },
  "capabilities": ["read_code", "analyze_code", "write_code"],
  "complexity": "medium",
  "ambiguities": []
}
```

**Validation**:
- [ ] Intent correctly identified as "refactor"
- [ ] Primary scope is "dev"
- [ ] Complexity is "medium" or "high"

---

## Test Results Summary

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| TA-001 | Simple dev task | ⏳ | |
| TA-002 | Multi-scope task | ⏳ | |
| TA-003 | Git task | ⏳ | |
| TA-004 | Ambiguous task | ⏳ | |
| TA-005 | High complexity | ⏳ | |
| TA-006 | Quality scope | ⏳ | |
| TA-007 | Docs scope | ⏳ | |
| TA-008 | Refactoring | ⏳ | |

**Pass Rate**: 0/8 (0%)
