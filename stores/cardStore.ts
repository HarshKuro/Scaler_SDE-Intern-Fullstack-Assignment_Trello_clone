import { create } from 'zustand';
import api from '@/lib/api';
import type { Card } from '@/types';

interface CardState {
  cardsByList: Record<string, Card[]>;
  setCardsByList: (cardsByList: Record<string, Card[]>) => void;
  createCard: (data: { list_id: string; title: string; position: number }) => Promise<void>;
  updateCard: (id: string, data: Partial<Card>) => Promise<void>;
  deleteCard: (id: string, listId: string) => Promise<void>;
  moveCard: (cardId: string, listId: string, listCards: Card[], fromIndex: number, toIndex: number) => Promise<void>;
  reorderCards: (items: { id: string; position: number; list_id?: string }[]) => Promise<void>;
  getCard: (id: string) => Promise<Card>;
}

export const useCardStore = create<CardState>((set, get) => ({
  cardsByList: {},

  setCardsByList: (cardsByList) => set({ cardsByList }),

  createCard: async (data) => {
    const { data: res } = await api.post('/cards', data);
    const current = get().cardsByList[data.list_id] || [];
    set({
      cardsByList: {
        ...get().cardsByList,
        [data.list_id]: [...current, res.data].sort((a, b) => a.position - b.position),
      },
    });
  },

  updateCard: async (id, data) => {
    const { data: res } = await api.patch(`/cards/${id}`, data);
    const updated = res.data as Card;
    const cardsByList = { ...get().cardsByList };

    for (const listId of Object.keys(cardsByList)) {
      cardsByList[listId] = cardsByList[listId].map((c) =>
        c.id === id ? { ...c, ...updated } : c
      );
    }

    set({ cardsByList });
  },

  deleteCard: async (id, listId) => {
    await api.delete(`/cards/${id}`);
    const cardsByList = { ...get().cardsByList };
    cardsByList[listId] = (cardsByList[listId] || []).filter((c) => c.id !== id);
    set({ cardsByList });
  },

  moveCard: async (cardId, listId, listCards, fromIndex, toIndex) => {
    const newCards = [...listCards];
    const [moved] = newCards.splice(fromIndex, 1);
    newCards.splice(toIndex, 0, moved);

    // Assign new positions
    const items = newCards.map((c, i) => ({
      id: c.id,
      position: (i + 1) * 65536,
      list_id: listId,
    }));

    const cardsByList = { ...get().cardsByList };
    cardsByList[listId] = newCards.map((c, i) => ({ ...c, position: (i + 1) * 65536 }));
    set({ cardsByList });

    try {
      await api.patch('/cards/reorder', { items });
    } catch {
      // Silent — optimistic
    }
  },

  reorderCards: async (items) => {
    try {
      await api.patch('/cards/reorder', { items });
    } catch {
      // Silent fail — optimistic update already applied
    }
  },

  getCard: async (id) => {
    const { data: res } = await api.get(`/cards/${id}`);
    return res.data;
  },
}));
