import React, { useState, useMemo } from 'react';
import {
  Sliders,
  RotateCcw,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { computeFAIRRiskMetrics, formatINR } from '../../core/riskEngine';

export const WhatIfSimulator = () => {
  const { totalEstimatedExposure, risks, assets, vulnerabilities, setActiveTab } = useRiskStore();

  const [activeScenarioId, setActiveScenarioId] = useState('SCENARIO_MFA');
  const [customPatchDelayDays, setCustomPatchDelayDays] = useState(0);
  const [customControlEff, setCustomControlEff] = useState(75);
  const [customWafActive, setCustomWafActive] = useState(true);

  // Pre-configured Defensible Enterprise Scenarios grounded in actual assets & vulnerabilities
  const scenarioDefinitions = [
    {
      id: 'SCENARIO_MFA',
      name: 'Enforce FIDO2 Hardware MFA & PAM on Database',
      targetAssetId: 'AST-DB-01',
      targetVulnId: 'VULN-2023-39417',
      category: 'Mitigation',
      cost: 800000, // ₹8 Lakhs
      description: 'Deploy just-in-time privileged access vaulting on Core Banking DB and mandate hardware security keys.',
      modifiers: {
        targetControlName: 'Privileged Access Management (PAM)',
        targetEffectiveness: 0.95
      }
    },
    {
      id: 'SCENARIO_DELAY_PATCH',
      name: 'Delay Emergency PAN-OS Patch by 30 Days',
      targetAssetId: 'AST-GW-01',
      targetVulnId: 'VULN-2024-3400',
      category: 'Operational Delay',
      cost: 0,
      description: 'Simulate business exposure if patching CVE-2024-3400 is postponed due to change-freeze windows.',
      modifiers: {
        patchDelayDays: 30
      }
    },
    {
      id: 'SCENARIO_MICROSEG',
      name: 'Implement Kubernetes Cilium eBPF Microsegmentation',
      targetAssetId: 'AST-K8S-01',
      targetVulnId: 'VULN-2023-5043',
      category: 'Architecture Shift',
      cost: 500000, // ₹5 Lakhs
      description: 'Isolate ingress pods and block lateral east-west traversal between payment services and database tiers.',
      modifiers: {
        targetControlName: 'Kubernetes Network Policies',
        targetEffectiveness: 0.92
      }
    },
    {
      id: 'SCENARIO_BACKUP',
      name: 'Air-Gapped Immutable Backups & Rapid DR',
      targetAssetId: 'AST-DB-01',
      targetVulnId: 'VULN-2023-39417',
      category: 'Resilience',
      cost: 700000, // ₹7 Lakhs
      description: 'Enforce AWS WORM storage lock to cap maximum downtime loss during a database incident.',
      modifiers: {
        targetControlName: 'Immutable Air-Gapped Backups',
        targetEffectiveness: 0.90
      }
    }
  ];

  const selectedScenarioDef = scenarioDefinitions.find(s => s.id === activeScenarioId) || scenarioDefinitions[0];

  // Live Scenario Simulation executed directly via the core FAIR Risk Engine
  const simulationResult = useMemo(() => {
    const targetAsset = assets.find(a => a.id === selectedScenarioDef.targetAssetId) || assets[0];
    const targetVuln = vulnerabilities.find(v => v.id === selectedScenarioDef.targetVulnId) || vulnerabilities[0];
    const baselineRisk = risks.find(r => r.assetId === targetAsset.id && r.vulnId === targetVuln.id) || risks[0];

    // Baseline calculation from live engine
    const baselineMetrics = computeFAIRRiskMetrics(targetAsset, targetVuln);
    const baselineEAL = baselineMetrics.expectedAnnualLoss;

    // Combined modifiers from scenario + custom sensitivity sliders
    const combinedModifiers = {
      ...selectedScenarioDef.modifiers,
      patchDelayDays: (selectedScenarioDef.modifiers.patchDelayDays || 0) + customPatchDelayDays,
      globalControlEffTarget: customControlEff,
      wafActive: customWafActive
    };

    // Simulated calculation from live engine
    const simulatedMetrics = computeFAIRRiskMetrics(targetAsset, targetVuln, combinedModifiers);
    const simulatedEAL = simulatedMetrics.expectedAnnualLoss;

    const riskDelta = baselineEAL - simulatedEAL; // Positive = Risk Reduced; Negative = Risk Increased
    const projectedTotalExposure = Math.max(0, totalEstimatedExposure - riskDelta);

    const cost = selectedScenarioDef.cost || 0;
    const rosi = cost > 0 && riskDelta > 0
      ? Math.round(((riskDelta - cost) / cost) * 100)
      : 0;

    return {
      targetAsset,
      targetVuln,
      baselineMetrics,
      simulatedMetrics,
      baselineEAL,
      simulatedEAL,
      riskDelta,
      projectedTotalExposure,
      cost,
      rosi
    };
  }, [
    selectedScenarioDef,
    customPatchDelayDays,
    customControlEff,
    customWafActive,
    assets,
    vulnerabilities,
    risks,
    totalEstimatedExposure
  ]);

  const isRiskReduced = simulationResult.riskDelta >= 0;

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-base font-bold text-white tracking-tight">What-If Risk Scenario Simulation</h1>
            <span className="text-[10px] bg-[#0c1220] text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30 font-mono font-medium">
              Sensitivity Lab
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Model the financial risk implications of security investments, control degradation, or patch delays before allocating capital
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-[#0c1220] px-3 py-1.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 font-medium text-[11px]">Engine:</span>
          <span className="text-slate-200 font-mono font-semibold text-[11px]">FAIR Parametric Engine</span>
        </div>
      </div>

      {/* Top 4-Metric Simulation Context Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-zinc-600">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Current Portfolio EAL</div>
          <div className="text-xl font-bold text-white font-mono mt-0.5">{formatINR(totalEstimatedExposure)}</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Baseline continuous state</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-sky-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Projected Portfolio EAL</div>
          <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
            {formatINR(simulationResult.projectedTotalExposure)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Simulated post-mitigation</div>
        </div>

        <div className={`bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 ${isRiskReduced ? 'border-t-emerald-500' : 'border-t-rose-500'}`}>
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Simulated Net Delta</div>
          <div className={`text-xl font-bold font-mono mt-0.5 ${isRiskReduced ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isRiskReduced ? '-' : '+'}{formatINR(Math.abs(simulationResult.riskDelta))}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">
            {isRiskReduced ? 'Annual loss averted' : 'Exposure increase'}
          </div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-orange-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Modelled Scenario ROSI</div>
          <div className="text-xl font-bold text-orange-400 font-mono mt-0.5">
            {isRiskReduced && simulationResult.cost > 0 ? `+${simulationResult.rosi}%` : 'N/A (Cost ₹0)'}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Return on security spend</div>
        </div>
      </div>

      {/* Main Comparative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Selection & Parameter Modulation */}
        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-5 space-y-4 text-xs shadow-2xl shadow-black/50 backdrop-blur-sm">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
              Select Scenario Template
            </h2>
            <div className="space-y-2">
              {scenarioDefinitions.map(sc => {
                const isSelected = activeScenarioId === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => setActiveScenarioId(sc.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 text-white shadow-md ring-1 ring-amber-500/30'
                        : 'bg-[#101117] border-zinc-800/80 hover:border-zinc-700/80 text-zinc-300 hover:bg-[#14151e]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-zinc-100">{sc.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-medium">
                        {sc.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{sc.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Sensitivity Sliders */}
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Sensitivity Variables</span>
            </h2>

            {/* Patch Delay Slider */}
            <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium text-[11px]">Operational Patch Delay:</span>
                <span className="font-mono text-amber-400 font-bold text-xs">+{customPatchDelayDays} Days</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={customPatchDelayDays}
                onChange={e => setCustomPatchDelayDays(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0d (Baseline)</span>
                <span>30d</span>
                <span>60d (Critical)</span>
              </div>
            </div>

            {/* Target Control Strength Slider */}
            <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium text-[11px]">Control Effectiveness Target:</span>
                <span className="font-mono text-sky-400 font-bold text-xs">{customControlEff}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="98"
                step="2"
                value={customControlEff}
                onChange={e => setCustomControlEff(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>20% (Degraded)</span>
                <span>75% (Target)</span>
                <span>98% (Hardened)</span>
              </div>
            </div>

            {/* WAF Switch */}
            <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300 font-medium text-[11px]">WAF Ingress Defense:</span>
              <button
                type="button"
                onClick={() => setCustomWafActive(!customWafActive)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-all ${
                  customWafActive
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800 shadow-sm'
                    : 'bg-red-950/80 text-red-300 border-red-800 shadow-sm'
                }`}
              >
                {customWafActive ? 'ACTIVE' : 'BYPASSED'}
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setCustomPatchDelayDays(0);
                setCustomControlEff(75);
                setCustomWafActive(true);
              }}
              className="flex items-center space-x-1.5 text-slate-400 hover:text-white text-[11px] font-medium pt-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sensitivity Parameters</span>
            </button>
          </div>
        </div>

        {/* Live Delta Comparison Result */}
        <div className="lg:col-span-2 bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-6 flex flex-col justify-between shadow-2xl shadow-black/50 backdrop-blur-sm">
          <div className="space-y-5">
            <div>
              <span className="text-[10px] text-orange-400 font-mono uppercase tracking-wider font-semibold">
                Simulated Financial Outcome (FAIR Engine Output)
              </span>
              <h2 className="text-base font-bold text-white mt-1">{selectedScenarioDef.name}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Target Node: <strong className="text-zinc-200 font-semibold">{simulationResult.targetAsset.name}</strong> ({simulationResult.targetAsset.id}) · <span className="font-mono text-zinc-300">{simulationResult.targetVuln.cveId}</span>
              </p>
            </div>

            {/* 3-Step Delta Transformation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step 1: Baseline */}
              <div className="bg-[#101117] p-4 rounded-xl border border-zinc-800/90 space-y-1 shadow-md">
                <span className="text-[10px] text-zinc-400 uppercase font-medium">1. Baseline Total EAL</span>
                <div className="text-xl font-bold font-mono text-zinc-200">
                  {formatINR(totalEstimatedExposure)}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Node LEF: {simulationResult.baselineMetrics.lossEventFrequency}/yr
                </div>
              </div>

              {/* Step 2: Projected */}
              <div className="bg-[#101117] p-4 rounded-xl border border-zinc-800/90 space-y-1 shadow-md">
                <span className="text-[10px] text-zinc-400 uppercase font-medium">2. Projected Total EAL</span>
                <div className="text-xl font-bold font-mono text-sky-400">
                  {formatINR(simulationResult.projectedTotalExposure)}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Simulated LEF: {simulationResult.simulatedMetrics.lossEventFrequency}/yr
                </div>
              </div>

              {/* Step 3: Net Delta */}
              <div
                className={`p-4 rounded-xl border space-y-1 shadow-md ${
                  isRiskReduced
                    ? 'bg-emerald-950/30 border-emerald-800/70'
                    : 'bg-rose-950/30 border-rose-800/70'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold text-zinc-300">
                  3. Net Financial Delta
                </span>
                <div
                  className={`text-xl font-bold font-mono ${
                    isRiskReduced ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isRiskReduced ? '-' : '+'}
                  {formatINR(Math.abs(simulationResult.riskDelta))}
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">
                  {isRiskReduced ? 'Risk Eliminated' : 'Additional Expected Loss'}
                </div>
              </div>
            </div>

            {/* Scenario Breakdown Analysis */}
            <div className="bg-[#101117] p-4 rounded-xl border border-zinc-800/90 space-y-2 text-xs">
              <div className="font-bold text-zinc-200 flex items-center space-x-2">
                <Info className="w-3.5 h-3.5 text-orange-400" />
                <span>Deterministic Engine Evaluation:</span>
              </div>
              <ul className="space-y-2 text-zinc-300 list-disc list-inside text-[11px] leading-relaxed">
                {isRiskReduced ? (
                  <>
                    <li>
                      Threat Event Frequency evaluated at <strong className="text-zinc-200 font-mono">{simulationResult.simulatedMetrics.threatEventFrequency}/yr</strong>, reducing vulnerability factor to <strong className="text-emerald-400 font-mono">{(simulationResult.simulatedMetrics.vulnerabilityFactor * 100).toFixed(0)}%</strong>.
                    </li>
                    <li>
                      Modelled ROSI: <strong className="text-emerald-400 font-mono font-bold">+{simulationResult.rosi}%</strong> over 12 months (Initial Cost: {formatINR(simulationResult.cost)}).
                    </li>
                    <li>
                      95% Value at Risk (VaR) reduced from {formatINR(simulationResult.baselineMetrics.valueAtRisk95)} to <strong className="text-sky-400 font-mono font-bold">{formatINR(simulationResult.simulatedMetrics.valueAtRisk95)}</strong>.
                    </li>
                  </>
                ) : (
                  <>
                    <li className="text-rose-300">
                      Unpatched exposure window increases Threat Event Frequency to <strong className="font-mono text-rose-400">{simulationResult.simulatedMetrics.threatEventFrequency}/yr</strong>.
                    </li>
                    <li className="text-rose-300">
                      Vulnerability Factor elevates to <strong className="font-mono text-rose-400">{(simulationResult.simulatedMetrics.vulnerabilityFactor * 100).toFixed(0)}%</strong>, expanding tail loss risk.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs mt-4">
            <span className="text-zinc-400">
              Transfer verified parameter targets to Knapsack allocation
            </span>
            <button
              onClick={() => setActiveTab('optimizer')}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-medium flex items-center space-x-1.5 transition-all shadow-lg shadow-orange-950/40"
            >
              <span>Feed to Investment Optimizer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
