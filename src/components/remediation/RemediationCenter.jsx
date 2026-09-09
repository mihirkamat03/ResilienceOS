import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { formatINR } from '../../core/riskEngine';
import { StatusBadge } from '../common/Badge';

export const RemediationCenter = () => {
  const {
    remediations,
    updateRemediationStatus,
    verifyAndRecalculate,
    assets
  } = useRiskStore();

  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredTasks = remediations.filter(t => {
    if (activeFilter === 'ALL') return true;
    return t.status === activeFilter;
  });

  const statuses = ['Identified', 'Assigned', 'In Progress', 'Resolved', 'Verified'];

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-base font-bold text-white tracking-tight">Closed-Loop Remediation Operations</h1>
            <span className="text-[10px] bg-[#0c1220] text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30 font-mono font-medium">
              Live Verification
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Engineering remediation task tracking with automated rescan verification and live risk recalculation
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-[#0c1220] px-3 py-1.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 font-medium text-[11px]">Workflow:</span>
          <span className="text-slate-200 font-mono font-semibold text-[11px]">Detect ➔ Assign ➔ Remediate ➔ Verify</span>
        </div>
      </div>

      {/* Top 4-Metric Remediation Operations Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-zinc-600">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total Pipeline Tasks</div>
          <div className="text-xl font-bold text-white font-mono mt-0.5">{remediations.length} Actions</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Assigned engineering queue</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-orange-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Active Execution</div>
          <div className="text-xl font-bold text-orange-400 font-mono mt-0.5">
            {remediations.filter(t => t.status === 'In Progress' || t.status === 'Assigned').length} Tasks
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">In dev or triage</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-emerald-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Verified Closed-Loop</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
            {remediations.filter(t => t.status === 'Verified').length} Completed
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Rescan confirmed in telemetry</div>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 border-t-2 border-t-sky-500">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Realized Risk Averted</div>
          <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
            {formatINR(remediations.filter(t => t.status === 'Verified').reduce((sum, t) => sum + (t.riskReduction || 0), 0))}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Eliminated annual loss</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 bg-[#161720]/95 p-1.5 rounded-2xl border border-white/[0.07] w-fit text-xs shadow-xl shadow-black/40">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            activeFilter === 'ALL'
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All Tasks ({remediations.length})
        </button>
        {statuses.map(st => {
          const count = remediations.filter(t => t.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setActiveFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-all font-medium ${
                activeFilter === st
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Remediation Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map(task => {
          const isVerified = task.status === 'Verified';
          const asset = assets.find(a => a.id === task.assetId);

          return (
            <div
              key={task.id}
              className={`bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-5 text-xs space-y-3.5 shadow-2xl shadow-black/50 transition-all ${
                isVerified
                  ? 'border-emerald-800/60 bg-[#161720]/90 border-l-4 border-l-emerald-500'
                  : 'border-zinc-800/80 hover:border-zinc-700 border-l-4 border-l-orange-500'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Title & Context */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sky-400 font-bold text-xs">{task.id}</span>
                    <span className="font-bold text-white text-sm">{task.title}</span>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center space-x-2 font-mono">
                    <span>Target: <strong className="text-slate-200 font-sans">{asset?.name || task.assetId}</strong></span>
                    <span>·</span>
                    <span>Risk ID: <strong className="text-sky-300">{task.riskId}</strong></span>
                    <span>·</span>
                    <span>Due: <span className="text-slate-300">{task.dueDate}</span></span>
                  </div>
                </div>

                {/* Financial Impact */}
                <div className="flex items-center space-x-6 text-right shrink-0">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Cost</div>
                    <div className="text-xs font-mono font-bold text-white">{formatINR(task.cost)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Risk Reduction</div>
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      -{formatINR(task.riskReduction)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Owner</div>
                    <div className="text-xs text-slate-200 font-medium">{task.owner}</div>
                  </div>
                </div>
              </div>

              {/* Verified Rescan Audit Log */}
              {task.rescanAuditLog && (
                <div className="bg-[#090d16] p-3 rounded-lg border border-emerald-800/50 text-[11px] text-emerald-300 flex items-start space-x-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-400">Verified at {task.verifiedTimestamp}: </span>
                    <span className="text-slate-300">{task.rescanAuditLog}</span>
                  </div>
                </div>
              )}

              {/* Status Stepper & Action Controls */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Status Switcher Buttons */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 text-[11px] mr-1 font-medium">Status:</span>
                  {statuses.map(st => (
                    <button
                      key={st}
                      disabled={isVerified}
                      onClick={() => updateRemediationStatus(task.id, st)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-all ${
                        task.status === st
                          ? 'bg-slate-800 text-white font-bold border border-slate-600 shadow-sm'
                          : 'bg-[#090d16] text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200 disabled:opacity-40'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* VERIFY & RECALCULATE ACTION */}
                {!isVerified && (
                  <button
                    onClick={() => verifyAndRecalculate(task.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                    title="Execute simulated telemetry rescan verification and recalculate platform exposure"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify & Recalculate Exposure</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
