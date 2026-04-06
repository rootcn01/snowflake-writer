import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';

const AI_PROMPTS = {
  grammar: '请检查以下文本的语法错误，只返回修改后的文本，不要解释：\n\n',
  suggest: '请为以下文本提供写作建议和改进意见，用列表形式返回：\n\n',
  polish: '请润色以下文本，提升文笔，只返回润色后的内容：\n\n',
  continue: '请续写以下文本，保持相同的风格和节奏：\n\n',
  character: '请根据以下角色信息生成更详细的描述：\n\n',
  scene: '请根据以下场景信息生成更详细的描写：\n\n'
};

export default function AIAssistant() {
  const { project, dispatch, showToast } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    endpoint: localStorage.getItem('ai_endpoint') || 'https://api.openai.com/v1/chat/completions',
    apiKey: localStorage.getItem('ai_api_key') || '',
    model: localStorage.getItem('ai_model') || 'gpt-4o-mini'
  });
  const [showSettings, setShowSettings] = useState(false);
  const panelRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // Don't close if clicking on the trigger button
        if (!event.target.closest('[data-ai-trigger]')) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowSettings(false);
  };

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
    setOutputText('');
  };

  const handleApply = () => {
    if (outputText && selectedFeature) {
      // Copy to clipboard
      navigator.clipboard.writeText(outputText);
      showToast('success', 'AI 输出已复制到剪贴板');
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('ai_endpoint', apiConfig.endpoint);
    localStorage.setItem('ai_api_key', apiConfig.apiKey);
    localStorage.setItem('ai_model', apiConfig.model);
    showToast('success', 'AI 设置已保存');
    setShowSettings(false);
  };

  const handleSendToAI = async () => {
    if (!inputText.trim()) {
      showToast('warning', '请输入内容');
      return;
    }

    if (!apiConfig.apiKey) {
      showToast('error', '请先配置 API Key');
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setOutputText('');

    try {
      const prompt = AI_PROMPTS[selectedFeature] + inputText;

      const response = await fetch(apiConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: apiConfig.model,
          messages: [
            { role: 'system', content: '你是一位专业的写作助手，擅长中文写作。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      if (content) {
        setOutputText(content);
      } else {
        showToast('warning', '未收到有效回复');
      }
    } catch (error) {
      showToast('error', 'AI 请求失败: ' + error.message);
    }

    setIsLoading(false);
  };

  const features = [
    { id: 'grammar', label: '语法检查', icon: '✓', description: '检查语法错误' },
    { id: 'suggest', label: '写作建议', icon: '💡', description: '提供改进建议' },
    { id: 'polish', label: '润色', icon: '✨', description: '提升文笔' },
    { id: 'continue', label: '续写', icon: '▶', description: '继续写作' }
  ];

  return (
    <div ref={panelRef} className="relative">
      {/* Trigger Button */}
      <button
        data-ai-trigger
        onClick={handleToggle}
        className="btn-ghost flex items-center gap-2 text-sm"
        title="AI 写作助手"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="hidden sm:inline">AI</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-bg-secondary border border-border rounded-lg shadow-xl z-50 animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-medium text-text-primary">AI 写作助手</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                  showSettings ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                }`}
                title="设置"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {showSettings ? (
            /* Settings View */
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">API Endpoint</label>
                <input
                  type="text"
                  value={apiConfig.endpoint}
                  onChange={(e) => setApiConfig({ ...apiConfig, endpoint: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded text-sm text-text-primary focus:border-accent focus:outline-none"
                  placeholder="https://api.openai.com/v1/chat/completions"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">API Key</label>
                <input
                  type="password"
                  value={apiConfig.apiKey}
                  onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded text-sm text-text-primary focus:border-accent focus:outline-none"
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Model</label>
                <select
                  value={apiConfig.model}
                  onChange={(e) => setApiConfig({ ...apiConfig, model: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded text-sm text-text-primary focus:border-accent focus:outline-none"
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
              <button
                onClick={handleSaveConfig}
                className="w-full btn-primary"
              >
                保存设置
              </button>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-text-secondary">
                  <strong>支持的 API：</strong>
                </p>
                <ul className="mt-2 text-xs text-text-secondary space-y-1">
                  <li>• OpenAI API</li>
                  <li>• Claude API (通过 OpenAI 兼容格式)</li>
                  <li>• Ollama (本地模型)</li>
                  <li>• LM Studio</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Main View */
            <div className="p-4">
              {/* Feature Selection */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {features.map(feature => (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureSelect(feature.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedFeature === feature.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{feature.icon}</span>
                      <span className="text-sm font-medium text-text-primary">{feature.label}</span>
                    </div>
                    <p className="text-[10px] text-text-secondary">{feature.description}</p>
                  </button>
                ))}
              </div>

              {/* Input */}
              {selectedFeature && (
                <>
                  <div className="mb-4">
                    <label className="block text-xs text-text-secondary mb-1">输入内容</label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded text-sm text-text-primary focus:border-accent focus:outline-none resize-none"
                      rows={4}
                      placeholder="输入要处理的文本..."
                    />
                  </div>

                  <button
                    onClick={handleSendToAI}
                    disabled={isLoading}
                    className="w-full btn-primary mb-4 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        处理中...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        发送给 AI
                      </>
                    )}
                  </button>

                  {/* Output */}
                  {outputText && (
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-text-secondary">AI 输出</label>
                        <button
                          onClick={handleApply}
                          className="text-xs text-accent hover:text-accent-hover"
                        >
                          复制结果
                        </button>
                      </div>
                      <div className="p-3 bg-bg-tertiary rounded text-sm text-text-primary whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {outputText}
                      </div>
                    </div>
                  )}
                </>
              )}

              {!selectedFeature && (
                <div className="text-center py-8">
                  <p className="text-sm text-text-secondary">
                    选择上方功能开始使用
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
