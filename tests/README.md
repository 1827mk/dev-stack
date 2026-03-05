# Dev-Stack Orchestrator - Test Suite

**Version**: 2.0.0
**Last Updated**: 2026-03-05

---

## Test Structure

```
tests/
├── unit/
│   ├── task-analysis.test.md
│   ├── tool-selection.test.md
│   └── workflow-design.test.md
├── integration/
│   ├── commands.test.md
│   ├── agents.test.md
│   └── hooks.test.md
└── e2e/
    └── full-workflow.test.md
```

---

## Running Tests

```bash
# Run all tests
./scripts/run-tests.sh

# Run unit tests only
./scripts/run-tests.sh unit

# Run integration tests only
./scripts/run-tests.sh integration

# Run specific test
./scripts/run-tests.sh unit task-analysis
```

---

## Test Categories

### Unit Tests
- Test individual skills in isolation
- Test configuration parsing
- Test tool selection logic

### Integration Tests
- Test command execution
- Test agent spawning
- Test hook triggers

### E2E Tests
- Test complete workflows
- Test multi-scope tasks
- Test parallel execution

---

## Success Criteria

| Category | Pass Rate | Notes |
|----------|-----------|-------|
| Unit | 100% | All skills must pass |
| Integration | 100% | All commands must work |
| E2E | >= 90% | Complex scenarios |
