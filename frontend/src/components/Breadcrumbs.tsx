import { ChevronRight } from 'lucide-react';
import { useDocumentStore } from '../stores/useDocumentStore';

interface Props {
  documentId: string;
}

export default function Breadcrumbs({ documentId }: Props) {
  const { documents, setActiveDocument } = useDocumentStore();

  const chain: { id: string; title: string; icon: string | null }[] = [];
  let current = documents.find((d) => d.id === documentId);
  while (current) {
    chain.unshift({ id: current.id, title: current.title, icon: current.icon });
    if (current.parentDocumentId) {
      current = documents.find((d) => d.id === current!.parentDocumentId);
    } else {
      break;
    }
  }

  if (chain.length <= 1) return null;

  return (
    <div className="flex items-center gap-1 px-16 py-2 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
      {chain.map((item, i) => (
        <span key={item.id} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="shrink-0" style={{ color: 'var(--border)' }} />}
          <button
            onClick={() => i < chain.length - 1 && setActiveDocument(item.id)}
            className="flex items-center gap-1 truncate max-w-40 transition-colors"
            style={i === chain.length - 1
              ? { color: 'var(--text-secondary)', fontWeight: 500, cursor: 'default' }
              : { color: 'var(--text-muted)' }
            }
            onMouseEnter={e => { if (i < chain.length - 1) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { if (i < chain.length - 1) e.currentTarget.style.color = 'var(--text-muted)'; }}
            disabled={i === chain.length - 1}
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.title || 'Untitled'}</span>
          </button>
        </span>
      ))}
    </div>
  );
}
