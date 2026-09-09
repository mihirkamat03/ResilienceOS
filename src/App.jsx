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
    <div className="flex h-screen bg-[#0c0d12] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Demo Script Helper Bar */}
        {/* {isWalkthroughOpen && (
          <div className="bg-[#12131b]/95 backdrop-blur-md border-b border-white/[0.07] px-6 py-2 flex items-center justify-between text-xs shrink-0 select-none shadow-md">
            <div className="flex items-center space-x-3 overflow-x-auto py-0.5">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold shrink-0 text-[11px]">
                <Play className="w-3 h-3 fill-amber-400" />
                <span>5-Min Judge Demo Flow:</span>
              </div>
              <div className="flex items-center space-x-1.5 shrink-0">
                {demoSteps.map(s => {
                  const isActive = activeTab === s.tab;
                  return (
                    <button
                      key={s.step}
                      onClick={() => {
                        setActiveTab(s.tab);
                        if (s.action) s.action();
                      }}
                      className={`px-3 py-1 rounded-xl text-[11px] font-medium border transition-all flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                          : 'bg-[#181922] text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:border-white/[0.12]'
                      }`}
                    >
                      <span className="font-mono text-amber-400/90 font-bold">{s.step}.</span>
                      <span>{s.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setIsWalkthroughOpen(false)}
              className="text-zinc-400 hover:text-zinc-200 text-[11px] ml-4 shrink-0 font-medium px-2.5 py-1 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              Dismiss
            </button>
          </div> */}
        {/* )} */}

        {/* View Switcher */}
        <div key={activeTab} className="flex-1 p-6 max-w-[1600px] w-full mx-auto animate-fade-in">
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
      <div className="min-h-screen flex flex-col bg-[#0c0d12] text-zinc-100 antialiased selection:bg-amber-500/20 selection:text-amber-300">
        <TopHeader />
        <MainContent />
      </div>
    </RiskStoreProvider>
  );
}

export default App;
