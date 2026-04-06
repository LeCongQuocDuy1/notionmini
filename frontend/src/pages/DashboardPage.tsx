import { useAuthStore } from '../stores/useAuthStore';
import { useDocumentStore } from '../stores/useDocumentStore';
import Sidebar from '../components/sidebar/Sidebar';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { activeDocumentId } = useDocumentStore();

  return (
    <div className="h-screen bg-[#191919] text-white flex overflow-hidden">
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center overflow-auto">
        {activeDocumentId ? (
          // Phase 7: Editor sẽ render ở đây
          <div className="text-neutral-500 text-sm">
            Editor sẽ được xây dựng ở Giai đoạn 7
          </div>
        ) : (
          <div className="text-center">
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
