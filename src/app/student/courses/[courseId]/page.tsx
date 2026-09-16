"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  Film,
  File,
  Play,
  ArrowLeft,
  BookOpen,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  teacher: { name: string };
  modules: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      description: string | null;
      type: string;
      order: number;
      lessonFiles: {
        id: string;
        order: number;
        file: {
          id: string;
          filename: string;
          originalName: string;
          mimeType: string;
          size: number;
        };
      }[];
    }[];
  }[];
  enrollments: { progress: { lessonId: string; completed: boolean }[] }[];
}

export default function StudentCourseDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && (session.user as any).role !== "STUDENT") router.push("/");
    fetchCourse();
  }, [session, status, router, courseId]);

  const fetchCourse = async () => {
    const res = await fetch(`/api/courses/${courseId}`);
    if (res.ok) {
      const data = await res.json();
      setCourse(data);

      // Set completed lessons
      const enrollment = data.enrollments?.[0];
      if (enrollment) {
        const completed = new Set<string>(
          enrollment.progress.filter((p: any) => p.completed).map((p: any) => p.lessonId)
        );
        setCompletedLessons(completed);
      }

      // Expand first module
      if (data.modules.length > 0) {
        setExpandedModules(new Set([data.modules[0].id]));
      }
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const markComplete = async (lessonId: string) => {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, courseId }),
    });

    if (res.ok) {
      setCompletedLessons((prev) => new Set([...Array.from(prev), lessonId]));
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("video/")) return <Film className="h-4 w-4" />;
    if (mimeType === "application/pdf") return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const canPreview = (mimeType: string) => {
    return (
      mimeType.startsWith("image/") ||
      mimeType === "application/pdf" ||
      mimeType.startsWith("video/")
    );
  };

  const getPreviewUrl = (file: { filename: string; mimeType: string }) => {
    if (file.mimeType.startsWith("video/")) {
      return `/uploads/${file.filename}`;
    }
    return `/uploads/${file.filename}`;
  };

  if (status === "loading" || !session || !course) return null;

  const currentLesson = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === selectedLesson);

  const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
  const completedCount = completedLessons.size;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <DashboardLayout
      role="STUDENT"
      userName={session.user?.name || ""}
      userImage={session.user?.image}
      pageTitle={course.title}
    >
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        {/* Left sidebar - modules/lessons */}
        <div className="w-80 shrink-0 overflow-y-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/student/courses")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Button>

          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                by {course.teacher.name}
              </p>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{completedCount}/{totalLessons} lessons</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {course.modules.map((mod) => (
              <div key={mod.id}>
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="flex items-center gap-2 w-full p-2 text-left text-sm font-medium hover:bg-muted rounded-lg"
                >
                  {expandedModules.has(mod.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {mod.title}
                </button>

                {expandedModules.has(mod.id) && (
                  <div className="ml-4 space-y-1">
                    {mod.lessons.map((lesson) => {
                      const isCompleted = completedLessons.has(lesson.id);
                      const isSelected = selectedLesson === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson.id)}
                          className={`flex items-center gap-2 w-full p-2 text-left text-sm rounded-lg transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right content - lesson viewer */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{currentLesson.title}</CardTitle>
                  {!completedLessons.has(currentLesson.id) && (
                    <Button
                      size="sm"
                      onClick={() => markComplete(currentLesson.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                  )}
                  {completedLessons.has(currentLesson.id) && (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                {currentLesson.description && (
                  <p className="text-muted-foreground">{currentLesson.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLesson.lessonFiles.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>No files attached to this lesson yet</p>
                  </div>
                ) : (
                  currentLesson.lessonFiles.map((lf) => (
                    <div
                      key={lf.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon(lf.file.mimeType)}
                          <div>
                            <p className="text-sm font-medium">{lf.file.originalName}</p>
                            <p className="text-xs text-muted-foreground">
                              {(lf.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {canPreview(lf.file.mimeType) && (
                            <a
                              href={getPreviewUrl(lf.file)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline">
                                <Play className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                            </a>
                          )}
                          <a href={`/uploads/${lf.file.filename}`} download>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </div>

                      {/* Inline preview for images */}
                      {lf.file.mimeType.startsWith("image/") && (
                        <div className="mt-4">
                          <img
                            src={`/uploads/${lf.file.filename}`}
                            alt={lf.file.originalName}
                            className="max-w-full rounded-lg"
                          />
                        </div>
                      )}

                      {/* Inline preview for videos */}
                      {lf.file.mimeType.startsWith("video/") && (
                        <div className="mt-4">
                          <video
                            controls
                            className="w-full rounded-lg"
                            src={`/uploads/${lf.file.filename}`}
                          />
                        </div>
                      )}

                      {/* Inline preview for PDFs */}
                      {lf.file.mimeType === "application/pdf" && (
                        <div className="mt-4">
                          <iframe
                            src={`/uploads/${lf.file.filename}`}
                            className="w-full h-[600px] rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Select a lesson</h3>
                <p className="text-muted-foreground">
                  Choose a lesson from the sidebar to start learning
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
