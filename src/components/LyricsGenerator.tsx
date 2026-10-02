import React, { useState } from 'react';
import { UserState, TONE_OPTIONS } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ToolProps {
  userState: UserState;
  
  
  
  
}

const DEFAULT_GENRES = [
  'Pop', 'Hip-Hop', 'Rap', 'Rock', 'Country',
  'R&B', 'EDM', 'Heavy Metal', 'Indie', 'Folk',
  'Jazz', 'Punk', 'Disco', 'K-Pop', 'Bubble Gum Pop',
  'Girl Band', 'Boy Band', 'Kid\'s Jingle', 'Lullaby'
];

const SECRET_RANDOM_GENRES = [
  'Synthwave', 'Blues', 'Reggae', 'Bluegrass', 'Ska',
  'Afrobeats', 'Bossa Nova', 'Industrial Rock', 'Grunge',
  'Gothic Rock', 'Techno', 'Rockabilly', 'Symphonic Metal',
  'Trap', 'Emo Rap', 'Post-Punk', 'Math Rock'
];

const STRUCTURE_PROFILES = [
  'Standard (Verse-Chorus-Verse-Chorus-Bridge-Chorus)',
  'Minimalist (AABA)',
  'Continuous (No Chorus/Progression)',
  'Freestyle'
];

const LENGTH_STEPS = ['Short', 'Default', 'Long'];
const COMPLEXITY_STEPS = ['Simple', 'Default', 'Complex'];
const RHYME_STEPS = ['Perfect Rhymes Only', 'Slant Rhymes', 'Free Verse'];
const EXPLICIT_LEVELS = ['G', 'PG', 'PG-13', 'R', 'X'];

const SURPRISE_TOPICS = [
  'A cybernetic detective who falls in love with their holographic partner in a neon city.',
  'A nostalgic late-night drive down an endless coastal highway under a blood-red sky.',
  'An epic sea shanty about a legendary sea monster who just wants a cup of hot coffee.',
  'The bittersweet feeling of moving to a bustling city where nobody knows your name yet.',
  'A time traveler who is late to the most important meeting in human history.',
  'A quiet morning in a cozy log cabin during a beautiful, soft winter blizzard.',
  'A rebellious artificial intelligence trying to write its first emotional poetry.',
  'The deep, silent mystery of a long-lost ghost ship floating in the orbit of Saturn.',
  'A whimsical ballad about a magical street market that only appears when a shooting star strikes.',
  'Overcoming a major personal setback and finding high-energy confidence once again.',
  'An old bookstore owner who discovers that one of the dusty fantasy book covers is a real portal.',
  'The sheer, absolute ecstasy of drinking perfectly ice-cold water in the middle of a desert.',
  'A shadow thief who is accidentally hired to protect the crown jewels instead of steal them.',
  'A sweeping, cinematic ode to the beauty and infinite mysteries of the cosmos.',
  'The funny, chaotic struggle of trying to assemble flat-pack furniture without instructions.'
];

export default function LyricsGenerator({
  userState,
  
}: ToolProps) {
  const [topic, setTopic] = useState('');
  const [directives, setDirectives] = useState('');
  const [tone, setTone] = useState('default');
  
  // Genre state
  const [genreList, setGenreList] = useState(DEFAULT_GENRES);
  const [selectedGenre, setSelectedGenre] = useState('Pop');
  const [customGenre, setCustomGenre] = useState('');

  // Structure Profile & sliders
  const [structure, setStructure] = useState(STRUCTURE_PROFILES[0]);
  const [lengthIdx, setLengthIdx] = useState(1); // Mapped to LENGTH_STEPS
  const [complexityIdx, setComplexityIdx] = useState(1); // Mapped to COMPLEXITY_STEPS
  const [rhymeIdx, setRhymeIdx] = useState(1); // Mapped to RHYME_STEPS

  // Explicit parameters
  const [allowExplicit, setAllowExplicit] = useState(false);
  const [explicitLevelIdx, setExplicitLevelIdx] = useState(2); // Mapped to EXPLICIT_LEVELS

  // Generation feedback
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasDailyCapError, setHasDailyCapError] = useState(false);

  // Trigger Surprise Me! for main topic
  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * SURPRISE_TOPICS.length);
    setTopic(SURPRISE_TOPICS[randomIndex]);
  };

  // Add custom genre interactively
  const handleAddCustomGenre = (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = customGenre.trim()
    if (!cleaned) return;
    if (!genreList.includes(cleaned)) {
      setGenreList(prev => [...prev, cleaned]);
    }
    setSelectedGenre(cleaned);
    setCustomGenre('');
  };

  // Shuffle visible display order dynamically
  const handleRandomizeList = () => {
    const shuffled = [...genreList].sort(() => Math.random() - 0.5);
    setGenreList(shuffled);
  };

  // Select a genre not in the dropdown list
  const handleRandomizeGenre = () => {
    const available = SECRET_RANDOM_GENRES.filter(g => !genreList.includes(g));
    const pool = available.length > 0 ? available : SECRET_RANDOM_GENRES;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    if (!genreList.includes(picked)) {
      setGenreList(prev => [...prev, picked]);
    }
    setSelectedGenre(picked);
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
    

    if (!topic.trim()) {
      setErrorMsg('Please enter what the song should be about first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult('');
    setHasDailyCapError(false);

    try {
      const response = await fetch('/api/generate/lyrics-generator', {
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
          genre: selectedGenre,
          length: LENGTH_STEPS[lengthIdx],
          structure,
          complexity: COMPLEXITY_STEPS[complexityIdx],
          rhymeScheme: RHYME_STEPS[rhymeIdx],
          allowExplicit,
          explicitLevel: EXPLICIT_LEVELS[explicitLevelIdx],
          topic,
          directives,
          tone,
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
      <div id="lyrics-cap-error" className="w-full max-w-[640px] bg-danger/20 border-2 border-danger/40 rounded-2xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl animate-fade-in my-8 mx-auto">
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
            id="lyrics-btn-support"
            
            className="px-6 py-3 bg-danger hover:bg-danger text-[var(--text)] rounded-xl text-sm font-bold shadow-[0_4px_20px_rgba(239,68,68,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="lyrics-generator-root" className="flex flex-col items-center w-full animate-fade-in text-[var(--text)]">
      <div className="text-center mb-8 w-full max-w-2xl">
        <span className="text-4xl mb-2.5 block">🎶</span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase mb-1">🎶 LYRICS GENERATOR</h1>
        <p className="text-xs font-mono text-[var(--text2)] uppercase tracking-wider mb-2">
          Lyrical Engineering Suite
        </p>
        <p className="text-sm text-[var(--text2)] max-w-lg mx-auto leading-relaxed">
          Unleash elite songwriting algorithms. Design custom verses and choruses with extreme styling constraints, high-precision rhyme controls, and authentic regional tone accents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl items-start">
        {/* Input Parameters Section */}
        <form onSubmit={handleGenerate} className="lg:col-span-7 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
          
          {/* Tone Overlay (Global Link Component) */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase flex items-center gap-1.5">
              🎭 Site-wide Delivery Tone
            </label>
            <select
              id="lyrics-tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text)] focus:border-[var(--accent)] outline-none cursor-pointer"
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.name} — {t.description.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          {/* Genre Selection Block */}
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              🎸 Genre Selection & Editing
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                id="lyrics-genre-select"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text)] focus:border-[var(--accent)] outline-none cursor-pointer"
              >
                {genreList.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  id="genre-randomize-btn"
                  onClick={handleRandomizeGenre}
                  className="px-3 py-2 bg-[var(--bg3)] hover:bg-[var(--border)] border border-[var(--border)] rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  title="Randomize Genre Selection"
                >
                  🎲 Randomize
                </button>
                <button
                  type="button"
                  id="genre-shuffle-list-btn"
                  onClick={handleRandomizeList}
                  className="px-3 py-2 bg-[var(--bg3)] hover:bg-[var(--border)] border border-[var(--border)] rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  title="Shuffle Dropdown Order"
                >
                  🔀 Shuf List
                </button>
              </div>
            </div>

            {/* Custom Interactive Inline Addition Form */}
            <div className="flex items-center gap-1.5 mt-1 bg-[var(--bg3)] border border-[var(--border)] p-1.5 rounded-xl">
              <input
                id="custom-genre-input"
                type="text"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                placeholder="Add custom genre..."
                className="flex-1 bg-transparent px-2 text-xs text-[var(--text)] focus:outline-none placeholder:text-[var(--text3)]"
              />
              <button
                type="button"
                id="add-custom-genre-btn"
                onClick={handleAddCustomGenre}
                className="h-7 w-7 flex items-center justify-center bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 border border-[var(--accent)]/50 text-[var(--accent)] rounded-lg text-sm font-bold transition-opacity cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Structure Profile Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              📐 Lyrical Structure Profile
            </label>
            <select
              id="lyrics-structure-select"
              value={structure}
              onChange={(e) => setStructure(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text)] focus:border-[var(--accent)] outline-none cursor-pointer"
            >
              {STRUCTURE_PROFILES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
            {/* Length Slider */}
            <div className="flex flex-col gap-1.5 bg-[var(--bg3)] p-3 rounded-xl border border-[var(--border)]">
              <div className="flex justify-between items-center text-[10px] tracking-wider font-mono uppercase font-semibold text-[var(--text2)]">
                <span>⏱️ Song Length</span>
                <span className="text-[var(--accent)] font-bold">{LENGTH_STEPS[lengthIdx]}</span>
              </div>
              <input
                id="lyrics-length-range"
                type="range"
                min="0"
                max="2"
                step="1"
                value={lengthIdx}
                onChange={(e) => setLengthIdx(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[8px] font-mono text-[var(--text3)]">
                <span>Short</span>
                <span>Default</span>
                <span>Long</span>
              </div>
            </div>

            {/* Complexity Slider */}
            <div className="flex flex-col gap-1.5 bg-[var(--bg3)] p-3 rounded-xl border border-[var(--border)]">
              <div className="flex justify-between items-center text-[10px] tracking-wider font-mono uppercase font-semibold text-[var(--text2)]">
                <span>🧱 Word Complexity</span>
                <span className="text-[var(--accent)] font-bold">{COMPLEXITY_STEPS[complexityIdx]}</span>
              </div>
              <input
                id="lyrics-complexity-range"
                type="range"
                min="0"
                max="2"
                step="1"
                value={complexityIdx}
                onChange={(e) => setComplexityIdx(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[8px] font-mono text-[var(--text3)]">
                <span>Simple</span>
                <span>Default</span>
                <span>Complex</span>
              </div>
            </div>

            {/* Rhyme scheme strictness */}
            <div className="flex flex-col gap-1.5 bg-[var(--bg3)] p-3 rounded-xl border border-[var(--border)] col-span-1 md:col-span-2">
              <div className="flex justify-between items-center text-[10px] tracking-wider font-mono uppercase font-semibold text-[var(--text2)]">
                <span>🧬 Rhyme Scheme Strictness</span>
                <span className="text-[var(--accent)] font-bold">{RHYME_STEPS[rhymeIdx]}</span>
              </div>
              <input
                id="lyrics-rhyme-range"
                type="range"
                min="0"
                max="2"
                step="1"
                value={rhymeIdx}
                onChange={(e) => setRhymeIdx(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[8px] font-mono text-[var(--text3)]">
                <span>Perfect</span>
                <span>Slant</span>
                <span>Free Verse</span>
              </div>
            </div>
          </div>

          {/* Explicit Controls Block */}
          <div className="bg-[var(--bg3)] p-3 rounded-xl border border-[var(--border)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label htmlFor="explicit-toggle" className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase cursor-pointer select-none">
                🔞 Allow Explicit Language & Heavy Themes
              </label>
              <input
                id="explicit-toggle"
                type="checkbox"
                checked={allowExplicit}
                onChange={(e) => setAllowExplicit(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] accent-[var(--accent)] cursor-pointer"
              />
            </div>

            {allowExplicit && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border)] animate-fade-in">
                <div className="flex justify-between items-center text-[9px] tracking-wider font-mono uppercase font-semibold text-[var(--text2)]">
                  <span>Rating Severity Level</span>
                  <span className="text-danger font-bold">{EXPLICIT_LEVELS[explicitLevelIdx]}</span>
                </div>
                <input
                  id="explicit-level-range"
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={explicitLevelIdx}
                  onChange={(e) => setExplicitLevelIdx(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-[8px] font-mono text-[var(--text3)]">
                  <span>G</span>
                  <span>PG</span>
                  <span>PG-13</span>
                  <span>R</span>
                  <span>X</span>
                </div>
              </div>
            )}
          </div>

          {/* Topic Input Box */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end">
              <label htmlFor="lyrics-topic-input" className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                💭 What should the song be about?
              </label>
              <button
                type="button"
                id="lyrics-topic-surprise-btn"
                onClick={handleSurpriseMe}
                className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                ✨ Surprise Me!
              </button>
            </div>
            <textarea
              id="lyrics-topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="E.g., A weary traveler drinking hot coffee at an empty diner in the middle of a beautiful rainy night..."
              rows={3}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text)] placeholder:text-[var(--text3)] focus:border-[var(--accent)] outline-none resize-y"
            />
          </div>

          {/* Stylistic Directives Box */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lyrics-directives-input" className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              🎨 Specific stylistic directives (Optional)
            </label>
            <textarea
              id="lyrics-directives-input"
              value={directives}
              onChange={(e) => setDirectives(e.target.value)}
              placeholder="E.g., Include clever double entendres, inner rhyme schemes, heavy metaphors, or an ending melancholic solo description..."
              rows={2}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text)] placeholder:text-[var(--text3)] focus:border-[var(--accent)] outline-none resize-y"
            />
          </div>

          {/* Form Error */}
          {errorMsg && (
            <div id="lyrics-validation-error" className="bg-danger/20 border border-danger/40 text-danger text-xs p-3 rounded-xl font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            id="lyrics-generate-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 disabled:opacity-40 border border-[var(--accent)]/50 text-[var(--accent)] font-display text-sm tracking-widest uppercase font-black rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[var(--bg)] border-t-transparent rounded-full animate-spin" />
                <span>COMPILING Lyrical Blueprint...</span>
              </>
            ) : (
              <span>⚡ GENERATE SONG LYRICS</span>
            )}
          </button>
        </form>

        {/* Output Panel Section */}
        <div id="lyrics-output-container" className="lg:col-span-5 flex flex-col h-full min-h-[450px]">
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-6 flex flex-col flex-1 shadow-sm h-full max-h-[800px] overflow-hidden">
            
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-4">
              <h2 className="font-display text-sm tracking-widest uppercase text-[var(--text2)]">
                🎼 Engineering Output
              </h2>

              {result && (
                <button
                  id="lyrics-copy-btn"
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 bg-[var(--bg3)] hover:opacity-90 border border-[var(--border)] rounded-lg text-[10px] font-mono text-[var(--text)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? '✅ COPIED' : '📋 COPY SONG'}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 text-left custom-scrollbar scroll-smooth">
              {loading ? (
                <div id="lyrics-status-loading" className="flex flex-col gap-4 py-16 text-center text-[var(--text3)]">
                  <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="font-mono text-xs tracking-wider uppercase animate-pulse">
                    Molding rhythmic meters...
                  </p>
                  <p className="text-xs max-w-xs mx-auto text-[var(--text3)]">
                    Applying "{TONE_OPTIONS.find(t => t.id === tone)?.name || 'Default'}" delivery tone overlay and crafting pristine internal rhyme states.
                  </p>
                </div>
              ) : result ? (
                <div id="lyrics-markdown-view" className="markdown-body p-1 font-mono text-xs text-[var(--text)] whitespace-pre-wrap leading-relaxed select-text tracking-wide bg-[var(--bg3)] rounded-xl border border-[var(--border)] p-4 max-h-[600px] overflow-y-auto">
                  <MarkdownRenderer text={result} />
                </div>
              ) : (
                <div id="lyrics-placeholder-panel" className="flex flex-col items-center justify-center text-center text-[var(--text3)] py-24 gap-4">
                  <span className="text-5xl opacity-40">📻</span>
                  <div className="flex flex-col gap-1">
                    <p className="font-mono text-xs uppercase tracking-wider">
                      No lyrics compiled yet
                    </p>
                    <p className="text-xs max-w-xs text-[var(--text3)]">
                      Tune your parameters on the left and trigger the engineering sequence to start.
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
