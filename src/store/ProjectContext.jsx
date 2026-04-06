import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { syncStep2ToStep4 } from '../utils/markdownUtils';

const ProjectContext = createContext(null);

const initialState = {
  project: {
    id: uuidv4(),
    title: '未命名',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStep: 0,
    steps: {
      oneSentence: '',
      oneParagraph: [{ id: uuidv4(), label: '吸引点', content: '' }],
      characters: [],
      storySynopsis: '',
      characterDetails: [],
      sceneOutlines: [],
      scenes: [],
      characterBackstories: [],
      sceneDescriptions: [],
      chapters: []
    },
    meta: {
      completedSteps: [],
      relationships: [], // 关系图谱数据
      workflowTemplate: 'standard', // 'standard' | 'simplified'
      enabledSteps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] // 默认全部启用
    }
  },
  currentStep: 0,
  sidebarOpen: false,
  theme: localStorage.getItem('theme') || 'dark',
  saveStatus: 'saved',
  toast: null,
  showExportModal: false,
  showBackupModal: false,
  showSettingsModal: false,
  showProjectLibrary: true, // 项目库视图控制
  currentView: 'library', // 'library' | 'project' | 'relationGraph' | 'timeline'
  topBarSelector: null // { label, items: [{id, name, icon?}], onAdd, onSelect }
};

function projectReducer(state, action) {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, project: action.payload };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        project: {
          ...state.project,
          ...action.payload,
          updatedAt: new Date().toISOString()
        }
      };

    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };

    case 'SET_TOAST':
      return { ...state, toast: action.payload };

    case 'COMPLETE_STEP':
      const completedSteps = state.project.meta.completedSteps.includes(action.payload)
        ? state.project.meta.completedSteps
        : [...state.project.meta.completedSteps, action.payload];
      return {
        ...state,
        project: {
          ...state.project,
          meta: { ...state.project.meta, completedSteps }
        }
      };

    case 'UNCOMPLETE_STEP':
      return {
        ...state,
        project: {
          ...state.project,
          meta: {
            ...state.project.meta,
            completedSteps: state.project.meta.completedSteps.filter(s => s !== action.payload)
          }
        }
      };

    case 'UPDATE_ONE_SENTENCE':
      return {
        ...state,
        project: {
          ...state.project,
          steps: { ...state.project.steps, oneSentence: action.payload }
        }
      };

    case 'UPDATE_ONE_PARAGRAPH':
      return {
        ...state,
        project: {
          ...state.project,
          steps: {
            ...state.project.steps,
            oneParagraph: action.payload
          }
        }
      };

    case 'UPDATE_CHARACTERS':
      return {
        ...state,
        project: {
          ...state.project,
          steps: {
            ...state.project.steps,
            characters: action.payload
          }
        }
      };

    case 'SYNC_STORY_SYNOPSIS':
      // 将 Step 2 内容同步到 Step 4，保持扩展说明不变
      if (action.payload) {
        const merged = syncStep2ToStep4(action.payload, state.project.steps.storySynopsis);
        return {
          ...state,
          project: {
            ...state.project,
            steps: {
              ...state.project.steps,
              storySynopsis: merged
            }
          }
        };
      }
      return state;

    case 'UPDATE_STORY_SYNOPSIS':
      return {
        ...state,
        project: {
          ...state.project,
          steps: {
            ...state.project.steps,
            storySynopsis: action.payload
          }
        }
      };

    case 'UPDATE_CHARACTER_DETAILS':
      return {
        ...state,
        project: {
          ...state.project,
          steps: {
            ...state.project.steps,
            characterDetails: action.payload
          }
        }
      };

    case 'UPDATE_SCENE_OUTLINES':
      return {
        ...state,
        project: {
          ...state.project,
          steps: {
            ...state.project.steps,
            sceneOutlines: action.payload
          }
        }
      };

    case 'UPDATE_SCENES':
      return {
        ...state,
        project: {
          ...state.project,
          steps: { ...state.project.steps, scenes: action.payload }
        }
      };

    case 'UPDATE_CHARACTER_BACKSTORIES':
      return {
        ...state,
        project: {
          ...state.project,
          steps: {
            ...state.project.steps,
            characterBackstories: action.payload
          }
        }
      };

    case 'UPDATE_SCENE_DESCRIPTIONS':
      return {
        ...state,
        project: {
          ...state.project,
          steps: {
            ...state.project.steps,
            sceneDescriptions: action.payload
          }
        }
      };

    case 'UPDATE_CHAPTERS':
      return {
        ...state,
        project: {
          ...state.project,
          steps: {
            ...state.project.steps,
            chapters: action.payload
          }
        }
      };

    case 'SET_SHOW_EXPORT_MODAL':
      return { ...state, showExportModal: action.payload };

    case 'SET_SHOW_BACKUP_MODAL':
      return { ...state, showBackupModal: action.payload };

    case 'SET_TOPBAR_SELECTOR':
      return { ...state, topBarSelector: action.payload };

    case 'SET_SHOW_PROJECT_LIBRARY':
      return { ...state, showProjectLibrary: action.payload };

    case 'SET_CURRENT_VIEW':
      return {
        ...state,
        currentView: action.payload,
        showProjectLibrary: action.payload === 'library'
      };

    case 'UPDATE_RELATIONSHIPS':
      return {
        ...state,
        project: {
          ...state.project,
          meta: {
            ...state.project.meta,
            relationships: action.payload
          }
        }
      };

    case 'SET_SHOW_SETTINGS_MODAL':
      return { ...state, showSettingsModal: action.payload };

    case 'UPDATE_WORKFLOW_SETTINGS':
      return {
        ...state,
        project: {
          ...state.project,
          meta: {
            ...state.project.meta,
            workflowTemplate: action.payload.workflowTemplate,
            enabledSteps: action.payload.enabledSteps
          }
        }
      };

    default:
      return state;
  }
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  // Auto-save with debounce
  const saveProject = useCallback(async () => {
    if (window.electronAPI) {
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'saving' });
      const result = await window.electronAPI.saveProject(state.project);
      if (result.success) {
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'saved' });

        // Auto backup if enabled
        if (localStorage.getItem('autoBackup') !== 'false') {
          window.electronAPI.createBackup(state.project.id).catch(() => {});
        }
      } else {
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' });
        dispatch({ type: 'SET_TOAST', payload: { type: 'error', message: '保存失败: ' + result.error } });
      }
    }
  }, [state.project]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const steps = state.project.steps;
      if (steps.oneSentence ||
          steps.oneParagraph.some(p => p.content) ||
          steps.characters.length > 0 ||
          steps.storySynopsis ||
          steps.characterDetails.length > 0 ||
          steps.scenes.length > 0) {
        saveProject();
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [state.project, saveProject]);

  // Show toast
  const showToast = useCallback((type, message) => {
    dispatch({ type: 'SET_TOAST', payload: { type, message } });
    setTimeout(() => {
      dispatch({ type: 'SET_TOAST', payload: null });
    }, 3000);
  }, []);

  const value = {
    ...state,
    dispatch,
    saveProject,
    showToast
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
