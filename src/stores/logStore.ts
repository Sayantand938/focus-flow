// src/stores/logStore.ts
import { create } from 'zustand';
import { 
  collection, doc, getDocs, query, setDoc, updateDoc, writeBatch, 
  arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { db } from '@/shared/services/firebase';
import { DailyLog, Todo } from '@/shared/lib/types';
import { format } from 'date-fns';
import { hourToSlot } from '@/shared/lib/utils';
import { useAuthStore } from './authStore';

interface LogState {
  dailyLogs: DailyLog[];
  isLoadingLogs: boolean;
  fetchLogs: (uid: string) => Promise<void>;
  toggleSession: (hour: number, isAdding: boolean) => Promise<void>;
  resetLogs: () => void;
  importLogs: (data: { dailyLogs: Record<string, number[]>, todos: Todo[] }) => Promise<void>;
}

export const useLogStore = create<LogState>((set, get) => ({
  dailyLogs: [],
  isLoadingLogs: true,
  fetchLogs: async (uid: string) => {
    set({ isLoadingLogs: true });
    try {
      const logsCollectionRef = collection(db, "users", uid, "dailyLogs");
      const q = query(logsCollectionRef);
      const querySnapshot = await getDocs(q);
      const fetchedLogs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        completedSlots: doc.data().completedSlots || [],
      }));
      set({ dailyLogs: fetchedLogs });
    } catch (error) {
      console.error("Failed to load dailyLogs from Firestore:", error);
      set({ dailyLogs: [] });
    } finally {
      set({ isLoadingLogs: false });
    }
  },
  toggleSession: async (hour, isAdding) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const slot = hourToSlot(hour);
    if (slot === null) return;

    const docId = format(new Date(), "yyyy-MM-dd");
    const logDocRef = doc(db, "users", user.uid, "dailyLogs", docId);
    
    const originalLogs = [...get().dailyLogs];

    // Optimistic update
    set(state => {
      const newLogs = [...state.dailyLogs];
      let todayLog = newLogs.find(log => log.id === docId);
      if (isAdding) {
        if (todayLog) {
          if (!todayLog.completedSlots.includes(slot)) {
            todayLog.completedSlots.push(slot);
          }
        } else {
          newLogs.push({ id: docId, completedSlots: [slot] });
        }
      } else {
        if (todayLog) {
          todayLog.completedSlots = todayLog.completedSlots.filter(s => s !== slot);
        }
      }
      return { dailyLogs: newLogs };
    });

    // Firestore operation
    try {
      if (isAdding) {
        await setDoc(logDocRef, { completedSlots: arrayUnion(slot) }, { merge: true });
      } else {
        await updateDoc(logDocRef, { completedSlots: arrayRemove(slot) });
      }
    } catch (error) {
      console.error("Failed to update Firestore, rolling back:", error);
      set({ dailyLogs: originalLogs }); // Rollback on failure
    }
  },
  resetLogs: () => {
    set({ dailyLogs: [], isLoadingLogs: false });
  },
  importLogs: async (data) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('No user logged in');

    // Optimistic UI update
    const newDailyLogs = Object.entries(data.dailyLogs).map(([id, completedSlots]) => ({ id, completedSlots }));
    set({ dailyLogs: newDailyLogs });

    // This operation is destructive, so no easy rollback. The logic is kept similar to original.
    const batch = writeBatch(db);
    const logsCollectionRef = collection(db, "users", user.uid, "dailyLogs");
    const logsSnapshot = await getDocs(logsCollectionRef);
    logsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    for (const [docId, slots] of Object.entries(data.dailyLogs)) {
      const logDocRef = doc(db, "users", user.uid, "dailyLogs", docId);
      batch.set(logDocRef, { completedSlots: slots });
    }

    await batch.commit();
  }
}));