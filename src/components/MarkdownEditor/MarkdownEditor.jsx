import React, { useState } from 'react';
import { marked } from 'marked';
import TiptapEditor from '../TiptapEditor';
import { textToTiptap, tiptapToMarkdown, isTiptapJson } from '../../utils/tiptapUtils';

marked.setOptions({
  breaks: true,
  gfm: true
});

export default function MarkdownEditor({ value, onChange, placeholder }) {
  const [mode, setMode] = useState('edit');

  // Convert value to Tiptap format for internal use
  const tiptapValue = textToTiptap(value);

  const handleChange = (tiptapJson) => {
    // Convert back to markdown for storage
    const markdown = tiptapToMarkdown(tiptapJson);
    onChange(markdown);
  };

  const renderPreview = () => {
    const markdown = typeof value === 'string' ? value : tiptapToMarkdown(value);
    if (!markdown) {
      return <p className="text-text-secondary italic">{placeholder}</p>;
    }
    return (
      <div
        className="markdown-preview prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: marked.parse(markdown) }}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toggle Button */}
      <div className="flex items-center justify-end mb-3">
        <div className="inline-flex rounded-md overflow-hidden border border-border">
          <button
            onClick={() => setMode('edit')}
            className={`px-3 py-1.5 text-sm transition-colors ${
              mode === 'edit'
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            编辑
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`px-3 py-1.5 text-sm transition-colors ${
              mode === 'preview'
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            预览
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {mode === 'edit' ? (
          <TiptapEditor
            value={tiptapValue}
            onChange={handleChange}
            placeholder={placeholder}
          />
        ) : (
          <div className="bg-bg-tertiary p-6 rounded-md border border-border min-h-[200px]">
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
}
