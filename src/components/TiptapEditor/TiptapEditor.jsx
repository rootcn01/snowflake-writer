import React, { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';

export default function TiptapEditor({
  value = '',
  onChange,
  placeholder = '开始写作...',
  editorRef,
  className = '',
  editable = true,
}) {
  // Determine if value is JSON (Tiptap format) or plain text/markdown
  const getInitialContent = useCallback(() => {
    if (!value) return '';
    if (typeof value === 'object') return value; // Already Tiptap JSON
    try {
      const parsed = JSON.parse(value);
      if (parsed.type) return parsed; // Tiptap JSON
      return value; // Plain text
    } catch {
      return value; // Plain text/markdown
    }
  }, [value]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-bg-tertiary p-3 rounded font-mono text-sm',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent underline cursor-pointer',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-500/30',
        },
      }),
    ],
    content: getInitialContent(),
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        // Store as Tiptap JSON
        onChange(editor.getJSON());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3',
        style: 'font-family: "Source Han Serif CN", "Source Han Serif", "Noto Serif SC", Georgia, serif;',
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(getInitialContent());
      if (currentContent !== newContent) {
        editor.commands.setContent(getInitialContent());
      }
    }
  }, [value, editor]);

  // Expose editor instance via ref
  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  // Keyboard shortcuts for formatting (Issue #21)
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e) => {
      // Only handle when editor is focused
      if (!editor.isFocused) return;

      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key === 'b') {
        e.preventDefault();
        editor.chain().focus().toggleBold().run();
      } else if (isMod && e.key === 'i') {
        e.preventDefault();
        editor.chain().focus().toggleItalic().run();
      } else if (isMod && e.key === 'u') {
        e.preventDefault();
        editor.chain().focus().toggleUnderline().run();
      } else if (isMod && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        editor.chain().focus().toggleStrike().run();
      } else if (isMod && e.key === '1') {
        e.preventDefault();
        editor.chain().focus().toggleHeading({ level: 1 }).run();
      } else if (isMod && e.key === '2') {
        e.preventDefault();
        editor.chain().focus().toggleHeading({ level: 2 }).run();
      } else if (isMod && e.key === '3') {
        e.preventDefault();
        editor.chain().focus().toggleHeading({ level: 3 }).run();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  // Expose editor instance
  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Editor Content */}
      <div
        className={`bg-bg-tertiary rounded-md border border-border overflow-hidden ${
          editable ? '' : 'opacity-75'
        }`}
      >
        <EditorContent
          editor={editor}
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
}

// Keyboard shortcut reference (for user reference):
// Ctrl+B: Bold
// Ctrl+I: Italic
// Ctrl+U: Underline
// Ctrl+Shift+S: Strikethrough
// Ctrl+1: Heading 1
// Ctrl+2: Heading 2
// Ctrl+3: Heading 3
