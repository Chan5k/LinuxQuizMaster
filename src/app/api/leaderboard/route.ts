import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      include: { user: { select: { username: true } } },
      orderBy: { completedAt: "desc" },
      take: 100,
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

    const leaderboard = Array.from(byUser.entries())
      .map(([userId, data]) => ({
        userId,
        username: data.username,
        avgScore: Math.round(data.totalScore / data.totalQuizzes),
        quizzesCompleted: data.totalQuizzes,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 20);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
