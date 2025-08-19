// src/stores/authStore.ts
import { create } from 'zustand';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/shared/services/firebase';
import { useLogStore } from './logStore';
import { useTodoStore } from './todoStore';
import toast from 'react-hot-toast';

// This array will hold the unsubscribe functions for our real-time listeners.
let firestoreUnsubscribers: (() => void)[] = [];

interface AuthState {
  user: User | null;
  isLoadingAuth: boolean;
  initAuthListener: () => () => void; // Returns the auth state listener's unsubscribe function
  handleSignOut: () => Promise<void>;
}

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
        // You could initialize other user-specific fields here if needed
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
    // This is the main listener for Firebase Authentication state changes.
    const unsubscribeFromAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Whenever the user logs in or out, clean up any existing Firestore listeners.
      firestoreUnsubscribers.forEach(unsubscribe => unsubscribe());
      firestoreUnsubscribers = [];

      if (currentUser) {
        // User is logged in
        await createUserProfileDocument(currentUser);
        set({ user: currentUser });
        
        // Start the real-time listeners for logs and todos.
        // The fetch methods now return their own unsubscribe functions.
        const unsubscribeLogs = useLogStore.getState().fetchLogs(currentUser.uid);
        const unsubscribeTodos = useTodoStore.getState().fetchTodos(currentUser.uid);
        
        // Store these unsubscribe functions to be called on logout.
        firestoreUnsubscribers.push(unsubscribeLogs, unsubscribeTodos);

      } else {
        // User is logged out
        set({ user: null });
        // Reset the state of other stores.
        useLogStore.getState().resetLogs();
        useTodoStore.getState().resetTodos();
      }
      set({ isLoadingAuth: false });
    });

    // Return the function to unsubscribe from the auth listener itself.
    return unsubscribeFromAuth;
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