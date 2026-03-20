"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QUIZZES, QUIZ_CATEGORIES, DIFFICULTY_LEVELS, type QuizQuestion } from "@/data/quizzes";
import {
  saveQuizState,
  loadQuizState,
  clearQuizState,
  saveQuizResultsForReview,
  clearQuizResultsForReview,
} from "@/lib/quizStorage";
import {
  checkAchievements,
  getTotalQuizzesCompleted,
  incrementTotalQuizzesCompleted,
} from "@/lib/achievements";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const questionsById = new Map(QUIZZES.map((q) => [q.id, q]));

function getQuestionsByIds(ids: string[]): QuizQuestion[] {
  return ids.map((id) => questionsById.get(id)).filter(Boolean) as QuizQuestion[];
}

export default function QuizPage() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState(10);
  const [studyMode, setStudyMode] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ correct: boolean; question: QuizQuestion; selectedIndex: number }[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizQuestion[]>([]);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [loadedResume, setLoadedResume] = useState(false);

  const baseFiltered = useMemo(() => {
    let q = QUIZZES;
    if (category !== "all") q = q.filter((qu) => qu.category === category);
    if (difficulty !== "all") q = q.filter((qu) => qu.difficulty === difficulty);
    return q;
  }, [category, difficulty]);

  const availableCount = baseFiltered.length;
  const actualCount = Math.min(questionCount, availableCount);

  // Check for saved quiz on mount
  useEffect(() => {
    if (loadedResume || started) return;
    const saved = loadQuizState();
    if (saved && saved.questionIds.length > 0) {
      const restored = getQuestionsByIds(saved.questionIds);
      if (restored.length === saved.questionIds.length) {
        setShowResumeBanner(true);
      }
    }
    setLoadedResume(true);
  }, [loadedResume, started]);

  function startFresh() {
    const shuffled = shuffle([...baseFiltered]).slice(0, actualCount);
    setFilteredQuizzes(shuffled);
    setStarted(true);
    setCurrentIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setResults([]);
    setShowResumeBanner(false);
    clearQuizState();
    clearQuizResultsForReview();
  }

  function resumeQuiz() {
    const saved = loadQuizState();
    if (!saved) return;
    const restored = getQuestionsByIds(saved.questionIds);
    if (restored.length === 0) return;
    setFilteredQuizzes(restored);
    setCategory(saved.category);
    setDifficulty(saved.difficulty);
    setQuestionCount(saved.questionCount);
    setStudyMode(saved.studyMode);
    setCurrentIndex(saved.currentIndex);
    setScore(saved.score);
    setResults(
      saved.results.map((r) => ({
        correct: r.correct,
        question: questionsById.get(r.questionId)!,
        selectedIndex: r.selectedIndex,
      }))
    );
    setSelected(null);
    setAnswered(false);
    setStarted(true);
    setShowResumeBanner(false);
  }

  const current = filteredQuizzes[currentIndex];
  const isLast = currentIndex === filteredQuizzes.length - 1;
  const progress = filteredQuizzes.length ? ((currentIndex + 1) / filteredQuizzes.length) * 100 : 0;

  const saveState = useCallback(() => {
    if (filteredQuizzes.length === 0 || studyMode) return;
    saveQuizState({
      category,
      difficulty,
      questionCount: filteredQuizzes.length,
      studyMode,
      questionIds: filteredQuizzes.map((q) => q.id),
      currentIndex,
      score,
      results: results.map((r) => ({
        correct: r.correct,
        questionId: r.question.id,
        selectedIndex: r.selectedIndex,
      })),
    });
  }, [category, difficulty, currentIndex, score, results, filteredQuizzes, studyMode]);

  useEffect(() => {
    if (started && filteredQuizzes.length > 0) saveState();
  }, [started, currentIndex, score, results, saveState, filteredQuizzes.length]);

  function handleAnswer(index: number) {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    const correct = index === current.correctIndex;
    if (!studyMode) setScore((s) => s + (correct ? 1 : 0));
    setResults((r) => [...r, { correct, question: current, selectedIndex: index }]);
  }

  function next() {
    if (isLast) return;
    setCurrentIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  }

  async function finish() {
    clearQuizState();
    const categoryLabel = category === "all" ? "Mixed" : category;
    const wrongAnswers = results.filter((r) => !r.correct);
    saveQuizResultsForReview(
      wrongAnswers.map((r) => ({ correct: r.correct, question: r.question, selectedIndex: r.selectedIndex }))
    );

    const totalCompleted = studyMode ? getTotalQuizzesCompleted() : incrementTotalQuizzesCompleted();
    const newlyUnlocked = checkAchievements({
      score,
      total: filteredQuizzes.length,
      quizCount: filteredQuizzes.length,
      difficulty,
      studyMode,
      totalQuizzesCompleted: totalCompleted,
    });

    if (!studyMode) {
      const userRes = await fetch("/api/auth/me");
      const { user } = await userRes.json();
      if (user) {
        await fetch("/api/quiz/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: categoryLabel,
            score,
            total: filteredQuizzes.length,
          }),
        });
      }
    }

    const params = new URLSearchParams({
      score: String(score),
      total: String(filteredQuizzes.length),
      category: categoryLabel,
      wrong: String(wrongAnswers.length),
    });
    if (studyMode) params.set("study", "1");
    if (newlyUnlocked.length > 0) params.set("achievements", newlyUnlocked.join(","));
    router.push(`/quiz/result?${params.toString()}`);
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!started || !current) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key >= "1" && e.key <= "4" && !answered) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < current.options.length) {
          e.preventDefault();
          setSelected(idx);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (!answered && selected !== null) handleAnswer(selected);
        else if (answered && !isLast) next();
        else if (answered && isLast) finish();
      } else if ((e.key === "n" || e.key === "N") && answered && !isLast) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started, current, answered, selected, isLast]);

  if (!started) {
    const saved = loadQuizState();
    const hasResume = saved && saved.questionIds.length > 0 && getQuestionsByIds(saved.questionIds).length > 0;

    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-6">Start a Quiz</h1>

        {showResumeBanner && hasResume && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
            <p className="text-amber-200 text-sm">You have an unfinished quiz. Resume where you left off?</p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={resumeQuiz}
                className="px-4 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400"
              >
                Resume
              </button>
              <button
                onClick={() => {
                  setShowResumeBanner(false);
                  clearQuizState();
                }}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white"
              >
                Start New
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-gray-700 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            >
              <option value="all">All Categories</option>
              {QUIZ_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-gray-700 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            >
              <option value="all">All Levels</option>
              {DIFFICULTY_LEVELS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Number of questions</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-gray-700 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={100}>100 (marathon)</option>
            </select>
            <p className="mt-2 text-sm text-slate-500">
              You&apos;ll get {actualCount} questions
              {availableCount < questionCount && (
                <span className="text-amber-400"> (only {availableCount} unique in this filter)</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="studyMode"
              checked={studyMode}
              onChange={(e) => setStudyMode(e.target.checked)}
              className="rounded border-gray-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="studyMode" className="text-sm text-slate-300">
              Study mode — no scoring, just learn (press 1–4 to select, Enter to check, N for next)
            </label>
          </div>
          <button
            onClick={startFresh}
            className="w-full py-4 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
          >
            Start Quiz
          </button>
        </div>

        <p className="mt-6 text-xs text-slate-500 text-center">
          Keyboard: 1–4 select option · Enter submit/next · N next question
        </p>
      </div>
    );
  }

  if (filteredQuizzes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 mb-4">No questions match your filters. Try a different category or difficulty.</p>
        <button
          onClick={() => setStarted(false)}
          className="px-6 py-2 rounded-xl border border-slate-600 hover:border-emerald-500 text-emerald-400"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>
            Question {currentIndex + 1} / {filteredQuizzes.length}
          </span>
          {!studyMode && <span>Score: {score}</span>}
          {studyMode && <span className="text-cyan-400">Study mode</span>}
        </div>
        <div className="h-2.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#161b22]/80 border border-gray-700/50 shadow-xl mb-6 backdrop-blur">
        <div className="flex gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-700/50 text-gray-300">
            {current.category}
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${
              current.difficulty === "easy"
                ? "bg-emerald-500/20 text-emerald-400"
                : current.difficulty === "medium"
                ? "bg-amber-500/20 text-amber-400"
                : current.difficulty === "hard"
                ? "bg-orange-500/20 text-orange-400"
                : current.difficulty === "extreme"
                ? "bg-red-500/20 text-red-400"
                : "bg-purple-500/20 text-purple-400"
            }`}
          >
            {current.difficulty}
          </span>
        </div>
        <h2 className="text-xl font-medium mb-6">{current.question}</h2>
        <div className="space-y-3">
          {current.options.map((opt, i) => {
            let btnClass = "w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ";
            if (answered) {
              if (i === current.correctIndex) {
                btnClass += "border-emerald-500 bg-emerald-500/15 text-emerald-300";
              } else if (i === selected && i !== current.correctIndex) {
                btnClass += "border-red-500/50 bg-red-500/10 text-red-400";
              } else {
                btnClass += "border-gray-800 text-gray-500";
              }
            } else {
              btnClass +=
                selected === i
                  ? "border-emerald-500/70 bg-emerald-500/10"
                  : "border-gray-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 active:scale-[0.99]";
            }
            return (
              <button
                key={i}
                onClick={() => (answered ? undefined : setSelected(i))}
                disabled={answered}
                className={btnClass}
              >
                <span className="font-mono text-sky-400 mr-2">{i + 1}.</span>
                {opt}
              </button>
            );
          })}
        </div>
        {answered && current.explanation && (
          <div className="mt-4 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sm text-gray-300">
            <strong className="text-sky-400">Explanation:</strong> {current.explanation}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        {answered ? (
          isLast ? (
            <button
              onClick={finish}
              className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors"
            >
              See Results
            </button>
          ) : (
            <button
              onClick={next}
              className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors"
            >
              Next Question
            </button>
          )
        ) : (
          <button
            onClick={() => selected !== null && handleAnswer(selected)}
            disabled={selected === null}
            className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Check Answer
          </button>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500 text-center">
        1–4 select · Enter submit/next · N next
      </p>
    </div>
  );
}
