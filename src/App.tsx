import { useState, useEffect } from "react";
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

import Settings from "@/pages/Settings/Settings";
import SideMenu from "@/components/SideMenu";
import { Auth } from "@/pages/Auth/Auth";
import Dashboard from "@/pages/Dashboard/Dashboard";
import { Session } from "@/utils/types";
import FocusSheet from "@/pages/FocusSheet/FocusSheet";
import { cn, hourToSlot, slotToHour } from "@/utils/utils";
import TodoList from "@/pages/Todo/TodoList";
import { useTodos } from "@/hooks/useTodos"; // Import the new hook

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
 * Transforms raw dailyLog documents from Firestore into Session[]
 */
function transformLogsToSessions(dailyLogs: { id: string; completedSlots: number[] }[]): Session[] {
  const allSessions: Session[] = [];
  for (const log of dailyLogs) {
    const parts = log.id.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    for (const slot of log.completedSlots) {
      const hour = slotToHour(slot);
      if (hour !== null) {
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);
        allSessions.push({ startTime, duration: 1800 });
      }
    }
  }
  return allSessions;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [activePage, setActivePage] = useState("focus-sheet");
  const [sessions, setSessions] = useState<Session[]>([]);

  // Use the custom hook to manage all todo-related state and logic
  const {
    todos,
    isLoadingTodos,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    handleSetTaskStatus,
    handleDeleteSelectedTasks,
    handleMarkSelectedTasksDone,
  } = useTodos(user);

  // Listen for Firebase auth state and fetch user-specific data
  useEffect(() => {
    const fetchAndSetSessions = async (uid: string) => {
      setIsLoadingSessions(true);
      try {
        const logsCollectionRef = collection(db, "users", uid, "dailyLogs");
        const q = query(logsCollectionRef);
        const querySnapshot = await getDocs(q);

        const dailyLogs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          completedSlots: doc.data().completedSlots || [],
        }));

        const transformedSessions = transformLogsToSessions(dailyLogs);
        setSessions(transformedSessions);
      } catch (error) {
        console.error("Failed to load sessions from Firestore:", error);
        setSessions([]);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await createUserProfileDocument(currentUser);
        setUser(currentUser);
        await fetchAndSetSessions(currentUser.uid);
        // Todo fetching is now handled by the useTodos hook
      } else {
        setUser(null);
        setSessions([]);
        setIsLoadingSessions(false);
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
  
    const day = new Date();
    const slot = hourToSlot(hour);
    if (slot === null) {
      console.error("Invalid hour provided for toggling session:", hour);
      return;
    }
  
    const docId = format(day, "yyyy-MM-dd");
    const logDocRef = doc(db, "users", user.uid, "dailyLogs", docId);
  
    if (isAdding) {
      const sessionTime = new Date(day);
      sessionTime.setHours(hour, 0, 0, 0);
      const newSession: Session = { startTime: sessionTime, duration: 1800 };
  
      setSessions((prevSessions) => [...prevSessions, newSession]);
  
      try {
        await setDoc(logDocRef, { completedSlots: arrayUnion(slot) }, { merge: true });
      } catch (error) {
        console.error("Failed to add session to Firestore:", error);
        setSessions((prevSessions) =>
          prevSessions.filter((s) => s.startTime.getTime() !== sessionTime.getTime())
        );
      }
    } else {
      const sessionTimeMs = new Date(day).setHours(hour, 0, 0, 0);
      const originalSessions = [...sessions];
      
      setSessions((prevSessions) =>
        prevSessions.filter((s) => s.startTime.getTime() !== sessionTimeMs)
      );
  
      try {
        await updateDoc(logDocRef, { completedSlots: arrayRemove(slot) });
      } catch (error) {
        console.error("Failed to remove session from Firestore:", error);
        setSessions(originalSessions);
      }
    }
  };

  const handleResetData = async (): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    const originalSessions = [...sessions];
    setActivePage('focus-sheet');
    setSessions([]);

    try {
      const logsCollectionRef = collection(db, "users", user.uid, "dailyLogs");
      const querySnapshot = await getDocs(logsCollectionRef);
      
      if (querySnapshot.empty) return;

      const batch = writeBatch(db);
      querySnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      console.error("Error resetting data:", error);
      setSessions(originalSessions);
      throw error;
    }
  };

  const renderContent = () => {
    const isLoadingData = (isLoadingSessions && activePage !== 'todo-list') || (isLoadingTodos && activePage === 'todo-list');
    
    if (isLoadingData) {
      const message = activePage === 'todo-list' ? 'Loading tasks...' : 'Loading sessions...';
      return <div className="text-center text-muted-foreground"><p>{message}</p></div>;
    }

    if (!user) return null;

    switch (activePage) {
      case "focus-sheet":
        return <FocusSheet sessions={sessions} onToggleSession={handleToggleSession} />;
      case "dashboard":
        return <Dashboard user={user} sessions={sessions} />;
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
        return <Settings onResetData={handleResetData} />;
      default:
        return <FocusSheet sessions={sessions} onToggleSession={handleToggleSession} />;
    }
  };
  
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-foreground">Authenticating...</p>
      </div>
    );
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
      <main
        className={cn(
          "flex-1 flex flex-col items-center overflow-y-auto min-h-screen",
          "p-4 sm:p-6 lg:p-8",
          "pt-20 md:pt-8",
          "pb-12 sm:pb-16"
        )}
      >
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
