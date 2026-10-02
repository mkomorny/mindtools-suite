/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeName, ToolId, UserState } from './types';
import { Header } from './components/Header';
import SteelmanMachine from './components/SteelmanMachine';
import ApologyCrafter from './components/ApologyCrafter';
import FeedbackDial from './components/FeedbackDial';
import ToneTranslator from './components/ToneTranslator';
import AvoiderTool from './components/AvoiderTool';
import CommAssistant from './components/CommAssistant';
import Eli5Machine from './components/Eli5Machine';
import VentSession from './components/VentSession';
import LingoLeverage from './components/LingoLeverage';
import ConversationSimulator from './components/ConversationSimulator';
import CognitiveBiasAuditor from './components/CognitiveBiasAuditor';
import SubtextReadout from './components/SubtextReadout';
import AestheticDNAAlignment from './components/AestheticDNAAlignment';
import LyricsGenerator from './components/LyricsGenerator';
import ContextSwitcher from './components/ContextSwitcher';
import PromptForger from './components/PromptForger';
import PromptOptimizerTool from './components/prompt_optimizer/PromptOptimizerTool';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem('mt_theme') || 'cyberpunk';
  });

  const [currentTool, setCurrentTool] = useState<ToolId>('home');

  const [userState, setUserState] = useState<UserState>(() => {
    let apiKey = '';
    let provider = 'google';
    let model = 'auto';
    try {
      const keysStr = localStorage.getItem('mt_api_keys') || '[]';
      const keys = JSON.parse(keysStr);
      const selectedId = localStorage.getItem('mt_selected_key_id') || '';
      const modelId = localStorage.getItem('mt_selected_model_id') || '';
      const activeKey = keys.find((k: any) => k.id === selectedId);
      if (activeKey) {
        apiKey = activeKey.apiKey || '';
        provider = activeKey.provider || 'google';
        model = activeKey.selectedModel || modelId || 'auto';
      } else if (modelId) {
        model = modelId;
      }
    } catch (e) {
      console.warn("Could not parse api keys from storage:", e);
    }

    return {
      apiKey,
      provider,
      model,
    };
  });

  // Sync API keys and other userState fields on custom/storage updates
  useEffect(() => {
    const syncState = () => {
      let apiKey = '';
      let provider = 'google';
      let model = 'auto';
      try {
        const keysStr = localStorage.getItem('mt_api_keys') || '[]';
        const keys = JSON.parse(keysStr);
        const selectedId = localStorage.getItem('mt_selected_key_id') || '';
        const modelId = localStorage.getItem('mt_selected_model_id') || '';
        const activeKey = keys.find((k: any) => k.id === selectedId);
        if (activeKey) {
          apiKey = activeKey.apiKey || '';
          provider = activeKey.provider || 'google';
          model = activeKey.selectedModel || modelId || 'auto';
        } else if (modelId) {
          model = modelId;
        }
      } catch (e) {
        console.warn("Sync: Could not parse api keys from storage:", e);
      }

      setUserState(prev => ({
        ...prev,
        apiKey,
        provider,
        model,
      }));
    };

    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);
  }, []);

  

  

  const canGenerate = true;

  // Apply theme class to root element
  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme === 'default') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', currentTheme);
    }
    localStorage.setItem('mt_theme', currentTheme);
  }, [currentTheme]);

  return (
    <div className="relative min-h-screen flex flex-col z-10">
      
      {/* ── TOP BAR ── */}
      <Header theme={currentTheme} setTheme={setCurrentTheme} />

      {/* ── MAIN PAGES ── */}
      <main className="flex-1 flex flex-col">
        
        {/* HOME PAGE */}
        {currentTool === 'home' && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-5 max-w-5xl mx-auto text-center gap-5">
            <h1 className="font-sans font-bold text-5xl sm:text-7xl leading-[1.05] tracking-wide text-[var(--text)] uppercase max-w-3xl">
              Mind Tools<br />
              <span className="text-3xl sm:text-5xl text-[var(--accent)] italic normal-case lowercase font-sans font-medium tracking-[0px]">Think Sharper</span>
            </h1>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-8">
              <button
                onClick={() => setCurrentTool('steelman')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">🖋️</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">Steelman Machine</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Get an opposing view to an idea.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('apology')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">🙏</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">Apology Crafter</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Draft an apology for a specific situation.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('feedback')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">🎚️</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">Feedback Dial</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Adjust the tone of your feedback.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('translator')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">🔄</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">Tone Translator</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Rewrite a message in a different style.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('avoider')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">🚫</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">Avoid AI Writing</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Rewrite text to remove common AI phrases.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('comm-assistant')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">💬</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">Communication Assistant</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Draft messages for various situations.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('eli5')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">🦖</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">ELI5 Translator</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Get a simple explanation for a complex topic.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('vent')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">💔❓🗑️</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">Vent Session</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Write your thoughts and receive advice before sending a message.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('lingo')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">📙</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">Lingo Leverage</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Learn the terminology and concepts for a new hobby or industry.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('simulator')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">💬📱📧📞</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">Conversation Simulator</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Practice a conversation and see potential responses.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('bias-auditor')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">🧠🔍</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">Cognitive Bias Auditor</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Check arguments for logical flaws.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('subtext-readout')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">💬🔎</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">The Subtext Read-out</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Analyze text messages for meanings and get reply suggestions.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('aesthetic-curator')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">📽️🎶🎞️📖</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">Recommendation Specialist</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Get recommendations for media based on style.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('lyrics-generator')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">🎶📝</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">LYRICS GENERATOR</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Write song lyrics in a specific genre.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('context-switcher')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">🔄🗣️</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">CONTEXT SWITCHER</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Rewrite information for a different audience.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('prompt-forge')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">🔥🎯</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">MEGA-PROMPT FORGER</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Turn ideas into a detailed prompt for AI.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTool('prompt-optimizer')}
                className="group relative overflow-hidden border border-[var(--border)] rounded-2xl p-6 text-left shadow-lg transition-all hover:scale-[1.015] cursor-pointer flex flex-col justify-between min-h-[180px]"
                style={{ 
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--bg2)), color-mix(in srgb, var(--accent2) 5%, var(--bg3)))' 
                }}
              >
                {/* Soft Ambient Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none" 
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="bg-[var(--bg3)] w-max p-3 rounded-2xl mb-4 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-colors">
                    <span className="text-2xl block">🔧✨</span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] tracking-wider bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent uppercase mb-2 group-hover:from-[var(--accent)] group-hover:to-[var(--accent2)] transition-all">PROMPT OPTIMIZER V2</h3>
                  <p className="font-sans text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors leading-relaxed">
                    Advanced AI-to-AI prompt translation and engineering layer.
                  </p>
                </div>
              </button>
            </div>

            {/* Status indicators */}
            <p className="font-mono text-[10px] text-[var(--success)] mt-6 uppercase tracking-wider bg-[rgba(62,207,142,0.08)] border border-[var(--success)]/20 px-4 py-2 rounded-xl">
              
            </p>
          </div>
        )}

        {/* STEELMAN PAGE */}
        {currentTool === 'steelman' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <SteelmanMachine
              userState={userState}
              
            />
          </div>
        )}

        {/* APOLOGY PAGE */}
        {currentTool === 'apology' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <ApologyCrafter
              userState={userState}
              
            />
          </div>
        )}

        {/* FEEDBACK PAGE */}
        {currentTool === 'feedback' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <FeedbackDial
              userState={userState}
              
            />
          </div>
        )}

        {/* TRANSLATOR PAGE */}
        {currentTool === 'translator' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <ToneTranslator
              userState={userState}
              
            />
          </div>
        )}

        {/* AVOIDER PAGE */}
        {currentTool === 'avoider' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <AvoiderTool
              userState={userState}
              
            />
          </div>
        )}

        {/* COMM ASSISTANT PAGE */}
        {currentTool === 'comm-assistant' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <CommAssistant
              userState={userState}
              
            />
          </div>
        )}

        {/* ELI5 MACHINE PAGE */}
        {currentTool === 'eli5' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <Eli5Machine
              userState={userState}
              
            />
          </div>
        )}

        {/* VENT SESSION PAGE */}
        {currentTool === 'vent' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <VentSession
              userState={userState}
              
            />
          </div>
        )}

        {/* LINGO LEVERAGE PAGE */}
        {currentTool === 'lingo' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <LingoLeverage
              userState={userState}
              
            />
          </div>
        )}

        {/* CONVERSATION SIMULATOR PAGE */}
        {currentTool === 'simulator' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <ConversationSimulator
              userState={userState}
              
            />
          </div>
        )}

        {/* COGNITIVE BIAS AUDITOR PAGE */}
        {currentTool === 'bias-auditor' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <CognitiveBiasAuditor
              userState={userState}
              
            />
          </div>
        )}

        {/* SUBTEXT READOUT PAGE */}
        {currentTool === 'subtext-readout' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <SubtextReadout
              userState={userState}
              
            />
          </div>
        )}

        {/* AESTHETIC DNA ALIGNMENT PAGE */}
        {currentTool === 'aesthetic-curator' && (
          <div className="py-10 px-5 max-w-4xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <AestheticDNAAlignment
              userState={userState}
              
            />
          </div>
        )}

        {/* LYRICS GENERATOR PAGE */}
        {currentTool === 'lyrics-generator' && (
          <div className="py-10 px-5 max-w-5xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <LyricsGenerator
              userState={userState}
              
            />
          </div>
        )}

        {/* CONTEXT SWITCHER PAGE */}
        {currentTool === 'context-switcher' && (
          <div className="py-10 px-5 max-w-5xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <ContextSwitcher
              userState={userState}
              
            />
          </div>
        )}

        {/* PROMPT FORGER PAGE */}
        {currentTool === 'prompt-forge' && (
          <div className="py-10 px-5 max-w-5xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <PromptForger
              userState={userState}
              
            />
          </div>
        )}

        {/* PROMPT OPTIMIZER PAGE */}
        {currentTool === 'prompt-optimizer' && (
          <div className="py-10 px-5 max-w-5xl mx-auto w-full flex flex-col">
            <button onClick={() => setCurrentTool('home')} className="flex items-center gap-2 text-xs text-[var(--text2)] hover:text-[var(--accent)] transition-colors self-start mb-6 cursor-pointer">
              ← Back
            </button>
            <PromptOptimizerTool
              userState={userState}
            />
          </div>
        )}

      </main>

    </div>
  );
}
