import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId, answers } = await req.json();

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let correct = 0;
    const results = quiz.questions.map((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correct++;
      return { questionId: q.id, selectedAnswer: userAnswer, correct: isCorrect };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);

    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId: session.user.id as string,
        quizId,
        score,
        answers: results,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score,
      total: quiz.questions.length,
      correct,
      passing: score >= quiz.passingScore,
      results,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
