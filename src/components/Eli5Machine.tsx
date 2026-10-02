import React, { useState } from 'react';
import { UserState } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ToolProps {
  userState: UserState;
  
  
  
  
}

const AGE_LEVELS = ['2-3', '5', '8', '13', '18', '24', '32', '40', '50', '65', '80+', 'Dementia'];

export default function Eli5Machine({
  userState,
  
}: ToolProps) {
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState('');
  const [ageIndex, setAgeIndex] = useState(1); // Default to index 1 which is "5" years old

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
    

    if (!topic.trim()) {
      setErrorMsg('Please enter a topic or text to simplify first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult('');
    setHasDailyCapError(false);

    try {
      const response = await fetch('/api/generate/eli5', {
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
          topic,
          length: length || 'medium',
          ageLevel: AGE_LEVELS[ageIndex],
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
          A database synchronization timeout occurred. This safeguard blocks further generation cycles to avoid structural overflow inside your premium portal.
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
        <span className="text-4xl mb-2.5 block">🦖</span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase mb-1">🦖 ELI5 MACHINE</h1>
        <p className="text-xs font-mono text-[var(--text2)] uppercase tracking-wider mb-2">
          (Explain Like I'm Five)
        </p>
        <p className="text-sm text-[var(--text2)] max-w-lg mx-auto leading-relaxed">
          Stumbled onto a dense scientific theory, complex financial news, or historical conflict? Paste it here. Get a beautifully simple explanation.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-7 flex flex-col gap-5 w-full max-w-[640px] shadow-sm">
        
        {/* Global Suite Settings (Top-Row Bar) */}
        <div className="flex flex-col sm:flex-row gap-5 p-4 rounded-xl bg-[var(--bg3)] border border-[var(--border)] w-full items-stretch sm:items-center justify-between">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              Length of Breakdown
            </label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%239090a8' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundSize: '14px'
              }}
            >
              <option value="">--Select--</option>
              <option value="detailed">Detailed</option>
              <option value="medium">Medium</option>
              <option value="short">Short</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-[2] min-w-[200px]">
            <div className="flex justify-between items-center">
              <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                Target Age Level
              </label>
              <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-bg)] px-2.5 py-0.5 rounded border border-[var(--border)] font-mono">
                {AGE_LEVELS[ageIndex]} years old
              </span>
            </div>
            <div className="relative pt-1 flex flex-col gap-1">
              <input
                type="range"
                min="0"
                max={AGE_LEVELS.length - 1}
                value={ageIndex}
                onChange={(e) => setAgeIndex(parseInt(e.target.value, 10))}
                className="w-full accent-[var(--accent)] bg-[var(--border)] h-2 rounded-lg cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[8px] font-mono text-[var(--text3)] px-1 select-none">
                {AGE_LEVELS.map((label, idx) => {
                  const isKeyLabel = idx === 0 || idx === 3 || idx === 6 || idx === 9 || idx === AGE_LEVELS.length - 1;
                  return (
                    <span
                      key={label}
                      onClick={() => setAgeIndex(idx)}
                      className={`cursor-pointer transition-colors ${idx === ageIndex ? 'text-[var(--accent)] font-bold' : 'hover:text-[var(--text2)]'} ${isKeyLabel ? 'block' : 'hidden sm:block'}`}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Input Textarea */}
        <div className="flex flex-col gap-2 w-full">
          <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
            Paste the complicated topic or text you want simplified:
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., How does the stock market work? / Paste a confusing scientific article snippet..."
            rows={5}
            className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y min-h-[120px]"
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
            'Simplify Topic'
          )}
        </button>

        {errorMsg && (
          <div className="p-3.5 rounded-lg text-xs bg-[rgba(240,78,110,0.1)] border border-[rgba(240,78,110,0.3)] text-accent2 leading-relaxed">
            {errorMsg}
          </div>
        )}
      </form>

      {result && (
        <div id="eli5Output" className="w-full max-w-[640px] mt-6 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm animate-fade-in-up">
          <div className="px-4 py-3 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between animate-fade-in">
            <span className="font-mono text-[10px] tracking-widest text-[var(--accent)] uppercase font-semibold flex items-center gap-1.5">
              🦖 Simplified Breakdown ({AGE_LEVELS[ageIndex]} yrs old)
            </span>
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
