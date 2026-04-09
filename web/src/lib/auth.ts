export type UserRole = "employee" | "auditor";

export const SESSION_COOKIE = "expense_auth_role";

const USERS = [
  { username: "employee", password: "employee123", role: "employee" as const },
  { username: "auditor", password: "auditor123", role: "auditor" as const },
];

export function validateCredentials(username: string, password: string) {
  return USERS.find(
    (user) => user.username === username.trim() && user.password === password
  );
}
