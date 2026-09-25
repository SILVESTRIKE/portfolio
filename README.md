# SILVESTRIKE Portfolio OS

> Interactive browser-based developer portfolio and Linux workstation for **Văn Trọng Dương (SILVESTRIKE)**.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## Overview

SILVESTRIKE Portfolio OS simulates an interactive Unix-like desktop environment designed to showcase full-stack and AI/ML projects with live system metrics, tiling window management, terminal emulation, and audio telemetry.

### Core Features

- **Hyprland/i3 Tiling Window Manager**: Multi-workspace layout switching (Split, Grid, Stack, Single) with drag-and-drop pane swapping.
- **Terminal Emulator (bash)**: Built-in virtual filesystem (VFS) with standard commands (`ls`, `cat`, `cd`, `whoami`, `neofetch`, `htop`, `portfolio`).
- **Live System Telemetry**: CPU, RAM, and load averages streaming with sparklines and process management.
- **Git Studio**: Interactive git graph visualizer tracking commit history and file diffs.
- **Doru AI Assistant**: Native conversational assistant explaining portfolio architecture and sysadmin workflows.
- **Music Telemetry**: Spotify and Last.fm real-time playback integration with Web Audio frequency spectrum visualizer and synth fallback.
- **Bilingual i18n**: Instant EN / VI locale switching with persistent preferences.

---

## Tech Stack

| Domain | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router), React 19 |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4, Glassmorphism, JetBrains Mono |
| **Code Intelligence** | CodeGraph AST Indexer |
| **State & Persistence** | localStorage with reactive pub/sub |

---

## Getting Started

### Prerequisites
- Node.js >= 20.x
- npm, yarn, or pnpm

### Installation

```bash
git clone git@github.com:SILVESTRIKE/portfolio.git
cd portfolio
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## Documentation

- [System Architecture](docs/architecture.md)
- [Architectural Decisions](docs/DECISIONS.md)
- [Testing Strategy](docs/TESTING.md)
- [Project Roadmap](docs/plan.md)

