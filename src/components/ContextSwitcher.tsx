import React, { useState } from 'react';
import { UserState, TONE_OPTIONS } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ToolProps {
  userState: UserState;
  
  
  
  
}

// Default Source Perspectives
const DEFAULT_SOURCE_PERSPECTIVES = [
  'Technical / Architecture',
  'Corporate / Execution',
  'Academic / Theoretical',
  'Raw / Unstructured Thought',
  'Legal / Compliance',
  'Creative / Copywriting'
];

// Default Audience Frames strictly sorted alphabetically within blocks
const SERIOUS_AUDIENCE_OPTIONS = [
  'Cross-Functional Teams 🤝',
  'End-Users / Customers 🛒',
  'Executive Leadership 💼',
  'General Public 🌍',
  'Regulatory / Legal Inspectors ⚖️',
  'Technical Peers 💻'
];

const FUN_AUDIENCE_OPTIONS = [
  'Alien',
  'Backseat Driver',
  'Boomer',
  'Caveman',
  'Gen-Z',
  'Millennial',
  'Overwhelmed Customer',
  'Pirate',
  'Pragmatic Boss',
  'Skeptic',
  'Teenager',
  'Toddler'
];

const JARGON_STEPS = ['Minimal', 'Standard', 'Dense'];

export default function ContextSwitcher({
  userState,
  
}: ToolProps) {
  const [inputText, setInputText] = useState('');
  const [tone, setTone] = useState('default');
  const [toneList, setToneList] = useState(TONE_OPTIONS);
  const [customTone, setCustomTone] = useState('');

  // Source perspectives state & custom add
  const [sourceList, setSourceList] = useState(DEFAULT_SOURCE_PERSPECTIVES);
  const [selectedSource, setSelectedSource] = useState(DEFAULT_SOURCE_PERSPECTIVES[0]);
  const [customSource, setCustomSource] = useState('');

  // Audience frame state & custom add
  const [audienceList, setAudienceList] = useState([...SERIOUS_AUDIENCE_OPTIONS, ...FUN_AUDIENCE_OPTIONS]);
  const [selectedAudience, setSelectedAudience] = useState(SERIOUS_AUDIENCE_OPTIONS[0]);
  const [customAudience, setCustomAudience] = useState('');

  // Jargon slider & strategy state
  const [jargonIdx, setJargonIdx] = useState(1); // Standard
  const [strategy, setStrategy] = useState('Direct Reframer'); // 'Direct Reframer' or 'Analogy-Driven'

  // Generation status state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasDailyCapError, setHasDailyCapError] = useState(false);

  // Add custom Source Perspective
  const handleAddCustomSource = (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = customSource.trim()
    if (!cleaned) return;
    if (!sourceList.includes(cleaned)) {
      setSourceList(prev => [...prev, cleaned]);
    }
    setSelectedSource(cleaned);
    setCustomSource('');
  };

  // Add custom Audience Frame
  const handleAddCustomAudience = (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = customAudience.trim()
    if (!cleaned) return;
    if (!audienceList.includes(cleaned)) {
      setAudienceList(prev => [...prev, cleaned]);
    }
    setSelectedAudience(cleaned);
    setCustomAudience('');
  };

  // Add custom Tone option
  const handleAddCustomTone = (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = customTone.trim()
    if (!cleaned) return;
    if (!toneList.some(t => t.id === cleaned || t.name === cleaned)) {
      const newToneObj = {
        id: cleaned,
        name: cleaned,
        emoji: '🎭',
        description: `Custom tone: ${cleaned}`
      };
      setToneList(prev => [...prev, newToneObj]);
    }
    setTone(cleaned);
    setCustomTone('');
  };

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
    

    if (!inputText.trim()) {
      setErrorMsg('Please enter raw concept or draft text first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult('');
    setHasDailyCapError(false);

    try {
      const actualSource = selectedSource === 'custom-trigger' ? (customSource.trim() || DEFAULT_SOURCE_PERSPECTIVES[0]) : selectedSource;
      const actualAudience = selectedAudience === 'custom-trigger' ? (customAudience.trim() || SERIOUS_AUDIENCE_OPTIONS[0]) : selectedAudience;
      const actualTone = tone === 'custom-trigger' ? (customTone.trim() || 'default') : tone;

      const response = await fetch('/api/generate/context-switcher', {
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
          sourcePerspective: actualSource,
          audienceFrame: actualAudience,
          jargonIntensity: JARGON_STEPS[jargonIdx],
          outputStrategy: strategy,
          inputText,
          tone: actualTone,
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
      <div id="context-cap-error" className="w-full max-w-[640px] bg-danger/20 border-2 border-danger/40 rounded-2xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl animate-fade-in my-8 mx-auto">
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
          A database synchronization timeout occurred. This safeguard blocks further reframing cycles to avoid structural overflow inside your premium portal.
        </p>
        <p className="text-xs text-[var(--text3)] italic">
          The system is currently busy. Please try again later.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
          <button
            id="context-btn-support"
            
            className="px-6 py-3 bg-danger hover:bg-danger text-[var(--text)] rounded-xl text-sm font-bold shadow-[0_4px_20px_rgba(239,68,68,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="context-switcher-root" className="flex flex-col items-center w-full animate-fade-in text-[var(--text)]">
      <div className="text-center mb-8 w-full max-w-2xl">
        <span className="text-4xl mb-2.5 block">🔄</span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase mb-1">🔄 CONTEXT SWITCHER</h1>
        <p className="text-xs font-mono text-[var(--text2)] uppercase tracking-wider mb-2">
          Cognitive Linguistic Reframer
        </p>
        <p className="text-sm text-[var(--text2)] max-w-lg mx-auto leading-relaxed">
          Completely rebuild information hierarchy, vocabulary density, and delivery framing. Translate complex ideas to any professional or generational audience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl items-start">
        {/* Form Controls Section */}
        <form onSubmit={handleGenerate} className="lg:col-span-7 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
          
          {/* Tone Dropdown */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase flex items-center gap-1.5">
              🎭 Site-wide Delivery Tone
            </label>
            <select
              id="context-tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text)] focus:border-[var(--accent)] outline-none cursor-pointer"
            >
              {toneList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.name} — {t.description.substring(0, 50)}...
                </option>
              ))}
              <option value="custom-trigger">➕ + Custom Tone...</option>
            </select>

            {/* Inline Add Tone input (Toggled only when "custom-trigger" is selected) */}
            {tone === 'custom-trigger' && (
              <div className="flex items-center gap-1.5 mt-1 bg-[var(--bg3)] border border-[var(--border)] p-1.5 rounded-xl animate-fade-in text-left">
                <input
                  id="custom-tone-input"
                  type="text"
                  value={customTone}
                  onChange={(e) => setCustomTone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomTone(e);
                    }
                  }}
                  placeholder="Type custom tone template..."
                  className="flex-1 bg-transparent px-2 text-xs text-[var(--text)] focus:outline-none placeholder:text-[var(--text3)]"
                  autoFocus
                />
                <button
                  type="button"
                  id="add-custom-tone-btn"
                  onClick={handleAddCustomTone}
                  className="px-3 py-1.5 bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 border border-[var(--accent)]/50 text-[var(--accent)] rounded-lg text-xs font-bold transition-opacity cursor-pointer whitespace-nowrap"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  id="cancel-custom-tone-btn"
                  onClick={() => {
                    setCustomTone('');
                    setTone('default');
                  }}
                  className="px-2 py-1.5 bg-[var(--bg3)] hover:bg-[var(--border)] text-[var(--text2)] rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Source Perspective Dropdown with Inline Custom Input */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              📥 Source Perspective / Context
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                id="context-source-select"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text)] focus:border-[var(--accent)] outline-none cursor-pointer"
              >
                {sourceList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="custom-trigger">➕ + Custom...</option>
              </select>
            </div>
            
            {/* Inline Add Source perspective input (Toggled only when "+ Custom..." is selected) */}
            {selectedSource === 'custom-trigger' && (
              <div className="flex items-center gap-1.5 mt-1 bg-[var(--bg3)] border border-[var(--border)] p-1.5 rounded-xl animate-fade-in">
                <input
                  id="custom-source-input"
                  type="text"
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomSource(e);
                    }
                  }}
                  placeholder="Type custom perspective name..."
                  className="flex-1 bg-transparent px-2 text-xs text-[var(--text)] focus:outline-none placeholder:text-[var(--text3)]"
                  autoFocus
                />
                <button
                  type="button"
                  id="add-custom-source-btn"
                  onClick={handleAddCustomSource}
                  className="px-3 py-1.5 bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 border border-[var(--accent)]/50 text-[var(--accent)] rounded-lg text-xs font-bold transition-opacity cursor-pointer whitespace-nowrap"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  id="cancel-custom-source-btn"
                  onClick={() => {
                    setCustomSource('');
                    setSelectedSource(DEFAULT_SOURCE_PERSPECTIVES[0]);
                  }}
                  className="px-2 py-1.5 bg-[var(--bg3)] hover:bg-[var(--border)] text-[var(--text2)] rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Audience Frame Dropdown with strictly sorted blocks */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              🎯 Target Audience Frame Archetype
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                id="context-audience-select"
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text)] focus:border-[var(--accent)] outline-none cursor-pointer"
              >
                <optgroup label="💼 Serious Professional Frames">
                  {audienceList.filter(a => SERIOUS_AUDIENCE_OPTIONS.includes(a) || (!FUN_AUDIENCE_OPTIONS.includes(a) && !SERIOUS_AUDIENCE_OPTIONS.includes(a))).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </optgroup>
                <optgroup label="🎭 Generational & Behavioral Frames">
                  {audienceList.filter(a => FUN_AUDIENCE_OPTIONS.includes(a)).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </optgroup>
                <option value="custom-trigger">➕ + Custom...</option>
              </select>
            </div>

            {/* Inline Add Audience frame input (Toggled only when "+ Custom..." is selected) */}
            {selectedAudience === 'custom-trigger' && (
              <div className="flex items-center gap-1.5 mt-1 bg-[var(--bg3)] border border-[var(--border)] p-1.5 rounded-xl animate-fade-in">
                <input
                  id="custom-audience-input"
                  type="text"
                  value={customAudience}
                  onChange={(e) => setCustomAudience(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomAudience(e);
                    }
                  }}
                  placeholder="Type custom audience name..."
                  className="flex-1 bg-transparent px-2 text-xs text-[var(--text)] focus:outline-none placeholder:text-[var(--text3)]"
                  autoFocus
                />
                <button
                  type="button"
                  id="add-custom-audience-btn"
                  onClick={handleAddCustomAudience}
                  className="px-3 py-1.5 bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 border border-[var(--accent)]/50 text-[var(--accent)] rounded-lg text-xs font-bold transition-opacity cursor-pointer whitespace-nowrap"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  id="cancel-custom-audience-btn"
                  onClick={() => {
                    setCustomAudience('');
                    setSelectedAudience(SERIOUS_AUDIENCE_OPTIONS[0]);
                  }}
                  className="px-2 py-1.5 bg-[var(--bg3)] hover:bg-[var(--border)] text-[var(--text2)] rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Jargon Intensity Slider */}
          <div className="flex flex-col gap-1.5 bg-[var(--bg3)] p-3 rounded-xl border border-[var(--border)]">
            <div className="flex justify-between items-center text-[10px] tracking-wider font-mono uppercase font-semibold text-[var(--text2)]">
              <span>📚 Jargon Intensity / Terminology Density</span>
              <span className="text-[var(--accent)] font-bold">{JARGON_STEPS[jargonIdx]}</span>
            </div>
            <input
              id="context-jargon-range"
              type="range"
              min="0"
              max="2"
              step="1"
              value={jargonIdx}
              onChange={(e) => setJargonIdx(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[8px] font-mono text-[var(--text3)]">
              <span>Minimal</span>
              <span>Standard</span>
              <span>Dense</span>
            </div>
          </div>

          {/* Output Strategy Toggle Button */}
          <div className="flex flex-col gap-1.5">
            <span className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              🛠️ Output Structural Strategy
            </span>
            <div className="grid grid-cols-2 gap-2 bg-[var(--bg3)] p-1 rounded-xl border border-[var(--border)]">
              <button
                type="button"
                id="strategy-direct-btn"
                onClick={() => setStrategy('Direct Reframer')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  strategy === 'Direct Reframer'
                    ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/50 text-[var(--accent)]'
                    : 'text-[var(--text2)] hover:text-[var(--text)]'
                }`}
              >
                Direct Reframer
              </button>
              <button
                type="button"
                id="strategy-analogy-btn"
                onClick={() => setStrategy('Analogy-Driven')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  strategy === 'Analogy-Driven'
                    ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/50 text-[var(--accent)]'
                    : 'text-[var(--text2)] hover:text-[var(--text)]'
                }`}
              >
                Analogy-Driven
              </button>
            </div>
          </div>

          {/* Input Concept Textarea */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="context-input-concept" className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              ✍️ Input your raw concept or text draft
            </label>
            <textarea
              id="context-input-concept"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="E.g., We are migrating the database to a globally distributed multi-region cluster to improve low-latency query throughput for active checkout sessions..."
              rows={4}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text)] placeholder:text-[var(--text3)] focus:border-[var(--accent)] outline-none resize-y"
            />
          </div>

          {/* Form Error */}
          {errorMsg && (
            <div id="context-validation-error" className="bg-danger/20 border border-danger/40 text-danger text-xs p-3 rounded-xl font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            id="context-generate-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 disabled:opacity-40 border border-[var(--accent)]/50 text-[var(--accent)] font-display text-sm tracking-widest uppercase font-black rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[var(--bg)] border-t-transparent rounded-full animate-spin" />
                <span>DESTRUCTURING CONTEXTS...</span>
              </>
            ) : (
              <span>⚡ REFRAME CONTEXTS</span>
            )}
          </button>
        </form>

        {/* Output Panel Section */}
        <div id="context-output-container" className="lg:col-span-5 flex flex-col h-full min-h-[450px]">
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-6 flex flex-col flex-1 shadow-sm h-full max-h-[800px] overflow-hidden">
            
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-4">
              <h2 className="font-display text-sm tracking-widest uppercase text-[var(--text2)]">
                ⚙️ Reframed Hierarchy
              </h2>

              {result && (
                <button
                  id="context-copy-btn"
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 bg-[var(--bg3)] hover:opacity-90 border border-[var(--border)] rounded-lg text-[10px] font-mono text-[var(--text)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? '✅ COPIED' : '📋 COPY BUNDLE'}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 text-left custom-scrollbar scroll-smooth">
              {loading ? (
                <div id="context-status-loading" className="flex flex-col gap-4 py-16 text-center text-[var(--text3)]">
                  <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="font-mono text-xs tracking-wider uppercase animate-pulse">
                    Adapting semantics...
                  </p>
                  <p className="text-xs max-w-xs mx-auto text-[var(--text3)]">
                    Applying "{toneList.find(t => t.id === tone)?.name || tone || 'Default'}" delivery tone overlay and molding logical structures for "{selectedAudience}".
                  </p>
                </div>
              ) : result ? (
                <div id="context-markdown-view" className="markdown-body font-mono text-xs text-[var(--text)] whitespace-pre-wrap leading-relaxed select-text tracking-wide bg-[var(--bg3)] rounded-xl border border-[var(--border)] p-4 max-h-[600px] overflow-y-auto">
                  <MarkdownRenderer text={result} />
                </div>
              ) : (
                <div id="context-placeholder-panel" className="flex flex-col items-center justify-center text-center text-[var(--text3)] py-24 gap-4">
                  <span className="text-5xl opacity-40">🔄</span>
                  <div className="flex flex-col gap-1">
                    <p className="font-mono text-xs uppercase tracking-wider">
                      No reframing compiled yet
                    </p>
                    <p className="text-xs max-w-xs text-[var(--text3)]">
                      Input your raw concept text on the left and trigger the restructuring sequence.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
