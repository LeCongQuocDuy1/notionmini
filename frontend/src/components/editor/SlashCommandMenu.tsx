import { useEffect, useRef, useState } from 'react';
import {
  Type, Heading1, Heading2, Heading3, Heading4,
  List, ListOrdered, Quote, Code2, Minus,
  CheckSquare, Table, Image as ImageIcon, Video, Music, FileText,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';

interface SlashCommandDef {
  key: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  keywords: string[];
  group: 'basic' | 'media' | 'advanced';
  action: (editor: Editor, from: number, to: number, onImageUpload?: () => void) => void;
}

const SLASH_COMMANDS: SlashCommandDef[] = [
  // ── Basic ──────────────────────────────────────────────────────
  {
    key: 'text',
    label: 'Văn bản',
    icon: <Type size={15} />,
    keywords: ['text', 'paragraph', 'van ban', 'p'],
    group: 'basic',
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).setParagraph().run(),
  },
  {
    key: 'todo',
    label: 'Todo list',
    description: 'Danh sách checkbox',
    icon: <CheckSquare size={15} />,
    keywords: ['todo', 'checkbox', 'task', 'check', 'danh sach', 'viec can lam'],
    group: 'basic',
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).toggleTaskList().run(),
  },
  {
    key: 'bullet',
    label: 'Danh sách có dấu đầu dòng',
    icon: <List size={15} />,
    shortcut: '-',
    keywords: ['bullet', 'list', 'ul', 'danh sach', 'dau dong', '-'],
    group: 'basic',
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).toggleBulletList().run(),
  },
  {
    key: 'ordered',
    label: 'Danh sách đánh số',
    icon: <ListOrdered size={15} />,
    shortcut: '1.',
    keywords: ['ordered', 'ol', 'numbered', 'danh sach so', 'danh so', '1'],
    group: 'basic',
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).toggleOrderedList().run(),
  },
  {
    key: 'h1',
    label: 'Đề mục 1',
    icon: <Heading1 size={15} />,
    shortcut: '#',
    keywords: ['h1', 'heading1', 'heading 1', 'de muc', 'tieu de', '1'],
    group: 'basic',
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).setHeading({ level: 1 }).run(),
  },
  {
    key: 'h2',
    label: 'Đề mục 2',
    icon: <Heading2 size={15} />,
    shortcut: '##',
    keywords: ['h2', 'heading2', 'heading 2', 'de muc', '2'],
    group: 'basic',
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).setHeading({ level: 2 }).run(),
  },
  {
    key: 'h3',
    label: 'Đề mục 3',
    icon: <Heading3 size={15} />,
    shortcut: '###',
    keywords: ['h3', 'heading3', 'heading 3', 'de muc', '3'],
    group: 'basic',
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).setHeading({ level: 3 }).run(),
  },
  {
    key: 'h4',
    label: 'Đề mục 4',
    icon: <Heading4 size={15} />,
    shortcut: '####',
    keywords: ['h4', 'heading4', 'heading 4', 'de muc', '4'],
    group: 'basic',
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).setHeading({ level: 4 }).run(),
  },
  {
    key: 'quote',
    label: 'Trích dẫn',
    icon: <Quote size={15} />,
    keywords: ['quote', 'blockquote', 'trich dan', 'citation', '>'],
    group: 'basic',
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).toggleBlockquote().run(),
  },
  {
    key: 'code',
    label: 'Khối code',
    icon: <Code2 size={15} />,
    keywords: ['code', 'codeblock', 'pre', 'khoi code', '```'],
    group: 'basic',
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).toggleCodeBlock().run(),
  },
  {
    key: 'divider',
    label: 'Đường phân cách',
    icon: <Minus size={15} />,
    keywords: ['divider', 'hr', 'horizontal', 'phan cach', 'line', '---'],
    group: 'basic',
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).setHorizontalRule().run(),
  },

  // ── Advanced ──────────────────────────────────────────────────
  {
    key: 'table',
    label: 'Bảng',
    description: 'Tạo bảng 3×3',
    icon: <Table size={15} />,
    keywords: ['table', 'bang', 'grid', 'spreadsheet'],
    group: 'advanced',
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },

  // ── Media ─────────────────────────────────────────────────────
  {
    key: 'image',
    label: 'Hình ảnh',
    description: 'Tải ảnh từ máy tính',
    icon: <ImageIcon size={15} />,
    keywords: ['image', 'img', 'hinh anh', 'anh', 'photo', 'picture'],
    group: 'media',
    action: (editor, from, to, onImageUpload) => {
      editor.chain().focus().deleteRange({ from, to }).run();
      onImageUpload?.();
    },
  },
  {
    key: 'video',
    label: 'Video',
    description: 'Nhúng video từ URL',
    icon: <Video size={15} />,
    keywords: ['video', 'youtube', 'embed', 'phim'],
    group: 'media',
    action: (editor, from, to) => {
      editor.chain().focus().deleteRange({ from, to }).run();
      const url = window.prompt('Nhập URL video (YouTube, mp4...):');
      if (!url) return;
      const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
      if (isYoutube) {
        const videoId = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
        if (videoId) {
          editor.chain().focus().insertContent({
            type: 'paragraph',
            content: [{
              type: 'text',
              text: `[Video: ${url}]`,
            }],
          }).run();
        }
      } else {
        editor.chain().focus().insertContent(`<video controls src="${url}" style="max-width:100%;border-radius:8px"></video>`).run();
      }
    },
  },
  {
    key: 'audio',
    label: 'Audio',
    description: 'Nhúng âm thanh từ URL',
    icon: <Music size={15} />,
    keywords: ['audio', 'music', 'sound', 'nhac', 'am thanh'],
    group: 'media',
    action: (editor, from, to) => {
      editor.chain().focus().deleteRange({ from, to }).run();
      const url = window.prompt('Nhập URL audio (mp3, wav...):');
      if (!url) return;
      editor.chain().focus().insertContent(`<audio controls src="${url}" style="width:100%"></audio>`).run();
    },
  },
  {
    key: 'file',
    label: 'File',
    description: 'Thêm link tới file',
    icon: <FileText size={15} />,
    keywords: ['file', 'attachment', 'tap tin', 'dinh kem'],
    group: 'media',
    action: (editor, from, to) => {
      editor.chain().focus().deleteRange({ from, to }).run();
      const url = window.prompt('Nhập URL file:');
      if (!url) return;
      const name = url.split('/').pop() ?? 'file';
      editor.chain().focus().insertContent(`<a href="${url}" target="_blank">📎 ${name}</a>`).run();
    },
  },
];

const GROUP_LABELS: Record<string, string> = {
  basic: 'Thành phần cơ bản',
  advanced: 'Nâng cao',
  media: 'Media',
};

// ── Menu component ───────────────────────────────────────────────
interface Props {
  editor: Editor;
  query: string;
  slashFrom: number;
  position: { top: number; left: number };
  onClose: () => void;
  onImageUpload: () => void;
}

export default function SlashCommandMenu({ editor, query, slashFrom, position, onClose, onImageUpload }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  const filtered = query.trim()
    ? SLASH_COMMANDS.filter((cmd) =>
        cmd.keywords.some((kw) => kw.includes(query.toLowerCase())) ||
        cmd.label.toLowerCase().includes(query.toLowerCase())
      )
    : SLASH_COMMANDS;

  useEffect(() => { setActiveIndex(0); }, [query]);
  useEffect(() => { activeRef.current?.scrollIntoView({ block: 'nearest' }); }, [activeIndex]);

  const apply = (cmd: SlashCommandDef) => {
    const to = editor.state.selection.from;
    cmd.action(editor, slashFrom, to, onImageUpload);
    onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(filtered.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[activeIndex]) apply(filtered[activeIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, activeIndex]);

  if (filtered.length === 0) {
    return (
      <div
        className="fixed z-50 shadow-2xl rounded-lg border w-64 px-3 py-4 text-center text-xs"
        style={{ top: position.top, left: position.left, background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        Không tìm thấy lệnh nào
      </div>
    );
  }

  // Group items
  const groups = filtered.reduce<Record<string, { cmd: SlashCommandDef; globalIndex: number }[]>>((acc, cmd, i) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push({ cmd, globalIndex: i });
    return acc;
  }, {});

  return (
    <div
      className="fixed z-50 shadow-2xl rounded-lg border overflow-hidden w-72"
      style={{ top: position.top, left: position.left, background: 'var(--bg-surface)', borderColor: 'var(--border)', maxHeight: 400 }}
    >
      <div className="overflow-y-auto" style={{ maxHeight: 352 }}>
        {(['basic', 'advanced', 'media'] as const).map((group) => {
          const items = groups[group];
          if (!items?.length) return null;
          return (
            <div key={group}>
              <div
                className="px-3 py-1.5 text-xs font-semibold sticky top-0"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
              >
                {GROUP_LABELS[group]}
              </div>
              {items.map(({ cmd, globalIndex }) => (
                <button
                  key={cmd.key}
                  ref={globalIndex === activeIndex ? activeRef : null}
                  onClick={() => apply(cmd)}
                  onMouseEnter={() => setActiveIndex(globalIndex)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors"
                  style={{ background: globalIndex === activeIndex ? 'var(--bg-active)' : 'transparent', color: 'var(--text-primary)' }}
                >
                  <span
                    className="w-7 h-7 flex items-center justify-center rounded shrink-0 border"
                    style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    {cmd.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block">{cmd.label}</span>
                    {cmd.description && (
                      <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>{cmd.description}</span>
                    )}
                  </span>
                  {cmd.shortcut && (
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{cmd.shortcut}</span>
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 border-t text-xs" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
        <span>↑↓ di chuyển · ↵ chọn</span>
        <span>Esc đóng</span>
      </div>
    </div>
  );
}
