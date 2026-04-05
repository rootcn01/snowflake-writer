import React from 'react';
import { ProjectProvider, useProject } from './store/ProjectContext';
import TopBar from './components/TopBar/TopBar';
import Sidebar from './components/Sidebar/Sidebar';
import Toast from './components/Toast/Toast';
import OneSentence from './steps/OneSentence/OneSentence';
import OneParagraph from './steps/OneParagraph/OneParagraph';
import SceneList from './steps/SceneList/SceneList';

function AppContent() {
  const { currentStep, saveStatus } = useProject();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <OneSentence />;
      case 1:
        return <OneParagraph />;
      case 2:
        return <SceneList />;
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
        <span>进度: {currentStep + 1}/3</span>
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
