# File Justification: Standard agent instructions and project governance template for new codebases.
# System Impact of Absence: Autonomous agents will lack consistent discipline, code quality guidelines, and AST indexing standards.

# SILVESTRIKE Portfolio OS — Project Rules & Agent Instructions

This document is the workspace customization root (`.agents/AGENTS.md`) for AI agent assistance across the SILVESTRIKE Portfolio OS repository.

---

## 1. Core Project Hard Constraints

1. **Explicit Error Propagation**: Never swallow errors with silent mock fallbacks. Failures must throw directly or propagate through error handlers.
2. **Deterministic State Management**: Ensure all state transitions are explicit, traceable, and recoverable after process restarts.
3. **No Auto-Retry Loops on External APIs**: Retries against external LLMs or third-party APIs should be bounded or user-triggered.

---

## 2. Tech Stack & Architecture

- **Primary Languages**: TypeScript
- **Frameworks & Core Libraries**: Next.js, React
- **Documentation Standards**: Living documentation maintained under `docs/`.

---

## 3. Coding Conventions

- **Type Safety**: Strict typing across codebase without unhandled generic types.
- **Validation**: Strict boundary schema validation for incoming data payloads.
- **Error Handling**: Explicit domain error classes mapped to centralized error handlers.
- **Documentation Deliverables**:
  - `docs/architecture.md`: System architecture and data flow.
  - `docs/DECISIONS.md`: Key architectural decisions and trade-offs (ADR format).
  - `docs/TESTING.md`: Testing strategy, mock boundaries, and execution results.
  - `docs/plan.md`: Phased task roadmap and deliverables.
  - `README.md`: Quick start and developer guide.

---

## 4. Git Branching, Commit & Push Discipline

**Golden rule: The agent does NOT create a branch, commit, or push on every prompt.** Work locally in small iterative steps first; only branch, commit, or push when there is a complete, coherent, and verified unit of work.

### 4.1 When to create a branch
- Create a new branch only when starting a genuinely new feature (`feat/<short-description>`) or bug fix (`fix/<short-description>`).
- If a branch for the current feature or fix already exists, reuse it.

### 4.2 When to commit
- Commit only when a change is self-contained and meaningful: passing tests or a completed sub-task.
- Format: `<type>(<scope>): <subject>` (feat, fix, refactor, docs, test, chore).

### 4.3 When to push
- Push only after commits represent a complete, testable unit of work ready for review.
- Never push automatically in the background without explicit user instruction.

---

## 5. Security & Elevated Permission Strict Rules

1. **Strict Prohibition on Reading `.env` Files**: The AI Agent is STRICTLY FORBIDDEN from reading, opening, inspecting, viewing, or exposing any `.env` or secret credential file. When configuration schema is needed, refer exclusively to `.env.example` or ask the user.
2. **Mandatory User Confirmation for Elevated Commands**: Explicit user confirmation is required before proposing or executing any command requiring root/sudo privileges, system-level file modifications, git pushes, or destructive filesystem operations.

---

## 6. Architecture, Proposals & File Creation Rules

1. **Mandatory Trade-off Analysis**: Whenever proposing a solution or architectural change, state the Trade-offs (Pros, Cons, Performance, Memory/Resource footprint, Latency vs Accuracy).
2. **File Justification & System Impact Header**: Whenever creating a new file or introducing a new component, include a top-level header comment clearly documenting:
   - Reason for Existence: Why the file or component is necessary.
   - System Impact of Absence: Exact consequences or failures if the file is missing.

---

## 7. Code Formatting & Style Constraints

1. **NO EMOJIS OR ICONS IN CODE**: Never use emojis, decorative unicode symbols, or icons inside source code, comments, log statements, or terminal outputs. All code outputs and comments must remain clean, professional standard text.

---

## 8. Codebase Navigation & Refactoring with CodeGraph

1. **Mandatory CodeGraph Over Grep**: When exploring code, locating definitions, or tracing call hierarchies, the agent MUST use `codegraph` (`query`, `callers`, `callees`, `impact`) instead of blind text grep searches.
2. **Blast Radius Inspection Before Edit**: Prior to refactoring or altering function signatures, run `codegraph callers <symbol>` and `codegraph impact <path>` to identify all upstream consumers and dependent modules.
3. **AST Index Synchronization**: After modifying, creating, or deleting code files in the repository, execute `codegraph sync` so that `.codegraph/codegraph.db` remains accurate and up-to-date.
