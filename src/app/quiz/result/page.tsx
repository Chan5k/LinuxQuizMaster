"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { loadQuizResultsForReview } from "@/lib/quizStorage";
import { ACHIEVEMENTS, getStreak } from "@/lib/achievements";

export default function QuizResultPage() {
  const searchParams = useSearchParams();
  const score = Number(searchParams.get("score")) || 0;
  const total = Number(searchParams.get("total")) || 0;
  const category = searchParams.get("category") || "Quiz";
  const study = searchParams.get("study") === "1";
  const wrongCount = Number(searchParams.get("wrong")) || 0;
  const achievementsParam = searchParams.get("achievements") || "";

  const wrongAnswers = useMemo(() => loadQuizResultsForReview() || [], []);
  const newlyUnlockedIds = useMemo(
    () => (achievementsParam ? achievementsParam.split(",").filter(Boolean) : []),
    [achievementsParam]
  );
  const newlyUnlocked = useMemo(
    () => ACHIEVEMENTS.filter((a) => newlyUnlockedIds.includes(a.id)),
    [newlyUnlockedIds]
  );
  const streak = useMemo(() => getStreak(), []);

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const emoji = percentage >= 90 ? "🏆" : percentage >= 70 ? "👍" : percentage >= 50 ? "📚" : "💪";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">{emoji}</div>
        <h1 className="text-2xl font-bold mb-2">Quiz Complete!</h1>
        <p className="text-slate-400 mb-8">{category}</p>

        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 mb-6 shadow-xl inline-block">
          <div className="text-5xl font-bold text-emerald-400 mb-2">
            {score} / {total}
          </div>
          <div className="text-2xl text-slate-400">{percentage}%</div>
          {study && <p className="text-cyan-400 text-sm mt-2">Study mode</p>}
        </div>
      </div>

      {streak.count > 0 && (
        <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
          <span className="text-amber-400 font-semibold">🔥 {streak.count}-day streak!</span>
        </div>
      )}

      {newlyUnlocked.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">New achievements</h2>
          <div className="flex flex-wrap gap-3">
            {newlyUnlocked.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
              >
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="font-medium text-emerald-400">{a.name}</div>
                  <div className="text-sm text-slate-400">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {wrongAnswers.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Review wrong answers</h2>
          <div className="space-y-4">
            {wrongAnswers.map((r, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50"
              >
                <p className="font-medium text-slate-200 mb-2">{r.question.question}</p>
                <div className="space-y-1 text-sm">
                  <p className="text-red-400">
                    Your answer: {r.question.options[r.selectedIndex]}
                  </p>
                  <p className="text-emerald-400">
                    Correct: {r.question.options[r.question.correctIndex]}
                  </p>
                  {r.question.explanation && (
                    <p className="text-slate-400 mt-2">{r.question.explanation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/quiz"
          className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors text-center"
        >
          Take Another Quiz
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl border border-slate-600 hover:border-emerald-500 text-emerald-400 transition-colors text-center"
        >
          View Dashboard
        </Link>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition-colors text-center"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
