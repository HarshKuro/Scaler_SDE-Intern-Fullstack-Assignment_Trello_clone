'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  CreditCard,
  AlignLeft,
  Clock,
  Trash2,
  Archive,
} from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useCardStore } from '@/stores/cardStore';
import { useListStore } from '@/stores/listStore';
import CardModalLabels from './CardModalLabels';
import CardMembers from './CardMembers';
import CardDueDate from './CardDueDate';
import CardChecklist from './CardChecklist';
import CardComments from './CardComments';
import CardAttachments from './CardAttachments';
import CardCover from './CardCover';
import Avatar from '@/components/ui/Avatar';
import { cn, getDueDateStatus, formatRelativeDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Card } from '@/types';

export default function CardModal() {
  const { activeCardId, setActiveCard } = useUiStore();
  const { getCard, updateCard, deleteCard } = useCardStore();
  const { lists } = useListStore();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const loadCard = useCallback(async () => {
    if (!activeCardId) return;
    setLoading(true);
    try {
      const data = await getCard(activeCardId);
      setCard(data);
      setTitle(data.title);
      setDescription(data.description ?? '');
    } catch {
      toast.error('Failed to load card');
      setActiveCard(null);
    } finally {
      setLoading(false);
    }
  }, [activeCardId, getCard, setActiveCard]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  const handleSaveTitle = async () => {
    setEditingTitle(false);
    if (!card || !title.trim() || title.trim() === card.title) {
      setTitle(card?.title ?? '');
      return;
    }
    try {
      await updateCard(card.id, { title: title.trim() });
      setCard((prev) => (prev ? { ...prev, title: title.trim() } : prev));
    } catch {
      setTitle(card.title);
      toast.error('Failed to update title');
    }
  };

  const handleSaveDescription = async () => {
    setEditingDesc(false);
    if (!card) return;
    const newDesc = description.trim() || null;
    if (newDesc === (card.description ?? null)) return;
    try {
      await updateCard(card.id, { description: newDesc });
      setCard((prev) => (prev ? { ...prev, description: newDesc } : prev));
    } catch {
      setDescription(card.description ?? '');
      toast.error('Failed to update description');
    }
  };

  const handleDelete = async () => {
    if (!card) return;
    const ok = confirm('Delete this card? This cannot be undone.');
    if (!ok) return;
    try {
      await deleteCard(card.id, card.list_id);
      setActiveCard(null);
      toast.success('Card deleted');
    } catch {
      toast.error('Failed to delete card');
    }
  };

  const handleArchive = async () => {
    if (!card) return;
    try {
      await updateCard(card.id, { is_archived: true });
      // Remove from the local list so it disappears from the board
      const { cardsByList, setCardsByList } = useCardStore.getState();
      const listCards = cardsByList[card.list_id] ?? [];
      setCardsByList({
        ...cardsByList,
        [card.list_id]: listCards.filter((c) => c.id !== card.id),
      });
      setActiveCard(null);
      toast.success('Card archived');
    } catch {
      toast.error('Failed to archive card');
    }
  };

  const listName = lists.find((l) => l.id === card?.list_id)?.title ?? '';
  const dueStatus = card?.due_date ? getDueDateStatus(card.due_date, card.is_complete) : null;

  return (
    <Dialog.Root
      open={!!activeCardId}
      onOpenChange={(open) => {
        if (!open) setActiveCard(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[768px] max-h-[90vh] overflow-y-auto bg-trello-surface rounded-xl shadow-2xl z-50">
          <Dialog.Title className="sr-only">{card?.title ?? 'Card details'}</Dialog.Title>
          {/* Cover */}
          {card?.cover_color && (
            <div
              className="h-[116px] rounded-t-xl relative"
              style={{ backgroundColor: card.cover_color }}
            >
              <Dialog.Close asChild>
                <button className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </Dialog.Close>
            </div>
          )}

          <div className="p-6">
            {/* Close button (no cover) */}
            {!card?.cover_color && (
              <Dialog.Close asChild>
                <button className="absolute top-3 right-3 p-1.5 rounded hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-trello-muted" />
                </button>
              </Dialog.Close>
            )}

            {loading || !card ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-7 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-24 bg-white/10 rounded" />
              </div>
            ) : (
              <div className="flex gap-4">
                {/* Main content */}
                <div className="flex-1 min-w-0 space-y-6">
                  {/* Title */}
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-trello-muted mt-1 shrink-0" />
                    <div className="flex-1">
                      {editingTitle ? (
                        <textarea
                          ref={titleRef}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          onBlur={handleSaveTitle}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveTitle();
                            }
                            if (e.key === 'Escape') {
                              setTitle(card.title);
                              setEditingTitle(false);
                            }
                          }}
                          rows={1}
                          autoFocus
                          className="w-full text-xl font-semibold text-trello-text bg-trello-card border-2 border-trello-blue rounded px-2 py-1 outline-none resize-none"
                        />
                      ) : (
                        <h2
                          onClick={() => setEditingTitle(true)}
                          className="text-xl font-semibold text-trello-text cursor-pointer hover:bg-white/5 rounded px-2 py-1 -mx-2"
                        >
                          {card.title}
                        </h2>
                      )}
                      <p className="text-sm text-trello-muted mt-1 px-2">
                        in list <span className="underline">{listName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Info row: labels, members, due date */}
                  <div className="flex flex-wrap gap-6 px-8">
                    {card.labels && card.labels.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-trello-muted mb-1">Labels</p>
                        <div className="flex flex-wrap gap-1">
                          {card.labels.map((label) => (
                            <span
                              key={label.id}
                              className="px-3 py-1 rounded text-xs font-semibold text-white"
                              style={{ backgroundColor: label.color }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {card.members && card.members.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-trello-muted mb-1">Members</p>
                        <div className="flex -space-x-1">
                          {card.members.map((m) => (
                            <Avatar
                              key={m.id}
                              initials={m.initials}
                              color={m.avatar_color}
                              size="md"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {dueStatus && (
                      <div>
                        <p className="text-xs font-semibold text-trello-muted mb-1">Due date</p>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-xs px-2 py-1 rounded',
                            dueStatus.className
                          )}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {formatRelativeDate(card.due_date!)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex items-start gap-3">
                    <AlignLeft className="w-5 h-5 text-trello-muted mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-trello-text mb-2">Description</h3>
                      {editingDesc ? (
                        <div>
                          <textarea
                            ref={descRef}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            autoFocus
                            rows={6}
                            placeholder="Add a more detailed description..."
                            className="w-full text-sm bg-trello-card border border-trello-border rounded-lg px-3 py-2 text-trello-text placeholder-trello-muted outline-none resize-y"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleSaveDescription}
                              className="px-4 py-1.5 bg-trello-blue hover:bg-blue-600 text-sm text-white font-semibold rounded transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setDescription(card.description ?? '');
                                setEditingDesc(false);
                              }}
                              className="px-3 py-1.5 hover:bg-white/10 text-sm text-trello-muted rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => setEditingDesc(true)}
                          className={cn(
                            'min-h-[56px] rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors',
                            card.description
                              ? 'text-trello-text hover:bg-white/5'
                              : 'bg-white/5 hover:bg-white/10 text-trello-muted'
                          )}
                        >
                          {card.description || 'Add a more detailed description...'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Checklists */}
                  {card.checklists && card.checklists.length > 0 && (
                    <CardChecklist
                      cardId={card.id}
                      checklists={card.checklists}
                      onUpdate={loadCard}
                    />
                  )}

                  {/* Attachments */}
                  {card.attachments && card.attachments.length > 0 && (
                    <CardAttachments
                      cardId={card.id}
                      attachments={card.attachments}
                      onUpdate={loadCard}
                    />
                  )}

                  {/* Comments */}
                  <CardComments cardId={card.id} />
                </div>

                {/* Sidebar */}
                <div className="w-[168px] shrink-0 space-y-2 hidden md:block">
                  <p className="text-xs font-semibold text-trello-muted">Add to card</p>

                  <CardMembers cardId={card.id} currentMembers={card.members ?? []} onUpdate={loadCard} />

                  <CardModalLabels
                    cardId={card.id}
                    boardId={card.board_id ?? ''}
                    currentLabels={card.labels ?? []}
                    onUpdate={loadCard}
                  />

                  <CardDueDate
                    cardId={card.id}
                    currentDate={card.due_date}
                    isComplete={card.is_complete}
                    onUpdate={loadCard}
                  />

                  <CardChecklist
                    cardId={card.id}
                    checklists={[]}
                    onUpdate={loadCard}
                    addOnly
                  />

                  <CardAttachments
                    cardId={card.id}
                    attachments={[]}
                    onUpdate={loadCard}
                    addOnly
                  />

                  <CardCover
                    cardId={card.id}
                    currentColor={card.cover_color}
                    onUpdate={loadCard}
                  />

                  <div className="pt-4 space-y-2">
                    <p className="text-xs font-semibold text-trello-muted">Actions</p>
                    <button
                      onClick={handleArchive}
                      className="flex items-center gap-2 w-full px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm text-trello-muted transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-1.5 rounded bg-white/5 hover:bg-red-500/20 text-sm text-trello-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
