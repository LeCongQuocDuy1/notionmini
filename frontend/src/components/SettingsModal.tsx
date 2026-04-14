import { useEffect, useState } from 'react';
import { X, Sun, Moon, PanelLeft, PanelRight, User, Palette, Sliders } from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';
import { useLayoutStore } from '../stores/useLayoutStore';

interface Props {
  onClose: () => void;
}

type Tab = 'general' | 'appearance' | 'workspace';

export default function SettingsModal({ onClose }: Props) {
  const { isDark, toggle: toggleTheme } = useThemeStore();
  const { sidebarPosition, toggleSidebarPosition } = useLayoutStore();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  // Workspace toggles — local state (tạm thời, chưa persist)
  const [softFocus, setSoftFocus] = useState(true);
  const [serifTransitions, setSerifTransitions] = useState(false);
  const [asymmetricLayouts, setAsymmetricLayouts] = useState(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'general',    label: 'Chung',        icon: <User size={15} /> },
    { key: 'appearance', label: 'Giao diện',    icon: <Palette size={15} /> },
    { key: 'workspace',  label: 'Workspace',    icon: <Sliders size={15} /> },
  ];

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(27,48,34,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="modal-panel w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border)',
          maxHeight: '90vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ───────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-8 py-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h2 className="font-serif text-2xl font-semibold" style={{ color: 'var(--color-forest)' }}>
              Atelier Preferences
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Tinh chỉnh không gian sáng tạo của bạn
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body: Sidebar + Content ───────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left nav */}
          <nav
            className="w-44 shrink-0 p-4 flex flex-col gap-1 border-r"
            style={{ borderColor: 'var(--border)' }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-widest px-3 pb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Tùy chỉnh
            </p>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-full text-sm font-medium text-left transition-all"
                style={{
                  background: activeTab === tab.key ? 'var(--color-forest)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--color-cream)' : 'var(--text-secondary)',
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right panel */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'appearance' && (
              <AppearanceTab
                isDark={isDark}
                toggleTheme={toggleTheme}
                sidebarPosition={sidebarPosition}
                toggleSidebarPosition={toggleSidebarPosition}
              />
            )}
            {activeTab === 'workspace' && (
              <WorkspaceTab
                softFocus={softFocus} setSoftFocus={setSoftFocus}
                serifTransitions={serifTransitions} setSerifTransitions={setSerifTransitions}
                asymmetricLayouts={asymmetricLayouts} setAsymmetricLayouts={setAsymmetricLayouts}
              />
            )}
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div
          className="px-8 py-3 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Esc để đóng</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: 'var(--color-forest)',
              color: 'var(--color-cream)',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Tab: Chung ──────────────────────────────────────────────── */
function GeneralTab() {
  return (
    <div className="space-y-8">
      <Section title="Creative Identity" description="Thông tin hiển thị trong không gian làm việc của bạn.">
        <div className="flex items-center gap-5 mb-6">
          {/* Avatar placeholder */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shrink-0 relative"
            style={{ background: 'var(--bg-hover)', border: '3px solid var(--border)' }}
          >
            🌱
          </div>
          <div className="flex-1 space-y-3">
            <FormField label="Tên hiển thị">
              <input
                type="text"
                defaultValue="Người dùng"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-forest)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </FormField>
          </div>
        </div>
        <FormField label="Bio / Cảm hứng">
          <textarea
            rows={3}
            defaultValue="Ghi chú những ý tưởng đang nảy mầm..."
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border resize-none transition-all"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-forest)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
        </FormField>
      </Section>
    </div>
  );
}

/* ── Tab: Giao diện ──────────────────────────────────────────── */
function AppearanceTab({
  isDark, toggleTheme, sidebarPosition, toggleSidebarPosition,
}: {
  isDark: boolean;
  toggleTheme: () => void;
  sidebarPosition: 'left' | 'right';
  toggleSidebarPosition: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Theme picker */}
      <Section title="Visual Atmosphere" description="Chọn canvas phù hợp với tâm trạng hiện tại của bạn.">
        <div className="grid grid-cols-2 gap-4">
          {/* Light */}
          <ThemeCard
            active={!isDark}
            onClick={toggleTheme}
            preview="#fbfbe2"
            label="Classic Beige"
            sub="Natural Linen"
            icon={<Sun size={18} style={{ color: '#1b3022' }} />}
          />
          {/* Dark */}
          <ThemeCard
            active={isDark}
            onClick={toggleTheme}
            preview="#191919"
            label="Forest Depth"
            sub="Midnight Pines"
            icon={<Moon size={18} style={{ color: '#b4cdb8' }} />}
          />
        </div>
      </Section>

      {/* Sidebar position */}
      <Section title="Layout" description="Vị trí của thanh điều hướng.">
        <div className="grid grid-cols-2 gap-4">
          <ThemeCard
            active={sidebarPosition === 'left'}
            onClick={() => sidebarPosition !== 'left' && toggleSidebarPosition()}
            preview=""
            label="Sidebar Trái"
            sub="Mặc định"
            icon={<PanelLeft size={18} style={{ color: 'var(--color-forest)' }} />}
          />
          <ThemeCard
            active={sidebarPosition === 'right'}
            onClick={() => sidebarPosition !== 'right' && toggleSidebarPosition()}
            preview=""
            label="Sidebar Phải"
            sub="Thay thế"
            icon={<PanelRight size={18} style={{ color: 'var(--color-forest)' }} />}
          />
        </div>
      </Section>
    </div>
  );
}

/* ── Tab: Workspace ──────────────────────────────────────────── */
function WorkspaceTab({
  softFocus, setSoftFocus,
  serifTransitions, setSerifTransitions,
  asymmetricLayouts, setAsymmetricLayouts,
}: {
  softFocus: boolean; setSoftFocus: (v: boolean) => void;
  serifTransitions: boolean; setSerifTransitions: (v: boolean) => void;
  asymmetricLayouts: boolean; setAsymmetricLayouts: (v: boolean) => void;
}) {
  return (
    <div className="space-y-8">
      <Section title="Atelier Dynamics" description="Điều chỉnh cách không gian phản ứng với thói quen sáng tạo của bạn.">
        <div className="space-y-6">
          <ToggleRow
            title="Soft-Focus Mode"
            description="Thu gọn giao diện khi đang viết để tập trung vào nội dung."
            checked={softFocus}
            onChange={setSoftFocus}
          />
          <ToggleRow
            title="Serif Transitions"
            description="Dùng hiệu ứng fade mượt khi chuyển đổi giữa các trang."
            checked={serifTransitions}
            onChange={setSerifTransitions}
          />
          <ToggleRow
            title="Asymmetric Layouts"
            description="Cho phép thẻ và ghi chú sắp xếp theo cấu trúc tự nhiên, phi tuyến tính."
            checked={asymmetricLayouts}
            onChange={setAsymmetricLayouts}
          />
        </div>
      </Section>
    </div>
  );
}

/* ── Shared sub-components ───────────────────────────────────── */
function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-2xl p-6"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <h3 className="font-serif text-lg font-semibold mb-1" style={{ color: 'var(--color-forest)' }}>{title}</h3>
      <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>{description}</p>
      {children}
    </section>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  );
}

function ThemeCard({
  active, onClick, preview, label, sub, icon,
}: {
  active: boolean;
  onClick: () => void;
  preview: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl p-4 text-left transition-all border-2"
      style={{
        background: 'var(--bg-hover)',
        borderColor: active ? 'var(--color-terracotta)' : 'transparent',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        boxShadow: active ? '0 0 0 1px var(--color-terracotta)' : 'none',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'transparent'; }}
    >
      {/* Preview swatch */}
      {preview ? (
        <div
          className="w-full aspect-video rounded-lg mb-3 flex items-center justify-center"
          style={{ background: preview }}
        >
          {icon}
        </div>
      ) : (
        <div
          className="w-full aspect-video rounded-lg mb-3 flex items-center justify-center"
          style={{ background: 'var(--bg-active)' }}
        >
          {icon}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-serif text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
          <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
        </div>
        {active && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white"
            style={{ background: 'var(--color-terracotta)' }}
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}

function ToggleRow({
  title, description, checked, onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex-1">
        <h4 className="font-serif text-base font-medium" style={{ color: 'var(--color-forest)' }}>{title}</h4>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
        />
        <div
          className="w-12 h-6 rounded-full transition-all duration-200 relative"
          style={{
            background: checked ? 'var(--color-terracotta)' : 'var(--bg-active)',
            transition: 'background 0.2s ease',
          }}
        >
          <div
            className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
            style={{ transform: checked ? 'translateX(24px)' : 'translateX(0)' }}
          />
        </div>
      </label>
    </div>
  );
}
