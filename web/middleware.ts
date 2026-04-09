import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(SESSION_COOKIE)?.value;

  if (pathname === "/") {
    if (role === "employee") {
      return NextResponse.redirect(new URL("/employee", request.url));
    }
    if (role === "auditor") {
      return NextResponse.redirect(new URL("/auditor", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/employee") && role !== "employee") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/auditor") && role !== "auditor") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/employee/:path*", "/auditor/:path*"],
};
