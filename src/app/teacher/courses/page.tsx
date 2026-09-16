"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, BookOpen, Users, Settings, Trash2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  _count: { enrollments: number };
  modules: { lessons: any[] }[];
}

export default function TeacherCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && (session.user as any).role !== "TEACHER") router.push("/");
  }, [session, status, router]);

  useEffect(() => {
    fetchCourses();
  }, [session]);

  const fetchCourses = async () => {
    const res = await fetch("/api/courses");
    const data = await res.json();
    const myCourses = data.filter((c: any) => c.teacher.id === session?.user?.id);
    setCourses(myCourses);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
    fetchCourses();
  };

  if (status === "loading" || !session) return null;

  return (
    <DashboardLayout
      role="TEACHER"
      userName={session.user?.name || ""}
      userImage={session.user?.image}
      pageTitle="My Courses"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link href="/teacher/courses/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description || "No description"}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {course.modules.length} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course._count.enrollments} students
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/teacher/courses/${course.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-3 w-3 mr-1" />
                      Manage
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No courses yet</h3>
            <p className="text-muted-foreground">Create your first course to get started</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
