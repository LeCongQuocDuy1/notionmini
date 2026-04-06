import { useAuthStore } from '../stores/useAuthStore';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#191919] text-white flex">
      {/* Sidebar placeholder */}
      <aside className="w-60 border-r border-neutral-800 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <span className="text-black font-bold text-xs">N</span>
          </div>
          <span className="text-sm font-medium truncate">{user?.name ?? user?.email}</span>
        </div>
        <p className="text-neutral-500 text-xs">Sidebar sẽ được xây dựng ở Giai đoạn 6</p>
        <div className="mt-auto">
          <button
            onClick={logout}
            className="w-full text-left text-neutral-400 hover:text-white text-sm py-1.5 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content placeholder */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">👋</p>
          <h1 className="text-2xl font-semibold mb-2">Chào mừng, {user?.name ?? 'bạn'}!</h1>
          <p className="text-neutral-400 text-sm">Chọn hoặc tạo một trang để bắt đầu.</p>
        </div>
      </main>
    </div>
  );
}
