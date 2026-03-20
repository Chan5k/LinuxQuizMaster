export const ACHIEVEMENTS = [
  { id: "first_quiz", name: "First Steps", desc: "Complete your first quiz", icon: "🌱" },
  { id: "perfect_5", name: "Perfect Five", desc: "Get 100% on a 5-question quiz", icon: "⭐" },
  { id: "perfect_10", name: "Perfect Ten", desc: "Get 100% on a 10-question quiz", icon: "🌟" },
  { id: "perfect_30", name: "Flawless", desc: "Get 100% on a 30-question quiz", icon: "🏆" },
  { id: "marathon", name: "Marathon Runner", desc: "Complete a 100-question quiz", icon: "🏃" },
  { id: "streak_3", name: "Getting Started", desc: "3-day quiz streak", icon: "🔥" },
  { id: "streak_7", name: "Week Warrior", desc: "7-day quiz streak", icon: "💪" },
  { id: "streak_14", name: "Dedicated", desc: "14-day quiz streak", icon: "⚡" },
  { id: "quizzes_10", name: "Quiz Enthusiast", desc: "Complete 10 quizzes", icon: "📚" },
  { id: "quizzes_50", name: "Quiz Master", desc: "Complete 50 quizzes", icon: "🎓" },
  { id: "hacker_100", name: "Hacker Elite", desc: "Get 100% on a Hacker difficulty quiz", icon: "👾" },
  { id: "study_mode", name: "Student", desc: "Complete a quiz in Study mode", icon: "📖" },
] as const;

const STORAGE_KEY = "linux-quiz-achievements";
const STREAK_KEY = "linux-quiz-streak";
const QUIZ_COUNT_KEY = "linux-quiz-total-completed";

export function getTotalQuizzesCompleted(): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(QUIZ_COUNT_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

export function incrementTotalQuizzesCompleted(): number {
  const count = getTotalQuizzesCompleted() + 1;
  localStorage.setItem(QUIZ_COUNT_KEY, String(count));
  return count;
}

export function getUnlockedAchievements(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function unlockAchievement(id: string): boolean {
  const unlocked = getUnlockedAchievements();
  if (unlocked.includes(id)) return false;
  unlocked.push(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  return true;
}

export function getStreak(): { count: number; lastDate: string } {
  if (typeof window === "undefined") return { count: 0, lastDate: "" };
  try {
    const data = localStorage.getItem(STREAK_KEY);
    return data ? JSON.parse(data) : { count: 0, lastDate: "" };
  } catch {
    return { count: 0, lastDate: "" };
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(d1: string, d2: string): number {
  const a = new Date(d1);
  const b = new Date(d2);
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export function updateStreak(): { newStreak: number; isNewDay: boolean } {
  const today = todayStr();
  const { count, lastDate } = getStreak();

  if (!lastDate) {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastDate: today }));
    return { newStreak: 1, isNewDay: true };
  }

  if (lastDate === today) {
    return { newStreak: count, isNewDay: false };
  }

  const days = daysBetween(today, lastDate);
  let newCount: number;

  if (days === 1) {
    newCount = count + 1;
  } else {
    newCount = 1;
  }

  localStorage.setItem(STREAK_KEY, JSON.stringify({ count: newCount, lastDate: today }));
  return { newStreak: newCount, isNewDay: true };
}

export function checkAchievements(params: {
  score: number;
  total: number;
  quizCount: number;
  difficulty: string;
  studyMode: boolean;
  totalQuizzesCompleted: number;
}): string[] {
  const newlyUnlocked: string[] = [];
  const { score, total, quizCount, difficulty, studyMode, totalQuizzesCompleted } = params;

  if (total > 0 && score === total) {
    if (quizCount === 5 && !getUnlockedAchievements().includes("perfect_5")) {
      if (unlockAchievement("perfect_5")) newlyUnlocked.push("perfect_5");
    }
    if (quizCount === 10 && !getUnlockedAchievements().includes("perfect_10")) {
      if (unlockAchievement("perfect_10")) newlyUnlocked.push("perfect_10");
    }
    if (quizCount >= 30 && !getUnlockedAchievements().includes("perfect_30")) {
      if (unlockAchievement("perfect_30")) newlyUnlocked.push("perfect_30");
    }
    if (difficulty === "hacker" && !getUnlockedAchievements().includes("hacker_100")) {
      if (unlockAchievement("hacker_100")) newlyUnlocked.push("hacker_100");
    }
  }

  if (quizCount >= 100 && !getUnlockedAchievements().includes("marathon")) {
    if (unlockAchievement("marathon")) newlyUnlocked.push("marathon");
  }

  if (studyMode && !getUnlockedAchievements().includes("study_mode")) {
    if (unlockAchievement("study_mode")) newlyUnlocked.push("study_mode");
  }

  if (totalQuizzesCompleted >= 1 && !getUnlockedAchievements().includes("first_quiz")) {
    if (unlockAchievement("first_quiz")) newlyUnlocked.push("first_quiz");
  }
  if (totalQuizzesCompleted >= 10 && !getUnlockedAchievements().includes("quizzes_10")) {
    if (unlockAchievement("quizzes_10")) newlyUnlocked.push("quizzes_10");
  }
  if (totalQuizzesCompleted >= 50 && !getUnlockedAchievements().includes("quizzes_50")) {
    if (unlockAchievement("quizzes_50")) newlyUnlocked.push("quizzes_50");
  }

  const { newStreak } = updateStreak();
  if (newStreak >= 3 && !getUnlockedAchievements().includes("streak_3")) {
    if (unlockAchievement("streak_3")) newlyUnlocked.push("streak_3");
  }
  if (newStreak >= 7 && !getUnlockedAchievements().includes("streak_7")) {
    if (unlockAchievement("streak_7")) newlyUnlocked.push("streak_7");
  }
  if (newStreak >= 14 && !getUnlockedAchievements().includes("streak_14")) {
    if (unlockAchievement("streak_14")) newlyUnlocked.push("streak_14");
  }

  return newlyUnlocked;
}
