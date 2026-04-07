import { useEffect, useRef, useState } from 'react';
import { Search, X, FileText } from 'lucide-react';
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
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[activeIndex]) { handleSelect(results[activeIndex].id); }
    else if (e.key === 'Escape') { onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60" onClick={onClose}>
      <div
        className="border rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Search size={16} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm trang..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-sm py-6 animate-pulse" style={{ color: 'var(--text-muted)' }}>
              Đang tìm...
            </p>
          ) : results.length === 0 && query.trim() ? (
            <p className="text-center text-sm py-6" style={{ color: 'var(--text-muted)' }}>
              Không tìm thấy kết quả
            </p>
          ) : results.length === 0 ? (
            <p className="text-center text-sm py-6" style={{ color: 'var(--text-muted)' }}>
              Nhập từ khoá để tìm kiếm
            </p>
          ) : (
            <ul>
              {results.map((doc, i) => (
                <li key={doc.id}>
                  <button
                    onClick={() => handleSelect(doc.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{
                      background: i === activeIndex ? 'var(--bg-active)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (i !== activeIndex) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (i !== activeIndex) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="text-base shrink-0">
                      {doc.icon ?? <FileText size={16} style={{ color: 'var(--text-muted)' }} />}
                    </span>
                    <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {doc.title || 'Untitled'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t flex items-center gap-3 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span>↑↓ di chuyển</span>
          <span>↵ chọn</span>
          <span>Esc đóng</span>
        </div>
      </div>
    </div>
  );
}
