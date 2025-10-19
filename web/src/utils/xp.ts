import type { Level, TradeRating } from '../types';

// Level definitions (Lv1-10)
export const LEVELS: Level[] = [
  { level: 1, name: 'Beginner', xpRequired: 0 },
  { level: 2, name: 'Rookie', xpRequired: 50 },
  { level: 3, name: 'Trader', xpRequired: 150 },
  { level: 4, name: 'Collector', xpRequired: 300 },
  { level: 5, name: 'Scout', xpRequired: 500 },
  { level: 6, name: 'Explorer', xpRequired: 750 },
  { level: 7, name: 'Mentor', xpRequired: 1050 },
  { level: 8, name: 'Guide', xpRequired: 1400 },
  { level: 9, name: 'Champion', xpRequired: 1800 },
  { level: 10, name: 'Legend', xpRequired: 2250 },
];

// XP Award amounts
export const XP_AWARDS = {
  // Core actions
  COMPLETE_TRADE: 50,
  TRADE_BONUS_FAIR: 20,
  TRADE_BONUS_GREAT: 10,
  TRADE_BONUS_BAD: 0,

  // Safety behaviors
  PUBLIC_MEETUP: 15,
  ATTENDED_MEETUP: 15,
  GUARDIAN_HELPING: 5,
  POLITE_THANK_YOU: 5,

  // Quality listings
  QUALITY_PHOTOS: 5,        // 3-4 photos
  ACCURATE_FACTS: 5,        // Edited Magic Facts

  // Quests
  QUEST_BASIC: 10,
  QUEST_MEDIUM: 15,
  QUEST_HARD: 20,
};

// Daily XP cap
export const DAILY_XP_CAP = 200;

/**
 * Calculate current level and progress from total XP
 */
export function calculateLevel(totalXP: number): {
  level: number;
  levelName: string;
  xpToNextLevel: number;
  progressPercent: number;
} {
  // Find the highest level the user has reached
  let currentLevel = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
      break;
    }
  }

  // Calculate XP to next level
  const nextLevelIndex = currentLevel.level; // 0-indexed array, level is 1-indexed
  const nextLevel = LEVELS[nextLevelIndex] || LEVELS[LEVELS.length - 1];
  const xpInCurrentLevel = totalXP - currentLevel.xpRequired;
  const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;
  const progressPercent = xpNeededForNext > 0 ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100;

  return {
    level: currentLevel.level,
    levelName: currentLevel.name,
    xpToNextLevel: nextLevel.xpRequired,
    progressPercent: Math.min(100, progressPercent),
  };
}

/**
 * Calculate XP award for a trade based on rating
 */
export function calculateTradeXP(rating: TradeRating): number {
  const baseXP = XP_AWARDS.COMPLETE_TRADE;
  let bonus = 0;

  if (rating === 'fair') {
    bonus = XP_AWARDS.TRADE_BONUS_FAIR;
  } else if (rating === 'great') {
    bonus = XP_AWARDS.TRADE_BONUS_GREAT;
  }

  return baseXP + bonus;
}

/**
 * Calculate estimated XP for a proposed trade
 */
export function estimateTradeXP(
  rating: TradeRating,
  hasPublicMeetup: boolean = false,
  hasGuardian: boolean = false
): number {
  let xp = calculateTradeXP(rating);

  if (hasPublicMeetup) {
    xp += XP_AWARDS.PUBLIC_MEETUP;
  }

  if (hasGuardian) {
    xp += XP_AWARDS.GUARDIAN_HELPING;
  }

  return xp;
}

/**
 * Get level badge tooltip text
 */
export function getLevelTooltip(level: number, xp: number, xpToNext: number): string {
  const levelInfo = LEVELS.find(l => l.level === level) || LEVELS[0];
  return `Lv${level} ${levelInfo.name} · ${xp}/${xpToNext} XP`;
}

/**
 * Check if level-up occurred
 */
export function didLevelUp(oldXP: number, newXP: number): boolean {
  const oldLevel = calculateLevel(oldXP).level;
  const newLevel = calculateLevel(newXP).level;
  return newLevel > oldLevel;
}
