import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalUsers, totalCourses, totalStudents, totalTeachers, totalEnrollments, totalQuizAttempts] =
      await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "TEACHER" } }),
        prisma.enrollment.count(),
        prisma.quizAttempt.count(),
      ]);

    return NextResponse.json({
      totalUsers,
      totalCourses,
      totalStudents,
      totalTeachers,
      totalEnrollments,
      totalQuizAttempts,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
