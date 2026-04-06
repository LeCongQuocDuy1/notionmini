import { useRef, useState } from 'react';
import { ImageIcon, Smile, X } from 'lucide-react';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useDebounce } from '../../hooks/useDebounce';
import type { DocumentDetail } from '../../types';

// Một bộ emoji phổ biến để chọn nhanh
const EMOJI_LIST = [
  '📄','📝','📌','📎','🗒️','🗂️','📁','📚','📖','💡',
  '🎯','🚀','⭐','🔥','✅','❤️','🎨','🧠','🛠️','🌱',
];

interface Props {
  document: DocumentDetail;
}

export default function EditorHeader({ document }: Props) {
  const { updateDocument } = useDocumentStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const debouncedUpdateTitle = useDebounce((title: string) => {
    updateDocument(document.id, { title });
  }, 500);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedUpdateTitle(e.target.value);
  };

  const handleEmojiSelect = (emoji: string) => {
    updateDocument(document.id, { icon: emoji });
    setShowEmojiPicker(false);
  };

  const handleRemoveIcon = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateDocument(document.id, { icon: null });
  };

  // Cover image: chuyển file thành base64 (demo, thực tế nên upload lên server)
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateDocument(document.id, { coverImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    updateDocument(document.id, { coverImage: null });
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHoveringHeader(true)}
      onMouseLeave={() => setIsHoveringHeader(false)}
    >
      {/* Cover Image */}
      {document.coverImage ? (
        <div className="relative w-full h-40 group">
          <img
            src={document.coverImage}
            alt="cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end gap-2 p-3">
            <button
              onClick={() => coverInputRef.current?.click()}
              className="text-xs bg-black/50 text-white px-2 py-1 rounded hover:bg-black/70 transition-colors flex items-center gap-1"
            >
              <ImageIcon size={12} /> Đổi cover
            </button>
            <button
              onClick={handleRemoveCover}
              className="text-xs bg-black/50 text-white px-2 py-1 rounded hover:bg-black/70 transition-colors flex items-center gap-1"
            >
              <X size={12} /> Xóa
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
              className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center w-4 h-4 bg-neutral-700 rounded-full text-neutral-300 hover:bg-neutral-600"
            >
              <X size={10} />
            </button>
          </div>
        ) : null}

        {/* Hover action buttons (Add icon / Add cover) */}
        {isHoveringHeader && !document.coverImage && (
          <div className="flex items-center gap-2 mb-3">
            {!document.icon && (
              <button
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <Smile size={13} /> Thêm icon
              </button>
            )}
            <button
              onClick={() => coverInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <ImageIcon size={13} /> Thêm cover
            </button>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute z-20 bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-xl grid grid-cols-10 gap-1 top-full left-16 mt-1">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="text-xl hover:bg-neutral-700 rounded p-1 transition-colors"
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
          key={document.id} // reset khi đổi document
          placeholder="Untitled"
          onChange={handleTitleChange}
          className="w-full bg-transparent text-4xl font-bold text-white placeholder-neutral-600 outline-none border-none resize-none"
        />
      </div>

      {/* Hidden file input for cover */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverChange}
      />
    </div>
  );
}
