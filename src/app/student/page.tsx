"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Megaphone, Trophy, Clock } from "lucide-react";

interface Enrollment {
  id: string;
  course: {
    id: string;
    title: string;
    teacher: { name: string };
    modules: { lessons: any[] }[];
  };
  progress: { completed: boolean }[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  course: { title: string };
  createdAt: string;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && (session.user as any).role !== "STUDENT") router.push("/");
  }, [session, status, router]);

  useEffect(() => {
    fetch("/api/enrollments")
      .then((res) => res.json())
      .then(setEnrollments)
      .catch(console.error);
    fetch("/api/announcements")
      .then((res) => res.json())
      .then(setAnnouncements)
      .catch(console.error);
  }, [session]);

  if (status === "loading" || !session) return null;

  const totalLessons = enrollments.reduce(
    (acc, e) => acc + e.course.modules.reduce((a, m) => a + m.lessons.length, 0),
    0
  );
  const completedLessons = enrollments.reduce(
    (acc, e) => acc + e.progress.filter((p) => p.completed).length,
    0
  );

  return (
    <DashboardLayout
      role="STUDENT"
      userName={session.user?.name || ""}
      userImage={session.user?.image}
      pageTitle="Student Dashboard"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {session.user?.name}!</h2>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedLessons}/{totalLessons}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcements.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-4">My Courses</h3>
            <div className="space-y-3">
              {enrollments.slice(0, 4).map((enrollment) => {
                const completed = enrollment.progress.filter((p) => p.completed).length;
                const total = enrollment.course.modules.reduce(
                  (a, m) => a + m.lessons.length,
                  0
                );
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <Card key={enrollment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{enrollment.course.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            by {enrollment.course.teacher.name}
                          </p>
                        </div>
                        <Link href={`/student/courses/${enrollment.course.id}`}>
                          <Button variant="ghost" size="sm">
                            Continue
                          </Button>
                        </Link>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Announcements</h3>
            <div className="space-y-3">
              {announcements.slice(0, 4).map((ann) => (
                <Card key={ann.id}>
                  <CardContent className="p-4">
                    <h4 className="font-medium">{ann.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {ann.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {ann.course.title} • {new Date(ann.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
