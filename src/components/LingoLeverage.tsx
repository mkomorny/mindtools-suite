import React, { useState } from 'react';
import { UserState } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ToolProps {
  userState: UserState;
  
  
  
  
}

interface FamiliarityOption {
  id: string;
  name: string;
  emoji: string;
  label: string;
  description: string;
}

const FAMILIARITY_OPTIONS: FamiliarityOption[] = [
  {
    id: 'rookie',
    name: 'Absolute Rookie',
    emoji: '👶',
    label: '👶 Absolute Rookie',
    description: 'Zero background knowledge. Explain from scratch with simple words and high-level clarity.'
  },
  {
    id: 'enthusiast',
    name: 'Enthusiast',
    emoji: '🌱',
    label: '🌱 Enthusiast',
    description: 'Know basic words already, but want depth, inside theories, and intermediate terms.'
  },
  {
    id: 'switcher',
    name: 'Career Switcher',
    emoji: '💼',
    label: '💼 Career Switcher',
    description: 'Need industry professional slang, corporate acronyms, and practical boardroom talk.'
  }
];

const LENGTHS = ['short', 'medium', 'detailed'];
const LENGTH_LABELS = [
  'Short (The bare minimum)',
  'Medium (Fundamental concepts)',
  'Detailed (Comprehensive breakdown)'
];

export default function LingoLeverage({
  userState,
  
}: ToolProps) {
  const [topic, setTopic] = useState('');
  const [famIndex, setFamIndex] = useState(0); // Default to "Absolute Rookie"
  const [lengthIndex, setLengthIndex] = useState(1); // Default to "Medium"

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasDailyCapError, setHasDailyCapError] = useState(false);

  const selectedFam = FAMILIARITY_OPTIONS[famIndex];

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
      setErrorMsg('Please specify a topic, industry, or discipline first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult('');
    setHasDailyCapError(false);

    try {
      const response = await fetch('/api/generate/lingo', {
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
          familiarity: selectedFam.id,
          length: LENGTHS[lengthIndex],
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
        <span className="text-4xl mb-2.5 block">🗂️</span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase mb-1">🗂️ LINGO LEVERAGE</h1>
        <p className="text-xs font-mono text-[var(--text2)] uppercase tracking-wider mb-2">
          (The Instant Cheat Sheet)
        </p>
        <p className="text-sm text-[var(--text2)] max-w-lg mx-auto leading-relaxed">
          Diving into a brand new hobby, complex discipline, or industry vertical? Input the topic. Get a master cheat sheet of the absolute must-know terminology, concepts, and inside slang so you can jump in on conversations with the seasoned veterans on day one.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-7 flex flex-col gap-6 w-full max-w-[640px] shadow-sm">
        
        {/* Sliders Configuration Block */}
        <div className="flex flex-col gap-5 p-4 rounded-xl bg-[var(--bg3)] border border-[var(--border)] w-full">
          
          {/* Starting Familiarity Level Slider */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                What is your current starting point?
              </span>
              <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-bg)] px-2.5 py-0.5 rounded border border-[var(--border)] flex items-center gap-1.5 font-sans">
                {selectedFam.label}
              </span>
            </div>

            <div className="relative pt-2 pb-1 flex flex-col gap-1.5">
              <input
                type="range"
                min="0"
                max={FAMILIARITY_OPTIONS.length - 1}
                value={famIndex}
                onChange={(e) => setFamIndex(parseInt(e.target.value, 10))}
                className="w-full accent-[var(--accent)] bg-[var(--border)] h-2 rounded-lg cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[9px] font-mono text-[var(--text3)] px-1 select-none">
                {FAMILIARITY_OPTIONS.map((opt, idx) => (
                  <span
                    key={opt.id}
                    onClick={() => setFamIndex(idx)}
                    className={`cursor-pointer transition-colors text-center ${idx === famIndex ? 'text-[var(--accent)] font-bold' : 'hover:text-[var(--text2)]'}`}
                    style={{ width: '30%', minWidth: '60px' }}
                  >
                    {opt.name}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-[var(--text2)] italic bg-[var(--bg2)] p-2.5 rounded-lg border border-[var(--border)] mt-1">
              {selectedFam.description}
            </p>
          </div>

          <hr className="border-[var(--border)]" />

          {/* Cheat Sheet Scale / Length Slider */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                Cheat Sheet Scale / Length
              </span>
              <span className="text-xs font-bold text-[var(--accent2)] bg-[rgba(168,85,247,0.1)] px-2.5 py-0.5 rounded border border-[var(--border)] font-mono">
                {LENGTH_LABELS[lengthIndex]}
              </span>
            </div>

            <div className="relative pt-2 pb-1 flex flex-col gap-1.5">
              <input
                type="range"
                min="0"
                max={LENGTHS.length - 1}
                value={lengthIndex}
                onChange={(e) => setLengthIndex(parseInt(e.target.value, 10))}
                className="w-full accent-[var(--accent2)] bg-[var(--border)] h-2 rounded-lg cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[9px] font-mono text-[var(--text3)] px-1 select-none">
                {LENGTHS.map((label, idx) => (
                  <span
                    key={label}
                    onClick={() => setLengthIndex(idx)}
                    className={`cursor-pointer transition-colors text-center ${idx === lengthIndex ? 'text-[var(--accent2)] font-bold' : 'hover:text-[var(--text2)]'}`}
                    style={{ width: '28%', minWidth: '70px' }}
                  >
                    {label.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Primary Input Textarea */}
        <div className="flex flex-col gap-2 w-full">
          <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
            What topic, industry, or discipline do you need to master?
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Real estate wholesaling, Coffee roasting, Mechanical keyboards, Prompt engineering..."
            className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full"
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
            'Generate Cheat Sheet'
          )}
        </button>

        {errorMsg && (
          <div className="p-3.5 rounded-lg text-xs bg-[rgba(240,78,110,0.1)] border border-[rgba(240,78,110,0.3)] text-accent2 leading-relaxed">
            {errorMsg}
          </div>
        )}
      </form>

      {result && (
        <div id="lingoOutput" className="w-full max-w-[640px] mt-6 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm animate-fade-in-up">
          <div className="px-4 py-3 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between animate-fade-in">
            <span className="font-mono text-[10px] tracking-widest text-[var(--accent)] uppercase font-semibold flex items-center gap-1.5">
              📙 Terminology Cheat Sheet: {topic}
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
