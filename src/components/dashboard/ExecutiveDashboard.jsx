import React from 'react';
import {
  ArrowRight,
  Shield,
  Layers,
  TrendingDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useRiskStore } from '../../store/useRiskStore';
import { formatINR } from '../../core/riskEngine';
import { MetricCard } from '../common/MetricCard';
import { SeverityBadge, CriticalityBadge } from '../common/Badge';

export const ExecutiveDashboard = () => {
  const {
    totalEstimatedExposure,
    criticalExposure,
    openCriticalRisksCount,
    monthToDateReduction,
    valueAtRisk95Total,
    risks,
    assets,
    exposureByBusinessUnit,
    exposureTrendTimeline,
    setSelectedRiskId,
    setActiveTab,
    activeRole
  } = useRiskStore();

  // Top High-Impact Financial Risks (dynamically sorted by active EAL)
  const topRisks = [...risks]
    .filter(r => r.status !== 'Remediated')
    .sort((a, b) => (b.fairMetrics?.expectedAnnualLoss || 0) - (a.fairMetrics?.expectedAnnualLoss || 0))
    .slice(0, 4);

  // Top Critical Assets (dynamically sorted by financial exposure)
  const criticalAssets = [...assets]
    .filter(a => a.criticality === 'Tier 1' || a.criticality === 'Tier 2')
    .sort((a, b) => (b.financialExposure || 0) - (a.financialExposure || 0));

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Perspective Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Cyber Risk & Exposure Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous quantitative financial exposure modeling for FintechCore Systems India
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="text-slate-400">Perspective:</span>
          <span className="text-slate-200 font-medium bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {activeRole}
          </span>
          <span className="text-slate-600">·</span>
          <span>Scope: <strong className="text-slate-300 font-normal">{assets.length} Production Assets</strong></span>
        </div>
      </div>

      {/* 4 Primary KPI Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Modelled Exposure (EAL)"
          value={formatINR(totalEstimatedExposure)}
          subValue="Expected Annual Loss"
          change={{ value: `-${formatINR(monthToDateReduction)} MTD Verified`, isPositive: true }}
          tooltip="Expected Annual Loss computed via FAIR loss event frequency (LEF) and single incident loss distributions"
        />

        <MetricCard
          label="Value at Risk (95% CI)"
          value={formatINR(valueAtRisk95Total)}
          subValue="Upper 95th Percentile Loss"
          change={{ value: '1-in-20 Year Tail Risk', isPositive: false }}
          tooltip="Maximum expected loss at a 95% confidence level over a 12-month horizon (Lognormal dispersion)"
        />

        <MetricCard
          label="Critical Asset Exposure"
          value={formatINR(criticalExposure)}
          subValue={`Across ${assets.filter(a => a.criticality === 'Tier 1').length} Tier-1 Assets`}
          change={{ value: `${totalEstimatedExposure > 0 ? Math.round((criticalExposure / totalEstimatedExposure) * 100) : 0}% of Total Risk`, isPositive: false }}
          tooltip="Financial exposure concentrated on Tier-1 Core Banking and Payment gateways"
        />

        <MetricCard
          label="Active P1 Priority Risks"
          value={openCriticalRisksCount.toString()}
          subValue="Immediate Remediation SLA"
          change={{ value: `${risks.filter(r => r.contextualPriority === 'P1 - Immediate').length} Active Immediate`, isPositive: false }}
          tooltip="High-exploitability vulnerabilities affecting mission-critical production systems"
        />
      </div>

      {/* Analytical Section: Trajectory Line Chart & BU Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exposure Trajectory Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Financial Exposure Trajectory</h2>
                <p className="text-xs text-slate-400">Historical reduction vs projected post-optimization trajectory (in ₹ Crores)</p>
              </div>

              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-0.5 bg-sky-400" />
                  <span className="text-slate-300 text-[11px]">Historical Actual</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-sky-400" />
                  <span className="text-slate-400 text-[11px]">Projected Post-Optimization</span>
                </div>
              </div>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exposureTrendTimeline} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={val => `₹${val}Cr`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-800 p-2.5 rounded text-xs space-y-1 shadow-lg">
                            <div className="font-semibold text-white">{data.month}</div>
                            <div className="text-sky-400 font-mono">
                              Exposure: ₹{data.actual !== null ? data.actual : data.projected} Cr
                            </div>
                            <div className="text-slate-400 text-[11px]">{data.event}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={{ fill: '#38bdf8', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: '#38bdf8', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Verified Reduction: <strong>-{formatINR(monthToDateReduction)} eliminated</strong> across verified controls</span>
            <button
              onClick={() => setActiveTab('simulator')}
              className="text-sky-400 hover:text-sky-300 flex items-center space-x-1"
            >
              <span>Simulate Target Scenarios</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Exposure by Business Unit */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Exposure Concentration by Unit</h2>
            <p className="text-xs text-slate-400 mb-4">Financial risk distribution across operational business lines</p>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exposureByBusinessUnit} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={v => `₹${v}Cr`} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={95} tickLine={false} />
                  <Tooltip
                    formatter={(val) => [`₹${val} Cr`, 'Exposure']}
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '11px' }}
                  />
                  <Bar dataKey="exposure" radius={[0, 2, 2, 0]}>
                    {exposureByBusinessUnit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Primary Focus: <strong>{exposureByBusinessUnit[0]?.name || 'Retail Banking'} ({exposureByBusinessUnit[0]?.exposure || 0} Cr)</strong></span>
            <button
              onClick={() => setActiveTab('assets')}
              className="text-sky-400 hover:text-sky-300"
            >
              Asset Inventory →
            </button>
          </div>
        </div>
      </div>

      {/* Lower Section: Structured Operational Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highest Financial Exposure Risks Table */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Priority Financial Cyber Risks</h2>
              <p className="text-xs text-slate-400">Ranked by Expected Annual Loss (EAL) and business context</p>
            </div>
            <button
              onClick={() => setActiveTab('risk')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1"
            >
              <span>View All ({risks.filter(r => r.status !== 'Remediated').length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {topRisks.map(risk => (
              <div
                key={risk.id}
                onClick={() => {
                  setSelectedRiskId(risk.id);
                  setActiveTab('risk');
                }}
                className="py-2.5 px-2 hover:bg-slate-850/60 rounded cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <SeverityBadge severity={risk.technicalSeverity} />
                    <span className="font-medium text-slate-200">{risk.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {risk.id} · Asset: {risk.assetId} · LEF: {risk.fairMetrics?.lossEventFrequency || 0.1}/yr
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-amber-400">
                    {formatINR(risk.fairMetrics?.expectedAnnualLoss || 0)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    VaR: {formatINR(risk.fairMetrics?.valueAtRisk95 || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Infrastructure at Risk Table */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Critical Systems at Risk</h2>
              <p className="text-xs text-slate-400">Tier-1 & Tier-2 assets carrying business interruption exposure</p>
            </div>
            <button
              onClick={() => setActiveTab('assets')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1"
            >
              <span>Inspect All ({assets.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {criticalAssets.map(asset => (
              <div
                key={asset.id}
                onClick={() => setActiveTab('assets')}
                className="py-2.5 px-2 hover:bg-slate-850/60 rounded cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <CriticalityBadge criticality={asset.criticality} />
                    <span className="font-medium text-slate-200">{asset.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {asset.businessUnit} · Downtime: ₹{((asset.hourlyDowntimeCost || 0) / 100000).toFixed(1)}L/hr · {asset.networkExposure}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-slate-200">
                    {formatINR(asset.financialExposure)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {asset.activeVulnerabilitiesCount} active vulnerabilities
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regulatory & Compliance Posture Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Regulatory Compliance Visibility
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              4 Frameworks Synced
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Technical controls mapped to NIST CSF 2.0, RBI Master Direction, ISO 27001:2022, and SEBI CSCRF.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('compliance')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-xs rounded border border-slate-700 flex items-center space-x-1.5 font-medium shrink-0 self-start sm:self-auto transition-colors"
        >
          <span>Open Compliance Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
