// src/lib/types.ts

export interface Session {
  startTime: Date;
  duration: number; // Duration in seconds
}

export interface Shift {
  name: string;
  startHour: number;
  endHour: number;
}

export type TodoStatus = "todo" | "in-progress" | "done";
export type TodoPriority = "low" | "medium" | "high";

export interface Todo {
  id: string;
  description: string;
  tag?: string;
  createdAt: string; // Use ISO string for localStorage compatibility
  priority: TodoPriority;
  status: TodoStatus;
  // REMOVED: completedAt is no longer needed
}