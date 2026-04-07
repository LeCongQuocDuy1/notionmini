import { useState } from 'react';
import { ChevronRight, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '../../stores/useDocumentStore';
import type { Document } from '../../types';

interface Props {
  document: Document;
  level: number;
}

export default function SidebarItem({ document, level }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getChildren, createDocument, setActiveDocument, archiveDocument, activeDocumentId } =
    useDocumentStore();

  const children = getChildren(document.id);
  const hasChildren = children.length > 0;
  const isActive = activeDocumentId === document.id;

  const handleCreate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDoc = await createDocument(document.id);
    setActiveDocument(newDoc.id);
    setIsExpanded(true);
    toast.success('Đã tạo trang con mới');
  };

  const handleSelect = () => setActiveDocument(document.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    archiveDocument(document.id);
    toast.success(`Đã chuyển "${document.title || 'Untitled'}" vào thùng rác`);
  };

  const activeStyle: React.CSSProperties = {
    background: 'var(--bg-active)',
    color: 'var(--text-primary)',
  };
  const idleStyle: React.CSSProperties = {
    background: 'transparent',
    color: 'var(--text-secondary)',
  };

  return (
    <div>
      <div
        className="group flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer text-sm select-none transition-all duration-100"
        style={{ paddingLeft: `${8 + level * 12}px`, ...(isActive ? activeStyle : idleStyle) }}
        onClick={handleSelect}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
      >
        {/* Toggle expand */}
        <button
          onClick={handleToggle}
          className="shrink-0 w-4 h-4 flex items-center justify-center rounded transition-colors"
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-active)'; e.stopPropagation(); }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          {hasChildren ? (
            <ChevronRight
              size={12}
              className={`transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
            />
          ) : (
            <span className="w-3" />
          )}
        </button>

        {/* Icon + Title */}
        <span className="shrink-0 text-base leading-none">
          {document.icon ?? <FileText size={14} />}
        </span>
        <span className="flex-1 truncate">{document.title || 'Untitled'}</span>

        {/* Action buttons - visible on hover */}
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
            className="p-0.5 rounded text-red-400 transition-colors hover:bg-red-500/80"
            onClick={handleArchive}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Children - recursive */}
      {isExpanded && hasChildren && (
        <div>
          {children.map((child) => (
            <SidebarItem key={child.id} document={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
