"use client";

import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import type { UserRole } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
  userImage?: string | null;
  pageTitle: string;
}

export function DashboardLayout({
  children,
  role,
  userName,
  userImage,
  pageTitle,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} userName={userName} userImage={userImage} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar title={pageTitle} userName={userName} userImage={userImage} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
