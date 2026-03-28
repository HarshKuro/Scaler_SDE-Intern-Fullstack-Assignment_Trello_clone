'use client';

import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Clock, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { useCardStore } from '@/stores/cardStore';
import toast from 'react-hot-toast';
import 'react-day-picker/style.css';

interface CardDueDateProps {
  cardId: string;
  currentDate?: string | null;
  isComplete?: boolean;
  onUpdate: () => void;
}

export default function CardDueDate({ cardId, currentDate, onUpdate }: CardDueDateProps) {
  const { updateCard } = useCardStore();
  const [selected, setSelected] = useState<Date | undefined>(
    currentDate ? new Date(currentDate) : undefined
  );

  const handleSave = async () => {
    try {
      await updateCard(cardId, {
        due_date: selected ? selected.toISOString() : null,
      });
      onUpdate();
      toast.success('Due date updated');
    } catch {
      toast.error('Failed to update due date');
    }
  };

  const handleRemove = async () => {
    try {
      await updateCard(cardId, { due_date: null });
      setSelected(undefined);
      onUpdate();
      toast.success('Due date removed');
    } catch {
      toast.error('Failed to remove due date');
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-2 w-full px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm text-trello-muted transition-colors">
          <Clock className="w-4 h-4" />
          Dates
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-auto bg-trello-surface rounded-lg shadow-xl border border-trello-border z-[60] p-4"
          sideOffset={4}
          align="start"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-trello-text">Dates</span>
            <Popover.Close asChild>
              <button className="p-1 rounded hover:bg-white/10">
                <X className="w-4 h-4 text-trello-muted" />
              </button>
            </Popover.Close>
          </div>

          <div className="rdp-trello">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={setSelected}
              defaultMonth={selected ?? new Date()}
            />
          </div>

          <div className="flex gap-2 mt-3">
            <Popover.Close asChild>
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-1.5 bg-trello-blue hover:bg-blue-600 text-sm text-white font-semibold rounded transition-colors"
              >
                Save
              </button>
            </Popover.Close>
            {currentDate && (
              <Popover.Close asChild>
                <button
                  onClick={handleRemove}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-sm text-trello-muted rounded transition-colors"
                >
                  Remove
                </button>
              </Popover.Close>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
