import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="border rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5 flex flex-col gap-4"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: danger ? 'rgba(239,68,68,0.12)' : 'var(--bg-hover)' }}>
            <AlertTriangle size={18} className={danger ? 'text-red-400' : ''} style={!danger ? { color: 'var(--text-secondary)' } : {}} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
            {description && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md text-sm transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={danger
              ? { background: '#dc2626', color: '#fff' }
              : { background: 'var(--bg-active)', color: 'var(--text-primary)' }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
