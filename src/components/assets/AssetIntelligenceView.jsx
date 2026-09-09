import React, { useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { formatINR } from '../../core/riskEngine';
import { CriticalityBadge } from '../common/Badge';

export const AssetIntelligenceView = () => {
  const { assets, setSelectedAssetId, setActiveTab } = useRiskStore();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [exposureFilter, setExposureFilter] = useState('ALL');

  const filteredAssets = assets.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.businessUnit.toLowerCase().includes(search.toLowerCase()) ||
      a.ipAddress.toLowerCase().includes(search.toLowerCase());

    const matchesTier = tierFilter === 'ALL' || a.criticality === tierFilter;
    const matchesExposure = exposureFilter === 'ALL' || a.networkExposure === exposureFilter;

    return matchesSearch && matchesTier && matchesExposure;
  });

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Enterprise Asset Inventory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mission-critical systems, operational data classification, and baseline control effectiveness
          </p>
        </div>
      </div>

      {/* Top 4-Metric Asset Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-zinc-600">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total Production Assets</div>
          <div className="text-xl font-bold text-white font-mono mt-0.5">{assets.length} Systems</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Cataloged infrastructure</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-rose-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Tier-1 Mission Critical</div>
          <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">
            {assets.filter(a => a.criticality === 'Tier 1').length} Assets
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Direct revenue impact</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-orange-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Avg Hourly Downtime</div>
          <div className="text-xl font-bold text-orange-400 font-mono mt-0.5">
            {formatINR(Math.round(assets.reduce((sum, a) => sum + (a.hourlyDowntimeCost || 0), 0) / (assets.length || 1)))}/hr
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Operational outage cost</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-emerald-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total Portfolio Exposure</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
            {formatINR(assets.reduce((sum, a) => sum + (a.financialExposure || 0), 0))}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Cumulative asset valuation</div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161720]/95 p-3.5 rounded-2xl border border-white/[0.07] text-xs shadow-xl shadow-black/40">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets by name, IP, business unit..."
            className="w-full bg-[#101117] border border-zinc-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/60 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-400 text-[11px] font-medium">Criticality:</span>
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="bg-[#101117] border border-zinc-700/60 text-zinc-300 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-orange-500/60 transition-colors"
            >
              <option value="ALL">All Tiers</option>
              <option value="Tier 1">Tier 1 (Mission Critical)</option>
              <option value="Tier 2">Tier 2 (High)</option>
              <option value="Tier 3">Tier 3 (Moderate)</option>
              <option value="Tier 4">Tier 4 (Low)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-400 text-[11px] font-medium">Exposure:</span>
            <select
              value={exposureFilter}
              onChange={e => setExposureFilter(e.target.value)}
              className="bg-[#101117] border border-zinc-700/60 text-zinc-300 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-orange-500/60 transition-colors"
            >
              <option value="ALL">All Network Vectors</option>
              <option value="Internet-Facing">Internet-Facing</option>
              <option value="DMZ">DMZ</option>
              <option value="Internal Protected">Internal Protected</option>
              <option value="Isolated Air-Gapped">Isolated Air-Gapped</option>
            </select>
          </div>
        </div>
      </div>

      {/* Asset Inventory Table */}
      <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#101117] border-b border-zinc-800/80 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="p-3 pl-4">Asset ID & Name</th>
                <th className="p-3">Business Unit & Owner</th>
                <th className="p-3 text-center">Criticality</th>
                <th className="p-3">Exposure Vector</th>
                <th className="p-3">Data Sensitivity</th>
                <th className="p-3 text-right">Hourly Downtime</th>
                <th className="p-3 text-right">Financial Exposure</th>
                <th className="p-3 text-center">Controls</th>
                <th className="p-3 pr-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredAssets.map(asset => {
                const activeControlsCount = asset.existingControls.filter(c => c.status === 'Active').length;
                return (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className="hover:bg-[#111a2e]/60 cursor-pointer transition-colors group"
                  >
                    <td className="p-3 pl-4">
                      <div className="font-medium text-slate-100 group-hover:text-sky-300 transition-colors">{asset.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5 mt-0.5">
                        <span className="text-slate-300 font-semibold">{asset.id}</span>
                        <span className="text-slate-600">·</span>
                        <span>{asset.type}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400">{asset.ipAddress}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="text-slate-200 font-medium">{asset.businessUnit}</div>
                      <div className="text-[11px] text-slate-400">{asset.ownerTeam}</div>
                    </td>

                    <td className="p-3 text-center">
                      <CriticalityBadge criticality={asset.criticality} />
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Score {asset.criticalityScore}/10
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#080c14] border border-slate-700/60 text-slate-300">
                        {asset.networkExposure}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="text-slate-300">{asset.dataSensitivity}</span>
                    </td>

                    <td className="p-3 text-right font-mono text-slate-300">
                      ₹{((asset.hourlyDowntimeCost || 0) / 100000).toFixed(1)} Lakhs
                    </td>

                    <td className="p-3 text-right">
                      <div className="font-mono font-bold text-amber-400">
                        {formatINR(asset.financialExposure)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {asset.activeVulnerabilitiesCount} open issues
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <span className="font-mono text-[11px] text-slate-300 bg-[#080c14] px-2 py-0.5 rounded border border-slate-800">
                        {activeControlsCount}/{asset.existingControls.length} active
                      </span>
                    </td>

                    <td className="p-3 pr-4 text-center" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedAssetId(asset.id)}
                        className="p-1.5 hover:bg-slate-800/80 text-slate-400 hover:text-white rounded-lg transition-colors"
                        title="View Asset Profile"
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

        {/* Footer */}
        <div className="p-3 px-4 bg-[#080c14] border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Tracking <strong className="text-slate-200 font-mono">{filteredAssets.length}</strong> enterprise infrastructure assets</span>
          <button
            onClick={() => setActiveTab('graph')}
            className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            Attack Dependency Graph →
          </button>
        </div>
      </div>
    </div>
  );
};
