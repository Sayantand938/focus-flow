// src/stores/logStore.ts
import { create } from 'zustand';
import { 
  collection, doc, getDocs, query, setDoc, updateDoc, writeBatch, 
  arrayUnion, arrayRemove, onSnapshot 
} from 'firebase/firestore';
import { db } from '@/shared/services/firebase';
import { DailyLog, Todo, StudiedDays } from '@/shared/lib/types';
import { format } from 'date-fns';
import { hourToSlot } from '@/shared/lib/utils';
import { useAuthStore } from './authStore';
import { useProgressionStore } from './progressionStore';
import { memoize } from 'proxy-memoize';

interface LogState {
  dailyLogs: DailyLog[];
  isLoadingLogs: boolean;
  fetchLogs: (uid: string) => () => void; // Returns an unsubscribe function
  toggleSession: (hour: number, isAdding: boolean) => Promise<void>;
  resetLogs: () => void;
  importLogs: (data: { dailyLogs: Record<string, number[]>, todos: Todo[] }) => Promise<void>;
}

export const selectStudiedDays = memoize((state: LogState): StudiedDays => {
  const studiedDays: StudiedDays = {};
  for (const log of state.dailyLogs) {
    const parts = log.id.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    studiedDays[log.id] = {
      date: date,
      completedSlots: log.completedSlots,
      totalMinutes: log.completedSlots.length * 30,
    };
  }
  return studiedDays;
});

export const useLogStore = create<LogState>((set, get) => ({
  dailyLogs: [],
  isLoadingLogs: true,
  fetchLogs: (uid: string) => {
    set({ isLoadingLogs: true });
    const logsCollectionRef = collection(db, "users", uid, "dailyLogs");
    const q = query(logsCollectionRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedLogs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        completedSlots: doc.data().completedSlots || [],
      }));
      set({ dailyLogs: fetchedLogs, isLoadingLogs: false });
    }, (error) => {
      console.error("Failed to listen to dailyLogs:", error);
      set({ dailyLogs: [], isLoadingLogs: false });
    });

    return unsubscribe;
  },
  toggleSession: async (hour, isAdding) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const slot = hourToSlot(hour);
    if (slot === null) return;

    const docId = format(new Date(), "yyyy-MM-dd");
    const logDocRef = doc(db, "users", user.uid, "dailyLogs", docId);
    
    // Optimistic UI updates are not strictly necessary with real-time listeners,
    // but they can make the UI feel even faster, so we'll keep them.
    const originalLogs = [...get().dailyLogs];

    set(state => {
      const newLogs = [...state.dailyLogs];
      let todayLog = newLogs.find(log => log.id === docId);
      if (isAdding) {
        if (todayLog) {
          if (!todayLog.completedSlots.includes(slot)) todayLog.completedSlots.push(slot);
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

    try {
      if (isAdding) {
        await setDoc(logDocRef, { completedSlots: arrayUnion(slot) }, { merge: true });
        useProgressionStore.getState().addXp(30);
      } else {
        await updateDoc(logDocRef, { completedSlots: arrayRemove(slot) });
        useProgressionStore.getState().addXp(-30);
      }
    } catch (error) {
      console.error("Failed to update Firestore, rolling back UI:", error);
      set({ dailyLogs: originalLogs }); 
    }
  },
  resetLogs: () => {
    set({ dailyLogs: [], isLoadingLogs: false });
  },
  importLogs: async (data) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('No user logged in');

    const newDailyLogs = Object.entries(data.dailyLogs).map(([id, completedSlots]) => ({ id, completedSlots }));
    set({ dailyLogs: newDailyLogs });
    
    const totalImportedXp = newDailyLogs.reduce((sum, log) => sum + log.completedSlots.length * 30, 0);
    useProgressionStore.getState().resetXp();
    useProgressionStore.getState().addXp(totalImportedXp);

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