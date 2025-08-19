// src/shared/lib/utils.ts
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
export const SHIFTS = [
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
export const calculateShiftStats = (studiedDays: StudiedDays, date: Date): number[] => {
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
// Heatmap
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
      currentStreak = 0;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }

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
interface OverallStatsData {
  totalMinutes: number;
  totalDays: number;
  avgDailyMinutes: number;
  avgShiftMinutes: number;
}

export const calculateOverallStats = (studiedDays: StudiedDays): OverallStatsData => {
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

// --- NEWLY ADDED PROGRESSION SYSTEM ---

export interface RankData {
  level: number;
  mainRank: string;
  subLevelTitle: string;
  cumulativeXpRequired: number;
}

export interface ProgressionInfo {
  rankName: string;
  levelTitle: string;
  currentLevel: number;
  xpProgress: number;
  xpNeeded: number;
  progressPercentage: number;
  isMaxLevel: boolean;
}

export const RANKS_DATA: RankData[] = [
  { level: 1, mainRank: "Recruit", subLevelTitle: "Novice", cumulativeXpRequired: 0 },
  { level: 2, mainRank: "Recruit", subLevelTitle: "Initiate", cumulativeXpRequired: 480 },
  { level: 3, mainRank: "Recruit", subLevelTitle: "Apprentice", cumulativeXpRequired: 1200 },
  { level: 4, mainRank: "Recruit", subLevelTitle: "Adept", cumulativeXpRequired: 1920 },
  { level: 5, mainRank: "Recruit", subLevelTitle: "Squire", cumulativeXpRequired: 2880 },
  { level: 6, mainRank: "Warrior", subLevelTitle: "Fighter", cumulativeXpRequired: 4200 },
  { level: 7, mainRank: "Warrior", subLevelTitle: "Bladebearer", cumulativeXpRequired: 5400 },
  { level: 8, mainRank: "Warrior", subLevelTitle: "Vanguard", cumulativeXpRequired: 6900 },
  { level: 9, mainRank: "Warrior", subLevelTitle: "Battlemaster", cumulativeXpRequired: 8640 },
  { level: 10, mainRank: "Warrior", subLevelTitle: "Knight Aspirant", cumulativeXpRequired: 10800 },
  { level: 11, mainRank: "Knight", subLevelTitle: "Sentinel", cumulativeXpRequired: 13200 },
  { level: 12, mainRank: "Knight", subLevelTitle: "Warder", cumulativeXpRequired: 15900 },
  { level: 13, mainRank: "Knight", subLevelTitle: "Lancer", cumulativeXpRequired: 18900 },
  { level: 14, mainRank: "Knight", subLevelTitle: "Champion", cumulativeXpRequired: 22200 },
  { level: 15, mainRank: "Knight", subLevelTitle: "Paladin", cumulativeXpRequired: 25800 },
  { level: 16, mainRank: "Elite Knight", subLevelTitle: "Crusader", cumulativeXpRequired: 29800 },
  { level: 17, mainRank: "Elite Knight", subLevelTitle: "Cavalier", cumulativeXpRequired: 34200 },
  { level: 18, mainRank: "Elite Knight", subLevelTitle: "Warlord", cumulativeXpRequired: 39000 },
  { level: 19, mainRank: "Elite Knight", subLevelTitle: "Knight Marshal", cumulativeXpRequired: 44400 },
  { level: 20, mainRank: "Elite Knight", subLevelTitle: "Dragonguard", cumulativeXpRequired: 50400 },
  { level: 21, mainRank: "Lord", subLevelTitle: "Baron", cumulativeXpRequired: 57000 },
  { level: 22, mainRank: "Lord", subLevelTitle: "Viscount", cumulativeXpRequired: 64200 },
  { level: 23, mainRank: "Lord", subLevelTitle: "Count", cumulativeXpRequired: 72000 },
  { level: 24, mainRank: "Lord", subLevelTitle: "Marquis", cumulativeXpRequired: 80400 },
  { level: 25, mainRank: "Lord", subLevelTitle: "High Lord", cumulativeXpRequired: 89400 },
  { level: 26, mainRank: "Warlord", subLevelTitle: "Brigadier", cumulativeXpRequired: 99000 },
  { level: 27, mainRank: "Warlord", subLevelTitle: "Colonel", cumulativeXpRequired: 109200 },
  { level: 28, mainRank: "Warlord", subLevelTitle: "General", cumulativeXpRequired: 120000 },
  { level: 29, mainRank: "Warlord", subLevelTitle: "Lieutenant-General", cumulativeXpRequired: 131400 },
  { level: 30, mainRank: "Warlord", subLevelTitle: "Supreme Commander", cumulativeXpRequired: 143400 },
  { level: 31, mainRank: "Champion", subLevelTitle: "Knight of Legends", cumulativeXpRequired: 156000 },
  { level: 32, mainRank: "Champion", subLevelTitle: "Grand Champion", cumulativeXpRequired: 169200 },
  { level: 33, mainRank: "Champion", subLevelTitle: "Field Champion", cumulativeXpRequired: 182400 },
  { level: 34, mainRank: "Champion", subLevelTitle: "Champion of Realms", cumulativeXpRequired: 196200 },
  { level: 35, mainRank: "Champion", subLevelTitle: "Legendary Champion", cumulativeXpRequired: 210600 },
  { level: 36, mainRank: "Noble Commander", subLevelTitle: "Marshal", cumulativeXpRequired: 225600 },
  { level: 37, mainRank: "Noble Commander", subLevelTitle: "Count Marshal", cumulativeXpRequired: 241200 },
  { level: 38, mainRank: "Noble Commander", subLevelTitle: "Duke Marshal", cumulativeXpRequired: 257400 },
  { level: 39, mainRank: "Noble Commander", subLevelTitle: "Grand Duke Commander", cumulativeXpRequired: 274200 },
  { level: 40, mainRank: "Noble Commander", subLevelTitle: "High Commander", cumulativeXpRequired: 291600 },
  { level: 41, mainRank: "Marshal", subLevelTitle: "Field Marshal", cumulativeXpRequired: 309600 },
  { level: 42, mainRank: "Marshal", subLevelTitle: "Grand Marshal", cumulativeXpRequired: 328200 },
  { level: 43, mainRank: "Marshal", subLevelTitle: "Supreme Marshal", cumulativeXpRequired: 347400 },
  { level: 44, mainRank: "Marshal", subLevelTitle: "Commander-in-Chief", cumulativeXpRequired: 367200 },
  { level: 45, mainRank: "Marshal", subLevelTitle: "Legendary Marshal", cumulativeXpRequired: 387600 },
  { level: 46, mainRank: "Legendary Hero", subLevelTitle: "Hero", cumulativeXpRequired: 408600 },
  { level: 47, mainRank: "Legendary Hero", subLevelTitle: "Dragon Slayer", cumulativeXpRequired: 430200 },
  { level: 48, mainRank: "Legendary Hero", subLevelTitle: "King’s Champion", cumulativeXpRequired: 470000 },
  { level: 49, mainRank: "Legendary Hero", subLevelTitle: "Lord Protector", cumulativeXpRequired: 485000 },
  { level: 50, mainRank: "Legendary Hero", subLevelTitle: "Eternal Warlord", cumulativeXpRequired: 500000 },
];

function findLastIndex<T>(array: T[], predicate: (value: T, index: number, obj: T[]) => boolean): number {
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array)) return l;
  }
  return -1;
}

export function calculateProgression(totalXp: number): ProgressionInfo {
  const currentLevelIndex = findLastIndex(RANKS_DATA, (level) => totalXp >= level.cumulativeXpRequired);
  
  if (currentLevelIndex === -1) {
    return {
      rankName: "Recruit", levelTitle: "Newcomer", currentLevel: 0,
      xpProgress: 0, xpNeeded: 1, progressPercentage: 0, isMaxLevel: false,
    };
  }

  const currentLevelData = RANKS_DATA[currentLevelIndex];

  if (currentLevelIndex === RANKS_DATA.length - 1) {
    const xpRequiredForMaxLevel = RANKS_DATA[currentLevelIndex - 1].cumulativeXpRequired;
    const xpInLevel = totalXp - xpRequiredForMaxLevel;
    const xpNeededForLevel = currentLevelData.cumulativeXpRequired - xpRequiredForMaxLevel;
    
    return {
      rankName: currentLevelData.mainRank,
      levelTitle: currentLevelData.subLevelTitle,
      currentLevel: currentLevelData.level,
      xpProgress: xpInLevel,
      xpNeeded: xpNeededForLevel,
      progressPercentage: 100,
      isMaxLevel: true,
    };
  }

  const nextLevelData = RANKS_DATA[currentLevelIndex + 1];
  const xpAtStartOfLevel = currentLevelData.cumulativeXpRequired;
  const xpNeededForNextLevel = nextLevelData.cumulativeXpRequired - xpAtStartOfLevel;
  const xpProgressInLevel = totalXp - xpAtStartOfLevel;

  return {
    rankName: currentLevelData.mainRank,
    levelTitle: currentLevelData.subLevelTitle,
    currentLevel: currentLevelData.level,
    xpProgress: xpProgressInLevel,
    xpNeeded: xpNeededForNextLevel,
    progressPercentage: (xpProgressInLevel / xpNeededForNextLevel) * 100,
    isMaxLevel: false,
  };
}