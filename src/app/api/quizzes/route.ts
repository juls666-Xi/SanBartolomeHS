import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, timeLimit, passingScore, moduleId, questions } = await req.json();

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        timeLimit,
        passingScore: passingScore || 70,
        moduleId,
        questions: {
          create: questions.map((q: any, i: number) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            order: i,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Quiz creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizzes = await prisma.quiz.findMany({
      include: {
        questions: { orderBy: { order: "asc" } },
        module: { select: { title: true, courseId: true } },
        attempts: {
          where: { studentId: session.user.id as string },
          orderBy: { attemptedAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
