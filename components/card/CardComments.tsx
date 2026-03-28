'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { useMemberStore } from '@/stores/memberStore';
import { formatRelativeDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Comment } from '@/types';

interface CardCommentsProps {
  cardId: string;
}

export default function CardComments({ cardId }: CardCommentsProps) {
  const { currentMember } = useMemberStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    api.get(`/cards/${cardId}/comments`).then((res) => {
      setComments(res.data.data ?? res.data);
    }).catch(() => { /* silent */ });
  }, [cardId]);

  const handleAdd = async () => {
    if (!text.trim() || !currentMember) return;
    try {
      const res = await api.post(`/cards/${cardId}/comments`, {
        member_id: currentMember.id,
        text: text.trim(),
      });
      const comment = res.data.data ?? res.data;
      setComments((prev) => [comment, ...prev]);
      setText('');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editText.trim()) return;
    try {
      await api.patch(`/comments/${id}`, { text: editText.trim() });
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, text: editText.trim() } : c))
      );
      setEditingId(null);
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-trello-muted shrink-0" />
        <h3 className="text-base font-semibold text-trello-text">Activity</h3>
      </div>

      {/* Add comment */}
      <div className="flex gap-3 pl-8">
        {currentMember && (
          <Avatar
            initials={currentMember.initials}
            color={currentMember.avatar_color}
            size="md"
            className="shrink-0 mt-0.5"
          />
        )}
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="w-full text-sm bg-trello-card border border-trello-border rounded-lg px-3 py-2 text-trello-text placeholder-trello-muted outline-none resize-none focus:border-trello-blue"
          />
          {text.trim() && (
            <button
              onClick={handleAdd}
              className="mt-1 px-4 py-1.5 bg-trello-blue hover:bg-blue-600 text-sm text-white font-semibold rounded transition-colors"
            >
              Save
            </button>
          )}
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-3 pl-8">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar
              initials={comment.member?.initials ?? '??'}
              color={comment.member?.avatar_color ?? '#666'}
              size="md"
              className="shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-trello-text">
                  {comment.member?.full_name ?? 'Unknown'}
                </span>
                <span className="text-xs text-trello-muted">
                  {formatRelativeDate(comment.created_at)}
                </span>
              </div>

              {editingId === comment.id ? (
                <div className="mt-1">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                    rows={2}
                    className="w-full text-sm bg-trello-card border border-trello-border rounded px-3 py-1.5 text-trello-text outline-none resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleUpdate(comment.id);
                      }
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => handleUpdate(comment.id)}
                      className="px-3 py-1 bg-trello-blue text-sm text-white font-semibold rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 text-sm text-trello-muted hover:bg-white/10 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-trello-text bg-trello-card rounded-lg px-3 py-2 mt-1">
                  {comment.text}
                </p>
              )}

              {!editingId && comment.member_id === currentMember?.id && (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditText(comment.text);
                    }}
                    className="text-xs text-trello-muted hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-trello-muted hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
