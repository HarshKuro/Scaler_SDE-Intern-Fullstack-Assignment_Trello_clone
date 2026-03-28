'use client';

import { cn } from '@/lib/utils';
import type { Card } from '@/types';

interface CardLabelsProps {
  labels: Card['labels'];
  expanded?: boolean;
}

export default function CardLabels({ labels, expanded = false }: CardLabelsProps) {
  if (!labels || labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label) => (
        <span
          key={label.id}
          className={cn(
            'rounded-sm font-semibold',
            expanded
              ? 'text-xs px-2 py-0.5'
              : 'w-10 h-2'
          )}
          style={{ backgroundColor: label.color }}
          title={label.name}
        >
          {expanded && (
            <span className="text-[11px] text-white drop-shadow-sm">{label.name}</span>
          )}
        </span>
      ))}
    </div>
  );
}
