import React, { useState } from 'react';
import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true
});

export default function MarkdownEditor({ value, onChange, placeholder }) {
  const [mode, setMode] = useState('edit');

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const renderPreview = () => {
    if (!value) {
      return <p className="text-text-secondary italic">{placeholder}</p>;
    }
    return (
      <div
        className="markdown-preview"
        dangerouslySetInnerHTML={{ __html: marked.parse(value) }}
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
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full h-full min-h-[200px] bg-bg-tertiary text-text-primary font-mono text-base
                       p-4 rounded-md border border-border resize-none focus:border-accent focus:outline-none
                       placeholder-text-secondary"
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
