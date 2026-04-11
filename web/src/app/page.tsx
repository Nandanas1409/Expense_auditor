"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (data.role === "employee") {
        router.push("/employee");
      } else if (data.role === "auditor") {
        router.push("/auditor");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">Expense Auditor Login</h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Username</label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3">
              <User className="h-4 w-4 text-slate-500" />
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Password</label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3">
              <Lock className="h-4 w-4 text-slate-500" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

      </div>
    </main>
  );
}
