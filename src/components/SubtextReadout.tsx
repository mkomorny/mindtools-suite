import React, { useState } from 'react';
import { UserState, TONE_OPTIONS } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ToolProps {
  userState: UserState;
  
  
  
  
}

interface TranslationItem {
  phrase: string;
  subtextCode: string;
  hiddenMotive: string;
}

interface ResponseScenario {
  label: string;
  aim: string;
  suggestedText: string;
}

interface SubtextResult {
  overallSubtext: string;
  vulnerabilityScale: number; // 0 to 100
  vulnerabilityMeaning: string;
  detectedMotives: string[];
  hesitations: string[];
  implicitBoundaries: string[];
  translations: TranslationItem[];
  responseScenarios: ResponseScenario[];
  coachingRules: string[];
}

export default function SubtextReadout({
  userState,
  
}: ToolProps) {
  const [crypticText, setCrypticText] = useState('');
  const [context, setContext] = useState('');
  const [relationType, setRelationType] = useState('romantic'); // romantic, friendship, family, professional, other
  const [customRelationType, setCustomRelationType] = useState('');
  const [tone, setTone] = useState('');
  const [isCustomTone, setIsCustomTone] = useState(false);
  const [customToneText, setCustomToneText] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubtextResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedScenarioIdx, setCopiedScenarioIdx] = useState<number | null>(null);
  const [hasDailyCapError, setHasDailyCapError] = useState(false);

  const handleReset = () => {
    setCrypticText('');
    setContext('');
    setRelationType('romantic');
    setCustomRelationType('');
    setTone('default');
    setIsCustomTone(false);
    setCustomToneText('');
    setResult(null);
    setErrorMsg('');
  };

  const handleCopyScenario = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedScenarioIdx(idx);
      setTimeout(() => setCopiedScenarioIdx(null), 1800);
    } catch {
      setCopiedScenarioIdx(idx);
      setTimeout(() => setCopiedScenarioIdx(null), 1800);
    }
  };

  const handleReadout = async (e: React.FormEvent) => {
    e.preventDefault()
    

    if (!crypticText.trim()) {
      setErrorMsg('Please input the mysterious text or comment.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);
    setHasDailyCapError(false);

    const finalTone = isCustomTone ? customToneText.trim() || 'balanced' : (tone || 'default');
    const finalRelationType = relationType === 'other' ? customRelationType.trim() || 'other' : relationType;

    try {
      const response = await fetch('/api/generate/subtext-readout', {
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
          crypticText,
          context,
          relationType: finalRelationType,
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
      setResult(data.subtextResult);
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

  const getVulnerabilityColor = (score: number) => {
    if (score >= 75) return 'text-sky-400 border-sky-500/30 bg-sky-950/20';
    if (score >= 40) return 'text-accent2 border-accent2/40 bg-accent2/20';
    return 'text-danger border-danger/30 bg-danger/20';
  };

  return (
    <div className="flex flex-col items-center w-full animate-fade-in text-[var(--text)]">
      <div className="text-center mb-8 w-full max-w-2xl">
        <span className="text-4xl mb-2.5 block">💬🔎</span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase mb-1">THE SUBTEXT READ-OUT</h1>
        <p className="text-xs font-mono text-[var(--text2)] uppercase tracking-wider mb-2">
          (Objective Translator for Interpersonal Subtext)
        </p>
        <p className="text-sm text-[var(--text2)] max-w-lg mx-auto leading-relaxed">
          Sift through cryptic DMs, puzzling text messages, or subtle friend responses. Translate what they said into what they likely meant, breaking down boundaries, desires, and tactical responses.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleReadout} className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-7 flex flex-col gap-6 w-full max-w-[640px] shadow-sm">
          
          <div className="flex flex-col gap-5 p-4 rounded-xl bg-[var(--bg3)] border border-[var(--border)] w-full">
            
            {/* Relationship Category */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                Relationship Context Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'romantic', label: 'Dating / Cupid', icon: '❤️' },
                  { id: 'friendship', label: 'Friendship', icon: '🤝' },
                  { id: 'family', label: 'Family Dynamics', icon: '🏡' },
                  { id: 'professional', label: 'Workplace', icon: '💼' },
                  { id: 'other', label: 'Other', icon: '🔮' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRelationType(item.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      relationType === item.id
                        ? 'border-[var(--accent)] bg-[var(--accent)]/[0.05] text-[var(--text)] font-semibold shadow-[0_0_10px_var(--accent-glow)]'
                        : 'border-[var(--border)] bg-[var(--bg2)] text-[var(--text2)] hover:border-border'
                    }`}
                  >
                    <span className="text-lg mb-1">{item.icon}</span>
                    <span className="text-[10px] font-medium block whitespace-nowrap">{item.label}</span>
                  </button>
                ))}
              </div>

              {relationType === 'other' && (
                <div className="mt-2.5 relative animate-fade-in text-left">
                  <label className="font-mono text-[9px] tracking-wider text-[var(--text3)] uppercase block mb-1">
                    Specify Custom Relationship Type
                  </label>
                  <input
                    type="text"
                    value={customRelationType}
                    onChange={(e) => setCustomRelationType(e.target.value)}
                    placeholder="e.g. Ex-partner, Mother-in-law, Nemesis, Acquaintance..."
                    className="bg-[var(--bg2)] border border-[var(--accent)] rounded-lg p-2.5 text-xs text-[var(--text)] focus:outline-none w-full"
                    required
                  />
                </div>
              )}
            </div>

            <hr className="border-[var(--border)]" />

            {/* Delivery Tone Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                Explanation Tone
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
                    placeholder="e.g. funny and direct, incredibly dry..."
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

          {/* Cryptic message */}
          <div className="flex flex-col gap-2 w-full">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              The puzzling message or comment received:
            </label>
            <textarea
              value={crypticText}
              onChange={(e) => setCrypticText(e.target.value)}
              placeholder='e.g., "I mean, I otherways would love to come, but I have a thing with my cousin that day. But we should definitely get boba next week instead! Or whenever."'
              rows={4}
              required
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y min-h-[100px]"
            />
          </div>

          {/* Context details */}
          <div className="flex flex-col gap-2 w-full">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              Brief Context / Relationship History (Optional but highly recommended):
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., We matched on Hinge last week, had one good date. They replied immediately at first, but now they take 2 days to text back. I don't know if they are busy or pulling back."
              rows={3}
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y"
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
              'Run Subtext Audit & Decrypt Meanings'
            )}
          </button>

          {errorMsg && (
            <div className="p-3.5 rounded-lg text-xs bg-[rgba(240,78,110,0.1)] border border-[rgba(240,78,110,0.3)] text-accent2 leading-relaxed">
              {errorMsg}
            </div>
          )}
        </form>
      ) : (
        /* READOUT RESULTS VIEW */
        <div className="w-full max-w-[760px] flex flex-col gap-8">
          
          {/* Header Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* vulnerability Meter Card */}
            <div className={`border-2 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden shadow-sm ${getVulnerabilityColor(result.vulnerabilityScale)}`}>
              <span className="font-mono text-[9px] uppercase tracking-wider block opacity-75">
                Implied Vulnerability Scale
              </span>
              <span className="text-5xl font-extrabold tracking-tight select-none">
                {result.vulnerabilityScale}<span className="text-lg opacity-60">/100</span>
              </span>
              <div className="w-full bg-bg2/14 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-current h-full rounded-full transition-all duration-1000"
                  style={{ width: `${result.vulnerabilityScale}%` }}
                />
              </div>
              <span className="text-[10px] font-mono uppercase mt-1 select-none">
                {result.vulnerabilityMeaning}
              </span>
            </div>

            {/* Quick Assessment summary */}
            <div className="col-span-1 md:col-span-2 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--accent)] block font-bold mb-1.5">
                  🔮 Subtext Diagnostic Insight
                </span>
                <p className="text-xs text-[var(--text)] leading-relaxed font-medium">
                  {result.overallSubtext}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 border-t border-[var(--border)] pt-3.5 mt-3.5">
                {result.detectedMotives.map((motive, mIdx) => (
                  <span key={mIdx} className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent2)] border border-[var(--accent)]/30">
                    🎯 {motive}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-[var(--bg2)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-mono text-[var(--text3)] uppercase">DIAGNOSTIC DECRYPTION PORTAL</span>
              <span className="text-xs font-semibold">
                Type: {relationType.toUpperCase()} | Tone: {isCustomTone ? customToneText : TONE_OPTIONS.find(t => t.id === (tone || 'default'))?.name || tone || 'Default'}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-mono px-4 py-2 rounded-xl border border-[var(--border)] hover:border-accent/40 hover:text-[var(--accent)] transition-all cursor-pointer bg-transparent"
            >
              Translate another text
            </button>
          </div>

          {/* Slices of Translation */}
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg tracking-wider text-[var(--text)] uppercase font-semibold flex items-center gap-2">
              📂 SUBTEXT TRANSLATION LOGS
            </h2>

            {result.translations.length === 0 ? (
              <div className="text-center p-12 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl">
                <span className="text-4xl mb-3 block">✅</span>
                <h3 className="font-bold text-sm text-[var(--accent2)]">Completely Transparent message</h3>
                <p className="text-xs text-[var(--text2)] mt-1 max-w-sm mx-auto">
                  What you read is exactly what they mean. No hidden boundaries or psychological defenses detected.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {result.translations.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm"
                  >
                    {/* Header */}
                    <div className="px-5 py-3 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between">
                      <span className="text-xs font-semibold font-mono text-[var(--text3)]">
                        SEGMENT #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-yellow-950/20 text-yellow-400 border border-yellow-500/20">
                        {item.subtextCode}
                      </span>
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: What they typed */}
                      <div className="border-[var(--border)] border rounded-xl p-4 bg-rose-950/5">
                        <span className="text-[9px] font-mono tracking-wider text-danger uppercase font-black block mb-2">
                          WHAT THEY TYPED:
                        </span>
                        <p className="text-xs italic text-[var(--text)] font-mono leading-relaxed">
                          "{item.phrase}"
                        </p>
                      </div>

                      {/* Right: What they actually imply */}
                      <div className="border-[var(--border)] border rounded-xl p-4 bg-success/5">
                        <span className="text-[9px] font-mono tracking-wider text-success uppercase font-black block mb-2">
                          IMPLIED SUBTEXT:
                        </span>
                        <p className="text-xs text-[var(--text2)] font-sans leading-relaxed">
                          {item.hiddenMotive}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Under-the-Hood Motivations & Emotional Blockers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Hesitations / Risks */}
            <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
              <span className="font-mono text-[9px] text-accent2 font-bold uppercase tracking-wider">
                🛑 Emotional Hesitations & Inhibitions
              </span>
              <ul className="text-xs text-[var(--text2)] flex flex-col gap-2 pl-4 list-disc leading-relaxed">
                {result.hesitations.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
                {result.hesitations.length === 0 && (
                  <li className="list-none text-[var(--text3)] italic">No significant emotional hesitations detected.</li>
                )}
              </ul>
            </div>

            {/* Unspoken Boundaries */}
            <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
              <span className="font-mono text-[9px] text-[var(--accent2)] font-bold uppercase tracking-wider">
                🚧 Implicit Borders & Boundary Markers
              </span>
              <ul className="text-xs text-[var(--text2)] flex flex-col gap-2 pl-4 list-disc leading-relaxed">
                {result.implicitBoundaries.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
                {result.implicitBoundaries.length === 0 && (
                  <li className="list-none text-[var(--text3)] italic">No unstated boundaries found.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Tactical Scenarios Options */}
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg tracking-wider text-[var(--text)] uppercase font-semibold flex items-center gap-2">
              🛠️ HIGH-EQ RESPONSE STRATEGIES
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.responseScenarios.map((sc, scIdx) => (
                <div
                  key={scIdx}
                  className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-[var(--accent)]/35 transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[9px] text-[var(--accent)] font-bold uppercase tracking-wider">
                      Strategy: {sc.label}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text)] leading-snug">
                      🎯 Aim: {sc.aim}
                    </span>
                  </div>

                  <div className="bg-[var(--bg3)] rounded-xl border border-[var(--border)] p-3 font-mono text-[11px] leading-relaxed italic text-[var(--text2)] break-words">
                    "{sc.suggestedText}"
                  </div>

                  <button
                    onClick={() => handleCopyScenario(sc.suggestedText, scIdx)}
                    className="w-full py-2 bg-[var(--bg3)] border border-[var(--border)] hover:border-[var(--accent)] text-xs font-mono text-[var(--text2)] hover:text-[var(--text)] rounded-xl transition-all cursor-pointer"
                  >
                    {copiedScenarioIdx === scIdx ? 'Copied Strategy Text!' : 'Copy Reply'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Emotional Intelligence Safeguard Rules */}
          {result.coachingRules.length > 0 && (
            <div className="bg-[var(--bg2)] border-2 border-[var(--accent)]/20 p-5 rounded-2xl shadow-sm">
              <span className="font-mono text-[9px] text-[var(--accent)] font-bold uppercase tracking-wider block mb-2">
                🎓 INTERPERSONAL RATIONAL SAFEGUARDS
              </span>
              <ul className="text-xs text-[var(--text2)] flex flex-col gap-2 pl-4 list-disc leading-relaxed">
                {result.coachingRules.map((cr, idx) => (
                  <li key={idx}>{cr}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
