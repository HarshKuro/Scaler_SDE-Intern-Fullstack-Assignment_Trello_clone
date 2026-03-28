'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import ListHeader from './ListHeader';
import AddCardButton from './AddCardButton';
import CardItem from '@/components/card/CardItem';
import type { List, Card } from '@/types';

interface ListColumnProps {
  list: List;
  cards: Card[];
  boardId?: string;
}

export default function ListColumn({ list, cards }: ListColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: { type: 'list', list },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: list.id,
    data: { type: 'list' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className="w-[272px] shrink-0 flex flex-col bg-trello-list rounded-xl max-h-[calc(100vh-120px)]"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <ListHeader listId={list.id} title={list.title} cardCount={cards.length} />
      </div>

      <div
        ref={setDroppableRef}
        className="flex-1 overflow-y-auto px-1 pb-1 min-h-[4px] custom-scrollbar"
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <CardItem key={card.id} card={card} listId={list.id} />
          ))}
        </SortableContext>
      </div>

      <div className="px-1 pb-2">
        <AddCardButton listId={list.id} cardCount={cards.length} />
      </div>
    </div>
  );
}
