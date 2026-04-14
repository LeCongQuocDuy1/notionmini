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
    const doc = await createDocument.mutateAsync(undefined);
    setActiveDocument(doc.id);
    toast.success('Đã tạo trang mới');
  };

  const sidebar = <Sidebar />;
  const main = (
    <main className="flex-1 flex overflow-auto relative">
      {activeDocumentId ? (
        <DocumentEditor key={activeDocumentId} documentId={activeDocumentId} />
      ) : (
        <div className="page-enter flex-1 flex flex-col items-center justify-center gap-4 px-8">
          {/* Abstract seed SVG decoration */}
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-20 mb-2">
            <circle cx="36" cy="36" r="35" stroke="var(--color-forest)" strokeWidth="1.5" />
            <path d="M36 58 C36 58 18 47 18 31 C18 22 26 17 36 17 C46 17 54 22 54 31 C54 47 36 58 36 58Z" stroke="var(--color-forest)" strokeWidth="1.5" fill="none" />
            <line x1="36" y1="58" x2="36" y2="28" stroke="var(--color-terracotta)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="36" y1="40" x2="27" y2="33" stroke="var(--color-terracotta)" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="36" y1="35" x2="45" y2="28" stroke="var(--color-terracotta)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>

          <h1 className="font-serif text-3xl font-semibold text-center leading-snug" style={{ color: 'var(--color-forest)' }}>
            Chào mừng, {user?.name ?? 'bạn'}.
          </h1>
          <p className="text-sm text-center max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            Không gian sáng tạo của bạn đang chờ. Chọn một trang từ sidebar hoặc bắt đầu từ một ý tưởng mới.
          </p>
          <button
            onClick={handleCreateFirst}
            disabled={createDocument.isPending}
            className="mt-2 flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold shadow-md transition-all"
            style={{
              background: 'var(--color-terracotta)',
              color: '#fff',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
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
