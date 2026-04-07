import { useEffect } from 'react';
import { Sun, Moon, FilePlus } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useThemeStore } from '../stores/useThemeStore';
import Sidebar from '../components/sidebar/Sidebar';
import DocumentEditor from '../components/editor/DocumentEditor';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { activeDocumentId, createDocument, setActiveDocument } = useDocumentStore();
  const { isDark, toggle } = useThemeStore();

  // Sync dark class on html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleCreateFirst = async () => {
    const doc = await createDocument();
    setActiveDocument(doc.id);
  };

  return (
    <div className="h-screen text-[var(--text-primary)] flex overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex overflow-auto relative">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={isDark ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'}
          className="absolute top-3 right-4 z-20 p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

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
    </div>
  );
}
