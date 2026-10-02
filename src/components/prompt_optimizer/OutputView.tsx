import { useState } from "react";
import { Check, Copy, Download, Info, Award, ChevronRight, Star } from "lucide-react";

interface OutputViewProps {
  finalPrompt: string;
  rawInput: string;
  structuralScore: number;
  adherenceMetrics: string[];
  explanation: string;
  targetModelName: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function OutputView({
  finalPrompt,
  rawInput,
  structuralScore,
  adherenceMetrics,
  explanation,
  targetModelName,
  isFavorite,
  onToggleFavorite,
}: OutputViewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"final" | "compare" | "explanation">("final");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([finalPrompt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `optimized-prompt-${targetModelName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Immersive UI Cyber Style Scheme for Score Indicators
  const getScoreColor = (score: number) => {
    if (score >= 90) return { text: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10", fill: "stroke-cyan-400" };
    if (score >= 70) return { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", fill: "stroke-amber-400" };
    return { text: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", fill: "stroke-rose-400" };
  };

  const activeScore = getScoreColor(structuralScore);

  return (
    <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full">
      {/* Header telemetry status bar */}
      <div className="border-b border-[var(--border)] bg-[var(--bg3)] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-xs tracking-[0.15em] text-white font-mono uppercase">
            AI Optimization Score & Results
          </h4>
        </div>

        <div className="flex gap-1.5 p-1 bg-[var(--bg3)] rounded-lg border border-[var(--border)]">
          {(["final", "compare", "explanation"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
              className={`px-3 py-1 text-[10px] font-bold tracking-wider font-mono rounded transition cursor-pointer uppercase ${
                activeTab === tab 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-xs" 
                  : "text-[var(--text2)] hover:text-[var(--text)] border border-transparent"
              }`}
            >
              {tab === "final" ? "Optimized" : tab === "compare" ? "Compare Before & After" : "AI Analysis Notes"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/60 flex-1">
        
        {/* LEFT & CENTER INTERACTIVE CODE VIEWS */}
        <div className="lg:col-span-2 p-5 flex flex-col min-h-[340px] bg-[var(--bg3)]">
          {activeTab === "final" && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text2)]">
                  optimized_prompt.txt
                </span>
                <div className="flex items-center gap-1.5">
                  {onToggleFavorite && (
                    <button
                      onClick={onToggleFavorite}
                      className={`px-3 py-1.5 hover:bg-slate-800 rounded transition flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase cursor-pointer border border-[var(--border)] bg-slate-800/30 ${isFavorite ? 'text-amber-400 hover:text-amber-300' : 'text-[var(--text)] hover:text-white'}`}
                    >
                      <Star className={`w-3 h-3 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-cyan-400'}`} />
                      <span>{isFavorite ? 'Saved to Favorites' : 'Save to Board'}</span>
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 hover:bg-slate-800 rounded text-[var(--text)] hover:text-white transition flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase cursor-pointer border border-[var(--border)] bg-slate-800/30"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-cyan-400 animate-scale" />
                        <span className="text-cyan-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-cyan-400" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 hover:bg-slate-800 rounded text-[var(--text)] hover:text-white transition flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase cursor-pointer border border-[var(--border)] bg-slate-800/30"
                  >
                    <Download className="w-3 h-3 text-cyan-400" />
                    <span>Download TXT</span>
                  </button>
                </div>
              </div>

              {/* High precision code block */}
              <div className="flex-1 relative bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden flex flex-col shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                <div className="bg-[var(--bg3)] border-b border-[var(--border)] px-4 py-2 flex items-center justify-between text-[10px] font-mono text-[var(--text2)] uppercase tracking-wider">
                  <span>Target AI: {targetModelName}</span>
                  <span>Optimized Prompt</span>
                </div>
                <textarea
                  readOnly
                  value={finalPrompt}
                  className="w-full flex-1 p-4 font-mono text-xs text-cyan-100/90 bg-transparent resize-none focus:outline-none leading-relaxed select-all"
                />
              </div>
            </div>
          )}

          {activeTab === "compare" && (
            <div className="flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {/* BEFORE PREVIEW */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold font-mono text-[var(--text2)] uppercase tracking-wider">
                      Before (Your Input Draft)
                    </span>
                    <span className="text-[9px] font-mono text-[var(--text2)]">
                      C: {rawInput.length}
                    </span>
                  </div>
                  <div className="flex-grow bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4 font-mono text-xs text-[var(--text2)] overflow-y-auto max-h-[190px] md:max-h-full leading-relaxed shadow-inner">
                    {rawInput}
                  </div>
                </div>

                {/* AFTER PREVIEW */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 text-cyan-500" /> After (Optimized Prompt)
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-950/40 border border-cyan-800/60 rounded px-1.5">
                      C: {finalPrompt.length}
                    </span>
                  </div>
                  <div className="flex-grow bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4 font-mono text-xs text-cyan-100/95 overflow-y-auto max-h-[190px] md:max-h-full leading-relaxed shadow-inner">
                    {finalPrompt}
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg3)] px-4 py-3 rounded-xl border border-[var(--border)] flex items-center justify-between text-xs text-[var(--text2)] font-mono">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[var(--text2)]" />
                  Prompt size increase:
                </span>
                <span className="font-bold text-white uppercase tracking-wider bg-[var(--bg3)] px-2 py-0.5 rounded border border-[var(--border)]">
                  {rawInput.length === 0 ? "0.0x" : `${(finalPrompt.length / rawInput.length).toFixed(1)}x longer and more detailed`}
                </span>
              </div>
            </div>
          )}

          {activeTab === "explanation" && (
            <div className="flex-grow flex flex-col justify-start">
              <span className="text-[10px] font-bold font-mono text-[var(--text2)] uppercase tracking-widest block mb-2">
                Optimization Progress Notes
              </span>
              <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-5 shadow-inner space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-slate-900 border border-[var(--border)] text-[var(--text2)] px-2 py-1.5 rounded font-mono text-[9px] font-bold leading-none shrink-0 tracking-widest">
                    STEP 1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold font-mono text-white tracking-wide uppercase mb-1">
                      Reorganizing Structure
                    </h5>
                    <p className="text-xs leading-relaxed text-[var(--text2)] font-sans">
                      {explanation}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-800/60" />

                <div className="flex items-start gap-3">
                  <div className="bg-cyan-950/45 border border-cyan-800/80 text-cyan-400 px-2 py-1.5 rounded font-mono text-[9px] font-bold leading-none shrink-0 tracking-widest">
                    DONE
                  </div>
                  <div>
                    <h5 className="text-xs font-bold font-mono text-white tracking-wide uppercase mb-1">
                      Guidelines Check Passed
                    </h5>
                    <p className="text-xs leading-relaxed text-[var(--text2)] font-sans">
                      We formatted and verified the prompt structure matches the recommended layout for <strong className="text-cyan-400 font-medium">{targetModelName}</strong> to give you great and accurate responses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT ANALYTICAL SIDEBAR */}
        <div className="p-5 flex flex-col justify-between gap-6 bg-[var(--bg3)] min-w-[240px]">
          {/* Dynamic Score gauge */}
          <div className="text-center space-y-3">
            <span className="text-[10px] font-bold font-mono text-[var(--text2)] uppercase tracking-widest block">
              OPTIMIZATION SCORE
            </span>

            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-slate-800 fill-none"
                  strokeWidth="6"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className={`fill-none transition-all duration-1000 ${activeScore.fill}`}
                  strokeWidth="6"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * structuralScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className={`absolute font-mono text-2xl font-bold text-white tracking-tight`}>
                {structuralScore}%
              </span>
            </div>

            <div>
              <div className={`mx-auto text-[10px] font-mono font-bold uppercase tracking-wider py-1 px-3 border rounded-full inline-block ${activeScore.text} ${activeScore.border} ${activeScore.bg}`}>
                {structuralScore >= 90 ? "EXCELLENT" : structuralScore >= 70 ? "GOOD" : "NEEDS WORK"}
              </div>
            </div>
          </div>

          {/* Extracted syntax checklist */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold font-mono text-[var(--text2)] uppercase tracking-widest block">
              RULES COMPLETED
            </span>
            <div className="space-y-2 max-h-[140px] overflow-y-auto select-scrollbar pr-1">
              {adherenceMetrics.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 text-xs font-semibold text-[var(--text)] bg-[var(--bg3)] border border-[var(--border)] p-3 rounded-lg font-mono"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)] shrink-0 animate-pulse" />
                  <span className="line-clamp-2 leading-tight uppercase text-[10px] text-zinc-300">{rule}</span>
                </div>
              ))}

              {adherenceMetrics.length === 0 && (
                <p className="text-[10px] text-[var(--text2)] italic font-mono py-4 text-center border border-dashed rounded-lg border-[var(--border)]">
                  Awaiting draft prompt to analyze.
                </p>
              )}
            </div>
          </div>

          {/* Custom micro warning or safety notice */}
          <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-lg p-3 text-[10px] text-[var(--text2)] flex items-start gap-2 leading-relaxed font-mono">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0 mt-1 animate-ping"></div>
            <span>
              Tip: We rephrased negative statements into positive actions. This is a best practice that helps AI models understand and achieve your goal much more effectively.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
