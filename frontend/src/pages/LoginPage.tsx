import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/useAuthStore';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => clearError();
  }, [isAuthenticated, navigate, clearError]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch {
      // error đã được lưu trong store
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <span className="text-black font-bold text-sm">N</span>
          </div>
          <span className="text-white font-semibold text-xl">Notion Mini</span>
        </div>

        <h1 className="text-white text-2xl font-semibold text-center mb-1">Đăng nhập</h1>
        <p className="text-neutral-400 text-sm text-center mb-8">
          Chào mừng trở lại
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-neutral-300 text-sm mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-500 transition-colors"
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: { value: /^\S+@\S+$/i, message: 'Email không hợp lệ' },
              })}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-neutral-300 text-sm mb-1.5">Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-500 transition-colors"
              {...register('password', { required: 'Mật khẩu là bắt buộc' })}
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white hover:bg-neutral-200 text-black font-medium rounded-md py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-neutral-500 text-sm text-center mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-neutral-300 hover:text-white transition-colors">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
