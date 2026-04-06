import { useState } from 'react';
import { ChevronRight, FileText, Plus, Trash2 } from 'lucide-react';
import { useDocumentStore } from '../../stores/useDocumentStore';
import type { Document } from '../../types';

interface Props {
  document: Document;
  level: number; // độ sâu trong cây, dùng để tính padding
}

export default function SidebarItem({ document, level }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getChildren, createDocument, setActiveDocument, activeDocumentId } =
    useDocumentStore();

  const children = getChildren(document.id);
  const hasChildren = children.length > 0;
  const isActive = activeDocumentId === document.id;

  const handleCreate = async (e: React.MouseEvent) => {
    e.stopPropagation(); // không trigger click vào item
    const newDoc = await createDocument(document.id);
    setActiveDocument(newDoc.id);
    setIsExpanded(true); // mở rộng để thấy doc con mới
  };

  const handleSelect = () => {
    setActiveDocument(document.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div>
      {/* Item row */}
      <div
        className={`group flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer text-sm select-none transition-colors ${
          isActive
            ? 'bg-neutral-700 text-white'
            : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
        }`}
        style={{ paddingLeft: `${8 + level * 12}px` }}
        onClick={handleSelect}
      >
        {/* Toggle expand button */}
        <button
          onClick={handleToggle}
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-neutral-600 transition-colors"
        >
          {hasChildren ? (
            <ChevronRight
              size={12}
              className={`transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
            />
          ) : (
            <span className="w-3" /> // spacer khi không có con
          )}
        </button>

        {/* Icon + Title */}
        <span className="flex-shrink-0 text-base leading-none">
          {document.icon ?? <FileText size={14} />}
        </span>
        <span className="flex-1 truncate">{document.title || 'Untitled'}</span>

        {/* Action buttons - chỉ hiện khi hover */}
        <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={handleCreate}
            title="Tạo trang con"
            className="p-0.5 rounded hover:bg-neutral-600 transition-colors"
          >
            <Plus size={13} />
          </button>
          <button
            title="Xóa"
            className="p-0.5 rounded hover:bg-neutral-600 transition-colors"
            onClick={(e) => e.stopPropagation()} // Phase 7 sẽ xử lý
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Children - đệ quy */}
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
