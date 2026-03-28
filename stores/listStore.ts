import { create } from 'zustand';
import api from '@/lib/api';
import type { List } from '@/types';

interface ListState {
  lists: List[];
  setLists: (lists: List[]) => void;
  createList: (data: { board_id: string; title: string; position: number }) => Promise<void>;
  updateList: (id: string, data: Partial<List>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  reorderLists: (boardId: string, currentLists: List[], oldIndex: number, newIndex: number) => Promise<void>;
}

export const useListStore = create<ListState>((set, get) => ({
  lists: [],

  setLists: (lists) => set({ lists: lists.sort((a, b) => a.position - b.position) }),

  createList: async (data) => {
    const { data: res } = await api.post('/lists', data);
    set({ lists: [...get().lists, res.data].sort((a, b) => a.position - b.position) });
  },

  updateList: async (id, data) => {
    const { data: res } = await api.patch(`/lists/${id}`, data);
    set({
      lists: get().lists.map((l) => (l.id === id ? { ...l, ...res.data } : l)),
    });
  },

  deleteList: async (id) => {
    await api.delete(`/lists/${id}`);
    set({ lists: get().lists.filter((l) => l.id !== id) });
  },

  reorderLists: async (boardId, currentLists, oldIndex, newIndex) => {
    const newLists = [...currentLists];
    const [moved] = newLists.splice(oldIndex, 1);
    newLists.splice(newIndex, 0, moved);

    const items = newLists.map((l, i) => ({
      id: l.id,
      position: (i + 1) * 65536,
    }));

    set({ lists: newLists.map((l, i) => ({ ...l, position: (i + 1) * 65536 })) });

    try {
      await api.patch('/lists/reorder', { items });
    } catch {
      // Silent — optimistic
    }
  },
}));
