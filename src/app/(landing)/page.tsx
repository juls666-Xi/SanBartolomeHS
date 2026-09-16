import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, ClipboardCheck, Megaphone, Users } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-1 flex items-center justify-center px-6 py-20 text-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Empowering Education Through Technology
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            A modern Learning Management System for K-12 education.
            Streamline courses, assignments, and communication.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "Course Management", desc: "Create and organize courses with ease" },
              { icon: ClipboardCheck, title: "Assignments & Grades", desc: "Submit work, track progress, view grades" },
              { icon: Megaphone, title: "Announcements", desc: "School and class communication hub" },
              { icon: Users, title: "Role-Based Access", desc: "Separate dashboards for Admin, Teacher, Student" },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-y">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "500+", label: "Students" },
            { value: "50+", label: "Courses" },
            { value: "20+", label: "Teachers" },
            { value: "99%", label: "Uptime" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-4xl md:text-5xl font-bold text-primary">{value}</div>
              <div className="text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}