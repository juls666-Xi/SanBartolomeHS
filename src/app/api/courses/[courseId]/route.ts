import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        modules: {
          include: {
            lessons: {
              include: {
                lessonFiles: {
                  include: { file: true },
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
            quizzes: {
              include: { questions: true },
            },
          },
          orderBy: { order: "asc" },
        },
        enrollments: {
          include: {
            student: { select: { id: true, name: true, email: true } },
            progress: true,
          },
        },
        announcements: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, thumbnail } = await req.json();

    const course = await prisma.course.update({
      where: { id: params.courseId },
      data: { title, description, thumbnail },
    });

    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.course.delete({ where: { id: params.courseId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
