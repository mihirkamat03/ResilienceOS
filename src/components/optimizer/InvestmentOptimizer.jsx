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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-base font-bold text-white tracking-tight">Security Investment Portfolio Optimizer</h1>
            <span className="text-[10px] bg-[#0c1220] text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30 font-mono font-medium">
              0/1 Knapsack DP
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dynamic programming solver maximizing quantitative risk reduction (ΔEAL) under capital budget constraints
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-[#0c1220] px-3 py-1.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 font-medium text-[11px]">Algorithm:</span>
          <span className="text-slate-200 font-mono font-semibold text-[11px]">{solverMethod}</span>
        </div>
      </div>

      {/* Top 4-Metric Optimization Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-zinc-600">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Capital Budget</div>
          <div className="text-xl font-bold text-white font-mono mt-0.5">{formatINR(budget)}</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Available allocation ceiling</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-sky-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Allocated Portfolio Spend</div>
          <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
            {formatINR(totalCost)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">{formatINR(remainingBudget)} buffer remaining</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-emerald-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Portfolio Risk Reduction</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
            -{formatINR(totalRiskReduction)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Quantified EAL eliminated</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-orange-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Optimized Portfolio ROSI</div>
          <div className="text-xl font-bold text-orange-400 font-mono mt-0.5">
            +{portfolioROSI}%
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Return on security investment</div>
        </div>
      </div>

      {/* Budget Slider & Optimization Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Input & Presets */}
        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-5 space-y-4 text-xs shadow-2xl shadow-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white uppercase text-[11px] tracking-wider">
              Available Capital Budget
            </h2>
            <span className="text-base font-bold font-mono text-orange-400">
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
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
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
                className={`py-1.5 px-2 rounded-xl text-xs font-mono border transition-all ${
                  budget === preset.value
                    ? 'bg-amber-500/20 text-orange-300 border-amber-500/60 font-semibold shadow-md ring-1 ring-amber-500/30'
                    : 'bg-[#101117] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Optimizer Formulation */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-400">
            <div className="font-semibold text-zinc-300">Optimization Model Formulation:</div>
            <div className="font-mono bg-[#101117] p-2.5 rounded-xl border border-zinc-800/80 text-[10.5px] text-orange-300/90 font-medium">
              Maximize ∑ (ΔEAL_i) Subject to: ∑ (Cost_i) ≤ {formatINR(budget)}
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              The DP solver evaluates marginal EAL reduction against implementation costs to select the globally optimal portfolio.
            </p>
          </div>
        </div>

        {/* Portfolio Optimization Result KPIs */}
        <div className="lg:col-span-2 bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-5 flex flex-col justify-between shadow-2xl shadow-black/50 backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-orange-400 font-mono uppercase tracking-wider font-semibold">
                  Optimal Portfolio Recommendation
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {selectedInvestments.length} Candidate Actions Selected
                </h2>
              </div>

              <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-3 py-1 rounded-full font-mono font-bold shadow-sm">
                Portfolio ROSI: +{portfolioROSI}%
              </span>
            </div>

            {/* 4 Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#090d16] p-3.5 rounded-xl border border-slate-800/90 shadow-sm">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Allocated Cost</span>
                <div className="text-lg font-bold font-mono text-white mt-1">
                  {formatINR(totalCost)}
                </div>
                <div className="text-[10px] text-slate-500">of {formatINR(budget)} budget</div>
              </div>

              <div className="bg-[#090d16] p-3.5 rounded-xl border border-slate-800/90 shadow-sm border-t-2 border-t-emerald-500">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Risk Reduction</span>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                  {formatINR(totalRiskReduction)}
                </div>
                <div className="text-[10px] text-slate-500">EAL Eliminated</div>
              </div>

              <div className="bg-[#090d16] p-3.5 rounded-xl border border-slate-800/90 shadow-sm border-t-2 border-t-amber-500">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Residual Exposure</span>
                <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                  {formatINR(Math.max(0, totalEstimatedExposure - totalRiskReduction))}
                </div>
                <div className="text-[10px] text-slate-500">Post-Remediation EAL</div>
              </div>

              <div className="bg-[#090d16] p-3.5 rounded-xl border border-slate-800/90 shadow-sm">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Remaining Buffer</span>
                <div className="text-lg font-bold font-mono text-slate-300 mt-1">
                  {formatINR(remainingBudget)}
                </div>
                <div className="text-[10px] text-slate-500">Unallocated Capital</div>
              </div>
            </div>
          </div>

          {/* Deploy Action CTA */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-300 font-medium">
              Commit these {selectedInvestments.length} actions directly into active engineering remediation workflows.
            </span>
            <button
              onClick={deployOptimizedPortfolioToRemediation}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-sm shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Deploy to Remediation Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Portfolio List */}
      <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-5 space-y-3.5 shadow-2xl shadow-black/50 backdrop-blur-sm">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Selected Security Investments in Optimal Portfolio</span>
        </h2>

        <div className="space-y-3">
          {selectedInvestments.map(inv => (
            <div
              key={inv.id}
              className="bg-[#101117] border border-zinc-800/90 hover:border-zinc-700/80 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all shadow-md border-l-4 border-l-emerald-500"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">{inv.name}</span>
                  <Badge variant="info">{inv.category}</Badge>
                  <Badge variant="purple">{inv.effort} Effort</Badge>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11.5px]">{inv.description}</p>
                <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-2">
                  <span>Target Assets: <strong className="text-slate-200">{inv.targetAssetIds.join(', ')}</strong></span>
                  <span>·</span>
                  <span>Timeline: <span className="text-slate-300">{inv.implementationDays} Days</span></span>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-right shrink-0">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-medium">Cost</div>
                  <div className="text-sm font-mono font-bold text-white">{formatINR(inv.cost)}</div>
                </div>

                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-medium">Risk Reduction (EAL)</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    -{formatINR(inv.riskReductionEAL)}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-medium">Estimated ROSI</div>
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
        <div className="bg-[#0c1220] border border-slate-800/90 rounded-xl p-4 space-y-2.5 shadow-sm">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Excluded Candidate Investments (Budget Exceeded or Lower Marginal ROI)</span>
          </h2>

          <div className="space-y-1.5">
            {unselectedInvestments.map(inv => (
              <div
                key={inv.id}
                className="bg-[#090d16]/70 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-400"
              >
                <div>
                  <span className="font-medium text-slate-300">{inv.name}</span>
                  <span className="text-[11px] ml-2 font-mono text-slate-500">Cost: {formatINR(inv.cost)}</span>
                </div>
                <div className="text-right text-[11px] font-mono">
                  <span>Marginal Reduction: {formatINR(inv.riskReductionEAL)}</span>
                  <span className="ml-3 text-slate-500">(ROSI: {inv.rosiPercent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
