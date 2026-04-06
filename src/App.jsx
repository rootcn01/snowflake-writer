import React from 'react';
import { ProjectProvider, useProject } from './store/ProjectContext';
import TopBar from './components/TopBar/TopBar';
import Sidebar from './components/Sidebar/Sidebar';
import Toast from './components/Toast/Toast';
import ProjectLibrary from './pages/ProjectLibrary';
import RelationGraph from './components/RelationGraph';
import Timeline from './components/Timeline';
import OneSentence from './steps/OneSentence/OneSentence';
import OneParagraph from './steps/OneParagraph/OneParagraph';
import CharacterSummary from './steps/CharacterSummary/CharacterSummary';
import StorySynopsis from './steps/StorySynopsis/StorySynopsis';
import CharacterDetails from './steps/CharacterDetails/CharacterDetails';
import SceneOutlines from './steps/SceneOutlines/SceneOutlines';
import SceneList from './steps/SceneList/SceneList';
import CharacterBackstories from './steps/CharacterBackstories/CharacterBackstories';
import SceneDescriptions from './steps/SceneDescriptions/SceneDescriptions';
import Chapters from './steps/Chapters';
import ExportModal from './components/ExportModal/ExportModal';
import BackupModal from './components/BackupModal';
import SettingsModal from './components/SettingsModal';

function AppContent() {
  const { currentStep, saveStatus, showExportModal, showBackupModal, showSettingsModal, showProjectLibrary, currentView } = useProject();

  const renderStep = () => {
    if (showProjectLibrary) {
      return <ProjectLibrary />;
    }

    // Visualizations
    if (currentView === 'relationGraph') {
      return <RelationGraph />;
    }
    if (currentView === 'timeline') {
      return <Timeline />;
    }

    switch (currentStep) {
      case 0:
        return <OneSentence />;
      case 1:
        return <OneParagraph />;
      case 2:
        return <CharacterSummary />;
      case 3:
        return <StorySynopsis />;
      case 4:
        return <CharacterDetails />;
      case 5:
        return <SceneOutlines />;
      case 6:
        return <SceneList />;
      case 7:
        return <CharacterBackstories />;
      case 8:
        return <SceneDescriptions />;
      case 9:
        return <Chapters />;
      default:
        return <ProjectLibrary />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {!showProjectLibrary && <TopBar />}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-8 px-4 pb-4">
        {renderStep()}
      </main>

      {/* Status Bar */}
      {!showProjectLibrary && (
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
      )}

      <Toast />
      {showExportModal && <ExportModal />}
      {showBackupModal && <BackupModal />}
      {showSettingsModal && <SettingsModal />}
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