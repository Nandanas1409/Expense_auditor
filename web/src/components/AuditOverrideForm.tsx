"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  submissionId: string;
};

export default function AuditOverrideForm({ submissionId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState("FLAGGED");
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/audit/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, status, comment }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Override failed");
        return;
      }

      setComment("");
      router.refresh();
    } catch {
      setError("Override request failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Human Override</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        >
          <option value="APPROVED">APPROVED</option>
          <option value="FLAGGED">FLAGGED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Auditor comment"
          className="md:col-span-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          required
        />
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Apply Override"}
      </button>
    </form>
  );
}
