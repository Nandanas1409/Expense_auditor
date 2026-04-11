import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { BadgeAlert, CheckCircle, Clock } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function AuditorDashboard() {
  const submissions = await prisma.expenseSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  const riskOrder: Record<string, number> = {
    REJECTED: 0,
    FLAGGED: 1,
    PENDING: 2,
    APPROVED: 3,
  };

  // Sort highest risk items to the top
  const sortedSubmissions = [...submissions].sort((a, b) => {
    return (riskOrder[a.status] ?? 99) - (riskOrder[b.status] ?? 99);
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 p-8">
      <div className="pointer-events-none fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      
      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
              Finance Dashboard
            </h1>
            <p className="text-slate-500 mt-2">Prioritize flagged claims and run final checks.</p>
          </div>
          <LogoutButton />
        </header>

        <div className="w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-sm tracking-wider uppercase">
                  <th className="p-6 font-semibold">Employee</th>
                  <th className="p-6 font-semibold">Merchant</th>
                  <th className="p-6 font-semibold">Date</th>
                  <th className="p-6 font-semibold">Total Amount</th>
                  <th className="p-6 font-semibold">Risk Status</th>
                  <th className="p-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sortedSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-6">
                      <div className="font-medium text-slate-200">{sub.employeeName || "Unknown Employee"}</div>
                      <div className="text-xs text-slate-500 mt-1 truncate max-w-[280px]">
                        {sub.reasoning || sub.justification}
                      </div>
                    </td>
                    <td className="p-6 font-medium bg-gradient-to-r from-slate-200 to-slate-400 text-transparent bg-clip-text">
                      {sub.merchant || "Unknown"}
                    </td>
                    <td className="p-6 text-slate-400">
                      {sub.date ? new Date(sub.date).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-6 font-mono font-semibold text-slate-300">
                      ${sub.totalAmount?.toFixed(2)}
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col items-start space-y-2">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                          sub.status === "REJECTED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_-2px_rgba(244,63,94,0.2)]"
                            : sub.status === "FLAGGED"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : sub.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}>
                          {(sub.status === "FLAGGED" || sub.status === "REJECTED") && <BadgeAlert className="w-3.5 h-3.5" />}
                          {sub.status === "APPROVED" && <CheckCircle className="w-3.5 h-3.5" />}
                          {sub.status === "PENDING" && <Clock className="w-3.5 h-3.5" />}
                          <span>{sub.status}</span>
                        </div>
                        {sub.auditorOverride && (
                          <div className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            Overridden
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <Link 
                        href={`/auditor/${sub.id}`}
                        className="inline-flex px-4 py-2 text-sm font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-500 hover:text-white transition-all transform active:scale-95 shadow-sm"
                      >
                        Audit
                      </Link>
                    </td>
                  </tr>
                ))}
                
                {sortedSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                      No expense claims pending.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
