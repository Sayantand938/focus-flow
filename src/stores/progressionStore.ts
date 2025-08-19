// src/stores/progressionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ProgressionState {
  totalXp: number;
  addXp: (amount: number) => void;
  resetXp: () => void; // For development/testing
}

export const useProgressionStore = create<ProgressionState>()(
  persist(
    immer((set) => ({
      totalXp: 0,
      addXp: (amount) => {
        set((state) => {
          state.totalXp += amount;
          if (state.totalXp < 0) {
            state.totalXp = 0;
          }
        });
      },
      resetXp: () => {
        set({ totalXp: 0 });
      }
    })),
    {
      name: 'focus-flow-progression-storage',
    }
  )
);