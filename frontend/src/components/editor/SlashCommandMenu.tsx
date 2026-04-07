import { useEffect, useRef, useState } from 'react';
import {
  Type, Heading1, Heading2, Heading3, Heading4,
  List, ListOrdered, Quote, Code2, Minus,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';

// ── Command definitions ───────────────────────────────────────
interface SlashCommandDef {
  key: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  keywords: string[];
  action: (editor: Editor, from: number, to: number) => void;
}

const SLASH_COMMANDS: SlashCommandDef[] = [
  {
    key: 'text',
    label: 'Văn bản',
    icon: <Type size={15} />,
    keywords: ['text', 'paragraph', 'van ban', 'p'],
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).setParagraph().run(),
  },
  {
    key: 'h1',
    label: 'Đề mục 1',
    icon: <Heading1 size={15} />,
    shortcut: '#',
    keywords: ['h1', 'heading1', 'heading 1', 'de muc', 'tieu de', '1'],
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).setHeading({ level: 1 }).run(),
  },
  {
    key: 'h2',
    label: 'Đề mục 2',
    icon: <Heading2 size={15} />,
    shortcut: '##',
    keywords: ['h2', 'heading2', 'heading 2', 'de muc', '2'],
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).setHeading({ level: 2 }).run(),
  },
  {
    key: 'h3',
    label: 'Đề mục 3',
    icon: <Heading3 size={15} />,
    shortcut: '###',
    keywords: ['h3', 'heading3', 'heading 3', 'de muc', '3'],
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).setHeading({ level: 3 }).run(),
  },
  {
    key: 'h4',
    label: 'Đề mục 4',
    icon: <Heading4 size={15} />,
    shortcut: '####',
    keywords: ['h4', 'heading4', 'heading 4', 'de muc', '4'],
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).setHeading({ level: 4 }).run(),
  },
  {
    key: 'bullet',
    label: 'Danh sách có dấu đầu dòng',
    icon: <List size={15} />,
    shortcut: '-',
    keywords: ['bullet', 'list', 'ul', 'danh sach', 'dau dong', '-'],
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).toggleBulletList().run(),
  },
  {
    key: 'ordered',
    label: 'Danh sách được đánh số',
    icon: <ListOrdered size={15} />,
    shortcut: '1.',
    keywords: ['ordered', 'ol', 'numbered', 'danh sach so', 'danh so', '1'],
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).toggleOrderedList().run(),
  },
  {
    key: 'quote',
    label: 'Trích dẫn',
    icon: <Quote size={15} />,
    keywords: ['quote', 'blockquote', 'trich dan', 'citation', '>'],
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).toggleBlockquote().run(),
  },
  {
    key: 'code',
    label: 'Khối code',
    icon: <Code2 size={15} />,
    keywords: ['code', 'codeblock', 'pre', 'khoi code', '```'],
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).toggleCodeBlock().run(),
  },
  {
    key: 'divider',
    label: 'Đường phân cách',
    icon: <Minus size={15} />,
    keywords: ['divider', 'hr', 'horizontal', 'phan cach', 'line', '---'],
    action: (editor, from, to) =>
      editor.chain().focus().deleteRange({ from, to }).setHorizontalRule().run(),
  },
];

// ── Menu component ────────────────────────────────────────────
interface Props {
  editor: Editor;
  query: string;
  slashFrom: number;
  position: { top: number; left: number };
  onClose: () => void;
}

export default function SlashCommandMenu({ editor, query, slashFrom, position, onClose }: Props) {
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
    cmd.action(editor, slashFrom, to);
    onClose();
  };

  // Keyboard navigation — capture phase so it runs before the editor's own handlers
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

  return (
    <div
      className="fixed z-50 shadow-2xl rounded-lg border overflow-hidden w-72"
      style={{ top: position.top, left: position.left, background: 'var(--bg-surface)', borderColor: 'var(--border)', maxHeight: 360 }}
    >
      {/* Header */}
      <div className="px-3 py-2 text-xs font-medium border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
        Thành phần nội dung cơ bản
      </div>

      {/* List */}
      <div className="overflow-y-auto" style={{ maxHeight: 268 }}>
        {filtered.map((cmd, i) => (
          <button
            key={cmd.key}
            ref={i === activeIndex ? activeRef : null}
            onClick={() => apply(cmd)}
            onMouseEnter={() => setActiveIndex(i)}
            className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors"
            style={{ background: i === activeIndex ? 'var(--bg-active)' : 'transparent', color: 'var(--text-primary)' }}
          >
            <span
              className="w-7 h-7 flex items-center justify-center rounded shrink-0 border"
              style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              {cmd.icon}
            </span>
            <span className="flex-1">{cmd.label}</span>
            {cmd.shortcut && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{cmd.shortcut}</span>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t text-xs" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
        <span>↑↓ di chuyển · ↵ chọn</span>
        <span>Esc đóng menu</span>
      </div>
    </div>
  );
}
