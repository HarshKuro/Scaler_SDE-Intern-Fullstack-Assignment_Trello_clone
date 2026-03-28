import { create } from 'zustand';
import api from '@/lib/api';
import type { Member } from '@/types';

interface MemberState {
  members: Member[];
  currentMember: Member | null;
  fetchMembers: () => Promise<void>;
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  currentMember: null,

  fetchMembers: async () => {
    if (get().members.length > 0) return;
    try {
      const { data: res } = await api.get('/members');
      const members = res.data as Member[];
      // Default: first member (HG — Harsh Gupta)
      const current = members.find((m) => m.initials === 'HG') || members[0] || null;
      set({ members, currentMember: current });
    } catch {
      // silent
    }
  },
}));
