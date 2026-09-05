import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { formatINR } from '../../core/riskEngine';
import { Badge } from '../common/Badge';

export const InvestmentOptimizer = () => {
  const {
    budget,
    setBudget,
    optimizationResult,
    deployOptimizedPortfolioToRemediation,
    totalEstimatedExposure
  } = useRiskStore();

  const {
    selectedInvestments,
    unselectedInvestments,
    totalCost,
    totalRiskReduction,
    remainingBudget,
    portfolioROSI,
    solverMethod
  } = optimizationResult;

  const budgetPresets = [
    { label: '₹15 Lakhs', value: 1500000 },
    { label: '₹30 Lakhs', value: 3000000 },
    { label: '₹50 Lakhs', value: 5000000 },
    { label: '₹75 Lakhs', value: 7500000 }
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Security Investment Portfolio Optimizer</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            0/1 Knapsack optimization algorithm maximizing quantitative risk reduction under budget constraints
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Algorithm: <span className="text-slate-200">{solverMethod}</span>
        </div>
      </div>

      {/* Budget Slider & Optimization Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Input & Presets */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white uppercase text-[11px] tracking-wider">
              Available Capital Budget
            </h2>
            <span className="text-base font-bold font-mono text-sky-400">
              {formatINR(budget)}
            </span>
          </div>

          {/* Interactive Budget Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="500000"
              max="6000000"
              step="100000"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>₹5.0 L</span>
              <span>₹30.0 L (Baseline)</span>
              <span>₹60.0 L</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {budgetPresets.map(preset => (
              <button
                key={preset.value}
                onClick={() => setBudget(preset.value)}
                className={`py-1.5 px-2 rounded text-xs font-mono border transition-colors ${
                  budget === preset.value
                    ? 'bg-slate-800 text-white border-slate-600 font-medium'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Optimizer Formulation */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-400">
            <div className="font-medium text-slate-300">Optimization Model Formulation:</div>
            <div className="font-mono bg-slate-950 p-2 rounded border border-slate-800 text-[10px] text-slate-300">
              Maximize ∑ (ΔEAL_i) Subject to: ∑ (Cost_i) ≤ {formatINR(budget)}
            </div>
            <p className="text-[11px] leading-relaxed">
              The DP solver evaluates marginal EAL reduction against implementation costs to select the globally optimal portfolio.
            </p>
          </div>
        </div>

        {/* Portfolio Optimization Result KPIs */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Optimal Portfolio Recommendation
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {selectedInvestments.length} Candidate Actions Selected
                </h2>
              </div>

              <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded font-mono">
                Portfolio ROSI: +{portfolioROSI}%
              </span>
            </div>

            {/* 4 Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Allocated Cost</span>
                <div className="text-lg font-bold font-mono text-white mt-1">
                  {formatINR(totalCost)}
                </div>
                <div className="text-[10px] text-slate-400">of {formatINR(budget)} budget</div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Risk Reduction</span>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                  {formatINR(totalRiskReduction)}
                </div>
                <div className="text-[10px] text-slate-400">EAL Eliminated</div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Residual Exposure</span>
                <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                  {formatINR(Math.max(0, totalEstimatedExposure - totalRiskReduction))}
                </div>
                <div className="text-[10px] text-slate-400">Post-Remediation EAL</div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Remaining Buffer</span>
                <div className="text-lg font-bold font-mono text-slate-300 mt-1">
                  {formatINR(remainingBudget)}
                </div>
                <div className="text-[10px] text-slate-400">Unallocated Capital</div>
              </div>
            </div>
          </div>

          {/* Deploy Action CTA */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Commit these {selectedInvestments.length} actions directly into active engineering remediation workflows.
            </span>
            <button
              onClick={deployOptimizedPortfolioToRemediation}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center space-x-1.5 transition-colors shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Deploy to Remediation Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Portfolio List */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-3">
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Selected Security Investments in Optimal Portfolio</span>
        </h2>

        <div className="space-y-2.5">
          {selectedInvestments.map(inv => (
            <div
              key={inv.id}
              className="bg-slate-950 border border-slate-800 p-3.5 rounded flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{inv.name}</span>
                  <Badge variant="info">{inv.category}</Badge>
                  <Badge variant="purple">{inv.effort} Effort</Badge>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">{inv.description}</p>
                <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-2">
                  <span>Target Assets: <strong className="text-slate-300">{inv.targetAssetIds.join(', ')}</strong></span>
                  <span>·</span>
                  <span>Timeline: {inv.implementationDays} Days</span>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-right shrink-0">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">Cost</div>
                  <div className="text-sm font-mono font-bold text-white">{formatINR(inv.cost)}</div>
                </div>

                <div>
                  <div className="text-slate-400 text-[10px] uppercase">Risk Reduction (EAL)</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    -{formatINR(inv.riskReductionEAL)}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[10px] uppercase">Estimated ROSI</div>
                  <div className="text-sm font-mono font-bold text-sky-400">
                    +{inv.rosiPercent}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unselected Mitigations */}
      {unselectedInvestments.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-2.5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Excluded Candidate Investments (Budget Exceeded or Lower Marginal ROI)</span>
          </h2>

          <div className="space-y-1.5">
            {unselectedInvestments.map(inv => (
              <div
                key={inv.id}
                className="bg-slate-950 p-2.5 rounded border border-slate-800/80 flex items-center justify-between text-xs text-slate-400"
              >
                <div>
                  <span className="font-medium text-slate-300">{inv.name}</span>
                  <span className="text-[11px] ml-2 font-mono text-slate-400">Cost: {formatINR(inv.cost)}</span>
                </div>
                <div className="text-right text-[11px] font-mono">
                  <span>Marginal Reduction: {formatINR(inv.riskReductionEAL)}</span>
                  <span className="ml-3 text-slate-400">(ROSI: {inv.rosiPercent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
