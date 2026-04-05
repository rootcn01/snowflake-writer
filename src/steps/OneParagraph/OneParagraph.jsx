import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';

const defaultLabels = ['吸引点', '第一幕', '第二幕', '第三幕', '结局'];

function getLabel(index, total) {
  if (total === 1) return '唯一幕';
  if (total === 2) return ['第一幕', '第二幕'][index];
  if (index === 0) return '吸引点';
  if (index === total - 1) return '结局';
  return `第${index}幕`;
}

export default function OneParagraph() {
  const { project, dispatch } = useProject();
  const [values, setValues] = useState(
    project.steps.oneParagraph.length > 0
      ? project.steps.oneParagraph
      : ['', '', '']
  );
  const [actCount, setActCount] = useState(values.length);

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

  const addAct = () => {
    if (values.length < 10) {
      const newValues = [...values, ''];
      setValues(newValues);
      setActCount(newValues.length);
      dispatch({ type: 'UPDATE_ONE_PARAGRAPH', payload: newValues });
    }
  };

  const removeAct = () => {
    if (values.length > 1) {
      const newValues = values.slice(0, -1);
      setValues(newValues);
      setActCount(newValues.length);
      dispatch({ type: 'UPDATE_ONE_PARAGRAPH', payload: newValues });
    }
  };

  const handleComplete = () => {
    const allFilled = values.every(v => v.length > 0);
    const allValid = values.every((v, i) => v.length >= 30 && v.length <= 80);
    if (allFilled && allValid) {
      dispatch({ type: 'COMPLETE_STEP', payload: 'oneParagraph' });
      dispatch({ type: 'SET_STEP', payload: 2 });
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
        <h1 className="text-2xl font-semibold text-text-primary mb-2">一段式总结</h1>
        <p className="text-text-secondary">用一段话讲述你的完整故事。</p>
      </div>

      {/* Act Count Selector */}
      <div className="card mb-6 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-text-primary">幕数</span>
          <span className="text-xs text-text-secondary ml-2">({values.length}/10)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={removeAct}
            disabled={values.length <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-bg-tertiary text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="w-8 text-center text-text-primary font-medium">{values.length}</span>
          <button
            onClick={addAct}
            disabled={values.length >= 10}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-bg-tertiary text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {values.map((value, index) => (
          <div key={index} className="card">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-text-primary">
                {getLabel(index, values.length)}
              </label>
              <span className={`text-xs ${
                isValidForIndex(index) ? 'text-text-secondary' : 'text-warning'
              }`}>
                {charCounts[index]}/80 字
              </span>
            </div>
            <textarea
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`用30-80字描述${getLabel(index, values.length).toLowerCase()}...`}
              className="input-field font-serif text-base leading-relaxed"
              rows={2}
            />
            {value && charCounts[index] > 0 && charCounts[index] < 30 && (
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
          <span>{values.filter(v => v.length >= 30).length}/{values.length} 句</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(values.filter(v => v.length >= 30).length / values.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="card mb-6 bg-accent/5 border-accent/20">
        <h3 className="text-sm font-medium text-accent mb-2">写作提示</h3>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• <strong>吸引点:</strong> 设定主角和世界，引出核心冲突</li>
          {values.length >= 2 && <li>• <strong>第一幕:</strong> 主角遭遇事件，被迫采取行动</li>}
          {values.length >= 3 && <li>• <strong>中间幕:</strong> 主角面对障碍，跌入低谷</li>}
          {values.length >= 4 && <li>• <strong>高潮前:</strong> 主角绝地反击，准备最终对决</li>}
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