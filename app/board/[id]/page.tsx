'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBoardStore } from '@/stores/boardStore';
import { useListStore } from '@/stores/listStore';
import { useCardStore } from '@/stores/cardStore';
import { useMemberStore } from '@/stores/memberStore';
import BoardHeader from '@/components/board/BoardHeader';
import ListColumn from '@/components/list/ListColumn';
import AddListButton from '@/components/list/AddListButton';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, type DragStartEvent, type DragEndEvent, type DragOverEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { Card } from '@/types';
import CardModal from '@/components/card/CardModal';
import FilterPanel from '@/components/board/FilterPanel';
import BoardMenuDrawer from '@/components/board/BoardMenuDrawer';
import toast from 'react-hot-toast';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;

  const { currentBoard, fetchBoard, loading: boardLoading } = useBoardStore();
  const { lists, setLists, reorderLists } = useListStore();
  const { cardsByList, setCardsByList, moveCard } = useCardStore();
  const { members, fetchMembers } = useMemberStore();

  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (!boardId) return;
    fetchBoard(boardId).catch(() => {
      toast.error('Board not found');
      router.push('/');
    });
    fetchMembers();
  }, [boardId, fetchBoard, fetchMembers, router]);

  useEffect(() => {
    if (currentBoard) {
      const boardLists = (currentBoard.lists ?? []).sort(
        (a, b) => a.position - b.position
      );
      setLists(boardLists);

      const cardsMap: Record<string, Card[]> = {};
      boardLists.forEach((list) => {
        cardsMap[list.id] = (list.cards ?? []).sort(
          (a, b) => a.position - b.position
        );
      });
      setCardsByList(cardsMap);
    }
  }, [currentBoard, setLists, setCardsByList]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;

    if (type === 'card') {
      setActiveCard(active.data.current?.card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType !== 'card') return;

    const activeListId = active.data.current?.listId;
    const overListId = overType === 'card' ? over.data.current?.listId : over.id;

    if (activeListId === overListId) return;

    // Move card between lists during drag
    const activeCards = [...(cardsByList[activeListId] ?? [])];
    const overCards = [...(cardsByList[overListId] ?? [])];

    const activeIndex = activeCards.findIndex((c) => c.id === active.id);
    if (activeIndex === -1) return;

    const [movedCard] = activeCards.splice(activeIndex, 1);
    const overIndex = overType === 'card'
      ? overCards.findIndex((c) => c.id === over.id)
      : overCards.length;

    overCards.splice(overIndex, 0, { ...movedCard, list_id: overListId });

    setCardsByList({
      ...cardsByList,
      [activeListId]: activeCards,
      [overListId]: overCards,
    });

    // Update data ref so subsequent drag events know the new list
    active.data.current = { ...active.data.current, listId: overListId };
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;

    if (activeType === 'list') {
      const oldIndex = lists.findIndex((l) => l.id === active.id);
      const newIndex = lists.findIndex((l) => l.id === over.id);
      if (oldIndex !== newIndex) {
        await reorderLists(boardId, lists, oldIndex, newIndex);
      }
    } else if (activeType === 'card') {
      const listId = active.data.current?.listId;
      const listCards = cardsByList[listId] ?? [];
      const cardIndex = listCards.findIndex((c) => c.id === active.id);
      const overIndex = over.data.current?.type === 'card'
        ? listCards.findIndex((c) => c.id === over.id)
        : listCards.length - 1;

      if (cardIndex !== overIndex) {
        await moveCard(active.id as string, listId, listCards, cardIndex, overIndex);
      }
    }
  };

  if (boardLoading || !currentBoard) {
    return (
      <div
        className="h-screen flex flex-col"
        style={{ background: '#1d2125' }}
      >
        {/* Skeleton header */}
        <div className="h-[52px] bg-black/30 flex items-center px-4 gap-4">
          <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
          <div className="flex-1" />
          <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
        </div>
        {/* Skeleton lists */}
        <div className="flex-1 flex gap-3 p-3 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[272px] h-[300px] bg-white/5 rounded-xl animate-pulse shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  const isGradient = currentBoard.background.startsWith('linear-gradient');
  const bgStyle: React.CSSProperties = isGradient
    ? { background: currentBoard.background }
    : { backgroundColor: currentBoard.background };

  return (
    <div className="h-screen flex flex-col" style={bgStyle}>
      <BoardHeader board={currentBoard} members={members} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3 p-3 h-full items-start">
            <SortableContext
              items={lists.map((l) => l.id)}
              strategy={horizontalListSortingStrategy}
            >
              {lists.map((list) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  cards={cardsByList[list.id] ?? []}
                  boardId={boardId}
                />
              ))}
            </SortableContext>

            <AddListButton boardId={boardId} listsCount={lists.length} />
          </div>
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="bg-trello-card rounded-lg p-2 shadow-xl opacity-90 w-[248px] rotate-3">
              <p className="text-sm text-trello-text">{activeCard.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CardModal />
      <FilterPanel />
      <BoardMenuDrawer board={currentBoard} />
    </div>
  );
}
