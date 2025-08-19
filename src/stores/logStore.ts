// src/stores/logStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { 
  collection, doc, getDocs, query, writeBatch, 
  onSnapshot, setDoc, updateDoc, deleteField
} from 'firebase/firestore';
import { db } from '@/shared/services/firebase';
import { DailyLog, StudiedDays } from '@/shared/lib/types';
import { format } from 'date-fns';
import { hourToSlot } from '@/shared/lib/utils';
import { useAuthStore } from './authStore';
import { memoize } from 'proxy-memoize';
import toast from 'react-hot-toast';

interface LogState {
  dailyLogs: DailyLog[];
  isLoadingLogs: boolean;
  fetchLogs: (uid: string) => () => void;
  toggleSession: (hour: number, isAdding: boolean) => Promise<void>;
  updateSlotTag: (hour: number, tag: string) => Promise<void>;
  resetLogs: () => void;
  importLogs: (data: { dailyLogs: Record<string, { slots: Record<number, string> }> }) => Promise<void>;
}

export const selectStudiedDays = memoize((state: LogState): StudiedDays => {
  const studiedDays: StudiedDays = {};
  for (const log of state.dailyLogs) {
    const parts = log.id.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const currentSlots = log.slots || {};
    const completedSlots = Object.keys(currentSlots).map(Number);

    studiedDays[log.id] = {
      date: date,
      slots: currentSlots,
      completedSlots: completedSlots, // Derived from slots
      totalMinutes: completedSlots.length * 30, // Derived from slots
    };
  }
  return studiedDays;
});

export const selectTotalXp = memoize((state: LogState): number => {
  return state.dailyLogs.reduce((total, log) => {
    return total + (Object.keys(log.slots || {}).length * 30);
  }, 0);
});

export const useLogStore = create<LogState>()(immer((set, get) => ({
  dailyLogs: [],
  isLoadingLogs: true,
  fetchLogs: (uid: string) => {
    set({ isLoadingLogs: true });
    const logsCollectionRef = collection(db, "users", uid, "dailyLogs");
    const q = query(logsCollectionRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedLogs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        slots: doc.data().slots || {},
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
    
    set(state => {
      let todayLog = state.dailyLogs.find(log => log.id === docId);
      if (isAdding) {
        if (!todayLog) {
          todayLog = { id: docId, slots: {} };
          state.dailyLogs.push(todayLog);
        }
        todayLog.slots[slot] = ""; // Add with a default empty tag
      } else {
        if (todayLog) {
          delete todayLog.slots[slot];
        }
      }
    });

    try {
      const logDocRef = doc(db, "users", user.uid, "dailyLogs", docId);
      if (isAdding) {
        await setDoc(logDocRef, { slots: { [slot]: "" } }, { merge: true });
      } else {
        await updateDoc(logDocRef, { [`slots.${slot}`]: deleteField() });
      }
    } catch (error) {
      console.error("Failed to sync session:", error);
      toast.error("Failed to sync session.");
    }
  },
  updateSlotTag: async (hour, tag) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const slot = hourToSlot(hour);
    if (slot === null) return;

    const docId = format(new Date(), "yyyy-MM-dd");
    if (!get().dailyLogs.find(log => log.id === docId)?.slots[slot] === undefined) {
      toast.error("Can only tag a completed session.");
      return;
    }

    set(state => {
      const logToUpdate = state.dailyLogs.find(l => l.id === docId);
      if (logToUpdate) {
        logToUpdate.slots[slot] = tag;
      }
    });

    try {
      const logDocRef = doc(db, "users", user.uid, "dailyLogs", docId);
      await updateDoc(logDocRef, { [`slots.${slot}`]: tag });
    } catch (error) {
      console.error("Failed to sync tag:", error);
      toast.error("Failed to sync tag.");
    }
  },
  resetLogs: () => {
    set({ dailyLogs: [], isLoadingLogs: false });
  },
  importLogs: async (data) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('No user logged in');

    const newDailyLogs = Object.entries(data.dailyLogs).map(([id, logData]) => ({ 
      id, 
      slots: logData.slots || {} 
    }));
    
    set({ dailyLogs: newDailyLogs });
    
    const batch = writeBatch(db);
    const logsCollectionRef = collection(db, "users", user.uid, "dailyLogs");
    const logsSnapshot = await getDocs(logsCollectionRef);
    
    logsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    for (const [docId, logData] of Object.entries(data.dailyLogs)) {
      const logDocRef = doc(db, "users", user.uid, "dailyLogs", docId);
      batch.set(logDocRef, { slots: logData.slots || {} });
    }
    
    await batch.commit();
  }
})));