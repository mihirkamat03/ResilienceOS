import React from 'react';
import { X, Server, Shield, AlertTriangle, ArrowRight, Sliders } from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { formatINR } from '../../core/riskEngine';
import { CriticalityBadge, Badge } from '../common/Badge';

export const AssetDetailDrawer = () => {
  const {
    selectedAssetId,
    setSelectedAssetId,
    assets,
    risks,
    setSelectedRiskId,
    setActiveTab,
    toggleControlStatus,
    updateAssetCriticality
  } = useRiskStore();

  if (!selectedAssetId) return null;

  const asset = assets.find(a => a.id === selectedAssetId);
  if (!asset) return null;

  const assetRisks = risks.filter(r => r.assetId === asset.id);

  const handleCriticalityChange = (e) => {
    const tier = e.target.value;
    let score = 8.0;
    let hourlyCost = 300000;
    if (tier === 'Tier 1') {
      score = 9.8;
      hourlyCost = 600000;
    } else if (tier === 'Tier 2') {
      score = 8.0;
      hourlyCost = 250000;
    } else if (tier === 'Tier 3') {
      score = 5.0;
      hourlyCost = 50000;
    } else {
      score = 2.0;
      hourlyCost = 5000;
    }
    updateAssetCriticality(asset.id, tier, score, hourlyCost);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#12131b] border-l border-white/[0.08] shadow-2xl shadow-black/80 z-40 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 bg-[#161720] border-b border-white/[0.07] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Server className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono text-zinc-300 font-semibold">{asset.id}</span>
          <CriticalityBadge criticality={asset.criticality} />
        </div>

        <button
          onClick={() => setSelectedAssetId(null)}
          className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs text-zinc-300">
        {/* Asset Header */}
        <div>
          <h2 className="text-lg font-bold text-white mb-1">{asset.name}</h2>
          <p className="text-zinc-400">
            {asset.businessUnit} · Owned by <span className="text-zinc-200 font-medium">{asset.ownerTeam}</span>
          </p>
        </div>

        {/* Financial Exposure KPI Box */}
        <div className="bg-[#161720] border border-white/[0.07] rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex justify-between items-center text-zinc-400 text-[11px] uppercase tracking-wider font-medium">
            <span>Asset Financial Exposure</span>
            <span>Criticality Score: <strong className="text-zinc-200 font-mono">{asset.criticalityScore}/10</strong></span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold font-mono text-amber-400">
              {formatINR(asset.financialExposure)}
            </div>
            <div className="text-right text-zinc-300">
              <span className="font-mono font-bold text-white">₹{((asset.hourlyDowntimeCost || 0) / 100000).toFixed(1)}L</span>
              <div className="text-[10px] text-zinc-400">Hourly Downtime Impact</div>
            </div>
          </div>
        </div>

        {/* Live Criticality Mutation Tool */}
        <div className="bg-[#161720] p-3.5 rounded-2xl border border-white/[0.07] flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-300 font-medium text-xs">Adjust Criticality Tier:</span>
          </div>
          <select
            value={asset.criticality}
            onChange={handleCriticalityChange}
            className="bg-[#111218] border border-white/[0.08] text-zinc-200 text-xs rounded-xl px-3 py-1.5 font-mono focus:outline-none focus:border-amber-500/50 transition-colors shadow-sm"
          >
            <option value="Tier 1">Tier 1 (Mission Critical)</option>
            <option value="Tier 2">Tier 2 (High)</option>
            <option value="Tier 3">Tier 3 (Moderate)</option>
            <option value="Tier 4">Tier 4 (Isolated/Low)</option>
          </select>
        </div>

        {/* Technical Attributes Grid */}
        <div className="grid grid-cols-2 gap-3.5 bg-[#161720] p-4 rounded-2xl border border-white/[0.07] shadow-sm">
          <div>
            <span className="text-zinc-400 block text-[11px] mb-1">Network Exposure</span>
            <span className="text-zinc-200 font-medium font-mono inline-block px-2.5 py-0.5 bg-[#111218] border border-white/[0.06] rounded-md text-[11px]">
              {asset.networkExposure}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px] mb-1">Data Classification</span>
            <span className="text-zinc-200 font-medium">{asset.dataSensitivity}</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px] mb-1">Endpoint / Host</span>
            <span className="text-zinc-200 font-mono">{asset.ipAddress}</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px] mb-1">Protected Record Count</span>
            <span className="text-zinc-200 font-mono">
              {asset.recordsCount ? asset.recordsCount.toLocaleString() : '0'}
            </span>
          </div>
        </div>

        {/* Security Controls Baseline with Interactive Toggle */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Active Security Controls (Click to Toggle Status)</span>
            </h3>
          </div>

          <div className="space-y-2">
            {asset.existingControls.map((control, idx) => (
              <div
                key={idx}
                onClick={() => toggleControlStatus(asset.id, control.name)}
                className="bg-[#161720] hover:bg-[#1a1c27] p-3.5 rounded-2xl border border-white/[0.07] hover:border-white/[0.14] flex items-center justify-between cursor-pointer transition-all shadow-sm"
                title="Click to toggle control between Active and Degraded"
              >
                <div>
                  <div className="font-semibold text-zinc-200">{control.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    Effectiveness: <span className="text-amber-400 font-bold">{(control.effectiveness * 100).toFixed(0)}%</span> · Click to toggle
                  </div>
                </div>
                <Badge
                  variant={
                    control.status === 'Active'
                      ? 'low'
                      : control.status === 'Degraded'
                      ? 'high'
                      : 'critical'
                  }
                >
                  {control.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Risks */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <span>Associated Risks ({assetRisks.length})</span>
          </h3>

          <div className="space-y-2">
            {assetRisks.map(risk => (
              <div
                key={risk.id}
                onClick={() => {
                  setSelectedRiskId(risk.id);
                  setActiveTab('risk');
                  setSelectedAssetId(null);
                }}
                className="bg-[#161720] hover:bg-[#1a1c27] p-3.5 rounded-2xl border border-white/[0.07] hover:border-amber-500/40 cursor-pointer transition-all group shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200 group-hover:text-amber-300 transition-colors">{risk.title}</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {formatINR(risk.fairMetrics?.expectedAnnualLoss || 0)} EAL
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-2 flex justify-between font-mono">
                  <span>Priority: <strong className="text-zinc-200">{risk.contextualPriority}</strong></span>
                  <span>LEF: {risk.fairMetrics?.lossEventFrequency || 0.1}/yr</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
