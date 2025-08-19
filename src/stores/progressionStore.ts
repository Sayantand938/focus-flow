// src/stores/progressionStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// This store now holds no state. It exists as a placeholder in case you
// want to add other progression-related state later (e.g., achievements).
interface ProgressionState {}

// --- REMOVED unused 'set' parameter ---
export const useProgressionStore = create<ProgressionState>()(
  immer(() => ({}))
);