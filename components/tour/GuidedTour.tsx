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
        'This is your main navigation. Access all your boards, recently viewed boards, starred boards, and quickly create new boards with the Create button.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="logo"]',
    popover: {
      title: '🏠 KanFlow Home',
      description:
        'Click the KanFlow logo anytime to return to the home dashboard where you can see all your boards.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="create-btn"]',
    popover: {
      title: '➕ Create a Board',
      description:
        'Click here to create a new board. Choose a title and pick a background color or gradient to personalize it.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="search"]',
    popover: {
      title: '🔍 Search Cards',
      description:
        'Search across all your cards instantly. Results appear as you type with a smart debounce for performance.',
      side: 'bottom' as const,
      align: 'end' as const,
    },
  },
  {
    element: '[data-tour="sidebar"]',
    popover: {
      title: '📋 Sidebar',
      description:
        'Your workspace sidebar shows all boards with color previews. Starred boards appear at the top for quick access.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="board-list"]',
    popover: {
      title: '🎯 Your Boards',
      description:
        'All your boards are displayed here as cards. Click any board to open it. Hover to see the star toggle for marking favorites.',
      side: 'top' as const,
      align: 'center' as const,
    },
  },
];

const boardTourSteps = [
  {
    element: '[data-tour="board-header"]',
    popover: {
      title: '📌 Board Header',
      description:
        'Your board title, star toggle, filters, and member list live here. Click the title to rename the board inline.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="board-star"]',
    popover: {
      title: '⭐ Star Board',
      description:
        'Star your favorite boards so they appear at the top of your sidebar and home dashboard for quick access.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="board-filter"]',
    popover: {
      title: '🔎 Filter Cards',
      description:
        'Open the filter panel to search cards by keyword, filter by team member, or filter by due date status (overdue, due today, this week).',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="board-menu"]',
    popover: {
      title: '⚙️ Board Menu',
      description:
        'Access board settings — change the background color/gradient, view board info, or close the board.',
      side: 'bottom' as const,
      align: 'end' as const,
    },
  },
  {
    element: '[data-tour="list-column"]',
    popover: {
      title: '📝 Lists',
      description:
        'Lists organize your cards into stages (e.g., To Do → In Progress → Done). Drag the list header to reorder lists horizontally.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="list-header"]',
    popover: {
      title: '✏️ List Title',
      description:
        'Click the list title to rename it. Use the ··· menu to delete the list or manage settings.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="card-item"]',
    popover: {
      title: '🃏 Cards',
      description:
        'Cards represent tasks or items. They show labels, due dates, checklists, comments, and member avatars. Drag cards between lists to update their status.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="add-card"]',
    popover: {
      title: '➕ Add a Card',
      description:
        'Click here to add a new card to this list. Type a title and press Enter or click Add to create it.',
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="add-list"]',
    popover: {
      title: '📋 Add Another List',
      description:
        'Create more lists to build your workflow. Common setups include "To Do → In Progress → Review → Done".',
      side: 'left' as const,
      align: 'start' as const,
    },
  },
  {
    popover: {
      title: '🎉 You\'re All Set!',
      description:
        'Try dragging cards between lists, clicking a card to see its full details (description, labels, checklists, due dates, comments, and attachments), or use the filter panel to find specific cards. Happy organizing!',
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
