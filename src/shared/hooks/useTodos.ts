// D:/Coding/tauri-projects/focus-flow/src/hooks/useTodos.ts
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '@/shared/services/firebase';
import {
    collection,
    query,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    writeBatch,
    Timestamp,
    orderBy,
} from 'firebase/firestore';
import { Todo, TodoStatus } from "@/shared/lib/types"

/**
 * A custom hook to manage the todos state and interactions with Firestore.
 * It handles fetching, adding, updating, and deleting tasks with optimistic UI updates.
 * @param user - The authenticated Firebase user object.
 */
export function useTodos(user: User | null) {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isLoadingTodos, setIsLoadingTodos] = useState(true);

    // Effect to fetch todos when the user is available or logs out
    useEffect(() => {
        if (!user) {
            setTodos([]);
            setIsLoadingTodos(false);
            return;
        }

        const fetchTodos = async () => {
            setIsLoadingTodos(true);
            try {
                const todosCollectionRef = collection(db, "users", user.uid, "todos");
                const q = query(todosCollectionRef, orderBy("createdAt", "desc"));
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
                setTodos([]); // Reset on error
            } finally {
                setIsLoadingTodos(false);
            }
        };

        fetchTodos();
    }, [user]);

    const handleAddTask = async (values: Omit<Todo, 'id' | 'createdAt'>) => {
        if (!user) return;

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const newTask: Todo = {
            id: tempId,
            ...values,
            createdAt: new Date().toISOString(),
        };
        setTodos(prev => [newTask, ...prev]);

        // Firestore operation
        try {
            const docRef = await addDoc(collection(db, "users", user.uid, "todos"), {
                ...values,
                createdAt: new Date(newTask.createdAt),
            });
            // Replace temporary ID with the real one from Firestore
            setTodos(prev => prev.map(t => (t.id === tempId ? { ...t, id: docRef.id } : t)));
        } catch (error) {
            console.error("Failed to add task to Firestore:", error);
            // Rollback on failure
            setTodos(prev => prev.filter(t => t.id !== tempId));
        }
    };

    const handleUpdateTask = async (updatedTask: Todo) => {
        if (!user) return;

        const originalTodos = [...todos];
        // Optimistic update
        setTodos(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

        // Firestore operation
        try {
            const { id, createdAt, ...taskDataForUpdate } = updatedTask;
            const docRef = doc(db, "users", user.uid, "todos", id);
            await updateDoc(docRef, taskDataForUpdate);
        } catch (error) {
            console.error("Failed to update task in Firestore:", error);
            // Rollback on failure
            setTodos(originalTodos);
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!user) return;

        const originalTodos = [...todos];
        // Optimistic update
        setTodos(prev => prev.filter(t => t.id !== id));

        // Firestore operation
        try {
            await deleteDoc(doc(db, "users", user.uid, "todos", id));
        } catch (error) {
            console.error("Failed to delete task from Firestore:", error);
            // Rollback on failure
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
        // Optimistic update
        setTodos(prev => prev.filter(t => !ids.includes(t.id)));

        // Firestore operation
        try {
            const batch = writeBatch(db);
            ids.forEach(id => {
                const docRef = doc(db, "users", user.uid, "todos", id);
                batch.delete(docRef);
            });
            await batch.commit();
        } catch (error) {
            console.error("Failed to delete selected tasks from Firestore:", error);
            // Rollback on failure
            setTodos(originalTodos);
        }
    };

    const handleMarkSelectedTasksDone = async (ids: string[]) => {
        if (!user) return;

        const originalTodos = [...todos];
        // Optimistic update
        setTodos(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: 'done' } : t));

        // Firestore operation
        try {
            const batch = writeBatch(db);
            ids.forEach(id => {
                const docRef = doc(db, "users", user.uid, "todos", id);
                batch.update(docRef, { status: 'done' });
            });
            await batch.commit();
        } catch (error) {
            console.error("Failed to mark selected tasks as done in Firestore:", error);
            // Rollback on failure
            setTodos(originalTodos);
        }
    };

    return {
        todos,
        isLoadingTodos,
        handleAddTask,
        handleUpdateTask,
        handleDeleteTask,
        handleSetTaskStatus,
        handleDeleteSelectedTasks,
        handleMarkSelectedTasksDone,
        setTodos,
    };
}