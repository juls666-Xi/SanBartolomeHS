"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  course: { title: string };
  author: { name: string };
  createdAt: string;
}

export default function StudentAnnouncementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && (session.user as any).role !== "STUDENT") router.push("/");
  }, [session, status, router]);

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => res.json())
      .then(setAnnouncements)
      .catch(console.error);
  }, [session]);

  if (status === "loading" || !session) return null;

  return (
    <DashboardLayout
      role="STUDENT"
      userName={session.user?.name || ""}
      userImage={session.user?.image}
      pageTitle="Announcements"
    >
      <div className="space-y-4">
        {announcements.map((ann) => (
          <Card key={ann.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Megaphone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold">{ann.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {ann.course.title} • Posted by {ann.author.name} •{" "}
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No announcements</h3>
            <p className="text-muted-foreground">
              There are no announcements for your courses yet
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
