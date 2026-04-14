import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, PanelLeft, PanelRight, User, Palette, Sliders } from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';
import { useLayoutStore } from '../stores/useLayoutStore';
import { useAuthStore } from '../stores/useAuthStore';
import Sidebar from '../components/sidebar/Sidebar';

type Tab = 'general' | 'appearance' | 'workspace';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useThemeStore();
  const { sidebarPosition, toggleSidebarPosition } = useLayoutStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  // Workspace toggles — local UI state
  const [softFocus, setSoftFocus] = useState(true);
  const [serifTransitions, setSerifTransitions] = useState(false);
  const [asymmetricLayouts, setAsymmetricLayouts] = useState(true);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'general',    label: 'Chung',     icon: <User size={15} /> },
    { key: 'appearance', label: 'Giao diện', icon: <Palette size={15} /> },
    { key: 'workspace',  label: 'Workspace', icon: <Sliders size={15} /> },
  ];

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ background: 'var(--bg-app)', flexDirection: sidebarPosition === 'right' ? 'row-reverse' : 'row' }}
    >
      <Sidebar />

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 flex items-center gap-4 px-10 py-4 border-b"
          style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium rounded-full px-3 py-1.5 transition-all"
            style={{ color: 'var(--text-secondary)', transition: 'background 0.12s ease, color 0.12s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={15} />
            Quay lại
          </button>
        </div>

        {/* ── Page body ────────────────────────────────────────────── */}
        <div className="page-enter max-w-4xl mx-auto px-10 py-10">
          {/* Editorial header */}
          <header className="mb-10">
            <h1 className="font-serif text-5xl font-semibold italic" style={{ color: 'var(--color-forest)' }}>
              Atelier Preferences
            </h1>
            <p className="text-base mt-2" style={{ color: 'var(--text-muted)' }}>
              Tinh chỉnh không gian sáng tạo để phù hợp với nhịp điệu của bạn.
            </p>
          </header>

          {/* ── Two-column layout ─────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left sidebar nav */}
            <nav className="col-span-3">
              <p
                className="text-[10px] font-bold uppercase tracking-widest px-3 pb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Tùy chỉnh
              </p>
              <div className="flex flex-col gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-medium text-left transition-all"
                    style={{
                      background: activeTab === tab.key ? 'var(--color-forest)' : 'transparent',
                      color: activeTab === tab.key ? 'var(--color-cream)' : 'var(--text-secondary)',
                      boxShadow: activeTab === tab.key ? '0 4px 12px rgba(27,48,34,0.2)' : 'none',
                      transition: 'background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
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
              </div>
            </nav>

            {/* Right panel */}
            <div className="col-span-9 space-y-6">
              {activeTab === 'general' && <GeneralTab user={user} />}
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

              {/* Footer actions */}
              <div
                className="flex items-center justify-end gap-4 pt-6 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  className="font-serif italic text-base px-4 py-2 transition-colors"
                  style={{ color: 'var(--text-muted)', transition: 'color 0.15s ease' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-terracotta)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  Đặt lại mặc định
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all"
                  style={{
                    background: 'var(--color-forest)',
                    color: 'var(--color-cream)',
                    transition: 'opacity 0.15s ease, transform 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Tab: Chung ──────────────────────────────────────────────────── */
function GeneralTab({ user }: { user: { name?: string | null; email: string } | null }) {
  return (
    <div className="space-y-6">
      <Section
        title="Creative Identity"
        description="Thông tin hiển thị trong không gian làm việc của bạn."
      >
        {/* Avatar + name row */}
        <div className="flex items-start gap-6 mb-6">
          <div className="shrink-0 relative group">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
              style={{ background: 'var(--bg-hover)', border: '3px solid var(--border)' }}
            >
              🌱
            </div>
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-xs font-medium"
              style={{ background: 'rgba(27,48,34,0.55)', color: '#fff' }}
            >
              Đổi
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <FormField label="Tên hiển thị">
              <input
                type="text"
                defaultValue={user?.name ?? ''}
                placeholder="Tên của bạn"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-forest)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </FormField>
            <FormField label="Email">
              <input
                type="email"
                defaultValue={user?.email ?? ''}
                readOnly
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
                style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
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

/* ── Tab: Giao diện ──────────────────────────────────────────────── */
function AppearanceTab({
  isDark, toggleTheme, sidebarPosition, toggleSidebarPosition,
}: {
  isDark: boolean;
  toggleTheme: () => void;
  sidebarPosition: 'left' | 'right';
  toggleSidebarPosition: () => void;
}) {
  return (
    <div className="space-y-6">
      <Section
        title="Visual Atmosphere"
        description="Chọn canvas phù hợp với tâm trạng hiện tại của bạn."
      >
        <div className="grid grid-cols-2 gap-4">
          <ThemeCard
            active={!isDark}
            onClick={() => isDark && toggleTheme()}
            preview="#fbfbe2"
            label="Classic Beige"
            sub="Natural Linen"
            icon={<Sun size={22} color="#1b3022" />}
          />
          <ThemeCard
            active={isDark}
            onClick={() => !isDark && toggleTheme()}
            preview="#191919"
            label="Forest Depth"
            sub="Midnight Pines"
            icon={<Moon size={22} color="#b4cdb8" />}
          />
        </div>
      </Section>

      <Section
        title="Layout"
        description="Vị trí thanh điều hướng sidebar."
      >
        <div className="grid grid-cols-2 gap-4">
          <ThemeCard
            active={sidebarPosition === 'left'}
            onClick={() => sidebarPosition !== 'left' && toggleSidebarPosition()}
            preview=""
            label="Sidebar Trái"
            sub="Mặc định"
            icon={<PanelLeft size={22} style={{ color: 'var(--color-forest)' }} />}
          />
          <ThemeCard
            active={sidebarPosition === 'right'}
            onClick={() => sidebarPosition !== 'right' && toggleSidebarPosition()}
            preview=""
            label="Sidebar Phải"
            sub="Thay thế"
            icon={<PanelRight size={22} style={{ color: 'var(--color-forest)' }} />}
          />
        </div>
      </Section>
    </div>
  );
}

/* ── Tab: Workspace ──────────────────────────────────────────────── */
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
    <div className="space-y-6">
      <Section
        title="Atelier Dynamics"
        description="Điều chỉnh cách không gian phản ứng với thói quen sáng tạo của bạn."
      >
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          <ToggleRow title="Soft-Focus Mode"       description="Thu gọn giao diện khi đang viết để tập trung vào nội dung."             checked={softFocus}          onChange={setSoftFocus} />
          <ToggleRow title="Serif Transitions"     description="Dùng hiệu ứng fade mượt khi chuyển đổi giữa các trang."               checked={serifTransitions}   onChange={setSerifTransitions} />
          <ToggleRow title="Asymmetric Layouts"    description="Cho phép thẻ và ghi chú sắp xếp theo cấu trúc tự nhiên, phi tuyến tính." checked={asymmetricLayouts}  onChange={setAsymmetricLayouts} />
        </div>
      </Section>
    </div>
  );
}

/* ── Shared components ───────────────────────────────────────────── */
function Section({ title, description, children }: {
  title: string; description: string; children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl p-8 relative overflow-hidden"
      style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}
    >
      {/* Decorative blob */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(159,64,45,0.05)' }}
      />
      <h3 className="font-serif text-xl font-semibold mb-1 relative" style={{ color: 'var(--color-forest)' }}>{title}</h3>
      <p className="text-xs mb-6 relative" style={{ color: 'var(--text-muted)' }}>{description}</p>
      <div className="relative">{children}</div>
    </section>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ThemeCard({ active, onClick, preview, label, sub, icon }: {
  active: boolean; onClick: () => void;
  preview: string; label: string; sub: string; icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-5 text-left transition-all border-2"
      style={{
        background: 'var(--bg-surface)',
        borderColor: active ? 'var(--color-terracotta)' : 'var(--border)',
        boxShadow: active ? '0 0 0 1px var(--color-terracotta), 0 8px 24px rgba(159,64,45,0.12)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
    >
      <div
        className="w-full aspect-video rounded-xl mb-4 flex items-center justify-center"
        style={{ background: preview || 'var(--bg-hover)' }}
      >
        {icon}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-serif text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
          <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
        </div>
        {active ? (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-terracotta)' }}
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border" style={{ borderColor: 'var(--border)' }} />
        )}
      </div>
    </button>
  );
}

function ToggleRow({ title, description, checked, onChange }: {
  title: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-5 first:pt-0 last:pb-0">
      <div className="flex-1">
        <h4 className="font-serif text-base font-medium" style={{ color: 'var(--color-forest)' }}>{title}</h4>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative shrink-0 w-12 h-6 rounded-full transition-all"
        style={{
          background: checked ? 'var(--color-terracotta)' : 'var(--bg-active)',
          transition: 'background 0.2s ease',
        }}
      >
        <div
          className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ transform: checked ? 'translateX(24px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}
