import React, { useState } from 'react';
import { UserState, TONE_OPTIONS } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ToolProps {
  userState: UserState;
  
  
  
  
}

interface RecommendedWork {
  title: string;
  creator: string;
  releaseYear: string;
  keyVibeDesc: string;
  whyItMatches: string;
  aestheticDNA: string[];
}

interface QuickSuggestion {
  title: string;
  creator: string;
  releaseYear: string;
  briefConnection: string;
}

interface DNAAlignmentResult {
  extractedAestheticDNA: string;
  underlyingDNAProfile: string[];
  chosenElementAnalysis: string;
  quickSuggestions: QuickSuggestion[];
  recommendations: RecommendedWork[];
  curationPhilosophy: string;
}

const MEDIA_CATEGORIES = [
  { id: 'movies', label: 'Movies', icon: '🎬', placeholder: 'Inception' },
  { id: 'tv_shows', label: 'TV Shows', icon: '📺', placeholder: 'Succession' },
  { id: 'books', label: 'Books', icon: '📚', placeholder: 'Dune' },
  { id: 'music', label: 'Musical Artists / Genres', icon: '🎵', placeholder: 'Radiohead' },
  { id: 'art_painting', label: 'Visual Art / Painting', icon: '🎨', placeholder: 'Edward Hopper' },
  { id: 'custom', label: '✨ Custom...', icon: '⚙️', placeholder: 'Graphic Novels' },
];

const MATCHING_ELEMENTS = [
  { id: 'acting', name: 'Acting Style / Emotional Range' },
  { id: 'directing', name: 'Directing Style / Creative Vision' },
  { id: 'actor', name: 'Lead Character Energy / Archetype' },
  { id: 'music_sound', name: 'Music Style / Sonic Soundtrack' },
  { id: 'narrative', name: 'Narrative Pacing & Structural Beats' },
  { id: 'production', name: 'Production Design / Visual Aesthetic' },
  { id: 'theme', name: 'Thematic Depth / Undercurrents' },
  { id: 'custom', name: '✨ + Custom Alignment Element...' },
];

export default function AestheticDNAAlignment({
  userState,
  
}: ToolProps) {
  const [category, setCategory] = useState('movies');
  const [customCategoryText, setCustomCategoryText] = useState('');
  const [useFavorites, setUseFavorites] = useState(true);
  
  // 3 Favorites fields
  const [fav1, setFav1] = useState('');
  const [fav2, setFav2] = useState('');
  const [fav3, setFav3] = useState('');

  // Specific vibe search text
  const [vibePrompt, setVibePrompt] = useState('');

  // Must include constraint
  const [includeKeywords, setIncludeKeywords] = useState('');

  // Exclude constraint 
  const [excludeKeywords, setExcludeKeywords] = useState('');

  // Match Element options
  const [matchingElement, setMatchingElement] = useState('');
  const [customElementText, setCustomElementText] = useState('');

  // Tones
  const [tone, setTone] = useState('');
  const [isCustomTone, setIsCustomTone] = useState(false);
  const [customToneText, setCustomToneText] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DNAAlignmentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasDailyCapError, setHasDailyCapError] = useState(false);

  const handleReset = () => {
    setCategory('movies');
    setCustomCategoryText('');
    setFav1('');
    setFav2('');
    setFav3('');
    setVibePrompt('');
    setIncludeKeywords('');
    setExcludeKeywords('');
    setMatchingElement('');
    setCustomElementText('');
    setTone('');
    setIsCustomTone(false);
    setCustomToneText('');
    setResult(null);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    

    // Validation
    if (category === 'custom') {
      if (!customCategoryText.trim()) {
        setErrorMsg('Please specify a Custom Media Archetype.');
        return;
      }
      const wordCount = customCategoryText.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 4) {
        setErrorMsg('Please keep your Custom Media Archetype brief (2-4 words MAX).');
        return;
      }
    }

    if (useFavorites && !fav1.trim() && !fav2.trim() && !fav3.trim()) {
      setErrorMsg('Please input at least one favorite artwork reference, or toggle references off.');
      return;
    }

    if (!useFavorites && !vibePrompt.trim()) {
      setErrorMsg('Please provide the specific vibe, atmosphere, or prompt you are seeking.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);
    setHasDailyCapError(false);

    const finalTone = isCustomTone ? customToneText.trim() || 'balanced' : (tone || 'default');
    const finalElement = matchingElement === 'custom' ? customElementText.trim() || 'Core Vibe' : (matchingElement || 'production');
    const finalCategory = category === 'custom' ? customCategoryText.trim() || 'custom media' : category;

    try {
      const response = await fetch('/api/generate/aesthetic-curator', {
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
          category: finalCategory,
          useFavorites,
          favorites: [fav1.trim(), fav2.trim(), fav3.trim()].filter(Boolean),
          vibePrompt: vibePrompt.trim(),
          includeKeywords: includeKeywords.trim(),
          excludeKeywords: excludeKeywords.trim(),
          matchingElement: finalElement,
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
      setResult(data.curationResult);
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

  const getCategoryPlaceholderText = () => {
    switch (category) {
      case 'tv_shows':
        return 'e.g., good sci-fi dramas for a rainy Sunday that feel smart but cozy...';
      case 'books':
        return 'e.g., philosophical survival stories similar to Cormac McCarthy...';
      case 'music':
        return 'e.g., melancholy indietronica artists with rich vocal arrangements...';
      case 'art_painting':
        return 'e.g., painters capturing isolated mid-century urban nightscapes...';
      default:
        return 'e.g., good movies for a sleepover with my sisters, or cerebral neo-noirs...';
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
          A database synchronization block has interfered with your secure curation buffer. This protection avoids traffic leaks inside your premium tunnel.
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
      {/* Header */}
      <div className="text-center mb-8 w-full max-w-2xl">
        <span className="text-4xl mb-2.5 block">📽️🎶🎞️📖</span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase mb-1">RECOMMENDATION SPECIALIST</h1>
        <p className="text-xs font-mono text-[var(--text2)] uppercase tracking-wider mb-2">
          (Deep Vibe & Aesthetic Archetype Curator)
        </p>
        <p className="text-sm text-[var(--text2)] max-w-lg mx-auto leading-relaxed">
          Sift beyond superficial genres. Deconstruct favorite media by dynamic creative dimensions, or describe an ultimate mood, to map the precise Aesthetic DNA of what you're seeking.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-7 flex flex-col gap-6 w-full max-w-[640px] shadow-sm">
          
          {/* Media category list */}
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              Select Media Archetype
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {MEDIA_CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  id={`media-category-${item.id}`}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    category === item.id
                      ? 'border-[var(--accent)] bg-[var(--accent)]/[0.05] text-[var(--text)] font-semibold shadow-[0_0_10px_var(--accent-glow)]'
                      : 'border-[var(--border)] bg-[var(--bg2)] text-[var(--text2)] hover:border-border'
                  }`}
                >
                  <span className="text-lg mb-1">{item.icon}</span>
                  <span className="text-[10px] font-medium block whitespace-nowrap overflow-hidden text-ellipsis w-full">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {category === 'custom' && (
              <div className="mt-2 text-left animate-fade-in">
                <label className="font-mono text-[9px] tracking-wider text-[var(--text3)] uppercase block mb-1">
                  Specify Custom Media Archetype (2-4 words MAX)
                </label>
                <input
                  type="text"
                  id="custom-category-input"
                  value={customCategoryText}
                  onChange={(e) => setCustomCategoryText(e.target.value)}
                  placeholder="e.g. Graphic Novels, Indie Video Games, Indie Podcasts..."
                  className="bg-[var(--bg3)] border border-accent rounded-lg p-2.5 text-xs text-[var(--text)] focus:outline-none w-full"
                  required
                />
              </div>
            )}
          </div>

          <hr className="border-[var(--border)]" />

          {/* Reference constraint toggle */}
          <div className="flex items-center justify-between bg-[var(--bg3)] border border-[var(--border)] p-3 rounded-xl">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold font-mono text-[var(--text)] uppercase">Seed with Reference Favorites</span>
              <span className="text-[10px] text-[var(--text2)]">Anchor recommandations with up to three of your favorites</span>
            </div>
            <button
              type="button"
              id="favorites-toggle-btn"
              onClick={() => {
                setUseFavorites(!useFavorites);
                setErrorMsg('');
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                useFavorites ? 'bg-accent' : 'bg-bg3'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bg2 shadow ring-0 transition duration-200 ease-in-out ${
                  useFavorites ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3 Textboxes for favorites if toggled on */}
          {useFavorites && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 animate-fade-in bg-[var(--bg3)] p-4 rounded-xl border border-[var(--border)]">
              <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-3">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text3)]">YOUR 3 FAVORITE REFERENCE WORKS:</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono text-[var(--text2)]">Reference #1</label>
                <input
                  type="text"
                  id="reference-input-1"
                  value={fav1}
                  onChange={(e) => setFav1(e.target.value)}
                  placeholder="e.g. Blade Runner 2049"
                  className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-2.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono text-[var(--text2)]">Reference #2</label>
                <input
                  type="text"
                  id="reference-input-2"
                  value={fav2}
                  onChange={(e) => setFav2(e.target.value)}
                  placeholder="e.g. Interstellar"
                  className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-2.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono text-[var(--text2)]">Reference #3</label>
                <input
                  type="text"
                  id="reference-input-3"
                  value={fav3}
                  onChange={(e) => setFav3(e.target.value)}
                  placeholder="e.g. Arrival"
                  className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-2.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full"
                />
              </div>
            </div>
          )}

          {/* Select matching element if favorites are on */}
          {useFavorites && (
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                Match DNA by Specific Element
              </label>
              <select
                id="matching-element-select"
                value={matchingElement}
                onChange={(e) => {
                  setMatchingElement(e.target.value);
                  setErrorMsg('');
                }}
                className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%239090a8' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundSize: '14px'
                }}
              >
                <option value="">--Select--</option>
                {MATCHING_ELEMENTS.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.name}
                  </option>
                ))}
              </select>

              {matchingElement === 'custom' && (
                <div className="mt-1.5 relative animate-fade-in">
                  <input
                    type="text"
                    id="custom-element-input"
                    value={customElementText}
                    onChange={(e) => setCustomElementText(e.target.value)}
                    placeholder="e.g., Color Palette, Narrative Twist Complexity, Drum beats..."
                    className="bg-[var(--bg3)] border border-accent rounded-lg p-2.5 text-xs text-[var(--text)] focus:outline-none w-full"
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Large text box for specific vibe */}
          <div className="flex flex-col gap-2 w-full">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              {useFavorites ? 'Refine Curation with specific vibe, mood or goal (Optional):' : 'Describe the Specific Vibe, Atmosphere, or Focus Goal:'}
            </label>
            <textarea
              id="vibe-prompt-textarea"
              value={vibePrompt}
              onChange={(e) => setVibePrompt(e.target.value)}
              placeholder={getCategoryPlaceholderText()}
              rows={4}
              required={!useFavorites}
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full resize-y min-h-[100px]"
            />
          </div>

          {/* Must Include & Exclude Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                Must Include (specific attributes/directors)
              </label>
              <input
                type="text"
                id="must-include-input"
                value={includeKeywords}
                onChange={(e) => setIncludeKeywords(e.target.value)}
                placeholder="e.g. Female protagonist, minimal CGI, happy ending"
                className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
                Exclude (things to avoid)
              </label>
              <input
                type="text"
                id="exclude-input"
                value={excludeKeywords}
                onChange={(e) => setExcludeKeywords(e.target.value)}
                placeholder="e.g. Horror, jump scares, tragic endings, gore"
                className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-full"
              />
            </div>
          </div>

          <hr className="border-[var(--border)]" />

          {/* Delivery Tone Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-[11px] tracking-wide text-[var(--text2)] uppercase">
              Curation Narrative Tone
            </label>
            <select
              id="tone-select"
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
                  id="custom-tone-input"
                  value={customToneText}
                  onChange={(e) => setCustomToneText(e.target.value)}
                  placeholder="e.g. enthusiastic art critic, incredibly snobby, cozy..."
                  className="bg-[var(--bg3)] border border-accent rounded-lg p-2.5 text-xs text-[var(--text)] focus:outline-none w-full pr-8"
                  required
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

          

          <button
            type="submit"
            id="curate-submit-btn"
            disabled={loading}
            className={`w-full py-3.5 rounded-lg text-sm font-semibold tracking-wide cursor-pointer text-[var(--text)] transition-all`}
            style={{
              backgroundColor: loading ? '#4a3a5e' : '#9b6cc2',
              opacity: loading ? 0.8 : 1,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(155, 108, 194, 0.35)',
            }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-border/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              'Discover Aesthetic DNA Alignments'
            )}
          </button>

          {errorMsg && (
            <div className="p-3.5 rounded-lg text-xs bg-[rgba(240,78,110,0.1)] border border-[rgba(240,78,110,0.3)] text-accent2 leading-relaxed">
              {errorMsg}
            </div>
          )}
        </form>
      ) : (
        /* ALIGNMENT RESULTS VIEW */
        <div className="w-full max-w-[760px] flex flex-col gap-8">
          
          {/* Top Suggestions Box */}
          <div className="bg-[var(--bg2)] border-2 border-accent/40 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-[var(--border)] pb-3">
              <span className="font-mono text-[9px] uppercase tracking-wider text-text block font-bold">
                🎯 THE RECOMMENDATION SPECIALIST'S TOP SUGGESTIONS
              </span>
              <h2 className="text-xl font-display font-medium text-[var(--text)] mb-1.5 uppercase tracking-wide">
                7-10 ALIGNED MEDIA ALIGNMENTS
              </h2>
              <p className="text-xs text-[var(--text2)] leading-relaxed">
                Here are the selected recommendations matched specifically to your specified media archetype constraints and profile.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {result.quickSuggestions && result.quickSuggestions.length > 0 ? (
                result.quickSuggestions.map((item, idx) => (
                  <div key={idx} className="flex gap-3.5 p-3 rounded-xl bg-[var(--bg3)] border border-[var(--border)] hover:border-accent/40 transition-all">
                    <div className="w-6 h-6 shrink-0 rounded-lg flex items-center justify-center bg-accent/20 font-mono text-[10px] text-text border border-accent/40 font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 flex flex-col gap-1 text-left">
                      <div className="text-xs font-bold text-[var(--text)] flex flex-wrap items-center gap-1.5 leading-tight">
                        {item.title}
                        <span className="text-[10px] font-normal text-[var(--text2)] font-mono">
                          by {item.creator} ({item.releaseYear})
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text2)] leading-relaxed italic">
                        {item.briefConnection}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[var(--text3)] text-center py-4">No suggestions found.</div>
              )}
            </div>
          </div>
          
          {/* High-Level Analysis Overview Card */}
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-text block font-bold mb-1.5">
                🧬 Extracted Aesthetic Profile
              </span>
              <h2 className="text-xl font-display font-medium text-[var(--text)] mb-3 leading-snug">
                {result.extractedAestheticDNA}
              </h2>
              <p className="text-xs text-[var(--text2)] leading-relaxed">
                {result.chosenElementAnalysis}
              </p>
            </div>

            <div className="md:w-56 shrink-0 flex flex-col gap-3.5 bg-[var(--bg3)] border border-[var(--border)] p-4 rounded-xl">
              <span className="font-mono text-[9px] uppercase tracking-wider block text-[var(--text3)]">
                AESTHETIC VIBE STAMPS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.underlyingDNAProfile.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono whitespace-nowrap px-2.5 py-1 rounded-full border border-accent/40 bg-accent/20 text-text"
                  >
                    ✦ {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reset Panel */}
          <div className="flex justify-between items-center bg-[var(--bg2)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-mono text-[var(--text3)] uppercase">ALIGNMENT SELECTION PANEL</span>
              <span className="text-xs font-semibold">
                Category: {(category === 'custom' ? customCategoryText || 'custom media' : category).toUpperCase()} | Element: {useFavorites ? matchingElement.toUpperCase() : 'VIBE PROMPT'}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-mono px-4 py-2 rounded-xl border border-[var(--border)] hover:border-accent/40 hover:text-[var(--accent)] transition-all cursor-pointer bg-transparent"
            >
              Curation Sandbox
            </button>
          </div>

          {/* Recommendation List */}
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg tracking-wider text-text uppercase font-semibold flex items-center gap-2">
              📂 ALIGNED RECOMMENDED WORKS
            </h2>

            <div className="grid grid-cols-1 gap-5">
              {result.recommendations.map((work, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:border-accent/40 transition-all flex flex-col"
                >
                  {/* Top Header Card Info */}
                  <div className="px-5 py-3.5 bg-[var(--bg3)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3.5">
                      <span className="text-xs font-mono font-black text-accent bg-accent/20 px-2 py-0.5 rounded border border-accent/40">
                        MATCH #{idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-[var(--text)]">
                        {work.title} <span className="text-xs font-normal text-[var(--text3)]">({work.releaseYear})</span>
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono uppercase font-semibold text-text3">
                      by {work.creator}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex flex-col gap-4">
                    {/* DNA stamps / vibe key */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[9px] font-mono uppercase bg-bg3 px-2 py-0.5 rounded text-text2 mr-1 self-center">
                        AESTHETIC DNA:
                      </span>
                      {work.aestheticDNA.map((dna, dnaIdx) => (
                        <span key={dnaIdx} className="text-[10px] font-mono tracking-wide px-2 py-0.5 rounded bg-accent2/20 text-accent2 border border-accent2/40">
                          ⚖️ {dna}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-1">
                      {/* Vibe snapshot */}
                      <div className="md:col-span-2 border border-[var(--border)] rounded-xl p-4 bg-accent/5">
                        <span className="text-[9px] font-mono tracking-wider text-accent uppercase font-black block mb-1">
                          VIBE SNAPSHOT:
                        </span>
                        <p className="text-xs font-medium text-[var(--text)] leading-relaxed italic">
                          "{work.keyVibeDesc}"
                        </p>
                      </div>

                      {/* Element alignment justification */}
                      <div className="md:col-span-3 border border-[var(--border)] rounded-xl p-4 bg-success/5">
                        <span className="text-[9px] font-mono tracking-wider text-success uppercase font-black block mb-1">
                          ALIGNMENT JUSTIFICATION ({useFavorites ? matchingElement.toUpperCase() : 'VIBE MATCH'}):
                        </span>
                        <p className="text-xs text-[var(--text2)] leading-relaxed">
                          {work.whyItMatches}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coaching / Deep Curator Note */}
          <div className="bg-[var(--bg2)] border-2 border-accent/40 p-5 rounded-2xl shadow-sm">
            <span className="font-mono text-[9px] text-accent font-bold uppercase tracking-wider block mb-1.5">
              🎓 CURATOR'S INTERPERSONAL SYNAPSE
            </span>
            <div className="text-xs text-[var(--text2)] leading-relaxed">
              <MarkdownRenderer text={result.curationPhilosophy} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
