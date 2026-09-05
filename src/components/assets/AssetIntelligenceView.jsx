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
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Enterprise Asset Inventory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mission-critical systems, operational data classification, and baseline control effectiveness
          </p>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded border border-slate-800 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets by name, IP, business unit..."
            className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-slate-600"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">Criticality:</span>
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-slate-600"
            >
              <option value="ALL">All Tiers</option>
              <option value="Tier 1">Tier 1 (Mission Critical)</option>
              <option value="Tier 2">Tier 2 (High)</option>
              <option value="Tier 3">Tier 3 (Moderate)</option>
              <option value="Tier 4">Tier 4 (Low)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">Exposure:</span>
            <select
              value={exposureFilter}
              onChange={e => setExposureFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-slate-600"
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
      <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] font-medium tracking-wider">
                <th className="p-3">Asset ID & Name</th>
                <th className="p-3">Business Unit & Owner</th>
                <th className="p-3 text-center">Criticality</th>
                <th className="p-3">Exposure Vector</th>
                <th className="p-3">Data Sensitivity</th>
                <th className="p-3 text-right">Hourly Downtime</th>
                <th className="p-3 text-right">Financial Exposure</th>
                <th className="p-3 text-center">Controls</th>
                <th className="p-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.map(asset => {
                const activeControlsCount = asset.existingControls.filter(c => c.status === 'Active').length;
                return (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className="hover:bg-slate-850/60 cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-medium text-slate-100">{asset.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5 mt-0.5">
                        <span className="text-slate-300">{asset.id}</span>
                        <span>·</span>
                        <span>{asset.type}</span>
                        <span>·</span>
                        <span>{asset.ipAddress}</span>
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
                      <span className="font-mono text-slate-300">{asset.networkExposure}</span>
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
                      <div className="text-[10px] text-slate-400">
                        {asset.activeVulnerabilitiesCount} open issues
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <span className="font-mono text-slate-300">
                        {activeControlsCount}/{asset.existingControls.length} active
                      </span>
                    </td>

                    <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedAssetId(asset.id)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
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
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Tracking {filteredAssets.length} enterprise infrastructure assets</span>
          <button
            onClick={() => setActiveTab('graph')}
            className="text-sky-400 hover:text-sky-300"
          >
            Attack Dependency Graph →
          </button>
        </div>
      </div>
    </div>
  );
};
