import { useEffect } from 'react';
import { Plus, Trash, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDocumentStore } from '../../stores/useDocumentStore';
import SidebarItem from './SidebarItem';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { documents, isLoading, fetchDocuments, createDocument, setActiveDocument } =
    useDocumentStore();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Document root = không có parentDocumentId
  const rootDocuments = documents.filter((doc) => doc.parentDocumentId === null);

  const handleCreateRoot = async () => {
    const newDoc = await createDocument();
    setActiveDocument(newDoc.id);
  };

  return (
    <aside className="w-60 h-screen bg-[#111111] border-r border-neutral-800 flex flex-col flex-shrink-0 select-none">
      {/* Header: workspace info */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-neutral-800">
        <div className="w-6 h-6 bg-white rounded flex items-center justify-center flex-shrink-0">
          <span className="text-black font-bold text-xs">N</span>
        </div>
        <span className="text-white text-sm font-medium truncate flex-1">
          {user?.name ?? user?.email}
        </span>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
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
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white text-sm transition-colors">
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
  );
}
