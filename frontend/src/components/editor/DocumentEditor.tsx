import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, Heading3, Trash2, GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useDocument, useUpdateDocument, useArchiveDocument } from '../../hooks/useDocuments';
import { useDebounce } from '../../hooks/useDebounce';
import EditorHeader from './EditorHeader';
import TaggingPanel from './TaggingPanel';
import SlashCommandMenu from './SlashCommandMenu';
import Breadcrumbs from '../Breadcrumbs';
import ConfirmDialog from '../ConfirmDialog';
import { EditorSkeleton } from '../SkeletonLoader';

interface Props {
  documentId: string;
}

interface SlashMenuState {
  query: string;
  slashFrom: number;
  position: { top: number; left: number };
}


export default function DocumentEditor({ documentId }: Props) {
  const { setActiveDocument } = useDocumentStore();
  const { data: document, isLoading } = useDocument(documentId);
  const updateDocument = useUpdateDocument();
  const archiveDocument = useArchiveDocument();

  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null);
  const slashMenuRef = useRef(slashMenu);
  useEffect(() => { slashMenuRef.current = slashMenu; }, [slashMenu]);

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Block handle — use refs to avoid re-renders on every mousemove
  const blockHandleElRef = useRef<HTMLDivElement>(null);
  const currentBlockNodeRef = useRef<Element | null>(null);
  const hideHandleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Block drag-to-reorder
  const draggedBlockRef = useRef<Element | null>(null);
  const dropIndicatorRef = useRef<HTMLDivElement>(null);
  const dropTargetRef = useRef<{ block: Element; insertAfter: boolean } | null>(null);
  const editorRef = useRef<Editor | null>(null);

  const cancelHideHandle = useCallback(() => {
    if (hideHandleTimerRef.current) clearTimeout(hideHandleTimerRef.current);
  }, []);

  const scheduleHideHandle = useCallback(() => {
    cancelHideHandle();
    hideHandleTimerRef.current = setTimeout(() => {
      if (blockHandleElRef.current) blockHandleElRef.current.style.display = 'none';
      currentBlockNodeRef.current = null;
    }, 300);
  }, [cancelHideHandle]);

  // ── Block drag handlers ────────────────────────────────────────
  const handleGripDragStart = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    const node = currentBlockNodeRef.current;
    if (!node) { e.preventDefault(); return; }
    draggedBlockRef.current = node;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // required for Firefox
    cancelHideHandle();
  }, [cancelHideHandle]);

  const BLOCK_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre, table, hr';

  const handleEditorDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const indicator = dropIndicatorRef.current;
    const container = editorContainerRef.current;
    if (!indicator || !container) return;

    const target = window.document.elementFromPoint(e.clientX, e.clientY);
    if (!target) { indicator.style.display = 'none'; return; }

    const block = target.closest(BLOCK_SELECTOR);
    if (!block || !container.contains(block) || block === draggedBlockRef.current) {
      indicator.style.display = 'none';
      dropTargetRef.current = null;
      return;
    }

    const rect = block.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const insertAfter = e.clientY > rect.top + rect.height / 2;
    const indicatorY = insertAfter
      ? rect.bottom - containerRect.top + container.scrollTop
      : rect.top - containerRect.top + container.scrollTop;

    indicator.style.top = `${indicatorY - 1}px`;
    indicator.style.display = 'block';
    dropTargetRef.current = { block, insertAfter };
  }, []);

  const handleEditorDragEnd = useCallback(() => {
    if (dropIndicatorRef.current) dropIndicatorRef.current.style.display = 'none';
    draggedBlockRef.current = null;
    dropTargetRef.current = null;
  }, []);

  const handleEditorDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dropIndicatorRef.current) dropIndicatorRef.current.style.display = 'none';

    const draggedBlock = draggedBlockRef.current;
    const dropTarget = dropTargetRef.current;
    draggedBlockRef.current = null;
    dropTargetRef.current = null;
    const ed = editorRef.current;
    if (!ed || !draggedBlock || !dropTarget) return;

    const view = ed.view;
    const { state } = ed;

    const dragPos = view.posAtDOM(draggedBlock, 0);
    const $drag = state.doc.resolve(dragPos);
    const dragFrom = $drag.before($drag.depth);
    const dragTo = $drag.after($drag.depth);
    const dragNode = state.doc.nodeAt(dragFrom);
    if (!dragNode) return;

    const targetPos = view.posAtDOM(dropTarget.block, 0);
    const $target = state.doc.resolve(targetPos);
    const targetFrom = $target.before($target.depth);
    const targetTo = $target.after($target.depth);

    if (dragFrom === targetFrom) return;

    const tr = state.tr;
    const nodeSize = dragNode.nodeSize;

    if (dragFrom < targetFrom) {
      // Dragged block is BEFORE target → delete first, then insert
      tr.delete(dragFrom, dragTo);
      const shift = dragTo - dragFrom; // = nodeSize
      const insertAt = dropTarget.insertAfter ? targetTo - shift : targetFrom - shift;
      tr.insert(insertAt, dragNode);
    } else {
      // Dragged block is AFTER target → insert first, then delete
      const insertAt = dropTarget.insertAfter ? targetTo : targetFrom;
      tr.insert(insertAt, dragNode);
      tr.delete(dragFrom + nodeSize, dragTo + nodeSize);
    }

    view.dispatch(tr);
    ed.commands.focus();
  }, []);

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
    updateDocument.mutate({ id: documentId, data: { content } });
  }, 500);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Tiêu đề...';
          return 'Nhấn "/" để chèn nội dung, hoặc bắt đầu viết...';
        },
        showOnlyCurrent: true,
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ allowBase64: true, inline: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
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

  // Keep editorRef in sync
  useEffect(() => { editorRef.current = editor; }, [editor]);

  // ── Block handle on mousemove — direct DOM update, no re-render ──
  const handleEditorMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const handle = blockHandleElRef.current;
    const container = editorContainerRef.current;
    if (!handle || !container) return;

    const target = window.document.elementFromPoint(e.clientX, e.clientY);
    if (!target) { scheduleHideHandle(); return; }

    // Chuột đang trên handle → cancel hide, giữ nguyên
    if (handle.contains(target as Node)) { cancelHideHandle(); return; }

    const blockSelector = 'p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre, table, hr';
    const block = target.closest(blockSelector);

    if (!block || !container.contains(block)) {
      scheduleHideHandle();
      return;
    }

    cancelHideHandle();
    const containerRect = container.getBoundingClientRect();
    const rect = block.getBoundingClientRect();
    const top = rect.top - containerRect.top + container.scrollTop + rect.height / 2 - 14;
    handle.style.top = `${top}px`;
    handle.style.display = 'flex';
    currentBlockNodeRef.current = block;
  }, [scheduleHideHandle, cancelHideHandle]);

  // ── Detect slash command ───────────────────────────────────────
  useEffect(() => {
    if (!editor) return;
    const handleTransaction = () => {
      const { state, view } = editor;
      const { $from } = state.selection;
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      const slashIndex = textBefore.lastIndexOf('/');

      if (slashIndex !== -1) {
        const query = textBefore.slice(slashIndex + 1);
        if (!query.includes(' ') && !query.includes('\n')) {
          const slashFrom = $from.start() + slashIndex;
          const coords = view.coordsAtPos(slashFrom + 1);
          setSlashMenu({ query, slashFrom, position: { top: coords.bottom + 6, left: coords.left } });
          return;
        }
      }
      setSlashMenu(null);
    };
    editor.on('transaction', handleTransaction);
    return () => { editor.off('transaction', handleTransaction); };
  }, [editor]);

  // ── Set editor content on load ─────────────────────────────────
  useEffect(() => {
    if (editor && document?.content !== undefined) {
      const incoming = document.content ?? '';
      if (editor.getHTML() !== incoming) {
        editor.commands.setContent(incoming, { emitUpdate: false });
      }
    }
  }, [editor, document?.id, document?.content]);

  // ── Esc blurs editor ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !slashMenuRef.current) editor?.commands.blur();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editor]);

  // ── Image upload handler ───────────────────────────────────────
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result as string }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Delete block ───────────────────────────────────────────────
  const handleDeleteBlock = () => {
    const node = currentBlockNodeRef.current;
    if (!editor || !node) return;
    const view = editor.view;
    const pos = view.posAtDOM(node, 0);
    if (pos === undefined) return;
    const resolvedPos = editor.state.doc.resolve(pos);
    editor
      .chain()
      .focus()
      .setNodeSelection(resolvedPos.before(resolvedPos.depth))
      .deleteSelection()
      .run();
    if (blockHandleElRef.current) blockHandleElRef.current.style.display = 'none';
    currentBlockNodeRef.current = null;
  };

  const handleArchiveConfirm = async () => {
    await archiveDocument.mutateAsync(documentId);
    setActiveDocument(null);
    setShowArchiveConfirm(false);
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
    <div className="page-enter flex-1 flex flex-col overflow-auto relative" style={{ background: 'var(--bg-app)' }}>
      {/* Tiny top bar — only archive button */}
      <div className="sticky top-0 z-10 flex justify-end px-4 py-1.5 border-b" style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}>
        <button
          onClick={() => setShowArchiveConfirm(true)}
          title="Chuyển vào thùng rác"
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Trash2 size={13} /> Xóa trang
        </button>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs documentId={documentId} />

      {/* Header */}
      <EditorHeader document={document} documentId={documentId} />

      {/* Tagging panel */}
      <TaggingPanel document={document} documentId={documentId} />

      {/* Editor with block handle */}
      <div
        ref={editorContainerRef}
        className="flex-1 relative"
        onMouseMove={handleEditorMouseMove}
        onMouseLeave={scheduleHideHandle}
        onDragOver={handleEditorDragOver}
        onDragEnd={handleEditorDragEnd}
        onDrop={handleEditorDrop}
      >
        {/* Drop indicator line */}
        <div
          ref={dropIndicatorRef}
          className="absolute left-16 right-4 h-0.5 bg-blue-400 rounded-full z-20 pointer-events-none"
          style={{ display: 'none' }}
        />

        {/* Floating block action bar — always in DOM, shown/hidden via style */}
        <div
          ref={blockHandleElRef}
          className="absolute items-center gap-0.5 z-10 select-none"
          style={{ display: 'none', left: '8px' }}
          onMouseEnter={cancelHideHandle}
          onMouseLeave={scheduleHideHandle}
        >
          <button
            draggable
            onDragStart={handleGripDragStart}
            className="w-7 h-7 flex items-center justify-center rounded opacity-0 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-black/10 dark:hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
            title="Kéo để di chuyển dòng"
          >
            <GripVertical size={15} />
          </button>
          <button
            onClick={handleDeleteBlock}
            className="w-7 h-7 flex items-center justify-center rounded opacity-0 hover:opacity-100 transition-opacity text-red-400 hover:bg-red-500/15"
            title="Xóa khối này"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Bubble menu — appears on text selection */}
        {editor && <InlineBubbleMenu editor={editor} />}

        <EditorContent editor={editor} className="flex-1" />
      </div>

      {/* Slash command menu */}
      {slashMenu && editor && (
        <SlashCommandMenu
          editor={editor}
          query={slashMenu.query}
          slashFrom={slashMenu.slashFrom}
          position={slashMenu.position}
          onClose={() => setSlashMenu(null)}
          onImageUpload={() => imageInputRef.current?.click()}
        />
      )}

      {/* Hidden image file input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />

      {/* Archive confirm dialog */}
      {showArchiveConfirm && (
        <ConfirmDialog
          title="Chuyển trang này vào thùng rác?"
          description="Bạn có thể khôi phục lại từ thùng rác bất kỳ lúc nào."
          confirmLabel="Xóa trang"
          onConfirm={handleArchiveConfirm}
          onCancel={() => setShowArchiveConfirm(false)}
        />
      )}
    </div>
  );
}

// ── Custom Bubble Menu (no @tiptap/react BubbleMenu in v3) ──────
function InlineBubbleMenu({ editor }: { editor: Editor }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const update = () => {
      const { from, to } = editor.state.selection;
      if (from === to) { setPos(null); return; }
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const midLeft = (start.left + end.left) / 2;
      setPos({ top: start.top - 44, left: midLeft });
    };
    editor.on('selectionUpdate', update);
    editor.on('blur', () => setPos(null));
    return () => { editor.off('selectionUpdate', update); editor.off('blur', () => setPos(null)); };
  }, [editor]);

  if (!pos) return null;

  return (
    <div
      className="fixed z-50 flex items-center gap-0.5 rounded-lg border shadow-xl px-1.5 py-1"
      style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)', background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <BubbleBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={13} /></BubbleBtn>
      <BubbleBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={13} /></BubbleBtn>
      <BubbleBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={13} /></BubbleBtn>
      <BubbleBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strike"><Strikethrough size={13} /></BubbleBtn>
      <BubbleBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code"><Code size={13} /></BubbleBtn>
      <div className="w-px h-4 mx-0.5" style={{ background: 'var(--border)' }} />
      <BubbleBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 size={13} /></BubbleBtn>
      <BubbleBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 size={13} /></BubbleBtn>
      <BubbleBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3"><Heading3 size={13} /></BubbleBtn>
    </div>
  );
}

function BubbleBtn({
  onClick, active, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded transition-colors"
      style={
        active
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
