import React, { useState } from 'react';
import { UserState } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ToolProps {
  userState: UserState;
  
  
  
  
}

interface ToneOption {
  id: string;
  name: string;
  emoji: string;
}

const TONE_OPTIONS: ToneOption[] = [
  { id: 'defensive', name: '🛑 Defensive / Angry', emoji: '🛑' },
  { id: 'hurt', name: '😢 Hurt / Emotional', emoji: '😢' },
  { id: 'cold', name: '🧊 Cold / Dismissive', emoji: '🧊' },
  { id: 'cooperative', name: '🤝 Open / Collaborative', emoji: '🤝' },
  { id: 'passive-aggressive', name: '🙃 Passive-Aggressive', emoji: '🙃' },
  { id: 'custom', name: '✨ Custom Reaction / Tone', emoji: '✨' },
];

const LENGTHS = ['short', 'medium', 'detailed'];
const LENGTH_LABELS = [
  'Short (Quick text exchange)',
  'Medium (Standard chat/email thread)',
  'Detailed (Multi-turn deep discussion map)'
];

export default function ConversationSimulator({
  userState,
  
}: ToolProps) {
  const [situation, setSituation] = useState('');
  const [openingLine, setOpeningLine] = useState('');
  const [toneId, setToneId] = useState('');
  const [customTone, setCustomTone] = useState('');
  const [lengthIndex, setLengthIndex] = useState(1); // Default to Medium

  const [loading, setLoading] = useState(false);
  const [simulationMap, setSimulationMap] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasDailyCapError, setHasDailyCapError] = useState(false);

  // Active chat session state for live interactive sandbox practice
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; content: string; coachNotes?: string }[]>([]);
  const [userReply, setUserReply] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(simulationMap);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleReset = () => {
    setSituation('');
    setOpeningLine('');
    setToneId('defensive');
    setCustomTone('');
    setSimulationMap('');
    setChatHistory([]);
    setUserReply('');
    setErrorMsg('');
  };

  const handleGenerateSimulation = async (e: React.FormEvent) => {
    e.preventDefault()
    

    if (!situation.trim()) {
      setErrorMsg('Please describe the situation first.');
      return;
    }

    if (toneId === 'custom' && !customTone.trim()) {
      setErrorMsg('Please specify the custom expected tone or personality trait.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSimulationMap('');
    setChatHistory([]);
    setHasDailyCapError(false);

    try {
      const response = await fetch('/api/generate/simulate', {
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
          situation,
          openingLine,
          tone: toneId === 'custom' ? customTone : (toneId || 'defensive'),
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
      setSimulationMap(data.simulation);
      
      // Auto-populate chat history to spark the live roleplay
      if (data.initialInteractiveGreeting) {
        setChatHistory([
          {
            role: 'model',
            content: data.initialInteractiveGreeting,
            coachNotes: data.initialCoachTips || 'Start typing below to practice responding in real-time!'
          }
        ]);
      }
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

  const handleSendChatReply = async (e: React.FormEvent) => {
    e.preventDefault()
    

    if (!userReply.trim() || chatLoading) {
      return;
    }

    const currentReply = userReply;
    const nextHistory = [...chatHistory, { role: 'user' as const, content: currentReply }];
    setChatHistory(nextHistory);
    setUserReply('');
    setChatLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/generate/simulate/reply', {
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
          situation,
          tone: toneId === 'custom' ? customTone : (toneId || 'defensive'),
          length: LENGTHS[lengthIndex],
          chatHistory: nextHistory,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setHasDailyCapError(true);
          throw new Error('Error: 696780085. Please try again later.');
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json()
      setChatHistory([
        ...nextHistory,
        {
          role: 'model',
          content: data.replyText,
          coachNotes: data.coachNotes,
        }
      ]);
      } catch (err: any) {
      if (err.message === 'LIMIT_REACHED') {
        setErrorMsg("");
        } else {
        setErrorMsg(err.message || 'Error occurred while processing dialogue counter response.');
        // Rollback user input textarea on fail
        setUserReply(currentReply);
      }
    } finally {
      setChatLoading(false);
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
        <span className="text-4xl mb-2.5 block">💬📱📧📞</span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase mb-1">CONVERSATION SIMULATOR</h1>
        <p className="text-xs font-mono text-[var(--text2)] uppercase tracking-wider mb-2">
          (Interactive Dialogue Sandbox)
        </p>
        <p className="text-sm text-[var(--text2)] max-w-lg mx-auto leading-relaxed">
          Nervous about a tough talk, an important email thread, or want to map out a high-stakes phone call? Input the situation and simulate potential paths. Practice your lines and prepare for any response before it happens.
        </p>
      </div>

      {!simulationMap ? (
        <form onSubmit={handleGenerateSimulation} className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-7 flex flex-col gap-6 w-full max-w-[640px] shadow-sm">
          
          {/* Header Controls Block */}
          <div className="flex flex-col gap-5 p-4 rounded-xl bg-[var(--bg3)] border border-[var(--border)] w-full">
            
            {/* Length Selector aligned high for cohesive modifier integration */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                  Sandbox Practice Exchange Length
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

            <hr className="border-[var(--border)]" />

            {/* Expected Counter-Tone Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                How do you think they will react? Choose their expected response tone:
              </label>
              <select
                value={toneId}
                onChange={(e) => setToneId(e.target.value)}
                className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
              >
                <option value="">--Select--</option>
                {TONE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>

              {/* Dynamic manual custom text box */}
              {toneId === 'custom' && (
                <div className="mt-2.5 animate-slide-down">
                  <label className="font-mono text-[9px] tracking-wider text-[var(--accent)] uppercase font-bold mb-1 block">
                    Describe their expected reaction / traits:
                  </label>
                  <input
                    type="text"
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                    placeholder="e.g., Extremely defensive about finances but softens with apologies..."
                    className="bg-[var(--bg3)] border border-[var(--accent)]/40 rounded-lg p-2.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full placeholder-gray-500"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Primary Input Textarea */}
          <div className="flex flex-col gap-2 w-full">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              What is the situation and what do you want to achieve? (Required):
            </label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="e.g., Asking my roommate to move out, drafting a tough email to a client, prepping for an awkward phone call with family, or bringing up an unfulfilled promise..."
              rows={4}
              required
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y min-h-[100px]"
            />
          </div>

          {/* Opening Line Textarea */}
          <div className="flex flex-col gap-2 w-full">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              Your opening line (how do you want to start the conversation?) (Optional):
            </label>
            <textarea
              value={openingLine}
              onChange={(e) => setOpeningLine(e.target.value)}
              placeholder="Type the exact words you plan on texting, speaking, or emailing first, or leave blank to let the AI draft a starting point for you..."
              rows={3}
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y min-h-[80px]"
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
              'Run Conversation Simulation'
            )}
          </button>

          {errorMsg && (
            <div className="p-3.5 rounded-lg text-xs bg-[rgba(240,78,110,0.1)] border border-[rgba(240,78,110,0.3)] text-accent2 leading-relaxed">
              {errorMsg}
            </div>
          )}
        </form>
      ) : (
        /* SIMULATION WORKSPACE VIEW */
        <div className="w-full max-w-[700px] flex flex-col gap-8">
          
          {/* Header State Summary bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-5 gap-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text2)]">Dialogue Calibration</span>
              <span className="text-sm font-bold text-[var(--accent)] flex flex-wrap items-center gap-2">
                <span>{TONE_OPTIONS.find(t => t.id === (toneId || 'defensive'))?.emoji || '✨'}</span>
                <span>Tone: {toneId === 'custom' ? `Custom (${customTone})` : TONE_OPTIONS.find(t => t.id === (toneId || 'defensive'))?.name}</span>
                <span className="text-xs font-normal text-[var(--text3)]">• {LENGTH_LABELS[lengthIndex]}</span>
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-mono px-4 py-2 rounded-xl bg-transparent border border-[var(--border)] hover:border-danger/40 hover:text-danger transition-all cursor-pointer self-stretch sm:self-auto text-center"
            >
              Reset / Fresh Sandbox
            </button>
          </div>

          {/* Tab Selection or Layout: Show Simulation Flow Chart & Interactive Practice */}
          <div className="flex flex-col gap-6">
            
            {/* Section 1: Simulated Pathway Map */}
            <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between">
                <span className="font-mono text-xs tracking-wider text-[var(--accent)] uppercase font-semibold flex items-center gap-2">
                  🗺️ SIMULATED RESPONSE EXCHANGE PATHS
                </span>
                <button
                  onClick={handleCopy}
                  className="font-mono text-[9px] px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--bg2)] text-[var(--text2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy Pathway Map'}
                </button>
              </div>
              <div className="p-6">
                <MarkdownRenderer text={simulationMap} />
              </div>
            </div>

            {/* Section 2: Dialogue Simulator Arena (Chat Game Mode) */}
            {chatHistory.length > 0 && (
              <div className="bg-[var(--bg2)] border border-[var(--accent)]/20 rounded-2xl overflow-hidden shadow-[0_8px_30px_var(--accent-glow)]/[0.03]">
                <div className="px-5 py-3.5 bg-[var(--accent-bg)] border-b border-[var(--accent)]/20 flex flex-col gap-1">
                  <span className="font-mono text-xs tracking-wider text-[var(--accent)] uppercase font-bold flex items-center gap-2">
                    🎮 INTERACTIVE DIALOGUE PRACTICE ARENA
                  </span>
                  <span className="text-[10px] text-[var(--text2)] leading-relaxed">
                    Test your real response strategies. Type your reply below and practice coping with their reaction.
                  </span>
                </div>

                {/* Dialog thread */}
                <div className="p-5 flex flex-col gap-5 max-h-[450px] overflow-y-auto bg-[var(--bg3)]/50">
                  {chatHistory.map((item, index) => (
                    <div key={index} className="flex flex-col gap-2.5">
                      {item.role === 'user' ? (
                        /* User statement */
                        <div className="flex flex-col items-end self-end max-w-[85%]">
                          <span className="text-[9px] font-mono text-[var(--text3)] uppercase mr-1">YOU (PRACTICING)</span>
                          <div className="bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--text)] text-sm px-4 py-3 rounded-2xl rounded-tr-none shadow-sm font-sans font-medium whitespace-pre-wrap">
                            {item.content}
                          </div>
                        </div>
                      ) : (
                        /* Opposite party statement */
                        <div className="flex flex-col items-start self-start max-w-[85%] w-full">
                          <span className="text-[9px] font-mono text-[var(--accent2)] uppercase ml-1 flex items-center gap-1">
                            <span>{TONE_OPTIONS.find(t => t.id === (toneId || 'defensive'))?.emoji || '💬'}</span>
                            <span>COUNTER-PARTY (EXPECTED RESPONSE)</span>
                          </span>
                          <div className="bg-[var(--bg2)] border border-[var(--border)] text-sm text-[var(--text)] px-4 py-3.5 rounded-2xl rounded-tl-none shadow-sm relative w-full">
                            <MarkdownRenderer text={item.content} />
                          </div>

                          {/* Coach Co-Pilot Tips */}
                          {item.coachNotes && (
                            <div className="mt-2 ml-1 p-3 bg-[var(--bg2)] border-l-2 border-[var(--accent)] rounded-r-lg max-w-full text-xs text-[var(--text2)] leading-relaxed">
                              <span className="font-bold text-[var(--accent)] font-mono text-[9px] tracking-wider uppercase block mb-1">
                                💡 COACHING NOTE:
                              </span>
                              <p className="italic">{item.coachNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex items-center gap-2.5 self-start">
                      <div className="w-2.5 h-2.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2.5 h-2.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2.5 h-2.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>

                {/* Reply textbox */}
                <form onSubmit={handleSendChatReply} className="p-4 bg-[var(--bg2)] border-t border-[var(--border)] flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <textarea
                      value={userReply}
                      onChange={(e) => setUserReply(e.target.value)}
                      placeholder="Type your next practice statement here..."
                      rows={2}
                      disabled={chatLoading}
                      className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] resize-y min-h-[60px]"
                    />
                  </div>

                  

                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[10px] text-[var(--text3)] italic">
                      Practice makes perfect. Simulate until you feel confident.
                    </span>
                    <button
                      type="submit"
                      disabled={chatLoading || !userReply.trim()}
                      className="px-6 py-2.5 bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 border border-[var(--accent)]/50 text-[var(--text)] rounded-lg text-xs font-semibold cursor-pointer transition-all active:translate-y-[0.5px] disabled:opacity-50"
                    >
                      {chatLoading ? 'Generating Counter...' : 'Send Statement'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-lg text-xs bg-[rgba(240,78,110,0.1)] border border-[rgba(240,78,110,0.3)] text-accent2 leading-relaxed rounded-xl">
                {errorMsg}
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
