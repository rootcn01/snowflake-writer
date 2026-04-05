import React from 'react';
import { useProject } from '../../store/ProjectContext';

export default function Toast() {
  const { toast } = useProject();

  if (!toast) return null;

  const bgColor = toast.type === 'success'
    ? 'border-l-success bg-success/10'
    : toast.type === 'error'
      ? 'border-l-red-500 bg-red-500/10'
      : 'border-l-accent bg-accent/10';

  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-md border-l-4 bg-bg-secondary ${bgColor} animate-slide-in shadow-lg`}>
      <div className="flex items-center gap-3">
        {toast.type === 'success' && (
          <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {toast.type === 'error' && (
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className="text-sm text-text-primary">{toast.message}</span>
        <button
          onClick={() => {/* dismiss */}}
          className="ml-2 text-text-secondary hover:text-text-primary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
