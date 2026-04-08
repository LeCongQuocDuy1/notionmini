import { useEffect } from 'react';
import { X, Sun, Moon, PanelLeft, PanelRight } from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';
import { useLayoutStore } from '../stores/useLayoutStore';

interface Props {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: Props) {
  const { isDark, toggle: toggleTheme } = useThemeStore();
  const { sidebarPosition, toggleSidebarPosition } = useLayoutStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Cài đặt</p>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Settings list */}
        <div className="p-4 space-y-1">
          {/* Theme */}
          <SettingRow
            label="Giao diện"
            description={isDark ? 'Đang dùng Dark mode' : 'Đang dùng Light mode'}
            icon={isDark ? <Moon size={16} /> : <Sun size={16} />}
            onClick={toggleTheme}
            value={isDark ? 'Tối' : 'Sáng'}
          />

          {/* Sidebar position */}
          <SettingRow
            label="Vị trí thanh điều hướng"
            description={sidebarPosition === 'left' ? 'Hiện ở bên trái' : 'Hiện ở bên phải'}
            icon={sidebarPosition === 'left' ? <PanelLeft size={16} /> : <PanelRight size={16} />}
            onClick={toggleSidebarPosition}
            value={sidebarPosition === 'left' ? 'Trái' : 'Phải'}
          />
        </div>

        <div className="px-4 py-2 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Esc để đóng
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  label, description, icon, onClick, value,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  value: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left"
      style={{ color: 'var(--text-primary)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ color: 'var(--text-secondary)' }}>{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      <span
        className="text-xs px-2 py-1 rounded-md"
        style={{ background: 'var(--bg-active)', color: 'var(--text-secondary)' }}
      >
        {value}
      </span>
    </button>
  );
}
