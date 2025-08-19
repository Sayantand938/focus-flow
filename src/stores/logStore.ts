// src/stores/logStore.ts
import { create } from 'zustand';
import { 
  collection, doc, getDocs, query, writeBatch, 
  arrayUnion, arrayRemove, onSnapshot, 
  setDoc, updateDoc // <-- ADDED setDoc and updateDoc BACK
} from 'firebase/firestore';
import { db } from '@/shared/services/firebase';
import { DailyLog, Todo, StudiedDays } from '@/shared/lib/types';
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

export const selectTotalXp = memoize((state: LogState): number => {
  return state.dailyLogs.reduce((total, log) => {
    return total + (log.completedSlots.length * 30);
  }, 0);
});

export const useLogStore = create<LogState>((set) => ({
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
    
    set(state => {
      const newLogs = [...state.dailyLogs];
      const docId = format(new Date(), "yyyy-MM-dd");
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
      const docId = format(new Date(), "yyyy-MM-dd");
      const logDocRef = doc(db, "users", user.uid, "dailyLogs", docId);
      
      if (isAdding) {
        await setDoc(logDocRef, { completedSlots: arrayUnion(slot) }, { merge: true });
      } else {
        await updateDoc(logDocRef, { completedSlots: arrayRemove(slot) });
      }

    } catch (error) {
      console.error("Failed to sync session:", error);
      toast.error("Failed to sync session.");
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