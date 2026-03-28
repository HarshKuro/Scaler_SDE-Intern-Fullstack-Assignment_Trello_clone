import { create } from 'zustand';

interface FilterState {
  keyword: string;
  members: string[];
  labels: string[];
  dueDate: 'none' | 'overdue' | 'day' | 'week' | 'month' | null;
  cardStatus: 'complete' | 'incomplete' | null;
  isActive: boolean;
  setKeyword: (keyword: string) => void;
  toggleMember: (memberId: string) => void;
  toggleLabel: (labelId: string) => void;
  setDueDate: (dueDate: FilterState['dueDate']) => void;
  setCardStatus: (status: FilterState['cardStatus']) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  keyword: '',
  members: [],
  labels: [],
  dueDate: null,
  cardStatus: null,
  isActive: false,

  setKeyword: (keyword) => {
    set({ keyword });
    updateIsActive(set, get);
  },

  toggleMember: (memberId) => {
    const members = get().members.includes(memberId)
      ? get().members.filter((m) => m !== memberId)
      : [...get().members, memberId];
    set({ members });
    updateIsActive(set, get);
  },

  toggleLabel: (labelId) => {
    const labels = get().labels.includes(labelId)
      ? get().labels.filter((l) => l !== labelId)
      : [...get().labels, labelId];
    set({ labels });
    updateIsActive(set, get);
  },

  setDueDate: (dueDate) => {
    set({ dueDate });
    updateIsActive(set, get);
  },

  setCardStatus: (cardStatus) => {
    set({ cardStatus });
    updateIsActive(set, get);
  },

  clearFilters: () => {
    set({
      keyword: '',
      members: [],
      labels: [],
      dueDate: null,
      cardStatus: null,
      isActive: false,
    });
  },
}));

function updateIsActive(
  set: (state: Partial<FilterState>) => void,
  get: () => FilterState
) {
  const state = get();
  const active =
    state.keyword !== '' ||
    state.members.length > 0 ||
    state.labels.length > 0 ||
    state.dueDate !== null ||
    state.cardStatus !== null;
  set({ isActive: active });
}
