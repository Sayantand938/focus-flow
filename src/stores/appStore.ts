// src/stores/appStore.ts
import { create } from 'zustand';

interface AppState {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activePage: 'focus-sheet',
  setActivePage: (page) => set({ activePage: page }),
}));