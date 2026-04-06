import React, { useState } from 'react';

export default function CollapsibleTips({ title, children }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors text-left"
      >
        <span>{title || '提示'}: {isCollapsed ? children?.props?.defaultText || '点击展开...' : ''}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {!isCollapsed && (
        <div className="mt-2 text-xs text-text-secondary leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}