# KanFlow — Trello Clone

A pixel-perfect, full-stack Kanban project management tool inspired by Trello. Built with **Next.js 16**, **Express.js**, and **Supabase (PostgreSQL)**.

> **Author:** Harsh Partap Jain ([harshpartapjainsdg@gmail.com](mailto:harshpartapjainsdg@gmail.com)) — [dev.harshpartapjain.site](https://dev.harshpartapjain.site)
>
> **Assignment:** Scaler SDE Intern — Fullstack Assignment

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Set Up Supabase](#3-set-up-supabase)
  - [4. Configure Environment Variables](#4-configure-environment-variables)
  - [5. Run the SQL Schema](#5-run-the-sql-schema)
  - [6. Seed the Database](#6-seed-the-database)
  - [7. Start the Development Server](#7-start-the-development-server)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [State Management](#state-management)
- [Guided Tour System](#guided-tour-system)
- [Responsive Design](#responsive-design)
- [Scripts Reference](#scripts-reference)

---

## Features

### Board Management
- **Create boards** with custom titles, background colors, and gradients
- **Rename boards** by clicking the title inline
- **Star/unstar boards** for quick access (starred boards appear at top)
- **Customize backgrounds** — 8 gradient styles (Ocean, Forest, Berry, etc.) + 6 solid colors
- **Delete boards** via the board menu
- **Multiple boards** — manage separate projects independently

### Lists Management
- **Create lists** with custom titles (e.g., "To Do", "In Progress", "Done")
- **Rename lists** inline by clicking the title
- **Delete lists** with confirmation when cards exist
- **Drag & drop reorder** — grab the header to rearrange columns horizontally

### Cards Management
- **Create cards** in any list with quick-add input
- **Edit card titles** inline
- **Drag & drop within lists** — reorder cards vertically
- **Drag & drop across lists** — move cards between columns
- **Card covers** — colored header banners for visual distinction
- **Archive cards** — hide without permanently deleting
- **Delete cards** — permanent removal with confirmation

### Card Details (Modal)
- **Rich description** — multi-line text editor with save/cancel
- **Labels** — color-coded categories (6 default colors), create custom labels, toggle on/off
- **Due dates** — date picker with status badges:
  - 🟢 Green = completed
  - 🟡 Yellow = due within 24 hours
  - 🔴 Red = overdue
- **Checklists** — break tasks into sub-items, track progress (e.g., "3/5"), multiple checklists per card
- **Members** — assign/unassign team members, avatars shown on card face
- **Comments** — add, edit, delete comments with member avatars and timestamps
- **Attachments** — upload files (max 10MB), download/delete
- **Card covers** — choose from 10 colors for visual card headers

### Search & Filter
- **Global search** — search across all cards instantly from the navbar
- **Filter panel** with:
  - Keyword search (card titles)
  - Member filter (by assignee)
  - Label filter (by color/name)
  - Due date filter (overdue, today, this week, this month)
  - Status filter (complete/incomplete)
  - Active filter indicator (blue highlight)
  - "Clear all" reset button

### Bonus Features
- **Responsive design** — Desktop, tablet, and mobile optimized
- **Guided tour** — interactive 25-step onboarding tour using driver.js
  - Auto-starts on first visit
  - Manual trigger via compass icon in navbar
  - Separate home tour (8 steps) and board tour (25 steps)
- **Drag & drop animations** — spring physics, tilt effects, smooth transitions
- **Dark theme** — pixel-perfect Trello dark mode
- **Toast notifications** — success/error feedback via react-hot-toast
- **Skeleton loading** — shimmer placeholders while data loads

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js (App Router) | 16.2.1 |
| **UI Framework** | React | 19.2.4 |
| **Styling** | Tailwind CSS | 4.x |
| **State Management** | Zustand | 5.0.12 |
| **Drag & Drop** | @dnd-kit/core + sortable | 6.3.1 / 10.0.0 |
| **UI Primitives** | Radix UI (Dialog, Popover, Dropdown, Checkbox, Tooltip) | Latest |
| **Onboarding** | driver.js | 1.4.0 |
| **Date Utilities** | date-fns + react-day-picker | 4.1.0 / 9.14.0 |
| **Icons** | Lucide React | 1.7.0 |
| **HTTP Client** | Axios | 1.14.0 |
| **Notifications** | react-hot-toast | 2.6.0 |
| **Backend** | Express.js | 4.21.0 |
| **Database** | Supabase (PostgreSQL) | — |
| **Validation** | express-validator | 7.2.1 |
| **Security** | Helmet | 8.0.0 |
| **File Uploads** | Multer | 1.4.5 |
| **Package Manager** | pnpm (workspaces) | — |
| **Language** | TypeScript | 5.7.3 |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────┐ │
│  │  Next.js 16  │  │  Zustand  │  │ @dnd-kit DnD   │ │
│  │  App Router  │  │  Stores   │  │ Drag & Drop    │ │
│  └──────┬───────┘  └────┬─────┘  └────────────────┘ │
│         │               │                            │
│         └───────┬───────┘                            │
│                 │ Axios                              │
└─────────────────┼────────────────────────────────────┘
                  │ HTTP REST API
┌─────────────────┼────────────────────────────────────┐
│                 ▼                                    │
│  ┌──────────────────────────────────────┐           │
│  │  Express.js Backend (Port 5000)       │           │
│  │  ├── Routes (8 modules)               │           │
│  │  ├── Controllers (business logic)     │           │
│  │  ├── Middleware (error handler)        │           │
│  │  └── Validation (express-validator)    │           │
│  └──────────────┬───────────────────────┘           │
│                 │ Supabase Client                    │
│  ┌──────────────▼───────────────────────┐           │
│  │  Supabase (PostgreSQL)                │           │
│  │  ├── 11 Tables                        │           │
│  │  ├── Indexes for performance          │           │
│  │  └── Cascading deletes                │           │
│  └──────────────────────────────────────┘           │
└──────────────────────────────────────────────────────┘
```

---

## Project Structure

```
kanflow/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with Toaster
│   ├── page.tsx                  # Home page (board list)
│   ├── globals.css               # Tailwind theme + custom CSS
│   └── board/
│       └── [id]/
│           └── page.tsx          # Board view page (DnD context)
│
├── components/
│   ├── board/
│   │   ├── BoardHeader.tsx       # Board title, star, filter, menu
│   │   ├── BoardList.tsx         # Board grid on home page
│   │   ├── BoardMenuDrawer.tsx   # Side drawer (background, settings)
│   │   ├── CreateBoardModal.tsx  # New board dialog
│   │   └── FilterPanel.tsx       # Search/filter sidebar
│   │
│   ├── card/
│   │   ├── CardItem.tsx          # Card on board (labels, badges)
│   │   ├── CardModal.tsx         # Full card detail dialog
│   │   ├── CardModalLabels.tsx   # Label management
│   │   ├── CardDueDate.tsx       # Date picker
│   │   ├── CardChecklist.tsx     # Checklist sub-tasks
│   │   ├── CardMembers.tsx       # Member assignment
│   │   ├── CardComments.tsx      # Comment thread
│   │   ├── CardAttachments.tsx   # File uploads
│   │   └── CardCover.tsx         # Cover color picker
│   │
│   ├── list/
│   │   ├── ListColumn.tsx        # List container (sortable)
│   │   └── AddListButton.tsx     # "+ Add another list"
│   │
│   ├── layout/
│   │   ├── Navbar.tsx            # Top navigation bar
│   │   └── Sidebar.tsx           # Left sidebar (board links)
│   │
│   ├── tour/
│   │   └── GuidedTour.tsx        # driver.js tour hook (33 steps)
│   │
│   └── ui/
│       ├── Avatar.tsx            # Member avatar component
│       └── SearchBar.tsx         # Global search input
│
├── stores/                       # Zustand state management
│   ├── boardStore.ts             # Board CRUD + star
│   ├── listStore.ts              # List CRUD + reorder
│   ├── cardStore.ts              # Card CRUD + move + reorder
│   ├── filterStore.ts            # Filter state (keyword, labels, etc.)
│   ├── memberStore.ts            # Members list
│   └── uiStore.ts                # UI toggles (modal, drawer, filter)
│
├── lib/
│   ├── api.ts                    # Axios instance (base URL)
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
│
├── types/
│   └── index.ts                  # TypeScript interfaces (Board, Card, etc.)
│
├── backend/                      # Express.js API server
│   ├── src/
│   │   ├── index.ts              # Server entry (Express setup)
│   │   ├── routes/               # 8 route modules (see API Reference)
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middleware/
│   │   │   └── errorHandler.ts   # Global error handler
│   │   └── db/
│   │       ├── supabase.ts       # Supabase client init
│   │       ├── schema.sql        # Database schema (copy below)
│   │       └── seed.ts           # Seed data script
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── package.json                  # Root (frontend + workspace)
├── pnpm-workspace.yaml           # pnpm workspace config
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
├── postcss.config.mjs            # PostCSS (Tailwind)
├── eslint.config.mjs             # ESLint config
└── README.md                     # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **pnpm** 8.x or later (`npm install -g pnpm`)
- **Supabase account** (free tier works) — [supabase.com](https://supabase.com)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kanflow
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs both frontend and backend dependencies via pnpm workspaces.

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Service Role Key** from Settings → API
3. Wait for the database to be provisioned

### 4. Configure Environment Variables

**Backend** — create `backend/.env`:

```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend** — create `.env.local` in the root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 5. Run the SQL Schema

Copy the [Database Schema](#database-schema) SQL below and run it in the **Supabase SQL Editor** (Dashboard → SQL Editor → New query → Paste → Run).

### 6. Seed the Database

```bash
pnpm seed
```

This populates the database with:
- 5 team members
- 2 boards with custom backgrounds
- 8 lists across 2 boards
- 12 cards with descriptions, covers, and due dates
- Labels, checklists, comments, member assignments, and activity logs

### 7. Start the Development Server

```bash
pnpm dev
```

This starts both servers concurrently:
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## API Reference

Base URL: `http://localhost:5000/api`

### Boards

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/boards` | List all boards |
| `GET` | `/boards/:id` | Get board with lists, cards, labels, members |
| `POST` | `/boards` | Create a new board |
| `PATCH` | `/boards/:id` | Update board (title, background, is_starred) |
| `DELETE` | `/boards/:id` | Delete a board (cascades) |
| `GET` | `/boards/:id/activity` | Get board activity log |

### Lists

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/lists` | Create a new list |
| `PATCH` | `/lists/:id` | Update list title |
| `DELETE` | `/lists/:id` | Delete a list (cascades cards) |
| `PATCH` | `/lists/reorder` | Reorder lists (batch position update) |

### Cards

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cards/search` | Search cards by keyword |
| `GET` | `/cards/:id` | Get full card details |
| `POST` | `/cards` | Create a new card |
| `PATCH` | `/cards/:id` | Update card fields |
| `DELETE` | `/cards/:id` | Delete a card |
| `PATCH` | `/cards/reorder` | Reorder/move cards |

### Labels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/boards/:id/labels` | Get all labels for a board |
| `POST` | `/boards/:id/labels` | Create a label |
| `PATCH` | `/labels/:id` | Update a label |
| `DELETE` | `/labels/:id` | Delete a label |
| `POST` | `/cards/:id/labels/:labelId` | Assign label to card |
| `DELETE` | `/cards/:id/labels/:labelId` | Remove label from card |

### Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/members` | List all members |
| `POST` | `/members/:memberId/cards/:id` | Assign member to card |
| `DELETE` | `/members/:memberId/cards/:id` | Remove member from card |

### Checklists

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/cards/:id/checklists` | Create checklist on card |
| `PATCH` | `/checklists/:id` | Update checklist title |
| `DELETE` | `/checklists/:id` | Delete checklist |
| `POST` | `/checklists/:id/items` | Add checklist item |
| `PATCH` | `/checklist-items/:id` | Toggle/update item |
| `DELETE` | `/checklist-items/:id` | Delete checklist item |

### Attachments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/cards/:id/attachments` | Upload file attachment (max 10MB) |
| `DELETE` | `/attachments/:id` | Delete attachment |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cards/:id/comments` | Get all comments on card |
| `POST` | `/cards/:id/comments` | Add comment |
| `PATCH` | `/comments/:id` | Edit comment |
| `DELETE` | `/comments/:id` | Delete comment |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health status |

---

## Database Schema

Run this SQL in the **Supabase SQL Editor** to create all tables:


```sql
-- KanFlow Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- MEMBERS (pre-seeded, no auth needed)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_color VARCHAR(7) NOT NULL,
  initials VARCHAR(3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOARDS
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  background VARCHAR(500) DEFAULT '#0079bf',
  is_starred BOOLEAN DEFAULT FALSE,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LISTS
CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  position FLOAT NOT NULL DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LABELS
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(100),
  color VARCHAR(7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CARDS
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  position FLOAT NOT NULL DEFAULT 0,
  cover_color VARCHAR(7),
  cover_image_url TEXT,
  due_date TIMESTAMPTZ,
  is_complete BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CARD_LABELS (junction)
CREATE TABLE IF NOT EXISTS card_labels (
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);

-- CARD_MEMBERS (junction)
CREATE TABLE IF NOT EXISTS card_members (
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, member_id)
);

-- CHECKLISTS
CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'Checklist',
  position FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHECKLIST_ITEMS
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  position FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATTACHMENTS
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  mime_type VARCHAR(100),
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY_LOG
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  member_id UUID REFERENCES members(id),
  action VARCHAR(100) NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_lists_board_id ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_lists_position ON lists(position);
CREATE INDEX IF NOT EXISTS idx_cards_list_id ON cards(list_id);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(position);
CREATE INDEX IF NOT EXISTS idx_labels_board_id ON labels(board_id);
CREATE INDEX IF NOT EXISTS idx_comments_card_id ON comments(card_id);
CREATE INDEX IF NOT EXISTS idx_activity_board_id ON activity_log(board_id);
CREATE INDEX IF NOT EXISTS idx_activity_card_id ON activity_log(card_id);
```

### Entity Relationship Diagram

<img width="1118" height="865" alt="image" src="https://github.com/user-attachments/assets/8ed4ca68-1236-4980-9c3c-efd863cb7533" />

---

## State Management

KanFlow uses **Zustand** with 6 stores for predictable, lightweight state management:

| Store | Purpose |
|-------|---------|
| `boardStore` | Board CRUD operations, star/unstar, current board |
| `listStore` | List CRUD, drag-and-drop reordering |
| `cardStore` | Card CRUD, cross-list movement, reordering |
| `filterStore` | Filter criteria (keyword, members, labels, dates, status) |
| `memberStore` | Team member list, current member |
| `uiStore` | UI toggles (create modal, card modal, filter panel, menu drawer) |

All stores use Axios to communicate with the backend API and update local state optimistically.

---

## Guided Tour System

KanFlow includes an interactive onboarding tour powered by **driver.js**:

- **Auto-starts** on first visit (separate tracking for home page and board page via `localStorage`)
- **Manual trigger** — click the 🧭 compass icon in the navbar at any time
- **Home tour** (8 steps) — covers navbar, create board, search, sidebar, board list
- **Board tour** (25 steps) — covers every feature:
  - Board management (rename, star, menu, backgrounds)
  - List operations (create, rename, delete, reorder)
  - Card operations (create, edit, drag & drop)
  - Card details (labels, due dates, checklists, members, comments, attachments, covers)
  - Archive & delete, filter panel, descriptions, multiple boards, responsive design

---

## Responsive Design

| Breakpoint | Layout |
|------------|--------|
| **Desktop** (≥1024px) | Full layout with sidebar, all features visible |
| **Tablet** (≥768px) | Sidebar hidden, horizontal scroll for lists |
| **Mobile** (<768px) | Compact cards, touch-friendly, condensed navbar |

---

## Scripts Reference

All commands from the project root:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both frontend and backend in development mode |
| `pnpm dev:frontend` | Start only the Next.js dev server |
| `pnpm dev:backend` | Start only the Express.js dev server |
| `pnpm build` | Build both frontend and backend for production |
| `pnpm start` | Start the Next.js production server |
| `pnpm lint` | Run ESLint across the codebase |
| `pnpm seed` | Seed the Supabase database with sample data |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` |

### Frontend (`.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## License

This project was built as a fullstack assignment submission. All rights reserved.

---

Built with ❤️ by **Harsh Partap Jain**
