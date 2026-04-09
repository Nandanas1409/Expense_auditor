"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, Loader2, DollarSign, Sparkles } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

type Submission = {
  id: string;
  merchant: string | null;
  date: string | null;
  claimedDate: string | null;
  expenseCategory: string | null;
  location: string | null;
  seniority: string | null;
  totalAmount: number | null;
  currency: string | null;
  justification: string;
  status: "PENDING" | "APPROVED" | "FLAGGED" | "REJECTED";
  reasoning: string | null;
  createdAt: string;
};

export default function EmployeePortal() {
  const [file, setFile] = useState<File | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [claimedDate, setClaimedDate] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("MEALS");
  const [location, setLocation] = useState("");
  const [seniority, setSeniority] = useState("IC");
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submissionResult, setSubmissionResult] = useState<Submission | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionResult(null);
    setUploadError("");
    if (!file || !justification || !claimedDate || !location) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("employeeName", employeeName);
    formData.append("claimedDate", claimedDate);
    formData.append("expenseCategory", expenseCategory);
    formData.append("location", location);
    formData.append("seniority", seniority);
    formData.append("justification", justification);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSubmissionResult(data.submission);
        setFile(null);
        setEmployeeName("");
        setClaimedDate("");
        setExpenseCategory("MEALS");
        setLocation("");
        setSeniority("IC");
        setJustification("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const data = await res.json().catch(() => ({ error: "Upload failed." }));
        setUploadError(data.error || "Upload failed.");
      }
    } catch (error) {
      console.error(error);
      setUploadError("Upload failed due to a network or server issue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen" />
      <div className="pointer-events-none fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] mix-blend-screen" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 md:py-24 space-y-16">
        
        <div className="flex justify-end">
          <LogoutButton />
        </div>

        {/* Header Section */}
        <header className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold tracking-widest uppercase shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
            <Sparkles className="w-4 h-4" />
            <span>AI Policy Engine</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-white via-slate-200 to-indigo-400 text-transparent bg-clip-text pb-2 drop-shadow-sm">
            Expense Auditor
          </h1>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-light">
            Upload your receipt and provide a business justification. Our multimodal AI reads the receipt and instantly cross-references your claim against corporate policy.
          </p>
        </header>

        <div className="space-y-8">
          
          {/* Upload Form */}
          <div className="w-full relative rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] hover:border-slate-600/50">
            <div className="p-8 space-y-8 relative z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center space-x-3 text-slate-100">
                  <div className="p-2 bg-indigo-500/20 rounded-xl">
                    <FileText className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span>Submit Expense</span>
                </h2>
              </div>
              
              <form onSubmit={handleUpload} className="space-y-8">
                {/* Glowing Drag & Drop Zone */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed transition-all duration-300 group overflow-hidden ${file ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]' : 'border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5'}`}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept="image/*,application/pdf"
                  />
                  
                  <UploadCloud className={`w-12 h-12 mb-4 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-1 ${file ? 'text-emerald-400' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                  
                  <div className="text-center space-y-1 relative z-10">
                    <p className="text-base font-semibold text-slate-200">
                      {file ? file.name : "Click or drag receipt"}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>

                {/* Sleek Input */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold tracking-wide text-slate-300 ml-1 uppercase">Employee Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl p-5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner text-base"
                    placeholder="e.g., John Doe"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold tracking-wide text-slate-300 ml-1 uppercase">Claimed Date</label>
                    <input
                      required
                      type="date"
                      className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl p-5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner text-base"
                      value={claimedDate}
                      onChange={(e) => setClaimedDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold tracking-wide text-slate-300 ml-1 uppercase">Category</label>
                    <select
                      required
                      className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl p-5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner text-base"
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                    >
                      <option value="MEALS">Meals</option>
                      <option value="TRANSPORT">Transport</option>
                      <option value="LODGING">Lodging</option>
                      <option value="SOFTWARE">Software</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold tracking-wide text-slate-300 ml-1 uppercase">Location</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl p-5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner text-base"
                      placeholder="e.g., New York, SF, London"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold tracking-wide text-slate-300 ml-1 uppercase">Seniority</label>
                    <select
                      required
                      className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl p-5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner text-base"
                      value={seniority}
                      onChange={(e) => setSeniority(e.target.value)}
                    >
                      <option value="IC">Individual Contributor</option>
                      <option value="MANAGER">Manager</option>
                      <option value="DIRECTOR">Director</option>
                    </select>
                  </div>
                </div>

                {/* Sleek Textarea */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold tracking-wide text-slate-300 ml-1 uppercase">Business Justification</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl p-5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none shadow-inner text-base"
                    placeholder="e.g., Dinner meeting with Client Co. regarding Q3 targets..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                  />
                </div>

                {/* Animated Submit Button */}
                <button 
                  disabled={!file || !employeeName || !claimedDate || !location || !justification || isSubmitting}
                  className="w-full relative overflow-hidden rounded-2xl bg-indigo-600 text-white font-bold py-4 px-6 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 group transform"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center space-x-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Extracting OCR & Auditing...</span>
                    </span>
                  ) : (
                    <span>Run Policy Audit</span>
                  )}
                </button>
                {uploadError && (
                  <p className="text-sm text-rose-400">{uploadError}</p>
                )}
              </form>
            </div>
          </div>

          {/* Audit Result View */}
          {submissionResult && (
            <div className={`w-full relative rounded-3xl bg-slate-900/60 backdrop-blur-2xl border ${submissionResult.status === 'APPROVED' ? 'border-emerald-500/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]' : submissionResult.status === 'FLAGGED' ? 'border-amber-500/50 shadow-[0_0_40px_-10px_rgba(245,158,11,0.25)]' : 'border-rose-500/50 shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)]'} overflow-hidden transition-all duration-500 shadow-2xl animate-[fadeInUp_0.5s_ease-out_forwards]`}>
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${submissionResult.status === 'APPROVED' ? 'from-emerald-500/20' : submissionResult.status === 'FLAGGED' ? 'from-amber-500/20' : 'from-rose-500/20'} to-transparent rounded-tr-3xl pointer-events-none`} />
              
              <div className="p-8 space-y-8 relative z-10 w-full flex flex-col md:flex-row md:items-start md:space-x-8">
                {/* Premium Metric Box */}
                <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
                  <div className="w-32 h-32 md:w-28 md:h-28 rounded-2xl border border-slate-700 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                    <DollarSign className="w-5 h-5 text-slate-600 mb-1" />
                    <span className="text-4xl md:text-3xl font-extrabold bg-gradient-to-b from-white to-slate-400 text-transparent bg-clip-text">
                      {submissionResult.totalAmount ?? '??'}
                    </span>
                    <span className="text-xs font-bold text-slate-500 tracking-widest mt-1">
                      {submissionResult.currency ?? 'USD'}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-5 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-2xl font-bold text-slate-100 leading-tight">
                      {submissionResult.merchant || 'Unknown Merchant'}
                    </h3>
                    <span className={`inline-flex px-5 py-2 text-sm font-black uppercase rounded-lg tracking-widest shadow-sm ${submissionResult.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10' : submissionResult.status === 'FLAGGED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-amber-500/10' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-rose-500/10'}`}>
                      {submissionResult.status}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-slate-400">
                    <span className="text-slate-500 block mb-1">Your Justification:</span>
                    <p className="italic bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">&quot;{submissionResult.justification}&quot;</p>
                  </div>

                  {/* NLP Reasoning Box */}
                  <div className={`mt-4 p-5 md:p-6 rounded-2xl border leading-relaxed text-sm md:text-base ${submissionResult.status === 'APPROVED' ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-100/90' : submissionResult.status === 'FLAGGED' ? 'bg-amber-950/20 border-amber-900/50 text-amber-100/90' : 'bg-rose-950/20 border-rose-900/50 text-rose-100/90'}`}>
                    <strong className={`block mb-2 font-bold tracking-widest text-xs uppercase ${submissionResult.status === 'APPROVED' ? 'text-emerald-400' : submissionResult.status === 'FLAGGED' ? 'text-amber-400' : 'text-rose-400'}`}>
                      Verdict Reasoning:
                    </strong>
                    {submissionResult.reasoning}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </main>
  );
}
