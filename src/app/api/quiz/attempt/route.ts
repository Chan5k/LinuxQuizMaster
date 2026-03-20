import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, score, total } = await req.json();

    if (typeof score !== "number" || typeof total !== "number" || !category) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await prisma.quizAttempt.create({
      data: {
        userId: session.id,
        category,
        score,
        total,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quiz attempt error:", error);
    return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
  }
}
