import { useEffect, useState } from 'react';
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
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useDebounce } from '../../hooks/useDebounce';
import EditorHeader from './EditorHeader';
import TaggingPanel from './TaggingPanel';
import type { DocumentDetail } from '../../types';
import api from '../../lib/axios';

interface Props {
  documentId: string;
}

export default function DocumentEditor({ documentId }: Props) {
  const { updateDocument, archiveDocument } = useDocumentStore();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch full document detail (có content + tags)
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    api.get<DocumentDetail>(`/documents/${documentId}`)
      .then(({ data }) => {
        if (!cancelled) {
          setDocument(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [documentId]);

  const debouncedSave = useDebounce((content: string) => {
    updateDocument(documentId, { content });
  }, 800);

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
        class: 'prose prose-invert prose-lg max-w-none outline-none min-h-[60vh] px-16 py-4 text-neutral-200 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getHTML());
    },
  });

  // Khi document load xong, set content vào editor
  useEffect(() => {
    if (editor && document?.content !== undefined) {
      const current = editor.getHTML();
      const incoming = document.content ?? '';
      if (current !== incoming) {
        editor.commands.setContent(incoming, { emitUpdate: false });
      }
    }
  }, [editor, document?.id, document?.content]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-neutral-500 text-sm animate-pulse">Đang tải...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Không tìm thấy trang.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-[#191919]">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-[#191919] border-b border-neutral-800 px-16 py-1.5 flex items-center gap-0.5 flex-wrap">
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

        {/* Archive button */}
        <div className="ml-auto">
          <ToolbarButton
            onClick={() => archiveDocument(document.id)}
            title="Chuyển vào thùng rác"
            className="text-red-500 hover:bg-red-500/10"
          >
            <Trash2 size={14} />
          </ToolbarButton>
        </div>
      </div>

      {/* Header (cover + icon + title) */}
      <EditorHeader document={document} />

      {/* Tagging panel */}
      <TaggingPanel document={document} onUpdate={setDocument} />

      {/* Editor body */}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-neutral-700 mx-1" />;
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
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-neutral-700 text-white'
          : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
      } ${className}`}
    >
      {children}
    </button>
  );
}
