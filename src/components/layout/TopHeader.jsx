import React, { useState } from 'react';
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

  const roles = ['CISO', 'CFO', 'SecOps', 'Compliance'];

  return (
    <>
      <header className="h-13 bg-slate-950 border-b border-slate-800 px-5 flex items-center justify-between z-30 sticky top-0">
        {/* Brand & Organization */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-sky-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-tight text-white">ResilienceOS</span>
                <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800 font-mono">
                  Enterprise
                </span>
              </div>
              <div className="text-[11px] text-slate-400">FintechCore Systems India</div>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Model Status & Methodology */}
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Risk model: <strong className="text-slate-200 font-normal">FAIR-informed</strong></span>
            <span className="text-slate-600">·</span>
            <span>Synced <span className="font-mono text-slate-300">{lastRecalculatedTime}</span></span>
            <button
              onClick={simulateTelemetrySync}
              title="Trigger telemetry rescan"
              className="p-1 hover:text-sky-400 text-slate-400 hover:bg-slate-900 rounded transition-colors ml-1"
            >
              <RefreshCw className="w-3 h-3" />
            </button>

            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="text-[11px] text-sky-400 hover:text-sky-300 underline underline-offset-2 ml-1"
            >
              Methodology
            </button>
          </div>
        </div>

        {/* Global Search & Actions */}
        <div className="flex items-center space-x-3">
          {/* Global Search Button (Cmd+K) */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 px-3 py-1.5 rounded text-xs transition-colors w-60 justify-between"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search risks, assets, controls...</span>
            </div>
            <kbd className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 font-mono">⌘K</kbd>
          </button>

          {/* Persona Role Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 text-xs">
            <div className="text-[11px] text-slate-400 px-2 flex items-center space-x-1">
              <Layers className="w-3 h-3" />
              <span>Role:</span>
            </div>
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  activeRole === role
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Presentation Walkthrough Toggle Button */}
          <button
            onClick={() => setIsWalkthroughOpen(!isWalkthroughOpen)}
            className={`px-2.5 py-1.5 rounded text-xs font-medium border flex items-center space-x-1.5 transition-colors ${
              isWalkthroughOpen
                ? 'bg-slate-800 text-sky-300 border-slate-700'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Demo Presentation Steps"
          >
            <Play className="w-3 h-3 text-sky-400" />
            <span>Walkthrough</span>
          </button>

          {/* Reset Demo State Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo state (telemetry, risks, remediations, compliance) back to pristine baseline?')) {
                resetDemoState();
              }
            }}
            className="px-2.5 py-1.5 rounded text-xs font-medium bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-amber-300 border border-slate-800 transition-colors flex items-center space-x-1"
            title="Reset platform state back to baseline"
          >
            <RefreshCw className="w-3 h-3 text-amber-400" />
            <span>Reset Demo</span>
          </button>

          {/* AI Copilot Drawer Trigger */}
          <button
            onClick={() => setIsCopilotDrawerOpen(!isCopilotDrawerOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              isCopilotDrawerOpen
                ? 'bg-slate-800 text-sky-300 border-slate-700'
                : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-sky-400" />
            <span>Risk Copilot</span>
          </button>
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
