"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  BookOpen,
  FileText,
  Upload,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Users,
  Megaphone,
  Settings,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  modules: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      type: string;
      lessonFiles: {
        file: { originalName: string; mimeType: string; size: number };
      }[];
    }[];
    quizzes: { id: string; title: string }[];
  }[];
  enrollments: {
    student: { id: string; name: string; email: string };
    progress: { completed: boolean }[];
  }[];
  announcements: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: { name: string };
  }[];
  _count: { enrollments: number };
}

export default function TeacherCourseManagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<"modules" | "students" | "announcements">("modules");

  // Module form
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [showModuleForm, setShowModuleForm] = useState(false);

  // Lesson form
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDesc, setNewLessonDesc] = useState("");
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Announcement form
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && (session.user as any).role !== "TEACHER") router.push("/");
    fetchCourse();
  }, [session, status, router, courseId]);

  const fetchCourse = async () => {
    const res = await fetch(`/api/courses/${courseId}`);
    if (res.ok) {
      const data = await res.json();
      setCourse(data);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newModuleTitle,
        courseId,
        order: course?.modules.length || 0,
      }),
    });
    setNewModuleTitle("");
    setShowModuleForm(false);
    fetchCourse();
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;

    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newLessonTitle,
        description: newLessonDesc,
        moduleId: selectedModule,
        order: 0,
      }),
    });

    if (res.ok) {
      setNewLessonTitle("");
      setNewLessonDesc("");
      setShowLessonForm(false);
      setSelectedModule(null);
      fetchCourse();
    }
  };

  const handleFileUpload = async (lessonId: string, files: FileList | null) => {
    if (!files) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (uploadRes.ok) {
        const { id: fileId } = await uploadRes.json();
        await fetch("/api/lessons/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, fileId, order: i }),
        });
      }
    }

    setUploading(false);
    fetchCourse();
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
    fetchCourse();
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
    fetchCourse();
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: announcementTitle,
        content: announcementContent,
        courseId,
      }),
    });
    setAnnouncementTitle("");
    setAnnouncementContent("");
    setShowAnnouncementForm(false);
    fetchCourse();
  };

  if (status === "loading" || !session || !course) return null;

  return (
    <DashboardLayout
      role="TEACHER"
      userName={session.user?.name || ""}
      userImage={session.user?.image}
      pageTitle={`Manage: ${course.title}`}
    >
      <div className="space-y-6">
        {/* Tab navigation */}
        <div className="flex gap-2 border-b pb-2">
          {(["modules", "students", "announcements"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "secondary" : "ghost"}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab === "modules" && <BookOpen className="h-4 w-4 mr-2" />}
              {tab === "students" && <Users className="h-4 w-4 mr-2" />}
              {tab === "announcements" && <Megaphone className="h-4 w-4 mr-2" />}
              {tab}
            </Button>
          ))}
        </div>

        {/* Modules Tab */}
        {activeTab === "modules" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowModuleForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>

            {showModuleForm && (
              <Card>
                <CardContent className="p-4">
                  <form onSubmit={handleAddModule} className="flex gap-2">
                    <Input
                      placeholder="Module title"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button type="submit">Add</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowModuleForm(false)}>
                      Cancel
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {course.modules.map((mod) => (
              <Card key={mod.id}>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">{mod.title}</CardTitle>
                    <Badge variant="secondary">{mod.lessons.length} lessons</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedModule(mod.id);
                        setShowLessonForm(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Lesson
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteModule(mod.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {showLessonForm && selectedModule === mod.id && (
                    <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                      <form onSubmit={handleAddLesson} className="space-y-3">
                        <Input
                          placeholder="Lesson title"
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          required
                        />
                        <Textarea
                          placeholder="Lesson description (optional)"
                          value={newLessonDesc}
                          onChange={(e) => setNewLessonDesc(e.target.value)}
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm">Create Lesson</Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setShowLessonForm(false);
                              setSelectedModule(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {mod.lessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No lessons yet</p>
                  ) : (
                    <div className="space-y-2">
                      {mod.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {lesson.lessonFiles.length} file(s)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <label>
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(lesson.id, e.target.files)}
                              />
                              <Button size="sm" variant="outline">
                                  <Upload className="h-3 w-3 mr-1" />
                                  {uploading ? "Uploading..." : "Upload Files"}
                              </Button>
                            </label>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteLesson(lesson.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {course.enrollments.map((enrollment) => {
                    const completed = enrollment.progress.filter((p) => p.completed).length;
                    const total = enrollment.progress.length || 1;
                    return (
                      <tr key={enrollment.student.id} className="border-b last:border-0">
                        <td className="p-4">{enrollment.student.name}</td>
                        <td className="p-4 text-muted-foreground">{enrollment.student.email}</td>
                        <td className="p-4">
                          <Badge variant={completed === total ? "default" : "secondary"}>
                            {completed}/{total} completed
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {course.enrollments.length === 0 && (
                <p className="p-4 text-center text-muted-foreground">No students enrolled yet</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowAnnouncementForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Post Announcement
              </Button>
            </div>

            {showAnnouncementForm && (
              <Card>
                <CardContent className="p-4">
                  <form onSubmit={handlePostAnnouncement} className="space-y-3">
                    <Input
                      placeholder="Announcement title"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      required
                    />
                    <Textarea
                      placeholder="Write your announcement..."
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      required
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button type="submit">Post</Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowAnnouncementForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {course.announcements.map((ann) => (
              <Card key={ann.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{ann.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Posted by {ann.author.name} on{" "}
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
