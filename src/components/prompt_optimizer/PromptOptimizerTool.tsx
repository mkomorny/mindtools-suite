import React, { useState, useEffect } from "react";
import ModelSelector from "./ModelSelector";
import OutputView from "./OutputView";
import HistoryList from "./HistoryList";
import { TARGET_MODELS, QUICK_START_TEMPLATES } from "./data";
import { ActionMode, HistoryItem } from "./types";
import { Terminal, Cpu, Flame, ChevronRight, ChevronLeft, Play, Pause, Layers, Activity, Sliders } from "lucide-react";

// Assuming UserState is available in the main app
import { UserState } from "../../types";

interface PromptOptimizerToolProps {
  userState: UserState;
}

export default function PromptOptimizerTool({ userState }: PromptOptimizerToolProps) {
  // Configured inputs
  const [selectedModelId, setSelectedModelId] = useState<string>("claude-artifacts");
  const [selectedActionMode, setSelectedActionMode] = useState<ActionMode>("Translation");
  const [rawInput, setRawInput] = useState<string>(
    "A cinematic wide shot of an abandoned orbital space station decaying in the atmosphere of a gas giant."
  );

  // Result output states
  const [finalPrompt, setFinalPrompt] = useState<string>("");
  const [structuralScore, setStructuralScore] = useState<number>(0);
  const [adherenceMetrics, setAdherenceMetrics] = useState<string[]>([]);
  const [explanation, setExplanation] = useState<string>("");

  // Loading, progress, and error feedback states
  const [isForging, setIsForging] = useState<boolean>(false);
  const [forgingStep, setForgingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Archive history items state
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Expandable telemetry details logs state
  const [isLogExpanded, setIsLogExpanded] = useState<boolean>(false);
  
  // Real-time toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interface view & custom cockpit styling states
  const [density, setDensity] = useState<"compact" | "expanded">("expanded");
  const [isBlueprintsExpanded, setIsBlueprintsExpanded] = useState<boolean>(false);

  // Slide carousel indices
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Slide category topics list
  const SLIDE_TOPICS = [
    "General Writing & Daily Planning",
    "Simple Coding & Layouts",
    "Relaxed Media & Creative Pursuits"
  ];

  // Auto-play interval triggers
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Autohide toast notifications
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load history log archive on initialization
  useEffect(() => {
    try {
      const stored = localStorage.getItem("prompt_forge_sequence_archive");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load prompt forge archive history", err);
    }
  }, []);

  // Micro status logging loop when compiling
  useEffect(() => {
    if (!isForging) {
      setForgingStep("");
      return;
    }

    const steps = [
      "Analyzing your prompt structure...",
      "Matching guidelines for this AI...",
      "Refining step-by-step labels...",
      "Removing negative commands...",
      "Structuring prompt roles...",
      "Finalizing optimal prompt text..."
    ];

    let currentIdx = 0;
    setForgingStep(steps[0]);

    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % steps.length;
      setForgingStep(steps[currentIdx]);
    }, 1100);

    return () => clearInterval(interval);
  }, [isForging]);

  // Execute forge translation sequence
  const handleForgeExecute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rawInput.trim()) return;

    setIsForging(true);
    setIsLogExpanded(true);
    setError(null);

    // Get legible target model metadata
    const activeModel = TARGET_MODELS.find((m) => m.id === selectedModelId);
    const targetModelName = activeModel ? activeModel.name : selectedModelId;

    try {
      const response = await fetch("/api/popro_forge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'X-User-API-Key': userState?.apiKey || '',
          'X-Provider': userState?.provider || 'google',
          'X-Selected-Model': userState?.model || selectedModelId || 'auto',
        },
        body: JSON.stringify({
          targetModel: selectedModelId,
          actionMode: selectedActionMode,
          rawInput: rawInput,
          clientApiKey: userState?.apiKey || '',
          clientProvider: userState?.provider || 'google',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Setup state parameters
      setFinalPrompt(data.finalPrompt || "");
      setStructuralScore(data.structuralScore ?? 85);
      setAdherenceMetrics(data.adherenceMetrics || []);
      setExplanation(data.explanation || "");

      // Clipboard trigger and real-time success notification toast
      if (data.finalPrompt) {
        navigator.clipboard.writeText(data.finalPrompt)
          .then(() => {
            setToastMessage(`⚡ Prompt optimized and auto-copied to clipboard! [Score: ${data.structuralScore ?? 85}%]`);
          })
          .catch(() => {
            setToastMessage(`⚡ Prompt optimized successfully! [Score: ${data.structuralScore ?? 85}%]`);
          });
      }

      // Create new sequence archive item
      const newLogItem: HistoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        targetModel: selectedModelId,
        actionMode: selectedActionMode,
        rawInput: rawInput,
        finalPrompt: data.finalPrompt || "",
        explanation: data.explanation || "",
        structuralScore: data.structuralScore ?? 85,
        adherenceMetrics: data.adherenceMetrics || [],
      };

      // Push and persist to localStorage
      const updatedHistory = [newLogItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("prompt_forge_sequence_archive", JSON.stringify(updatedHistory));

    } catch (err: any) {
      console.error("Execution error during compilation", err);
      setError(err.message || "An unexpected network or syntax engine compilation error occurred.");
    } finally {
      setIsForging(false);
    }
  };

  // Reload history log frames back into current interactive variables
  const handleSelectHistory = (item: HistoryItem) => {
    setSelectedModelId(item.targetModel);
    setSelectedActionMode(item.actionMode);
    setRawInput(item.rawInput);
    setFinalPrompt(item.finalPrompt);
    setStructuralScore(item.structuralScore);
    setAdherenceMetrics(item.adherenceMetrics);
    setExplanation(item.explanation);
    setError(null);
  };

  // Delete a specific saved sequence
  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((i) => i.id !== id);
    setHistory(updated);
    localStorage.setItem("prompt_forge_sequence_archive", JSON.stringify(updated));
  };

  // Clear all saved log archives
  const handleClearAllHistory = () => {
    if (window.confirm("Purge prompt forge sequence archive? This action cannot be undone.")) {
      setHistory([]);
      localStorage.removeItem("prompt_forge_sequence_archive");
    }
  };

  // Select quick prefilled templates
  const handleApplyTemplate = (template: typeof QUICK_START_TEMPLATES[0]) => {
    setSelectedModelId(template.targetModel);
    setSelectedActionMode(template.actionMode);
    setRawInput(template.rawInput);
  };

  const handleToggleFavorite = () => {
    if (!finalPrompt) return;
    
    // find the current one by finalPrompt or just update the most recent one if it matches
    const updatedHistory = history.map((item) => {
      if (item.finalPrompt === finalPrompt) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });
    
    // If it's not in history for some reason (shouldn't happen), we could add it, but it should be
    setHistory(updatedHistory);
    localStorage.setItem("prompt_forge_sequence_archive", JSON.stringify(updatedHistory));
  };

  const selectedModelObj = TARGET_MODELS.find((m) => m.id === selectedModelId);

  // Check if current finalPrompt is favorite
  const isCurrentFavorite = history.some(item => item.finalPrompt === finalPrompt && item.isFavorite);

  return (
    <div className="flex-1 flex flex-col text-[var(--text)] font-sans overflow-x-hidden">
      {/* Dynamic Style Injection for absolute theme fidelity across all sub-modules */}
      <style>{`
        :root {
          --theme-primary: var(--accent);
          --theme-primary-hover: var(--accent2);
        }

        /* Override core Tailwind color utilities dynamically */
        .text-cyan-400 { color: var(--theme-primary) !important; }
        .text-cyan-300 { color: var(--theme-primary-hover) !important; }
        .text-cyan-200 { color: var(--theme-primary-hover) !important; }
        .text-cyan-500 { color: var(--theme-primary) !important; }
        .text-cyan-450 { color: var(--theme-primary) !important; }
        
        .bg-cyan-500 { background-color: var(--theme-primary) !important; }
        .bg-cyan-650 { background-color: var(--theme-primary) !important; }
        .bg-cyan-600 { background-color: var(--theme-primary) !important; }
        .bg-cyan-550 { background-color: var(--theme-primary) !important; }
        .bg-cyan-500\\/20 { background-color: color-mix(in srgb, var(--theme-primary) 20%, transparent) !important; }
        .bg-cyan-500\\/10 { background-color: color-mix(in srgb, var(--theme-primary) 10%, transparent) !important; }
        .bg-cyan-950\\/20 { background-color: color-mix(in srgb, var(--theme-primary) 8%, transparent) !important; }
        .bg-cyan-950\\/25 { background-color: color-mix(in srgb, var(--theme-primary) 10%, transparent) !important; }
        .bg-cyan-950\\/60 { background-color: color-mix(in srgb, var(--theme-primary) 25%, transparent) !important; }
        .bg-cyan-900 { background-color: color-mix(in srgb, var(--theme-primary) 25%, transparent) !important; }
        .bg-[var(--bg3)] { background-color: color-mix(in srgb, var(--theme-primary) 10%, transparent) !important; }
        
        .hover\\:bg-cyan-500:hover { background-color: var(--theme-primary-hover) !important; }
        .hover\\:from-cyan-900:hover { background-image: linear-gradient(to right, color-mix(in srgb, var(--theme-primary) 35%, transparent), var(--tw-gradient-to, var(--tw-gradient-stops))) !important; }
        
        .border-cyan-400\\/40 { border-color: color-mix(in srgb, var(--theme-primary) 40%, transparent) !important; }
        .border-cyan-400\\/50 { border-color: color-mix(in srgb, var(--theme-primary) 50%, transparent) !important; }
        .border-cyan-500\\/30 { border-color: color-mix(in srgb, var(--theme-primary) 30%, transparent) !important; }
        .border-cyan-800\\/40 { border-color: color-mix(in srgb, var(--theme-primary) 20%, transparent) !important; }
        .border-cyan-500 { border-color: var(--theme-primary) !important; }
        
        .focus\\:ring-cyan-500\\/30:focus { --tw-ring-color: color-mix(in srgb, var(--theme-primary) 30%, transparent) !important; }
        
        .shadow-\\[0_0_12px_rgba\\(34\\,211\\,238\\,0\\.15\\)\\] { box-shadow: 0 0 12px color-mix(in srgb, var(--theme-primary) 25%, transparent) !important; }
        .shadow-\\[0_0_10px_rgba\\(34\\,211\\,238\\,0\\.3\\)\\] { box-shadow: 0 0 10px color-mix(in srgb, var(--theme-primary) 40%, transparent) !important; }
        .shadow-\\[0_4px_25px_rgba\\(8\\,145\\,178\\,0\\.25\\)\\] { box-shadow: 0 4px 25px color-mix(in srgb, var(--theme-primary) 20%, transparent) !important; }
        .shadow-\\[0_0_15px_rgba\\(6\\,182\\,212\\,0\\.15\\)\\] { box-shadow: 0 0 15px color-mix(in srgb, var(--theme-primary) 15%, transparent) !important; }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)  !important; }
        
        /* Loading state animation */
        .border-t-cyan-400 { border-top-color: var(--theme-primary) !important; }
      `}
      </style>

      <div className={`flex-1 max-w-7xl w-full mx-auto ${density === "compact" ? "p-2.5 sm:p-4 space-y-4" : "p-4 sm:p-6 lg:p-8 space-y-8"}`}>
        
        {/* VISUAL & INTERFACE STYLE COCKPIT PANEL */}
        <div className={`grid grid-cols-1 md:grid-cols-1 gap-4 bg-[var(--bg2)] border border-[var(--border)] rounded-xl ${density === "compact" ? "p-3" : "p-4"} shadow-lg relative`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--text2)] font-bold flex items-center gap-1.5" style={{ fontFamily: 'system-ui', marginLeft: '5px' }}>
                <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Layout Style
              </span>
              <p className="text-[9px] text-[var(--text2)] font-sans hidden sm:block" style={{ fontFamily: 'system-ui', marginLeft: '5px' }}>
                Choose between compact or spacious layouts
              </p>
            </div>
            
            <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg border border-[var(--border)] w-full sm:w-auto max-w-[240px]">
              <button
                type="button"
                onClick={() => setDensity("compact")}
                className={`py-1 px-3 text-[9px] uppercase tracking-wider rounded transition-all duration-150 cursor-pointer ${
                  density === "compact" 
                    ? "bg-cyan-950/20 text-cyan-400 border border-cyan-800/40 font-bold" 
                    : "text-[var(--text2)] hover:text-[var(--text)]"
                }`}
                style={{ fontFamily: 'system-ui' }}
              >
                Compact
              </button>
              <button
                type="button"
                onClick={() => setDensity("expanded")}
                className={`py-1 px-3 text-[9px] uppercase tracking-wider rounded transition-all duration-150 cursor-pointer ${
                  density === "expanded" 
                    ? "bg-cyan-950/20 text-cyan-400 border border-cyan-800/40 font-bold" 
                    : "text-[var(--text2)] hover:text-[var(--text)]"
                }`}
                style={{ fontFamily: 'system-ui' }}
              >
                Expanded
              </button>
            </div>
          </div>
        </div>

        {/* TOP LEVEL DYNAMIC CAROUSEL SECTION: QUICK STARTS */}
        <div className="space-y-3 bg-[var(--bg2)] border border-[var(--border)] rounded-xl p-3 shadow-inner transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mr-1">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-1 font-bold" style={{ fontFamily: 'system-ui' }}>
                  <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Try Quick-Start Presets
                </span>
                {isBlueprintsExpanded && (
                  <span className="text-[8px] bg-slate-900 border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text2)] font-mono tracking-widest uppercase">
                    Slide {currentSlideIndex + 1} of 3
                  </span>
                )}
              </div>
              {isBlueprintsExpanded && (
                <h4 className="text-[10px] font-mono font-semibold text-[var(--text2)] flex items-center gap-1 uppercase tracking-wide">
                  <Layers className="w-3 h-3 text-[var(--text2)] shrink-0" /> Focus: {SLIDE_TOPICS[currentSlideIndex]}
                </h4>
              )}
            </div>

            {/* Carousel Controls & Minimize Trigger */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {isBlueprintsExpanded && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] uppercase tracking-wider border transition-colors cursor-pointer ${
                      isPlaying 
                        ? "bg-cyan-950/20 border-cyan-800/50 text-cyan-400 hover:bg-cyan-950/40" 
                        : "bg-slate-900/50 border-[var(--border)] text-[var(--text2)] hover:text-[var(--text)]"
                    }`}
                    title={isPlaying ? "Pause auto-rotation" : "Resume auto-rotation"}
                    style={{ fontFamily: 'system-ui' }}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-2.5 h-2.5 text-cyan-400" />
                        <span className="text-[8px]">Autoplay On</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 text-[var(--text2)]" />
                        <span className="text-[8px]">Autoplay Off</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center bg-slate-950 border border-[var(--border)] p-0.5 rounded">
                    <button
                      type="button"
                      onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + 3) % 3)}
                      className="p-1 px-2 rounded hover:bg-slate-900 hover:text-white text-[var(--text2)] transition-colors cursor-pointer"
                      title="Previous slide"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <div className="w-px h-3 bg-slate-800"></div>
                    <button
                      type="button"
                      onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % 3)}
                      className="p-1 px-2 rounded hover:bg-slate-900 hover:text-white text-[var(--text2)] transition-colors cursor-pointer"
                      title="Next slide"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Toggle Trigger */}
              <button
                type="button"
                onClick={() => setIsBlueprintsExpanded(!isBlueprintsExpanded)}
                className="px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider border border-[var(--border)] bg-slate-900 hover:bg-slate-850 text-slate-350 cursor-pointer"
              >
                {isBlueprintsExpanded ? "Hide Presets" : "Show Presets"}
              </button>
            </div>
          </div>

          {isBlueprintsExpanded && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Slide item grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                {QUICK_START_TEMPLATES.slice(currentSlideIndex * 5, (currentSlideIndex + 1) * 5).map((tpl, i) => {
                  const active = selectedModelId === tpl.targetModel && rawInput === tpl.rawInput;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className={`text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer flex flex-col justify-between h-20 hover:-translate-y-0.5 ${
                        active
                          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] shadow-[0_0_12px_rgba(34,211,238,0.15)] text-[var(--text)]"
                          : "border-[var(--border)] bg-[var(--bg3)] text-[var(--text2)] hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <h5 className="text-[10px] font-bold tracking-tight text-[var(--text)] line-clamp-1 font-display">
                          {tpl.title}
                        </h5>
                        <p className="text-[9px] text-[var(--text2)] line-clamp-1">
                          {tpl.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center justify-between w-full text-[8px] font-mono text-[var(--text2)]">
                        <span className="uppercase tracking-wider">{tpl.actionMode.replace(" Prompt", "")}</span>
                        <span className="text-cyan-500/80 uppercase font-bold text-[7px]">{tpl.targetModel.split("-")[0]}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Slide Indicator Navigation Bar */}
              <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-[var(--border)]">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`w-4 h-1.5 rounded transition-all duration-300 ${
                      currentSlideIndex === idx
                        ? "bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.6)] w-6"
                        : "bg-slate-800 hover:bg-slate-650"
                    }`}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* WORKSPACE SECTOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT AREA: Selectors & Core Input Channel */}
          <div className="lg:col-span-12 space-y-8">
            <div className={`bg-[var(--bg2)] border border-[var(--border)] rounded-2xl relative ${density === "compact" ? "p-4 sm:p-5" : "p-5 sm:p-6"} shadow-2xl`}>
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
              
              {/* Embed selectors inside the layout securely */}
              <ModelSelector
                selectedModelId={selectedModelId}
                onSelectModel={setSelectedModelId}
                selectedActionMode={selectedActionMode}
                onSelectActionMode={setSelectedActionMode}
              />

              {/* CORE RAW INPUT TEXT PANEL */}
              <div className={`pt-4 border-t border-[var(--border)] ${density === "compact" ? "space-y-2 mt-4" : "space-y-4 mt-8"}`}>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-[var(--text2)] uppercase tracking-[0.2em] flex items-center gap-1.5" style={{ marginLeft: '5px' }}>
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span style={{ fontFamily: 'system-ui' }}>Your Draft Prompt</span>
                  </label>
                  <span className="text-[10px] text-[var(--text2)]" style={{ fontFamily: 'system-ui', marginLeft: '0px', marginRight: '5px' }}>
                    Characters: {rawInput.length} | Words: {rawInput.split(/\\s+/).filter(Boolean).length}
                  </span>
                </div>

                <div className="relative group rounded-xl overflow-hidden border border-[var(--border)] w-full" style={{ marginLeft: '5px' }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none opacity-20"></div>
                  <textarea
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder="Enter raw prompt intent description, requirements, or outline here..."
                    className={`w-full ${density === "compact" ? "min-h-[100px] p-3 text-xs" : "min-h-[140px] p-4 text-xs sm:text-sm"} bg-[var(--bg3)] border-0 text-cyan-100 placeholder:text-[var(--text3)] focus:outline-none focus:ring-1 focus:ring-cyan-500/30 leading-relaxed resize-y select-all select-scrollbar`}
                    style={{ fontFamily: 'system-ui' }}
                  />
                </div>

                {/* ERROR COMPILATION BOX */}
                {error && (
                  <div className="bg-rose-950/20 border border-rose-800/80 p-4 rounded-xl text-xs text-rose-300 font-mono flex gap-3 leading-relaxed">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1 animate-pulse"></div>
                    <div>
                      <strong className="text-white uppercase tracking-wider block mb-0.5">ERROR DETECTED:</strong>
                      {error}
                    </div>
                  </div>
                )}

                {/* EXECUTE INTERACTIVE FORGE TRIGGER */}
                <button
                  onClick={() => handleForgeExecute()}
                  disabled={isForging || !rawInput.trim()}
                  type="button"
                  className={`w-full ${density === "compact" ? "py-2.5" : "py-4"} bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-[0.25em] rounded-xl shadow-[0_4px_25px_rgba(8,145,178,0.25)] transition-all duration-300 flex items-center justify-center gap-3 select-none ${
                    isForging ? "opacity-60 cursor-not-allowed bg-slate-800 hover:bg-slate-800 shadow-none" : "cursor-pointer active:scale-[0.99]"
                  }`}
                  style={{ fontFamily: 'system-ui', marginLeft: '5px' }}
                >
                  {isForging ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin"></div>
                      <span className="text-cyan-400 text-[10px] uppercase font-bold tracking-widest">{forgingStep}</span>
                    </>
                  ) : (
                    <>
                      <span>OPTIMIZE PROMPT</span>
                      <ChevronRight className="w-4 h-4 text-cyan-200" />
                    </>
                  )}
                </button>

                {/* Optional Collapse Toggle for Diagnostic Metrics & History Logs */}
                <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setIsLogExpanded(!isLogExpanded)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] tracking-wider text-[var(--text2)] hover:text-[var(--text)] bg-slate-950 hover:bg-slate-900 border border-[var(--border)] cursor-pointer transition-all duration-150"
                    style={{ marginTop: '1px', marginBottom: '6px' }}
                  >
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span style={{ fontFamily: 'system-ui' }}>{isLogExpanded ? "Hide" : "Show"} Saved History & Stats ({history.length})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT AREA / METRICS PREVIEW & SAVED LOG ARCHIVE */}
          {isLogExpanded && (
            <div className="lg:col-span-12 space-y-8 animate-in fade-in duration-300">
              
              {/* Show Results if we have output OR if loading */}
              {(finalPrompt || isForging) && (
                <div className="transition-all duration-300">
                  {isForging ? (
                    <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-6 h-[300px]">
                      <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 animate-spin"></div>
                        <Cpu className="w-5 h-5 text-cyan-400 absolute animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-cyan-400 animate-pulse font-bold">
                          {forgingStep}
                        </span>
                        <p className="text-[10px] text-[var(--text2)] font-sans max-w-sm leading-normal">
                          Our AI helper is working to format and improve your draft prompt using recommended guidelines.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <OutputView
                      finalPrompt={finalPrompt}
                      rawInput={rawInput}
                      structuralScore={structuralScore}
                      adherenceMetrics={adherenceMetrics}
                      explanation={explanation}
                      targetModelName={selectedModelObj ? selectedModelObj.name : "Target Engine"}
                      isFavorite={isCurrentFavorite}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  )}
                </div>
              )}

              {/* Save logs history database */}
              <HistoryList
                history={history}
                onSelectHistory={handleSelectHistory}
                onDeleteHistory={handleDeleteHistory}
                onClearAll={handleClearAllHistory}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Clipboard Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-50 bg-[var(--bg2)] border border-[var(--accent)] text-white px-4 py-3 rounded-xl shadow-[0_4px_30px_rgba(6,182,212,0.15)] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm sm:max-w-md">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shrink-0 animate-pulse" />
          <p className="text-[11px] font-mono leading-relaxed antialiased text-cyan-200">
            {toastMessage}
          </p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[var(--text2)] hover:text-white font-bold font-mono text-xs ml-auto cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
