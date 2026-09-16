"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, BookOpen, Plus } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  teacher: { name: string };
  modules: { lessons: any[] }[];
  _count: { enrollments: number };
}

interface Enrollment {
  courseId: string;
}

export default function StudentCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "enrolled">("enrolled");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && (session.user as any).role !== "STUDENT") router.push("/");
  }, [session, status, router]);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then(setCourses)
      .catch(console.error);
    fetch("/api/enrollments")
      .then((res) => res.json())
      .then((data) => setEnrollments(data.map((e: any) => ({ courseId: e.course.id }))))
      .catch(console.error);
  }, [session]);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  const handleEnroll = async (courseId: string) => {
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, studentId: session?.user?.id }),
    });
    if (res.ok) {
      setEnrollments([...enrollments, { courseId }]);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const displayCourses =
    activeTab === "enrolled"
      ? filteredCourses.filter((c) => enrolledCourseIds.has(c.id))
      : filteredCourses.filter((c) => !enrolledCourseIds.has(c.id));

  if (status === "loading" || !session) return null;

  return (
    <DashboardLayout
      role="STUDENT"
      userName={session.user?.name || ""}
      userImage={session.user?.image}
      pageTitle="Courses"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={activeTab === "enrolled" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("enrolled")}
            >
              My Courses ({enrollments.length})
            </Button>
            <Button
              variant={activeTab === "browse" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("browse")}
            >
              Browse All
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-8 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            return (
              <Card key={course.id}>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      by {course.teacher.name}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    {course.modules.length} modules • {course._count.enrollments} students
                  </div>
                  <div>
                    {isEnrolled ? (
                      <Link href={`/student/courses/${course.id}`}>
                        <Button className="w-full" size="sm">
                          Continue Learning
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        className="w-full"
                        size="sm"
                        variant="outline"
                        onClick={() => handleEnroll(course.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Enroll
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {displayCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">
              {activeTab === "enrolled" ? "No courses yet" : "No courses available"}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === "enrolled"
                ? "Browse and enroll in courses to get started"
                : "Check back later for new courses"}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
