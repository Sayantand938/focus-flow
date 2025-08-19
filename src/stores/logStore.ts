// src/stores/logStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { 
  collection, doc, getDocs, query, writeBatch, 
  onSnapshot, setDoc, updateDoc, deleteField, increment
} from 'firebase/firestore';
import { db } from '@/shared/services/firebase';
import { DailyLog, StudiedDays } from '@/shared/lib/types';
import { format } from 'date-fns';
import { hourToSlot } from '@/shared/lib/utils';
import { useAuthStore } from './authStore';
import { memoize } from 'proxy-memoize';
import { toast } from 'sonner'; // <-- UPDATED IMPORT

interface LogState {
  dailyLogs: DailyLog[];
  isLoadingLogs: boolean;
  fetchLogs: (uid: string) => () => void;
  toggleSession: (hour: number, isAdding: boolean) => Promise<void>;
  updateSlotTag: (hour: number, tag: string) => Promise<void>;
  resetLogs: () => void;
  importLogs: (data: { dailyLogs: Record<string, { slots: Record<number, string>, totalSlots?: number }> }) => Promise<void>;
}

export const selectStudiedDays = memoize((state: LogState): StudiedDays => {
  const studiedDays: StudiedDays = {};
  for (const log of state.dailyLogs) {
    const parts = log.id.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const currentSlots = log.slots || {};
    const completedSlots = Object.keys(currentSlots).map(Number);
    const totalSlots = log.totalSlots || completedSlots.length;

    studiedDays[log.id] = {
      date: date,
      slots: currentSlots,
      completedSlots: completedSlots,
      totalSlots: totalSlots,
      totalMinutes: totalSlots * 30,
    };
  }
  return studiedDays;
});

export const selectTotalXp = memoize((state: LogState): number => {
  return state.dailyLogs.reduce((total, log) => {
    const totalSlots = log.totalSlots || Object.keys(log.slots || {}).length;
    return total + (totalSlots * 30);
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
      const fetchedLogs = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          slots: data.slots || {},
          totalSlots: data.totalSlots || Object.keys(data.slots || {}).length,
        };
      });
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
          todayLog = { id: docId, slots: {}, totalSlots: 0 };
          state.dailyLogs.push(todayLog);
        }
        if (todayLog.slots[slot] === undefined) {
            todayLog.slots[slot] = ""; 
            todayLog.totalSlots += 1;
        }
      } else {
        if (todayLog && todayLog.slots[slot] !== undefined) {
          delete todayLog.slots[slot];
          todayLog.totalSlots = Math.max(0, todayLog.totalSlots - 1);
        }
      }
    });

    try {
      const logDocRef = doc(db, "users", user.uid, "dailyLogs", docId);
      if (isAdding) {
        await setDoc(logDocRef, { slots: { [slot]: "" }, totalSlots: increment(1) }, { merge: true });
      } else {
        await updateDoc(logDocRef, { [`slots.${slot}`]: deleteField(), totalSlots: increment(-1) });
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
    if (get().dailyLogs.find(log => log.id === docId)?.slots[slot] === undefined) {
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

    const newDailyLogs = Object.entries(data.dailyLogs).map(([id, logData]) => {
      const slots = logData.slots || {};
      return { 
        id, 
        slots,
        totalSlots: logData.totalSlots ?? Object.keys(slots).length
      };
    });
    
    set({ dailyLogs: newDailyLogs });
    
    const batch = writeBatch(db);
    const logsCollectionRef = collection(db, "users", user.uid, "dailyLogs");
    const logsSnapshot = await getDocs(logsCollectionRef);
    
    logsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    for (const [docId, logData] of Object.entries(data.dailyLogs)) {
      const logDocRef = doc(db, "users", user.uid, "dailyLogs", docId);
      const slots = logData.slots || {};
      batch.set(logDocRef, { 
        slots,
        totalSlots: logData.totalSlots ?? Object.keys(slots).length
      });
    }
    
    await batch.commit();
  }
})));