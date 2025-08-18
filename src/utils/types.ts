// src/lib/types.ts

export interface DailyLog {
  id: string; // e.g., "2025-08-18"
  completedSlots: number[];
}

export interface DailyStudyData {
  totalMinutes: number;
  completedSlots: number[];
  date: Date; // The actual Date object for this day
}

// The main data structure for all calculations
export type StudiedDays = Record<string, DailyStudyData>;

export type TodoStatus = "todo" | "in-progress" | "done";
export type TodoPriority = "low" | "medium" | "high";

export interface Todo {
  id: string;
  description: string;
  tag?: string;
  createdAt: string; // Use ISO string for localStorage compatibility
  priority: TodoPriority;
  status: TodoStatus;
}