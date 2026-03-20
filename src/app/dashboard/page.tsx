import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: session.id },
    orderBy: { completedAt: "desc" },
    take: 20,
  });

  const totalQuizzes = attempts.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / totalQuizzes
        )
      : 0;

  const byCategory = attempts.reduce(
    (acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {session.username}!</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-500 mb-1">Quizzes Completed</p>
          <p className="text-2xl font-bold text-emerald-400">{totalQuizzes}</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-500 mb-1">Average Score</p>
          <p className="text-2xl font-bold text-cyan-400">{avgScore}%</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-500 mb-1">Categories Tried</p>
          <p className="text-2xl font-bold text-violet-400">{Object.keys(byCategory).length}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
        <div className="grid gap-2">
          {Object.entries(byCategory).length === 0 ? (
            <p className="text-slate-500 py-4">No quizzes completed yet. Take one to see stats!</p>
          ) : (
            Object.entries(byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                >
                  <span>{cat}</span>
                  <span className="text-emerald-400">{count} quiz{count !== 1 ? "zes" : ""}</span>
                </div>
              ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Attempts</h2>
        {attempts.length === 0 ? (
          <p className="text-slate-500 py-4">
            No attempts yet.{" "}
            <Link href="/quiz" className="text-emerald-400 hover:underline">
              Start a quiz
            </Link>
            !
          </p>
        ) : (
          <div className="space-y-2">
            {attempts.map((a) => {
              const pct = Math.round((a.score / a.total) * 100);
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                >
                  <div>
                    <span className="font-medium">{a.category}</span>
                    <span className="text-slate-500 ml-2 text-sm">
                      {a.completedAt.toLocaleDateString()}
                    </span>
                  </div>
                  <span className={pct >= 70 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-slate-400"}>
                    {a.score}/{a.total} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors"
        >
          Take a Quiz
        </Link>
      </div>
    </div>
  );
}
