'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Paperclip, CheckSquare, Clock, AlignLeft } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import CardLabels from './CardLabels';
import Avatar from '@/components/ui/Avatar';
import { cn, getDueDateStatus, formatRelativeDate } from '@/lib/utils';
import type { Card } from '@/types';

interface CardItemProps {
  card: Card;
  listId: string;
}

export default function CardItem({ card, listId }: CardItemProps) {
  const { setActiveCard } = useUiStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', card, listId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
  };

  const dueStatus = card.due_date ? getDueDateStatus(card.due_date, card.is_complete) : null;

  const checklistTotal = card.checklists?.reduce((sum, cl) => sum + (cl.items?.length ?? 0), 0) ?? 0;
  const checklistDone = card.checklists?.reduce(
    (sum, cl) => sum + (cl.items?.filter((i) => i.is_checked).length ?? 0),
    0
  ) ?? 0;
  const hasChecklist = checklistTotal > 0;

  const commentCount = card.comments?.length ?? card.comment_count ?? 0;
  const attachmentCount = card.attachments?.length ?? card.attachment_count ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setActiveCard(card.id)}
      data-tour="card-item"
      className={cn(
        'group bg-trello-card hover:outline hover:outline-2 hover:outline-trello-blue rounded-lg shadow-sm cursor-pointer mb-1.5 mx-0.5 card-sortable',
        isDragging && 'card-dragging'
      )}
    >
      {/* Cover image */}
      {card.cover_color && (
        <div
          className="h-8 rounded-t-lg"
          style={{ backgroundColor: card.cover_color }}
        />
      )}

      <div className="p-2 space-y-1.5">
        {/* Labels */}
        <CardLabels labels={card.labels} />

        {/* Title */}
        <p className="text-sm text-trello-text leading-5">{card.title}</p>

        {/* Footer badges */}
        {(dueStatus || card.description || hasChecklist || commentCount > 0 || attachmentCount > 0 || (card.members && card.members.length > 0)) && (
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Due date */}
              {dueStatus && (
                <span
                  className={cn(
                    'flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded',
                    dueStatus.className
                  )}
                >
                  <Clock className="w-3 h-3" />
                  {formatRelativeDate(card.due_date!)}
                </span>
              )}

              {/* Description */}
              {card.description && (
                <AlignLeft className="w-3.5 h-3.5 text-trello-muted" />
              )}

              {/* Comments */}
              {commentCount > 0 && (
                <span className="flex items-center gap-0.5 text-trello-muted">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{commentCount}</span>
                </span>
              )}

              {/* Attachments */}
              {attachmentCount > 0 && (
                <span className="flex items-center gap-0.5 text-trello-muted">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{attachmentCount}</span>
                </span>
              )}

              {/* Checklist */}
              {hasChecklist && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-[11px]',
                    checklistDone === checklistTotal
                      ? 'text-green-500'
                      : 'text-trello-muted'
                  )}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  {checklistDone}/{checklistTotal}
                </span>
              )}
            </div>

            {/* Member avatars */}
            {card.members && card.members.length > 0 && (
              <div className="flex -space-x-1">
                {card.members.slice(0, 3).map((m) => (
                  <Avatar
                    key={m.id}
                    initials={m.initials}
                    color={m.avatar_color}
                    size="sm"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
