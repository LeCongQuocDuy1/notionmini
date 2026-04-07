import { useEffect, useState } from 'react';
import { Plus, Trash, LogOut, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDocumentStore } from '../../stores/useDocumentStore';
import SidebarItem from './SidebarItem';
import TrashModal from '../TrashModal';
import SearchModal from '../SearchModal';
import { SidebarSkeleton } from '../SkeletonLoader';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { documents, isLoading, fetchDocuments, createDocument, setActiveDocument } =
    useDocumentStore();
  const [showTrash, setShowTrash] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Cmd+K / Ctrl+K global shortcut
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

  const rootDocuments = documents.filter((doc) => doc.parentDocumentId === null);

  const handleCreateRoot = async () => {
    const newDoc = await createDocument();
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
        <div
          className="flex items-center gap-2 px-3 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
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
          className="flex items-center gap-2 mx-2 mt-2 px-2 py-1.5 rounded-md text-sm transition-colors group"
          style={btnBase}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Search size={14} />
          <span className="flex-1 text-left">Tìm kiếm</span>
          <kbd
            className="text-xs rounded px-1 border"
            style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)' }}
          >⌘K</kbd>
        </button>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto py-2 px-1 mt-1">
          {isLoading ? (
            <SidebarSkeleton />
          ) : rootDocuments.length === 0 ? (
            <p className="text-xs px-3 py-2" style={{ color: 'var(--text-muted)' }}>
              Chưa có trang nào
            </p>
          ) : (
            rootDocuments.map((doc) => (
              <SidebarItem key={doc.id} document={doc} level={0} />
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t p-2 space-y-0.5" style={{ borderColor: 'var(--border)' }}>
          {[
            { icon: <Plus size={15} />, label: 'Trang mới', onClick: handleCreateRoot, danger: false },
            { icon: <Trash size={15} />, label: 'Thùng rác', onClick: () => setShowTrash(true), danger: false },
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
    </>
  );
}
