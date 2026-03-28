'use client';

import { useMemo } from 'react';
import { BarChart3, CheckSquare, Clock, AlertTriangle, Tag, Users, ListTodo } from 'lucide-react';
import { useListStore } from '@/stores/listStore';
import { useCardStore } from '@/stores/cardStore';
import { cn } from '@/lib/utils';
import type { Card } from '@/types';

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-trello-surface rounded-xl border border-trello-border p-4 flex items-start gap-3">
      <div className={cn('p-2 rounded-lg', color)}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-trello-text-bright">{value}</div>
        <div className="text-xs text-trello-text-secondary mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function BarItem({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-trello-text w-28 truncate" title={label}>{label}</span>
      <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm text-trello-text-secondary w-8 text-right">{count}</span>
    </div>
  );
}

export default function DashboardView() {
  const { lists } = useListStore();
  const { cardsByList } = useCardStore();

  const allCards = useMemo(() => {
    const cards: Card[] = [];
    lists.forEach((list) => {
      (cardsByList[list.id] ?? []).forEach((card) => cards.push(card));
    });
    return cards;
  }, [lists, cardsByList]);

  const stats = useMemo(() => {
    const now = new Date();
    const total = allCards.length;
    const complete = allCards.filter((c) => c.is_complete).length;
    const overdue = allCards.filter((c) => c.due_date && !c.is_complete && new Date(c.due_date) < now).length;
    const dueSoon = allCards.filter((c) => {
      if (!c.due_date || c.is_complete) return false;
      const d = new Date(c.due_date);
      const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 3;
    }).length;
    const noDue = allCards.filter((c) => !c.due_date).length;
    const withLabels = allCards.filter((c) => (c.labels?.length ?? 0) > 0).length;
    const withMembers = allCards.filter((c) => (c.members?.length ?? 0) > 0).length;

    return { total, complete, overdue, dueSoon, noDue, withLabels, withMembers };
  }, [allCards]);

  const cardsPerList = useMemo(() => {
    return lists.map((list) => ({
      label: list.title,
      count: (cardsByList[list.id] ?? []).length,
    }));
  }, [lists, cardsByList]);

  // Label distribution
  const labelCounts = useMemo(() => {
    const map = new Map<string, { name: string; color: string; count: number }>();
    allCards.forEach((card) => {
      (card.labels ?? []).forEach((label) => {
        const existing = map.get(label.id);
        if (existing) {
          existing.count++;
        } else {
          map.set(label.id, { name: label.name || label.color, color: label.color, count: 1 });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [allCards]);

  // Member workload
  const memberCounts = useMemo(() => {
    const map = new Map<string, { name: string; color: string; initials: string; count: number }>();
    allCards.forEach((card) => {
      (card.members ?? []).forEach((m) => {
        const existing = map.get(m.id);
        if (existing) {
          existing.count++;
        } else {
          map.set(m.id, { name: m.full_name, color: m.avatar_color, initials: m.initials, count: 1 });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [allCards]);

  const completionPct = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<ListTodo className="w-5 h-5 text-blue-400" />}
          label="Total cards"
          value={stats.total}
          color="bg-blue-500/20"
        />
        <StatCard
          icon={<CheckSquare className="w-5 h-5 text-green-400" />}
          label="Completed"
          value={`${stats.complete} (${completionPct}%)`}
          color="bg-green-500/20"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
          label="Overdue"
          value={stats.overdue}
          color="bg-red-500/20"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-yellow-400" />}
          label="Due soon (3 days)"
          value={stats.dueSoon}
          color="bg-yellow-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cards per list */}
        <div className="bg-trello-surface rounded-xl border border-trello-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-trello-text-secondary" />
            <h3 className="text-sm font-semibold text-trello-text-bright">Cards per list</h3>
          </div>
          <div className="space-y-3">
            {cardsPerList.map((item, i) => (
              <BarItem
                key={i}
                label={item.label}
                count={item.count}
                total={stats.total}
                color="bg-trello-blue"
              />
            ))}
          </div>
        </div>

        {/* Completion ring */}
        <div className="bg-trello-surface rounded-xl border border-trello-border p-4 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
              <circle
                cx="64" cy="64" r="56"
                stroke="#22c55e"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${completionPct * 3.52} ${352 - completionPct * 3.52}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-trello-text-bright">{completionPct}%</span>
            </div>
          </div>
          <p className="text-sm text-trello-text-secondary">Board completion</p>
          <p className="text-xs text-trello-text-subtle mt-1">
            {stats.complete} of {stats.total} cards done
          </p>
        </div>

        {/* Labels distribution */}
        <div className="bg-trello-surface rounded-xl border border-trello-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-trello-text-secondary" />
            <h3 className="text-sm font-semibold text-trello-text-bright">Labels</h3>
          </div>
          {labelCounts.length === 0 ? (
            <p className="text-sm text-trello-text-subtle text-center py-4">No labels assigned</p>
          ) : (
            <div className="space-y-2">
              {labelCounts.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-trello-text flex-1 truncate">{item.name}</span>
                  <span className="text-sm text-trello-text-secondary font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Member workload */}
        <div className="bg-trello-surface rounded-xl border border-trello-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-trello-text-secondary" />
            <h3 className="text-sm font-semibold text-trello-text-bright">Member workload</h3>
          </div>
          {memberCounts.length === 0 ? (
            <p className="text-sm text-trello-text-subtle text-center py-4">No members assigned</p>
          ) : (
            <div className="space-y-3">
              {memberCounts.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.initials}
                  </div>
                  <BarItem
                    label={m.name}
                    count={m.count}
                    total={stats.total}
                    color="bg-purple-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
