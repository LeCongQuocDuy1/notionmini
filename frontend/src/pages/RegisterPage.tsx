import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/useAuthStore';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => clearError();
  }, [isAuthenticated, navigate, clearError]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.email, data.password, data.name || undefined);
      navigate('/');
    } catch {
      // error đã được lưu trong store
    }
  };

  const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all";
  const inputStyle = { background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = 'var(--color-forest)';
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = 'var(--border)';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-app)', fontFamily: 'var(--font-sans)' }}
    >
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
          <span className="font-serif text-2xl italic font-semibold" style={{ color: 'var(--color-forest)' }}>Notion Mini</span>
        </div>

        <h1 className="font-serif text-3xl font-semibold text-center mb-1" style={{ color: 'var(--color-forest)' }}>
          Tạo tài khoản
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--text-muted)' }}>
          Miễn phí, bắt đầu ngay hôm nay
        </p>

        {error && (
          <div className="text-sm rounded-xl px-4 py-3 mb-6 border" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Tên (tuỳ chọn)</label>
            <input type="text" placeholder="Nguyễn Văn A" className={inputCls} style={inputStyle} {...register('name')} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input type="email" placeholder="you@example.com" className={inputCls} style={inputStyle}
              {...register('email', { required: 'Email là bắt buộc', pattern: { value: /^\S+@\S+$/i, message: 'Email không hợp lệ' } })} onFocus={onFocus} onBlur={onBlur}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Mật khẩu</label>
            <input type="password" placeholder="Ít nhất 6 ký tự" className={inputCls} style={inputStyle}
              {...register('password', { required: 'Mật khẩu là bắt buộc', minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' } })} onFocus={onFocus} onBlur={onBlur}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Xác nhận mật khẩu</label>
            <input type="password" placeholder="••••••••" className={inputCls} style={inputStyle}
              {...register('confirmPassword', { required: 'Vui lòng xác nhận mật khẩu', validate: (val) => val === watch('password') || 'Mật khẩu không khớp' })} onFocus={onFocus} onBlur={onBlur}
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full py-3 text-sm font-semibold mt-2 shadow-lg transition-all disabled:opacity-50"
            style={{ background: 'var(--color-forest)', color: 'var(--color-cream)', transition: 'opacity 0.15s ease, transform 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.01)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold transition-colors" style={{ color: 'var(--color-terracotta)' }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
