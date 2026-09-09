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
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#12131b] border-l border-white/[0.08] shadow-2xl shadow-black/80 z-40 flex flex-col animate-slide-in-right">
      {/* Drawer Header */}
      <div className="p-4 bg-[#161720] border-b border-white/[0.07] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <SeverityBadge severity={risk.technicalSeverity} />
          <span className="text-xs font-mono text-zinc-300 font-semibold">{risk.id}</span>
          <Badge variant="purple">{risk.contextualPriority}</Badge>
        </div>

        <button
          onClick={() => setSelectedRiskId(null)}
          className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs text-zinc-300">
        {/* Risk Title & Context */}
        <div>
          <h2 className="text-lg font-bold text-white mb-1">{risk.title}</h2>
          <p className="text-zinc-400 leading-relaxed text-xs">
            {vuln?.description || 'Identified exposure based on live telemetry and asset posture.'}
          </p>
        </div>

        {/* Financial Exposure Box */}
        <div className="bg-[#161720] border border-white/[0.07] rounded-2xl p-4 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
            <span>Modelled Financial Exposure</span>
            <span className="font-mono text-amber-400 font-semibold">FAIR Distribution</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-extrabold font-mono text-amber-400">
                {formatINR(metrics?.expectedAnnualLoss || 0)}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Expected Annual Loss (Mean)</div>
            </div>

            <div className="text-right">
              <div className="text-xl font-bold font-mono text-white">
                {formatINR(metrics?.valueAtRisk95 || 0)}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">95% Value at Risk (VaR)</div>
            </div>
          </div>

          {/* Uncertainty Confidence Range (P10 - P90) */}
          {metrics?.confidenceRange && (
            <div className="pt-3 border-t border-white/[0.06]">
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1.5 font-mono">
                <span>Optimistic (P10): <strong className="text-zinc-200 font-semibold">{formatINR(metrics.confidenceRange.p10)}</strong></span>
                <span>Pessimistic (P90): <strong className="text-zinc-200 font-semibold">{formatINR(metrics.confidenceRange.p90)}</strong></span>
              </div>
              <div className="w-full bg-[#111218] h-2 rounded-full overflow-hidden border border-white/[0.04]">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          )}
        </div>

        {/* Lateral Attack Path Section */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
            <GitFork className="w-3.5 h-3.5 text-amber-400" />
            <span>Attack Propagation & Lateral Traversal Path</span>
          </h3>

          <div className="bg-[#161720] p-4 rounded-2xl border border-white/[0.07] space-y-3 shadow-sm">
            <div className="flex items-center space-x-2 overflow-x-auto py-1">
              {attackPath.map((step, idx) => (
                <React.Fragment key={idx}>
                  <span
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono border shrink-0 transition-all ${
                      step.id === risk.assetId
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 font-bold shadow-sm'
                        : 'bg-[#111218] text-zinc-300 border-white/[0.06]'
                    }`}
                  >
                    {step.label.split(' ')[0]}
                  </span>
                  {idx < attackPath.length - 1 && (
                    <span className="text-amber-400/80 font-mono text-xs">➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Downstream Blast Radius:</span>
              <Badge variant={blastRadius.severity === 'CRITICAL' ? 'critical' : blastRadius.severity === 'HIGH' ? 'high' : 'info'}>
                {blastRadius.severity} Blast Radius
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">{blastRadius.description}</p>
          </div>
        </div>

        {/* 5-Factor Loss Breakdown */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Single Incident Loss Magnitude (SLE)
            </h3>
            <span className="text-[11px] font-mono font-bold text-zinc-200">
              Total: {formatINR(breakdown.totalLossMagnitude || 0)}
            </span>
          </div>

          <div className="bg-[#161720] p-4 rounded-2xl border border-white/[0.07] divide-y divide-white/[0.05] shadow-sm">
            <div className="flex justify-between items-center text-xs pb-2.5">
              <span className="text-zinc-300">1. Direct Downtime & Business Interruption</span>
              <span className="font-mono text-zinc-100 font-semibold">{formatINR(breakdown.downtimeLoss || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs py-2.5">
              <span className="text-zinc-300">2. Customer Data Breach Liability (DPDP Act)</span>
              <span className="font-mono text-zinc-100 font-semibold">{formatINR(breakdown.dataBreachLiability || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs py-2.5">
              <span className="text-zinc-300">3. Incident Response & Forensics</span>
              <span className="font-mono text-zinc-100 font-semibold">{formatINR(breakdown.incidentResponse || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs py-2.5">
              <span className="text-zinc-300">4. Regulatory Penalty Tier (RBI / SEBI)</span>
              <span className="font-mono text-zinc-100 font-semibold">{formatINR(breakdown.regulatoryFines || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2.5">
              <span className="text-zinc-300">5. System Recovery & Rebuild</span>
              <span className="font-mono text-zinc-100 font-semibold">{formatINR(breakdown.recoveryCost || 0)}</span>
            </div>
          </div>
        </div>

        {/* Contextual Drivers */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Why is this Risk Prioritized?</span>
          </h3>
          <div className="space-y-2">
            {(risk.keyDrivers || []).map((driver, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 text-xs text-zinc-300 bg-[#161720] p-3 rounded-xl border border-white/[0.06]"
              >
                <span className="text-amber-400 font-bold">•</span>
                <span>{driver}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Affected Asset Context */}
        {asset && (
          <div className="p-4 bg-[#161720] rounded-2xl border border-white/[0.07] flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-medium">Affected Target Asset</span>
              <div className="font-bold text-white mt-0.5">{asset.name}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                {asset.businessUnit} · Downtime: ₹{((asset.hourlyDowntimeCost || 0) / 100000).toFixed(1)}L/hr
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedAssetId(asset.id);
                setActiveTab('assets');
                setSelectedRiskId(null);
              }}
              className="text-amber-400 hover:text-amber-300 text-xs flex items-center space-x-1.5 font-semibold transition-colors px-3 py-1.5 bg-[#12131b] rounded-xl border border-white/[0.07] hover:border-amber-500/40"
            >
              <span>Inspect Asset</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 bg-[#161720] border-t border-white/[0.07] flex items-center justify-between shrink-0">
        <button
          onClick={() => {
            setActiveTab('graph');
            setSelectedRiskId(null);
          }}
          className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-white/[0.05]"
        >
          <GitFork className="w-3.5 h-3.5 text-amber-400" />
          <span>View in Topology Graph</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('optimizer');
            setSelectedRiskId(null);
          }}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:opacity-95 transition-all shadow-md shadow-orange-500/20"
        >
          <span>Find Optimal Mitigation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
