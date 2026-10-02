import React, { useState } from 'react';
import { UserState, TONE_OPTIONS } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ToolProps {
  userState: UserState;
  
  
  
  
}

export default function ApologyCrafter({ userState, }: ToolProps) {
  const [what, setWhat] = useState('');
  const [who, setWho] = useState('');
  const [tone, setTone] = useState('');
  const [context, setContext] = useState('');
  const [honestAssessment, setHonestAssessment] = useState(false);
  
  const [isCustomWho, setIsCustomWho] = useState(false);
  const [customWhoText, setCustomWhoText] = useState('');
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
    

    if (!what.trim()) {
      setErrorMsg('Please describe what happened.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult('');
    setHasDailyCapError(false);

    const finalWho = isCustomWho ? customWhoText.trim() || 'someone' : (who || 'manager');
    const finalTone = isCustomTone ? customToneText.trim() || 'balanced' : (tone || 'default');

    try {
      const response = await fetch('/api/generate/apology', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-API-Key': userState.apiKey || '',
          'X-Provider': userState.provider || 'google',
          'X-Selected-Model': userState.model || 'auto',
          'X-User-Uid': userState.email ? userState.uid || '' : '',
          'X-User-Email': userState.email || '',
        },
        body: JSON.stringify({
          what,
          who: finalWho,
          context,
          tone: finalTone,
          honestAssessment
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
        <span className="text-4xl mb-2.5 block">🕊️</span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase mb-2">Apology Crafter</h1>
        <p className="text-sm text-[var(--text2)] max-w-lg mx-auto leading-relaxed">
          Describe what you did. Get a genuine apology — not groveling, not hollow. Calibrated to the relationship and preferred tone.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-7 flex flex-col gap-5 w-full max-w-[640px] shadow-sm">
        <div className="flex flex-col gap-2 w-full">
          <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">What did you do?</label>
          <textarea
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="What happened? What role did you play?"
            rows={4}
            className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">Who are you apologizing to?</label>
            <select
              value={isCustomWho ? 'custom' : who}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustomWho(true);
                } else {
                  setIsCustomWho(false);
                  setWho(e.target.value);
                }
              }}
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%239090a8' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundSize: '14px'
              }}
            >
              <option value="">--Select--</option>
              <option value="acquaintance">Acquaintance</option>
              <option value="client">Client or customer</option>
              <option value="friend">Close friend</option>
              <option value="family">Family member</option>
              <option value="manager">Manager / Boss</option>
              <option value="partner">Romantic partner</option>
              <option value="employee">Someone you manage</option>
              <option value="colleague">Work colleague</option>
              <option value="custom">✨ + Custom...</option>
            </select>

            {isCustomWho && (
              <div className="mt-1.5 relative animate-fade-in">
                <input
                  type="text"
                  value={customWhoText}
                  onChange={(e) => setCustomWhoText(e.target.value)}
                  placeholder="e.g. My landlord, physics professor..."
                  className="bg-[var(--bg3)] border border-[var(--accent)] rounded-lg p-2.5 text-xs text-[var(--text)] focus:outline-none w-full pr-8"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomWho(false);
                    setWho('manager');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text3)] hover:text-[var(--danger)] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
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
                  placeholder="e.g. Shakespearean, passive-aggressive..."
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

        <div className="flex flex-col gap-2 w-full">
          <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">Any context that matters? (optional)</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. We've been friends for 10 years. They're going through a hard time. I was under a lot of stress."
            rows={3}
            className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y min-h-[90px]"
          />
        </div>

        {/* ── HONEST ASSESSMENT TOGGLE ── */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-[var(--border)] bg-[var(--bg3)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
              ⚖️ Honest Assessment
            </span>
            <span className="text-[10px] sm:text-[11px] text-[var(--text2)] select-none">
              Analyze if an apology is actually deserved, giving an objective score and reasoning.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHonestAssessment(!honestAssessment)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              honestAssessment ? 'bg-[var(--accent)]' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bg2 shadow ring-0 transition duration-200 ease-in-out ${
                honestAssessment ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
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
            'Craft My Apology'
          )}
        </button>

        {errorMsg && (
          <div className="p-3.5 rounded-lg text-xs bg-[rgba(240,78,110,0.1)] border border-[rgba(240,78,110,0.3)] text-accent2 leading-relaxed">
            {errorMsg}
          </div>
        )}
      </form>

      {result && (
        <div id="apologyOutput" className="w-full max-w-[640px] mt-6 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm animate-fade-in-up">
          <div className="px-4 py-3 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-widest text-[var(--accent)] uppercase font-semibold">🕊️ Your apology</span>
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
