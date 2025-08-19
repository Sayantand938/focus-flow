// src/stores/todoStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Todo, Subtask } from '@/shared/lib/types';
import toast from 'react-hot-toast';

interface TodoState {
  todos: Todo[];
  addTask: (values: Omit<Todo, 'id' | 'createdAt' | 'isStarred' | 'subtasks'>) => void;
  updateTask: (updatedTask: Partial<Todo> & { id: string }) => void;
  deleteTask: (id: string) => void;
  addSubtask: (taskId: string, text: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  toggleStar: (id: string) => void;
  resetTodos: () => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    immer(
      (set) => ({
        todos: [],

        addTask: (values) => {
          const newTask: Todo = {
            id: `task-${Date.now()}`,
            ...values,
            createdAt: new Date().toISOString(),
            dueDate: values.dueDate, // Handle due date
            isStarred: false,
            subtasks: [],
          };
          set((state) => {
            state.todos.unshift(newTask);
          });
          toast.success('Task added successfully!');
        },

        updateTask: (updatedTask) => {
          set((state) => {
            const task = state.todos.find(t => t.id === updatedTask.id);
            if (task) {
              Object.assign(task, updatedTask);
            }
          });
          toast.success('Task updated!');
        },

        deleteTask: (id) => {
          set((state) => {
            state.todos = state.todos.filter(t => t.id !== id);
          });
          toast.success('Task deleted.');
        },

        toggleStar: (id) => {
          set((state) => {
            const task = state.todos.find(t => t.id === id);
            if (task) {
              task.isStarred = !task.isStarred;
            }
          });
        },

        addSubtask: (taskId, text) => {
          set((state) => {
            const task = state.todos.find(t => t.id === taskId);
            if (task) {
              const newSubtask: Subtask = { id: `sub-${Date.now()}`, text, isCompleted: false };
              task.subtasks.push(newSubtask);
            }
          });
        },

        toggleSubtask: (taskId, subtaskId) => {
          set((state) => {
            const task = state.todos.find(t => t.id === taskId);
            const subtask = task?.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
              subtask.isCompleted = !subtask.isCompleted;
            }
          });
        },

        deleteSubtask: (taskId, subtaskId) => {
          set((state) => {
            const task = state.todos.find(t => t.id === taskId);
            if (task) {
              const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
              if (subtaskIndex !== -1) {
                task.subtasks.splice(subtaskIndex, 1);
              }
            }
          });
        },

        resetTodos: () => {
          set((state) => {
            state.todos = [];
          });
        },
      })
    ),
    {
      name: 'focus-flow-todo-storage',
    }
  )
);