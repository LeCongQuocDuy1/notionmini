import { useEffect, useState } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { documentKey } from '../../hooks/useDocuments';
import type { Tag, DocumentDetail } from '../../types';

interface Props {
  document: DocumentDetail;
  documentId: string;
}

export default function TaggingPanel({ document, documentId }: Props) {
  const queryClient = useQueryClient();
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    api.get<Tag[]>('/tags').then(({ data }) => setAllTags(data));
  }, []);

  const attachedTagIds = new Set(document.tags.map((t) => t.tag.id));

  const handleAttach = async (tagId: string) => {
    const { data } = await api.post<DocumentDetail>(`/documents/${documentId}/tags`, { tagId });
    queryClient.setQueryData<DocumentDetail>(documentKey(documentId), data);
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
      const { data: tag } = await api.post<Tag>('/tags', { name: newTagName.trim() });
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
      {/* Attached tags row */}
      <div className="flex items-center gap-2 flex-wrap">
        {document.tags.map(({ tag }) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 text-xs bg-neutral-800 text-neutral-300 border border-neutral-700 rounded-full px-2.5 py-0.5"
          >
            {tag.name}
            <button
              onClick={() => handleDetach(tag.id)}
              className="hover:text-white transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {/* Toggle dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <TagIcon size={12} />
            <span>Thêm tag</span>
          </button>

          {isOpen && (
            <div className="absolute left-0 top-6 z-20 w-52 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl p-2">
              {/* Create new tag */}
              <form onSubmit={handleCreateTag} className="flex gap-1 mb-2">
                <input
                  autoFocus
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tạo tag mới..."
                  className="flex-1 bg-neutral-900 text-white text-xs rounded px-2 py-1 outline-none border border-neutral-700 focus:border-neutral-500 placeholder-neutral-600"
                />
                <button
                  type="submit"
                  disabled={isCreating}
                  className="p-1 rounded bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
                >
                  <Plus size={12} />
                </button>
              </form>

              {/* Available tags */}
              {unattachedTags.length === 0 ? (
                <p className="text-xs text-neutral-600 text-center py-1">Không có tag nào</p>
              ) : (
                <div className="space-y-0.5 max-h-40 overflow-y-auto">
                  {unattachedTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => { handleAttach(tag.id); setIsOpen(false); }}
                      className="w-full text-left text-xs text-neutral-300 hover:bg-neutral-700 rounded px-2 py-1 transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
