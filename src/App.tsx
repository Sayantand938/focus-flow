// D:/Coding/tauri-projects/focus-flow/src/App.tsx
import { useState, useEffect, useMemo } from "react";
import { auth, db } from "@/services/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  getDocs,
  writeBatch,
  arrayUnion,
  updateDoc,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { format } from "date-fns";

import Settings from "@/features/Settings/Settings";
import SideMenu from "@/components/layout/SideMenu";
import Auth from "@/features/Auth/Auth";
import Dashboard from "@/features/Dashboard/Dashboard";
import { Todo, DailyLog, StudiedDays } from "@/utils/types";
import FocusSheet from "@/features/FocusSheet/FocusSheet";
import { cn, hourToSlot } from "@/utils/utils";
import TodoList from "@/features/Todo/TodoList";
import { useTodos } from "@/hooks/useTodos";

/**
 * Creates a user profile document in Firestore if one doesn't already exist.
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

/**
 * Transforms the raw dailyLog data into the more robust StudiedDays object.
 */
function transformLogsToStudiedDays(dailyLogs: DailyLog[]): StudiedDays {
  const studiedDays: StudiedDays = {};

  for (const log of dailyLogs) {
    const parts = log.id.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    
    studiedDays[log.id] = {
      date: date,
      completedSlots: log.completedSlots,
      totalMinutes: log.completedSlots.length * 30, // Each slot is 30 minutes
    };
  }
  return studiedDays;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activePage, setActivePage] = useState("focus-sheet");
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);

  const {
    todos,
    setTodos,
    isLoadingTodos,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    handleSetTaskStatus,
    handleDeleteSelectedTasks,
    handleMarkSelectedTasksDone,
  } = useTodos(user);

  // Memoized transformation for all child components
  const studiedDays = useMemo(() => transformLogsToStudiedDays(dailyLogs), [dailyLogs]);

  useEffect(() => {
    const fetchAndSetDailyLogs = async (uid: string) => {
      setIsLoadingData(true);
      try {
        const logsCollectionRef = collection(db, "users", uid, "dailyLogs");
        const q = query(logsCollectionRef);
        const querySnapshot = await getDocs(q);

        const fetchedLogs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          completedSlots: doc.data().completedSlots || [],
        }));

        setDailyLogs(fetchedLogs);
      } catch (error) {
        console.error("Failed to load dailyLogs from Firestore:", error);
        setDailyLogs([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await createUserProfileDocument(currentUser);
        setUser(currentUser);
        await fetchAndSetDailyLogs(currentUser.uid);
      } else {
        setUser(null);
        setDailyLogs([]);
        setIsLoadingData(false);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleToggleSession = async (hour: number, isAdding: boolean) => {
    if (!user) return;
  
    const slot = hourToSlot(hour);
    if (slot === null) return;
  
    const docId = format(new Date(), "yyyy-MM-dd");
    const logDocRef = doc(db, "users", user.uid, "dailyLogs", docId);
  
    setDailyLogs(currentLogs => {
      const newLogs = [...currentLogs];
      const todayLogIndex = newLogs.findIndex(log => log.id === docId);

      if (isAdding) {
        if (todayLogIndex > -1) {
          if (!newLogs[todayLogIndex].completedSlots.includes(slot)) {
            newLogs[todayLogIndex].completedSlots.push(slot);
          }
        } else {
          newLogs.push({ id: docId, completedSlots: [slot] });
        }
      } else {
        if (todayLogIndex > -1) {
          newLogs[todayLogIndex].completedSlots = newLogs[todayLogIndex].completedSlots.filter((s: number) => s !== slot);
        }
      }
      return newLogs;
    });
  
    try {
      if (isAdding) {
        await setDoc(logDocRef, { completedSlots: arrayUnion(slot) }, { merge: true });
      } else {
        await updateDoc(logDocRef, { completedSlots: arrayRemove(slot) });
      }
    } catch (error) {
      console.error("Failed to update Firestore:", error);
    }
  };

  const handleResetData = async (): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    // Hold onto the original data for rollback on failure
    const originalDailyLogs = [...dailyLogs];
    const originalTodos = [...todos];
    
    // Optimistically clear the UI
    setDailyLogs([]);
    setTodos([]);

    try {
      const batch = writeBatch(db);
      const logsCollectionRef = collection(db, "users", user.uid, "dailyLogs");
      const logsSnapshot = await getDocs(logsCollectionRef);
      logsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      const todosCollectionRef = collection(db, "users", user.uid, "todos");
      const todosSnapshot = await getDocs(todosCollectionRef);
      todosSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
    } catch (error) {
      console.error("Error resetting data:", error);
      // Rollback the UI if the Firestore operation fails
      setDailyLogs(originalDailyLogs);
      setTodos(originalTodos);
      throw error;
    }
  };

  const handleImportData = async (data: { dailyLogs: Record<string, number[]>, todos: Todo[] }): Promise<void> => {
    if (!user) throw new Error('No user logged in');
  
    const newDailyLogs = Object.entries(data.dailyLogs).map(([id, completedSlots]) => ({ id, completedSlots }));
    setDailyLogs(newDailyLogs);
    setTodos(data.todos);
  
    try {
      const batch = writeBatch(db);
  
      const logsCollectionRef = collection(db, "users", user.uid, "dailyLogs");
      const logsSnapshot = await getDocs(logsCollectionRef);
      logsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  
      const todosCollectionRef = collection(db, "users", user.uid, "todos");
      const todosSnapshot = await getDocs(todosCollectionRef);
      todosSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  
      data.todos.forEach(todo => {
        const newDocRef = doc(collection(db, "users", user.uid, "todos"));
        const { id, ...todoData } = todo;
        batch.set(newDocRef, { ...todoData, createdAt: new Date(todo.createdAt) });
      });
  
      for (const [docId, slots] of Object.entries(data.dailyLogs)) {
        const logDocRef = doc(db, "users", user.uid, "dailyLogs", docId);
        batch.set(logDocRef, { completedSlots: slots });
      }
  
      await batch.commit();
    } catch (error) {
      console.error("Error during data import:", error);
      throw error;
    }
  };

  const renderContent = () => {
    const isAppLoading = (isLoadingData && activePage !== 'todo-list') || (isLoadingTodos && activePage === 'todo-list');
    
    if (isAppLoading) {
      return <div className="text-center text-muted-foreground"><p>Loading data...</p></div>;
    }

    if (!user) return null;

    switch (activePage) {
      case "focus-sheet":
        return <FocusSheet studiedDays={studiedDays} onToggleSession={handleToggleSession} />;
      case "dashboard":
        return <Dashboard user={user} studiedDays={studiedDays} />;
      case "todo-list":
        return <TodoList 
          todos={todos}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDelete={handleDeleteTask}
          onSetStatus={handleSetTaskStatus}
          onDeleteSelected={handleDeleteSelectedTasks}
          onMarkSelectedDone={handleMarkSelectedTasksDone}
        />;
      case "settings":
        return <Settings 
                  onResetData={handleResetData} 
                  onImportData={handleImportData}
                  dailyLogs={dailyLogs}
                  todos={todos}
                />;
      default:
        return <FocusSheet studiedDays={studiedDays} onToggleSession={handleToggleSession} />;
    }
  };
  
  if (isLoadingAuth) {
    return <div className="flex items-center justify-center h-screen bg-background"><p className="text-foreground">Authenticating...</p></div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="h-screen flex bg-background text-foreground">
      <SideMenu
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onSignOut={handleSignOut}
      />
      <main className={cn("flex-1 flex flex-col items-center overflow-y-auto min-h-screen", "p-4 sm:p-6 lg:p-8", "pt-28 md:pt-8", "pb-12 sm:pb-16")}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;