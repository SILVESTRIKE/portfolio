<!--
Reason for existence: Architectural Decision Records (ADR) tracking significant technical choices, engineering trade-offs, and governance policies across SILVESTRIKE Portfolio OS.
System Impact of Absence: Architectural rationale becomes tribal knowledge, leading to repeated debates and design regressions.
-->

# SILVESTRIKE Portfolio OS — Architectural Decision Records (ADR)

This document tracks all significant architectural choices, engineering trade-offs, and design decisions made throughout the lifecycle of SILVESTRIKE Portfolio OS.

---

## Decision Index

| ID | Title | Date | Status |
|---|---|---|---|
| ADR-001 | Initialization of Project Architecture & CodeGraph Intelligence | 2026-09-25 | Accepted |
| ADR-002 | Docker Container Dashboard & Visual Dependency DAG | 2026-09-26 | Accepted |
| ADR-003 | Dual Persona Architecture: Interactive WebOS vs 30s SSR Resume Route | 2026-09-26 | Accepted |
| ADR-004 | Unified Engineering Status Discipline & Metric-Driven Formulation | 2026-09-26 | Accepted |

---

## ADR-001: Initialization of Project Architecture & CodeGraph Intelligence

### Status
Accepted

### Context
When beginning development on SILVESTRIKE Portfolio OS, establishing clear architectural patterns, AST code intelligence, and automated documentation is essential for rapid velocity and high-quality pair-programming with AI agents.

### Decision
1. Maintain documentation under `docs/` (`architecture.md`, `DECISIONS.md`, `TESTING.md`, `plan.md`).
2. Adopt CodeGraph as the AST knowledge engine to eliminate blind text grepping and provide caller/callee tracing.
3. Enforce strict developer constraints via `.agents/AGENTS.md`.

### Trade-offs & Consequences
- **Pros**: Fast onboarding, deterministic code changes, zero hallucinated calls, consistent branch and commit hygiene.
- **Cons**: Initial AST indexing requires storage and initial sync overhead.

---

## ADR-002: Docker Container Dashboard & Visual Dependency DAG

### Status
Accepted

### Context
Standard portfolio projects list technologies as isolated badges, failing to convey how components connect (frontend, API gateway, database, inference worker). Engineering interviewers need to see systems architecture at a glance.

### Decision
1. Redesign `ServicesApp.tsx` as an authentic Docker Container Workstation.
2. Extend `ServiceUnit` to model containers with `image`, `status`, `ports`, `depends_on`, `environment`, and `healthcheck`.
3. Render interactive pipeline dependency DAG diagrams for every project.
4. Embed verified performance metrics (accuracy, latency, uptime, test pass rate) directly into container healthchecks.

### Trade-offs & Consequences
- **Pros**: Instantly demonstrates full-stack systems thinking without requiring lengthy documentation reading.
- **Cons**: Requires continuous maintenance to ensure container specs remain aligned with active GitHub repositories.

---

## ADR-003: Dual Persona Architecture: Interactive WebOS vs 30s SSR Resume Route

### Status
Accepted

### Context
An interactive Linux WebOS desktop provides high immersion for tech enthusiasts, but introduces friction for busy recruiters and prevents search engine crawlers from reading developer credentials hidden behind client-side JavaScript.

### Decision
1. Build a dedicated `/resume` route rendered server-side (SSR) with static metadata and OpenGraph tags.
2. Structure the route around the 30-second scan hierarchy: Identity -> 4-Sentence Projects -> Core Skills -> Direct CV Download.
3. Enable bidirectional, friction-free navigation between Desktop mode and Resume mode via the Command Palette (`Ctrl+K`).

### Trade-offs & Consequences
- **Pros**: High recruiter conversion rate, complete SEO indexability, zero friction for mobile or non-technical reviewers.
- **Cons**: Requires keeping data synchronized between WebOS terminal components and the static SSR resume view (mitigated by `@/config`).

---

## ADR-004: Unified Engineering Status Discipline & Metric-Driven Formulation

### Status
Accepted

### Context
Early iterations mixed academic labels ("INTERNSHIP 2025", "COURSEWORK 2024") with engineering statuses ("DEPLOYED LIVE", "HOST ENGINE"), creating an uneven perception of project seriousness. Furthermore, descriptions lacked verifiable quantitative metrics.

### Decision
1. Standardize all project badges to uniform Docker / engineering statuses (`RUNNING / PRODUCTION CMS`, `RUNNING / EDGE DEPLOYED`, `RUNNING / LOCAL ENGINE`, `ARCHIVED / DESKTOP + WEB POS`, `RUNNING / THESIS RAG`).
2. Enforce the 4-sentence project formulation across all views (Problem -> Architecture -> Contribution -> Result).
3. Include concrete, verifiable metrics in every result description (e.g., "15,000+ monthly visits", "94% accuracy on 120 breeds", "<650ms speech-to-speech loop", "92.4% Top-5 recall on 15.4k legal articles").

### Trade-offs & Consequences
- **Pros**: Professional, balanced presentation; credible claims backed by specific figures.
- **Cons**: High standard of proof required during interviews for each listed number.
