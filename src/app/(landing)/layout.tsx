"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function LandingLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
          <GraduationCap className="h-8 w-8 text-primary" />
          San BartolomeHS
        </Link>
        <div className="flex items-center gap-4">
          {!isAuthPage && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      {modal}

      <footer className="border-t px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2026 San BartolomeHS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}