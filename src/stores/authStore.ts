// src/stores/authStore.ts
import { create } from 'zustand';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/shared/services/firebase';
import { useLogStore } from './logStore';
import { useTodoStore } from './todoStore';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isLoadingAuth: boolean;
  initAuthListener: () => () => void;
  handleSignOut: () => Promise<void>;
}

const createUserProfileDocument = async (user: User) => {
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    const { displayName, email, photoURL } = user;
    try {
      await setDoc(userDocRef, {
        displayName, email, photoURL,
        createdAt: serverTimestamp(),
        settings: { theme: 'dark' }
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoadingAuth: true,
  initAuthListener: () => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await createUserProfileDocument(currentUser);
        set({ user: currentUser });
        // Trigger fetches for all data stores
        useLogStore.getState().fetchLogs(currentUser.uid);
        useTodoStore.getState().fetchTodos(currentUser.uid);
      } else {
        set({ user: null });
        // Reset all data stores on logout
        useLogStore.getState().resetLogs();
        useTodoStore.getState().resetTodos();
      }
      set({ isLoadingAuth: false });
    });
    return unsubscribe;
  },
  handleSignOut: async () => {
    const promise = signOut(auth);
    toast.promise(promise, {
      loading: 'Signing out...',
      success: 'You have been signed out.',
      error: 'Failed to sign out.',
    });
    try {
      await promise;
    } catch (error) {
      console.error("Error signing out:", error);
    }
  },
}));