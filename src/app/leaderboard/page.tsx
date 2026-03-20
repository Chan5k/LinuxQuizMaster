import Link from "next/link";
import { prisma } from "@/lib/db";

async function getLeaderboard() {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      include: { user: { select: { username: true } } },
      orderBy: { completedAt: "desc" },
      take: 200,
    });

    const byUser = new Map<string, { username: string; totalScore: number; totalQuizzes: number }>();
    for (const a of attempts) {
      const existing = byUser.get(a.userId);
      const score = (a.score / a.total) * 100;
      if (!existing) {
        byUser.set(a.userId, {
          username: a.user.username,
          totalScore: score,
          totalQuizzes: 1,
        });
      } else {
        existing.totalScore += score;
        existing.totalQuizzes += 1;
      }
    }

    return Array.from(byUser.entries())
      .map(([, data]) => ({
        username: data.username,
        avgScore: Math.round(data.totalScore / data.totalQuizzes),
        quizzesCompleted: data.totalQuizzes,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 20);
  } catch {
    return [];
  }
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      <p className="text-slate-400 mb-8">
        Top scorers by average quiz score. Complete quizzes while logged in to appear here!
      </p>

      {leaderboard.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center text-slate-500">
          No scores yet. Be the first to take a quiz!
          <Link href="/quiz" className="block mt-4 text-terminal-green hover:underline">
            Start a quiz
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry: { username: string; avgScore: number; quizzesCompleted: number }, i: number) => (
            <div
              key={entry.username}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                    i === 0
                      ? "bg-yellow-500/20 text-yellow-400"
                      : i === 1
                      ? "bg-gray-400/20 text-slate-300"
                      : i === 2
                      ? "bg-amber-700/20 text-amber-600"
                      : "bg-gray-800 text-slate-500"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="font-medium">{entry.username}</span>
              </div>
              <div className="text-right">
                <span className="text-terminal-green font-semibold">{entry.avgScore}%</span>
                <p className="text-xs text-slate-500">{entry.quizzesCompleted} quiz{entry.quizzesCompleted !== 1 ? "zes" : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
