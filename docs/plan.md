# File Justification: Implementation roadmap, phase milestones, and task deliverables template.
# System Impact of Absence: Development loses clear prioritization, tracking of milestones, and visibility into in-progress work.

# SILVESTRIKE Portfolio OS — Project Roadmap & Implementation Plan

## Phase 1: Foundation & Project Setup
- [x] Initial codebase bootstrapping (`.agents/AGENTS.md`, `docs/`)
- [x] CodeGraph AST index generation (`codegraph init`, `codegraph sync`)
- [x] Rebranding from WebOS to SILVESTRIKE Portfolio OS
- [x] CRT Visuals Polish & Static scanline configuration

## Phase 2: Internationalization & Navigation
- [x] Full bilingual dictionaries (`en/apps.ts` & `vi/apps.ts`)
- [x] Localized FilesApp (toolbar, places, table, nano editor)
- [x] Localized ServicesApp (categories, search, sandboxes)
- [x] Grep-style terminal search bars (`ServicesApp`, `MonitorApp`, `LogsApp`)

## Phase 3: Developer Dossier & Terminal Workstation
- [x] Portfolio Dossier IDE Studio layout (`AboutMeTerminalApp.tsx`)
  - [x] Activity Bar (Explorer, Search, Git, Sysinfo)
  - [x] Collapsible file tree sidebar (`profile.yml`, `README.md`, `skills.json`, `projects/`, `thesis.md`, `contact.sh`)
  - [x] Multi-tab editor with breadcrumbs and file badges
  - [x] Neofetch specs hero with ASCII banner and ANSI color palette
  - [x] Integrated terminal drawer
  - [x] IDE status bar (git branch, UTF-8, line:col, language mode)
- [x] Advanced Terminal Workstation (`TerminalApp.tsx`)
  - [x] Multi-session bash tabs (`+` new session, tab closing)
  - [x] Persistent command history via `localStorage` (last 50 commands, up/down arrows)
  - [x] VFS path & command auto-completion on `Tab`
  - [x] Virtual file system `cp` and `mv` commands in `src/lib/fs.ts`
  - [x] Shell rebrand to `root@srv-silvestrike`

## Phase 4: Window Manager & Polishing
- [x] Visual ghost snap zone overlay in `TilingPane.tsx`
- [x] Enhanced active pane focus ring with glowing accent
- [x] CodeGraph AST synchronization (`codegraph sync`)
- [x] Zero TypeScript / Turbopack build errors (`npm run build`)

## Phase 5: Authentic Hyprland Workstation, Terminal Home Dossier, WebOS Task Manager & Visitor Analytics DB
- [x] **1. Dọn dẹp triệt để `doru` trên toàn bộ hệ thống**
  - [x] Đổi hostname `srv-doru` -> `srv-silvestrike`, user `duong@silvestrike`
  - [x] Đổi đường dẫn `/home/doru` -> `/home/silvestrike` trong VFS (`src/lib/fs.ts`, `FilesApp.tsx`)
  - [x] Cập nhật tiêu đề cửa sổ, dock/hub badges và ngôn ngữ (`commands.ts`, `SysInfoApp.tsx`, `AIAssistantApp.tsx`, `page.tsx`)
- [x] **2. Đưa Toàn Bộ About Me CLI ra Terminal làm Trang Chủ (Home Screen)**
  - [x] Tích hợp nguyên vẹn `AboutMeTerminalApp` trực tiếp vào `TerminalApp.tsx` (Dossier Studio với đầy đủ 10 file tài liệu, Explorer, Search grep, Git, Sysinfo, Neofetch hero và Drawer Terminal)
  - [x] Thêm thanh chuyển chế độ tức thì: `[About Me CLI (Dossier Studio)]` (mặc định) và `[Interactive Bash Shell]`
  - [x] Xóa bỏ hoàn toàn tab `about` trùng lặp trong `PortfolioHubApp.tsx`, giải phóng Hub để chuyên tâm quản lý Services, Git và Odoo ERP
  - [x] Tích hợp lệnh in trực tiếp dossier: `about`, `skills`, `projects`, `contact`, `cat profile.yml`, `cat README.md`
- [x] **3. Nâng cấp Terminal: Auto-Suggest & Quick Command Bar**
  - [x] Inline Ghost Auto-Suggestion (chuẩn Fish / Zsh ghost text, bấm Tab/Phím phải để hoàn thành)
  - [x] Thanh phím tắt lệnh hay dùng của dự án: `[about]` `[neofetch]` `[skills]` `[projects]` `[services]` `[monitor]` `[git]` `[network]` `[odoo]`
  - [x] Nâng cấp menu `help` và tab completion thông minh
- [x] **4. WebOS Task Manager & Cách Ly Tuyệt Đối Máy Thật**
  - [x] Gỡ bỏ hoàn toàn lệnh `ps` và `SIGTERM` trên tiến trình máy chủ khỏi `/api/system`
  - [x] Bảng tác vụ chỉ quản lý các cửa sổ/tab đang mở trên WebOS và bộ nhớ heap của trình duyệt
  - [x] Nút đóng tab/cửa sổ WebOS an toàn, không can thiệp hệ điều hành người dùng
- [x] **5. Web Traffic & Visitor Analytics Database (Kết hợp Analytics Dashboard)**
  - [x] Tạo local database `data/analytics.json` và API `/api/analytics` (POST ghi nhận, GET thống kê)
  - [x] Tự động ghi nhận lượt truy cập của người dùng ngay khi mount (`src/app/page.tsx`)
  - [x] Đếm tổng lượt xem (Pageviews), khách duy nhất (Unique Visitors), phiên online (Active Sessions)
  - [x] Tích hợp thẻ Web Analytics Dashboard trực tiếp trong Monitor (biểu đồ lưu lượng + log lượt truy cập)
- [x] **6. Rà soát & Đồng bộ Bảng màu Caelestia Hyprland (Không Harsh Cyan, Không Emoji)**
  - [x] Chuyển toàn bộ token `#38bdf8` sang `#7aa2f7` trên tất cả các app (`AIAssistantApp`, `SysInfoApp`, `FilesApp`, `SpotifyPlayer`, `OdooSandboxApp`)
  - [x] Đảm bảo 100% không có emoji hoặc icon trang trí trong mã nguồn và chú thích
- [x] **7. Căn chỉnh Hiển thị & Chống Tràn Giao diện**
  - [x] Đồng hồ TopPanel hiển thị gọn gàng, không bị tràn ra ngoài màn hình
  - [x] Thanh trạng thái tmux đáy màn hình hiển thị chuẩn xác phím tắt và workspace tag
- [x] **8. Build, CodeGraph Sync & Kiểm tra Hoàn tất**
  - [x] Đồng bộ CodeGraph (`codegraph sync`)
  - [x] Chạy `npm run build` xác nhận không có lỗi Turbopack/TypeScript (Build thành công trong 1.1s)

## Phase 6: Recruiter-Friendly Transformation & Docker Dashboard
- [x] **Phase 1: Quick Technical Cleanups**
  - [x] Centralized metadata into `@/config` (`DEVELOPER_CONFIG`, `SYSTEM_CONFIG`)
  - [x] Standardized career titles and verified educational credentials
- [x] **Phase 2: Recruiter-First Layer**
  - [x] 30s Executive Summary Route (`/resume`) with server-side static rendering
  - [x] 4-Sentence Project Formulation (Problem -> Architecture -> Contribution -> Result)
  - [x] Recruiter-first application priority in Command Palette and dock shortcuts
- [x] **Phase 3: Docker Container Dashboard & Git Architecture**
  - [x] Redesigned `ServicesApp` as authentic Docker Container Workstation (`image`, `status`, `ports`, `depends_on`, `environment`, `healthcheck`)
  - [x] Visual system architecture flow diagrams (`dependsOn`) for instant full-stack comprehension
  - [x] Production metrics in container healthchecks (inference latency, test pass rates, uptime)
  - [x] Real GitHub commit graph integration via GitKrakenApp
- [x] **Phase 4: Tone & Content Polish Across Projects**
  - [x] Standardized project card badges to uniform Docker/engineering statuses (`RUNNING / PRODUCTION CMS`, `RUNNING / EDGE DEPLOYED`, `RUNNING / LOCAL ENGINE`, `ARCHIVED / DESKTOP + WEB POS`, `RUNNING / THESIS RAG`)
  - [x] Enforced 4-sentence project formulation across `ProjectsView`, `ThesisView`, and `ResumePage` (Problem -> Architecture -> Contribution -> Result)
  - [x] Added verifiable production metrics into each project card (15,000+ monthly visits, 94% accuracy on 120 breeds, <650ms speech-to-speech loop, 92.4% Top-5 recall on 15,420 legal documents)
  - [x] Removed gimmick uptime labels; live uptime anchored to university Year 2 coding start date

- [x] **Phase 5: Technical Showcase Preparation & Community Outreach Kit**
  - [x] `docs/articles/how-to-build-virtual-fs-in-react.md`: Deep technical guide on building in-memory VFS in React/Next.js
  - [x] `docs/articles/offline-voice-agent-langgraph.md`: Deep technical guide on low-latency voice AI with LangGraph and Whisper
  - [x] `docs/articles/hybrid-legal-rag-pipeline.md`: Graduation thesis guide on hybrid dense-sparse RAG with Qdrant
  - [x] `docs/outreach/showcase_and_community_kit.md`: 15-30s video demo storyboard, Reddit/J2TEAM/HackerNews/LinkedIn/ProductHunt post templates
  - [x] Synchronized Architectural Decision Records (ADR-001 through ADR-004 in `docs/DECISIONS.md`)
  - [x] Complete system architecture blueprint with Dual Persona routing in `docs/architecture.md`
  - [x] CodeGraph AST index synchronization (`codegraph sync`)
  - [x] Zero TypeScript compilation errors (`npx tsc --noEmit`)



