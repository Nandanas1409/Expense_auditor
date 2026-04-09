"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}
