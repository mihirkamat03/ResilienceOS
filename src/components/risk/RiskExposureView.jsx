import React, { useState } from 'react';
import {
  ArrowUpDown,
  Search,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { formatINR } from '../../core/riskEngine';
import { SeverityBadge, CriticalityBadge, Badge } from '../common/Badge';

export const RiskExposureView = () => {
  const { risks, assets, vulnerabilities, setSelectedRiskId } = useRiskStore();

  const [searchFilter, setSearchFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [sortField, setSortField] = useState('EAL');
  const [sortAsc, setSortAsc] = useState(false);

  const getAsset = (assetId) => assets.find(a => a.id === assetId);
  const getVuln = (vulnId) => vulnerabilities.find(v => v.id === vulnId);

  const filteredRisks = risks.filter(r => {
    const vuln = getVuln(r.vulnId);
    const asset = getAsset(r.assetId);
    const matchesSearch =
      r.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (vuln?.cveId || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (asset?.name || '').toLowerCase().includes(searchFilter.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || r.technicalSeverity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const sortedRisks = [...filteredRisks].sort((a, b) => {
    const assetA = getAsset(a.assetId);
    const assetB = getAsset(b.assetId);
    const vulnA = getVuln(a.vulnId);
    const vulnB = getVuln(b.vulnId);

    let valA = 0;
    let valB = 0;

    if (sortField === 'EAL') {
      valA = a.fairMetrics?.expectedAnnualLoss || 0;
      valB = b.fairMetrics?.expectedAnnualLoss || 0;
    } else if (sortField === 'CVSS') {
      valA = vulnA?.cvssV3 || 0;
      valB = vulnB?.cvssV3 || 0;
    } else if (sortField === 'ASSET_CRIT') {
      valA = assetA?.criticalityScore || 0;
      valB = assetB?.criticalityScore || 0;
    } else if (sortField === 'VAR') {
      valA = a.fairMetrics?.valueAtRisk95 || 0;
      valB = b.fairMetrics?.valueAtRisk95 || 0;
    }

    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-base font-bold text-white tracking-tight">Risk & Financial Exposure Registry</h1>
            <span className="text-[10px] bg-[#0c1220] text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30 font-mono font-medium">
              FAIR Prioritization
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Prioritizing technical vulnerabilities based on business asset criticality, exposure vectors, and quantitative annual loss
          </p>
        </div>
      </div>

      {/* Top 4-Metric Registry Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-zinc-600">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total Scenarios</div>
          <div className="text-xl font-bold text-white font-mono mt-0.5">{risks.length} Scenarios</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Continuous model state</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-rose-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">P1 Immediate SLA</div>
          <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">
            {risks.filter(r => r.contextualPriority === 'P1 - Immediate').length} Active
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Requires direct mitigation</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-orange-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">CISA KEV Feeds</div>
          <div className="text-xl font-bold text-orange-400 font-mono mt-0.5">
            {vulnerabilities.filter(v => v.cisaKev).length} Exploited
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Active in wild exploitation</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-emerald-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Active Portfolio EAL</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
            {formatINR(risks.filter(r => r.status !== 'Remediated').reduce((sum, r) => sum + (r.fairMetrics?.expectedAnnualLoss || 0), 0))}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Expected Annual Loss</div>
        </div>
      </div>

      {/* Contextual Prioritization Note */}
      <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 flex items-start space-x-3 text-xs shadow-xl shadow-black/40 border-l-4 border-l-orange-500">
        <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <p className="text-zinc-300 leading-relaxed text-[11px]">
          <strong className="text-white font-semibold">Business Context vs Technical CVSS:</strong> Notice that <span className="font-mono text-orange-400 font-bold">RSK-001 (PostgreSQL CVSS 7.5)</span> ranks <strong>#1 in business priority (₹84.0L EAL)</strong> because it affects the Tier-1 Core Banking Database. Conversely, <span className="font-mono text-zinc-400">RSK-006 (OpenSSH CVSS 9.8)</span> represents only <strong>₹300 EAL</strong> due to its isolated sandbox environment.
        </p>
      </div>

      {/* Controls & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161720]/95 p-3.5 rounded-2xl border border-white/[0.07] text-xs shadow-xl shadow-black/40">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Filter by CVE, title, asset ID..."
            className="w-full bg-[#101117] border border-zinc-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/60 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Severity Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-400 text-[11px] font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="bg-[#101117] border border-zinc-700/60 text-zinc-300 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-orange-500/60 transition-colors"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px] font-medium">Sort:</span>
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value)}
              className="bg-[#080c14] border border-slate-700/60 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-500/60"
            >
              <option value="EAL">Expected Annual Loss (EAL)</option>
              <option value="VAR">Value at Risk (95% VaR)</option>
              <option value="CVSS">Technical CVSS</option>
              <option value="ASSET_CRIT">Asset Criticality</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              title="Toggle Sort Direction"
              className="p-1.5 bg-[#080c14] border border-slate-700/60 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Enterprise Risk Table */}
      <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#101117] border-b border-zinc-800/80 text-zinc-400 text-[10.5px] font-semibold uppercase tracking-wider">
                <th className="p-3.5">Risk & Vulnerability</th>
                <th className="p-3.5">Affected Asset</th>
                <th className="p-3.5 text-center">Tech Severity</th>
                <th className="p-3.5 text-center">Business Priority</th>
                <th className="p-3.5 text-right">Ann. Prob. (LEF)</th>
                <th className="p-3.5 text-right">Single Loss (SLE)</th>
                <th className="p-3.5 text-right">Expected Loss (EAL)</th>
                <th className="p-3.5 text-right">95% VaR</th>
                <th className="p-3.5 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {sortedRisks.map(risk => {
                const asset = getAsset(risk.assetId);
                const vuln = getVuln(risk.vulnId);
                const isRemediated = risk.status === 'Remediated';

                return (
                  <tr
                    key={risk.id}
                    onClick={() => setSelectedRiskId(risk.id)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition-all duration-150 ${
                      isRemediated ? 'opacity-40 bg-[#090d16]/40' : ''
                    }`}
                  >
                    {/* Risk & Vuln */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-100">{risk.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5 mt-0.5">
                        <span className="text-sky-400 font-medium">{risk.id}</span>
                        <span>·</span>
                        <span>{vuln?.cveId}</span>
                        {vuln?.cisaKev && (
                          <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.2 rounded-full border border-red-800/80 font-bold font-mono">
                            CISA KEV
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Asset */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{asset?.name || risk.assetId}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <CriticalityBadge criticality={asset?.criticality || 'Tier 3'} />
                        <span>·</span>
                        <span>{asset?.networkExposure}</span>
                      </div>
                    </td>

                    {/* Tech Severity */}
                    <td className="p-3.5 text-center">
                      <SeverityBadge severity={risk.technicalSeverity} />
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        CVSS {vuln?.cvssV3?.toFixed(1) || 'N/A'}
                      </div>
                    </td>

                    {/* Contextual Priority */}
                    <td className="p-3.5 text-center">
                      <Badge
                        variant={
                          risk.contextualPriority.startsWith('P1')
                            ? 'critical'
                            : risk.contextualPriority.startsWith('P2')
                            ? 'high'
                            : 'neutral'
                        }
                      >
                        {risk.contextualPriority}
                      </Badge>
                    </td>

                    {/* Loss Event Frequency (LEF) */}
                    <td className="p-3.5 text-right font-mono text-slate-300">
                      {(risk.fairMetrics.lossEventFrequency * 100).toFixed(0)}% / yr
                      <div className="text-[10px] text-slate-500 font-sans">
                        {risk.fairMetrics.threatEventFrequency} att/yr
                      </div>
                    </td>

                    {/* Single Loss Expectancy (SLE) */}
                    <td className="p-3.5 text-right font-mono text-slate-300 font-medium">
                      {formatINR(risk.fairMetrics.lossBreakdown.totalLossMagnitude)}
                    </td>

                    {/* Expected Annual Loss (EAL) */}
                    <td className="p-3.5 text-right">
                      <div className="font-mono font-bold text-amber-400 text-sm">
                        {formatINR(risk.fairMetrics.expectedAnnualLoss)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        P10: {formatINR(risk.fairMetrics.confidenceRange.p10)}
                      </div>
                    </td>

                    {/* VaR 95% */}
                    <td className="p-3.5 text-right font-mono text-slate-200 font-semibold">
                      {formatINR(risk.fairMetrics.valueAtRisk95)}
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedRiskId(risk.id)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                        title="Inspect Risk Detail"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 bg-[#090d16] border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Displaying <strong className="text-slate-200">{sortedRisks.length}</strong> active quantified risk scenarios</span>
          <span>
            Total Modelled EAL:{' '}
            <strong className="font-mono text-amber-400 font-bold text-xs ml-1">
              {formatINR(
                sortedRisks
                  .filter(r => r.status !== 'Remediated')
                  .reduce((sum, r) => sum + r.fairMetrics.expectedAnnualLoss, 0)
              )}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
