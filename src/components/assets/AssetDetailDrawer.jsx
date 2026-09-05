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
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-slate-900 border-l border-slate-700 shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <Server className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono text-slate-400">{asset.id}</span>
          <CriticalityBadge criticality={asset.criticality} />
        </div>

        <button
          onClick={() => setSelectedAssetId(null)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs text-slate-300">
        {/* Asset Header */}
        <div>
          <h2 className="text-base font-bold text-white mb-1">{asset.name}</h2>
          <p className="text-slate-400">
            {asset.businessUnit} · Owned by {asset.ownerTeam}
          </p>
        </div>

        {/* Financial Exposure KPI Box */}
        <div className="bg-slate-950 border border-slate-800 rounded p-4 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-[11px] uppercase tracking-wider">
            <span>Asset Financial Exposure</span>
            <span>Criticality Score: <strong className="text-slate-200 font-mono">{asset.criticalityScore}/10</strong></span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-amber-400">
              {formatINR(asset.financialExposure)}
            </div>
            <div className="text-right text-slate-300">
              <span className="font-mono font-semibold">₹{((asset.hourlyDowntimeCost || 0) / 100000).toFixed(1)}L</span>
              <div className="text-[10px] text-slate-400">Hourly Downtime Impact</div>
            </div>
          </div>
        </div>

        {/* Live Criticality Mutation Tool */}
        <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-300 font-medium text-[11px]">Adjust Criticality Tier:</span>
          </div>
          <select
            value={asset.criticality}
            onChange={handleCriticalityChange}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 font-mono focus:outline-none focus:border-sky-500"
          >
            <option value="Tier 1">Tier 1 (Mission Critical)</option>
            <option value="Tier 2">Tier 2 (High)</option>
            <option value="Tier 3">Tier 3 (Moderate)</option>
            <option value="Tier 4">Tier 4 (Isolated/Low)</option>
          </select>
        </div>

        {/* Technical Attributes Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[11px]">Network Exposure</span>
            <span className="text-slate-200 font-medium font-mono">{asset.networkExposure}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Data Classification</span>
            <span className="text-slate-200 font-medium">{asset.dataSensitivity}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Endpoint / Host</span>
            <span className="text-slate-200 font-mono">{asset.ipAddress}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Protected Record Count</span>
            <span className="text-slate-200 font-mono">
              {asset.recordsCount ? asset.recordsCount.toLocaleString() : '0'}
            </span>
          </div>
        </div>

        {/* Security Controls Baseline with Interactive Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Active Security Controls (Click to Toggle Status)</span>
            </h3>
          </div>

          <div className="space-y-1.5">
            {asset.existingControls.map((control, idx) => (
              <div
                key={idx}
                onClick={() => toggleControlStatus(asset.id, control.name)}
                className="bg-slate-950 hover:bg-slate-850 p-2.5 rounded border border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                title="Click to toggle control between Active and Degraded"
              >
                <div>
                  <div className="font-medium text-slate-200">{control.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Effectiveness: {(control.effectiveness * 100).toFixed(0)}% · Click to toggle
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
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Associated Risks ({assetRisks.length})</span>
          </h3>

          <div className="space-y-1.5">
            {assetRisks.map(risk => (
              <div
                key={risk.id}
                onClick={() => {
                  setSelectedRiskId(risk.id);
                  setActiveTab('risk');
                  setSelectedAssetId(null);
                }}
                className="bg-slate-950 hover:bg-slate-850 p-2.5 rounded border border-slate-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">{risk.title}</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {formatINR(risk.fairMetrics?.expectedAnnualLoss || 0)} EAL
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-mono">
                  <span>Priority: {risk.contextualPriority}</span>
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
