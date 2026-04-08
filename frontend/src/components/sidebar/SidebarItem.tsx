import { useState } from 'react';
import { ChevronRight, FileText, Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useDocuments, useCreateDocument, useArchiveDocument } from '../../hooks/useDocuments';
import ConfirmDialog from '../ConfirmDialog';
import type { Document } from '../../types';

interface Props {
  document: Document;
  level: number;
}

export default function SidebarItem({ document, level }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { activeDocumentId, setActiveDocument } = useDocumentStore();
  const { data: documents = [] } = useDocuments();
  const createDocument = useCreateDocument();
  const archiveDocument = useArchiveDocument();

  // DnD sortable — only enabled for root level (level === 0)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: document.id, disabled: level > 0 });

  const style = level === 0
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }
    : {};

  const children = documents.filter((doc) => doc.parentDocumentId === document.id);
  const hasChildren = children.length > 0;
  const isActive = activeDocumentId === document.id;

  const handleCreate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDoc = await createDocument.mutateAsync(document.id);
    setActiveDocument(newDoc.id);
    setIsExpanded(true);
    toast.success('Đã tạo trang con mới');
  };

  const handleSelect = () => setActiveDocument(document.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const handleArchiveConfirm = () => {
    archiveDocument.mutate(document.id);
    if (activeDocumentId === document.id) setActiveDocument(null);
    toast.success(`Đã chuyển "${document.title || 'Untitled'}" vào thùng rác`);
    setShowConfirm(false);
  };

  const activeStyle: React.CSSProperties = { background: 'var(--bg-active)', color: 'var(--text-primary)' };
  const idleStyle: React.CSSProperties = { background: 'transparent', color: 'var(--text-secondary)' };

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <div
          className="group flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer text-sm select-none transition-all duration-100"
          style={{ paddingLeft: `${8 + level * 12}px`, ...(isActive ? activeStyle : idleStyle) }}
          onClick={handleSelect}
          onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
          onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
        >
          {/* Drag handle — only shown at root level */}
          {level === 0 && (
            <button
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-40 hover:opacity-100! transition-opacity cursor-grab active:cursor-grabbing"
              style={{ color: 'var(--text-muted)' }}
            >
              <GripVertical size={12} />
            </button>
          )}

          {/* Toggle expand */}
          <button
            onClick={handleToggle}
            className="shrink-0 w-4 h-4 flex items-center justify-center rounded transition-colors"
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-active)'; e.stopPropagation(); }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            {hasChildren ? (
              <ChevronRight size={12} className={`transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`} />
            ) : (
              <span className="w-3" />
            )}
          </button>

          {/* Icon + Title */}
          <span className="shrink-0 text-base leading-none">
            {document.icon ?? <FileText size={14} />}
          </span>
          <span className="flex-1 truncate">{document.title || 'Untitled'}</span>

          {/* Action buttons */}
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
            <button
              onClick={handleCreate}
              title="Tạo trang con"
              className="p-0.5 rounded transition-colors"
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-active)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Plus size={13} />
            </button>
            <button
              title="Xóa"
              className="p-0.5 rounded text-red-400 transition-colors hover:bg-red-500/20"
              onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {children.map((child) => (
              <SidebarItem key={child.id} document={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          title={`Chuyển "${document.title || 'Untitled'}" vào thùng rác?`}
          description="Trang con bên trong cũng sẽ bị ẩn. Bạn có thể khôi phục từ thùng rác."
          confirmLabel="Xóa trang"
          onConfirm={handleArchiveConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
