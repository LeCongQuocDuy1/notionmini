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

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
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

  const handleSelect = (id: string) => {
    setActiveDocument(id);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      handleSelect(results[activeIndex].id);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60" onClick={onClose}>
      <div
        className="bg-[#1f1f1f] border border-neutral-700 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
          <Search size={16} className="text-neutral-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm trang..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-neutral-600"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-neutral-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-neutral-500 text-sm py-6 animate-pulse">Đang tìm...</p>
          ) : results.length === 0 && query.trim() ? (
            <p className="text-center text-neutral-600 text-sm py-6">Không tìm thấy kết quả</p>
          ) : results.length === 0 ? (
            <p className="text-center text-neutral-600 text-sm py-6">Nhập từ khoá để tìm kiếm</p>
          ) : (
            <ul>
              {results.map((doc, i) => (
                <li key={doc.id}>
                  <button
                    onClick={() => handleSelect(doc.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === activeIndex ? 'bg-neutral-700' : 'hover:bg-neutral-800'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">
                      {doc.icon ?? <FileText size={16} className="text-neutral-500" />}
                    </span>
                    <span className="flex-1 text-sm text-neutral-200 truncate">
                      {doc.title || 'Untitled'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-neutral-800 flex items-center gap-3 text-xs text-neutral-600">
          <span>↑↓ di chuyển</span>
          <span>↵ chọn</span>
          <span>Esc đóng</span>
        </div>
      </div>
    </div>
  );
}
