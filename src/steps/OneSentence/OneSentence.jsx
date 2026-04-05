import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';

export default function OneSentence() {
  const { project, dispatch } = useProject();
  const [value, setValue] = useState(project.steps.oneSentence);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    dispatch({ type: 'UPDATE_ONE_SENTENCE', payload: newValue });
  };

  const charCount = value.length;
  const isValid = charCount >= 15 && charCount <= 50;

  const handleComplete = () => {
    if (isValid) {
      dispatch({ type: 'COMPLETE_STEP', payload: 'oneSentence' });
      // Auto advance to next step
      dispatch({ type: 'SET_STEP', payload: 1 });
    }
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'oneSentence' });
  };

  const isCompleted = project.meta.completedSteps.includes('oneSentence');

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">一步总结</h1>
        <p className="text-text-secondary">用一句话概括你的整个故事。</p>
      </div>

      <div className="card mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-2">
            一句话总结
          </label>
          <textarea
            value={value}
            onChange={handleChange}
            placeholder="用15-50个字概括你的故事..."
            className="input-field font-serif text-lg leading-relaxed"
            rows={2}
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${isValid ? 'text-success' : 'text-text-secondary'}`}>
              {charCount}/50 字
              {!isValid && charCount > 0 && (
                <span className="ml-2">
                  {charCount < 15 ? `还需${15 - charCount}字` : '超出限制'}
                </span>
              )}
            </span>
            {isValid && !isCompleted && (
              <span className="text-xs text-success">字数符合要求</span>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card mb-6 bg-accent/5 border-accent/20">
        <h3 className="text-sm font-medium text-accent mb-2">写作提示</h3>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• 这是你故事的DNA</li>
          <li>• 包含主要角色和核心冲突</li>
          <li>• 能回答"如果...会怎样"</li>
          <li>• 参考格式: "当[触发事件]，[主角]必须[行动]，否则[后果]"</li>
        </ul>
      </div>

      {/* Complete Button */}
      <div className="flex justify-end">
        {isCompleted ? (
          <button
            onClick={handleUncomplete}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            已完成
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={!isValid}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            完成此步
          </button>
        )}
      </div>
    </div>
  );
}
