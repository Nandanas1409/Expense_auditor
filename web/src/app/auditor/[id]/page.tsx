import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, BadgeAlert, Clock, User, Store, Calendar, DollarSign, FileText, Sparkles } from "lucide-react";
import AuditOverrideForm from "@/components/AuditOverrideForm";

type RuleResult = {
  ruleId: string;
  title: string;
  passed: boolean;
  severity: "warn" | "fail";
  message: string;
};

const prisma = new PrismaClient();

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default async function AuditDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await prisma.expenseSubmission.findUnique({
    where: { id },
  });

  if (!submission) {
    return notFound();
  }

  const extracted = parseJson<Record<string, unknown>>(submission.extractedData, {});
  const ruleResults = parseJson<RuleResult[]>(submission.policyRuleResults, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="pointer-events-none fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/5 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-8">
        <header className="flex items-center space-x-4">
          <Link href="/auditor" className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
            Audit Insight
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl h-[800px]">
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-400">Captured Receipt</h2>
              <span className="text-xs text-slate-500">{submission.imageUrl?.split("/").pop()}</span>
            </div>
            <div className="flex-1 bg-slate-950 relative overflow-auto p-4 flex items-center justify-center">
              {submission.imageUrl ? (
                <img
                  src={submission.imageUrl}
                  alt="Receipt"
                  className="max-w-full h-auto object-contain rounded-xl border border-slate-800 shadow-xl"
                />
              ) : (
                <div className="text-slate-600 flex flex-col items-center">
                  <FileText className="w-12 h-12 mb-2 opacity-50" />
                  <span>No image provided</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 flex flex-col h-[800px] overflow-y-auto pr-2 pb-10">
            <div className={`w-full p-8 rounded-3xl border ${
              submission.status === "REJECTED"
                ? "bg-rose-950/20 border-rose-900 shadow-[0_0_40px_-10px_rgba(244,63,94,0.15)]"
                : submission.status === "APPROVED"
                  ? "bg-emerald-950/20 border-emerald-900 shadow-[0_0_40px_-10px_rgba(16,185,129,0.15)]"
                  : "bg-amber-950/20 border-amber-900 shadow-[0_0_40px_-10px_rgba(245,158,11,0.15)]"
            }`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-1">Audit Verdict</h3>
                  <div className={`flex items-center space-x-3 text-3xl font-extrabold ${
                    submission.status === "REJECTED"
                      ? "text-rose-400"
                      : submission.status === "APPROVED"
                        ? "text-emerald-400"
                        : "text-amber-300"
                  }`}>
                    {submission.status === "REJECTED" && <BadgeAlert className="w-8 h-8" />}
                    {submission.status === "APPROVED" && <CheckCircle className="w-8 h-8" />}
                    {(submission.status === "FLAGGED" || submission.status === "PENDING") && <Clock className="w-8 h-8" />}
                    <span>{submission.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 font-medium">Claim Value</div>
                  <div className="text-4xl font-mono font-black text-slate-100 mt-1">
                    ${submission.totalAmount?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Deterministic Reasoning</div>
                <p className="text-slate-300 leading-relaxed text-sm">{submission.reasoning}</p>
              </div>

              {submission.auditorOverride && submission.auditorComment && (
                <div className="mt-4 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900 text-indigo-100 text-sm">
                  <div className="text-xs uppercase tracking-widest text-indigo-300 mb-1">Auditor Override Comment</div>
                  {submission.auditorComment}
                </div>
              )}
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 space-y-8">
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Extracted Data & Policy Trace</span>
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Employee</div>
                  <div className="font-medium text-slate-200">{submission.employeeName || "Unknown"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5"><Store className="w-3.5 h-3.5" /> Merchant</div>
                  <div className="font-medium text-slate-200">{String(extracted.merchant ?? submission.merchant ?? "Unknown")}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Receipt Date</div>
                  <div className="font-medium text-slate-200">{submission.date || "N/A"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Currency</div>
                  <div className="font-medium text-slate-200">{submission.currency || "USD"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Category</div>
                  <div className="font-medium text-slate-200">{submission.expenseCategory || "N/A"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Location / Seniority</div>
                  <div className="font-medium text-slate-200">{submission.location || "N/A"} / {submission.seniority || "N/A"}</div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase">Business Purpose</div>
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-300 italic text-sm">
                  &quot;{submission.justification}&quot;
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase">Rule Evaluation</div>
                <div className="space-y-2">
                  {ruleResults.map((rule) => (
                    <div
                      key={rule.ruleId}
                      className={`p-3 rounded-xl border text-sm ${
                        rule.passed
                          ? "bg-emerald-950/20 border-emerald-900/60 text-emerald-200"
                          : rule.severity === "fail"
                            ? "bg-rose-950/20 border-rose-900/60 text-rose-200"
                            : "bg-amber-950/20 border-amber-900/60 text-amber-200"
                      }`}
                    >
                      <div className="font-semibold">{rule.ruleId} - {rule.title}</div>
                      <div className="text-xs opacity-90 mt-1">{rule.message}</div>
                    </div>
                  ))}
                  {ruleResults.length === 0 && (
                    <div className="text-sm text-slate-500">No deterministic rule traces were recorded.</div>
                  )}
                </div>
              </div>
            </div>

            <AuditOverrideForm submissionId={submission.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
