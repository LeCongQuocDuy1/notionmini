import { useEffect } from 'react';

interface Props {
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Xác nhận',
  danger = true,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onConfirm, onCancel]);

  return (
    <div
      className="modal-backdrop fixed inset-0 z-100 flex items-center justify-center p-4"
      style={{ background: 'rgba(27,48,34,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <div
        className="modal-panel w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Accent bar ───────────────────────────────────────── */}
        <div
          className="h-1 w-full"
          style={{ background: danger ? 'var(--color-terracotta)' : 'var(--color-forest)' }}
        />

        <div className="p-6">
          {/* Icon + text */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: danger ? 'rgba(159,64,45,0.12)' : 'rgba(27,48,34,0.1)',
              }}
            >
              {danger ? (
                /* Flame/warning icon hand-drawn style */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-terracotta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="font-serif text-base font-semibold leading-snug"
                style={{ color: 'var(--color-forest)' }}
              >
                {title}
              </h3>
              {description && (
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: 'var(--bg-hover)',
                color: 'var(--text-secondary)',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-active)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-all"
              style={{
                background: danger ? 'var(--color-terracotta)' : 'var(--color-forest)',
                transition: 'opacity 0.12s ease, transform 0.12s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
