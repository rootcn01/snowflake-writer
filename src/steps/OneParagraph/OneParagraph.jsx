import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';
import CollapsibleTips from '../../components/CollapsibleTips/CollapsibleTips';
import { v4 as uuidv4 } from 'uuid';

const defaultLabels = ['吸引点', '第一幕', '第二幕', '第三幕', '结局'];

export default function OneParagraph() {
  const { project, dispatch } = useProject();
  const [values, setValues] = useState(
    project.steps.oneParagraph.length > 0
      ? project.steps.oneParagraph
      : [{ id: uuidv4(), label: '吸引点', content: '' }]
  );

  const handleContentChange = (index, content) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], content };
    setValues(newValues);
    dispatch({ type: 'UPDATE_ONE_PARAGRAPH', payload: newValues });
  };

  const handleLabelChange = (index, label) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], label };
    setValues(newValues);
    dispatch({ type: 'UPDATE_ONE_PARAGRAPH', payload: newValues });
  };

  const addParagraph = () => {
    if (values.length >= 10) return;
    const newIndex = values.length + 1;
    const newParagraph = {
      id: uuidv4(),
      label: `第${newIndex}幕`,
      content: ''
    };
    const newValues = [...values, newParagraph];
    setValues(newValues);
    dispatch({ type: 'UPDATE_ONE_PARAGRAPH', payload: newValues });
  };

  const removeParagraph = (index) => {
    if (values.length <= 1) return;
    const newValues = values.filter((_, i) => i !== index);
    setValues(newValues);
    dispatch({ type: 'UPDATE_ONE_PARAGRAPH', payload: newValues });
  };

  const charCounts = values.map(v => v.content.length);
  const isValidForIndex = (index) => {
    const count = charCounts[index];
    return count === 0 || (count >= 30 && count <= 80);
  };

  const handleComplete = () => {
    const allFilled = values.every(v => v.content.length > 0);
    const allValid = values.every((v, i) => v.content.length >= 30 && v.content.length <= 80);
    if (allFilled && allValid) {
      dispatch({ type: 'COMPLETE_STEP', payload: 'oneParagraph' });
      // Auto advance to next step
      dispatch({ type: 'SET_STEP', payload: 2 });
    }
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'oneParagraph' });
  };

  const isCompleted = project.meta.completedSteps.includes('oneParagraph');
  const allFilled = values.every(v => v.content.length > 0);
  const allValid = values.every((v, i) => v.content.length >= 30 && v.content.length <= 80);

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">一段式概括</h1>
        <p className="text-text-secondary">用多幕讲述你的完整故事。每一幕用30-80字描述。</p>
      </div>

      <div className="space-y-4 mb-6">
        {values.map((paragraph, index) => (
          <div key={paragraph.id} className="card group relative">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={paragraph.label}
                  onChange={(e) => handleLabelChange(index, e.target.value)}
                  className="text-sm font-medium text-text-primary bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none transition-colors"
                  placeholder="幕名"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${
                  isValidForIndex(index) ? 'text-text-secondary' : 'text-warning'
                }`}>
                  {charCounts[index]}/80 字
                </span>
                {values.length > 1 && (
                  <button
                    onClick={() => removeParagraph(index)}
                    className="w-6 h-6 flex items-center justify-center rounded text-text-secondary hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="删除此幕"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={paragraph.content}
              onChange={(e) => handleContentChange(index, e.target.value)}
              placeholder={`用30-80字讲述${paragraph.label}...`}
              className="input-field font-serif text-base leading-relaxed"
              rows={2}
            />
            {paragraph.content && charCounts[index] > 0 && charCounts[index] < 30 && (
              <p className="text-xs text-warning mt-1">
                字数偏少，建议至少30字
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add Paragraph Button */}
      {values.length < 10 && (
        <div className="mb-6">
          <button
            onClick={addParagraph}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加一幕
          </button>
        </div>
      )}

      {/* Tips */}
      <CollapsibleTips title="写作提示">
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• <strong>吸引点:</strong> 设定主角和世界，引出核心冲突</li>
          <li>• <strong>第一幕:</strong> 主角遭遇事件，被迫采取行动</li>
          <li>• <strong>第二幕:</strong> 主角面对障碍，跌入低谷</li>
          <li>• <strong>第三幕:</strong> 主角绝地反击，准备最终对决</li>
          <li>• <strong>结局:</strong> 高潮过后，恢复平衡</li>
        </ul>
      </CollapsibleTips>

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