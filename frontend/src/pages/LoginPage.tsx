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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-app)', fontFamily: 'var(--font-sans)' }}
    >
      {/* Background decorative circle */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'var(--color-forest)' }}
      />

      <div className="page-enter w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="9" fill="var(--color-forest)" />
            <path d="M16 25 C16 25 8 20 8 13 C8 9 11.5 7 16 7 C20.5 7 24 9 24 13 C24 20 16 25 16 25Z" stroke="var(--color-cream)" strokeWidth="1.5" fill="none" opacity="0.8" />
            <line x1="16" y1="25" x2="16" y2="12" stroke="var(--color-terracotta)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="17" x2="12" y2="14" stroke="var(--color-terracotta)" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="16" y1="15" x2="20" y2="12" stroke="var(--color-terracotta)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="font-serif text-2xl italic font-semibold" style={{ color: 'var(--color-forest)' }}>
            Notion Mini
          </span>
        </div>

        <h1 className="font-serif text-3xl font-semibold text-center mb-1" style={{ color: 'var(--color-forest)' }}>
          Chào mừng trở lại
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--text-muted)' }}>
          Không gian sáng tạo đang chờ bạn
        </p>

        {error && (
          <div className="text-sm rounded-xl px-4 py-3 mb-6 border" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: { value: /^\S+@\S+$/i, message: 'Email không hợp lệ' },
              })}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-forest)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              {...register('password', { required: 'Mật khẩu là bắt buộc' })}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-forest)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full py-3 text-sm font-semibold mt-2 transition-all shadow-lg"
            style={{
              background: 'var(--color-forest)',
              color: 'var(--color-cream)',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.01)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="font-semibold transition-colors"
            style={{ color: 'var(--color-terracotta)' }}
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
