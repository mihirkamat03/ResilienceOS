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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">What-If Risk Scenario Simulation</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Model the financial risk implications of security investments, control degradation, or patch delays before allocating capital
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Engine: <span className="text-slate-200 font-mono">FAIR Deterministic Engine</span>
        </div>
      </div>

      {/* Main Comparative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Selection & Parameter Modulation */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4 text-xs">
          <div>
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
              Select Scenario Template
            </h2>
            <div className="space-y-2">
              {scenarioDefinitions.map(sc => {
                const isSelected = activeScenarioId === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => setActiveScenarioId(sc.id)}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-950 border-slate-600 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-slate-100">{sc.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-850 text-slate-400 border border-slate-750">
                        {sc.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{sc.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Sensitivity Sliders */}
          <div className="pt-4 border-t border-slate-800 space-y-3.5">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Sensitivity Variables</span>
            </h2>

            {/* Patch Delay Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Operational Patch Delay:</span>
                <span className="font-mono text-amber-400 font-bold">+{customPatchDelayDays} Days</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={customPatchDelayDays}
                onChange={e => setCustomPatchDelayDays(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>0d (Baseline)</span>
                <span>30d</span>
                <span>60d (Critical)</span>
              </div>
            </div>

            {/* Target Control Strength Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Control Effectiveness Target:</span>
                <span className="font-mono text-sky-400 font-bold">{customControlEff}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="98"
                step="2"
                value={customControlEff}
                onChange={e => setCustomControlEff(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* WAF Switch */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-300">WAF Ingress Defense Active:</span>
              <button
                type="button"
                onClick={() => setCustomWafActive(!customWafActive)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border transition-colors ${
                  customWafActive
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    : 'bg-red-950/80 text-red-300 border-red-800'
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
              className="flex items-center space-x-1.5 text-slate-400 hover:text-white text-[11px] pt-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sensitivity Parameters</span>
            </button>
          </div>
        </div>

        {/* Live Delta Comparison Result */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded p-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                Simulated Financial Outcome (FAIR Engine Output)
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">{selectedScenarioDef.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Node: <strong className="text-slate-200">{simulationResult.targetAsset.name}</strong> ({simulationResult.targetAsset.id}) · {simulationResult.targetVuln.cveId}
              </p>
            </div>

            {/* 3-Step Delta Transformation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step 1: Baseline */}
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">1. Baseline Total EAL</span>
                <div className="text-xl font-bold font-mono text-slate-200">
                  {formatINR(totalEstimatedExposure)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Node LEF: {simulationResult.baselineMetrics.lossEventFrequency}/yr
                </div>
              </div>

              {/* Step 2: Projected */}
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">2. Projected Total EAL</span>
                <div className="text-xl font-bold font-mono text-sky-400">
                  {formatINR(simulationResult.projectedTotalExposure)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Simulated LEF: {simulationResult.simulatedMetrics.lossEventFrequency}/yr
                </div>
              </div>

              {/* Step 3: Net Delta */}
              <div
                className={`p-3.5 rounded border space-y-1 ${
                  isRiskReduced
                    ? 'bg-emerald-950/20 border-emerald-800/60'
                    : 'bg-red-950/20 border-red-800/60'
                }`}
              >
                <span className="text-[10px] uppercase text-slate-400">
                  3. Net Financial Delta
                </span>
                <div
                  className={`text-xl font-bold font-mono ${
                    isRiskReduced ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {isRiskReduced ? '-' : '+'}
                  {formatINR(Math.abs(simulationResult.riskDelta))}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isRiskReduced ? 'Risk Eliminated' : 'Additional Expected Loss'}
                </div>
              </div>
            </div>

            {/* Scenario Breakdown Analysis */}
            <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>Deterministic Engine Evaluation:</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
                {isRiskReduced ? (
                  <>
                    <li>
                      Threat Event Frequency evaluated at <strong className="text-slate-200 font-mono">{simulationResult.simulatedMetrics.threatEventFrequency}/yr</strong>, reducing vulnerability factor to <strong className="text-emerald-400 font-mono">{(simulationResult.simulatedMetrics.vulnerabilityFactor * 100).toFixed(0)}%</strong>.
                    </li>
                    <li>
                      Modelled ROSI: <strong className="text-emerald-400 font-mono">+{simulationResult.rosi}%</strong> over 12 months (Initial Cost: {formatINR(simulationResult.cost)}).
                    </li>
                    <li>
                      95% Value at Risk (VaR) reduced from {formatINR(simulationResult.baselineMetrics.valueAtRisk95)} to <strong className="text-sky-400 font-mono">{formatINR(simulationResult.simulatedMetrics.valueAtRisk95)}</strong>.
                    </li>
                  </>
                ) : (
                  <>
                    <li className="text-red-300">
                      Unpatched exposure window increases Threat Event Frequency to <strong className="font-mono text-red-400">{simulationResult.simulatedMetrics.threatEventFrequency}/yr</strong>.
                    </li>
                    <li className="text-red-300">
                      Vulnerability Factor elevates to <strong className="font-mono text-red-400">{(simulationResult.simulatedMetrics.vulnerabilityFactor * 100).toFixed(0)}%</strong>, expanding tail loss risk.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Transfer verified parameter targets to Knapsack allocation
            </span>
            <button
              onClick={() => setActiveTab('optimizer')}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium flex items-center space-x-1.5 transition-colors"
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
