import { useEffect, useRef, useState } from 'react';
import { X, Plus, Tag as TagIcon, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { documentKey } from '../../hooks/useDocuments';
import type { Tag, DocumentDetail } from '../../types';

interface Props {
  document: DocumentDetail;
  documentId: string;
}

const TAG_COLORS = [
  { name: 'Đỏ', value: '#ef4444' },
  { name: 'Cam', value: '#f97316' },
  { name: 'Vàng', value: '#eab308' },
  { name: 'Xanh lá', value: '#22c55e' },
  { name: 'Xanh dương', value: '#3b82f6' },
  { name: 'Tím', value: '#8b5cf6' },
  { name: 'Hồng', value: '#ec4899' },
  { name: 'Xám', value: '#6b7280' },
];

export default function TaggingPanel({ document, documentId }: Props) {
  const queryClient = useQueryClient();
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[4].value);
  const [isCreating, setIsCreating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<Tag[]>('/tags').then(({ data }) => setAllTags(data));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const attachedTagIds = new Set(document.tags.map((t) => t.tag.id));

  const handleAttach = async (tagId: string) => {
    const { data } = await api.post<DocumentDetail>(`/documents/${documentId}/tags`, { tagId });
    queryClient.setQueryData<DocumentDetail>(documentKey(documentId), data);
    setIsOpen(false);
  };

  const handleDetach = async (tagId: string) => {
    await api.delete(`/documents/${documentId}/tags/${tagId}`);
    queryClient.setQueryData<DocumentDetail>(documentKey(documentId), {
      ...document,
      tags: document.tags.filter((t) => t.tag.id !== tagId),
    });
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsCreating(true);
    try {
      const { data: tag } = await api.post<Tag>('/tags', {
        name: newTagName.trim(),
        color: newTagColor,
      });
      setAllTags((prev) => [...prev, tag]);
      setNewTagName('');
      await handleAttach(tag.id);
    } finally {
      setIsCreating(false);
    }
  };

  const unattachedTags = allTags.filter((t) => !attachedTagIds.has(t.id));

  return (
    <div className="px-16 pb-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Attached tags */}
        {document.tags.map(({ tag }) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 font-medium"
            style={{
              background: `${tag.color}22`,
              color: tag.color,
              border: `1px solid ${tag.color}44`,
            }}
          >
            {tag.name}
            <button
              onClick={() => handleDetach(tag.id)}
              className="hover:opacity-70 transition-opacity ml-0.5"
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {/* Dropdown trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <TagIcon size={12} />
            <span>Thêm tag</span>
          </button>

          {isOpen && (
            <div
              className="absolute left-0 top-6 z-20 w-60 rounded-lg shadow-xl border overflow-hidden"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              {/* Create new tag */}
              <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <form onSubmit={handleCreateTag} className="flex flex-col gap-2">
                  <input
                    autoFocus
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tên tag mới..."
                    className="w-full text-xs rounded px-2 py-1.5 outline-none border"
                    style={{
                      background: 'var(--bg-app)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {/* Color picker */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {TAG_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setNewTagColor(c.value)}
                        className="w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                        style={{ background: c.value }}
                        title={c.name}
                      >
                        {newTagColor === c.value && <Check size={10} className="text-white" />}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={isCreating || !newTagName.trim()}
                    className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-40"
                    style={{ background: newTagColor, color: '#fff' }}
                  >
                    <Plus size={11} /> Tạo tag
                  </button>
                </form>
              </div>

              {/* Existing unattached tags */}
              {unattachedTags.length > 0 && (
                <div className="p-1 max-h-36 overflow-y-auto">
                  <p className="text-xs px-2 py-1" style={{ color: 'var(--text-muted)' }}>Tag có sẵn</p>
                  {unattachedTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAttach(tag.id)}
                      className="w-full flex items-center gap-2 text-left text-xs px-2 py-1.5 rounded transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: tag.color }}
                      />
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}

              {unattachedTags.length === 0 && (
                <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>
                  Tất cả tag đã được gắn
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
