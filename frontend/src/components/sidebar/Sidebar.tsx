import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { setActiveDocument } = useDocumentStore();
  const { data: documents = [], isLoading } = useDocuments();
  const createDocument = useCreateDocument();
  const moveDocument = useMoveDocument();

  const [showTrash, setShowTrash] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const isOnSettings = location.pathname === '/settings';

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
        className="w-72 h-screen flex flex-col shrink-0 select-none"
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* ── Brand header ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-5">
          {/* Logo: N. Notion Mini */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* N. logomark */}
            <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <rect width="100" height="100" rx="18" fill="#f0ebe0"/>
              <path d="M22 76 L22 24 L34 24 L62 60 L62 24 L74 24 L74 76 L62 76 L34 40 L34 76 Z" fill="#1b4d35"/>
              <circle cx="69" cy="20" r="9" fill="#c0392b"/>
            </svg>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base font-semibold truncate leading-tight" style={{ color: 'var(--color-forest)' }}>
                Notion Mini
              </p>
              <p className="text-[10px] tracking-widest uppercase opacity-60 truncate" style={{ color: 'var(--text-secondary)' }}>
                {user?.name ?? user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* ── Search button ─────────────────────────────────────── */}
        <div className="px-3 mb-1">
          <button
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center gap-2.5 px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
              transition: 'background 0.12s ease, color 0.12s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-active)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Search size={13} />
            <span className="flex-1 text-left text-xs">Tìm kiếm trang...</span>
            <kbd className="text-[10px] rounded-full px-1.5 py-0.5 font-sans" style={{ background: 'var(--bg-active)', color: 'var(--text-muted)' }}>⌘K</kbd>
          </button>
        </div>

        {/* ── Section label ─────────────────────────────────────── */}
        <div className="px-5 pt-3 pb-1">
          <p className="text-[10px] tracking-[0.18em] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Trang của bạn</p>
        </div>

        {/* ── Document list with DnD ────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {isLoading ? (
            <SidebarSkeleton />
          ) : rootDocuments.length === 0 && !activeDragId ? (
            <div className="px-3 py-5 text-center">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Chưa có trang nào</p>
              <button
                onClick={handleCreateRoot}
                className="text-xs px-4 py-1.5 rounded-full font-medium transition-all"
                style={{ background: 'var(--color-forest)', color: 'var(--color-cream)', transition: 'opacity 0.15s ease' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
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
              <RootDropZone active={activeDragId !== null} />
              <DragOverlay dropAnimation={null}>
                {activeDragDoc && (
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm shadow-xl"
                    style={{
                      background: 'var(--bg-sidebar)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      maxWidth: '240px',
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

        {/* ── New page button ───────────────────────────────────── */}
        <div className="px-3 pb-3">
          <button
            onClick={handleCreateRoot}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold shadow-md transition-all"
            style={{
              background: 'var(--color-terracotta)',
              color: '#fff',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <FileText size={14} />
            Trang mới
          </button>
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="px-3 pb-4 pt-2 space-y-0.5 border-t" style={{ borderColor: 'var(--border)' }}>
          {[
            { icon: <Trash size={14} />, label: 'Thùng rác', onClick: () => setShowTrash(true), danger: false, active: false },
            { icon: <Settings size={14} />, label: 'Cài đặt', onClick: () => navigate('/settings'), danger: false, active: isOnSettings },
            { icon: <LogOut size={14} />, label: 'Đăng xuất', onClick: logout, danger: true, active: false },
          ].map(({ icon, label, onClick, danger, active }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: active ? 'var(--color-forest)' : 'transparent',
                color: active ? 'var(--color-cream)' : 'var(--text-secondary)',
                transition: 'background 0.12s ease, color 0.12s ease',
              }}
              onMouseEnter={e => {
                if (active) return;
                e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'var(--bg-hover)';
                e.currentTarget.style.color = danger ? '#ef4444' : 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                if (active) return;
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
    </>
  );
}
