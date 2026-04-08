import { useState } from 'react';
import { ImageIcon, Smile, X } from 'lucide-react';
import { useUpdateDocument } from '../../hooks/useDocuments';
import { useDebounce } from '../../hooks/useDebounce';
import CoverPicker from '../CoverPicker';
import type { DocumentDetail } from '../../types';

const EMOJI_LIST = [
  '📄','📝','📌','📎','🗒️','🗂️','📁','📚','📖','💡',
  '🎯','🚀','⭐','🔥','✅','❤️','🎨','🧠','🛠️','🌱',
];

// Gray default cover applied when user first adds a cover
const DEFAULT_COVER = 'linear-gradient(135deg, #374151 0%, #1f2937 100%)';

interface Props {
  document: DocumentDetail;
  documentId: string;
}

export default function EditorHeader({ document, documentId }: Props) {
  const updateDocument = useUpdateDocument();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);

  const debouncedUpdateTitle = useDebounce((title: string) => {
    updateDocument.mutate({ id: documentId, data: { title } });
  }, 500);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedUpdateTitle(e.target.value);
  };

  const handleEmojiSelect = (emoji: string) => {
    updateDocument.mutate({ id: documentId, data: { icon: emoji } });
    setShowEmojiPicker(false);
  };

  const handleRemoveIcon = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateDocument.mutate({ id: documentId, data: { icon: null } });
  };

  // When user clicks "Thêm cover" for the first time → apply default gray cover
  const handleAddCover = () => {
    updateDocument.mutate({ id: documentId, data: { coverImage: DEFAULT_COVER } });
  };

  const handleCoverSelect = (value: string) => {
    updateDocument.mutate({ id: documentId, data: { coverImage: value } });
    setShowCoverPicker(false);
  };

  // Check if value is CSS (gradient/color) vs actual image URL/base64
  const isCssBackground = (v: string) =>
    v.startsWith('linear-gradient') ||
    v.startsWith('radial-gradient') ||
    v.startsWith('#') ||
    v.startsWith('rgb');

  const coverValue = document.coverImage;

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setIsHoveringHeader(true)}
        onMouseLeave={() => setIsHoveringHeader(false)}
      >
        {/* Cover */}
        {coverValue ? (
          <div className="relative w-full h-56 group">
            {isCssBackground(coverValue) ? (
              <div className="w-full h-full" style={{ background: coverValue }} />
            ) : (
              <img
                src={coverValue}
                alt="cover"
                className="w-full h-full"
                style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
              />
            )}
            {/* Only show "Đổi cover" button, no delete */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
              <button
                onClick={() => setShowCoverPicker(true)}
                className="text-xs bg-black/50 text-white px-3 py-1.5 rounded-md hover:bg-black/70 transition-colors flex items-center gap-1.5 backdrop-blur-sm"
              >
                <ImageIcon size={12} /> Đổi cover
              </button>
            </div>
          </div>
        ) : null}

        {/* Content area */}
        <div className="px-16 pt-8 pb-4">
          {/* Icon */}
          {document.icon ? (
            <div className="relative inline-block mb-3 group">
              <button
                className="text-5xl leading-none hover:opacity-80 transition-opacity"
                onClick={() => setShowEmojiPicker((v) => !v)}
              >
                {document.icon}
              </button>
              <button
                onClick={handleRemoveIcon}
                className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full transition-colors"
                style={{ background: 'var(--bg-active)', color: 'var(--text-secondary)' }}
              >
                <X size={10} />
              </button>
            </div>
          ) : null}

          {/* Hover action buttons */}
          {isHoveringHeader && (
            <div className="flex items-center gap-2 mb-3">
              {!document.icon && (
                <button
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Smile size={13} /> Thêm icon
                </button>
              )}
              {!document.coverImage && (
                <button
                  onClick={handleAddCover}
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <ImageIcon size={13} /> Thêm cover
                </button>
              )}
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div
              className="absolute z-20 border rounded-lg p-3 shadow-xl grid grid-cols-10 gap-1 top-full left-16 mt-1"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="text-xl rounded p-1 transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Title */}
          <input
            type="text"
            defaultValue={document.title}
            key={document.id}
            placeholder="Untitled"
            onChange={handleTitleChange}
            className="w-full bg-transparent text-4xl font-bold placeholder-(--text-muted) outline-none border-none resize-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Cover picker popup */}
      {showCoverPicker && (
        <CoverPicker
          onSelect={handleCoverSelect}
          onClose={() => setShowCoverPicker(false)}
        />
      )}
    </>
  );
}
