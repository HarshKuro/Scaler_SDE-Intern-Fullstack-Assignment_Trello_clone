'use client';

import { cn } from '@/lib/utils';

interface AvatarProps {
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

export default function Avatar({ initials, color, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white shrink-0 select-none',
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: color }}
      title={initials}
    >
      {initials}
    </div>
  );
}
