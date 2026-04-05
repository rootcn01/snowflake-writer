import React, { useState } from 'react';

export default function CollapsibleTips({ title, children }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="card mb-6 bg-accent/5 border-accent/20">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between text-sm font-medium text-accent focus:outline-none"
      >
        <span>{title || '提示'}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {!isCollapsed && (
        <div className="mt-3 pt-3 border-t border-accent/20">
          {children}
        </div>
      )}
    </div>
  );
}