import { useAuthStore } from '../stores/useAuthStore';
import { useDocumentStore } from '../stores/useDocumentStore';
import Sidebar from '../components/sidebar/Sidebar';
import DocumentEditor from '../components/editor/DocumentEditor';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { activeDocumentId } = useDocumentStore();

  return (
    <div className="h-screen bg-[#191919] text-white flex overflow-hidden">
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex overflow-auto">
        {activeDocumentId ? (
          <DocumentEditor key={activeDocumentId} documentId={activeDocumentId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-5xl mb-4">📄</p>
            <h1 className="text-xl font-semibold mb-2 text-neutral-200">
              Chào mừng, {user?.name ?? 'bạn'}!
            </h1>
            <p className="text-neutral-500 text-sm">
              Chọn một trang từ sidebar hoặc tạo trang mới.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
