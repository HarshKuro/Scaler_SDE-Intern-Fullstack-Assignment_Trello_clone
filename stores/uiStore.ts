import { create } from 'zustand';

interface UiState {
  activeCardId: string | null;
  isFilterOpen: boolean;
  isMenuOpen: boolean;
  isSearchOpen: boolean;
  isCreateBoardOpen: boolean;
  setActiveCard: (id: string | null) => void;
  toggleFilter: () => void;
  toggleMenu: () => void;
  toggleSearch: () => void;
  toggleCreateBoard: () => void;
  closeAll: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeCardId: null,
  isFilterOpen: false,
  isMenuOpen: false,
  isSearchOpen: false,
  isCreateBoardOpen: false,

  setActiveCard: (id) => set({ activeCardId: id }),
  toggleFilter: () => set((s) => ({ isFilterOpen: !s.isFilterOpen })),
  toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  toggleCreateBoard: () => set((s) => ({ isCreateBoardOpen: !s.isCreateBoardOpen })),
  closeAll: () =>
    set({
      activeCardId: null,
      isFilterOpen: false,
      isMenuOpen: false,
      isSearchOpen: false,
      isCreateBoardOpen: false,
    }),
}));
