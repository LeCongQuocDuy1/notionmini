import { useState, useEffect } from 'react';
import { Settings, Trash, LogOut, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, type DragEndEvent, type DragStartEvent,
  pointerWithin,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useDocuments, useCreateDocument, useMoveDocument } from '../../hooks/useDocuments';
import SidebarItem from './SidebarItem';
import TrashModal from '../TrashModal';
import SearchModal from '../SearchModal';
import SettingsModal from '../SettingsModal';
import { SidebarSkeleton } from '../SkeletonLoader';
import type { Document } from '../../types';

// Helper: is candidateId a descendant of ancestorId?
function isDescendantOf(docs: Document[], ancestorId: string, candidateId: string): boolean {
  const children = docs.filter((d) => d.parentDocumentId === ancestorId);
  for (const child of children) {
    if (child.id === candidateId) return true;
    if (isDescendantOf(docs, child.id, candidateId)) return true;
  }
  return false;
}

// Root drop zone — the empty area below all items
function RootDropZone({ active }: { active: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: '__root__', disabled: !active });
  return (
    <div
      ref={setNodeRef}
      className={`h-10 rounded-md mx-1 mt-1 transition-colors border-2 border-dashed ${
        active
          ? isOver
            ? 'border-blue-400 bg-blue-400/10'
            : 'border-(--border) opacity-60'
          : 'border-transparent'
      }`}
    >
      {active && (
        <p className="text-xs text-center pt-2" style={{ color: 'var(--text-muted)' }}>
          Thả vào đây để chuyển lên root
        </p>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { setActiveDocument } = useDocumentStore();
  const { data: documents = [], isLoading } = useDocuments();
  const createDocument = useCreateDocument();
  const moveDocument = useMoveDocument();

  const [showTrash, setShowTrash] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const rootDocuments = documents.filter((doc) => doc.parentDocumentId === null && !doc.isArchived);
  const activeDragDoc = activeDragId ? documents.find((d) => d.id === activeDragId) : null;

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

  // Listen for "move-to-root" custom event dispatched by SidebarItem
  useEffect(() => {
    const handler = (e: Event) => {
      const docId = (e as CustomEvent<string>).detail;
      moveDocument.mutate({ id: docId, parentDocumentId: null });
      toast.success('Đã chuyển lên root');
    };
    window.addEventListener('move-to-root', handler);
    return () => window.removeEventListener('move-to-root', handler);
  }, [moveDocument]);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 6 },
  }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const draggedId = active.id as string;
    const overId = over.id as string;

    if (overId === '__root__') {
      // Move to root
      const doc = documents.find((d) => d.id === draggedId);
      if (doc && doc.parentDocumentId !== null) {
        moveDocument.mutate({ id: draggedId, parentDocumentId: null });
        toast.success('Đã chuyển lên root');
      }
      return;
    }

    if (overId === draggedId) return;

    // Prevent dropping into own descendant
    if (isDescendantOf(documents, draggedId, overId)) {
      toast.error('Không thể di chuyển vào trang con của nó');
      return;
    }

    const draggedDoc = documents.find((d) => d.id === draggedId);
    if (draggedDoc?.parentDocumentId === overId) return; // already a child

    moveDocument.mutate({ id: draggedId, parentDocumentId: overId });
    toast.success('Đã di chuyển trang');
  };

  const handleDragCancel = () => setActiveDragId(null);

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
          className="sidebar-item flex items-center gap-2 mx-2 mt-2 px-2 py-1.5 rounded-md text-sm"
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          style={btnBase}
        >
          <Search size={14} />
          <span className="flex-1 text-left">Tìm kiếm</span>
          <kbd className="text-xs rounded px-1 border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)' }}>⌘K</kbd>
        </button>

        {/* Document list with DnD */}
        <div className="flex-1 overflow-y-auto py-2 px-1 mt-1">
          {isLoading ? (
            <SidebarSkeleton />
          ) : rootDocuments.length === 0 && !activeDragId ? (
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
            <DndContext
              sensors={sensors}
              collisionDetection={pointerWithin}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              {rootDocuments.map((doc) => (
                <SidebarItem key={doc.id} document={doc} level={0} activeDragId={activeDragId} />
              ))}

              {/* Drop zone to move back to root */}
              <RootDropZone active={activeDragId !== null} />

              {/* Drag ghost overlay */}
              <DragOverlay dropAnimation={null}>
                {activeDragDoc && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm shadow-xl border"
                    style={{
                      background: 'var(--bg-surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      maxWidth: '220px',
                    }}
                  >
                    <span className="shrink-0">{activeDragDoc.icon ?? <FileText size={14} />}</span>
                    <span className="truncate">{activeDragDoc.title || 'Untitled'}</span>
                  </div>
                )}
              </DragOverlay>
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
