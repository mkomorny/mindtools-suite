
import React, { useState, useMemo } from "react";
import { AuditResponse, AuditIssue, Mode } from "../types";
import { Check, Copy, Sparkles, AlertCircle, FileText, Compass } from "lucide-react";

interface ResultsViewerProps {
  result: AuditResponse;
  originalText: string;
  mode: Mode;
}

export default function ResultsViewer({ result, originalText, mode }: ResultsViewerProps) {
  const [activeTab, setActiveTab] = useState<"diff" | "issues" | "comparison">(
    mode === "rewrite" ? "diff" : "issues"
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result.rewrittenVersion) return;
    navigator.clipboard.writeText(result.rewrittenVersion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Escape special regex characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Safe Highlight Algorithm inside the original draft:
  // We locate all occurrences of issue quoted texts to render interactive annotated spans
  const annotatedOriginal = useMemo(() => {
    const issues = result.issues || [];
    if (issues.length === 0 || !originalText) {
      return <span className="font-sans text-text leading-normal">{originalText}</span>;
    }

    // Collect all match intervals
    const matches: Array<{ start: number; end: number; issue: AuditIssue }> = [];

    issues.forEach((issue) => {
      const query = issue.quotedText;
      if (!query || query.trim().length === 0) return;

      try {
        const regex = new RegExp(escapeRegExp(query), "gi");
        let regexpMatch;
        while ((regexpMatch = regex.exec(originalText)) !== null) {
          matches.push({
            start: regexpMatch.index,
            end: regexpMatch.index + query.length,
            issue,
          });
          // Avoid infinite loop if regex.lastIndex doesn't advance
          if (regexpMatch.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } catch (e) {
        // Fallback simple search
        let index = originalText.indexOf(query);
        while (index !== -1) {
          matches.push({ start: index, end: index + query.length, issue });
          index = originalText.indexOf(query, index + 1);
        }
      }
    });

    // Sort matches by start position, then by descending length to solve overlap conflicts
    matches.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return (b.end - b.start) - (a.end - a.start);
    });

    // Resolve overlaps: skip any match that starts before the current running index
    const nonOverlapping: typeof matches = [];
    let lastIndex = 0;
    for (const match of matches) {
      if (match.start >= lastIndex) {
        nonOverlapping.push(match);
        lastIndex = match.end;
      }
    }

    // Slice text into React fragments
    const fragments: React.ReactNode[] = [];
    let cursor = 0;

    nonOverlapping.forEach((match, idx) => {
      // Plain text before match
      if (match.start > cursor) {
        fragments.push(
          <span key={`plain-${idx}`} className="text-text whitespace-pre-wrap font-sans">
            {originalText.slice(cursor, match.start)}
          </span>
        );
      }

      // Flagged match spans with specific visual highlights
      const highlightClasses =
        match.issue.severity === "P0"
          ? "bg-danger/20 text-danger border-danger/40 decoration-red-600 decoration-wavy"
          : match.issue.severity === "P1"
          ? "bg-accent2/20 text-accent2 border-accent2/40 decoration-amber-600"
          : "bg-bg3 text-text border-border decoration-text2";

      fragments.push(
        <span
          key={`match-${idx}`}
          className={`relative inline group underline underline-offset-3 font-semibold border-b border-transparent px-0.5 cursor-help transition-all duration-150 ${highlightClasses}`}
        >
          {originalText.slice(match.start, match.end)}

          {/* Interactive Popup Card styled as core console interface overlay */}
          <span className="absolute left-1/2 bottom-full mb-2.5 -translate-x-1/2 w-64 p-3 bg-bg3 text-text rounded-none border-strong shadow-[3px_3px_0px_0px_rgba(20,20,20,0.5)] opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-100 z-30 font-sans text-[11px] leading-relaxed select-none normal-case">
            <span className="flex items-center gap-1.5 font-mono text-[9px] text-accent2 font-bold tracking-wider uppercase mb-1">
              <span>{match.issue.severity} ALERT</span>
              <span className="text-[10px]">•</span>
              <span>{match.issue.category}</span>
            </span>
            <p className="mb-2 font-normal text-text2">{match.issue.reason}</p>
            {match.issue.replacement !== "Delete" && (
              <p className="border-t border-border pt-1.5 text-text2">
                <strong className="text-success font-mono text-[10px]">REPLACEMENT PROSE:</strong>{" "}
                {match.issue.replacement}
              </p>
            )}
            {match.issue.replacement === "Delete" && (
              <p className="border-t border-border pt-1.5 text-danger font-bold font-mono text-[10px]">
                RECOMMENDED: DELETION
              </p>
            )}
          </span>
        </span>
      );

      cursor = match.end;
    });

    if (cursor < originalText.length) {
      fragments.push(
        <span key="plain-final" className="text-text whitespace-pre-wrap font-sans">
          {originalText.slice(cursor)}
        </span>
      );
    }

    return <div className="leading-relaxed font-sans text-text text-xs">{fragments}</div>;
  }, [result.issues, originalText]);

  return (
    <div className="bg-bg2 border-strong rounded-none shadow-[3px_3px_0px_0px_rgba(20,20,20,0.25)] overflow-hidden">
      {/* Selector Deck */}
      <div className="border-b border-strong bg-[#DCDAD7] px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {mode === "rewrite" && (
            <button
              onClick={() => setActiveTab("diff")}
              className={`px-3 py-1.5 rounded-none border border-transparent text-[10px] font-mono font-bold uppercase transition-all ${
                activeTab === "diff"
                  ? "bg-bg3 text-text border-border"
                  : "text-text2 hover:text-text"
              }`}
            >
              Side-By-Side Diff
            </button>
          )}
          <button
            onClick={() => setActiveTab("issues")}
            className={`px-3 py-1.5 rounded-none border border-transparent text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
              activeTab === "issues"
                ? "bg-bg3 text-text border-border"
                : "text-text2 hover:text-text"
            }`}
          >
            Tells Report ({result.issues?.length || 0})
          </button>
          {mode === "rewrite" && (
            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-3 py-1.5 rounded-none border border-transparent text-[10px] font-mono font-bold uppercase transition-all ${
                activeTab === "comparison"
                  ? "bg-bg3 text-text border-border"
                  : "text-text2 hover:text-text"
              }`}
            >
              Original annotated
            </button>
          )}
        </div>

        {/* Action icons - copy final draft */}
        {result.rewrittenVersion && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-strong bg-bg2 hover:bg-bg text-text font-bold text-[10px] font-mono uppercase transition-colors select-none"
          >
            {copied ? (
              <>
                <Check size={11} className="text-success" />
                <span className="text-success">Copied To Clipboard</span>
              </>
            ) : (
              <>
                <FileText size={11} />
                <span>Copy polished prose</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Pane Content modules */}
      <div className="p-4 bg-bg2">
        
        {/* TAB 1: Diff view */}
        {activeTab === "diff" && result.rewrittenVersion && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left Col: Original */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-light">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text2 font-extrabold">
                  ORIGINAL DRAFT (WITH METRIC TELLS)
                </span>
                <span className="text-[9px] font-mono text-text2 italic">Hover items to inspect</span>
              </div>
              <div className="max-h-[380px] overflow-y-auto pr-1">
                {annotatedOriginal}
              </div>
            </div>

            {/* Right Col: Polished */}
            <div className="pt-4 md:pt-0 md:pl-4 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-light">
                <span className="text-[10px] font-mono uppercase tracking-wider text-success flex items-center gap-1 font-extrabold">
                  <Sparkles size={11} />
                  POLISHED PROSE (HUMANIZED)
                </span>
                <span className="text-[8px] text-success bg-success/10 px-1 py-0.5 border border-success/30 rounded-none font-mono font-extrabold">
                  SECURE PASS
                </span>
              </div>
              <div className="max-h-[380px] overflow-y-auto leading-normal text-text text-xs whitespace-pre-wrap font-sans select-text">
                {result.rewrittenVersion}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Full structured report issues */}
        {activeTab === "issues" && (
          <div className="space-y-4">
            {/* Meta Report assessment card */}
            <div className="p-4 bg-amber-500/5 border border-strong rounded-none space-y-1">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-accent2 font-extrabold flex items-center gap-1">
                <AlertCircle size={12} />
                OVERALL DIAGNOSTIC EVALUATION
              </h4>
              <p className="text-text text-[11px] leading-relaxed font-sans whitespace-pre-line">
                {result.overallAssessment}
              </p>
            </div>

            {/* Issues grouped list */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-text font-bold pb-1.5 border-b border-strong">
                DETAILED VIOLATIONS DICTIONARY
              </h4>

              {result.issues && result.issues.length === 0 ? (
                <div className="text-center py-6 text-text2 font-mono text-[11px] bg-bg border border-dashed border-border">
                  ⚡ Pristine text draft. Zero critical structural tells identified.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {result.issues?.map((issue, idx) => {
                    const sevBadge =
                      issue.severity === "P0"
                        ? "bg-danger/20 text-danger border-danger/40"
                        : issue.severity === "P1"
                        ? "bg-accent2/20 text-accent2 border-accent2/40"
                        : "bg-bg2 text-text2 border-border";

                    return (
                      <div
                        key={idx}
                        className="p-3 border-strong rounded-none bg-bg2 flex flex-col sm:flex-row gap-3 justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-text text-[11px] font-mono bg-bg2 px-1.5 py-0.5 border border-strong">
                              &ldquo;{issue.quotedText}&rdquo;
                            </span>
                            <span className="text-text3 text-xs font-mono">→</span>
                            <span className="text-text2 text-[9px] uppercase font-mono font-extrabold">
                              {issue.category}
                            </span>
                          </div>
                          <p className="text-text2 text-[11px] leading-relaxed font-sans">
                            {issue.reason}
                          </p>
                          {issue.replacement !== "Delete" && (
                            <div className="text-[10px] border-l-2 border-success pl-2 mt-1">
                              <span className="text-success font-extrabold font-mono text-[9px]">HUMAN SPECIFICATION:</span>{" "}
                              <span className="italic text-text font-medium">&ldquo;{issue.replacement}&rdquo;</span>
                            </div>
                          )}
                          {issue.replacement === "Delete" && (
                            <div className="text-[9px] border-l-2 border-danger pl-2 mt-1 font-mono text-danger font-extrabold">
                              ANALYSIS: ELIMINATE FROM TEXT FRAME
                            </div>
                          )}
                        </div>

                        <div className="self-end sm:self-auto shrink-0">
                          <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 border ${sevBadge}`}>
                            {issue.severity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Architectural Changes Diff Log && Second Pass */}
            {mode === "rewrite" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-strong">
                {/* Clean logic outline */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-text2 font-extrabold">
                    ARCHITECTURAL AMENDMENTS
                  </h4>
                  <p className="text-[11px] text-text2 leading-relaxed bg-bg2 p-3 border-light rounded-none whitespace-pre-line font-sans">
                    {result.whatChanged}
                  </p>
                </div>

                {/* Double check comments */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-text2 font-extrabold">
                    SECONDPASS REVIEW NOTES
                  </h4>
                  <div className="bg-bg2 p-3 border-light rounded-none space-y-1">
                    {result.secondPassComments?.length === 0 ? (
                      <p className="text-[10px] text-text2 italic font-mono">No remaining residues flagged in revision pass.</p>
                    ) : (
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-text">
                        {result.secondPassComments?.map((comment, i) => (
                          <li key={i} className="font-sans leading-relaxed">{comment}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Annotated original interactive viewer */}
        {activeTab === "comparison" && mode === "rewrite" && (
          <div className="space-y-3">
            <div className="pb-1 border-b border-strong flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text font-bold">
                ANNOTATED DRAFT INSPECTION DECK
              </span>
              <span className="text-[9px] text-text2 italic">Hover underlined sections to audit patterns</span>
            </div>
            <div className="p-4 border-strong rounded-none leading-normal max-h-[380px] overflow-y-auto">
              {annotatedOriginal}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
