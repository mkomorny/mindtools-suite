import React, { useState, useEffect, useRef } from 'react';
import { Key, X, Check, Trash2, ChevronDown, Plus } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { CostTrackerDashboard } from './CostTrackerDashboard';
import { getDefaultModelsForProvider } from '../lib/modelReference';

const PROVIDERS = [
  { id: 'google', name: 'Google (Gemini)' },
  { id: 'anthropic', name: 'Anthropic (Claude)' },
  { id: 'xai', name: 'xAI (Grok)' },
  { id: 'custom', name: 'Custom' }
];

interface SavedKey {
  id: string;
  name: string;
  apiKey: string;
  provider: string;
  createdAt: number;
  selectedModel?: string;
}

interface HeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
};

export function Header({ theme, setTheme }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedKeys, setSavedKeys] = useState<SavedKey[]>(() => {
    try {
      const stored = localStorage.getItem('mt_api_keys');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedKeyId, setSelectedKeyId] = useState<string>(() => {
    return localStorage.getItem('mt_selected_key_id') || '';
  });

  const [customName, setCustomName] = useState('');
  const [apiKeyVal, setApiKeyVal] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [showKeyVal, setShowKeyVal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [keyIdConfirmDelete, setKeyIdConfirmDelete] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'keys' | 'cost'>('keys');

  const [availableModels, setAvailableModels] = useState<{name: string, displayName: string, description?: string}[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    const defaults = getDefaultModelsForProvider(selectedProvider);
    // Always allow "auto" as a choice for task-based selection
    const withAuto = [{ name: 'auto', displayName: 'Auto (best for task)', description: 'Automatically pick the best model for the current tool' }, ...defaults];
    setAvailableModels(withAuto);
    // default to auto when picking a new provider in the add form
    setSelectedModel('auto');
  }, [selectedProvider]);

  const fetchModelsForApiKey = async (key: string, provider: string) => {
    if (!key || key.trim().length < 10) return;
    setIsLoadingModels(true);
    try {
      const response = await fetch('/api/list-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientApiKey: key.trim(), clientProvider: provider })
      });
      if (!response.ok) throw new Error('Failed to fetch available models');
      const data = await response.json()
      if (data.models && Array.isArray(data.models) && data.models.length > 0) {
        setAvailableModels(data.models);
        if (!data.models.some((m: any) => m.name === selectedModel)) {
          setSelectedModel(data.models[0].name);
        }
      }
    } catch (err: any) {
      console.warn("Could not list models:", err.message);
      const defaults = getDefaultModelsForProvider(provider);
      setAvailableModels(defaults);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    if (apiKeyVal.trim().length <= 20) return;
    const timer = setTimeout(() => {
      fetchModelsForApiKey(apiKeyVal, selectedProvider);
    }, 800);
    return () => clearTimeout(timer);
  }, [apiKeyVal, selectedProvider]);

  const handleUpdateKeyModel = (keyId: string, model: string) => {
    const updated = savedKeys.map(k => {
      if (k.id === keyId) return { ...k, selectedModel: model };
      return k;
    });
    setSavedKeys(updated);
    if (keyId === selectedKeyId) {
      localStorage.setItem('mt_selected_model_id', model);
      window.dispatchEvent(new Event('storage'));
    }
  };

  useEffect(() => {
    localStorage.setItem('mt_api_keys', JSON.stringify(savedKeys));
  }, [savedKeys]);

  useEffect(() => {
    localStorage.setItem('mt_selected_key_id', selectedKeyId);
    const activeKey = savedKeys.find(k => k.id === selectedKeyId);
    if (activeKey) {
      const modelToSet = activeKey.selectedModel || 'auto';
      localStorage.setItem('mt_selected_model_id', modelToSet);
      window.dispatchEvent(new Event('storage'));
    }
  }, [selectedKeyId, savedKeys]);

  useEffect(() => {
    if (savedKeys.length > 0) {
      const exists = savedKeys.some(k => k.id === selectedKeyId);
      if (!exists) setSelectedKeyId(savedKeys[0].id);
    } else {
      setSelectedKeyId('');
    }
  }, [savedKeys, selectedKeyId]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null);

    if (!customName.trim()) { setFormError('Please enter a custom name.'); return; }
    if (!apiKeyVal.trim()) { setFormError('Please enter your API Key.'); return; }

    const newKey: SavedKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: customName.trim(),
      apiKey: apiKeyVal.trim(),
      provider: selectedProvider,
      createdAt: Date.now(),
      selectedModel: selectedModel
    };

    const nextKeys = [...savedKeys, newKey];
    setSavedKeys(nextKeys);
    setSelectedKeyId(newKey.id);

    setCustomName(''); setApiKeyVal(''); setSelectedProvider('google'); setShowKeyVal(false); setFormError(null);
  };

  const handleDeleteKey = (idToDelete: string) => {
    if (keyIdConfirmDelete === idToDelete) {
      const nextKeys = savedKeys.filter(k => k.id !== idToDelete);
      setSavedKeys(nextKeys);
      if (selectedKeyId === idToDelete) setSelectedKeyId(nextKeys.length > 0 ? nextKeys[0].id : '');
      setKeyIdConfirmDelete(null);
    } else {
      setKeyIdConfirmDelete(idToDelete);
      setTimeout(() => {
        setKeyIdConfirmDelete(prev => prev === idToDelete ? null : prev);
      }, 4000);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsModalOpen(false); };
    if (isModalOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-all w-full">
        <div className="font-display text-2xl text-[var(--text)] flex items-center gap-2">
          🧠 <span className="text-[var(--text)] uppercase tracking-wider">Mind<span className="text-[var(--accent)]">Tools</span></span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 bg-[var(--bg3)] hover:opacity-85 border border-[var(--border)] px-2 py-1.5 rounded-lg transition-all text-xs font-bold text-[var(--text)] cursor-pointer shrink-0"
            >
              <Key size={12} className="text-[var(--accent)] shrink-0" />
              <span className="tracking-wide uppercase font-mono text-[var(--text2)] hidden xs:inline" style={{ fontSize: '9px' }}>API Keys</span>
              {/* No startup "ask for key" ping - user can add keys anytime via the button */}
            </button>
            {savedKeys.find(k => k.id === selectedKeyId) && (
              <span style={{ fontSize: '8px' }} className="font-mono font-black uppercase text-[var(--success)] select-none tracking-wider flex items-center gap-1 mt-0.5 animate-pulse">
                ● {savedKeys.find(k => k.id === selectedKeyId)?.name}
              </span>
            )}
          </div>
          <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[var(--bg2)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-[var(--text)] custom-scroll"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
              <div className="flex items-center gap-2.5">
                <Key className="text-[var(--accent)]" size={20} />
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-normal uppercase text-[var(--accent)] tracking-wide leading-tight">
                    API SETUP & COST TRACKER
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-[var(--text3)] font-mono uppercase">
                    SECURE SYSTEM CREDENTIALS & BILLING DASHBOARD
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg3)] p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap border-b border-[var(--border)]/60 mb-5 gap-2">
              <button
                onClick={() => setModalTab('keys')}
                className={`pb-2 px-3 text-[10px] font-black uppercase font-mono tracking-widest border-b-2 cursor-pointer transition-all ${
                  modalTab === 'keys' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text3)] hover:text-[var(--text)]'
                }`}
              >
                🔑 Credentials Setup
              </button>
              <button
                onClick={() => setModalTab('cost')}
                className={`pb-2 px-3 text-[10px] font-black uppercase font-mono tracking-widest border-b-2 cursor-pointer transition-all ${
                  modalTab === 'cost' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text3)] hover:text-[var(--text)]'
                }`}
              >
                📊 Cost & Usage Metrics
              </button>
            </div>

            {modalTab === 'cost' ? (
              <CostTrackerDashboard />
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-[var(--text3)] font-mono mb-2.5">
                    Saved API Keys ({savedKeys.length})
                  </h3>
                  {savedKeys.length === 0 ? (
                    <div className="p-4 bg-[var(--bg3)]/60 border border-[var(--border)]/80 border-dashed rounded-xl text-center text-xs text-[var(--text3)] font-mono">
                      No saved keys found. Register a key below to begin.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1.5 custom-scroll">
                      {savedKeys.map((k) => {
                        const isActive = k.id === selectedKeyId;
                        const providerObj = PROVIDERS.find(p => p.id === k.provider);
                        const modelToUse = k.selectedModel || 'auto';
                        return (
                          <div 
                            key={k.id}
                            className={`flex flex-col p-3 rounded-xl border transition-all ${
                              isActive ? 'bg-[var(--accent)]/10 border-[var(--accent)]/40 shadow-sm' : 'bg-[var(--bg3)]/40 border-[var(--border)]/50 hover:border-[var(--border)]'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex-1 min-w-0 pr-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs sm:text-sm text-[var(--text)] truncate">{k.name}</span>
                                  {isActive && (
                                    <span className="text-[9px] font-mono font-black uppercase text-[var(--accent)] bg-[var(--accent)]/20 px-1.5 py-0.5 rounded-full animate-pulse">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-[var(--text3)] font-mono truncate">{providerObj?.name || k.provider}</p>
                                <p className="text-[10px] text-[var(--text3)] font-mono mt-0.5">{k.apiKey.substring(0, 4)}••••••••{k.apiKey.substring(k.apiKey.length - 4)}</p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {!isActive && (
                                  <button
                                    onClick={() => setSelectedKeyId(k.id)}
                                    className="text-[10px] font-bold uppercase font-mono px-2 py-1 rounded bg-[var(--bg3)] hover:opacity-80 transition-colors text-[var(--text2)] cursor-pointer"
                                  >
                                    Select
                                  </button>
                                )}
                                {isActive && (
                                  <div className="w-6 h-6 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center">
                                    <Check size={11} strokeWidth={3} />
                                  </div>
                                )}
                                <button
                                  onClick={() => handleDeleteKey(k.id)}
                                  className={`p-1.5 rounded-md transition-all duration-250 cursor-pointer flex items-center gap-1.5 ${
                                    keyIdConfirmDelete === k.id ? 'text-danger bg-danger/20 border border-danger/40 px-2' : 'text-[var(--text3)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/15'
                                  }`}
                                >
                                  {keyIdConfirmDelete === k.id && <span className="text-[10px] font-bold font-mono tracking-wider uppercase animate-pulse">Confirm?</span>}
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-[var(--border)]/40 flex items-center justify-between gap-4">
                              <span className="text-[9px] font-mono uppercase text-[var(--text3)] tracking-wider shrink-0 flex items-center gap-1">
                                🤖 Selected Model:
                              </span>
                              <div className="relative flex-1 max-w-[240px]">
                                <select
                                  value={modelToUse}
                                  onChange={(e) => handleUpdateKeyModel(k.id, e.target.value)}
                                  className="w-full bg-[var(--bg3)] border border-[var(--border)]/80 rounded-lg pl-2 pr-7 py-0.5 text-[10px] font-mono text-[var(--text)] hover:border-[var(--accent)] focus:outline-none transition-colors appearance-none cursor-pointer"
                                >
                                  <option value="auto">Auto (Task Based)</option>
                                  {modelToUse !== 'auto' && <option value={modelToUse} disabled>{modelToUse.split('/').pop() || modelToUse}</option>}
                                  {getDefaultModelsForProvider(k.provider).filter(item => item.name !== modelToUse && item.name !== 'auto').map(item => (
                                    <option key={item.name} value={item.name}>{item.displayName}</option>
                                  ))}
                                </select>
                                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text3)] pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveKey} className="border-t border-[var(--border)]/85 pt-5 font-sans">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-[var(--text3)] font-mono mb-2">Register New Key profile</h3>
                  {formError && <div className="mb-3 px-3 py-1.5 rounded-lg bg-danger/20 border border-danger/40 text-[11px] text-danger font-medium">⚠️ {formError}</div>}

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-[var(--text3)] mb-1">API Provider</label>
                      <div className="relative">
                        <select
                          value={selectedProvider}
                          onChange={(e) => setSelectedProvider(e.target.value)}
                          className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-sans text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none"
                        >
                          {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text3)] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-[var(--text3)] mb-1">Custom Name</label>
                      <input
                        type="text" required placeholder="e.g. My Studio Key" value={customName} onChange={(e) => setCustomName(e.target.value)}
                        className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text3)]/60 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-[var(--text3)] mb-1">API Key Value</label>
                      <div className="relative">
                        <input
                          type={showKeyVal ? 'text' : 'password'} required placeholder="Insert secret API key here" value={apiKeyVal} onChange={(e) => setApiKeyVal(e.target.value)}
                          className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl pl-3 pr-10 py-2 text-xs font-mono focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text3)]/50"
                        />
                        <button type="button" onClick={() => setShowKeyVal(!showKeyVal)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text3)] hover:text-[var(--text)] p-1 transition-colors cursor-pointer">
                          <span className="text-[10px] uppercase font-bold">{showKeyVal ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-[var(--text3)]">Select Active Model</label>
                        {isLoadingModels && <span className="text-[9px] font-mono text-[var(--accent)] animate-pulse">Fetching...</span>}
                      </div>
                      <div className="relative">
                        <select
                          value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-sans text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer"
                        >
                          {availableModels.map((m) => (
                            <option key={m.name} value={m.name} title={m.description}>{m.displayName}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text3)] pointer-events-none" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 border border-[var(--accent)]/50 text-[var(--accent)] hover:opacity-90 active:scale-[0.98] text-[11px] font-bold uppercase tracking-wide py-2.5 rounded-xl transition-all shadow-md shadow-[var(--accent-glow)] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} strokeWidth={2.5} /> Save Key
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
