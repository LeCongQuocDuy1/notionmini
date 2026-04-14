import { useEffect, useRef, useState } from 'react';
import { Search, X, FileText, Clock } from 'lucide-react';
import api from '../lib/axios';
import { useDocumentStore } from '../stores/useDocumentStore';

interface SearchResult {
  id: string;
  title: string;
  icon: string | null;
  parentDocumentId: string | null;
  updatedAt: string;
}

interface Props {
  onClose: () => void;
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

export default function SearchModal({ onClose }: Props) {
  const { setActiveDocument } = useDocumentStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get<SearchResult[]>(`/documents/search?q=${encodeURIComponent(query)}`);
        setResults(data);
        setActiveIndex(0);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (id: string) => { setActiveDocument(id); onClose(); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[activeIndex]) { handleSelect(results[activeIndex].id); }
    else if (e.key === 'Escape') { onClose(); }
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ background: 'rgba(27,48,34,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="modal-panel-top w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
        style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Search input ─────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <Search size={16} className="shrink-0" style={{ color: 'var(--color-terracotta)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm trong atelier..."
            className="flex-1 bg-transparent text-sm outline-none font-sans"
            style={{ color: 'var(--text-primary)' }}
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="btn-icon w-6 h-6 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-active)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={12} />
            </button>
          ) : (
            <kbd
              className="text-[10px] rounded-full px-2 py-0.5 font-sans"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              Esc
            </kbd>
          )}
        </div>

        {/* ── Results ──────────────────────────────────────────── */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="py-10 flex flex-col items-center gap-2">
              {/* Animated seed dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: 'var(--color-terracotta)', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Đang tìm kiếm...</p>
            </div>
          ) : results.length === 0 && query.trim() ? (
            <div className="py-10 text-center">
              <p className="font-serif text-base" style={{ color: 'var(--text-secondary)' }}>Không tìm thấy kết quả</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Thử từ khoá khác</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-serif text-base italic" style={{ color: 'var(--text-secondary)' }}>
                Hạt mầm nào bạn đang tìm?
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Nhập từ khoá để bắt đầu</p>
            </div>
          ) : (
            <ul className="p-2">
              {results.map((doc, i) => (
                <li key={doc.id}>
                  <button
                    onClick={() => handleSelect(doc.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: i === activeIndex ? 'var(--color-forest)' : 'transparent',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={e => { if (i !== activeIndex) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (i !== activeIndex) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="text-xl shrink-0">
                      {doc.icon ?? <FileText size={18} style={{ color: 'var(--text-muted)' }} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: i === activeIndex ? 'var(--color-cream)' : 'var(--text-primary)' }}
                      >
                        {doc.title || 'Untitled'}
                      </p>
                      {doc.parentDocumentId === null && (
                        <p
                          className="text-[10px] uppercase tracking-wider mt-0.5"
                          style={{ color: i === activeIndex ? 'rgba(251,251,226,0.6)' : 'var(--text-muted)' }}
                        >
                          Trang gốc
                        </p>
                      )}
                    </div>
                    <div
                      className="flex items-center gap-1 text-[10px] shrink-0"
                      style={{ color: i === activeIndex ? 'rgba(251,251,226,0.6)' : 'var(--text-muted)' }}
                    >
                      <Clock size={10} />
                      {timeAgo(doc.updatedAt)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer hint ───────────────────────────────────────── */}
        <div
          className="px-5 py-2.5 border-t flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <span>↑↓ di chuyển</span>
          <span className="w-px h-3" style={{ background: 'var(--border)' }} />
          <span>↵ chọn</span>
          <span className="w-px h-3" style={{ background: 'var(--border)' }} />
          <span>Esc đóng</span>
        </div>
      </div>
    </div>
  );
}
