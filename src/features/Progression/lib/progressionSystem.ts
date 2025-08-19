// src/features/Progression/lib/progressionSystem.ts
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

// --- NEW REDESIGNED LEVELING SYSTEM ---
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

/**
 * Helper function to find the last index of an element in an array that satisfies the predicate.
 */
function findLastIndex<T>(array: T[], predicate: (value: T, index: number, obj: T[]) => boolean): number {
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array)) return l;
  }
  return -1;
}

/**
 * Calculates the user's current rank, level, and XP progress based on the new system.
 * @param totalXp - The total experience points the user has accumulated.
 * @returns An object with detailed progression information.
 */
export function calculateProgression(totalXp: number): ProgressionInfo {
  // Find the index of the last level the user has successfully achieved.
  const currentLevelIndex = findLastIndex(RANKS_DATA, (level) => totalXp >= level.cumulativeXpRequired);
  
  // This case should not be hit with level 1 at 0 XP, but is a safe fallback.
  if (currentLevelIndex === -1) {
    return {
      rankName: "Recruit", levelTitle: "Newcomer", currentLevel: 0,
      xpProgress: 0, xpNeeded: 1, progressPercentage: 0, isMaxLevel: false,
    };
  }

  const currentLevelData = RANKS_DATA[currentLevelIndex];

  // Handle the maximum level state.
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
      progressPercentage: 100, // At max level, progress is always 100%
      isMaxLevel: true,
    };
  }

  const nextLevelData = RANKS_DATA[currentLevelIndex + 1];

  // XP required to start the current level's journey.
  const xpAtStartOfLevel = currentLevelData.cumulativeXpRequired;
  
  // Total XP needed to get from the start of this level to the next one.
  const xpNeededForNextLevel = nextLevelData.cumulativeXpRequired - xpAtStartOfLevel;
  
  // The user's progress within the current level.
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