'use client';

import { useRef } from 'react';
import { Paperclip, ExternalLink } from 'lucide-react';
import { formatRelativeDate, formatFileSize, getFileIcon } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Attachment } from '@/types';

interface CardAttachmentsProps {
  cardId: string;
  attachments: Attachment[];
  onUpdate: () => void;
  addOnly?: boolean;
}

export default function CardAttachments({ cardId, attachments, onUpdate, addOnly }: CardAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/attachments/cards/${cardId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUpdate();
      toast.success('Attachment added');
    } catch {
      toast.error('Failed to upload attachment');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/attachments/attachments/${id}`);
      onUpdate();
    } catch {
      toast.error('Failed to delete attachment');
    }
  };

  // Sidebar add-only button
  if (addOnly) {
    return (
      <>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm text-trello-muted transition-colors"
        >
          <Paperclip className="w-4 h-4" />
          Attachment
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleUpload}
        />
      </>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Paperclip className="w-5 h-5 text-trello-muted shrink-0" />
        <h3 className="text-base font-semibold text-trello-text flex-1">Attachments</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 text-trello-muted rounded transition-colors"
        >
          Add
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      <div className="pl-8 space-y-2">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="flex items-center gap-3 p-2 rounded hover:bg-white/5 group"
          >
            <div className="w-[112px] h-[80px] bg-white/10 rounded flex items-center justify-center text-2xl shrink-0">
              {att.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={att.url}
                  alt={att.file_name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <span>{getFileIcon(att.file_name)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-trello-text truncate">
                {att.file_name}
              </p>
              <p className="text-xs text-trello-muted">
                Added {formatRelativeDate(att.created_at)}
                {att.file_size ? ` • ${formatFileSize(att.file_size)}` : ''}
              </p>
              <div className="flex gap-2 mt-1">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-trello-muted hover:underline inline-flex items-center gap-0.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
                <button
                  onClick={() => handleDelete(att.id)}
                  className="text-xs text-trello-muted hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
