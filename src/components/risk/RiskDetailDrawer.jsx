import React from 'react';
import {
  X,
  Server,
  ArrowRight,
  Info,
  GitFork,
  Shield,
  Zap
} from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { formatINR } from '../../core/riskEngine';
import { getAssetAttackPath, getAssetBlastRadius } from '../../core/graphEngine';
import { SeverityBadge, CriticalityBadge, Badge } from '../common/Badge';

export const RiskDetailDrawer = () => {
  const {
    selectedRiskId,
    setSelectedRiskId,
    risks,
    assets,
    vulnerabilities,
    setSelectedAssetId,
    setActiveTab
  } = useRiskStore();

  if (!selectedRiskId) return null;

  const risk = risks.find(r => r.id === selectedRiskId);
  if (!risk) return null;

  const asset = assets.find(a => a.id === risk.assetId);
  const vuln = vulnerabilities.find(v => v.id === risk.vulnId);
  const metrics = risk.fairMetrics;
  const breakdown = metrics?.lossBreakdown || {};
  const attackPath = getAssetAttackPath(risk.assetId);
  const blastRadius = getAssetBlastRadius(risk.assetId);

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-slate-900 border-l border-slate-700 shadow-2xl z-40 flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <SeverityBadge severity={risk.technicalSeverity} />
          <span className="text-xs font-mono text-slate-400">{risk.id}</span>
          <Badge variant="purple">{risk.contextualPriority}</Badge>
        </div>

        <button
          onClick={() => setSelectedRiskId(null)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs text-slate-300">
        {/* Risk Title & Context */}
        <div>
          <h2 className="text-base font-bold text-white mb-1">{risk.title}</h2>
          <p className="text-slate-400 leading-relaxed text-xs">
            {vuln?.description || 'Identified exposure based on live telemetry and asset posture.'}
          </p>
        </div>

        {/* Financial Exposure Box */}
        <div className="bg-slate-950 border border-slate-800 rounded p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider">
            <span>Modelled Financial Exposure</span>
            <span>FAIR Distribution</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {formatINR(metrics?.expectedAnnualLoss || 0)}
              </div>
              <div className="text-[11px] text-slate-400">Expected Annual Loss (Mean)</div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold font-mono text-slate-200">
                {formatINR(metrics?.valueAtRisk95 || 0)}
              </div>
              <div className="text-[11px] text-slate-400">95% Value at Risk (VaR)</div>
            </div>
          </div>

          {/* Uncertainty Confidence Range (P10 - P90) */}
          {metrics?.confidenceRange && (
            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                <span>Optimistic (P10): <strong className="text-slate-300">{formatINR(metrics.confidenceRange.p10)}</strong></span>
                <span>Pessimistic (P90): <strong className="text-slate-300">{formatINR(metrics.confidenceRange.p90)}</strong></span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                <div className="bg-amber-400/80 h-full rounded" style={{ width: '60%' }} />
              </div>
            </div>
          )}
        </div>

        {/* Lateral Attack Path Section (Connected to Graph Engine) */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <GitFork className="w-3.5 h-3.5 text-sky-400" />
            <span>Attack Propagation & Lateral Traversal Path</span>
          </h3>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
            <div className="flex items-center space-x-1 overflow-x-auto py-1">
              {attackPath.map((step, idx) => (
                <React.Fragment key={idx}>
                  <span
                    className={`px-2 py-1 rounded text-[11px] font-mono border shrink-0 ${
                      step.id === risk.assetId
                        ? 'bg-red-950/80 text-red-300 border-red-800 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {step.label.split(' ')[0]}
                  </span>
                  {idx < attackPath.length - 1 && (
                    <span className="text-slate-600 font-mono">➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Downstream Blast Radius:</span>
              <Badge variant={blastRadius.severity === 'CRITICAL' ? 'critical' : blastRadius.severity === 'HIGH' ? 'high' : 'info'}>
                {blastRadius.severity} Blast Radius
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">{blastRadius.description}</p>
          </div>
        </div>

        {/* 5-Factor Loss Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Single Incident Loss Magnitude (SLE)
            </h3>
            <span className="text-[11px] font-mono font-bold text-slate-200">
              Total: {formatINR(breakdown.totalLossMagnitude || 0)}
            </span>
          </div>

          <div className="space-y-1.5 bg-slate-950/80 p-3 rounded border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">1. Direct Downtime & Business Interruption</span>
              <span className="font-mono text-slate-200">{formatINR(breakdown.downtimeLoss || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">2. Customer Data Breach Liability (DPDP Act)</span>
              <span className="font-mono text-slate-200">{formatINR(breakdown.dataBreachLiability || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">3. Incident Response & Forensics</span>
              <span className="font-mono text-slate-200">{formatINR(breakdown.incidentResponse || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">4. Regulatory Penalty Tier (RBI / SEBI)</span>
              <span className="font-mono text-slate-200">{formatINR(breakdown.regulatoryFines || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">5. System Recovery & Rebuild</span>
              <span className="font-mono text-slate-200">{formatINR(breakdown.recoveryCost || 0)}</span>
            </div>
          </div>
        </div>

        {/* Contextual Drivers */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Why is this Risk Prioritized?</span>
          </h3>
          <div className="space-y-1.5">
            {(risk.keyDrivers || []).map((driver, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 text-xs text-slate-300 bg-slate-950 p-2 rounded border border-slate-800"
              >
                <span className="text-amber-400 font-bold">•</span>
                <span>{driver}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Affected Asset Context */}
        {asset && (
          <div className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Affected Target Asset</span>
              <div className="font-semibold text-slate-200">{asset.name}</div>
              <div className="text-[11px] text-slate-400">
                {asset.businessUnit} · Downtime: ₹{((asset.hourlyDowntimeCost || 0) / 100000).toFixed(1)}L/hr
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedAssetId(asset.id);
                setActiveTab('assets');
                setSelectedRiskId(null);
              }}
              className="text-sky-400 hover:text-sky-300 text-xs flex items-center space-x-1 font-medium"
            >
              <span>Inspect Asset</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
        <button
          onClick={() => {
            setActiveTab('graph');
            setSelectedRiskId(null);
          }}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1.5"
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>View in Topology Graph</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('optimizer');
            setSelectedRiskId(null);
          }}
          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition-colors"
        >
          <span>Find Optimal Mitigation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
