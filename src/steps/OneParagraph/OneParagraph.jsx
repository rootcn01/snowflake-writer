import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';

const labels = ['Hook (吸引点)', '第一幕', '第二幕', '第三幕', 'Resolution (结局)'];

export default function OneParagraph() {
  const { project, dispatch } = useProject();
  const [values, setValues] = useState(project.steps.oneParagraph);

  const handleChange = (index, value) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    dispatch({ type: 'UPDATE_ONE_PARAGRAPH', payload: newValues });
  };

  const charCounts = values.map(v => v.length);
  const isValidForIndex = (index) => {
    const count = charCounts[index];
    return count === 0 || (count >= 30 && count <= 80);
  };

  const handleComplete = () => {
    const allFilled = values.every(v => v.length > 0);
    const allValid = values.every((v, i) => v.length >= 30 && v.length <= 80);
    if (allFilled && allValid) {
      dispatch({ type: 'COMPLETE_STEP', payload: 'oneParagraph' });
    }
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'oneParagraph' });
  };

  const isCompleted = project.meta.completedSteps.includes('oneParagraph');
  const allFilled = values.every(v => v.length > 0);
  const allValid = values.every((v, i) => v.length >= 30 && v.length <= 80);

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">二段式总结</h1>
        <p className="text-text-secondary">用五句话讲述你的完整故事。</p>
      </div>

      <div className="space-y-4 mb-6">
        {labels.map((label, index) => (
          <div key={index} className="card">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-text-primary">
                第{index + 1}句 - {label}
              </label>
              <span className={`text-xs ${
                isValidForIndex(index) ? 'text-text-secondary' : 'text-warning'
              }`}>
                {charCounts[index]}/80 字
              </span>
            </div>
            <textarea
              value={values[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`用30-80字讲述${label.toLowerCase()}...`}
              className="input-field font-serif text-base leading-relaxed"
              rows={2}
            />
            {values[index] && charCounts[index] > 0 && charCounts[index] < 30 && (
              <p className="text-xs text-warning mt-1">
                字数偏少，建议至少30字
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-text-secondary mb-2">
          <span>完成进度</span>
          <span>{values.filter(v => v.length >= 30).length}/{labels.length} 句</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(values.filter(v => v.length >= 30).length / labels.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="card mb-6 bg-accent/5 border-accent/20">
        <h3 className="text-sm font-medium text-accent mb-2">写作提示</h3>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• <strong>Hook:</strong> 设定主角和世界，引出核心冲突</li>
          <li>• <strong>第一幕:</strong> 主角遭遇事件，被迫采取行动</li>
          <li>• <strong>第二幕:</strong> 主角面对障碍，跌入低谷</li>
          <li>• <strong>第三幕:</strong> 主角绝地反击，准备最终对决</li>
          <li>• <strong>结局:</strong> 高潮过后，恢复平衡</li>
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
            disabled={!allFilled || !allValid}
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
