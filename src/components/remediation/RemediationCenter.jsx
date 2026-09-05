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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Closed-Loop Remediation Operations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Engineering remediation task tracking with automated rescan verification and live risk recalculation
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>Workflow:</span>
          <span className="text-slate-200 font-mono">Detect ➔ Assign ➔ Remediate ➔ Verify ➔ Recalculate</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded border border-slate-800 w-fit text-xs">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            activeFilter === 'ALL'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
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
              className={`px-2.5 py-1 rounded transition-colors ${
                activeFilter === st
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
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
              className={`bg-slate-900 border rounded p-4 text-xs space-y-3 ${
                isVerified
                  ? 'border-emerald-900/60 bg-slate-950/40 opacity-80'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Title & Context */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-400">{task.id}</span>
                    <span className="font-semibold text-slate-100">{task.title}</span>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center space-x-2">
                    <span>Target: <strong className="text-slate-300 font-normal">{asset?.name || task.assetId}</strong></span>
                    <span>·</span>
                    <span>Risk ID: <strong className="font-mono text-slate-300 font-normal">{task.riskId}</strong></span>
                    <span>·</span>
                    <span>Due: <span className="font-mono text-slate-300">{task.dueDate}</span></span>
                  </div>
                </div>

                {/* Financial Impact */}
                <div className="flex items-center space-x-6 text-right shrink-0">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Cost</div>
                    <div className="text-xs font-mono font-bold text-white">{formatINR(task.cost)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Risk Reduction</div>
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      -{formatINR(task.riskReduction)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Owner</div>
                    <div className="text-xs text-slate-200">{task.owner}</div>
                  </div>
                </div>
              </div>

              {/* Verified Rescan Audit Log */}
              {task.rescanAuditLog && (
                <div className="bg-slate-950 p-2.5 rounded border border-emerald-900/40 text-[11px] text-emerald-300 flex items-start space-x-2 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span>Verified at {task.verifiedTimestamp}: </span>
                    <span className="text-slate-300">{task.rescanAuditLog}</span>
                  </div>
                </div>
              )}

              {/* Status Stepper & Action Controls */}
              <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Status Switcher Buttons */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 text-[11px] mr-1">Status:</span>
                  {statuses.map(st => (
                    <button
                      key={st}
                      disabled={isVerified}
                      onClick={() => updateRemediationStatus(task.id, st)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        task.status === st
                          ? 'bg-slate-800 text-white font-medium'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 disabled:opacity-40'
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
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition-colors"
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
