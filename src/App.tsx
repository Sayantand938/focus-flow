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
  addDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { format } from "date-fns";

import Settings from "@/pages/Settings/Settings";
import SideMenu from "@/components/SideMenu";
import { Auth } from "@/pages/Auth/Auth";
import Dashboard from "@/pages/Dashboard/Dashboard";
import { Session, Todo, TodoStatus } from "@/utils/types";
import FocusSheet from "@/pages/FocusSheet/FocusSheet";
import { cn, hourToSlot, slotToHour } from "@/utils/utils";
import TodoList from "@/pages/Todo/TodoList";

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
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);

  // Listen for Firebase auth state and fetch data accordingly
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

    const fetchAndSetTodos = async (uid: string) => {
      setIsLoadingTodos(true);
      try {
        const todosCollectionRef = collection(db, "users", uid, "todos");
        const q = query(todosCollectionRef);
        const querySnapshot = await getDocs(q);
        const fetchedTodos = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                description: data.description,
                tag: data.tag,
                priority: data.priority,
                status: data.status,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            } as Todo;
        });
        setTodos(fetchedTodos);
      } catch (error) {
          console.error("Failed to load todos from Firestore:", error);
          setTodos([]);
      } finally {
          setIsLoadingTodos(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await createUserProfileDocument(currentUser);
        setUser(currentUser);
        await fetchAndSetSessions(currentUser.uid);
        await fetchAndSetTodos(currentUser.uid);
      } else {
        setUser(null);
        setSessions([]);
        setTodos([]);
        setIsLoadingSessions(false);
        setIsLoadingTodos(false);
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

  // --- TODO CRUD Handlers with Optimistic UI ---

  const handleAddTask = async (values: Omit<Todo, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    const tempId = `temp-${Date.now()}`;
    const newTask: Todo = {
        id: tempId,
        ...values,
        createdAt: new Date().toISOString(),
    };
    
    setTodos(prev => [...prev, newTask]);

    try {
        const { id, ...taskData } = newTask;
        const docRef = await addDoc(collection(db, "users", user.uid, "todos"), {
            ...taskData,
            createdAt: new Date(taskData.createdAt),
        });
        setTodos(prev => prev.map(t => (t.id === tempId ? { ...t, id: docRef.id } : t)));
    } catch (error) {
        console.error("Failed to add task to Firestore:", error);
        setTodos(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const handleUpdateTask = async (updatedTask: Todo) => {
      if (!user) return;

      const originalTodos = [...todos];
      setTodos(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

      try {
          const { id, createdAt, ...taskDataForUpdate } = updatedTask;
          const docRef = doc(db, "users", user.uid, "todos", id);
          await updateDoc(docRef, taskDataForUpdate);
      } catch (error) {
          console.error("Failed to update task in Firestore:", error);
          setTodos(originalTodos);
      }
  };

  const handleDeleteTask = async (id: string) => {
      if (!user) return;
      
      const originalTodos = [...todos];
      setTodos(prev => prev.filter(t => t.id !== id));

      try {
          await deleteDoc(doc(db, "users", user.uid, "todos", id));
      } catch (error) {
          console.error("Failed to delete task from Firestore:", error);
          setTodos(originalTodos);
      }
  };

  const handleSetTaskStatus = (id: string, status: TodoStatus) => {
      const task = todos.find(t => t.id === id);
      if (task) {
        handleUpdateTask({ ...task, status });
      }
  };

  const handleDeleteSelectedTasks = async (ids: string[]) => {
      if (!user) return;
      
      const originalTodos = [...todos];
      setTodos(prev => prev.filter(t => !ids.includes(t.id)));

      try {
          const batch = writeBatch(db);
          ids.forEach(id => {
              const docRef = doc(db, "users", user.uid, "todos", id);
              batch.delete(docRef);
          });
          await batch.commit();
      } catch (error) {
          console.error("Failed to delete selected tasks from Firestore:", error);
          setTodos(originalTodos);
      }
  };

  const handleMarkSelectedTasksDone = async (ids: string[]) => {
      if (!user) return;

      const originalTodos = [...todos];
      setTodos(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: 'done' } : t));

      try {
          const batch = writeBatch(db);
          ids.forEach(id => {
              const docRef = doc(db, "users", user.uid, "todos", id);
              batch.update(docRef, { status: 'done' });
          });
          await batch.commit();
      } catch (error) {
          console.error("Failed to mark selected tasks as done in Firestore:", error);
          setTodos(originalTodos);
      }
  };

  const renderContent = () => {
    if (isLoadingSessions && activePage !== 'todo-list') {
      return <div className="text-center text-muted-foreground"><p>Loading sessions...</p></div>;
    }
    if (!user) return null;

    switch (activePage) {
      case "focus-sheet":
        return <FocusSheet sessions={sessions} onToggleSession={handleToggleSession} />;
      case "dashboard":
        return <Dashboard user={user} sessions={sessions} />;
      case "todo-list":
        if (isLoadingTodos) {
          return <div className="text-center text-muted-foreground"><p>Loading tasks...</p></div>;
        }
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
          "flex-1 flex justify-center overflow-y-auto min-h-screen",
          "p-4 sm:p-6 lg:p-8",
          "pt-20 md:pt-8"
        )}
      >
        {renderContent()}
      </main>
    </div>
  );
}

export default App;