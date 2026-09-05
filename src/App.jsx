import React, { useState } from 'react';
import { RiskStoreProvider, useRiskStore } from './store/useRiskStore';
import { TopHeader } from './components/layout/TopHeader';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { RiskExposureView } from './components/risk/RiskExposureView';
import { RiskDetailDrawer } from './components/risk/RiskDetailDrawer';
import { AssetIntelligenceView } from './components/assets/AssetIntelligenceView';
import { AssetDetailDrawer } from './components/assets/AssetDetailDrawer';
import { AttackPathGraph } from './components/graph/AttackPathGraph';
import { WhatIfSimulator } from './components/simulator/WhatIfSimulator';
import { InvestmentOptimizer } from './components/optimizer/InvestmentOptimizer';
import { RemediationCenter } from './components/remediation/RemediationCenter';
import { ComplianceHub } from './components/compliance/ComplianceHub';
import { AIRiskCopilotDrawer } from './components/copilot/AIRiskCopilotDrawer';
import { TelemetryCenter } from './components/telemetry/TelemetryCenter';
import { Play } from 'lucide-react';

const MainContent = () => {
  const {
    activeTab,
    setActiveTab,
    setSelectedRiskId,
    setIsCopilotDrawerOpen,
    isWalkthroughOpen,
    setIsWalkthroughOpen
  } = useRiskStore();

  // 8-Step Demo Walkthrough Guide connecting Telemetry + Graph + Risk Engine
  const demoSteps = [
    { step: 1, title: 'Observe Baseline Exposure', tab: 'dashboard' },
    { step: 2, title: 'Inspect Tier-1 Core DB Risk', tab: 'risk', action: () => setSelectedRiskId('RSK-001') },
    { step: 3, title: 'Trace Lateral Attack Path', tab: 'graph' },
    { step: 4, title: 'Ingest Real-Time Telemetry Finding', tab: 'telemetry' },
    { step: 5, title: 'Simulate What-If Patch Delay vs MFA', tab: 'simulator' },
    { step: 6, title: 'Run Budget Optimizer (0/1 Knapsack)', tab: 'optimizer' },
    { step: 7, title: 'Execute Closed-Loop Verification', tab: 'remediation' },
    { step: 8, title: 'Ask Grounded Copilot for Briefing', tab: 'dashboard', action: () => setIsCopilotDrawerOpen(true) }
  ];

  return (
    <div className="flex h-screen bg-[#080c14] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Demo Script Helper Bar */}
        {isWalkthroughOpen && (
          <div className="bg-slate-900/95 border-b border-sky-500/20 px-5 py-2.5 flex items-center justify-between text-xs shrink-0 select-none">
            <div className="flex items-center space-x-3 overflow-x-auto py-0.5">
              <div className="flex items-center space-x-1.5 text-sky-400 font-semibold shrink-0">
                <Play className="w-3.5 h-3.5 fill-sky-400" />
                <span>5-Min Judge Demo Flow:</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                {demoSteps.map(s => {
                  const isActive = activeTab === s.tab;
                  return (
                    <button
                      key={s.step}
                      onClick={() => {
                        setActiveTab(s.tab);
                        if (s.action) s.action();
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors flex items-center space-x-1 ${
                        isActive
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-mono">{s.step}.</span>
                      <span>{s.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setIsWalkthroughOpen(false)}
              className="text-slate-500 hover:text-slate-300 text-[11px] ml-4 shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Switcher */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <ExecutiveDashboard />}
          {activeTab === 'risk' && <RiskExposureView />}
          {activeTab === 'assets' && <AssetIntelligenceView />}
          {activeTab === 'graph' && <AttackPathGraph />}
          {activeTab === 'simulator' && <WhatIfSimulator />}
          {activeTab === 'optimizer' && <InvestmentOptimizer />}
          {activeTab === 'remediation' && <RemediationCenter />}
          {activeTab === 'compliance' && <ComplianceHub />}
          {activeTab === 'telemetry' && <TelemetryCenter />}
        </div>
      </main>

      {/* Global Modals & Drawers */}
      <GlobalSearchModal />
      <RiskDetailDrawer />
      <AssetDetailDrawer />
      <AIRiskCopilotDrawer />
    </div>
  );
};

export function App() {
  return (
    <RiskStoreProvider>
      <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 antialiased selection:bg-sky-500/20 selection:text-sky-300">
        <TopHeader />
        <MainContent />
      </div>
    </RiskStoreProvider>
  );
}

export default App;
