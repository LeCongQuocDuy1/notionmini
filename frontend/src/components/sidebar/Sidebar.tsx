import { useState, useEffect } from 'react';
import { Settings, Trash, LogOut, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useDocuments, useCreateDocument } from '../../hooks/useDocuments';
import SidebarItem from './SidebarItem';
import TrashModal from '../TrashModal';
import SearchModal from '../SearchModal';
import SettingsModal from '../SettingsModal';
import { SidebarSkeleton } from '../SkeletonLoader';
import type { Document } from '../../types';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { setActiveDocument } = useDocumentStore();
  const { data: documents = [], isLoading } = useDocuments();
  const createDocument = useCreateDocument();

  const [showTrash, setShowTrash] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Local ordered IDs for drag & drop (client-side only)
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  const rootDocuments = documents.filter((doc) => doc.parentDocumentId === null);

  // Sync orderedIds when documents change (new or deleted)
  useEffect(() => {
    const currentIds = rootDocuments.map((d) => d.id);
    setOrderedIds((prev) => {
      const prevSet = new Set(prev);
      const currentSet = new Set(currentIds);
      // Keep existing order for docs still present, append new ones
      const kept = prev.filter((id) => currentSet.has(id));
      const added = currentIds.filter((id) => !prevSet.has(id));
      return [...kept, ...added];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents.length]);

  // Sorted root documents according to local order
  const sortedRoots = orderedIds
    .map((id) => rootDocuments.find((d) => d.id === id))
    .filter(Boolean) as Document[];

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 6 },
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedIds((ids) => {
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      return arrayMove(ids, oldIndex, newIndex);
    });
  };

  const handleCreateRoot = async () => {
    const newDoc = await createDocument.mutateAsync(undefined);
    setActiveDocument(newDoc.id);
    toast.success('Đã tạo trang mới');
  };

  const btnBase: React.CSSProperties = { color: 'var(--text-secondary)' };

  return (
    <>
      <aside
        className="w-60 h-screen flex flex-col shrink-0 select-none border-r"
        style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-black font-bold text-xs">N</span>
          </div>
          <span className="text-sm font-medium truncate flex-1" style={{ color: 'var(--text-primary)' }}>
            {user?.name ?? user?.email}
          </span>
        </div>

        {/* Search button */}
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-2 mx-2 mt-2 px-2 py-1.5 rounded-md text-sm transition-colors"
          style={btnBase}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Search size={14} />
          <span className="flex-1 text-left">Tìm kiếm</span>
          <kbd className="text-xs rounded px-1 border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)' }}>⌘K</kbd>
        </button>

        {/* Document list with DnD */}
        <div className="flex-1 overflow-y-auto py-2 px-1 mt-1">
          {isLoading ? (
            <SidebarSkeleton />
          ) : sortedRoots.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa có trang nào</p>
              <button
                onClick={handleCreateRoot}
                className="mt-2 text-xs px-3 py-1.5 rounded-md transition-colors"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
              >
                + Tạo trang đầu tiên
              </button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
                {sortedRoots.map((doc) => (
                  <SidebarItem key={doc.id} document={doc} level={0} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-2 space-y-0.5" style={{ borderColor: 'var(--border)' }}>
          {[
            { icon: <Trash size={15} />, label: 'Thùng rác', onClick: () => setShowTrash(true), danger: false },
            { icon: <Settings size={15} />, label: 'Cài đặt', onClick: () => setShowSettings(true), danger: false },
            { icon: <LogOut size={15} />, label: 'Đăng xuất', onClick: logout, danger: true },
          ].map(({ icon, label, onClick, danger }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors"
              style={btnBase}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = danger ? '#f87171' : 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </aside>

      {showTrash && <TrashModal onClose={() => setShowTrash(false)} />}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
