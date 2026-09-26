<!--
Reason for existence: Complete distribution, community outreach, and demonstration toolkit for launching SILVESTRIKE Portfolio OS across social channels, technical communities, and recruiter platforms.
System Impact of Absence: Outreach efforts risk appearing spammy or uncoordinated, failing to convey the engineering depth of the project.
-->

# SILVESTRIKE Portfolio OS — Community Showcase & Outreach Playbook

## 1. Guiding Philosophy: Value-First, Not Self-Promotion

The core tenet for sharing SILVESTRIKE Portfolio OS is simple: **deliver technical value upfront; the project link is merely supporting evidence.**

Avoid vanity bragging. Frame all posts around engineering challenges solved:
- How to emulate POSIX filesystem semantics in React.
- How to achieve sub-650ms local voice AI inference on Linux.
- Balancing interactive terminal aesthetics with a 30-second recruiter-friendly static summary layer.

---

## 2. 15-30s Screen Recording / GIF Storyboard

Use `wf-recorder`, OBS Studio, or browser screencast at 60 FPS (1920x1080).

| Timestamp | Visual Action | Engineering Highlight Shown |
|---|---|---|
| **00:00 - 00:05** | Boot sequence: Caelestia Hyprland theme loads, animated ASCII banner and Fastfetch specs appear. | Zero client flicker, fast fetch hardware telemetry. |
| **00:05 - 00:11** | Open terminal and launch a second window. Drag window toward edge to trigger the translucent snap-zone overlay. Pane tiles automatically. | Custom React tiling window manager and ghost overlays. |
| **00:11 - 00:17** | Type `pro` in bash terminal; press `Tab` for instant completion to `projects`. Run `cat projects/samco-binhtan.ts`. | In-memory VFS, path resolution, and tab completion. |
| **00:17 - 00:23** | Launch Docker Services workstation (`services`). Highlight real-time container metrics and interactive pipeline DAG (`depends_on`). | Production Docker dashboard mapping real engineering projects. |
| **00:23 - 00:30** | Press `Ctrl+K` for Command Palette, select "30s Recruiter Resume", instantly load `/resume` with direct CV download. | Dual-persona design: authentic OS + instant recruiter scanability. |

---

## 3. Community Post Copy & Feedback Templates

### Template A: Reddit (r/webdev, r/SideProject, r/nextjs)

**Title**: I built a Linux WebOS portfolio with an in-memory POSIX filesystem and Docker dashboard in Next.js 15 — looking for UX and performance feedback

**Body**:
```markdown
Hi everyone,

Most developer portfolios are static landing pages that feel identical. I wanted to build something that reflects how I actually work on my Linux Hyprland workstation, while ensuring recruiters don't get frustrated trying to find my resume.

Key engineering components:
1. In-memory Virtual Filesystem (VFS): Implemented tree-based path resolution (`resolvePath`), POSIX command parsing (`ls`, `cat`, `mkdir`, `cp`, `mv`, `rm`), and Tab auto-completion.
2. Docker Container Dashboard: Modeled all my real-world projects (Samco EV CMS, DogDexx Vision AI, Doru Voice AI) as live container cards displaying actual architecture flows (`depends_on`), ports, and verifiable healthcheck metrics.
3. 30-Second Recruiter Route: Built a static server-side rendered `/resume` route accessible with one keystroke (`Ctrl+K`) for recruiters who prefer a direct summary over a terminal.
4. AST Code Intelligence: Integrated CodeGraph AST search directly into the codebase navigation.

Would love feedback on:
- Window tiling UX: Does the snap-zone interaction feel intuitive or does it interfere with mobile viewports?
- Terminal responsiveness: Are there edge cases in my path traversal algorithm you would improve?

Live demo: https://silvestrike.vercel.app
Recruiter summary: https://silvestrike.vercel.app/resume
Source code: https://github.com/SILVESTRIKE

Thank you for your insights!
```

---

### Template B: Vietnamese Developer Communities (J2TEAM, Tôi Đi Code Dạo, Lập Trình Web)

**Tiêu đề**: Em sinh viên năm cuối IT xây dựng WebOS Portfolio giả lập môi trường Linux Hyprland với Virtual Filesystem và Docker Dashboard bằng Next.js 15 — Xin góp ý về UX và kiến trúc

**Nội dung**:
```markdown
Chào các anh chị và các bạn trong cộng đồng,

Là một sinh viên năm cuối chuyên ngành Kỹ thuật Phần mềm và AI, em muốn tạo một portfolio khác biệt: phản ánh đúng trải nghiệm làm việc hàng ngày của mình trên máy trạm Linux (Hyprland Wayland), nhưng không làm mất đi tính nhanh gọn khi nhà tuyển dụng cần xem CV.

Hệ thống bao gồm các điểm chính về kỹ thuật:
1. Virtual Filesystem (VFS) nội bộ: Tự xây dựng cây thư mục trên RAM, xử lý phân giải đường dẫn POSIX, hỗ trợ các lệnh chuẩn bash (`ls`, `cat`, `cd`, `mkdir`, `cp`, `mv`), phím tắt Tab tự hoàn thành và lưu trữ trạng thái qua LocalStorage.
2. Docker Container Registry: Thay vì chỉ liệt kê danh sách dự án đơn điệu, em chuẩn hóa toàn bộ các dự án thực tế (Samco VinFast EV CMS, DogDexx Edge AI, Doru Voice AI, Đồ án Veritas Legal RAG) thành các thẻ container với đầy đủ sơ đồ pipeline phụ thuộc (`depends_on`), cổng kết nối và số liệu kiểm thử thực tế.
3. Tuyến Resume 30s cho Recruiter: Tạo route tĩnh `/resume` kết xuất từ máy chủ (SSR), giúp nhà tuyển dụng có thể scan toàn bộ thông tin chỉ trong 30 giây mà không cần thao tác gõ terminal.

Em rất mong nhận được những nhận xét thẳng thắn từ các anh chị đi trước:
- Trải nghiệm kéo thả chia đôi màn hình (Tiling Window Manager) có bị nặng hoặc giật trên trình duyệt của mọi người không?
- Phần tone chữ và các chỉ số dự án đã đủ tin cậy cho một Fresher/Junior Engineer chưa?

Link trải nghiệm WebOS: https://silvestrike.vercel.app
Link bản tóm tắt Recruiter: https://silvestrike.vercel.app/resume
Mã nguồn: https://github.com/SILVESTRIKE

Em xin cảm ơn mọi người rất nhiều!
```

---

### Template C: Hacker News (Show HN)

**Title**: Show HN: SILVESTRIKE — Linux WebOS portfolio with POSIX VFS and Docker container dashboard in Next.js

**Body**:
```markdown
SILVESTRIKE Portfolio OS is an open-source browser workstation modeled after Linux Hyprland, built with Next.js 15, TypeScript, and TailwindCSS.

Features:
- In-memory Virtual Filesystem (VFS) with POSIX path resolution, Tab auto-completion, and command execution.
- Docker Container Dashboard mapping full-stack and AI projects with pipeline dependency graphs and healthcheck telemetry.
- Low-latency local voice AI assistant (Doru) architecture using LangGraph, Faster-Whisper, and Silero VAD.
- Dual-persona architecture: Interactive workstation + static 30s SSR summary page at `/resume` with direct CV download.

Live URL: https://silvestrike.vercel.app
Resume route: https://silvestrike.vercel.app/resume
Repo: https://github.com/SILVESTRIKE
```

---

### Template D: LinkedIn Professional Post

```markdown
Instead of building another static portfolio, I turned my personal site into a full Linux WebOS Workstation.

Here is why: as a software and AI engineer, how you think about architecture matters more than generic bullet points.

Key highlights of the architecture:
- In-Memory Virtual Filesystem: Tree-based POSIX shell supporting cd, ls, cat, cp, mv, and Tab auto-completion.
- Docker Service Dashboard: Visualizing real-world systems (Samco EV CMS, Veritas Legal RAG, DogDexx AI) through authentic container metrics and dependency flow graphs.
- 30-Second Recruiter Route: Designed an SSR `/resume` view for hiring teams who need immediate, clean access to credentials, verified GPA, and CV download.
- Local AI Pipeline: Real-time integration with local speech and reasoning models running under 650ms latency.

Explore the workstation: https://silvestrike.vercel.app
30-second summary: https://silvestrike.vercel.app/resume

#SoftwareEngineering #Nextjs #TypeScript #Linux #WebDevelopment #ArtificialIntelligence
```

---

### Template E: Product Hunt Launch Blueprint

- **Name**: SILVESTRIKE Portfolio OS
- **Tagline**: Authentic Linux Hyprland browser OS with POSIX VFS & Docker Dashboard
- **Category**: Developer Tools, Web Development, Productivity
- **Maker Comment**:
  "Hi hunters! Most portfolios are forgotten after 10 seconds. I spent the last few months building SILVESTRIKE Portfolio OS to make reviewing a developer's code as interactive as testing software. You can drag and tile windows, browse real virtual files with a POSIX shell, or view live system dependencies in the Docker container dashboard. If you're in a hurry, press Ctrl+K and head directly to the 30s Resume route. Would love to hear your feedback on the UX!"
- **Gallery Images Needed**:
  1. Desktop boot hero with Caelestia soft blue theme and Fastfetch telemetry.
  2. Tiling window manager in dual-pane mode with snap-zone ghost overlay.
  3. Docker container dashboard showing dependency flow diagrams.
  4. Recruiter 30-second summary page with 4-sentence project formulas.
