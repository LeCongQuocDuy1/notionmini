import { useEffect, useState } from 'react';
import { FilePlus, Menu, Plus, Search, Settings, BookOpen, ChevronLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useThemeStore } from '../stores/useThemeStore';
import { useLayoutStore } from '../stores/useLayoutStore';
import { useCreateDocument, useDocuments } from '../hooks/useDocuments';
import Sidebar from '../components/sidebar/Sidebar';
import DocumentEditor from '../components/editor/DocumentEditor';
import SearchModal from '../components/SearchModal';
import { toast } from 'sonner';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeDocumentId, setActiveDocument } = useDocumentStore();
  const { isDark } = useThemeStore();
  const { sidebarPosition } = useLayoutStore();
  const createDocument = useCreateDocument();
  const { data: documents = [] } = useDocuments();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileShowSearch, setMobileShowSearch] = useState(false);

  // Recent non-archived docs sorted by updatedAt
  const recentDocs = [...documents]
    .filter(d => !d.isArchived)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const featuredDoc = recentDocs[0] ?? null;
  const quickNotes = recentDocs.slice(1, 7);
  const collections = recentDocs.slice(0, 8);

  // Greeting by hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Sync dark class on html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Close mobile drawer when a document is selected
  useEffect(() => {
    if (activeDocumentId) setMobileSidebarOpen(false);
  }, [activeDocumentId]);

  const handleCreateFirst = async () => {
    const doc = await createDocument.mutateAsync(undefined);
    setActiveDocument(doc.id);
    toast.success('Đã tạo trang mới');
  };

  const isRightSidebar = sidebarPosition === 'right';

  return (
    <div
      className="h-screen text-(--text-primary) flex overflow-hidden"
      style={{
        background: 'var(--bg-app)',
        flexDirection: isRightSidebar ? 'row-reverse' : 'row',
      }}
    >
      {/* ── Mobile backdrop ─────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      {/* Mobile: fixed drawer that slides in/out                    */}
      {/* Tablet (md): narrower, always visible                      */}
      {/* Desktop (lg): full width, always visible                   */}
      <div
        className={[
          // Mobile: fixed overlay
          'fixed inset-y-0 z-50 transition-transform duration-300 ease-in-out',
          isRightSidebar ? 'right-0' : 'left-0',
          mobileSidebarOpen ? 'translate-x-0' : (isRightSidebar ? 'translate-x-full' : '-translate-x-full'),
          // Tablet+: static in document flow, always visible
          'md:relative md:inset-auto md:translate-x-0 md:shrink-0 md:transition-none',
          // Shadow only on mobile drawer
          mobileSidebarOpen ? 'mobile-sidebar-shadow md:shadow-none' : '',
          // Tablet: apply narrower class
          'sidebar-tablet',
        ].join(' ')}
      >
        <Sidebar />
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Mobile top bar (hidden on md+) */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3 shrink-0 border-b"
          style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
        >
          {/* Left: back arrow when in editor, hamburger otherwise */}
          {activeDocumentId ? (
            <button
              onClick={() => setActiveDocument(null)}
              className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ChevronLeft size={20} />
            </button>
          ) : (
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Menu size={20} />
            </button>
          )}

          {/* Center: brand */}
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="9" fill="var(--color-forest)" />
              <path d="M16 25 C16 25 8 20 8 13 C8 9 11.5 7 16 7 C20.5 7 24 9 24 13 C24 20 16 25 16 25Z"
                stroke="var(--color-cream)" strokeWidth="1.5" fill="none" opacity="0.8" />
              <line x1="16" y1="25" x2="16" y2="12" stroke="var(--color-terracotta)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="17" x2="12" y2="14" stroke="var(--color-terracotta)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="16" y1="15" x2="20" y2="12" stroke="var(--color-terracotta)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="font-serif text-base italic font-semibold" style={{ color: 'var(--color-forest)' }}>
              Notion Mini
            </span>
          </div>

          {/* Right: new page */}
          <button
            onClick={handleCreateFirst}
            disabled={createDocument.isPending}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--color-terracotta)' }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Editor / Welcome area */}
        <div className="flex-1 overflow-auto mobile-content-padding md:pb-0">
          {activeDocumentId ? (
            <DocumentEditor key={activeDocumentId} documentId={activeDocumentId} />
          ) : (
            <WelcomeDashboard
              userName={user?.name ?? user?.email ?? 'curator'}
              greeting={greeting}
              featuredDoc={featuredDoc}
              quickNotes={quickNotes}
              collections={collections}
              onSelect={setActiveDocument}
              onCreateFirst={handleCreateFirst}
              isPending={createDocument.isPending}
            />
          )}
        </div>

        {/* ── Mobile bottom navigation (hidden on md+) ──────────── */}
        <nav className="md:hidden mobile-bottom-nav fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 pt-2">
          {[
            {
              icon: <BookOpen size={22} />,
              label: 'Trang',
              onClick: () => { setActiveDocument(null); setMobileSidebarOpen(true); },
              active: mobileSidebarOpen,
            },
            {
              icon: <Plus size={22} />,
              label: 'Mới',
              onClick: handleCreateFirst,
              accent: true,
            },
            {
              icon: <Search size={22} />,
              label: 'Tìm kiếm',
              onClick: () => setMobileShowSearch(true),
              active: mobileShowSearch,
            },
            {
              icon: <Settings size={22} />,
              label: 'Cài đặt',
              onClick: () => navigate('/settings'),
              active: false,
            },
          ].map(({ icon, label, onClick, accent, active }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all"
              style={{
                color: accent
                  ? 'var(--color-cream)'
                  : active
                  ? 'var(--color-forest)'
                  : 'var(--text-secondary)',
                background: accent
                  ? 'var(--color-forest)'
                  : active
                  ? 'var(--bg-hover)'
                  : 'transparent',
                minWidth: '52px',
              }}
            >
              {icon}
              <span className="text-[9px] font-semibold tracking-wide uppercase">{label}</span>
            </button>
          ))}
        </nav>

        {mobileShowSearch && <SearchModal onClose={() => setMobileShowSearch(false)} />}
      </main>
    </div>
  );
}

// ── Welcome Dashboard ────────────────────────────────────────────────────────

interface DocSnippet {
  id: string;
  title: string;
  icon: string | null;
  updatedAt: string;
}

interface WelcomeProps {
  userName: string;
  greeting: string;
  featuredDoc: DocSnippet | null;
  quickNotes: DocSnippet[];
  collections: DocSnippet[];
  onSelect: (id: string) => void;
  onCreateFirst: () => void;
  isPending: boolean;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

// Pastel accent colours for cards
const CARD_ACCENTS = [
  'rgba(27,48,34,0.08)',
  'rgba(159,64,45,0.08)',
  'rgba(120,100,60,0.08)',
  'rgba(60,80,120,0.08)',
  'rgba(80,60,120,0.08)',
  'rgba(40,100,80,0.08)',
];

function WelcomeDashboard({ userName, greeting, featuredDoc, quickNotes, collections, onSelect, onCreateFirst, isPending }: WelcomeProps) {
  const hasContent = featuredDoc !== null;

  return (
    <div className="page-enter h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="mb-8 md:mb-10">
          {/* Decorative seed mark */}
          <div className="flex items-center gap-3 mb-4">
            <svg width="28" height="28" viewBox="0 0 72 72" fill="none" className="opacity-40 shrink-0">
              <path d="M36 58 C36 58 18 47 18 31 C18 22 26 17 36 17 C46 17 54 22 54 31 C54 47 36 58 36 58Z"
                stroke="var(--color-forest)" strokeWidth="2" fill="none" />
              <line x1="36" y1="58" x2="36" y2="28" stroke="var(--color-terracotta)" strokeWidth="2" strokeLinecap="round" />
              <line x1="36" y1="40" x2="27" y2="33" stroke="var(--color-terracotta)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="36" y1="35" x2="45" y2="28" stroke="var(--color-terracotta)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>
              Notion Mini · Atelier
            </p>
          </div>
          <h1 className="font-serif text-2xl md:text-4xl font-semibold leading-tight" style={{ color: 'var(--color-forest)' }}>
            {greeting}, <span style={{ color: 'var(--color-terracotta)' }}>{userName}.</span>
          </h1>
          <p className="mt-1.5 text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
            {hasContent ? 'Khu vườn của bạn đang nở rộ hôm nay.' : 'Không gian sáng tạo của bạn đang chờ.'}
          </p>
        </div>

        {!hasContent ? (
          /* ── Empty state ──────────────────────────────────────── */
          <div
            className="rounded-3xl p-8 md:p-12 flex flex-col items-center gap-4 text-center"
            style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(27,48,34,0.08)' }}
            >
              <FileText size={28} style={{ color: 'var(--color-forest)', opacity: 0.5 }} />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold" style={{ color: 'var(--color-forest)' }}>Bắt đầu từ một hạt mầm</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Tạo trang đầu tiên để khu vườn của bạn bắt đầu nở rộ.</p>
            </div>
            <button
              onClick={onCreateFirst}
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shadow-md transition-all"
              style={{ background: 'var(--color-terracotta)', color: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <FilePlus size={15} />
              Tạo trang đầu tiên
            </button>
          </div>
        ) : (
          <>
            {/* ── Main grid (PC: 3-col, Tablet: 2-col, Mobile: 1-col) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8">

              {/* Featured card — full width on mobile, 2-col span on lg */}
              <div
                className="lg:col-span-2 rounded-3xl p-6 md:p-8 cursor-pointer group transition-all"
                style={{
                  background: 'var(--color-forest)',
                  minHeight: '180px',
                }}
                onClick={() => onSelect(featuredDoc!.id)}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div className="flex flex-col h-full justify-between gap-6">
                  <div>
                    <p
                      className="text-[10px] tracking-[0.2em] uppercase font-bold mb-3"
                      style={{ color: 'rgba(251,251,226,0.5)' }}
                    >
                      Gần đây nhất
                    </p>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl shrink-0 mt-0.5">
                        {featuredDoc!.icon ?? '📄'}
                      </span>
                      <h2
                        className="font-serif text-xl md:text-2xl font-semibold leading-snug"
                        style={{ color: 'var(--color-cream)' }}
                      >
                        {featuredDoc!.title || 'Untitled'}
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(251,251,226,0.5)' }}>
                      {timeAgo(featuredDoc!.updatedAt)}
                    </span>
                    <span
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(251,251,226,0.15)', color: 'var(--color-cream)' }}
                    >
                      Mở trang →
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick note — first sidebar card (visible on md+) */}
              {quickNotes[0] && (
                <div
                  className="hidden md:flex rounded-3xl p-5 cursor-pointer group flex-col justify-between transition-all"
                  style={{
                    background: CARD_ACCENTS[0],
                    border: '1px solid var(--border-soft)',
                    minHeight: '140px',
                  }}
                  onClick={() => onSelect(quickNotes[0].id)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = CARD_ACCENTS[0]; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div>
                    <span className="text-2xl">{quickNotes[0].icon ?? '📄'}</span>
                    <p className="font-serif text-sm font-semibold mt-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {quickNotes[0].title || 'Untitled'}
                    </p>
                  </div>
                  <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>{timeAgo(quickNotes[0].updatedAt)}</p>
                </div>
              )}
            </div>

            {/* ── Quick Notes grid ─────────────────────────────────── */}
            {quickNotes.length > 1 && (
              <div className="mb-8">
                <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-3" style={{ color: 'var(--text-muted)' }}>
                  Quick Notes
                </p>
                {/* Mobile: 2-col, Tablet: 3-col, Desktop: 4-col */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {quickNotes.slice(1).map((doc, i) => (
                    <div
                      key={doc.id}
                      className="rounded-2xl p-4 cursor-pointer transition-all"
                      style={{
                        background: CARD_ACCENTS[(i + 1) % CARD_ACCENTS.length],
                        border: '1px solid var(--border-soft)',
                      }}
                      onClick={() => onSelect(doc.id)}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = CARD_ACCENTS[(i + 1) % CARD_ACCENTS.length]; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <span className="text-xl">{doc.icon ?? '📄'}</span>
                      <p className="font-sans text-xs font-semibold mt-2 leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                        {doc.title || 'Untitled'}
                      </p>
                      <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>{timeAgo(doc.updatedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Recent Collections (horizontal scroll) ───────────── */}
            {collections.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>
                    Recent Collections
                  </p>
                  <button
                    onClick={onCreateFirst}
                    className="text-[10px] flex items-center gap-1 px-3 py-1 rounded-full font-semibold transition-all"
                    style={{ background: 'var(--color-terracotta)', color: '#fff' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <FilePlus size={10} />
                    Trang mới
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {collections.map((doc, i) => (
                    <div
                      key={doc.id}
                      className="shrink-0 rounded-2xl p-4 cursor-pointer transition-all"
                      style={{
                        width: '140px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderTop: `3px solid ${i % 2 === 0 ? 'var(--color-forest)' : 'var(--color-terracotta)'}`,
                      }}
                      onClick={() => onSelect(doc.id)}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <span className="text-lg">{doc.icon ?? '📄'}</span>
                      <p className="text-xs font-semibold mt-2 leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                        {doc.title || 'Untitled'}
                      </p>
                      <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>{timeAgo(doc.updatedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Bottom CTA (always shown) ──────────────────────────── */}
        {hasContent && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={onCreateFirst}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-active)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <FilePlus size={14} />
              Tạo trang mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
