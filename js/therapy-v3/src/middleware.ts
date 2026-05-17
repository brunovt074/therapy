import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only protect /admin/* routes
  if (!path.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow login page
  if (path === "/admin/login") {
    return NextResponse.next();
  }

  // Check for token in cookie (synced with localStorage on login)
  const token = request.cookies.get("therapy_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
