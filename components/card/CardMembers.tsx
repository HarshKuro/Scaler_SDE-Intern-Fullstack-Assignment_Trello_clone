'use client';

import { useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Users, X, Check } from 'lucide-react';
import { useMemberStore } from '@/stores/memberStore';
import Avatar from '@/components/ui/Avatar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Member } from '@/types';

interface CardMembersProps {
  cardId: string;
  currentMembers: Member[];
  onUpdate: () => void;
}

export default function CardMembers({ cardId, currentMembers, onUpdate }: CardMembersProps) {
  const { members, fetchMembers } = useMemberStore();

  useEffect(() => {
    if (members.length === 0) fetchMembers();
  }, [members.length, fetchMembers]);

  const isAssigned = (id: string) => currentMembers.some((m) => m.id === id);

  const toggleMember = async (member: Member) => {
    try {
      if (isAssigned(member.id)) {
        await api.delete(`/members/${member.id}/cards/${cardId}`);
      } else {
        await api.post(`/members/${member.id}/cards/${cardId}`);
      }
      onUpdate();
    } catch {
      toast.error('Failed to update members');
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-2 w-full px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm text-trello-muted transition-colors">
          <Users className="w-4 h-4" />
          Members
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-[304px] bg-trello-surface rounded-lg shadow-xl border border-trello-border z-[60]"
          sideOffset={4}
          align="start"
        >
          <div className="flex items-center justify-between p-3 border-b border-trello-border">
            <span className="text-sm font-semibold text-trello-text">Members</span>
            <Popover.Close asChild>
              <button className="p-1 rounded hover:bg-white/10">
                <X className="w-4 h-4 text-trello-muted" />
              </button>
            </Popover.Close>
          </div>
          <div className="p-2 space-y-0.5">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => toggleMember(member)}
                className="flex items-center gap-3 w-full px-2 py-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <Avatar initials={member.initials} color={member.avatar_color} size="md" />
                <span className="text-sm text-trello-text flex-1 text-left">
                  {member.full_name}
                </span>
                {isAssigned(member.id) && (
                  <Check className="w-4 h-4 text-trello-blue" />
                )}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
