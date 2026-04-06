import { useEffect, useState } from 'react';
import { X, RotateCcw, Trash2 } from 'lucide-react';
import api from '../lib/axios';
import { useDocumentStore } from '../stores/useDocumentStore';
import type { Document } from '../types';

interface Props {
  onClose: () => void;
}

export default function TrashModal({ onClose }: Props) {
  const { restoreDocument, deleteDocumentPermanently } = useDocumentStore();
  const [archivedDocs, setArchivedDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArchived = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<Document[]>('/documents?isArchived=true');
      setArchivedDocs(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleRestore = async (id: string) => {
    await restoreDocument(id);
    setArchivedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDelete = async (id: string) => {
    await deleteDocumentPermanently(id);
    setArchivedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[#1f1f1f] border border-neutral-700 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
            <Trash2 size={15} />
            Thùng rác
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-neutral-500 text-sm py-8 animate-pulse">Đang tải...</p>
          ) : archivedDocs.length === 0 ? (
            <p className="text-center text-neutral-600 text-sm py-8">Thùng rác trống</p>
          ) : (
            <ul className="divide-y divide-neutral-800">
              {archivedDocs.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition-colors">
                  <span className="text-lg flex-shrink-0">{doc.icon ?? '📄'}</span>
                  <span className="flex-1 text-sm text-neutral-300 truncate">
                    {doc.title || 'Untitled'}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleRestore(doc.id)}
                      title="Khôi phục"
                      className="p-1.5 rounded text-neutral-500 hover:text-green-400 hover:bg-green-400/10 transition-colors"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      title="Xóa vĩnh viễn"
                      className="p-1.5 rounded text-neutral-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
