// src/shared/lib/types.ts
export interface DailyLog {
  id: string;
  completedSlots: number[];
}

export interface DailyStudyData {
  totalMinutes: number;
  completedSlots: number[];
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
  priority: TodoPriority;
  status: TodoStatus;
  isStarred: boolean;
  subtasks: Subtask[];
}