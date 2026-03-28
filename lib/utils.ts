import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcMidPosition(before: number | null, after: number | null): number {
  if (before === null && after === null) return 1000;
  if (before === null) return (after as number) / 2;
  if (after === null) return (before as number) + 1000;
  return ((before as number) + (after as number)) / 2;
}

export function renormalizePositions<T extends { id: string; position: number }>(
  items: T[]
): T[] {
  return items
    .sort((a, b) => a.position - b.position)
    .map((item, index) => ({ ...item, position: (index + 1) * 1000 }));
}

export function needsRenormalization<T extends { position: number }>(items: T[]): boolean {
  const sorted = [...items].sort((a, b) => a.position - b.position);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].position - sorted[i - 1].position < 0.001) {
      return true;
    }
  }
  return false;
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDueDateStatus(dueDate: string, isComplete: boolean): { status: string; className: string } {
  if (isComplete) return { status: 'complete', className: 'bg-green-600/30 text-green-400' };
  const due = new Date(dueDate);
  const now = new Date();
  const diffHours = (due.getTime() - now.getTime()) / 3600000;

  if (diffHours < 0) return { status: 'overdue', className: 'bg-red-600/30 text-red-400' };
  if (diffHours < 24) return { status: 'soon', className: 'bg-yellow-600/30 text-yellow-300' };
  return { status: 'future', className: 'text-trello-muted' };
}

export function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
  if (imageExts.includes(ext)) return '🖼️';
  if (videoExts.includes(ext)) return '🎥';
  if (ext === 'pdf') return '📑';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
  if (['doc', 'docx', 'txt', 'md'].includes(ext)) return '📝';
  return '📄';
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
