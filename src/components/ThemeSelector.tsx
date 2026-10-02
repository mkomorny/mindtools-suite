import React, { useState, useEffect, useRef } from 'react';
import { Shuffle, Save, X, Minus } from 'lucide-react';
import { THEMES, ThemeName } from '../types';

interface CustomTheme {
  id: string;
  name: string;
  baseThemeId: string;
  category?: string;
  accent: string;
  accent2: string;
  accent3: string;
}

interface ThemeSelectorProps {
  currentTheme: ThemeName | string;
  onThemeChange: (theme: string) => void;
}

const CATEGORIES_MAPPING: Record<string, string> = {
  custom: 'Custom Themes',
  dark: 'Dark Themes',
  light: 'Light Themes',
  contrasting: 'High Contrast',
  color: 'Vivid Color',
  complimentary: 'Complimentary Themes'
};

const CATEGORY_KEYS: ('custom' | 'dark' | 'light' | 'contrasting' | 'color' | 'complimentary')[] = ['custom', 'dark', 'light', 'contrasting', 'color', 'complimentary'];

const rgbaToHex = (rgba: string) => {
  if (typeof rgba !== 'string') return "#000000";
  const match = rgba.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)/i);
  if (match && match.length === 4) {
    return "#" +
      ("0" + parseInt(match[1], 10).toString(16)).slice(-2) +
      ("0" + parseInt(match[2], 10).toString(16)).slice(-2) +
      ("0" + parseInt(match[3], 10).toString(16)).slice(-2);
  }
  return rgba.length === 7 ? rgba : "#000000";
};

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(() => {
    try {
      const stored = localStorage.getItem('mt_custom_themes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [overrides, setOverrides] = useState<{ accent: string, accent2: string, accent3: string } | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const configRef = useRef<HTMLDivElement>(null);
  const [liveColors, setLiveColors] = useState({ accent: '#ffffff', accent2: '#ffffff', accent3: '#ffffff' });

  useEffect(() => {
    localStorage.setItem('mt_custom_themes', JSON.stringify(customThemes));
  }, [customThemes]);

  useEffect(() => {
    const isCustom = customThemes.find(t => t.id === currentTheme);
    let applyAccent = '';
    let applyAccent2 = '';
    let applyAccent3 = '';

    if (isCustom) {
      document.documentElement.setAttribute('data-theme', isCustom.baseThemeId);
      applyAccent = isCustom.accent;
      applyAccent2 = isCustom.accent2;
      applyAccent3 = isCustom.accent3;
    }

    if (overrides) {
      if (overrides.accent) applyAccent = overrides.accent;
      if (overrides.accent2) applyAccent2 = overrides.accent2;
      if (overrides.accent3) applyAccent3 = overrides.accent3;
    }

    if (applyAccent) document.documentElement.style.setProperty('--accent', applyAccent);
    else document.documentElement.style.removeProperty('--accent');

    if (applyAccent2) document.documentElement.style.setProperty('--accent2', applyAccent2);
    else document.documentElement.style.removeProperty('--accent2');

    if (applyAccent3) document.documentElement.style.setProperty('--accent3', applyAccent3);
    else document.documentElement.style.removeProperty('--accent3');

    const t = setTimeout(() => {
      const styles = getComputedStyle(document.documentElement);
      setLiveColors({
        accent: rgbaToHex(styles.getPropertyValue('--accent').trim()),
        accent2: rgbaToHex(styles.getPropertyValue('--accent2').trim() || styles.getPropertyValue('--accent').trim()),
        accent3: rgbaToHex(styles.getPropertyValue('--accent3').trim() || styles.getPropertyValue('--accent2').trim() || styles.getPropertyValue('--accent').trim()),
      });
    }, 10);
    return () => clearTimeout(t);
  }, [currentTheme, customThemes, overrides]);

  useEffect(() => {
    setOverrides(null);
    setShowConfig(false);
  }, [currentTheme]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (configRef.current && !configRef.current.contains(event.target as Node)) {
        setShowConfig(false);
      }
    }
    if (showConfig) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showConfig]);

  const handleRandomTheme = () => {
    if (THEMES.length === 0) return;
    const randomIndex = Math.floor(Math.random() * THEMES.length);
    onThemeChange(THEMES[randomIndex].id);
  };

  const handleColorChange = (key: 'accent' | 'accent2' | 'accent3', value: string) => {
    setOverrides(prev => ({
      accent: prev?.accent || liveColors.accent,
      accent2: prev?.accent2 || liveColors.accent2,
      accent3: prev?.accent3 || liveColors.accent3,
      [key]: value
    }));
    setShowConfig(true);
  };

  const handleSaveCustom = () => {
    if (!overrides) return;
    const baseThemeId = customThemes.find(t => t.id === currentTheme)?.baseThemeId || currentTheme;
    const finalBase = baseThemeId.startsWith('custom_') ? THEMES[0].id : baseThemeId;

    const newId = `custom_${Date.now()}`;
    const newTheme: CustomTheme = {
      id: newId,
      name: `Custom Mix ${customThemes.length + 1}`,
      category: 'custom',
      baseThemeId: finalBase,
      accent: overrides.accent,
      accent2: overrides.accent2,
      accent3: overrides.accent3
    };

    setCustomThemes(prev => [...prev, newTheme]);
    onThemeChange(newId);
    setShowConfig(false);
  };

  const deleteCustomTheme = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCustomThemes(prev => prev.filter(t => t.id !== id));
    if (currentTheme === id) onThemeChange('default');
  };

  const activeThemeIndex = THEMES.findIndex((t) => t.id === currentTheme);
  const activeBaseCategory = activeThemeIndex !== -1 ? THEMES[activeThemeIndex].category : 'custom';

  const getThemeSwatches = () => {
    const styles = getComputedStyle(document.documentElement);
    const swatches: { color: string; label: string }[] = [];
    const seenHex = new Set<string>();

    const addSwatch = (cssVar: string, label: string) => {
      const val = styles.getPropertyValue(cssVar).trim();
      if (!val) return;
      const hex = rgbaToHex(val).toLowerCase();
      if (hex && hex !== '#000000' && !seenHex.has(hex)) {
        seenHex.add(hex);
        swatches.push({ color: hex, label });
      }
    };

    addSwatch('--accent', 'Primary Accent');
    addSwatch('--accent2', 'Secondary Accent');
    addSwatch('--accent3', 'Tertiary Accent');

    if (swatches.length < 2) {
      const acc2 = rgbaToHex(styles.getPropertyValue('--accent2').trim() || styles.getPropertyValue('--accent').trim());
      if (rgbaToHex(styles.getPropertyValue('--accent').trim()) !== acc2) swatches.push({ color: acc2, label: 'Secondary Accent' });
    }
    return swatches;
  };

  return (
    <div className="flex items-center gap-x-1 sm:gap-x-2 bg-[var(--bg3)] px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-[var(--border)] shrink-0 select-none relative z-50">
      <span style={{ fontSize: '9px' }} className="hidden lg:inline font-mono font-black tracking-widest text-[var(--text3)] uppercase">
        THEME
      </span>

      <div className="relative flex items-center gap-x-1 sm:gap-x-1.5">
        <select
          value={currentTheme}
          onChange={(e) => onThemeChange(e.target.value)}
          className="appearance-none font-sans font-normal py-1 pl-2.5 pr-14 bg-[var(--bg)] hover:bg-[var(--bg2)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]/50 rounded-lg cursor-pointer outline-none transition-all w-[100px] xs:w-[130px] sm:w-[180px] md:w-[220px] truncate"
          style={{
            fontSize: '11px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
            backgroundSize: '12px', backgroundPosition: 'calc(100% - 6px) center', backgroundRepeat: 'no-repeat'
          }}
        >
          {CATEGORY_KEYS.map((catKey) => {
            if (catKey === 'custom') {
              if (customThemes.length === 0) return null;
              return (
                <optgroup key="custom" label="Custom Themes" className="bg-[var(--bg2)] text-[var(--text3)] font-mono text-[10px] font-bold uppercase tracking-wider p-2">
                  {customThemes.map(ct => <option key={ct.id} value={ct.id} className="bg-[var(--bg)] text-accent font-sans text-xs font-bold py-1.5">{ct.name}</option>)}
                </optgroup>
              );
            }
            const list = THEMES.filter((t) => t.category === catKey);
            if (!list.length) return null;
            return (
              <optgroup key={catKey} label={`${CATEGORIES_MAPPING[catKey]} (${list.length})`} className="bg-[var(--bg2)] text-[var(--text3)] font-mono text-[10px] font-bold uppercase tracking-wider p-2">
                {list.map((theme) => <option key={theme.id} value={theme.id} className="bg-[var(--bg)] text-[var(--text)] font-sans text-xs font-medium py-1.5">{theme.name}</option>)}
              </optgroup>
            );
          })}
        </select>
        
        {currentTheme.startsWith('custom_') && (
           <button onClick={(e) => deleteCustomTheme(currentTheme, e)} className="absolute right-14 top-1/2 -translate-y-1/2 text-danger hover:text-danger p-1 hover:bg-bg3 rounded z-10">
             <Minus size={11} strokeWidth={4} />
           </button>
        )}

        <button type="button" onClick={handleRandomTheme} style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)' }} className="p-1 rounded text-[var(--text3)] hover:text-[var(--accent)] hover:bg-[var(--bg3)] transition-all cursor-pointer flex items-center justify-center shrink-0 z-10">
          <Shuffle className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative w-[50px] sm:w-[70px]" ref={configRef}>
        <div className="flex items-center justify-start gap-1 sm:gap-1.5 px-0.5 sm:px-1 shrink-0 p-1 rounded-lg hover:bg-[var(--border)]/30 transition-colors cursor-pointer overflow-hidden" onClick={() => setShowConfig(!showConfig)}>
          {getThemeSwatches().map((swatch, idx) => (
            <span key={idx} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shrink-0 transition-all duration-300 shadow-[0_0_8px_rgba(0,0,0,0.5)] border border-[var(--border)] hover:scale-110" style={{ backgroundColor: swatch.color }} title={swatch.label} />
          ))}
        </div>

        {showConfig && (
          <div className="absolute top-full right-0 mt-2 bg-[var(--bg2)] border border-[var(--border)] rounded-xl shadow-2xl p-4 w-64 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text2)]">Theme Colors</span>
              <button onClick={() => setShowConfig(false)} className="text-[var(--text3)] hover:text-[var(--text)]"><X size={14} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--text3)]">Primary Accent</span>
                <input type="color" value={liveColors.accent} onChange={(e) => handleColorChange('accent', e.target.value)} className="w-8 h-8 rounded appearance-none cursor-pointer border-0 p-0 overflow-hidden bg-transparent" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--text3)]">Secondary Accent</span>
                <input type="color" value={liveColors.accent2} onChange={(e) => handleColorChange('accent2', e.target.value)} className="w-8 h-8 rounded appearance-none cursor-pointer border-0 p-0 overflow-hidden bg-transparent" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--text3)]">Tertiary Accent</span>
                <input type="color" value={liveColors.accent3} onChange={(e) => handleColorChange('accent3', e.target.value)} className="w-8 h-8 rounded appearance-none cursor-pointer border-0 p-0 overflow-hidden bg-transparent" />
              </div>
            </div>

            {overrides && (
              <button onClick={handleSaveCustom} className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30 border border-[var(--accent)]/50 text-[var(--accent)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer">
                <Save size={14} /> Save as Custom
              </button>
            )}
          </div>
        )}
      </div>

      <span className="text-[10px] text-[var(--text3)] font-sans shrink-0 hidden md:inline-block ml-1 font-normal w-[100px] text-right truncate" style={{ fontFamily: 'system-ui', fontWeight: 'normal' }}>
        {activeThemeIndex !== -1 ? activeThemeIndex + 1 : (THEMES.length + customThemes.length)} / {THEMES.length + customThemes.length} · {activeBaseCategory.toUpperCase()}
      </span>
    </div>
  );
}
