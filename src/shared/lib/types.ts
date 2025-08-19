// src/shared/lib/types.ts
export interface DailyLog {
  id: string;
  // A map of slot number to a tag name.
  // The existence of a key implies the slot is completed.
  slots: Record<number, string>;
  totalSlots: number;
}

export interface DailyStudyData {
  totalMinutes: number;
  // This is derived from the keys of `slots` for convenience in components.
  completedSlots: number[];
  slots: Record<number, string>;
  totalSlots: number;
  date: Date;
}

export type StudiedDays = Record<string, DailyStudyData>;

export type TodoStatus = "pending" | "in-progress" | "completed";
export type TodoPriority = "low" | "medium" | "high";

export interface Subtask {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  dueDate?: string;
  priority: TodoPriority;
  status: TodoStatus;
  isStarred: boolean;
  subtasks: Subtask[];
}