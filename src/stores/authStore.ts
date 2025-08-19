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
  initAuthListener: () => () => void; // Returns the unsubscribe function
  handleSignOut: () => Promise<void>;
}

/**
 * Creates a user profile document in Firestore on their first sign-up.
 * This is idempotent and will not overwrite existing profiles.
 * @param user The Firebase user object.
 */
const createUserProfileDocument = async (user: User) => {
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    const { displayName, email, photoURL } = user;
    try {
      await setDoc(userDocRef, {
        displayName,
        email,
        photoURL,
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

  /**
   * Initializes the Firebase Auth state listener. This is the central point
   * for handling user login and logout across the application.
   */
  initAuthListener: () => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await createUserProfileDocument(currentUser);
        set({ user: currentUser });
        
        // After user is confirmed, trigger data fetching in other stores
        useLogStore.getState().fetchLogs(currentUser.uid);
        useTodoStore.getState().fetchTodos(currentUser.uid);
      } else {
        set({ user: null });
        
        // Clear all user-specific data on sign out
        useLogStore.getState().resetLogs();
        useTodoStore.getState().resetTodos();
      }
      set({ isLoadingAuth: false });
    });
    return unsubscribe;
  },

  /**
   * Handles the user sign-out process with feedback.
   */
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