'use client';

import { useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const homeTourSteps = [
  {
    element: '[data-tour="navbar"]',
    popover: {
      title: '🧭 Navigation Bar',
      description:
        'Welcome to KanFlow! This is your main navigation bar. From here you can access boards, recent items, starred boards, search, and create new boards.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="logo"]',
    popover: {
      title: '🏠 KanFlow Home',
      description:
        'Click the KanFlow logo anytime to return to this home dashboard where you can see all your boards at a glance.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="create-btn"]',
    popover: {
      title: '➕ Create a New Board',
      description:
        'Click "Create" to make a new board. You\'ll be asked to enter a title and choose a background color or gradient. Each board is a workspace for organizing tasks.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="search"]',
    popover: {
      title: '🔍 Search Cards',
      description:
        'Type here to search across all your cards instantly. Results appear as you type — click any result to jump directly to that card on its board.',
      side: 'bottom' as const,
      align: 'end' as const,
    },
  },
  {
    element: '[data-tour="tour-btn"]',
    popover: {
      title: '🧭 Guided Tour',
      description:
        'Click this compass icon anytime to restart the guided tour. On the home page it shows the home tour, and on a board page it shows the board tour with all features explained.',
      side: 'bottom' as const,
      align: 'end' as const,
    },
  },
  {
    element: '[data-tour="sidebar"]',
    popover: {
      title: '📋 Workspace Sidebar',
      description:
        'Your sidebar shows all boards in your workspace with color previews. Starred boards appear at the top for quick access. Click any board name to navigate to it.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="board-list"]',
    popover: {
      title: '🎯 Your Boards',
      description:
        'All your boards are displayed here as cards with their background colors. Click any board to open it. You can create multiple boards for different projects or teams.',
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    popover: {
      title: '🚀 Ready to Go!',
      description:
        'You\'re all set! Click on any board to open it and start organizing your tasks. Once inside a board, click the 🧭 compass icon again to get a detailed tour of all board features.',
    },
  },
];

const boardTourSteps = [
  // ── Step 1: Welcome ──
  {
    popover: {
      title: '👋 Welcome to Your Board!',
      description:
        'This tour will walk you through every feature of KanFlow — board management, lists, cards, labels, due dates, checklists, members, drag & drop, search, filters, comments, attachments, covers, and more. Let\'s go!',
    },
  },

  // ── Step 2: Board Header ──
  {
    element: '[data-tour="board-header"]',
    popover: {
      title: '📌 Board Header — Rename Your Board',
      description:
        'How to rename your board:\n1. Click the board title text\n2. Type the new name\n3. Press Enter to save, or Escape to cancel\n\nThe header also shows your team member avatars.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },

  // ── Step 3: Star Board ──
  {
    element: '[data-tour="board-star"]',
    popover: {
      title: '⭐ Favorite Your Board',
      description:
        'How to star a board:\n• Click the ⭐ icon to toggle favorite on/off\n• Starred boards appear at the top of your home dashboard and sidebar\n• Quick access to your most important projects!',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },

  // ── Step 4: Board Menu / Background ──
  {
    element: '[data-tour="board-menu"]',
    popover: {
      title: '⚙️ Board Menu — Settings & Background',
      description:
        'Click the ··· button to open the board menu:\n\n📋 About this board — view creation date\n🎨 Change background — choose from:\n   • 8 gradient styles (Ocean, Forest, Berry…)\n   • 6 solid colors\n🗑️ Close board — delete when no longer needed\n\nCustomize each board with a unique look!',
      side: 'bottom' as const,
      align: 'end' as const,
    },
  },

  // ── Step 5: Tour Button ──
  {
    element: '[data-tour="tour-btn"]',
    popover: {
      title: '🧭 Restart This Tour Anytime',
      description:
        'Click this compass icon whenever you need a refresher on any feature. The tour adapts to which page you\'re on — home tour or board tour.',
      side: 'bottom' as const,
      align: 'end' as const,
    },
  },

  // ── Step 6: List Column ──
  {
    element: '[data-tour="list-column"]',
    popover: {
      title: '📝 Lists — Your Workflow Stages',
      description:
        'Lists are vertical columns that organize cards into stages.\n\nCommon workflows:\n• To Do → In Progress → Done\n• Backlog → Sprint → Review → Complete\n\n🖱️ Drag & Drop lists:\n   Grab the list header area and drag left/right to reorder!',
      side: 'right' as const,
      align: 'start' as const,
    },
  },

  // ── Step 7: List Header ──
  {
    element: '[data-tour="list-header"]',
    popover: {
      title: '✏️ Edit & Manage Lists',
      description:
        'How to rename a list:\n1. Click the list title text\n2. Type the new name\n3. Press Enter to save\n\nHow to delete a list:\n1. Click the ··· menu on the right\n2. Select "Delete this list"\n3. If cards exist, you\'ll be asked to confirm',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },

  // ── Step 8: Add List ──
  {
    element: '[data-tour="add-list"]',
    popover: {
      title: '📋 Create New Lists',
      description:
        'How to add a list:\n1. Click "Add another list"\n2. Type a title (e.g. "In Review")\n3. Press Enter or click "Add list"\n4. Press Escape to cancel\n\nTip: Create as many lists as your workflow needs!',
      side: 'left' as const,
      align: 'start' as const,
    },
  },

  // ── Step 9: Card Item ──
  {
    element: '[data-tour="card-item"]',
    popover: {
      title: '🃏 Cards — Your Tasks & Items',
      description:
        'Each card is a task. Cards display at a glance:\n• 🏷️ Colored label strips\n• 📅 Due date badge (green/yellow/red)\n• ✅ Checklist progress (3/5)\n• 💬 Comment count\n• 📎 Attachment count\n• 👤 Assigned member avatars\n\n🖱️ Drag cards up/down to reorder, or to another list!',
      side: 'right' as const,
      align: 'start' as const,
    },
  },

  // ── Step 10: Add Card ──
  {
    element: '[data-tour="add-card"]',
    popover: {
      title: '➕ Create New Cards',
      description:
        'How to create a card:\n1. Click "+ Add a card" at the bottom of any list\n2. Type a title for your task\n3. Press Enter to create (keeps input open for more)\n4. Press Escape when done\n\nTip: Keep card titles short and action-oriented!',
      side: 'top' as const,
      align: 'center' as const,
    },
  },

  // ── Step 11: Card Details Overview ──
  {
    element: '[data-tour="card-item"]',
    popover: {
      title: '📋 Card Details — The Full Picture',
      description:
        'Click any card to open its detail modal:\n\n✏️ Edit title — click the title\n📝 Description — click to add/edit rich text\n🏷️ Labels — color-coded categories\n📅 Due Date — set deadlines\n✅ Checklists — break into sub-tasks\n👥 Members — assign team members\n💬 Comments — collaborate & discuss\n📎 Attachments — upload files (max 10MB)\n🎨 Cover — colored header banner\n📦 Archive — hide card without deleting\n🗑️ Delete — permanently remove',
      side: 'left' as const,
      align: 'start' as const,
    },
  },

  // ── Step 12: Labels ──
  {
    element: '[data-tour="card-item"]',
    popover: {
      title: '🏷️ Labels — Categorize with Colors',
      description:
        'How to use labels:\n1. Click a card to open it\n2. In the sidebar, click "Labels"\n3. Toggle existing labels on/off with a click\n4. Click "+ Create a new label" to make custom ones\n5. Pick a color and enter a name\n\nLabels appear as colored strips on the card face — perfect for visual scanning across the board!',
      side: 'left' as const,
      align: 'center' as const,
    },
  },

  // ── Step 13: Due Dates ──
  {
    element: '[data-tour="card-item"]',
    popover: {
      title: '📅 Due Dates — Never Miss a Deadline',
      description:
        'How to set a due date:\n1. Click a card to open it\n2. In the sidebar, click "Dates"\n3. Pick a date from the calendar\n4. Click "Save" to confirm\n\nDue date badges on cards show status:\n• 🟢 Green = completed on time\n• 🟡 Yellow = due within 24 hours\n• 🔴 Red = overdue\n\nClick "Remove" to clear the date.',
      side: 'left' as const,
      align: 'center' as const,
    },
  },

  // ── Step 14: Checklists ──
  {
    element: '[data-tour="card-item"]',
    popover: {
      title: '✅ Checklists — Break Down Big Tasks',
      description:
        'How to add a checklist:\n1. Click a card → "Checklist" in sidebar\n2. Name it (e.g. "Acceptance Criteria")\n3. Click "Add" to create\n4. Type items and press Enter\n5. Check ☑️ items as you complete them\n\nThe card face shows progress like "3/5"\nYou can add multiple checklists per card!\nDelete individual items or entire checklists.',
      side: 'left' as const,
      align: 'center' as const,
    },
  },

  // ── Step 15: Members ──
  {
    element: '[data-tour="card-item"]',
    popover: {
      title: '👥 Members — Assign Responsibility',
      description:
        'How to assign members:\n1. Click a card → "Members" in sidebar\n2. Click a team member to assign them\n3. Click again to unassign\n4. ✓ checkmark shows assigned members\n\nAssigned member avatars appear on the card face.\n\nTip: Use the Filter to show only cards assigned to specific members!',
      side: 'left' as const,
      align: 'center' as const,
    },
  },

  // ── Step 16: Comments ──
  {
    element: '[data-tour="card-item"]',
    popover: {
      title: '💬 Comments — Team Collaboration',
      description:
        'How to use comments:\n1. Click a card to open it\n2. Scroll to the "Activity" section at the bottom\n3. Type your comment in the text box\n4. Click "Save" to post\n\nYou can also:\n• ✏️ Edit your comments\n• 🗑️ Delete your comments\n\nComments show member avatars and timestamps.',
      side: 'left' as const,
      align: 'center' as const,
    },
  },

  // ── Step 17: Attachments ──
  {
    element: '[data-tour="card-item"]',
    popover: {
      title: '📎 File Attachments',
      description:
        'How to attach files:\n1. Click a card → "Attachment" in sidebar\n2. Click the button to browse your computer\n3. Select a file (max 10MB)\n4. File appears in the Attachments section\n\nSupported: images, PDFs, documents, spreadsheets, and more.\n\nClick a file to open/download it.\nClick 🗑️ to remove an attachment.',
      side: 'left' as const,
      align: 'center' as const,
    },
  },

  // ── Step 18: Card Covers ──
  {
    element: '[data-tour="card-item"]',
    popover: {
      title: '🎨 Card Covers — Visual Distinction',
      description:
        'How to set a cover color:\n1. Click a card → "Cover" in sidebar\n2. Choose from 10 colors\n3. The color appears as a banner at the top of the card\n\nCovers help important cards stand out!\nClick "Remove cover" to clear it.\n\nThe cover is visible both on the board and in the card detail view.',
      side: 'left' as const,
      align: 'center' as const,
    },
  },

  // ── Step 19: Archive Cards ──
  {
    element: '[data-tour="card-item"]',
    popover: {
      title: '📦 Archive & Delete Cards',
      description:
        'How to archive a card:\n1. Click a card → scroll to "Actions" in sidebar\n2. Click "Archive" to hide the card from the board\n   (Card is preserved but hidden)\n\nHow to delete a card:\n1. Click "Delete" in the Actions section\n2. Confirm the deletion\n   ⚠️ This permanently removes the card!\n\nTip: Archive first, delete only when sure.',
      side: 'left' as const,
      align: 'center' as const,
    },
  },

  // ── Step 20: Drag & Drop ──
  {
    element: '[data-tour="list-column"]',
    popover: {
      title: '🖱️ Drag & Drop — Full Control',
      description:
        'KanFlow supports smooth drag & drop:\n\n📝 Move lists:\n   • Grab a list header → drag left/right\n\n🃏 Move cards between lists:\n   • Grab a card → drag to another column\n\n🃏 Reorder cards:\n   • Drag a card up/down within its list\n\n✨ Watch for animations:\n   • Cards tilt and float when picked up\n   • Smooth spring transitions as items settle\n   • Visual placeholders show drop targets',
      side: 'right' as const,
      align: 'start' as const,
    },
  },

  // ── Step 21: Filter Panel ──
  {
    element: '[data-tour="board-filter"]',
    popover: {
      title: '🔎 Filter — Find the Right Cards',
      description:
        'Click "Filter" to open the filter panel:\n\n📝 Keyword — type to search card titles\n👥 Members — click to filter by assignee\n🏷️ Labels — filter by label color/name\n📅 Due Date — options:\n   • Overdue\n   • Due today\n   • Due this week\n   • Due this month\n✅ Status — complete or incomplete cards\n\n🔵 Active filter = blue highlight on button\nClick "Clear all" to reset filters.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },

  // ── Step 22: Card Description ──
  {
    element: '[data-tour="card-item"]',
    popover: {
      title: '📝 Card Description — Add Details',
      description:
        'How to add a description:\n1. Click a card to open it\n2. Click the gray "Add a more detailed description..." area\n3. Type your text in the editor\n4. Click "Save" to keep it\n5. Click "Cancel" to discard changes\n\nDescriptions support multi-line text — great for task details, requirements, notes, and context.',
      side: 'right' as const,
      align: 'center' as const,
    },
  },

  // ── Step 23: Multiple Boards ──
  {
    popover: {
      title: '📊 Multiple Boards',
      description:
        'KanFlow supports multiple boards for different projects!\n\nHow to manage boards:\n• Click the KanFlow logo to go home\n• Click "Create" in the navbar for a new board\n• Each board has its own lists, cards & background\n• Star ⭐ your favorites for quick access\n\nOrganize by project, team, or workflow.',
    },
  },

  // ── Step 24: Responsive Design ──
  {
    popover: {
      title: '📱 Responsive Design',
      description:
        'KanFlow adapts to all screen sizes:\n\n🖥️ Desktop — full layout with sidebar & all features\n💻 Tablet — optimized layout, swipe to scroll lists\n📱 Mobile — touch-friendly cards & compact views\n\nTry resizing your browser to see it adapt!\nAll drag & drop works on both mouse and touch.',
    },
  },

  // ── Step 25: Final ──
  {
    popover: {
      title: '🎉 You\'re a KanFlow Expert!',
      description:
        'Quick cheat sheet:\n\n• Click title → rename (board, list, or card)\n• Click card → open full details modal\n• Drag card → move between lists\n• Drag list header → reorder lists\n• ⭐ Star → favorite board\n• 🔎 Filter → narrow card view\n• 🧭 Compass → restart this tour\n• 📦 Archive → hide card\n• ✅ Checklist → track sub-tasks\n• 📎 Attach → upload files\n\nHappy organizing! 🚀',
    },
  },
];

export function useGuidedTour() {
  const startHomeTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      stagePadding: 8,
      stageRadius: 8,
      allowClose: true,
      overlayColor: 'black',
      popoverClass: 'driver-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done ✓',
      progressText: '{{current}} / {{total}}',
      steps: homeTourSteps,
    });
    driverObj.drive();
  }, []);

  const startBoardTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      stagePadding: 8,
      stageRadius: 8,
      allowClose: true,
      overlayColor: 'black',
      popoverClass: 'driver-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done ✓',
      progressText: '{{current}} / {{total}}',
      steps: boardTourSteps,
    });
    driverObj.drive();
  }, []);

  return { startHomeTour, startBoardTour };
}
