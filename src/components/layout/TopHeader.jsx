import React, { useState, useEffect } from 'react';
import {
  Search,
  Bot,
  RefreshCw,
  Shield,
  Layers,
  HelpCircle,
  Play
} from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { MethodologyModal } from '../common/MethodologyModal';
import { ResilienceAPI } from '../../services/api';

export const TopHeader = () => {
  const {
    activeRole,
    setActiveRole,
    setIsSearchModalOpen,
    isCopilotDrawerOpen,
    setIsCopilotDrawerOpen,
    isWalkthroughOpen,
    setIsWalkthroughOpen,
    lastRecalculatedTime,
    simulateTelemetrySync,
    resetDemoState
  } = useRiskStore();

  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    ResilienceAPI.checkHealth().then(online => {
      if (isMounted) setIsBackendOnline(online);
    });
    const interval = setInterval(() => {
      ResilienceAPI.checkHealth().then(online => {
        if (isMounted) setIsBackendOnline(online);
      });
    }, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const roles = ['CISO', 'CFO', 'SecOps', 'Compliance'];

  return (
    <>
      <header className="h-16 bg-[#0c0e14]/95 backdrop-blur-md border-b border-white/[0.08] px-6 flex items-center justify-between z-30 sticky top-0 select-none">
        {/* ================================================================= */}
        {/* ZONE 1: LEFT — IDENTITY                                           */}
        {/* ================================================================= */}
        <div className="flex items-center space-x-3.5 min-w-max">
          <div className="w-8 h-8 rounded-lg bg-[#141722] border border-white/[0.12] flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-tight text-white">ResilienceOS</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-normal leading-tight mt-0.5">
              FintechCore Systems <span className="text-zinc-600">·</span> <span className="text-zinc-500">PS 26105</span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ZONE 2: CENTER — SYSTEM CONTEXT (Subtle, non-competing pill)     */}
        {/* ================================================================= */}
        <div className="hidden xl:flex items-center bg-[#12141c] border border-white/[0.06] rounded-full px-4 py-1.5 space-x-3 text-xs shadow-inner">
          {/* Engine Status */}
          <div className="flex items-center space-x-2" title={isBackendOnline ? 'Authoritative Node.js Decision Engine API connected' : 'Local In-Browser Decision Engine active (Demo Fallback)'}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackendOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-[11px] text-zinc-400">
              Engine: <strong className="text-zinc-200 font-medium ml-0.5">FAIR Quantitative</strong>
              <span className={`text-[9px] uppercase tracking-wider font-mono font-medium ml-1.5 px-1.5 py-0.5 rounded border ${isBackendOnline ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-300 bg-amber-500/10 border-amber-500/20'}`}>
                {isBackendOnline ? 'API Connected' : 'Local Fallback'}
              </span>
            </span>
          </div>

          <div className="h-3 w-px bg-white/[0.08]" />

          {/* Snapshot Status & Telemetry Rescan */}
          <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400">
            <span>Snapshot:</span>
            <span className="font-mono text-zinc-300 font-medium">{lastRecalculatedTime}</span>
            <button
              onClick={simulateTelemetrySync}
              title="Rescan simulated telemetry"
              className="p-1 hover:text-white text-zinc-400 hover:bg-white/[0.06] rounded transition-colors ml-0.5"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="h-3 w-px bg-white/[0.08]" />

          {/* Methodology Modal Trigger */}
          <button
            onClick={() => setIsMethodologyOpen(true)}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-medium transition-colors flex items-center space-x-1 hover:underline underline-offset-2"
          >
            <HelpCircle className="w-3 h-3 text-amber-400/80" />
            <span>Methodology</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* ZONE 3: RIGHT — ACTIONS & CONTROLS                                */}
        {/* ================================================================= */}
        <div className="flex items-center space-x-3">
          {/* Global Search Command Bar */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="hidden lg:flex items-center justify-between w-56 h-9 px-3 rounded-lg bg-[#12141c] hover:bg-[#171924] border border-white/[0.08] hover:border-white/[0.14] text-zinc-400 hover:text-zinc-300 text-xs transition-all shadow-inner group"
          >
            <div className="flex items-center space-x-2 truncate">
              <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-400 shrink-0" />
              <span className="text-[11px] text-zinc-400 group-hover:text-zinc-300 truncate">Search risks, CVEs, assets...</span>
            </div>
            <kbd className="text-[10px] bg-white/[0.06] text-zinc-400 px-1.5 py-0.5 rounded border border-white/[0.08] font-mono shrink-0 ml-2 shadow-sm">
              ⌘ K
            </kbd>
          </button>

          {/* Persona Role Switcher Segmented Pill */}
          <div className="flex items-center bg-[#12141c] border border-white/[0.08] rounded-lg p-0.5 text-xs shadow-inner">
            {roles.map(role => {
              const isActive = activeRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-2.5 py-1 rounded-[6px] text-[11px] transition-all ${
                    isActive
                      ? 'bg-[#222533] text-white font-medium border border-white/[0.12] shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 font-normal'
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>

          <div className="h-5 w-px bg-white/[0.08] hidden sm:block" />

          {/* Action Group: Walkthrough, Reset, AI Copilot */}
          <div className="flex items-center space-x-2">

            {/* AI Copilot Drawer Trigger (Restrained distinct action) */}
            <button
              onClick={() => setIsCopilotDrawerOpen(!isCopilotDrawerOpen)}
              className={`h-9 px-3 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-sm ${
                isCopilotDrawerOpen
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40 ring-1 ring-amber-500/30'
                  : 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 hover:from-amber-500/25 hover:to-orange-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold">AI Copilot</span>
            </button>
          </div>
        </div>
      </header>

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </>
  );
};
