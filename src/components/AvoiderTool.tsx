
import { useState, useEffect } from "react";
import { Mode, AuditResponse as TAuditResponse, UserState } from "../types";
import MetricCard from "./MetricCard";
import ResultsViewer from "./ResultsViewer";
import { Server, Zap, RefreshCw, Trash2, BookOpen, ChevronRight, AlertCircle } from "lucide-react";

interface AvoiderToolProps {
  userState: UserState;
  
  
  
  
}

export default function AvoiderTool({ userState, }: AvoiderToolProps) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("rewrite");
  const [context, setContext] = useState<string>("blog");

  // Diagnostic loading & API states
  const [isAuditing, setIsAuditing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<TAuditResponse | null>(null);

  // Dynamic client-side metrics calculation for immediate responsiveness in the editor
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const stripCodeText = text.replace(/```[\s\S]*?```/g, "");
    const words = stripCodeText.toLowerCase().match(/\b\w+\b/g) || [];
    setWordCount(words.length);
  }, [text]);

  // Perform diagnostic audit fetch
  const handleRunAudit = async () => {
    if (!text || text.trim().length === 0) return;
    
    

    setIsAuditing(true);
    setApiError(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'X-User-API-Key': userState.apiKey || '',
          'X-Provider': userState.provider || 'google',
          'X-Selected-Model': userState.model || 'auto',
          'X-User-Uid': userState.email ? (userState as any).uid || '' : '',
          'X-User-Email': userState.email || '',
        },
        body: JSON.stringify({ text, mode, context }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `System Server responded with code ${response.status}`);
      }

      const parsed: TAuditResponse = await response.json()
      setAuditResult(parsed);
      } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An error occurred connecting to the Gemini Diagnostic host.");
    } finally {
      setIsAuditing(false);
    }
  };

  // Explanation for Context Profiles
  const getProfileDescription = (profile: string) => {
    return profile ? `Analysis focused on: ${profile}` : "Enter a specific media type to tune the analysis (e.g., Email to HR, Legal Contract).";
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in text-[var(--text)]">
        
        {/* Core Settings Deck & Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Model Params Controller (12 cols) */}
          <div className="lg:col-span-12 bg-[var(--bg2)] border border-[var(--border)] p-4 shadow-[2px_2px_0px_0px_rgba(20,20,20,0.2)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-text mb-3.5">
                <Zap size={14} className="text-[var(--text)]" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider">
                  Parameter configuration controller
                </h4>
              </div>

              {/* Edit Modes Tabs */}
              <div className="mb-4">
                <label className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--text2)] block mb-1.5">
                  AUDIT MODE SPECIFICATION
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--bg)] border border-[var(--border)]">
                  <button
                    onClick={() => setMode("rewrite")}
                    className={`py-1.5 text-center text-[10.5px] uppercase tracking-tight font-bold cursor-pointer transition-colors ${
                      mode === "rewrite"
                        ? "bg-[var(--accent)]/15 border border-[var(--accent)]/50 text-[var(--accent)]"
                        : "text-[var(--text2)] hover:bg-[var(--bg2)]"
                    }`}
                  >
                    Analysis + Polished Rewrite
                  </button>
                  <button
                    onClick={() => setMode("detect")}
                    className={`py-1.5 text-center text-[10.5px] uppercase tracking-tight font-bold cursor-pointer transition-colors ${
                      mode === "detect"
                        ? "bg-[var(--accent)]/15 border border-[var(--accent)]/50 text-[var(--accent)]"
                        : "text-[var(--text2)] hover:bg-[var(--bg2)]"
                    }`}
                  >
                    Flag and Audit Only
                  </button>
                </div>
              </div>

              {/* Target Context Input */}
              <div className="mb-2">
                <label className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--text2)] block mb-1.5">
                  Media Type
                </label>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. Email to HR, Legal Contract"
                  className="w-full bg-[var(--bg)] p-2 text-[11px] border border-[var(--border)] focus:outline-none"
                />
              </div>
            </div>

            {/* Profile Info panel */}
            <div className="bg-[var(--bg)] p-2.5 border border-[var(--border)] text-[11px] text-[var(--text)] leading-normal mt-3 flex items-start gap-1.5">
              <span className="text-[var(--accent)] font-extrabold select-none">»</span>
              <span>{getProfileDescription(context)}</span>
            </div>
          </div>
        </div>

        {/* Dual Column workspace: Editor vs Metrics/Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Editor Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-[var(--bg2)] border border-[var(--border)] shadow-[3px_3px_0px_0px_rgba(20,20,20,0.25)] flex flex-col overflow-hidden">
              
              {/* Telemetry metadata bar */}
              <div className="bg-[var(--bg)] border-b border-[var(--border)] px-4 py-2 flex items-center justify-between text-[10px] text-[var(--text)] font-bold uppercase select-none">
                <div className="flex items-center gap-1.5">
                  <Server size={11} />
                  <span>DRAFT ENTRY DECK</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>WORDS: {wordCount}</span>
                </div>
              </div>

              {/* Text editor body */}
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                  }}
                  placeholder="Paste or write your draft here..."
                  className="w-full h-[360px] p-4 text-xs bg-[var(--bg2)] text-[var(--text)] focus:bg-[var(--bg)] focus:outline-none leading-relaxed resize-none transition-colors border-0"
                />

                {text && (
                  <button
                    onClick={() => {
                      setText("");
                      setAuditResult(null);
                      setApiError(null);
                    }}
                    title="Clear editor state"
                    className="absolute bottom-3 right-3 p-1.5 bg-[var(--accent)] hover:opacity-90 border border-strong text-[var(--text)] transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Large Run Diagnostic Button */}
              <div className="border-t border-[var(--border)] p-3 bg-[var(--bg)] select-none">
                <button
                  onClick={handleRunAudit}
                  disabled={isAuditing || !text.trim()}
                  className={`w-full py-3 border border-[var(--border)] text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isAuditing
                      ? "bg-[var(--bg2)] text-[var(--text2)] cursor-not-allowed"
                      : !text.trim()
                      ? "bg-[var(--bg2)] text-[var(--text2)] cursor-not-allowed"
                      : "bg-[var(--accent)]/15 border border-[var(--accent)]/50 text-[var(--accent)] hover:opacity-90 active:translate-y-[1px]"
                  }`}
                >
                  {isAuditing ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>RUNNING TELEMETRY ANALYZER PASS...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={13} className="fill-current" />
                      <span>RUN AUDIT & PURIFY PROSE</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {apiError && (
              <div className="p-4 bg-danger/20 border border-danger/40 text-xs text-danger flex gap-2 rounded-none">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-danger" />
                <div>
                  <strong className="font-extrabold uppercase">Audit execution failure:</strong>{" "}
                  {apiError}
                </div>
              </div>
            )}

          </div>

          {/* Results Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Dynamic telemetric bar card */}
            <MetricCard
              score={auditResult ? auditResult.metrics.humanScore : 100}
              wordCount={wordCount}
              ttr={auditResult ? Number(auditResult.metrics.ttr.toFixed(2)) : 0}
              emDashes={auditResult ? auditResult.metrics.emDashCount : 0}
              hashtags={auditResult ? auditResult.metrics.hashtagCount : 0}
              bulletNounList={auditResult ? auditResult.metrics.bulletNounListFound : false}
              context={context}
            />

            {/* Results output view */}
            {auditResult ? (
              <ResultsViewer
                result={auditResult}
                originalText={text}
                mode={mode}
              />
            ) : (
              <div className="bg-[var(--bg2)] border border-[var(--border)] p-8 text-center min-h-[360px] flex flex-col items-center justify-center select-none shadow-[3px_3px_0px_0px_rgba(20,20,20,0.25)]">
                <div className="h-11 w-11 rounded-none bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-extrabold flex items-center justify-center text-sm mb-3">
                  STBY
                </div>
                <h4 className="italic text-[var(--text)] text-lg mb-1.5">
                  System state: STANDBY // Ready for audit input
                </h4>
                <p className="text-[var(--text2)] text-xs max-w-md mx-auto leading-normal mb-5">
                  Load one of our diagnostic templates or write a custom text block. Click "Run Audit" to analyze stylometrics for machine writing tell-patterns.
                </p>

                {/* Micro Tutorial specs list */}
                <div className="w-full max-w-sm grid grid-cols-2 gap-2.5 text-left border-t border-[var(--border)] pt-4 text-[10px] text-[var(--text2)] uppercase">
                  <div className="flex items-center gap-1">
                    <ChevronRight size={10} className="text-[var(--accent)] font-bold" />
                    <span>TTR STYLOMETRICS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight size={10} className="text-[var(--accent)] font-bold" />
                    <span>EM-DASH RESTRICTIONS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight size={10} className="text-[var(--accent)] font-bold" />
                    <span>VERBLESS BULLET AUDITS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight size={10} className="text-[var(--accent)] font-bold" />
                    <span>109+ VOCAB TIERS</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
    </div>
  );
}
