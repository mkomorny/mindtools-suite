import React, { useState } from 'react';
import { UserState, TONE_OPTIONS } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ToolProps {
  userState: UserState;
  
  
  
  
}

interface AuditorResult {
  objectivityScore: number;
  overallAssessment: string;
  fallacies: {
    name: string;
    description: string;
    severity: 'P0' | 'P1' | 'P2';
    quotedText: string;
    reframedAlternative: string;
  }[];
  improvedDraft?: string;
  coachingSummary?: string;
}

export default function CognitiveBiasAuditor({
  userState,
  
}: ToolProps) {
  const [textToAudit, setTextToAudit] = useState('');
  const [auditMode, setAuditMode] = useState('clinical'); // clinical, socratic, constructive
  const [rigorIndex, setRigorIndex] = useState(1); // Standard, Comprehensive, Philosophical
  const [tone, setTone] = useState('');
  const [isCustomTone, setIsCustomTone] = useState(false);
  const [customToneText, setCustomToneText] = useState('');

  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditorResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [hasDailyCapError, setHasDailyCapError] = useState(false);

  const RIGORS = ['standard', 'comprehensive', 'philosophical'];
  const RIGOR_LABELS = [
    'Standard (Checks for common high-impact fallacies)',
    'Comprehensive (In-depth cognitive & behavioral bias check)',
    'Philosophical (Academic level scrutiny, deconstructs implicit axioms)'
  ];

  const handleCopyDraft = async () => {
    if (!auditResult?.improvedDraft) return;
    try {
      await navigator.clipboard.writeText(auditResult.improvedDraft);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 1800);
    } catch {
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 1800);
    }
  };

  const handleReset = () => {
    setTextToAudit('');
    setAuditMode('clinical');
    setRigorIndex(1);
    setTone('default');
    setIsCustomTone(false);
    setCustomToneText('');
    setAuditResult(null);
    setErrorMsg('');
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault()
    

    if (!textToAudit.trim()) {
      setErrorMsg('Please write or paste your text to audit.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setAuditResult(null);
    setHasDailyCapError(false);

    const finalTone = isCustomTone ? customToneText.trim() || 'balanced' : (tone || 'default');

    try {
      const response = await fetch('/api/generate/bias-auditor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-API-Key': userState.apiKey || '',
          'X-Provider': userState.provider || 'google',
          'X-Selected-Model': userState.model || 'auto',
          'X-User-Uid': userState.email ? (userState as any).uid || '' : '',
          'X-User-Email': userState.email || '',
        },
        body: JSON.stringify({
          text: textToAudit,
          mode: auditMode,
          rigor: RIGORS[rigorIndex],
          tone: finalTone,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setHasDailyCapError(true);
          throw new Error('Error: 696780085. Please try again later.');
        }
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error || `Server responded with status ${response.status}`;
        if (errMsg.includes('69696767666') || errMsg.includes('696780085')) {
          setHasDailyCapError(true);
        }
        throw new Error(errMsg);
      }

      const data = await response.json()
      setAuditResult(data.audit);
      } catch (err: any) {
      if (err.message.includes('69696767666') || err.message.includes('696780085')) {
        setHasDailyCapError(true);
        setErrorMsg('Error: 696780085. Please try again later.');
      } else {
        setErrorMsg(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (hasDailyCapError) {
    return (
      <div className="w-full max-w-[640px] bg-danger/20 border-2 border-danger/40 rounded-2xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl animate-fade-in my-8 mx-auto">
        <span className="text-5xl animate-bounce">⚠️</span>
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-2xl tracking-wider text-danger uppercase font-black">
            CRITICAL SYSTEM ANOMALY DETECTED
          </h2>
          <p className="font-mono text-xs text-danger font-bold">
            Error Code: 696780085
          </p>
        </div>
        <p className="text-sm text-[var(--text2)] leading-relaxed max-w-md">
          A persistent database synchronization timeout has interrupted your secure generation buffer. This safety safeguard prevents structural overflow inside your premium tier portal.
        </p>
        <p className="text-xs text-[var(--text3)] italic">
          The system is currently busy. Please try again later.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
          <button
            
            className="px-6 py-3 bg-danger hover:bg-danger text-[var(--text)] rounded-xl text-sm font-bold shadow-[0_4px_20px_rgba(239,68,68,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // Determine score colors
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success border-success/30 bg-success/20';
    if (score >= 50) return 'text-accent2 border-accent2/40 bg-accent2/20';
    return 'text-danger border-danger/30 bg-danger/20';
  };

  return (
    <div className="flex flex-col items-center w-full animate-fade-in text-[var(--text)]">
      <div className="text-center mb-8 w-full max-w-2xl">
        <span className="text-4xl mb-2.5 block">🧠🔍</span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase mb-1">COGNITIVE BIAS AUDITOR</h1>
        <p className="text-xs font-mono text-[var(--text2)] uppercase tracking-wider mb-2">
          (Rational Companion to the Steelman Machine)
        </p>
        <p className="text-sm text-[var(--text2)] max-w-lg mx-auto leading-relaxed">
          Audit your own arguments, emails, and opinion drafts. Highlight unseen perspectives, logical traps, fallacies, and framing biases before presenting them to the world.
        </p>
      </div>

      {!auditResult ? (
        <form onSubmit={handleAudit} className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-7 flex flex-col gap-6 w-full max-w-[640px] shadow-sm">
          
          <div className="flex flex-col gap-5 p-4 rounded-xl bg-[var(--bg3)] border border-[var(--border)] w-full">
            
            {/* Rigor slider */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                  Auditor Diagnostic rigor
                </span>
                <span className="text-xs font-bold text-[var(--accent2)] bg-[rgba(168,85,247,0.1)] px-2.5 py-0.5 rounded border border-[var(--border)] font-mono">
                  {RIGORS[rigorIndex].toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text3)] leading-snug">
                {RIGOR_LABELS[rigorIndex]}
              </p>

              <div className="relative pt-2 pb-1 flex flex-col gap-1.5">
                <input
                  type="range"
                  min="0"
                  max={2}
                  value={rigorIndex}
                  onChange={(e) => setRigorIndex(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--accent2)] bg-[var(--border)] h-2 rounded-lg cursor-pointer transition-all"
                />
                <div className="flex justify-between text-[9px] font-mono text-[var(--text3)] px-1 select-none">
                  {RIGORS.map((label, idx) => (
                    <span
                      key={label}
                      onClick={() => setRigorIndex(idx)}
                      className={`cursor-pointer transition-colors text-center ${idx === rigorIndex ? 'text-[var(--accent2)] font-bold' : 'hover:text-[var(--text2)]'}`}
                      style={{ width: '30%' }}
                    >
                      {label.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-[var(--border)]" />

            {/* Mode Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                Socratic Persona / Audit Output Vibe
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'clinical', label: 'Clinical Critique', icon: '🩺', desc: 'Direct, structured logic diagnosis' },
                  { id: 'socratic', label: 'Socratic Guide', icon: '🦉', desc: 'Probing intellectual questions' },
                  { id: 'constructive', label: 'Polished Fixer', icon: '🛠️', desc: 'Active reframing & editing focus' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setAuditMode(mode.id)}
                    className={`flex flex-col items-center justify-between p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      auditMode === mode.id
                        ? 'border-[var(--accent)] bg-[var(--accent)]/[0.05] text-[var(--text)] font-semibold shadow-[0_0_12px_var(--accent-glow)]'
                        : 'border-[var(--border)] bg-[var(--bg2)] text-[var(--text2)] hover:border-border'
                    }`}
                  >
                    <span className="text-xl mb-1">{mode.icon}</span>
                    <span className="text-[11px] font-medium block whitespace-nowrap mb-1">{mode.label}</span>
                    <span className="text-[8px] text-[var(--text3)] leading-tight">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-[var(--border)]" />

            {/* Delivery Tone Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                Delivery Tone
              </label>
              <select
                value={isCustomTone ? 'custom' : tone}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomTone(true);
                  } else {
                    setIsCustomTone(false);
                    setTone(e.target.value);
                  }
                }}
                className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%239090a8' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundSize: '14px'
                }}
              >
                <option value="">--Select--</option>
                {TONE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.emoji} {t.name}
                  </option>
                ))}
                <option value="custom">✨ + Custom...</option>
              </select>

              {isCustomTone && (
                <div className="mt-1.5 relative animate-fade-in">
                  <input
                    type="text"
                    value={customToneText}
                    onChange={(e) => setCustomToneText(e.target.value)}
                    placeholder="e.g. passive-aggressive, extremely technical..."
                    className="bg-[var(--bg3)] border border-[var(--accent)] rounded-lg p-2.5 text-xs text-[var(--text)] focus:outline-none w-full pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomTone(false);
                      setTone('default');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text3)] hover:text-[var(--danger)] cursor-pointer bg-transparent border-none"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Primary text input */}
          <div className="flex flex-col gap-2 w-full">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              The belief you want audited:
            </label>
            <textarea
              value={textToAudit}
              onChange={(e) => setTextToAudit(e.target.value)}
              placeholder="e.g., Remote work is completely superior to in-office work for all industries..."
              rows={6}
              required
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y min-h-[140px]"
            />
          </div>

          

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-all ${
              loading
                ? 'bg-[var(--accent)]/30 border border-[var(--accent)]/50 cursor-wait flex items-center justify-center'
                : 'bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 border border-[var(--accent)]/50 text-[var(--text)] active:translate-y-[1px] shadow-[0_4px_24px_var(--accent-glow)]'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-border/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Audit Arguments for Biases & Fallacies'
            )}
          </button>

          {errorMsg && (
            <div className="p-3.5 rounded-lg text-xs bg-[rgba(240,78,110,0.1)] border border-[rgba(240,78,110,0.3)] text-accent2 leading-relaxed">
              {errorMsg}
            </div>
          )}
        </form>
      ) : (
        /* AUDIT RESULTS VIEW */
        <div className="w-full max-w-[760px] flex flex-col gap-8">
          
          {/* Header Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* objectivity Score Card */}
            <div className={`border-2 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden shadow-sm ${getScoreColor(auditResult.objectivityScore)}`}>
              <span className="font-mono text-[9px] uppercase tracking-wider block opacity-75">
                Argument Objectivity Meter
              </span>
              <span className="text-5xl font-extrabold tracking-tight select-none">
                {auditResult.objectivityScore}<span className="text-lg opacity-60">/100</span>
              </span>
              <div className="w-full bg-bg2/14 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-current h-full rounded-full transition-all duration-1000"
                  style={{ width: `${auditResult.objectivityScore}%` }}
                />
              </div>
              <span className="text-[10px] font-mono uppercase mt-1 select-none">
                {auditResult.objectivityScore >= 80 ? '🔒 Robustly Objective' : auditResult.objectivityScore >= 50 ? '⚠️ Moderate Bias/Fallacies' : '🚨 High fallacious spin'}
              </span>
            </div>

            {/* Quick Assessment summary */}
            <div className="col-span-1 md:col-span-2 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--accent)] block font-bold mb-1.5">
                  🛡️ Diagnostic Assessment
                </span>
                <p className="text-xs text-[var(--text)] leading-relaxed font-medium">
                  {auditResult.overallAssessment}
                </p>
              </div>

              <div className="flex gap-4 border-t border-[var(--border)] pt-3.5 mt-3.5">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text2)]">
                  <span className="text-danger font-bold">●</span> P0: {auditResult.fallacies.filter(f => f.severity === 'P0').length} Critical
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text2)]">
                  <span className="text-accent2 font-bold">●</span> P1: {auditResult.fallacies.filter(f => f.severity === 'P1').length} Substantial
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text2)]">
                  <span className="text-accent2 font-bold">●</span> P2: {auditResult.fallacies.filter(f => f.severity === 'P2').length} Subtle
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-[var(--bg2)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-mono text-[var(--text3)] uppercase">DIAGNOSTIC ARCHIVE</span>
              <span className="text-xs font-semibold">
                Mode: {auditMode.toUpperCase()} | Rigor: {RIGORS[rigorIndex].toUpperCase()} | Tone: {isCustomTone ? customToneText : TONE_OPTIONS.find(t => t.id === tone)?.name || tone}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-mono px-4 py-2 rounded-xl border border-[var(--border)] hover:border-accent/40 hover:text-[var(--accent)] transition-all cursor-pointer bg-transparent"
            >
              Reset for new audit
            </button>
          </div>

          {/* List Of biases detected */}
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-lg tracking-wider text-[var(--text)] uppercase font-semibold flex items-center gap-2">
              📝 LOGICAL COGNITIVE SPECTRUM BREAKDOWN
            </h2>

            {auditResult.fallacies.length === 0 ? (
              <div className="text-center p-12 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl">
                <span className="text-4xl mb-3 block">🏆</span>
                <h3 className="font-bold text-sm text-success">Zero Logical Fallacies Detected!</h3>
                <p className="text-xs text-[var(--text2)] mt-1 max-w-sm mx-auto">
                  Your reasoning exhibits stellar objectivity. No significant systemic bias or standard logical deceptions are found.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {auditResult.fallacies.map((item, idx) => {
                  let badgeColor = 'bg-danger/20 text-danger border-danger/30';
                  let severityName = 'P0: Critical Flaw';
                  if (item.severity === 'P1') {
                    badgeColor = 'bg-accent2/20 text-accent2 border-accent2/40';
                    severityName = 'P1: Substantial Bias';
                  } else if (item.severity === 'P2') {
                    badgeColor = 'bg-accent2/20 text-accent2 border-accent2/20';
                    severityName = 'P2: Subtle Framing Option';
                  }

                  return (
                    <div
                      key={idx}
                      className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:border-[var(--accent)]/30 transition-all"
                    >
                      {/* Card line header */}
                      <div className="px-5 py-3.5 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent2)] border border-[var(--border)] px-2 py-0.5 rounded font-mono font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold tracking-tight text-[var(--text)]">
                            {item.name}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded border-2 ${badgeColor}`}>
                          {severityName}
                        </span>
                      </div>

                      {/* Card Content body */}
                      <div className="p-5 flex flex-col gap-4">
                        {/* Quote highlights */}
                        <div className="bg-[var(--bg3)]/45 border-l-2 border-accent2/40 p-3 rounded-r-lg font-mono text-xs text-[var(--text2)] block">
                          <span className="text-[9px] font-mono tracking-wider text-[var(--text3)] uppercase block mb-1">
                            HIGHLIGHTED QUOTE IN YOUR DRAFT:
                          </span>
                          <span className="italic">"{item.quotedText}"</span>
                        </div>

                        {/* description analysis */}
                        <div>
                          <span className="text-[10px] font-mono tracking-wider text-[var(--accent)] uppercase font-bold block mb-1">
                            DIAGNOSTIC EXPLANATION:
                          </span>
                          <p className="text-xs text-[var(--text2)] leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Reframed option */}
                        <div className="bg-[var(--bg3)] border border-success/20 p-4 rounded-xl flex flex-col gap-1.5">
                          <span className="text-[9px] font-mono tracking-wider text-success uppercase font-bold block">
                            💡 REFRAMED HIGH-INTEGRITY REWRITE:
                          </span>
                          <p className="text-xs text-[var(--text)] leading-relaxed italic">
                            "{item.reframedAlternative}"
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Constructive / Clinical rewritten version */}
          {auditResult.improvedDraft && (
            <div className="bg-[var(--bg2)] border-2 border-success/25 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(16,185,129,0.04)]">
              <div className="px-5 py-4 bg-success/25 border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[9px] tracking-wider text-success uppercase font-bold flex items-center gap-1.5">
                    ✨ OPTIMIZED LOGICALLY-BULLETPROOF DRAFT
                  </span>
                  <span className="text-[10px] text-[var(--text3)]">
                    Unbiased, robustly steelmanned, and highly professional delivery of your core argument.
                  </span>
                </div>
                <button
                  onClick={handleCopyDraft}
                  className="font-mono text-[10px] px-3.5 py-1.5 rounded-xl border-2 border-success/20 text-success hover:bg-success hover:text-[var(--text)] transition-all cursor-pointer bg-transparent"
                >
                  {copiedDraft ? 'Copied' : 'Copy Draft Text'}
                </button>
              </div>

              <div className="p-6 bg-[var(--bg3)]/30 font-sans text-sm leading-relaxed whitespace-pre-wrap text-[var(--text2)] border-b border-[var(--border)]">
                {auditResult.improvedDraft}
              </div>

              {auditResult.coachingSummary && (
                <div className="p-5 bg-[var(--bg2)] border-t border-[var(--border)] flex flex-col gap-1">
                  <span className="font-mono text-[9px] text-[var(--accent)] font-bold uppercase tracking-wider block mb-1">
                    🧠 RATIONAL CO-PILOT ADVICE SUMMARY:
                  </span>
                  <p className="text-xs text-[var(--text2)] leading-relaxed italic">
                    {auditResult.coachingSummary}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
