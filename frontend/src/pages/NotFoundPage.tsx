import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-[#191919] dark:bg-[#191919] flex flex-col items-center justify-center text-white">
      <FileQuestion size={64} className="text-neutral-600 mb-6" />
      <h1 className="text-3xl font-bold mb-2 text-neutral-200">404</h1>
      <p className="text-neutral-500 text-sm mb-8">Trang này không tồn tại.</p>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
      >
        Về trang chủ
      </button>
    </div>
  );
}
