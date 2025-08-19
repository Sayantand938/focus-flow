// src/stores/todoStore.ts
import { create } from 'zustand';
import { 
  collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, 
  writeBatch, Timestamp, orderBy 
} from 'firebase/firestore';
import { db } from '@/shared/services/firebase';
import { Todo, TodoStatus } from '@/shared/lib/types';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

interface TodoState {
  todos: Todo[];
  isLoadingTodos: boolean;
  fetchTodos: (uid: string) => Promise<void>;
  addTask: (values: Omit<Todo, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (updatedTask: Todo) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setTaskStatus: (id: string, status: TodoStatus) => void;
  deleteSelectedTasks: (ids: string[]) => Promise<void>;
  markSelectedTasksDone: (ids: string[]) => Promise<void>;
  importTodos: (todos: Todo[]) => Promise<void>;
  resetTodos: () => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  isLoadingTodos: true,
  
  fetchTodos: async (uid: string) => {
    set({ isLoadingTodos: true });
    try {
      const todosRef = collection(db, "users", uid, "todos");
      const q = query(todosRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedTodos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString(),
      })) as Todo[];
      set({ todos: fetchedTodos });
    } catch (error) {
      console.error("Failed to load todos:", error);
      toast.error("Could not load your tasks.");
      set({ todos: [] });
    } finally {
      set({ isLoadingTodos: false });
    }
  },
  
  addTask: async (values) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    const tempId = `temp-${Date.now()}`;
    const newTask: Todo = { id: tempId, ...values, createdAt: new Date().toISOString() };
    set(state => ({ todos: [newTask, ...state.todos] }));

    const promise = addDoc(collection(db, "users", user.uid, "todos"), {
      ...values,
      createdAt: new Date(newTask.createdAt),
    });

    toast.promise(promise, {
      loading: 'Adding task...',
      success: 'Task added successfully!',
      error: 'Failed to add task.',
    });

    try {
      const docRef = await promise;
      set(state => ({
        todos: state.todos.map(t => (t.id === tempId ? { ...t, id: docRef.id } : t)),
      }));
    } catch (error) {
      console.error("Failed to add task:", error);
      set(state => ({ todos: state.todos.filter(t => t.id !== tempId) })); // Rollback
    }
  },

  updateTask: async (updatedTask) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const originalTodos = get().todos;
    set(state => ({
      todos: state.todos.map(t => (t.id === updatedTask.id ? updatedTask : t)),
    }));

    const { id, createdAt, ...taskData } = updatedTask;
    const promise = updateDoc(doc(db, "users", user.uid, "todos", id), taskData);

    toast.promise(promise, {
      loading: 'Updating task...',
      success: 'Task updated!',
      error: 'Failed to update task.',
    });
    
    try {
      await promise;
    } catch (error) {
      console.error("Failed to update task:", error);
      set({ todos: originalTodos }); // Rollback
    }
  },
  
  deleteTask: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const originalTodos = get().todos;
    set(state => ({ todos: state.todos.filter(t => t.id !== id) }));
    
    const promise = deleteDoc(doc(db, "users", user.uid, "todos", id));

    toast.promise(promise, {
      loading: 'Deleting task...',
      success: 'Task deleted.',
      error: 'Failed to delete task.',
    });

    try {
      await promise;
    } catch (error) {
      console.error("Failed to delete task:", error);
      set({ todos: originalTodos }); // Rollback
    }
  },
  
  setTaskStatus: (id, status) => {
    const task = get().todos.find(t => t.id === id);
    if (task) {
      get().updateTask({ ...task, status });
    }
  },
  
  deleteSelectedTasks: async (ids) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const originalTodos = get().todos;
    set(state => ({ todos: state.todos.filter(t => !ids.includes(t.id)) }));

    const batch = writeBatch(db);
    ids.forEach(id => batch.delete(doc(db, "users", user.uid, "todos", id)));
    const promise = batch.commit();

    toast.promise(promise, {
      loading: `Deleting ${ids.length} tasks...`,
      success: `${ids.length} tasks deleted.`,
      error: 'Failed to delete selected tasks.',
    });

    try {
      await promise;
    } catch (error) {
      console.error("Failed to delete selected tasks:", error);
      set({ todos: originalTodos }); // Rollback
    }
  },
  
  markSelectedTasksDone: async (ids) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const originalTodos = get().todos;
    set(state => ({
      todos: state.todos.map(t => ids.includes(t.id) ? { ...t, status: 'done' } : t)
    }));
    
    const batch = writeBatch(db);
    ids.forEach(id => batch.update(doc(db, "users", user.uid, "todos", id), { status: 'done' }));
    const promise = batch.commit();

    toast.promise(promise, {
      loading: `Updating ${ids.length} tasks...`,
      success: `${ids.length} tasks marked as done.`,
      error: 'Failed to update tasks.',
    });
    
    try {
      await promise;
    } catch (error) {
      console.error("Failed to mark tasks done:", error);
      set({ todos: originalTodos }); // Rollback
    }
  },

  importTodos: async (todos) => {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('No user logged in');
      
      set({ todos }); // Optimistic update

      const batch = writeBatch(db);
      const todosRef = collection(db, "users", user.uid, "todos");
      const todosSnap = await getDocs(todosRef);
      todosSnap.docs.forEach(doc => batch.delete(doc.ref));

      todos.forEach(todo => {
          const newDocRef = doc(collection(db, "users", user.uid, "todos"));
          const { id, ...todoData } = todo;
          batch.set(newDocRef, { ...todoData, createdAt: new Date(todo.createdAt) });
      });

      await batch.commit();
  },
  
  resetTodos: () => {
    set({ todos: [], isLoadingTodos: false });
  },
}));