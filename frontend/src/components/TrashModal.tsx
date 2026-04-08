import { useEffect, useState } from 'react';
import { X, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useArchivedDocuments, useRestoreDocument, useDeletePermanently } from '../hooks/useDocuments';
import ConfirmDialog from './ConfirmDialog';
import type { Document } from '../types';

interface Props {
  onClose: () => void;
}

export default function TrashModal({ onClose }: Props) {
  const { data: archivedDocs = [], isLoading } = useArchivedDocuments();
  const restoreDocument = useRestoreDocument();
  const deletePermanently = useDeletePermanently();
  const [confirmDelete, setConfirmDelete] = useState<Document | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleRestore = async (doc: Document) => {
    await restoreDocument.mutateAsync(doc.id);
    toast.success(`Đã khôi phục "${doc.title || 'Untitled'}"`);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    await deletePermanently.mutateAsync(confirmDelete.id);
    toast.success(`Đã xóa vĩnh viễn "${confirmDelete.title || 'Untitled'}"`);
    setConfirmDelete(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
        <div
          className="border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              <Trash2 size={15} />
              Thùng rác
            </div>
            <button
              onClick={onClose}
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-sm py-8 animate-pulse" style={{ color: 'var(--text-muted)' }}>
                Đang tải...
              </p>
            ) : archivedDocs.length === 0 ? (
              <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
                Thùng rác trống
              </p>
            ) : (
              <ul>
                {archivedDocs.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 px-4 py-3 border-b transition-colors"
                    style={{ borderColor: 'var(--border-soft)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="text-lg shrink-0">{doc.icon ?? '📄'}</span>
                    <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {doc.title || 'Untitled'}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleRestore(doc)}
                        title="Khôi phục"
                        className="p-1.5 rounded text-green-500 hover:bg-green-400/10 transition-colors"
                        disabled={restoreDocument.isPending}
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(doc)}
                        title="Xóa vĩnh viễn"
                        className="p-1.5 rounded text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-2 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            Esc để đóng
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title={`Xóa vĩnh viễn "${confirmDelete.title || 'Untitled'}"?`}
          description="Hành động này không thể hoàn tác. Trang sẽ bị xóa hoàn toàn khỏi hệ thống."
          confirmLabel="Xóa vĩnh viễn"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
