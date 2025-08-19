// src/stores/todoStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Todo, Subtask } from '@/shared/lib/types';
import { toast } from 'sonner'; // <-- UPDATED IMPORT
import { db } from '@/shared/services/firebase';
import { 
  collection, doc, getDocs, writeBatch, setDoc, updateDoc, deleteDoc, 
  query, orderBy, Timestamp, onSnapshot 
} from 'firebase/firestore';
import { useAuthStore } from './authStore';

interface TodoState {
  todos: Todo[];
  isLoadingTodos: boolean;
  fetchTodos: (uid: string) => () => void;
  addTask: (values: Omit<Todo, 'id' | 'createdAt' | 'isStarred' | 'subtasks'>) => Promise<void>;
  updateTask: (updatedTask: Partial<Todo> & { id: string }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, text: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  resetTodos: () => void;
  importTodos: (todos: Todo[]) => Promise<void>;
}

export const useTodoStore = create<TodoState>()(
  persist(
    immer(
      (set, get) => ({
        todos: [],
        isLoadingTodos: true,
        fetchTodos: (uid: string) => {
          set({ isLoadingTodos: true });
          const todosCollectionRef = collection(db, "users", uid, "todos");
          const q = query(todosCollectionRef, orderBy("createdAt", "asc"));
          
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedTodos = querySnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate().toISOString() : undefined,
              } as Todo;
            });
            set({ todos: fetchedTodos, isLoadingTodos: false });
          }, (error) => {
            console.error("Failed to listen to todos:", error);
            set({ todos: [], isLoadingTodos: false });
          });

          return unsubscribe;
        },
        addTask: async (values) => {
          const user = useAuthStore.getState().user;
          if (!user) {
            toast.error("You must be logged in to add a task.");
            return;
          }
          
          const newDocRef = doc(collection(db, "users", user.uid, "todos"));
          const newTask: Todo = {
            id: newDocRef.id,
            ...values,
            createdAt: new Date().toISOString(),
            dueDate: values.dueDate,
            isStarred: false,
            subtasks: [],
          };

          try {
            const dataToSave = {
              title: values.title,
              description: values.description,
              status: values.status,
              priority: values.priority,
              createdAt: Timestamp.fromDate(new Date(newTask.createdAt)),
              dueDate: values.dueDate ? Timestamp.fromDate(new Date(values.dueDate)) : null,
              isStarred: false,
              subtasks: [],
            };
            await setDoc(newDocRef, dataToSave);
            toast.success('Task added successfully!');
          } catch (error) {
            console.error("Failed to sync new task to Firestore:", error);
            toast.error("Failed to save task to cloud.");
          }
        },
        updateTask: async (updatedTask) => {
          const user = useAuthStore.getState().user;
          if (!user) return;
          
          try {
            const { id, ...dataToUpdate } = updatedTask;
            const docRef = doc(db, "users", user.uid, "todos", id);
            await updateDoc(docRef, {
                ...dataToUpdate,
                dueDate: dataToUpdate.dueDate ? Timestamp.fromDate(new Date(dataToUpdate.dueDate)) : null,
            });
            toast.success('Task updated!');
          } catch (error) {
             console.error("Failed to sync task update to Firestore:", error);
             toast.error("Failed to sync task update.");
          }
        },
        deleteTask: async (id) => {
          const user = useAuthStore.getState().user;
          if (!user) return;

          try {
            await deleteDoc(doc(db, "users", user.uid, "todos", id));
            toast.success('Task deleted.');
          } catch (error) {
             console.error("Failed to delete task from Firestore:", error);
             toast.error("Failed to sync deletion.");
          }
        },
        toggleStar: async (id) => {
          const task = get().todos.find(t => t.id === id);
          if (task) {
            get().updateTask({ id, isStarred: !task.isStarred });
          }
        },
        addSubtask: async (taskId, text) => {
          const task = get().todos.find(t => t.id === taskId);
          if (!task) return;
          
          const newSubtask: Subtask = { id: `sub-${Date.now()}`, text, isCompleted: false };
          const updatedSubtasks = [...task.subtasks, newSubtask];
          get().updateTask({ id: taskId, subtasks: updatedSubtasks });
        },
        toggleSubtask: async (taskId, subtaskId) => {
          const task = get().todos.find(t => t.id === taskId);
          if (!task) return;
          
          const updatedSubtasks = task.subtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, isCompleted: !subtask.isCompleted } 
              : subtask
          );
          get().updateTask({ id: taskId, subtasks: updatedSubtasks });
        },
        deleteSubtask: async (taskId, subtaskId) => {
          const task = get().todos.find(t => t.id === taskId);
          if (!task) return;
          
          const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
          get().updateTask({ id: taskId, subtasks: updatedSubtasks });
        },
        resetTodos: () => {
          set({ todos: [], isLoadingTodos: false });
        },
        importTodos: async (importedTodos) => {
            const user = useAuthStore.getState().user;
            if (!user) throw new Error("User not logged in for import.");
            
            set({ todos: importedTodos });

            const batch = writeBatch(db);
            const todosCollectionRef = collection(db, "users", user.uid, "todos");
            const snapshot = await getDocs(todosCollectionRef);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));

            for (const task of importedTodos) {
                const { id, ...taskData } = task;
                const docRef = doc(db, "users", user.uid, "todos", id);
                batch.set(docRef, {
                    ...taskData,
                    createdAt: Timestamp.fromDate(new Date(task.createdAt)),
                    dueDate: task.dueDate ? Timestamp.fromDate(new Date(task.dueDate)) : null,
                });
            }
            await batch.commit();
        },
      })
    ),
    {
      name: 'focus-flow-todo-storage',
    }
  )
);