import { NextResponse } from "next/server";
import { SESSION_COOKIE, validateCredentials } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const user = validateCredentials(username ?? "", password ?? "");

  if (!user) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ role: user.role });
  response.cookies.set(SESSION_COOKIE, user.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
