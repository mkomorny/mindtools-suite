import React, { useState } from 'react';
import { UserState, TONE_OPTIONS } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ToolProps {
  userState: UserState;
  
  
  
  
}

export default function SteelmanMachine({ userState, }: ToolProps) {
  const [opinion, setOpinion] = useState('');
  const [depth, setDepth] = useState('');
  const [tone, setTone] = useState('');
  
  const [isCustomTone, setIsCustomTone] = useState(false);
  const [customToneText, setCustomToneText] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasDailyCapError, setHasDailyCapError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    

    if (!opinion.trim()) {
      setErrorMsg('Please enter your opinion first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult('');
    setHasDailyCapError(false);

    const finalDepth = depth || 'moderate';
    const finalTone = isCustomTone ? customToneText.trim() || 'balanced' : (tone || 'default');

    try {
      const response = await fetch('/api/generate/steelman', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-API-Key': userState.apiKey || '',
          'X-Provider': userState.provider || 'google',
          'X-Selected-Model': userState.model || 'auto',
          'X-User-Uid': userState.email ? (userState as any).uid || '' : '',
          'X-User-Email': userState.email || '',
        },
        body: JSON.stringify({ opinion, depth: finalDepth, tone: finalTone }),
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
      setResult(data.text);
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
      <div className="w-full max-w-[640px] bg-danger/20 border-2 border-danger/40 rounded-2xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl animate-fade-in my-8">
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

  return (
    <div className="flex flex-col items-center w-full animate-fade-in text-[var(--text)]">
      <div className="text-center mb-8 w-full max-w-2xl">
        <span className="text-4xl mb-2.5 block">⚔️</span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase mb-2">Steelman Machine</h1>
        <p className="text-sm text-[var(--text2)] max-w-lg mx-auto leading-relaxed">
          State your opinion. Get the absolute strongest case against your own view — not to defeat you, but to make you think harder.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-7 flex flex-col gap-5 w-full max-w-[640px] shadow-sm">
        <div className="flex flex-col gap-2 w-full">
          <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">Your opinion or belief</label>
          <textarea
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            placeholder="e.g. Remote work is better than office work for most people."
            rows={4}
            className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">How deep should the argument go?</label>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%239090a8' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundSize: '14px'
              }}
            >
              <option value="">--Select--</option>
              <option value="deep">Deep — Philosophical dismantling</option>
              <option value="moderate">Moderate — Substantive challenge</option>
              <option value="surface">Surface — Quick counterpoints</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">Delivery Tone</label>
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text3)] hover:text-[var(--danger)] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
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
            'Generate Steelman Argument'
          )}
        </button>

        {errorMsg && (
          <div className="p-3.5 rounded-lg text-xs bg-[rgba(240,78,110,0.1)] border border-[rgba(240,78,110,0.3)] text-accent2 leading-relaxed">
            {errorMsg}
          </div>
        )}
      </form>

      {result && (
        <div id="steelOutput" className="w-full max-w-[640px] mt-6 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm animate-fade-in-up">
          <div className="px-4 py-3 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-widest text-[var(--accent)] uppercase font-semibold">⚔️ The case against you</span>
            <button
              onClick={handleCopy}
              className="font-mono text-[10px] px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--bg2)] text-[var(--text2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-6">
            <MarkdownRenderer text={result} />
          </div>
        </div>
      )}
    </div>
  );
}
