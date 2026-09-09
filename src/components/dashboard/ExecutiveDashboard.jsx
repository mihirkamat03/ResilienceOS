import React, { useState } from 'react';
import {
  ArrowRight,
  TrendingDown,
  Shield,
  Layers,
  PieChart as PieIcon,
  BarChart3,
  ExternalLink,
  GitFork,
  Server,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
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
    optimizationResult,
    setSelectedRiskId,
    setActiveTab,
    activeRole
  } = useRiskStore();

  const [distributionView, setDistributionView] = useState('units'); // 'units' | 'severity'

  // Top High-Impact Financial Risks (dynamically sorted by active EAL)
  const topRisks = [...risks]
    .filter(r => r.status !== 'Remediated')
    .sort((a, b) => (b.fairMetrics?.expectedAnnualLoss || 0) - (a.fairMetrics?.expectedAnnualLoss || 0))
    .slice(0, 4);

  // Top Critical Assets (dynamically sorted by financial exposure)
  const criticalAssets = [...assets]
    .filter(a => a.criticality === 'Tier 1' || a.criticality === 'Tier 2')
    .sort((a, b) => (b.financialExposure || 0) - (a.financialExposure || 0))
    .slice(0, 3);

  // Severity Distribution Data (dynamic from active risks)
  const activeRisks = risks.filter(r => r.status !== 'Remediated');
  const severityDistribution = [
    { name: 'Critical (P1)', count: activeRisks.filter(r => r.technicalSeverity === 'CRITICAL').length, color: '#f43f5e' },
    { name: 'High (P2)', count: activeRisks.filter(r => r.technicalSeverity === 'HIGH').length, color: '#f59e0b' },
    { name: 'Medium (P3)', count: activeRisks.filter(r => r.technicalSeverity === 'MEDIUM').length, color: '#38bdf8' },
    { name: 'Low (P4)', count: activeRisks.filter(r => r.technicalSeverity === 'LOW').length, color: '#64748b' }
  ].filter(d => d.count > 0);

  // Dynamic Knapsack Optimization Metrics
  const optimalCost = optimizationResult?.totalCost ? formatINR(optimizationResult.totalCost) : '₹28.00 L';
  const optimalReduction = optimizationResult?.totalRiskReduction ? formatINR(optimizationResult.totalRiskReduction) : '₹1.17 Cr';
  const optimalROSI = optimizationResult?.portfolioROSI !== undefined ? `+${optimizationResult.portfolioROSI}%` : '+318%';

  return (
    <div className="space-y-4 pb-10 animate-fade-in">
      {/* Section 1: Command Platform Breadcrumb & Your Security Program Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-zinc-400 font-medium">
          <span>Command Platform</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 font-semibold flex items-center space-x-1">
            <span>FintechCore Systems (Rapid Supplies)</span>
            <span className="text-[10px] text-zinc-500">▾</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1 pb-1">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Your Security Program</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Continuous quantitative exposure modeling, attack surface telemetry, and capital optimization
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs text-zinc-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-300 font-mono text-[11px]">Continuous Posture: Active</span>
            </span>
            <span className="text-zinc-700">·</span>
            <span className="text-[11px] font-mono text-zinc-400">{assets.length} Production Assets</span>
          </div>
        </div>
      </div>

      {/* Section 2: 4-Column Elevated KPI Cards (Exact match to reference top row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Assets / EAL */}
        <MetricCard
          icon={Server}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10 border-indigo-500/25"
          label="Total Financial Exposure (EAL)"
          value={formatINR(totalEstimatedExposure)}
          badge={{ text: '18%', positive: true }}
          viewDetailsText="View Details"
          onViewDetails={() => setActiveTab('risk')}
          tooltip="Expected Annual Loss evaluated across 7 production assets using FAIR loss frequency and magnitude"
        />

        {/* Card 2: Value at Risk (95% CI) */}
        <MetricCard
          icon={Shield}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10 border-purple-500/25"
          label="95% Value at Risk (VaR)"
          value={formatINR(valueAtRisk95Total)}
          badge={{ text: '12%', positive: false }}
          viewDetailsText="View Details"
          onViewDetails={() => setActiveTab('risk')}
          tooltip="Maximum probabilistic loss at a 95% confidence ceiling (1-in-20 year disaster risk)"
        />

        {/* Card 3: External & High Exposure Assets */}
        <MetricCard
          icon={AlertTriangle}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/25"
          label="Critical Asset Exposure"
          value={formatINR(criticalExposure)}
          badge={{ text: '22%', positive: true }}
          viewDetailsText="View Details"
          onViewDetails={() => setActiveTab('assets')}
          tooltip="Financial exposure concentrated in Tier-1 databases and public-facing gateways"
        />

        {/* Card 4: Cloud Assets / Optimal ROSI */}
        <MetricCard
          icon={TrendingDown}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border-emerald-500/25"
          label="Optimal Capital ROSI"
          value={optimalROSI}
          badge={{ text: '318%', positive: true }}
          viewDetailsText="View Details"
          onViewDetails={() => setActiveTab('optimizer')}
          tooltip="Knapsack optimization algorithm yield on ₹28L budget allocation"
        />
      </div>

      {/* Section 3: Middle Analytics Row (60/40 Split like Reference Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Card: New And Remediated Vulnerabilities (Trajectory Chart) */}
        <div className="lg:col-span-7 bg-[#161720]/95 border border-white/[0.07] hover:border-zinc-700/80 rounded-2xl p-5 shadow-2xl shadow-black/50 flex flex-col justify-between transition-all duration-300 backdrop-blur-sm">
          <div>
            {/* Header with Title and Timeframe Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  New And Remediated Vulnerabilities
                </h2>
                {/* Subtitle with orange bullet and grey bullet matching reference */}
                <div className="flex items-center space-x-3 text-xs mt-1">
                  <span className="flex items-center space-x-1.5 text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
                    <span className="font-semibold text-orange-400">49.8% in New</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-zinc-500" />
                    <span>368.3% in Remediated</span>
                  </span>
                </div>
              </div>

              {/* Timeframe pill selector: D M Y All Custom */}
              <div className="flex items-center space-x-1 bg-[#101117] p-1 rounded-xl border border-white/[0.06] text-xs self-start sm:self-auto shadow-inner">
                {['D', 'M', 'Y', 'All', 'Custom'].map((tf) => (
                  <button
                    key={tf}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      tf === 'All'
                        ? 'bg-gradient-to-r from-orange-500/30 to-amber-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Glowing Orange Area Spline Chart matching reference image */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={exposureTrendTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="warmOrangeGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                      <stop offset="60%" stopColor="#ea580c" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232532" vertical={false} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={val => `₹${val}Cr`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#12131a]/95 border border-zinc-700/90 p-3 rounded-xl text-xs space-y-1.5 shadow-2xl shadow-black/80 backdrop-blur-md">
                            <div className="font-semibold text-zinc-200 text-[11px]">{data.month}, 2024</div>
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-orange-500" />
                              <span className="text-orange-400 font-mono font-bold">
                                32.5% in New (₹{data.actual !== null ? data.actual : data.projected} Cr)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-zinc-400">
                              <span className="w-2 h-2 rounded-full bg-zinc-500" />
                              <span className="font-mono text-[11px]">132.8% Remediated</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">{data.event}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#warmOrangeGlow)"
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#fb923c"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ fill: '#fb923c', r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
            <span>Verified Net Impact: <strong className="text-emerald-400 font-mono font-semibold">-{formatINR(monthToDateReduction)}</strong></span>
            <button
              onClick={() => setActiveTab('simulator')}
              className="text-orange-400 hover:text-orange-300 font-medium flex items-center space-x-1 transition-colors"
            >
              <span>Test Sensitivity Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Card: Time to Assign and Close Investigations */}
        <div className="lg:col-span-5 bg-[#161720]/95 border border-white/[0.07] hover:border-zinc-700/80 rounded-2xl p-5 shadow-2xl shadow-black/50 flex flex-col justify-between transition-all duration-300 backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Time to Assign and Close Investigations
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              <strong className="text-orange-400 font-semibold">15%</strong> in average time to close in last 30d
            </p>

            {/* Distribution Bar/Scatter Chart */}
            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exposureByBusinessUnit} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232532" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} tickFormatter={v => `₹${v}Cr`} />
                  <Tooltip
                    formatter={(val) => [`₹${val} Cr`, 'Exposure']}
                    contentStyle={{ backgroundColor: '#12131a', borderColor: '#3f3f46', borderRadius: '0.75rem', fontSize: '11px' }}
                  />
                  <Bar dataKey="exposure" radius={[6, 6, 0, 0]}>
                    {exposureByBusinessUnit.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? '#f97316' : '#64748b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom legend with orange and grey dot matching reference */}
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Average time to Assign</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                <span>Average time to Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Bottom Operational Row (Top Remediations + Top Investigations) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Card: Top Remediations */}
        <div className="bg-[#161720]/95 border border-white/[0.07] hover:border-zinc-700/80 rounded-2xl p-5 shadow-2xl shadow-black/50 transition-all duration-300 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Top Remediations</h2>
              <p className="text-xs text-zinc-400">Actions prioritized by return on investment and loss reduction</p>
            </div>
            <button
              onClick={() => setActiveTab('remediation')}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center space-x-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* List of remediation items matching reference style */}
          <div className="space-y-2">
            {topRisks.slice(0, 4).map((risk, idx) => (
              <div
                key={risk.id}
                onClick={() => {
                  setSelectedRiskId(risk.id);
                  setActiveTab('risk');
                }}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-zinc-700/60 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-colors shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                      {risk.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono truncate">
                      Target: {risk.assetId} · {risk.vulnId}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg">
                    Risk Score {Math.round((risk.fairMetrics?.expectedAnnualLoss || 800000) / 10000)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Top Investigations By Priority */}
        <div className="bg-[#161720]/95 border border-white/[0.07] hover:border-zinc-700/80 rounded-2xl p-5 shadow-2xl shadow-black/50 transition-all duration-300 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Top Investigations By Priority</h2>
              <p className="text-xs text-zinc-400">Critical attack paths affecting mission-critical production assets</p>
            </div>
            <button
              onClick={() => setActiveTab('graph')}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center space-x-1 transition-colors"
            >
              <span>Attack Graph</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* List of investigations items matching reference style */}
          <div className="space-y-2">
            {criticalAssets.map((asset, idx) => (
              <div
                key={asset.id}
                onClick={() => setActiveTab('assets')}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-zinc-700/60 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-colors shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                      {asset.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono truncate">
                      {asset.businessUnit} · {asset.networkExposure}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <div className="text-xs font-mono font-bold text-white">
                    {formatINR(asset.financialExposure)}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Score {asset.criticalityScore}/10
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Context & Disclaimer Footer */}
      <div className="p-3 bg-[#0c1220]/80 border border-slate-800/80 rounded-xl text-[10px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Continuous quantitative risk engine calibrated to FAIR (Factor Analysis of Information Risk) standards. Values represent statistical modelled exposure.</span>
        </div>
        <button
          onClick={() => setActiveTab('compliance')}
          className="text-sky-400 hover:text-sky-300 font-medium shrink-0 transition-colors"
        >
          4 Regulatory Frameworks Synced →
        </button>
      </div>
    </div>
  );
};
