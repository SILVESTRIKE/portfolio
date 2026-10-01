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

---

## ADR-005: Last.fm & Upstash Redis REST Music Engine (Elimination of Spotify Web API)

### Context & Problem Statement
The portfolio previously relied on Spotify Web API and Spotify OAuth refresh tokens to stream preview audio. This approach had critical drawbacks:
1. Visitors without Spotify Premium could only hear 30-second low-bitrate previews.
2. Refresh tokens expired or required re-authorization, breaking the widget unexpectedly.
3. Multi-source listening (Spotify desktop, YouTube, NhacCuaTui via Web Scrobbler) was not unified.
4. Historical listening logs for "today" in Vietnam Timezone were unavailable from Spotify API.

### Decision
1. Completely remove Spotify Web API, OAuth access tokens, and refresh token loops from the codebase.
2. Adopt Last.fm as the single source of truth for scrobble telemetry, consolidating Spotify, YouTube, and NCT scrobbles.
3. Use YouTube Data API v3 and embedded YouTube IFrame Player (`youtube-nocookie.com`) to play full audio tracks for visitors with 0 account requirement.
4. Implement a zero-dependency Upstash Redis REST client (`src/lib/redis.ts`) to persist song-to-videoId mappings permanently, keeping daily quota consumption negligible (<3 searches per new track batch).
5. Implement a Caelestia/Terminal 3-mode interface with a 32-band real-time cava visualizer, today's playlist history, and auto-advancing queue.
6. Provide a guaranteed fallback to Black Sabbath - Iron Man (`FALLBACK_TRACK`) when no scrobbles exist.

### Trade-offs & Consequences
- **Pros**: Zero third-party npm package overhead; 100% full-length audio playback for all visitors; persistent song cache saves YouTube quotas; resilient fallback synth.
- **Cons**: YouTube ToS requires maintaining an active player instance in the DOM; scrobbles have a minor delay (~15-30s) before registering on Last.fm.

---

## ADR-006: Google OAuth2 Authentication for YouTube API & Global Audio Synchronization

### Context & Problem Statement
1. Sole reliance on `YOUTUBE_API_KEY` was vulnerable to quota exhaustion and lacked official OAuth authorization capabilities.
2. In-memory and local state desynchronization across multiple `SpotifyPlayer` UI instances (TopPanel, Dropdown Flyout, and Full Workspace Station) caused audio/UI mismatch, video re-cueing on resume, and audio overlapping due to premature fallback timers.
3. Tracks in the historical queue lacked dynamic videoId resolution when clicked.

### Decision
1. Implement Google OAuth2 authentication via 3 environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN`.
2. Token exchange automatically fetches and caches access tokens in RAM and Upstash Redis with a TTL of `expires_in - 120s`.
3. Eliminate the 1.2s watchdog in `GlobalAudioManager` to prevent synthetic audio from playing concurrently with buffering YouTube streams.
4. Establish `GlobalAudioManager` as the single source of truth for `currentTrack`, playback state, and queue auto-advance. All UI components subscribe directly to its lifecycle.
5. Provide on-demand track resolution via `/api/music?artist=...&title=...` to ensure any track in the queue can be played immediately.

### Trade-offs & Consequences
- **Pros**: Zero quota waste; permanent token refresh without manual key re-issuance; zero audio overlap; smooth pause/resume without re-cueing.
- **Cons**: Requires configuring a Google Cloud OAuth Client ID, Secret, and Refresh Token.
