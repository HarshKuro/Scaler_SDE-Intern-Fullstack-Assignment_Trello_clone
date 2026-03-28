'use client';

import { cn } from '@/lib/utils';

const TRELLO_COLORS = [
  '#61bd4f', '#f2d600', '#ff9f1a', '#eb5a46',
  '#c377e0', '#0079bf', '#00c2e0', '#51e898',
  '#ff78cb', '#344563', '#b3bac5', '#026aa7',
  '#4d4d4d', '#519839',
];

interface ColorPickerProps {
  selected: string | null;
  onSelect: (color: string) => void;
  className?: string;
}

export default function ColorPicker({ selected, onSelect, className }: ColorPickerProps) {
  return (
    <div className={cn('grid grid-cols-7 gap-1', className)}>
      {TRELLO_COLORS.map((color) => (
        <button
          key={color}
          className={cn(
            'w-8 h-8 rounded cursor-pointer transition-transform hover:scale-110',
            selected === color && 'ring-2 ring-white ring-offset-2 ring-offset-trello-card'
          )}
          style={{ backgroundColor: color }}
          onClick={() => onSelect(color)}
          type="button"
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
}

export { TRELLO_COLORS };
