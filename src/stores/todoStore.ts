// src/stores/todoStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Todo, Subtask } from '@/shared/lib/types';
import toast from 'react-hot-toast';
import { db } from '@/shared/services/firebase';
import { 
  collection, doc, getDocs, writeBatch, setDoc, updateDoc, deleteDoc, query, orderBy, Timestamp 
} from 'firebase/firestore';
import { useAuthStore } from './authStore';

interface TodoState {
  todos: Todo[];
  isLoadingTodos: boolean;
  fetchTodos: (uid: string) => Promise<void>;
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

        fetchTodos: async (uid) => {
          set({ isLoadingTodos: true });
          try {
            const todosCollectionRef = collection(db, "users", uid, "todos");
            // --- FIX 1: Fetch tasks in ascending order (oldest first) ---
            const q = query(todosCollectionRef, orderBy("createdAt", "asc"));
            const querySnapshot = await getDocs(q);
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
          } catch (error) {
            console.error("Failed to load todos from Firestore:", error);
            set({ todos: [], isLoadingTodos: false });
          }
        },

        addTask: async (values) => {
          const user = useAuthStore.getState().user;
          if (!user) {
            toast.error("You must be logged in to add a task.");
            return;
          }
          
          const newDocRef = doc(collection(db, "users", user.uid, "todos"));
          const newTaskId = newDocRef.id;

          const newTask: Todo = {
            id: newTaskId,
            ...values,
            createdAt: new Date().toISOString(),
            dueDate: values.dueDate,
            isStarred: false,
            subtasks: [],
          };

          // --- FIX 2: Add the new task to the END of the array ---
          set((state) => { state.todos.push(newTask); });
          toast.success('Task added successfully!');

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
          } catch (error) {
            console.error("Failed to sync new task to Firestore:", error);
            toast.error("Failed to save task to cloud.");
            set(state => { state.todos = state.todos.filter(t => t.id !== newTaskId); });
          }
        },

        updateTask: async (updatedTask) => {
          const user = useAuthStore.getState().user;
          if (!user) return;

          const originalTodos = JSON.parse(JSON.stringify(get().todos));
          
          set((state) => {
            const task = state.todos.find(t => t.id === updatedTask.id);
            if (task) Object.assign(task, updatedTask);
          });
          
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
             set({ todos: originalTodos });
          }
        },

        deleteTask: async (id) => {
          const user = useAuthStore.getState().user;
          if (!user) return;
          
          const originalTodos = [...get().todos];
          
          set((state) => {
            const taskIndex = state.todos.findIndex(t => t.id === id);
            if (taskIndex !== -1) {
              state.todos.splice(taskIndex, 1);
            }
          });
          toast.success('Task deleted.');

          try {
            await deleteDoc(doc(db, "users", user.uid, "todos", id));
          } catch (error) {
             console.error("Failed to delete task from Firestore:", error);
             toast.error("Failed to sync deletion.");
             set({ todos: originalTodos });
          }
        },

        toggleStar: async (id) => {
          const task = get().todos.find(t => t.id === id);
          if (task) {
            get().updateTask({ id, isStarred: !task.isStarred });
          }
        },

        addSubtask: async (taskId, text) => {
          const newSubtask: Subtask = { id: `sub-${Date.now()}`, text, isCompleted: false };
          const originalTodos = JSON.parse(JSON.stringify(get().todos));

          set(state => {
            const task = state.todos.find(t => t.id === taskId);
            if (task) {
              task.subtasks.push(newSubtask);
            }
          });

          const taskToUpdate = get().todos.find(t => t.id === taskId);
          if (taskToUpdate) {
            get().updateTask({ id: taskId, subtasks: taskToUpdate.subtasks });
          } else {
            set({ todos: originalTodos });
          }
        },

        toggleSubtask: async (taskId, subtaskId) => {
          const originalTodos = JSON.parse(JSON.stringify(get().todos));

          set(state => {
            const task = state.todos.find(t => t.id === taskId);
            const subtask = task?.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
              subtask.isCompleted = !subtask.isCompleted;
            }
          });

          const taskToUpdate = get().todos.find(t => t.id === taskId);
          if (taskToUpdate) {
            get().updateTask({ id: taskId, subtasks: taskToUpdate.subtasks });
          } else {
            set({ todos: originalTodos });
          }
        },

        deleteSubtask: async (taskId, subtaskId) => {
          const originalTodos = JSON.parse(JSON.stringify(get().todos));
          
          set(state => {
            const task = state.todos.find(t => t.id === taskId);
            if (task) {
              const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
              if (subtaskIndex > -1) {
                task.subtasks.splice(subtaskIndex, 1);
              }
            }
          });

          const taskToUpdate = get().todos.find(t => t.id === taskId);
          if (taskToUpdate) {
            get().updateTask({ id: taskId, subtasks: taskToUpdate.subtasks });
          } else {
            set({ todos: originalTodos });
          }
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