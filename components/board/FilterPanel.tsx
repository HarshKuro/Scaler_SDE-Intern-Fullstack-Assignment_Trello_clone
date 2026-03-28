'use client';

import { X, Clock, Users } from 'lucide-react';
import { useFilterStore } from '@/stores/filterStore';
import { useUiStore } from '@/stores/uiStore';
import { useMemberStore } from '@/stores/memberStore';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

const DUE_OPTIONS: { value: 'overdue' | 'day' | 'week' | 'month' | 'none'; label: string }[] = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'day', label: 'Due in the next day' },
  { value: 'week', label: 'Due in the next week' },
  { value: 'month', label: 'Due in the next month' },
  { value: 'none', label: 'No due date' },
];

export default function FilterPanel() {
  const { isFilterOpen, toggleFilter } = useUiStore();
  const {
    keyword,
    members: filteredMembers,
    dueDate,
    setKeyword,
    toggleMember,
    setDueDate,
    clearFilters,
    isActive,
  } = useFilterStore();
  const { members } = useMemberStore();

  if (!isFilterOpen) return null;

  return (
    <div className="fixed right-0 top-[52px] bottom-0 w-[340px] bg-trello-surface border-l border-trello-border z-40 flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-trello-border">
        <h2 className="text-base font-semibold text-trello-text">Filter</h2>
        <button
          onClick={toggleFilter}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-trello-muted" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Keyword */}
        <div>
          <label className="text-xs font-semibold text-trello-muted mb-1.5 block">Keyword</label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter a keyword..."
            className="w-full text-sm bg-trello-card border border-trello-border rounded px-3 py-2 text-trello-text placeholder-trello-muted outline-none focus:border-trello-blue"
          />
        </div>

        {/* Members */}
        <div>
          <label className="text-xs font-semibold text-trello-muted mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Members
          </label>
          <div className="space-y-1">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => toggleMember(member.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-2 py-1.5 rounded transition-colors',
                  filteredMembers.includes(member.id)
                    ? 'bg-trello-blue/20'
                    : 'hover:bg-white/10'
                )}
              >
                <Avatar initials={member.initials} color={member.avatar_color} size="sm" />
                <span className="text-sm text-trello-text">{member.full_name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-xs font-semibold text-trello-muted mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Due date
          </label>
          <div className="space-y-1">
            {DUE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDueDate(dueDate === opt.value ? null : opt.value)}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-sm rounded transition-colors',
                  dueDate === opt.value
                    ? 'bg-trello-blue/20 text-trello-text'
                    : 'text-trello-muted hover:bg-white/10'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      {isActive && (
        <div className="p-4 border-t border-trello-border">
          <button
            onClick={clearFilters}
            className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-sm text-trello-muted rounded transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
