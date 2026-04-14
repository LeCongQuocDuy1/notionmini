import { useEffect, useState } from 'react';
import { X, RotateCcw, Trash2, Leaf } from 'lucide-react';
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
      <div
        className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(27,48,34,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className="modal-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(159,64,45,0.12)' }}
              >
                <Trash2 size={14} style={{ color: 'var(--color-terracotta)' }} />
              </div>
              <div>
                <h2 className="font-serif text-base font-semibold" style={{ color: 'var(--color-forest)' }}>
                  Thùng rác
                </h2>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {archivedDocs.length > 0 ? `${archivedDocs.length} trang đã lưu trữ` : 'Trống'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn-icon w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Body ────────────────────────────────────────────── */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: 'var(--color-terracotta)', animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
              </div>
            ) : archivedDocs.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--bg-hover)' }}
                >
                  <Leaf size={22} style={{ color: 'var(--text-muted)' }} />
                </div>
                <p className="font-serif text-base italic" style={{ color: 'var(--text-secondary)' }}>
                  Thùng rác trống
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Các trang đã lưu trữ sẽ xuất hiện ở đây
                </p>
              </div>
            ) : (
              <ul className="p-3 space-y-1">
                {archivedDocs.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{ transition: 'background 0.12s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="text-xl shrink-0">{doc.icon ?? '📄'}</span>
                    <span className="flex-1 text-sm truncate font-medium" style={{ color: 'var(--text-primary)' }}>
                      {doc.title || 'Untitled'}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleRestore(doc)}
                        title="Khôi phục"
                        disabled={restoreDocument.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{
                          background: 'rgba(27,48,34,0.08)',
                          color: 'var(--color-forest)',
                          transition: 'background 0.12s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(27,48,34,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(27,48,34,0.08)'}
                      >
                        <RotateCcw size={12} />
                        Khôi phục
                      </button>
                      <button
                        onClick={() => setConfirmDelete(doc)}
                        title="Xóa vĩnh viễn"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Footer ──────────────────────────────────────────── */}
          <div
            className="px-6 py-3 border-t text-[10px] uppercase tracking-widest font-bold"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
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
