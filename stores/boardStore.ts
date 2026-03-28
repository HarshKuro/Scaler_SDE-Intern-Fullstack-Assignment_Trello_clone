import { create } from 'zustand';
import api from '@/lib/api';
import type { Board } from '@/types';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  fetchBoards: () => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createBoard: (data: { title: string; background?: string }) => Promise<Board>;
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  loading: false,

  fetchBoards: async () => {
    set({ loading: true });
    try {
      const { data: res } = await api.get('/boards');
      set({ boards: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchBoard: async (id: string) => {
    set({ loading: true });
    try {
      const { data: res } = await api.get(`/boards/${id}`);
      set({ currentBoard: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createBoard: async (data) => {
    const { data: res } = await api.post('/boards', data);
    set({ boards: [res.data, ...get().boards] });
    return res.data;
  },

  updateBoard: async (id, data) => {
    const { data: res } = await api.patch(`/boards/${id}`, data);
    set({
      boards: get().boards.map((b) => (b.id === id ? { ...b, ...res.data } : b)),
      currentBoard: get().currentBoard?.id === id ? { ...get().currentBoard!, ...res.data } : get().currentBoard,
    });
  },

  deleteBoard: async (id) => {
    await api.delete(`/boards/${id}`);
    set({ boards: get().boards.filter((b) => b.id !== id) });
  },
}));
