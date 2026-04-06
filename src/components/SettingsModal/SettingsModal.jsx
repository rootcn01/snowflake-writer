import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';

const stepDefinitions = [
  { id: 'oneSentence', label: 'Step 1: 一句话概括', shortLabel: '一句话概括' },
  { id: 'oneParagraph', label: 'Step 2: 一段式概括', shortLabel: '一段式概括' },
  { id: 'characters', label: 'Step 3: 人物概括', shortLabel: '人物概括' },
  { id: 'storySynopsis', label: 'Step 4: 初步大纲', shortLabel: '初步大纲' },
  { id: 'characterDetails', label: 'Step 5: 角色宝典', shortLabel: '角色宝典' },
  { id: 'sceneOutlines', label: 'Step 6: 完成大纲', shortLabel: '完成大纲' },
  { id: 'sceneList', label: 'Step 7: 场景清单', shortLabel: '场景清单' },
  { id: 'characterBackstories', label: 'Step 8: 人物小传', shortLabel: '人物小传' },
  { id: 'sceneDescriptions', label: 'Step 9: 规划场景', shortLabel: '规划场景' },
  { id: 'chapters', label: 'Step 10: 初稿', shortLabel: '初稿' }
];

// Simplified template skips step 5, 8, 9
const simplifiedTemplate = [0, 1, 2, 3, 5, 6, 9];
const standardTemplate = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function SettingsModal() {
  const { project, dispatch, showToast } = useProject();
  const [workflowTemplate, setWorkflowTemplate] = useState(project.meta?.workflowTemplate || 'standard');
  const [enabledSteps, setEnabledSteps] = useState(project.meta?.enabledSteps || standardTemplate);

  const handleClose = () => {
    dispatch({ type: 'SET_SHOW_SETTINGS_MODAL', payload: false });
  };

  const handleTemplateChange = (template) => {
    setWorkflowTemplate(template);
    if (template === 'simplified') {
      setEnabledSteps(simplifiedTemplate);
    } else {
      setEnabledSteps(standardTemplate);
    }
  };

  const handleStepToggle = (stepIndex) => {
    if (enabledSteps.includes(stepIndex)) {
      // Don't allow disabling the last step
      if (enabledSteps.length <= 1) {
        showToast('warning', '至少需要保留一个步骤');
        return;
      }
      setEnabledSteps(enabledSteps.filter(s => s !== stepIndex));
    } else {
      setEnabledSteps([...enabledSteps, stepIndex].sort((a, b) => a - b));
    }
    // Switch to custom template
    setWorkflowTemplate('custom');
  };

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_WORKFLOW_SETTINGS',
      payload: {
        workflowTemplate,
        enabledSteps
      }
    });
    showToast('success', '工作流设置已保存');
    handleClose();
  };

  const isSimplifiedSkipped = (stepIndex) => {
    return workflowTemplate === 'simplified' && simplifiedTemplate.includes(stepIndex);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-bg-secondary rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">工作流设置</h2>
            <p className="text-sm text-text-secondary mt-1">自定义写作流程</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Template Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-3">
              预设模板
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleTemplateChange('standard')}
                className={`p-4 rounded-lg border text-left transition-all ${
                  workflowTemplate === 'standard'
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📝</span>
                  <span className="font-medium text-text-primary">标准版</span>
                </div>
                <p className="text-xs text-text-secondary">
                  完整10步流程<br />雪花写作法标准流程
                </p>
              </button>

              <button
                onClick={() => handleTemplateChange('simplified')}
                className={`p-4 rounded-lg border text-left transition-all ${
                  workflowTemplate === 'simplified'
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚡</span>
                  <span className="font-medium text-text-primary">精简版</span>
                </div>
                <p className="text-xs text-text-secondary">
                  跳过Step 5/8/9<br />适合快速出稿
                </p>
              </button>
            </div>
          </div>

          {/* Step Visibility */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-primary">
                步骤可见性
              </label>
              {workflowTemplate === 'custom' && (
                <span className="text-xs text-accent">自定义</span>
              )}
            </div>
            <div className="space-y-2">
              {stepDefinitions.map((step, index) => {
                const isEnabled = enabledSteps.includes(index);
                const isSkipped = isSimplifiedSkipped(index);

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isEnabled
                        ? 'border-border bg-bg-tertiary/50'
                        : 'border-border/50 bg-bg-tertiary/20'
                    } ${isSkipped ? 'opacity-60' : ''}`}
                  >
                    <button
                      onClick={() => handleStepToggle(index)}
                      className={`w-10 h-6 rounded-full transition-all flex items-center justify-center ${
                        isEnabled
                          ? 'bg-accent'
                          : 'bg-bg-primary border border-border'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-2' : '-translate-x-2'
                        }`}
                      />
                    </button>
                    <div className="flex-1">
                      <span className={`text-sm ${isEnabled ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {step.label}
                      </span>
                      {isSkipped && (
                        <span className="ml-2 text-xs text-warning">精简版跳过</span>
                      )}
                    </div>
                    <span className="text-xs text-text-secondary">
                      {isEnabled ? '可见' : '隐藏'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-bg-tertiary/50 rounded-lg">
            <p className="text-xs text-text-secondary">
              <strong className="text-text-primary">提示：</strong>
              隐藏的步骤数据会被完整保留，切换回标准模板后可继续编辑。
              精简版会跳过角色宝典、人物小传和规划场景，适合已有完整构思的快速写作。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
