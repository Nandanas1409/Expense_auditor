import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export type UserRole = "employee" | "auditor";

export const SESSION_COOKIE = "expense_auth_session";

export async function validateCredentials(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username: username.trim() }
  });
  
  if (user && user.password === password) {
    return user;
  }
  return null;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionToken) return null;
  try {
    const sessionStr = Buffer.from(sessionToken, "base64").toString("utf-8");
    return JSON.parse(sessionStr) as { username: string; role: UserRole };
  } catch {
    return null;
  }
}
