import { useCallback, useState } from 'react';
import { ChevronRight, FileText, Plus, Trash2, GripVertical, CornerLeftUp } from 'lucide-react';
import { toast } from 'sonner';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useDocuments, useCreateDocument, useArchiveDocument } from '../../hooks/useDocuments';
import ConfirmDialog from '../ConfirmDialog';
import type { Document } from '../../types';

interface Props {
  document: Document;
  level: number;
  activeDragId: string | null;
}

export default function SidebarItem({ document, level, activeDragId }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { activeDocumentId, setActiveDocument } = useDocumentStore();
  const { data: documents = [] } = useDocuments();
  const createDocument = useCreateDocument();
  const archiveDocument = useArchiveDocument();

  // Drag — always enabled for all levels
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({ id: document.id });

  // Drop — disabled when this item is being dragged
  const {
    setNodeRef: setDroppableRef,
    isOver,
  } = useDroppable({ id: document.id, disabled: activeDragId === document.id });

  // Combine refs
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      setDraggableRef(node);
      setDroppableRef(node);
    },
    [setDraggableRef, setDroppableRef],
  );

  const children = documents.filter((doc) => doc.parentDocumentId === document.id);
  const hasChildren = children.length > 0;
  const isActive = activeDocumentId === document.id;
  const isBeingDragged = activeDragId === document.id;

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

  const rowClasses = [
    'sidebar-item',
    'group flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer text-sm select-none',
    isActive ? 'is-active' : '',
    isOver && !isBeingDragged ? 'is-drop-over' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div
        ref={setRef}
        style={{ opacity: isDragging ? 0.3 : 1 }}
      >
        <div
          className={rowClasses}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={handleSelect}
        >
          {/* Drag handle — all levels */}
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            style={{ color: 'var(--text-muted)' }}
          >
            <GripVertical size={12} />
          </button>

          {/* Toggle expand */}
          <button
            onClick={handleToggle}
            className="shrink-0 w-4 h-4 flex items-center justify-center rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10"
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

          {/* Action buttons — opacity transition (no layout shift) */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={handleCreate}
              title="Tạo trang con"
              className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10"
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
            {/* Move to root — only shown for nested items */}
            {level > 0 && (
              <button
                title="Chuyển lên root"
                className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                onClick={(e) => { e.stopPropagation(); /* handled by Sidebar via context */ (e.currentTarget as HTMLButtonElement).dispatchEvent(new CustomEvent('move-to-root', { detail: document.id, bubbles: true })); }}
              >
                <CornerLeftUp size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Children — hide subtree of active drag to prevent DnD confusion */}
        {isExpanded && hasChildren && !isBeingDragged && (
          <div>
            {children.map((child) => (
              <SidebarItem key={child.id} document={child} level={level + 1} activeDragId={activeDragId} />
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
