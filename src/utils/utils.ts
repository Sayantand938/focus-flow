// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  eachDayOfInterval,
  format,
  subDays,
  startOfToday,
  isSameDay
} from "date-fns";
import { StudiedDays } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// -----------------
// Dashboard Constants & Slot Mapping
// -----------------
export const SHIFTS = [ // This is now a simple constant, not a typed interface
  { name: "Shift 1", startHour: 7, endHour: 11 },
  { name: "Shift 2", startHour: 11, endHour: 15 },
  { name: "Shift 3", startHour: 15, endHour: 19 },
  { name: "Shift 4", startHour: 19, endHour: 23 },
];

const SLOT_HOUR_MAPPING: { [hour: number]: number } = {
  7: 1, 8: 2, 9: 3, 10: 4, 11: 5, 12: 6, 13: 7, 14: 8,
  15: 9, 16: 10, 17: 11, 18: 12, 19: 13, 20: 14, 21: 15, 22: 16
};

const HOUR_SLOT_MAPPING: { [slot: number]: number } = {
  1: 7, 2: 8, 3: 9, 4: 10, 5: 11, 6: 12, 7: 13, 8: 14,
  9: 15, 10: 16, 11: 17, 12: 18, 13: 19, 14: 20, 15: 21, 16: 22
};

export const hourToSlot = (hour: number): number | null => SLOT_HOUR_MAPPING[hour] || null;
export const slotToHour = (slot: number): number | null => HOUR_SLOT_MAPPING[slot] || null;

export const SHIFT_GOAL_MINUTES = 120;
export const DAILY_GOAL_MINUTES = 480;

// -----------------
// Shift Calculations
// -----------------
export const calculateShiftStats = (studiedDays: StudiedDays, date: Date) => {
  const dateKey = format(date, "yyyy-MM-dd");
  const todayData = studiedDays[dateKey];
  
  const shiftDurations = Array(SHIFTS.length).fill(0);
  if (!todayData) return shiftDurations;

  todayData.completedSlots.forEach(slot => {
    const hour = slotToHour(slot);
    if (hour === null) return;

    const shiftIndex = SHIFTS.findIndex(
      shift => hour >= shift.startHour && hour < shift.endHour
    );

    if (shiftIndex !== -1) {
      shiftDurations[shiftIndex] += 30; // Each slot is 30 minutes
    }
  });

  return shiftDurations;
};


// -----------------
// Weekly Progress
// -----------------
export const getPast7DaysProgress = (studiedDays: StudiedDays) => {
  const today = startOfToday();
  const last7Days = eachDayOfInterval({ start: subDays(today, 6), end: today });

  return last7Days.map((date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const dayData = studiedDays[dateKey];
    return {
      name: format(date, "EEE"),
      minutes: dayData?.totalMinutes || 0,
    };
  });
};

// -----------------
// Heatmap (Now much simpler)
// -----------------
export const getHeatmapData = (studiedDays: StudiedDays) => {
  return Object.entries(studiedDays).map(([date, data]) => ({
    date,
    count: data.totalMinutes
  }));
};

// -----------------
// Streaks & Goals
// -----------------
export const calculateStreaksAndGoals = (studiedDays: StudiedDays) => {
  const sortedDays = Object.values(studiedDays).sort((a, b) => a.date.getTime() - b.date.getTime());
  
  if (sortedDays.length === 0) {
    return { longestStreak: 0, currentStreak: 0, perfectDays: 0 };
  }

  let longestStreak = 0;
  let currentStreak = 0;
  let perfectDays = 0;

  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i];

    if (day.totalMinutes >= DAILY_GOAL_MINUTES) {
      perfectDays++;
      const prevDay = i > 0 ? sortedDays[i - 1] : null;

      if (prevDay && isSameDay(subDays(day.date, 1), prevDay.date)) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 0; // Streak is broken if a day is logged but goal is not met
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }

  // Check if the streak is current
  const lastStudiedDay = sortedDays[sortedDays.length - 1].date;
  const today = startOfToday();
  const yesterday = subDays(today, 1);

  if (!isSameDay(lastStudiedDay, today) && !isSameDay(lastStudiedDay, yesterday)) {
    currentStreak = 0;
  }
  
  return { longestStreak, currentStreak, perfectDays };
};

// -----------------
// Overall Stats
// -----------------
export const calculateOverallStats = (studiedDays: StudiedDays) => {
  const daysArray = Object.values(studiedDays);
  const totalDays = daysArray.length;
  if (totalDays === 0) {
    return { totalMinutes: 0, totalDays: 0, avgDailyMinutes: 0, avgShiftMinutes: 0 };
  }

  const totalMinutes = daysArray.reduce((sum, day) => sum + day.totalMinutes, 0);
  const avgDailyMinutes = totalMinutes / totalDays;
  const avgShiftMinutes = totalMinutes / (totalDays * SHIFTS.length);

  return { totalMinutes, totalDays, avgDailyMinutes, avgShiftMinutes };
};