import { useEffect, useState } from 'react';
import { Plus, Trash, LogOut, Search } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDocumentStore } from '../../stores/useDocumentStore';
import SidebarItem from './SidebarItem';
import TrashModal from '../TrashModal';
import SearchModal from '../SearchModal';

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
  };

  return (
    <>
      <aside className="w-60 h-screen bg-[#111111] border-r border-neutral-800 flex flex-col shrink-0 select-none">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-neutral-800">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center shrink-0">
            <span className="text-black font-bold text-xs">N</span>
          </div>
          <span className="text-white text-sm font-medium truncate flex-1">
            {user?.name ?? user?.email}
          </span>
        </div>

        {/* Search button */}
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-2 mx-2 mt-2 px-2 py-1.5 rounded-md text-neutral-500 hover:bg-neutral-800 hover:text-white text-sm transition-colors"
        >
          <Search size={14} />
          <span className="flex-1 text-left">Tìm kiếm</span>
          <kbd className="text-xs bg-neutral-800 border border-neutral-700 rounded px-1">⌘K</kbd>
        </button>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto py-2 px-1 mt-1">
          {isLoading ? (
            <p className="text-neutral-600 text-xs px-3 py-2">Đang tải...</p>
          ) : rootDocuments.length === 0 ? (
            <p className="text-neutral-600 text-xs px-3 py-2">Chưa có trang nào</p>
          ) : (
            rootDocuments.map((doc) => (
              <SidebarItem key={doc.id} document={doc} level={0} />
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-neutral-800 p-2 space-y-0.5">
          <button
            onClick={handleCreateRoot}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white text-sm transition-colors"
          >
            <Plus size={15} />
            <span>Trang mới</span>
          </button>
          <button
            onClick={() => setShowTrash(true)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white text-sm transition-colors"
          >
            <Trash size={15} />
            <span>Thùng rác</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white text-sm transition-colors"
          >
            <LogOut size={15} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {showTrash && <TrashModal onClose={() => setShowTrash(false)} />}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
}
