import React from 'react';
import { ProjectProvider, useProject } from './store/ProjectContext';
import TopBar from './components/TopBar/TopBar';
import Sidebar from './components/Sidebar/Sidebar';
import Toast from './components/Toast/Toast';
import OneSentence from './steps/OneSentence/OneSentence';
import OneParagraph from './steps/OneParagraph/OneParagraph';
import CharacterSummary from './steps/CharacterSummary/CharacterSummary';
import CharacterDetails from './steps/CharacterDetails/CharacterDetails';
import SceneList from './steps/SceneList/SceneList';
import ExportModal from './components/ExportModal/ExportModal';

function AppContent() {
  const { currentStep, saveStatus, showExportModal } = useProject();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <OneSentence />;
      case 1:
        return <OneParagraph />;
      case 2:
        return <CharacterSummary />;
      case 3:
        // Story Synopsis - placeholder
        return (
          <div className="max-w-content mx-auto animate-fade-in">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-text-primary mb-2">初步大纲</h1>
              <p className="text-text-secondary">扩展为4-5页的详细故事摘要。</p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-center py-12">
                Step 4 功能开发中...
              </p>
            </div>
          </div>
        );
      case 4:
        return <CharacterDetails />;
      case 5:
        // Scene Outlines - placeholder
        return (
          <div className="max-w-content mx-auto animate-fade-in">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-text-primary mb-2">完成大纲</h1>
              <p className="text-text-secondary">每个场景的4句话描述。</p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-center py-12">
                Step 6 功能开发中...
              </p>
            </div>
          </div>
        );
      case 6:
        return <SceneList />;
      case 7:
        // Character Backstories - placeholder
        return (
          <div className="max-w-content mx-auto animate-fade-in">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-text-primary mb-2">人物小传</h1>
              <p className="text-text-secondary">每个角色的深度背景描述。</p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-center py-12">
                Step 8 功能开发中...
              </p>
            </div>
          </div>
        );
      case 8:
        // Scene Descriptions - placeholder
        return (
          <div className="max-w-content mx-auto animate-fade-in">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-text-primary mb-2">规划场景</h1>
              <p className="text-text-secondary">每个场景的详细描述。</p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-center py-12">
                Step 9 功能开发中...
              </p>
            </div>
          </div>
        );
      case 9:
        // Chapters - placeholder
        return (
          <div className="max-w-content mx-auto animate-fade-in">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-text-primary mb-2">初稿</h1>
              <p className="text-text-secondary">撰写完整故事初稿。</p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-center py-12">
                Step 10 功能开发中...
              </p>
            </div>
          </div>
        );
      default:
        return <OneSentence />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <TopBar />
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-8 px-4 pb-4">
        {renderStep()}
      </main>

      {/* Status Bar */}
      <footer className="h-8 bg-bg-secondary border-t border-border flex items-center justify-between px-4 text-xs text-text-secondary">
        <span>进度: {currentStep + 1}/10</span>
        <span>
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已保存
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              保存中...
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-red-500">
              保存失败
            </span>
          )}
        </span>
      </footer>

      <Toast />
      {showExportModal && <ExportModal />}
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}