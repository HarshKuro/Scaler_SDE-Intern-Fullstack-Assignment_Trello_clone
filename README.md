# KanFlow — Trello Clone

> A pixel-perfect Trello board clone built with Next.js 16, React 19, Express.js, and Supabase.

**Author:** Harsh Partap Jain  
**Email:** harshpartapjainsdg@gmail.com  
**Portfolio:** [https://dev.harshpartapjain.site](https://dev.harshpartapjain.site)

---

## Features

- **Boards Dashboard** — Create, star, and manage boards with custom backgrounds (gradients & colors)
- **Lists** — Create, rename, reorder, and delete lists within boards
- **Cards** — Full card management with drag-and-drop (via @dnd-kit), inline editing, and archive
- **Card Modal** — Rich modal with description, labels, members, due dates, checklists, comments, attachments, and cover colors
- **Drag & Drop** — Smooth card and list reordering with optimistic UI updates using @dnd-kit
- **Labels** — Create, assign, and manage color-coded labels per board
- **Members** — Assign/remove members to cards with avatar display
- **Due Dates** — Date picker (react-day-picker) with overdue/soon/complete status badges
- **Checklists** — Create checklists with items, progress bar, check/uncheck
- **Comments** — Add, edit, delete comments with activity feed
- **Attachments** — Upload files (up to 10MB) to Supabase Storage with preview
- **Cover Colors** — Set card cover colors for visual organization
- **Filter Panel** — Filter cards by keyword, member, and due date
- **Search** — Global card search with debounced API calls
- **Dark Theme** — Trello dark theme with precise color palette
- **Responsive** — Works on desktop and tablet viewports

## Tech Stack

| Layer      | Technology                                                  |
| ---------- | ----------------------------------------------------------- |
| Frontend   | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4         |
| Backend    | Express.js, TypeScript, Node.js                            |
| Database   | Supabase (PostgreSQL), Supabase Storage                    |
| State      | Zustand v5                                                  |
| DnD        | @dnd-kit (core v6, sortable v10)                           |
| UI         | Radix UI (Dialog, Popover, Dropdown, Checkbox, Tooltip)    |
| Icons      | Lucide React                                                |
| HTTP       | Axios                                                       |
| Dates      | react-day-picker v9, date-fns                              |
| Toasts     | react-hot-toast                                             |
| Monorepo   | pnpm workspaces                                             |

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Boards dashboard (home)
│   ├── board/[id]/page.tsx # Board view with lists & cards
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Tailwind v4 theme + dark styles
├── components/
│   ├── ui/                 # Avatar, ColorPicker, SearchBar
│   ├── layout/             # Navbar, Sidebar
│   ├── board/              # BoardCard, BoardList, BoardHeader, CreateBoardModal, FilterPanel
│   ├── list/               # ListColumn, ListHeader, AddListButton, AddCardButton
│   └── card/               # CardItem, CardLabels, CardModal, CardMembers, CardModalLabels,
│                           # CardDueDate, CardChecklist, CardComments, CardAttachments, CardCover
├── stores/                 # Zustand stores (board, list, card, filter, ui, member)
├── types/                  # TypeScript interfaces
├── lib/                    # API client (axios), utility functions
├── backend/
│   ├── src/
│   │   ├── index.ts        # Express server entry
│   │   ├── db/             # Supabase client, schema.sql, seed.ts
│   │   ├── controllers/    # Board, List, Card, Label, Member, Checklist, Comment, Attachment
│   │   ├── routes/         # Express route definitions
│   │   └── middleware/     # Error handler, validation
│   └── package.json
├── package.json            # Root workspace package
└── pnpm-workspace.yaml     # pnpm workspace config
```

## Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** 9+
- **Supabase** project (free tier works)

### 1. Clone & Install

```bash
git clone <repository-url>
cd trello-clone-frontend
pnpm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `backend/src/db/schema.sql`
3. In **Storage**, create a bucket named `attachments` (set to public)
4. Copy your project URL and anon key from **Settings → API**

### 3. Environment Variables

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```
PORT=5000
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Seed Database (optional)

```bash
pnpm seed
```

### 5. Run Development

```bash
# Both frontend & backend concurrently
pnpm dev

# Or separately
pnpm dev:frontend   # Next.js on port 3000
pnpm dev:backend    # Express on port 5000
```

### 6. Build

```bash
pnpm build
```

## API Endpoints

| Method | Endpoint                                | Description               |
| ------ | --------------------------------------- | ------------------------- |
| GET    | `/api/boards`                           | List all boards           |
| GET    | `/api/boards/:id`                       | Get board with full data   |
| POST   | `/api/boards`                           | Create board              |
| PATCH  | `/api/boards/:id`                       | Update board              |
| DELETE | `/api/boards/:id`                       | Delete board              |
| POST   | `/api/lists`                            | Create list               |
| PATCH  | `/api/lists/:id`                        | Update list               |
| DELETE | `/api/lists/:id`                        | Delete list               |
| PATCH  | `/api/lists/reorder`                    | Reorder lists             |
| POST   | `/api/cards`                            | Create card               |
| GET    | `/api/cards/:id`                        | Get card with details     |
| PATCH  | `/api/cards/:id`                        | Update card               |
| DELETE | `/api/cards/:id`                        | Delete card               |
| PATCH  | `/api/cards/reorder`                    | Reorder cards             |
| GET    | `/api/cards/search?q=`                  | Search cards              |
| GET    | `/api/labels/boards/:id/labels`         | Get board labels          |
| POST   | `/api/labels/boards/:id/labels`         | Create label              |
| POST   | `/api/labels/cards/:id/labels/:labelId` | Assign label to card      |
| GET    | `/api/members`                          | List all members          |
| POST   | `/api/checklists/cards/:id/checklists`  | Create checklist          |
| POST   | `/api/attachments/cards/:id/attachments` | Upload attachment        |
| GET    | `/api/comments/cards/:id/comments`      | Get card comments         |
| POST   | `/api/comments/cards/:id/comments`      | Add comment               |

## Database Schema

12 tables: `members`, `boards`, `lists`, `labels`, `cards`, `card_labels`, `card_members`, `checklists`, `checklist_items`, `attachments`, `comments`, `activity_log`

See `backend/src/db/schema.sql` for the full schema.

---

Built with ❤️ by **Harsh Partap Jain**
