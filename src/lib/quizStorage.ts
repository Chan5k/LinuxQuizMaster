import type { QuizQuestion } from "@/data/quizzes";

const QUIZ_STATE_KEY = "linux-quiz-state";
const QUIZ_RESULTS_KEY = "linux-quiz-results";

export type StoredQuizState = {
  category: string;
  difficulty: string;
  questionCount: number;
  studyMode: boolean;
  questionIds: string[];
  currentIndex: number;
  score: number;
  results: { correct: boolean; questionId: string; selectedIndex: number }[];
};

export type StoredQuizResult = {
  correct: boolean;
  question: QuizQuestion;
  selectedIndex: number;
};

export function saveQuizState(state: StoredQuizState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
  } catch {}
}

export function loadQuizState(): StoredQuizState | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(QUIZ_STATE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearQuizState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUIZ_STATE_KEY);
}

export function saveQuizResultsForReview(results: StoredQuizResult[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
  } catch {}
}

export function loadQuizResultsForReview(): StoredQuizResult[] | null {
  if (typeof window === "undefined") return null;
  try {
    const data = sessionStorage.getItem(QUIZ_RESULTS_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearQuizResultsForReview(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(QUIZ_RESULTS_KEY);
}
