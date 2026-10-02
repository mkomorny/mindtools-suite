import React, { useState } from 'react';
import { UserState, TONE_OPTIONS } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ToolProps {
  userState: UserState;
  
  
  
  
}

export default function CommAssistant({ userState, }: ToolProps) {
  const [what, setWhat] = useState('');
  const [who, setWho] = useState('');
  const [situation, setSituation] = useState('');
  const [tone, setTone] = useState('');
  const [customTone, setCustomTone] = useState('');
  const [length, setLength] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

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
    

    if (!what.trim() || !who.trim()) {
      setErrorMsg('Please fill in the main fields (What and Who).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult('');

    try {
      const response = await fetch('/api/generate/comm-assistant', {
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
          who,
          situation: situation || 'No specific situation provided.',
          tone: tone === 'custom' ? customTone : (tone || 'default'),
          length: length || 'medium'
        }),
      });

      if (!response.ok) {
         if (response.status === 429) {
           setErrorMsg('Generation limit reached.');
           
           throw new Error('LIMIT_REACHED');
         }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json()
      setResult(data.text);
      } catch (err: any) {
      if (err.message !== 'LIMIT_REACHED') {
        setErrorMsg(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full animate-fade-in text-[var(--text)]">
      <div className="text-center mb-8 w-full max-w-2xl">
        <span className="text-4xl mb-2.5 block">💬</span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase mb-2">Communication Assistant</h1>
        <p className="text-sm text-[var(--text2)] max-w-lg mx-auto leading-relaxed">
          Draft clear, effective messages. Tell me what to say, who it's for, and the situation.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-7 flex flex-col gap-5 w-full max-w-[640px] shadow-sm">
        <div className="flex flex-col gap-2 w-full">
          <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">What do you want to say?</label>
          <textarea
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="Key points, request, or message..."
            rows={3}
            className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y min-h-[90px]"
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">Who is this for?</label>
          <input
            type="text"
            value={who}
            onChange={(e) => setWho(e.target.value)}
            placeholder="e.g. My boss, a client, a friend..."
            className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full"
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">What's the situation? <span className="opacity-70 font-normal">(Optional)</span></label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="Background context, constraints, or goals..."
            rows={3}
            className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y min-h-[90px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col gap-2">
                <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">Desired Tone</label>
                <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full cursor-pointer"
                >
                    <option value="">--Select--</option>
                    {TONE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                        {t.emoji} {t.name}
                    </option>
                    ))}
                    <option value="custom">+ Custom</option>
                </select>
                {tone === 'custom' && (
                  <input
                    type="text"
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                    placeholder="Enter custom tone..."
                    className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full mt-1"
                  />
                )}
            </div>
            
            <div className="flex flex-col gap-2">
                <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">Length</label>
                <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full cursor-pointer"
                >
                    <option value="">--Select--</option>
                    <option value="medium">Balanced</option>
                    <option value="long">Detailed & Thorough</option>
                    <option value="short">Short & Concise</option>
                </select>
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
            'Draft Message'
          )}
        </button>

        {errorMsg && (
          <div className="p-3.5 rounded-lg text-xs bg-[rgba(240,78,110,0.1)] border border-[rgba(240,78,110,0.3)] text-accent2 leading-relaxed">
            {errorMsg}
          </div>
        )}
      </form>

      {result && (
        <div className="w-full max-w-[640px] mt-6 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm animate-fade-in-up">
          <div className="px-4 py-3 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-widest text-[var(--accent)] uppercase font-semibold">💬 Your Draft</span>
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
