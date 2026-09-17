import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);

  const { data: { user } } = await supabase.auth.getUser();

  const publicPaths = ["/", "/login", "/register", "/api/auth"];
  const pathname = req.nextUrl.pathname;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    if (user?.user_metadata?.role) {
      return NextResponse.redirect(new URL(getDashboardPath(user.user_metadata.role as string), req.url));
    }
    return res;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = user.user_metadata?.role as string;
  if (!role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(getDashboardPath(role), req.url));
  }

  const rolePrefix = pathname.split("/")[1];
  if (rolePrefix && rolePrefix !== role.toLowerCase()) {
    return NextResponse.redirect(new URL(getDashboardPath(role), req.url));
  }

  return res;
}

function getDashboardPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    default:
      return "/login";
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};