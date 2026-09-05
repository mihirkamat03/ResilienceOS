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
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-sky-400" />
            <span>Compliance & Regulatory Framework Intelligence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuously maps security controls, telemetry degradation, and verified remediations to regulatory requirements.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 self-start md:self-auto">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          <span>Decision Support & Evidence Mapping</span>
        </div>
      </div>

      {/* Framework Summary Cards Grid (Calculated Live from Unified Controls & Evidence) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceSummary.map(fw => {
          const isSelected = selectedFramework === fw.name;
          const isGap = fw.currentScore < 70;

          return (
            <div
              key={fw.name}
              onClick={() => setSelectedFramework(selectedFramework === fw.name ? 'ALL' : fw.name)}
              className={`bg-slate-900 border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-sky-500/60 bg-sky-950/20 shadow-lg shadow-sky-950/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white font-mono">{fw.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                    isGap
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {fw.currentScore}% Coverage
                </span>
              </div>

              <div className="text-[11px] text-slate-400 mb-3 truncate">
                {frameworkDomains[fw.name] || fw.domain}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isGap ? 'bg-amber-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${fw.currentScore}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                <span>Implemented: {fw.implementedCount}/{fw.totalControls}</span>
                <span>Gaps: {fw.gapCount}</span>
                {fw.reviewRequiredCount > 0 && (
                  <span className="text-amber-400 font-semibold">{fw.reviewRequiredCount} Review Req</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('controls')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeSubTab === 'controls'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mapped Technical Controls ({unifiedControls.length})
          </button>
          <button
            onClick={() => setActiveSubTab('gaps')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              activeSubTab === 'gaps'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Prioritized Compliance Gaps</span>
            <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.2 rounded font-mono">
              {complianceGaps.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('evidence')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              activeSubTab === 'evidence'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Evidence Vault ({evidenceRecords.length})</span>
          </button>
        </div>

        {selectedFramework !== 'ALL' && (
          <div className="flex items-center space-x-2">
            <Badge variant="info">Filtered: {selectedFramework}</Badge>
            <button
              onClick={() => setSelectedFramework('ALL')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: MAPPED TECHNICAL CONTROLS */}
      {activeSubTab === 'controls' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          {/* Table Filters */}
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search controls by name, code, or category..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full bg-slate-900 text-xs text-white px-2.5 py-1.5 rounded border border-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-900 text-xs text-slate-300 px-2 py-1 rounded border border-slate-800 focus:outline-none"
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
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="p-3">Control & Category</th>
                  <th className="p-3">Framework Mappings</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Evidence</th>
                  <th className="p-3">Linked Assets & Risks</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredControls.map(ctrl => {
                  const linkedRisks = risks.filter(r => (ctrl.relatedRisks || []).includes(r.id) && r.status !== 'Remediated');
                  const totalEAL = linkedRisks.reduce((sum, r) => sum + (r.fairMetrics ? r.fairMetrics.expectedAnnualLoss : 0), 0);

                  return (
                    <tr key={ctrl.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Control Name & ID */}
                      <td className="p-3">
                        <div className="font-bold text-white font-mono flex items-center space-x-1.5">
                          <span>{ctrl.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                          <span className="font-mono text-slate-500">{ctrl.id}</span>
                          <span>•</span>
                          <span className="text-sky-400">{ctrl.category}</span>
                        </div>
                      </td>

                      {/* Framework Mappings */}
                      <td className="p-3 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(ctrl.frameworkMappings || []).map((m, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-800"
                              title={`${m.framework}: ${m.requirement}`}
                            >
                              <span className="text-sky-400 font-semibold">{m.framework.split(' ')[0]}:</span> {m.code}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <StatusBadge status={ctrl.status} />
                      </td>

                      {/* Evidence Status */}
                      <td className="p-3 text-center">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                            ctrl.evidenceStatus === 'Verified'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : ctrl.evidenceStatus === 'Expired'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : ctrl.evidenceStatus === 'Pending Review'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {ctrl.evidenceStatus || 'Available'}
                        </span>
                      </td>

                      {/* Linked Assets & Financial EAL */}
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {(ctrl.relatedAssets || []).map(aid => (
                            <button
                              key={aid}
                              onClick={() => {
                                setSelectedAssetId(aid);
                                setActiveTab('assets');
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700"
                            >
                              {aid}
                            </button>
                          ))}
                        </div>
                        {totalEAL > 0 && (
                          <div className="text-[10px] text-amber-400 font-mono">
                            Linked EAL: {formatINR(totalEAL)}
                          </div>
                        )}
                      </td>

                      {/* Inspect / Mutate Control Button */}
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setInspectingControl(ctrl)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700 flex items-center space-x-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
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
        <div className="space-y-3">
          {complianceGaps.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No Open Compliance Gaps Identified</p>
              <p className="text-xs text-slate-400 mt-1">All mapped regulatory framework controls are fully satisfied with valid evidence.</p>
            </div>
          ) : (
            complianceGaps.map((gap, idx) => (
              <div
                key={gap.id || idx}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        gap.priority === 'P1 - Urgent'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : gap.priority === 'P2 - High'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}
                    >
                      {gap.priority}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">{gap.framework}</span>
                    <span className="text-xs text-sky-400 font-mono font-semibold">({gap.requirementCode})</span>
                    <span className="text-xs text-slate-400">— {gap.controlName}</span>
                  </div>

                  {gap.totalRelatedEAL > 0 && (
                    <div className="text-xs font-mono font-bold text-red-400 bg-red-950/40 px-2.5 py-1 rounded border border-red-900/50 self-start md:self-auto">
                      Financial Exposure at Risk: {formatINR(gap.totalRelatedEAL)} EAL
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-300 mb-3 bg-slate-950/60 p-2.5 rounded border border-slate-800/80 leading-relaxed">
                  <span className="text-slate-400 font-semibold">Regulatory Requirement: </span>
                  {gap.requirementTitle}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400 mb-3 font-mono">
                  <div>
                    Control Status: <span className="text-amber-400 font-semibold">{gap.currentStatus}</span>
                  </div>
                  <div>
                    Evidence State: <span className={gap.evidenceStatus === 'Expired' ? 'text-red-400 font-bold' : 'text-slate-300'}>{gap.evidenceStatus}</span>
                  </div>
                  <div>
                    Owner: <span className="text-slate-300">{gap.owner}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-800/80 pt-3 gap-2">
                  <div className="text-xs text-slate-300 flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span><strong>Recommended Action:</strong> {gap.recommendedAction}</span>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    {gap.linkedRisks && gap.linkedRisks[0] && (
                      <button
                        onClick={() => {
                          setSelectedRiskId(gap.linkedRisks[0].id);
                          setActiveTab('risk');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700"
                      >
                        Inspect Risk ({gap.linkedRisks[0].id})
                      </button>
                    )}
                    {gap.linkedRemediations && gap.linkedRemediations[0] && (
                      <button
                        onClick={() => {
                          verifyAndRecalculate(gap.linkedRemediations[0].id);
                        }}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded text-xs border border-emerald-500/30 flex items-center space-x-1 font-semibold"
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
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Simulated Audit Evidence Records ({evidenceRecords.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Synthetic digital evidence exports used for continuous regulatory verification and freshness tracking.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              Demo Evidence Vault
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {evidenceRecords.map(ev => {
              const isExpired = ev.status === 'Expired';
              const isPending = ev.status === 'Pending Review';

              return (
                <div key={ev.id} className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs font-mono">{ev.title}</span>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{ev.id}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                          ev.status === 'Verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isExpired
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {ev.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 font-mono pt-1">
                      <span>Source: <span className="text-slate-300">{ev.source}</span></span>
                      <span>Collected: <span className="text-slate-300">{ev.collectedAt}</span></span>
                      <span>Expires: <span className={isExpired ? 'text-red-400 font-bold' : 'text-slate-300'}>{ev.expiresAt}</span></span>
                    </div>
                  </div>

                  {/* Interactive Evidence Actions for Hackathon Live Demo */}
                  <div className="flex items-center space-x-2 self-end md:self-auto">
                    {isExpired || isPending ? (
                      <button
                        onClick={() => updateEvidenceStatus(ev.id, 'Verified')}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs rounded border border-emerald-500/30 font-semibold flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Re-Verify Evidence</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => updateEvidenceStatus(ev.id, 'Expired')}
                        className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs rounded border border-amber-500/30 flex items-center space-x-1"
                        title="Simulate evidence expiry to test review-required state"
                      >
                        <Clock className="w-3 h-3" />
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                  {inspectingControl.id} • {inspectingControl.category}
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">{inspectingControl.name}</h3>
              </div>
              <button
                onClick={() => setInspectingControl(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {inspectingControl.description}
            </p>

            {/* Status Mutation Controls (Interactive Testing) */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-200">Control Implementation Status:</span>
              <div className="flex flex-wrap gap-2">
                {['Implemented', 'Partially Implemented', 'Not Implemented'].map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      updateControlStatus(inspectingControl.id, st);
                      setInspectingControl({ ...inspectingControl, status: st });
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      inspectingControl.status === st
                        ? 'bg-sky-500 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Framework Mappings List */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Multi-Framework Regulatory Mappings
              </h4>
              <div className="space-y-2">
                {(inspectingControl.frameworkMappings || []).map((m, i) => (
                  <div key={i} className="bg-slate-950/70 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sky-400 font-mono">{m.framework}</span>
                      <span className="font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{m.code}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{m.requirement}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Assets & Risks */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Linked Assets</span>
                <div className="flex flex-wrap gap-1">
                  {(inspectingControl.relatedAssets || []).map(aid => (
                    <span key={aid} className="font-mono text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">{aid}</span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Linked FAIR Risks</span>
                <div className="flex flex-wrap gap-1">
                  {(inspectingControl.relatedRisks || []).map(rid => (
                    <span key={rid} className="font-mono text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">{rid}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingControl(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold"
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
