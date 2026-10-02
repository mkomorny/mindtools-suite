import React, { useState } from 'react';
import { UserState } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { Sparkles, Copy, Check, Trash2, ArrowRight, ShieldAlert, BookOpen } from 'lucide-react';

interface PromptForgerProps {
  userState: UserState;
  
  
  
  
}

const STRATEGY_OPTIONS = [
  'Memory Extraction',
  'Writing Style Analysis',
  'Research Instructions',
  'Chain-of-Thought Reasoning',
  'Roleplay Framework',
  'Code Generation/Audit',
  'Structural Synthesis'
];

const TARGET_MODELS = [
  'Gemini 3.5 Pro',
  'Gemini 3.5 Flash',
  'Gemini 3.5 Flash Lite',
  'Claude Sonnet 4.6',
  'Claude Opus 4.8',
  'Grok 4.3 Beta',
  'Grok Fast',
  'Grok Expert',
  'Nano Banana Pro',
  'Nano Banana',
  'Imagen 4'
];

const TONE_TEMPLATES = [
  { id: 'default', name: 'Standard Prompt Design', emoji: '⚙️' },
  { id: 'condescending', name: 'Strict & Demanding', emoji: '🙄' },
  { id: 'boston', name: 'Boston Accent System', emoji: '🦞' },
  { id: 'potty-mouth', name: 'Swore-Filled / Vulgar', emoji: '🤬' }
];

const PROMPT_PRESETS = [
  { name: 'Select a Preset Draft...', text: '' },
  { name: '🧠 Memory Extraction', text: 'Extract all critical project timelines, security constraints, and responsible team leads from our raw documentation. Enforce zero-hallucination rules: if any metadata or requested detail is not explicitly stated in the source text, strictly output [NULL] and cite the exact paragraph anchor where searching stopped.' },
  { name: '✍️ Writing Style Analysis', text: 'Perform a comprehensive linguistic assessment of this text. Analyze the vocabulary density, sentence length variation patterns, punctuation cadences, and key tonal markers. Use this fingerprint to draft a follow-up partnership announcement maintaining the identical stylistic profile.' },
  { name: '🔬 Research Instructions', text: 'Evaluate the feasibility of switching our core production cluster to edge-native data reconciliation layers. Outline the main architectural arguments, construct a systematic Devil\'s Advocate cross-examination challenging every security assumption, and provide a balanced structural matrix.' },
  { name: '💭 Chain-of-Thought Reasoning', text: 'Determine the absolute best failover pattern when multiple key APIs experience database reconnection locks. Mandate that you must perform your entire step-by-step logic and hypothesis testing within an explicit, visible <thinking> container before delivering the final architecture layout.' },
  { name: '📊 Research & Report Instructions', text: 'Take the following topic and draft an executive-level research report. Enforce clear structural bounds including an Executive Summary, Key Findings, a rigorous Comparative Analysis, and tactical Strategic Recommendations.' },
  { name: '🌐 Deep Research Instructions', text: 'Conduct an intensive, high-effort, multi-layered deep research analysis of this topic. Instruct the model to systematically map the subject from multiple competing angles, explicitly look for conflicting data points or cognitive biases in the source material, cross-reference historical context and trends, and synthesize an exhaustive breakdown.' },
  { name: '⚙️ Systematic Framework Builder', text: 'Deconstruct this core concept into a rigorous, step-by-step structural framework. Isolate all relevant variables, design sequential mechanical stages, and map out feedback loops or procedural cycles to support highly technical execution.' }
];

export default function PromptForger({ userState }: PromptForgerProps) {
  const [roughNotes, setRoughNotes] = useState('');
  const [strategy, setStrategy] = useState(STRATEGY_OPTIONS[0]);
  const [targetModel, setTargetModel] = useState(TARGET_MODELS[0]);
  const [selectedTone, setSelectedTone] = useState('default');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const getMetaStrategy = (model: string) => {
    switch (model) {
      case 'Gemini 3.5 Pro':
        return '💡 Meta-Strategy: Why this works for Gemini 3.5 Pro: Leverages massive 2M-token context capability with structured headings to absorb files, datasets, and codebase references seamlessly without attention drift.';
      case 'Gemini 3.5 Flash':
        return '💡 Meta-Strategy: Why this works for Gemini 3.5 Flash: Prioritizes rapid instruction parsing and distinct horizontal breaklines to maximize cost-efficiency and sub-second generation speeds.';
      case 'Gemini 3.5 Flash Lite':
        return '💡 Meta-Strategy: Why this works for Gemini 3.5 Flash Lite: Compacts the parameter boundaries using clear role-definition anchors to avoid conversational overhead on ultra-fast lightweight processing layers.';
      case 'Claude Sonnet 4.6':
        return '💡 Meta-Strategy: Why this works for Claude Sonnet 4.6: Heavy reliance on strict XML tags define high-fidelity boundaries for systemic prompts, while trailing pre-filled response formats guarantee zero conversational bloat.';
      case 'Claude Opus 4.8':
        return '💡 Meta-Strategy: Why this works for Claude Opus 4.8: Forces multi-node XML scoping and highly directive tones to trigger maximum logical reasoning and nuanced creative capability.';
      case 'Grok 4.3 Beta':
        return '💡 Meta-Strategy: Why this works for Grok 4.3 Beta: Uses punchy, flat structural layers and explicit real-time search directives to synthesize pre-trained data side-by-side with fresh web streams.';
      case 'Grok Fast':
        return '💡 Meta-Strategy: Why this works for Grok Fast: Flat, declarative orders combined with minimalistic syntax maximize parallel parsing speeds and instant real-time lookup updates.';
      case 'Grok Expert':
        return '💡 Meta-Strategy: Why this works for Grok Expert: Declarative structure coupled with Devils-Advocate cross-examination instructions triggers Grok\'s deep context reasoning capabilities.';
      case 'Nano Banana Pro':
        return '💡 Meta-Strategy: Why this works for Nano Banana Pro: Hyper-concise command sentences and strict top/bottom rule-sandwiching mitigate instruction loss commonly seen inside smaller local models.';
      case 'Nano Banana':
        return '💡 Meta-Strategy: Why this works for Nano Banana: Absolutely strips out decorative syntax and word bloat to ensure the highest functional token density on resource-constrained edge systems.';
      case 'Imagen 4':
        return '💡 Meta-Strategy: Why this works for Imagen 4: Reorganizes abstract logical criteria into descriptive comma-separated metadata. Forces a strict subject-first, lighting-centric, style-last sequence that matches diffusion neural weights perfectly.';
      default:
        return '💡 Meta-Strategy: Reorganizes abstract parameters into highly systematic instructions engineered specifically for the target LLM architecture.';
    }
  };

  const handleForge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roughNotes.trim()) return;

    

    setLoading(true);
    setApiError(null);
    setResult('');

    try {
      const response = await fetch('/api/generate/prompt-forge', {
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
          roughNotes,
          strategy,
          targetModel,
          tone: selectedTone,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        if (errJson.error === 'LIMIT_REACHED') {
          
          return;
        }
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json()
      setResult(data.text || '');
      } catch (err: any) {
      console.error('Error generating mega-prompt:', err);
      setApiError(err.message || 'Failed to connect to the compilation agent.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  const handleClear = () => {
    setRoughNotes('');
    setResult('');
    setApiError(null);
  };

  return (
    <div id="prompt-forge-root" className="flex flex-col gap-6 animate-fade-in text-[var(--text)]">
      
      {/* HEADER ROW */}
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-[var(--text)]">
            MEGA-PROMPT FORGER
          </h2>
        </div>
        <p className="text-xs text-[var(--text2)] leading-relaxed max-w-3xl">
          Instantly transform unoptimized user ideas, draft prompts, or messy notes into highly structured, robust, and production-ready "Mega-Prompts" tailored specifically for your target model's training paradigms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PARAMS & INPUT FORM (5 cols) */}
        <form onSubmit={handleForge} className="lg:col-span-5 flex flex-col gap-5 bg-[var(--bg2)] border border-[var(--border)] p-5 rounded-2xl">
          
          <div className="flex items-center gap-2 text-[var(--accent)] mb-1">
            <Sparkles size={16} />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Forge Parameters
            </span>
          </div>

          {/* Presets Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="prompt-preset-select" className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--accent)] flex items-center gap-1">
              📁 Quick Presets (Optional)
            </label>
            <select
              id="prompt-preset-select"
              value={PROMPT_PRESETS.find(p => p.text === roughNotes)?.text ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setRoughNotes(val);
                const preset = PROMPT_PRESETS.find(p => p.text === val);
                if (preset) {
                  if (preset.name.includes('Memory Extraction')) {
                    setStrategy('Memory Extraction');
                  } else if (preset.name.includes('Writing Style')) {
                    setStrategy('Writing Style Analysis');
                  } else if (preset.name.includes('Research')) {
                    setStrategy('Research Instructions');
                  } else if (preset.name.includes('Chain-of-Thought')) {
                    setStrategy('Chain-of-Thought Reasoning');
                  } else if (preset.name.includes('Systematic Framework')) {
                    setStrategy('Structural Synthesis');
                  } else {
                    setStrategy('Structural Synthesis');
                  }
                }
              }}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text)] focus:border-[var(--accent)] outline-none cursor-pointer"
            >
              {PROMPT_PRESETS.map((p) => (
                <option key={p.name} value={p.text}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prompt / Rough Notes Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--text2)]">
              Raw Prompt, Draft, or Core Objective
            </label>
            <textarea
              id="raw-prompt-textarea"
              value={roughNotes}
              onChange={(e) => {
                setRoughNotes(e.target.value);
                // Default to a general profile if they start editing custom
                if (!PROMPT_PRESETS.some(p => p.text === e.target.value)) {
                  setStrategy('Structural Synthesis');
                }
              }}
              placeholder="Paste your raw prompt, rough notes, or core objective here..."
              className="w-full min-h-[160px] bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text)] placeholder:text-[var(--text3)] focus:border-[var(--accent)] focus:outline-none transition-colors leading-relaxed select-text"
              required
            />
          </div>

          {/* Target Model dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--text2)]">
              Select Target Model Optimizer
            </label>
            <select
              id="target-model-select"
              value={targetModel}
              onChange={(e) => setTargetModel(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text)] focus:border-[var(--accent)] outline-none cursor-pointer"
            >
              {TARGET_MODELS.map((model) => (
                <option key={model} value={model}>
                  🤖 {model}
                </option>
              ))}
            </select>
          </div>



          {/* Control Buttons */}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="submit"
              id="forge-prompt-btn"
              disabled={loading || !roughNotes.trim()}
              className="flex-1 py-3 bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 disabled:opacity-40 border border-[var(--accent)]/50 text-[var(--accent)] rounded-xl font-bold text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_20px_var(--accent-glow)]"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Compiling...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Forge Mega-Prompt
                </>
              )}
            </button>

            {roughNotes && (
              <button
                type="button"
                onClick={handleClear}
                className="h-10.5 w-10.5 flex items-center justify-center bg-[var(--bg3)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text2)] rounded-xl transition-colors cursor-pointer"
                title="Clear Workspace"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>



        </form>

        {/* COMPREHENSIVE OUTPUT WINDOW (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-5 min-h-[460px]">
          
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--text2)]">
              <BookOpen size={14} className="text-[var(--accent)]" />
              <span>Optimized Production Output</span>
            </div>

            {result && (
              <button
                onClick={handleCopy}
                id="copy-prompt-btn"
                className="px-3 py-1.5 bg-[var(--bg3)] border border-[var(--border)] text-xs text-[var(--text2)] hover:text-[var(--text)] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-[var(--success)]" />
                    <span className="text-[var(--success)] font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Work Output Renderer */}
          <div className="flex-1 flex flex-col justify-between">
            
            {loading ? (
              <div id="forge-loader" className="flex flex-col gap-4 py-24 text-center text-[var(--text3)] justify-center items-center flex-1">
                <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-2" />
                <p className="font-mono text-xs tracking-wider uppercase animate-pulse">
                  Analyzing architecture parameters...
                </p>
                <p className="text-xs max-w-sm mx-auto text-[var(--text3)] leading-relaxed">
                  Tailoring formatting tags, system constraints, and rules sequencing for <strong className="text-[var(--text2)]">{targetModel}</strong> using the <strong className="text-[var(--text2)]">{strategy}</strong> profile.
                </p>
              </div>
            ) : apiError ? (
              <div className="flex flex-col items-center justify-center text-center text-danger py-24 gap-3 flex-1 select-text">
                <ShieldAlert size={40} className="stroke-[1.5]" />
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-xs uppercase tracking-wider font-bold">
                    Forger Dispatch Error
                  </p>
                  <p className="text-xs text-[var(--text2)] max-w-md mx-auto leading-relaxed">
                    {apiError}
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="flex flex-col gap-4 flex-1">
                {/* Clean markdown rendering Inside card container */}
                <div 
                  id="prompt-result-view" 
                  className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4.5 font-mono text-xs leading-relaxed max-h-[600px] overflow-y-auto select-text tracking-wide whitespace-pre-wrap font-sans"
                >
                  <MarkdownRenderer text={result} />
                </div>

                {/* Highly descriptive Meta-Strategy breakdown */}
                <div className="bg-[var(--bg2)]/60 border border-[var(--border)] rounded-xl p-4 text-xs font-medium text-[var(--text2)] italic leading-relaxed">
                  {getMetaStrategy(targetModel)}
                </div>
              </div>
            ) : (
              <div id="forge-placeholder" className="flex flex-col items-center justify-center text-center text-[var(--text3)] py-32 gap-4 flex-1">
                <span className="text-5xl opacity-40">🔥</span>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-xs uppercase tracking-wider font-bold">
                    Compiler Awaiting Input
                  </p>
                  <p className="text-xs text-[var(--text2)] max-w-xs leading-relaxed mt-1">
                    Provide raw prompt nodes, select your strategy profile, name your target target optimizer, and hit <strong className="text-[var(--text)]">Forge Mega-Prompt</strong> to re-compile.
                  </p>
                </div>
              </div>
            )}
            
          </div>

        </div>

      </div>

    </div>
  );
}
