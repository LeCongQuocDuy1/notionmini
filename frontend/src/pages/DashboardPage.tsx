import { useEffect } from 'react';
import { FilePlus } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useThemeStore } from '../stores/useThemeStore';
import { useLayoutStore } from '../stores/useLayoutStore';
import { useCreateDocument } from '../hooks/useDocuments';
import Sidebar from '../components/sidebar/Sidebar';
import DocumentEditor from '../components/editor/DocumentEditor';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { activeDocumentId, setActiveDocument } = useDocumentStore();
  const { isDark } = useThemeStore();
  const { sidebarPosition } = useLayoutStore();
  const createDocument = useCreateDocument();

  // Sync dark class on html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleCreateFirst = async () => {
    const doc = await createDocument.mutateAsync();
    setActiveDocument(doc.id);
    toast.success('Đã tạo trang mới');
  };

  const sidebar = <Sidebar />;
  const main = (
    <main className="flex-1 flex overflow-auto relative">
      {activeDocumentId ? (
        <DocumentEditor key={activeDocumentId} documentId={activeDocumentId} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-5xl mb-2 select-none">📄</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Chào mừng, {user?.name ?? 'bạn'}!
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Chọn một trang từ sidebar hoặc tạo trang mới để bắt đầu.
          </p>
          <button
            onClick={handleCreateFirst}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
          >
            <FilePlus size={15} />
            Tạo trang đầu tiên
          </button>
        </div>
      )}
    </main>
  );

  return (
    <div
      className="h-screen text-(--text-primary) flex overflow-hidden"
      style={{ background: 'var(--bg-app)', flexDirection: sidebarPosition === 'right' ? 'row-reverse' : 'row' }}
    >
      {sidebar}
      {main}
    </div>
  );
}
