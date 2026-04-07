import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, Code, Quote, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useDebounce } from '../../hooks/useDebounce';
import EditorHeader from './EditorHeader';
import TaggingPanel from './TaggingPanel';
import SlashCommandMenu from './SlashCommandMenu';
import Breadcrumbs from '../Breadcrumbs';
import { EditorSkeleton } from '../SkeletonLoader';
import type { DocumentDetail } from '../../types';
import api from '../../lib/axios';

interface Props {
  documentId: string;
}

interface SlashMenuState {
  query: string;
  slashFrom: number;
  position: { top: number; left: number };
}

export default function DocumentEditor({ documentId }: Props) {
  const { updateDocument, archiveDocument } = useDocumentStore();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null);
  const slashMenuRef = useRef(slashMenu);
  useEffect(() => { slashMenuRef.current = slashMenu; }, [slashMenu]);

  useEffect(() => {
    let cancelled = false;
    api.get<DocumentDetail>(`/documents/${documentId}`)
      .then(({ data }) => {
        if (!cancelled) { setDocument(data); setIsLoading(false); }
      })
      .catch(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [documentId]);

  // Auto-update browser tab title
  useEffect(() => {
    if (document?.title) {
      window.document.title = `${document.title} — Notion Mini`;
    } else {
      window.document.title = 'Notion Mini';
    }
    return () => { window.document.title = 'Notion Mini'; };
  }, [document?.title]);

  const debouncedSave = useDebounce((content: string) => {
    updateDocument(documentId, { content });
  }, 500);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: 'Bắt đầu viết, nhấn "/" để chọn block...',
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none outline-none min-h-[60vh] px-16 py-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getHTML());
    },
  });

  // Detect slash command via transaction events
  useEffect(() => {
    if (!editor) return;

    const handleTransaction = () => {
      const { state, view } = editor;
      const { selection } = state;
      const { $from } = selection;

      // Get full text in current node up to cursor
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      const slashIndex = textBefore.lastIndexOf('/');

      if (slashIndex !== -1) {
        const query = textBefore.slice(slashIndex + 1);
        // Stop if query contains a space (user left the slash context)
        if (!query.includes(' ') && !query.includes('\n')) {
          const slashFrom = $from.start() + slashIndex;
          // coordsAtPos returns viewport-relative coords
          const coords = view.coordsAtPos(slashFrom + 1);
          setSlashMenu({
            query,
            slashFrom,
            position: { top: coords.bottom + 6, left: coords.left },
          });
          return;
        }
      }
      setSlashMenu(null);
    };

    editor.on('transaction', handleTransaction);
    return () => { editor.off('transaction', handleTransaction); };
  }, [editor]);

  // Set editor content on load
  useEffect(() => {
    if (editor && document?.content !== undefined) {
      const current = editor.getHTML();
      const incoming = document.content ?? '';
      if (current !== incoming) {
        editor.commands.setContent(incoming, { emitUpdate: false });
      }
    }
  }, [editor, document?.id, document?.content]);

  // Esc blurs editor (only when slash menu is NOT open — menu handles its own Esc)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !slashMenuRef.current) {
        editor?.commands.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editor]);

  const handleArchive = async () => {
    await archiveDocument(documentId);
    toast.success('Đã chuyển vào thùng rác');
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto" style={{ background: 'var(--bg-app)' }}>
        <EditorSkeleton />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Không tìm thấy trang.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto" style={{ background: 'var(--bg-app)' }}>
      {/* Toolbar */}
      <div
        className="sticky top-0 z-10 px-16 py-1.5 flex items-center gap-0.5 flex-wrap border-b"
        style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}
      >
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold">
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic">
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline">
          <UnderlineIcon size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} title="Strike">
          <Strikethrough size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} title="Inline code">
          <Code size={14} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })} title="H1">
          <Heading1 size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="H2">
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })} title="H3">
          <Heading3 size={14} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet list">
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Ordered list">
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Quote">
          <Quote size={14} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('left').run()} active={editor?.isActive({ textAlign: 'left' })} title="Align left">
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('center').run()} active={editor?.isActive({ textAlign: 'center' })} title="Align center">
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('right').run()} active={editor?.isActive({ textAlign: 'right' })} title="Align right">
          <AlignRight size={14} />
        </ToolbarButton>

        <div className="ml-auto">
          <ToolbarButton onClick={handleArchive} title="Chuyển vào thùng rác" className="text-red-500 hover:bg-red-500/10">
            <Trash2 size={14} />
          </ToolbarButton>
        </div>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs documentId={documentId} />

      {/* Header (cover + icon + title) */}
      <EditorHeader document={document} onUpdate={setDocument} />

      {/* Tagging panel */}
      <TaggingPanel document={document} onUpdate={setDocument} />

      {/* Editor body */}
      <EditorContent editor={editor} className="flex-1" />

      {/* Slash command menu — rendered as fixed overlay */}
      {slashMenu && editor && (
        <SlashCommandMenu
          editor={editor}
          query={slashMenu.query}
          slashFrom={slashMenu.slashFrom}
          position={slashMenu.position}
          onClose={() => setSlashMenu(null)}
        />
      )}
    </div>
  );
}

function Divider() {
  return <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }} />;
}

function ToolbarButton({
  onClick, active, title, children, className = ''
}: {
  onClick?: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${className}`}
      style={active
        ? { background: 'var(--bg-active)', color: 'var(--text-primary)' }
        : { color: 'var(--text-secondary)' }
      }
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
    >
      {children}
    </button>
  );
}
