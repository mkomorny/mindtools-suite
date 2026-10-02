import React, { useState } from 'react';
import { UserState } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ToolProps {
  userState: UserState;
  
  
  
  
}

interface VentStyleConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  sub: string;
}

const VENT_STYLES: VentStyleConfig[] = [
  {
    id: 'supportive',
    name: 'Supportive',
    emoji: '🤗',
    description: 'Supportive & Comforting',
    sub: 'Highly validating, gentle, warm, and comforting. An emotional shoulder to lean on.'
  },
  {
    id: 'listening',
    name: 'Listening',
    emoji: '👂',
    description: 'Listening Ear',
    sub: 'Listens thoroughly, reflects your emotions without adding fuel or just blind agreement.'
  },
  {
    id: 'devil',
    name: "Devil's Advocate",
    emoji: '⚖️',
    description: "Devil's Advocate",
    sub: 'Gently challenges you or asks thoughtful questions to help you see alternative angles.'
  },
  {
    id: 'honest',
    name: 'Honest',
    emoji: '🔍',
    description: 'Honest & Unbiased',
    sub: 'Pure, objective truth. Real feedback, not sugar-coated, focusing on the actual dynamics.'
  },
  {
    id: 'pushback',
    name: 'Active Pushback',
    emoji: '🥊',
    description: 'Active Pushback',
    sub: 'Pushes back on your assumptions, tests your perspective, and actively deconstructs bias.'
  }
];

const LENGTHS = ['short', 'medium', 'detailed'];
const LENGTH_LABELS = ['Short (~100 words)', 'Medium (~200 words)', 'Detailed (~400 words)'];

export default function VentSession({
  userState,
  
}: ToolProps) {
  const [ventText, setVentText] = useState('');
  const [styleIndex, setStyleIndex] = useState(1); // Default to "Listening"
  const [lengthIndex, setLengthIndex] = useState(1); // Default to "Medium"
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [followUpText, setFollowUpText] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [hasDailyCapError, setHasDailyCapError] = useState(false);

  const selectedStyle = VENT_STYLES[styleIndex];

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1800);
    }
  };

  const handleReset = () => {
    setVentText('');
    setFollowUpText('');
    setChatHistory([]);
    setErrorMsg('');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    

    if (!ventText.trim()) {
      setErrorMsg('Please dump your thoughts or text to analyze first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setHasDailyCapError(false);

    try {
      const response = await fetch('/api/generate/vent', {
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
          ventText,
          style: selectedStyle.id,
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
      setChatHistory([
        { role: 'user', content: ventText },
        { role: 'model', content: data.text }
      ]);
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

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    

    if (!followUpText.trim()) {
      return;
    }

    const newUserMsg = { role: 'user' as const, content: followUpText };
    const updatedHistory = [...chatHistory, newUserMsg];
    
    setChatHistory(updatedHistory);
    setFollowUpText('');
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/generate/vent', {
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
          ventText,
          style: selectedStyle.id,
          length: LENGTHS[lengthIndex],
          chatHistory: updatedHistory,
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
      setChatHistory([...updatedHistory, { role: 'model', content: data.text }]);
      } catch (err: any) {
      if (err.message.includes('69696767666') || err.message.includes('696780085')) {
        setHasDailyCapError(true);
        setErrorMsg('Error: 696780085. Please try again later.');
      } else {
        setErrorMsg(err.message || 'Something went wrong. Please try again.');
        setChatHistory(chatHistory);
        setFollowUpText(newUserMsg.content);
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
        <span className="text-4xl mb-2.5 block">💔❓🗑️</span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase mb-1">💔 VENT SESSION</h1>
        <p className="text-sm text-[var(--text2)] max-w-lg mx-auto leading-relaxed">
          Fuming about a friend, family member, or situation and about to send an emotional, bridge-burning text? Dump your raw, angry thoughts here first. Get an unbiased and emotionally intelligent response.
        </p>
      </div>

      {chatHistory.length === 0 ? (
        <form onSubmit={handleGenerate} className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-7 flex flex-col gap-6 w-full max-w-[640px] shadow-sm">
          
          {/* Response settings: calibration & length sliders */}
          <div className="flex flex-col gap-5 p-4 rounded-xl bg-[var(--bg3)] border border-[var(--border)] w-full">
            
            {/* Style Slider */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                  Response Calibration
                </span>
                <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-bg)] px-2.5 py-0.5 rounded border border-[var(--border)] flex items-center gap-1">
                  <span>{selectedStyle.emoji}</span>
                  <span>{selectedStyle.description}</span>
                </span>
              </div>

              <div className="relative pt-2 pb-1 flex flex-col gap-1.5">
                <input
                  type="range"
                  min="0"
                  max={VENT_STYLES.length - 1}
                  value={styleIndex}
                  onChange={(e) => setStyleIndex(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--accent)] bg-[var(--border)] h-2 rounded-lg cursor-pointer transition-all"
                />
                <div className="flex justify-between text-[9px] font-mono text-[var(--text3)] px-1 select-none">
                  {VENT_STYLES.map((style, idx) => (
                    <span
                      key={style.id}
                      onClick={() => setStyleIndex(idx)}
                      className={`cursor-pointer transition-colors text-center ${idx === styleIndex ? 'text-[var(--accent)] font-bold' : 'hover:text-[var(--text2)]'}`}
                      style={{ width: '18%', minWidth: '50px' }}
                    >
                      {style.name}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-[var(--text2)] italic bg-[var(--bg2)] p-2.5 rounded-lg border border-[var(--border)] mt-1">
                {selectedStyle.sub}
              </p>
            </div>

            <hr className="border-[var(--border)]" />

            {/* Response Length Slider */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                  Response Length Limit
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
                  {LENGTH_LABELS.map((label, idx) => (
                    <span
                      key={label}
                      onClick={() => setLengthIndex(idx)}
                      className={`cursor-pointer transition-colors text-center ${idx === lengthIndex ? 'text-[var(--accent2)] font-bold' : 'hover:text-[var(--text2)]'}`}
                      style={{ width: '28%', minWidth: '70px' }}
                    >
                      {LENGTHS[idx].toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Input Textarea */}
          <div className="flex flex-col gap-2 w-full">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              Dump your raw, unfiltered, bridge-burning thoughts:
            </label>
            <textarea
              value={ventText}
              onChange={(e) => setVentText(e.target.value)}
              placeholder="e.g., I'm so sick of Sarah always canceling plans at the very last minute with a dumb excuse! I want to tell her that she's incredibly selfish and that we aren't friends anymore..."
              rows={6}
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
              'Process Vent Session'
            )}
          </button>

          {errorMsg && (
            <div className="p-3.5 rounded-lg text-xs bg-[rgba(240,78,110,0.1)] border border-[rgba(240,78,110,0.3)] text-accent2 leading-relaxed">
              {errorMsg}
            </div>
          )}
        </form>
      ) : (
        /* CONVERSATIONAL THREAD WORKSPACE */
        <div className="w-full max-w-[640px] flex flex-col gap-6">
          
          <div className="flex justify-between items-center bg-[var(--bg2)] border border-[var(--border)] rounded-xl px-5 py-3 shadow-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text2)]">Calibration Mode</span>
              <span className="text-xs font-bold text-[var(--accent)] flex items-center gap-1.5 font-mono">
                {selectedStyle.emoji} {selectedStyle.description} • {LENGTH_LABELS[lengthIndex]}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-mono px-3 py-1.5 rounded-lg border border-[var(--border)] hover:border-danger/40 hover:text-danger transition-all cursor-pointer"
            >
              Reset Session
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border overflow-hidden shadow-sm animate-fade-in-up ${
                  msg.role === 'user'
                    ? 'bg-[var(--bg2)]/50 border-[var(--border)]'
                    : 'bg-[var(--bg2)] border-[var(--accent)]/30 shadow-[0_4px_20px_var(--accent-glow)]/[0.05]'
                }`}
              >
                <div
                  className={`px-4 py-2.5 border-b flex items-center justify-between font-mono text-[10px] font-semibold tracking-wider ${
                    msg.role === 'user'
                      ? 'bg-[var(--bg3)] border-[var(--border)] text-[var(--text2)]'
                      : 'bg-[var(--accent-bg)] border-[var(--accent)]/20 text-[var(--accent)]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {msg.role === 'user' ? '💔 YOUR RAW VENT / MESSAGE' : `💡 COACH RESPONSE (${selectedStyle.name})`}
                  </span>
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg2)] text-[var(--text2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer text-[9px]"
                  >
                    {copiedIndex === idx ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-6">
                  <MarkdownRenderer text={msg.content} />
                </div>
              </div>
            ))}
          </div>

          {/* Follow-up Interactive Form */}
          <form onSubmit={handleFollowUpSubmit} className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col gap-2 w-full">
              <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase flex items-center gap-1">
                <span>💬 Ask about this advice or reply to the coach:</span>
              </label>
              <textarea
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                placeholder="Ask for clarification, request a milder phrasing option, or challenge a point..."
                rows={3}
                className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y min-h-[80px]"
              />
            </div>

            

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <button
                type="submit"
                disabled={loading || !followUpText.trim()}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-all ${
                  loading
                    ? 'bg-[var(--accent)]/30 border border-[var(--accent)]/50 cursor-wait flex items-center justify-center'
                    : 'bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 border border-[var(--accent)]/50 text-[var(--text)] active:translate-y-[1px] shadow-[0_4px_24px_var(--accent-glow)]'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-border/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send Follow-up'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-3 border border-[var(--border)] hover:bg-[var(--bg3)] text-[var(--text2)] hover:text-[var(--text)] rounded-lg text-sm font-semibold transition-all cursor-pointer"
              >
                Reset / Start Fresh
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 text-xs bg-[rgba(240,78,110,0.1)] border border-[rgba(240,78,110,0.3)] text-accent2 leading-relaxed rounded-lg">
                {errorMsg}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
