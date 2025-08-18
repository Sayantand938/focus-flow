// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  eachDayOfInterval,
  format,
  isSameDay,
  subDays,
} from "date-fns";
import { Session, Shift } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// -----------------
// Dashboard Constants & Slot Mapping
// -----------------
export const SHIFTS: Shift[] = [
  { name: "Shift 1", startHour: 7, endHour: 11 },
  { name: "Shift 2", startHour: 11, endHour: 15 },
  { name: "Shift 3", startHour: 15, endHour: 19 },
  { name: "Shift 4", startHour: 19, endHour: 23 },
];

// Explicit mapping for clarity and robustness
const SLOT_HOUR_MAPPING: { [hour: number]: number } = {
  7: 1, 8: 2, 9: 3, 10: 4,
  11: 5, 12: 6, 13: 7, 14: 8,
  15: 9, 16: 10, 17: 11, 18: 12,
  19: 13, 20: 14, 21: 15, 22: 16
};

const SLOT_REVERSE_MAPPING: { [slot: number]: number } = {
  1: 7, 2: 8, 3: 9, 4: 10,
  5: 11, 6: 12, 7: 13, 8: 14,
  9: 15, 10: 16, 11: 17, 12: 18,
  13: 19, 14: 20, 15: 21, 16: 22
};

/**
 * Converts a 24-hour format hour into a 1-16 slot number.
 * Returns null if the hour is outside the valid shift times.
 */
export const hourToSlot = (hour: number): number | null => {
  return SLOT_HOUR_MAPPING[hour] || null;
};

/**
 * Converts a 1-16 slot number back into a 24-hour format hour.
 * Returns null if the slot number is invalid.
 */
export const slotToHour = (slot: number): number | null => {
  return SLOT_REVERSE_MAPPING[slot] || null;
};

export const SHIFT_GOAL_SECONDS = 120 * 60; // 120 minutes
export const DAILY_GOAL_SECONDS = 480 * 60; // 480 minutes (8 hours)

// -----------------
// Shift Calculations
// -----------------
export const calculateShiftStats = (sessions: Session[], date: Date) => {
  const dailySessions = sessions.filter((s) =>
    isSameDay(s.startTime, date)
  );

  const shiftDurations = SHIFTS.map(() => 0);

  dailySessions.forEach((session) => {
    const sessionStartHour = new Date(session.startTime).getHours();

    // Find which shift this session belongs to.
    const shiftIndex = SHIFTS.findIndex(
      (shift) => sessionStartHour >= shift.startHour && sessionStartHour < shift.endHour
    );

    // If a matching shift is found, add the session's duration.
    if (shiftIndex !== -1) {
      shiftDurations[shiftIndex] += session.duration;
    }
  });

  return shiftDurations;
};


// -----------------
// Weekly Progress
// -----------------
export const getPast7DaysProgress = (sessions: Session[]) => {
  const today = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  return last7Days.map((date) => {
    const totalDuration = sessions
      .filter((s) => isSameDay(s.startTime, date))
      .reduce((sum, s) => sum + s.duration, 0);

    return {
      name: format(date, "EEE"),
      minutes: totalDuration / 60,
    };
  });
};

// -----------------
// Heatmap
// -----------------
export const getHeatmapData = (sessions: Session[]) => {
  const dailyData: { [key: string]: number } = {};

  sessions.forEach((session) => {
    const date = format(new Date(session.startTime), 'yyyy-MM-dd');
    const durationMinutes = session.duration / 60;
    
    if (!dailyData[date]) {
      dailyData[date] = 0;
    }
    dailyData[date] += durationMinutes;
  });

  return Object.entries(dailyData).map(([date, minutes]) => ({
    date,
    count: Math.round(minutes * 100) / 100
  }));
};

// -----------------
// Streaks & Goals
// -----------------
export const calculateStreaksAndGoals = (sessions: Session[]) => {
  if (sessions.length === 0) {
    return {
      longestStreak: 0,
      currentStreak: 0,
      perfectDays: 0,
    };
  }

  const studyDays: { [key: string]: number } = {};
  sessions.forEach((s) => {
    const day = format(s.startTime, "yyyy-MM-dd");
    studyDays[day] = (studyDays[day] || 0) + s.duration;
  });

  const sortedDays = Object.keys(studyDays).sort();
  let longestStreak = 0;
  let currentStreak = 0;
  let perfectDays = 0;
  let lastDate: Date | null = null;

  for (const dayStr of sortedDays) {
    const dayDate = new Date(`${dayStr}T12:00:00`);
    const duration = studyDays[dayStr];

    if (duration >= DAILY_GOAL_SECONDS) {
      perfectDays++;
      if (lastDate && isSameDay(subDays(dayDate, 1), lastDate)) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 0;
    }
    
    if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
    }
    lastDate = dayDate;
  }

  if (lastDate) {
    const today = new Date();
    const yesterday = subDays(today, 1);
    if (!isSameDay(lastDate, today) && !isSameDay(lastDate, yesterday)) {
        currentStreak = 0;
    }
  } else {
      currentStreak = 0;
  }

  return { longestStreak, currentStreak, perfectDays };
};

// -----------------
// Overall Stats
// -----------------
export const calculateOverallStats = (sessions: Session[]) => {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
  const uniqueDays = new Set(
    sessions.map((s) => format(s.startTime, "yyyy-MM-dd"))
  ).size;
  const totalMinutes = totalSeconds / 60;
  const avgDailyMinutes = uniqueDays > 0 ? totalMinutes / uniqueDays : 0;
  const avgShiftMinutes =
    uniqueDays > 0 ? totalMinutes / (uniqueDays * SHIFTS.length) : 0;

  return {
    totalMinutes,
    totalDays: uniqueDays,
    avgDailyMinutes,
    avgShiftMinutes,
  };
};