# File Justification: Test strategy, verification matrix, and test execution standards template.
# System Impact of Absence: Undefined test boundaries lead to untested regressions, unreliable CI, and flaky code deployments.

# SILVESTRIKE Portfolio OS — Testing Strategy & Verification

## 1. Testing Philosophy

SILVESTRIKE Portfolio OS adopts an automated testing pyramid:
- **Unit Tests**: Rapid execution testing isolated domain logic and utilities.
- **Integration Tests**: Verification of API boundaries, database persistence, and external service contracts.
- **End-to-End / Workflow Tests**: Verification of end-to-end user journeys and state machine lifecycles.

---

## 2. Test Execution Commands

```bash
# Run unit test suite
pytest

# Run test suite with coverage
pytest --cov
```

---

## 3. Test Coverage & Invariants

1. **No Regressions**: Any bug fix must be accompanied by a regression test replicating the failure prior to fixing.
2. **Deterministic Tests**: Tests must not depend on network availability or external third-party services unless explicitly mocked.
3. **Clean Teardown**: Tests that touch disk or databases must clean up fixtures upon completion.
