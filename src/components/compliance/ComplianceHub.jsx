import React, { useState } from 'react';
import {
  FileCheck,
  ShieldAlert,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  Filter,
  Search,
  RefreshCw,
  Info,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { StatusBadge, Badge } from '../common/Badge';
import { formatINR } from '../../core/riskEngine';

export const ComplianceHub = () => {
  const {
    unifiedControls,
    evidenceRecords,
    complianceSummary,
    complianceGaps,
    risks,
    assets,
    remediations,
    updateControlStatus,
    updateEvidenceStatus,
    verifyAndRecalculate,
    setSelectedRiskId,
    setSelectedAssetId,
    setActiveTab
  } = useRiskStore();

  const [activeSubTab, setActiveSubTab] = useState('controls'); // 'controls' | 'gaps' | 'evidence'
  const [selectedFramework, setSelectedFramework] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [inspectingControl, setInspectingControl] = useState(null);

  // Framework Domain Labels
  const frameworkDomains = {
    'NIST CSF 2.0': 'National Cybersecurity Framework',
    'RBI Master Direction': 'Banking IT & Cyber Resilience',
    'ISO/IEC 27001:2022': 'Information Security Management (ISMS)',
    'SEBI CSCRF': 'Securities & Payment Cyber Resilience'
  };

  // Filtered Unified Controls
  const filteredControls = (unifiedControls || []).filter(ctrl => {
    // Framework filter
    if (selectedFramework !== 'ALL') {
      const hasFw = ctrl.frameworkMappings?.some(m => m.framework === selectedFramework || m.framework?.includes(selectedFramework));
      if (!hasFw) return false;
    }
    // Status filter
    if (statusFilter !== 'ALL' && ctrl.status !== statusFilter) {
      return false;
    }
    // Search text
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchName = ctrl.name.toLowerCase().includes(q);
      const matchCode = ctrl.frameworkMappings?.some(m => m.code.toLowerCase().includes(q));
      const matchCat = ctrl.category.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="text-[11px] font-medium text-zinc-400 mb-1 flex items-center space-x-1.5">
            <span>Command Platform</span>
            <span>/</span>
            <span className="text-zinc-300">Regulatory Governance</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white tracking-tight">Compliance & Regulatory Intelligence</h1>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-mono font-medium">
              Continuous Telemetry
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Cross-framework control mapping, degradation alerting, and auditable verification for RBI, SEBI, NIST, and ISO standards
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-[#161720] px-3.5 py-2 rounded-xl border border-white/[0.07] shadow-sm">
          <span className="text-zinc-400 font-medium text-[11px]">Audit Mode:</span>
          <span className="text-amber-300 font-mono font-semibold text-[11px]">Evidence-Linked Mapping</span>
        </div>
      </div>

      {/* Top 4-Metric Compliance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161720] border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              +4.2% ↑
            </span>
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Avg Regulatory Posture</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {Math.round(complianceSummary.reduce((sum, f) => sum + (f.currentScore || 0), 0) / (complianceSummary.length || 1))}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1.5 font-mono">Across 4 major frameworks</div>
        </div>

        <div className="bg-[#161720] border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-400 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.08] font-mono">
              Active
            </span>
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Mapped Controls</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">{unifiedControls.length} Controls</div>
          <div className="text-[11px] text-zinc-500 mt-1.5 font-mono">Continuous posture telemetry</div>
        </div>

        <div className="bg-[#161720] border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
              Action Req
            </span>
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Open Audit Gaps</div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
            {complianceGaps.length} Gaps
          </div>
          <div className="text-[11px] text-zinc-500 mt-1.5 font-mono">Requires remediation attention</div>
        </div>

        <div className="bg-[#161720] border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 font-mono">
              Audited
            </span>
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Evidence Artifacts</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {evidenceRecords.filter(e => e.status === 'Verified' || e.status === 'Audited').length}/{evidenceRecords.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1.5 font-mono">Verified compliance proof</div>
        </div>
      </div>

      {/* Framework Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceSummary.map(fw => {
          const isSelected = selectedFramework === fw.name;
          const isGap = fw.currentScore < 70;

          return (
            <div
              key={fw.name}
              onClick={() => setSelectedFramework(selectedFramework === fw.name ? 'ALL' : fw.name)}
              className={`border rounded-2xl p-4 cursor-pointer transition-all shadow-xl shadow-black/40 ${
                isSelected
                  ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 via-[#181924] to-[#161720] ring-1 ring-amber-500/30'
                  : 'bg-[#161720] border-white/[0.07] hover:border-white/[0.15] hover:bg-[#191a24]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white font-mono">{fw.name}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isGap
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {fw.currentScore}% Coverage
                </span>
              </div>

              <div className="text-[11px] text-zinc-400 mb-3 truncate font-medium">
                {frameworkDomains[fw.name] || fw.domain}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#111218] h-2 rounded-full overflow-hidden border border-white/[0.04]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isGap ? 'bg-amber-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${fw.currentScore}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-zinc-400 mt-3 font-mono">
                <span>Implemented: <strong className="text-zinc-200 font-semibold">{fw.implementedCount}/{fw.totalControls}</strong></span>
                <span>Gaps: <strong className="text-amber-400 font-semibold">{fw.gapCount}</strong></span>
                {fw.reviewRequiredCount > 0 && (
                  <span className="text-orange-400 font-semibold">{fw.reviewRequiredCount} Review</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-3">
        <div className="flex items-center space-x-2 bg-[#161720] p-1.5 rounded-2xl border border-white/[0.07] shadow-sm">
          <button
            onClick={() => setActiveSubTab('controls')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'controls'
                ? 'bg-[#222432] text-white shadow-sm border border-white/[0.1]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Mapped Technical Controls ({unifiedControls.length})
          </button>
          <button
            onClick={() => setActiveSubTab('gaps')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'gaps'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Prioritized Compliance Gaps</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
              {complianceGaps.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('evidence')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'evidence'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-orange-400" />
            <span>Evidence Vault ({evidenceRecords.length})</span>
          </button>
        </div>

        {selectedFramework !== 'ALL' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30 font-mono">
              Filtered: {selectedFramework}
            </span>
            <button
              onClick={() => setSelectedFramework('ALL')}
              className="text-xs text-zinc-400 hover:text-white font-medium hover:underline"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: MAPPED TECHNICAL CONTROLS */}
      {activeSubTab === 'controls' && (
        <div className="bg-[#161720] border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl shadow-black/40">
          {/* Table Filters */}
          <div className="p-3.5 bg-[#12131b] border-b border-white/[0.07] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search controls by name, code, or category..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full bg-[#161720] text-xs text-white px-3 py-1.5 rounded-xl border border-white/[0.07] focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#161720] text-xs text-zinc-300 px-3 py-1.5 rounded-xl border border-white/[0.07] focus:outline-none focus:border-amber-500/50"
              >
                <option value="ALL">All Statuses</option>
                <option value="Implemented">Implemented</option>
                <option value="Partially Implemented">Partially Implemented</option>
                <option value="Not Implemented">Not Implemented</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#12131b]/80 border-b border-white/[0.07] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="p-3.5">Control & Category</th>
                  <th className="p-3.5">Framework Mappings</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Evidence</th>
                  <th className="p-3.5">Linked Assets & Risks</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredControls.map(ctrl => {
                  const linkedRisks = risks.filter(r => (ctrl.relatedRisks || []).includes(r.id) && r.status !== 'Remediated');
                  const totalEAL = linkedRisks.reduce((sum, r) => sum + (r.fairMetrics ? r.fairMetrics.expectedAnnualLoss : 0), 0);

                  return (
                    <tr key={ctrl.id} className="hover:bg-white/[0.03] transition-colors">
                      {/* Control Name & ID */}
                      <td className="p-3.5">
                        <div className="font-bold text-white font-mono flex items-center space-x-1.5">
                          <span>{ctrl.name}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center space-x-2">
                          <span className="font-mono text-zinc-500">{ctrl.id}</span>
                          <span>•</span>
                          <span className="text-amber-400">{ctrl.category}</span>
                        </div>
                      </td>

                      {/* Framework Mappings */}
                      <td className="p-3.5 max-w-xs">
                        <div className="flex flex-wrap gap-1.5">
                          {(ctrl.frameworkMappings || []).map((m, idx) => (
                            <span
                              key={idx}
                              className="bg-[#111218] text-zinc-300 px-2 py-0.5 rounded-md text-[10px] font-mono border border-white/[0.06]"
                              title={`${m.framework}: ${m.requirement}`}
                            >
                              <span className="text-amber-400 font-semibold">{m.framework.split(' ')[0]}:</span> {m.code}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <StatusBadge status={ctrl.status} />
                      </td>

                      {/* Evidence Status */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${
                            ctrl.evidenceStatus === 'Verified'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : ctrl.evidenceStatus === 'Expired'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : ctrl.evidenceStatus === 'Pending Review'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {ctrl.evidenceStatus || 'Available'}
                        </span>
                      </td>

                      {/* Linked Assets & Financial EAL */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {(ctrl.relatedAssets || []).map(aid => (
                            <button
                              key={aid}
                              onClick={() => {
                                setSelectedAssetId(aid);
                                setActiveTab('assets');
                              }}
                              className="bg-[#12131b] hover:bg-[#181924] text-zinc-300 px-2 py-0.5 rounded-md text-[10px] font-mono border border-white/[0.07] transition-colors"
                            >
                              {aid}
                            </button>
                          ))}
                        </div>
                        {totalEAL > 0 && (
                          <div className="text-[10px] text-amber-400 font-mono font-semibold">
                            Linked EAL: {formatINR(totalEAL)}
                          </div>
                        )}
                      </td>

                      {/* Inspect / Mutate Control Button */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setInspectingControl(ctrl)}
                          className="px-3 py-1.5 bg-[#12131b] hover:bg-[#181924] text-zinc-200 rounded-xl text-xs border border-white/[0.08] hover:border-amber-500/40 flex items-center space-x-1.5 ml-auto transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: PRIORITIZED COMPLIANCE GAPS */}
      {activeSubTab === 'gaps' && (
        <div className="space-y-4">
          {complianceGaps.length === 0 ? (
            <div className="bg-[#161720] border border-white/[0.07] p-8 rounded-2xl text-center shadow-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2.5" />
              <p className="text-base font-semibold text-white">No Open Compliance Gaps Identified</p>
              <p className="text-xs text-zinc-400 mt-1">All mapped regulatory framework controls are fully satisfied with valid evidence.</p>
            </div>
          ) : (
            complianceGaps.map((gap, idx) => (
              <div
                key={gap.id || idx}
                className="bg-[#161720] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.15] transition-all shadow-xl shadow-black/40"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        gap.priority === 'P1 - Urgent'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : gap.priority === 'P2 - High'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {gap.priority}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">{gap.framework}</span>
                    <span className="text-xs text-amber-400 font-mono font-semibold">({gap.requirementCode})</span>
                    <span className="text-xs text-zinc-400">— {gap.controlName}</span>
                  </div>

                  {gap.totalRelatedEAL > 0 && (
                    <div className="text-xs font-mono font-bold text-rose-400 bg-rose-950/30 px-3 py-1 rounded-full border border-rose-500/30 self-start md:self-auto">
                      Financial Exposure: {formatINR(gap.totalRelatedEAL)} EAL
                    </div>
                  )}
                </div>

                <div className="text-xs text-zinc-300 mb-3 bg-[#111218] p-3.5 rounded-xl border border-white/[0.05] leading-relaxed">
                  <span className="text-zinc-400 font-semibold">Regulatory Requirement: </span>
                  {gap.requirementTitle}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-400 mb-4 font-mono">
                  <div>
                    Control Status: <span className="text-amber-400 font-semibold">{gap.currentStatus}</span>
                  </div>
                  <div>
                    Evidence State: <span className={gap.evidenceStatus === 'Expired' ? 'text-rose-400 font-bold' : 'text-zinc-300'}>{gap.evidenceStatus}</span>
                  </div>
                  <div>
                    Owner: <span className="text-zinc-300">{gap.owner}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/[0.07] pt-3.5 gap-2.5">
                  <div className="text-xs text-zinc-300 flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span><strong>Recommended Action:</strong> {gap.recommendedAction}</span>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    {gap.linkedRisks && gap.linkedRisks[0] && (
                      <button
                        onClick={() => {
                          setSelectedRiskId(gap.linkedRisks[0].id);
                          setActiveTab('risk');
                        }}
                        className="px-3 py-1.5 bg-[#12131b] hover:bg-[#181924] text-zinc-200 rounded-xl text-xs border border-white/[0.08] hover:border-white/[0.15] transition-all"
                      >
                        Inspect Risk ({gap.linkedRisks[0].id})
                      </button>
                    )}
                    {gap.linkedRemediations && gap.linkedRemediations[0] && (
                      <button
                        onClick={() => {
                          verifyAndRecalculate(gap.linkedRemediations[0].id);
                        }}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-xl text-xs border border-emerald-500/30 flex items-center space-x-1.5 font-semibold transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify & Close Gap</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 3: SIMULATED EVIDENCE VAULT */}
      {activeSubTab === 'evidence' && (
        <div className="bg-[#161720] border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl shadow-black/40">
          <div className="p-4 bg-[#12131b] border-b border-white/[0.07] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Simulated Audit Evidence Records ({evidenceRecords.length})
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Synthetic digital evidence exports used for continuous regulatory verification and freshness tracking.
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Demo Evidence Vault
            </span>
          </div>

          <div className="divide-y divide-white/[0.05]">
            {evidenceRecords.map(ev => {
              const isExpired = ev.status === 'Expired';
              const isPending = ev.status === 'Pending Review';

              return (
                <div key={ev.id} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-white text-xs font-mono">{ev.title}</span>
                      <span className="font-mono text-[10px] text-zinc-400 bg-[#111218] px-2 py-0.5 rounded-md border border-white/[0.06]">{ev.id}</span>
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${
                          ev.status === 'Verified'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : isExpired
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {ev.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-[10px] text-zinc-500 font-mono pt-1">
                      <span>Source: <span className="text-zinc-300">{ev.source}</span></span>
                      <span>Collected: <span className="text-zinc-300">{ev.collectedAt}</span></span>
                      <span>Expires: <span className={isExpired ? 'text-rose-400 font-bold' : 'text-zinc-300'}>{ev.expiresAt}</span></span>
                    </div>
                  </div>

                  {/* Interactive Evidence Actions for Hackathon Live Demo */}
                  <div className="flex items-center space-x-2 self-end md:self-auto">
                    {isExpired || isPending ? (
                      <button
                        onClick={() => updateEvidenceStatus(ev.id, 'Verified')}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs rounded-xl border border-emerald-500/30 font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Re-Verify Evidence</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => updateEvidenceStatus(ev.id, 'Expired')}
                        className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs rounded-xl border border-amber-500/30 flex items-center space-x-1.5 transition-all shadow-sm"
                        title="Simulate evidence expiry to test review-required state"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Simulate Expiry</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INSPECT CONTROL MODAL / DRAWER */}
      {inspectingControl && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#161720] border border-white/[0.1] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl shadow-black/80">
            <div className="flex items-start justify-between border-b border-white/[0.07] pb-3.5">
              <div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {inspectingControl.id} • {inspectingControl.category}
                </span>
                <h3 className="text-base font-bold text-white mt-2">{inspectingControl.name}</h3>
              </div>
              <button
                onClick={() => setInspectingControl(null)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {inspectingControl.description}
            </p>

            {/* Status Mutation Controls */}
            <div className="bg-[#111218] p-4 rounded-xl border border-white/[0.05] space-y-2.5">
              <span className="text-xs font-semibold text-zinc-200">Control Implementation Status:</span>
              <div className="flex flex-wrap gap-2">
                {['Implemented', 'Partially Implemented', 'Not Implemented'].map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      updateControlStatus(inspectingControl.id, st);
                      setInspectingControl({ ...inspectingControl, status: st });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      inspectingControl.status === st
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-[#181924] text-zinc-400 hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Framework Mappings List */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5 font-mono">
                Multi-Framework Regulatory Mappings
              </h4>
              <div className="space-y-2">
                {(inspectingControl.frameworkMappings || []).map((m, i) => (
                  <div key={i} className="bg-[#111218] p-3 rounded-xl border border-white/[0.05] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-400 font-mono">{m.framework}</span>
                      <span className="font-mono text-zinc-400 bg-[#161720] px-2 py-0.5 rounded-md border border-white/[0.06]">{m.code}</span>
                    </div>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">{m.requirement}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Assets & Risks */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#111218] p-3.5 rounded-xl border border-white/[0.05]">
                <span className="text-zinc-400 font-semibold block mb-1.5">Linked Assets</span>
                <div className="flex flex-wrap gap-1.5">
                  {(inspectingControl.relatedAssets || []).map(aid => (
                    <span key={aid} className="font-mono text-zinc-200 bg-[#161720] px-2 py-0.5 rounded-md border border-white/[0.06]">{aid}</span>
                  ))}
                </div>
              </div>

              <div className="bg-[#111218] p-3.5 rounded-xl border border-white/[0.05]">
                <span className="text-zinc-400 font-semibold block mb-1.5">Linked FAIR Risks</span>
                <div className="flex flex-wrap gap-1.5">
                  {(inspectingControl.relatedRisks || []).map(rid => (
                    <span key={rid} className="font-mono text-amber-400 bg-[#161720] px-2 py-0.5 rounded-md border border-white/[0.06]">{rid}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingControl(null)}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-bold rounded-xl text-xs hover:opacity-95 transition-all shadow-md shadow-orange-500/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
