import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ProjectContext = createContext(null);

const initialState = {
  project: {
    id: uuidv4(),
    title: '未命名',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: {
      oneSentence: '',
      oneParagraph: ['', '', '', '', ''],
      scenes: []
    },
    meta: {
      completedSteps: []
    }
  },
  currentStep: 0,
  sidebarOpen: false,
  theme: localStorage.getItem('theme') || 'dark',
  saveStatus: 'saved',
  toast: null
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

    case 'UPDATE_SCENES':
      return {
        ...state,
        project: {
          ...state.project,
          steps: { ...state.project.steps, scenes: action.payload }
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
      } else {
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' });
        dispatch({ type: 'SET_TOAST', payload: { type: 'error', message: '保存失败: ' + result.error } });
      }
    }
  }, [state.project]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (state.project.steps.oneSentence ||
          state.project.steps.oneParagraph.some(s => s) ||
          state.project.steps.scenes.length > 0) {
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
