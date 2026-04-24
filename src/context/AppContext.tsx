import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { SubnetResult } from '../core/subnet';
import { IPv6Result } from '../core/ipv6';
import { VLSMEntry } from '../core/vlsm';
import {
  Project,
  saveToHistory,
  getHistory,
  saveProject,
  getProjects,
  deleteProject as dbDeleteProject,
  createNewProject,
} from '../db/indexeddb';

// ─── State ───────────────────────────────────────────────────────────────────

export type CalcResult = SubnetResult | IPv6Result;

interface AppState {
  theme: 'dark' | 'light';
  activeTab: 'ipv4' | 'ipv6' | 'vlsm';
  history: CalcResult[];
  projects: Project[];
  activeProject: Project | null;
  vlsmResults: VLSMEntry[];
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_TAB'; tab: AppState['activeTab'] }
  | { type: 'ADD_HISTORY'; result: CalcResult }
  | { type: 'SET_HISTORY'; history: CalcResult[] }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_PROJECTS'; projects: Project[] }
  | { type: 'SET_ACTIVE_PROJECT'; project: Project | null }
  | { type: 'SET_VLSM_RESULTS'; results: VLSMEntry[] }
  | { type: 'UPDATE_PROJECT'; project: Project };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
    case 'ADD_HISTORY':
      return { ...state, history: [action.result, ...state.history].slice(0, 100) };
    case 'SET_HISTORY':
      return { ...state, history: action.history };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    case 'SET_PROJECTS':
      return { ...state, projects: action.projects };
    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProject: action.project };
    case 'SET_VLSM_RESULTS':
      return { ...state, vlsmResults: action.results };
    case 'UPDATE_PROJECT': {
      const updated = state.projects.map((p) =>
        p.id === action.project.id ? action.project : p
      );
      return {
        ...state,
        projects: updated,
        activeProject:
          state.activeProject?.id === action.project.id ? action.project : state.activeProject,
      };
    }
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addResult: (result: CalcResult) => void;
  createProject: (name: string, description?: string) => void;
  removeProject: (id: string) => void;
  addToProject: (projectId: string, result: CalcResult) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    theme: 'dark',
    activeTab: 'ipv4',
    history: [],
    projects: [],
    activeProject: null,
    vlsmResults: [],
  });

  // Load from IndexedDB on mount
  useEffect(() => {
    getHistory().then((h) => dispatch({ type: 'SET_HISTORY', history: h }));
    getProjects().then((p) => dispatch({ type: 'SET_PROJECTS', projects: p }));
  }, []);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const addResult = useCallback((result: CalcResult) => {
    dispatch({ type: 'ADD_HISTORY', result });
    saveToHistory(result);
  }, []);

  const createProject = useCallback((name: string, description = '') => {
    const project = createNewProject(name, description);
    saveProject(project);
    dispatch({ type: 'SET_PROJECTS', projects: [] });
    getProjects().then((p) => dispatch({ type: 'SET_PROJECTS', projects: p }));
  }, []);

  const removeProject = useCallback((id: string) => {
    dbDeleteProject(id);
    getProjects().then((p) => dispatch({ type: 'SET_PROJECTS', projects: p }));
    dispatch({ type: 'SET_ACTIVE_PROJECT', project: null });
  }, []);

  const addToProject = useCallback((projectId: string, result: CalcResult) => {
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return;
    const updated = {
      ...project,
      calculations: [...project.calculations, result],
      updatedAt: Date.now(),
    };
    saveProject(updated);
    dispatch({ type: 'UPDATE_PROJECT', project: updated });
  }, [state.projects]);

  return (
    <AppContext.Provider value={{ state, dispatch, addResult, createProject, removeProject, addToProject }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
