// src/shared/lib/types.ts

/**
 * Represents the raw data structure for a daily log as stored in Firestore.
 */
export interface DailyLog {
  id: string; // e.g., "2025-08-18"
  completedSlots: number[];
}

/**
 * Represents a processed day's study data, enhanced with calculated
 * values for easier use in components.
 */
export interface DailyStudyData {
  totalMinutes: number;
  completedSlots: number[];
  date: Date; // The actual Date object for this day
}

/**
 * The main data structure used for all dashboard calculations.
 * It's an object where keys are date strings ("yyyy-MM-dd") and
 * values are the processed daily study data.
 */
export type StudiedDays = Record<string, DailyStudyData>;

// -----------
// Todo Types
// -----------

export type TodoStatus = "todo" | "in-progress" | "done";
export type TodoPriority = "low" | "medium" | "high";

/**
 * Represents a single task item in the Todo list.
 */
export interface Todo {
  id: string;
  description: string;
  tag?: string;
  createdAt: string; // Stored as an ISO string for universal compatibility
  priority: TodoPriority;
  status: TodoStatus;
}