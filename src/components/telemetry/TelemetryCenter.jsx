import React from 'react';
import {
  Radio,
  RefreshCw,
  Clock,
  Activity,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  Globe,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { formatINR } from '../../core/riskEngine';
import { Badge } from '../common/Badge';

export const TelemetryCenter = () => {
  const {
    telemetryFeeds,
    auditLogs,
    simulateTelemetrySync,
    triggerPresetTelemetryEvent,
    lastRecalculatedTime,
    lastTelemetryEventNotice
  } = useRiskStore();

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="text-[11px] font-medium text-zinc-400 mb-1 flex items-center space-x-1.5">
            <span>Command Platform</span>
            <span>/</span>
            <span className="text-zinc-300">Continuous Ingestion</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white tracking-tight">Continuous Telemetry & Data Ingestion Center</h1>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-mono font-medium">
              Streaming Pipeline
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Aggregates vulnerability scans, cloud posture drift, identity events, and SIEM alerts to feed the continuous risk calculation loop
          </p>
        </div>

        <button
          onClick={simulateTelemetrySync}
          className="px-4 py-2 bg-[#161720] hover:bg-[#1a1c27] text-zinc-200 border border-white/[0.08] hover:border-amber-500/40 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Sync All Feeds</span>
        </button>
      </div>

      {/* Top 4-Metric Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161720] border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              Live ●
            </span>
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Ingestion Feeds</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">{telemetryFeeds.length} Feeds</div>
          <div className="text-[11px] text-zinc-500 mt-1.5 font-mono">Continuous streaming</div>
        </div>

        <div className="bg-[#161720] border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-400 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.08] font-mono">
              Ingested
            </span>
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Records Ingested</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {telemetryFeeds.reduce((sum, f) => sum + (f.recordsIngested || 0), 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1.5 font-mono">Vulnerabilities, events, logs</div>
        </div>

        <div className="bg-[#161720] border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
              Correlated
            </span>
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Threat Signals</div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
            {telemetryFeeds.reduce((sum, f) => sum + (f.activeFindingsCount || 0), 0)} Findings
          </div>
          <div className="text-[11px] text-zinc-500 mt-1.5 font-mono">Correlated across pipelines</div>
        </div>

        <div className="bg-[#161720] border border-white/[0.07] rounded-2xl p-4 shadow-xl shadow-black/40 hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 font-mono">
              FAIR Dynamic
            </span>
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Last Recalculation</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">{lastRecalculatedTime}</div>
          <div className="text-[11px] text-zinc-500 mt-1.5 font-mono">Dynamic FAIR model update</div>
        </div>
      </div>

      {/* Live Event Trigger Notification Banner */}
      {lastTelemetryEventNotice && (
        <div className="bg-gradient-to-r from-amber-500/15 via-[#181924] to-[#161720] border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-xs shadow-xl shadow-black/40 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-white">Continuous Ingestion Update:</span>{' '}
              <span className="text-amber-300 font-semibold">{lastTelemetryEventNotice.title}</span>{' '}
              <span className="text-zinc-400 text-[11px] font-mono">({lastTelemetryEventNotice.feed})</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 font-mono">
            <span className={`font-bold px-3 py-1 rounded-full border text-xs ${
              lastTelemetryEventNotice.delta >= 0 
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              {lastTelemetryEventNotice.delta >= 0 ? '+' : ''}{formatINR(lastTelemetryEventNotice.delta)} EAL
            </span>
            <span className="text-[10px] text-zinc-400">Processed at {lastTelemetryEventNotice.time}</span>
          </div>
        </div>
      )}

      {/* Simulation Control Console for Live Judging Demo */}
      <div className="bg-[#161720] border border-white/[0.07] rounded-2xl p-5 space-y-4 shadow-xl shadow-black/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Telemetry Simulation Controls (Deterministic Ingestion Triggers)
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            Simulate live telemetry events to observe real-time risk cascades
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* Event A: Critical Vuln Discovery */}
          <button
            onClick={() => triggerPresetTelemetryEvent('EVENT_A_CRITICAL_VULN')}
            className="p-4 bg-[#12131b] hover:bg-[#181924] border border-rose-500/20 hover:border-rose-500/50 text-left rounded-2xl transition-all group space-y-2 shadow-sm hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-rose-400 text-xs font-bold">
              <span className="flex items-center space-x-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>+ Ingest Critical CVE</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">Qualys</span>
            </div>
            <div className="text-xs text-zinc-200 font-bold group-hover:text-white transition-colors">Payment Gateway RCE</div>
            <div className="text-[11px] text-zinc-400 leading-relaxed">CVSS 9.8 Apache CGI parameter injection on AST-API-01</div>
          </button>

          {/* Event B: MFA Degradation */}
          <button
            onClick={() => triggerPresetTelemetryEvent('EVENT_B_MFA_DEGRADED')}
            className="p-4 bg-[#12131b] hover:bg-[#181924] border border-amber-500/20 hover:border-amber-500/50 text-left rounded-2xl transition-all group space-y-2 shadow-sm hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
              <span className="flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>MFA Policy Degraded</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">Okta IAM</span>
            </div>
            <div className="text-xs text-zinc-200 font-bold group-hover:text-white transition-colors">Gateway Auth Bypass Flagged</div>
            <div className="text-[11px] text-zinc-400 leading-relaxed">Lowers control effectiveness on AST-GW-01 to 25%</div>
          </button>

          {/* Event C: Vuln Patched */}
          <button
            onClick={() => triggerPresetTelemetryEvent('EVENT_C_VULN_PATCHED')}
            className="p-4 bg-[#12131b] hover:bg-[#181924] border border-emerald-500/20 hover:border-emerald-500/50 text-left rounded-2xl transition-all group space-y-2 shadow-sm hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Vuln Patched & Rescanned</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Qualys</span>
            </div>
            <div className="text-xs text-zinc-200 font-bold group-hover:text-white transition-colors">PAN-OS Hotfix Verified</div>
            <div className="text-[11px] text-zinc-400 leading-relaxed">Eliminates CVE-2024-3400 and reduces gateway risk to 0</div>
          </button>

          {/* Event D: Ingress Drift */}
          <button
            onClick={() => triggerPresetTelemetryEvent('EVENT_D_INTERNET_EXPOSURE_DRIFT')}
            className="p-4 bg-[#12131b] hover:bg-[#181924] border border-sky-500/20 hover:border-sky-500/50 text-left rounded-2xl transition-all group space-y-2 shadow-sm hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-sky-400 text-xs font-bold">
              <span className="flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Internet Exposure Drift</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">Wiz CSPM</span>
            </div>
            <div className="text-xs text-zinc-200 font-bold group-hover:text-white transition-colors">EKS Ingress Exposed to 0.0.0.0/0</div>
            <div className="text-[11px] text-zinc-400 leading-relaxed">Jumps AST-K8S-01 TEF to 20/yr, increasing EAL</div>
          </button>
        </div>
      </div>

      {/* Telemetry Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {telemetryFeeds.map(feed => (
          <div
            key={feed.id}
            className="bg-[#161720] border border-white/[0.07] rounded-2xl p-4 space-y-3.5 shadow-xl shadow-black/40 hover:border-white/[0.14] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white">{feed.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="text-[11px] text-zinc-400 font-medium">{feed.vendor} • {feed.type}</div>

            <div className="pt-2.5 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-sans">Ingested Records</span>
                <span className="text-zinc-200 font-bold">{feed.recordsIngested.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-sans">Active Findings</span>
                <span className="text-amber-400 font-bold">{feed.activeFindingsCount}</span>
              </div>
            </div>

            <div className="text-[10px] text-zinc-400 pt-1 flex justify-between font-mono">
              <span>Last Sync: {feed.lastSync}</span>
              <span className="text-emerald-400 font-semibold">Active Stream</span>
            </div>
          </div>
        ))}
      </div>

      {/* Continuous Event & Audit Recalculation Log */}
      <div className="bg-[#161720] border border-white/[0.07] rounded-2xl p-5 space-y-4 shadow-xl shadow-black/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Continuous State Recalculation & Telemetry Event Stream</span>
          </h3>
          <span className="text-[11px] text-zinc-400 font-mono">
            Last Model Recalculation: <strong className="text-zinc-200">{lastRecalculatedTime}</strong>
          </span>
        </div>

        <div className="space-y-2.5">
          {auditLogs.map(log => (
            <div
              key={log.id}
              className="bg-[#12131b] p-4 rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-all flex items-start justify-between gap-4 text-xs font-mono shadow-sm"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-[#161720] text-amber-400 rounded-xl border border-white/[0.08] shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-zinc-200 font-medium font-sans text-xs">{log.description}</div>
                  <div className="text-[10px] text-zinc-400 mt-1 flex items-center space-x-2">
                    <span>{log.timestamp}</span>
                    <span>•</span>
                    <span>Event Type: <strong className="text-amber-400 font-semibold">{log.type}</strong></span>
                  </div>
                </div>
              </div>

              {log.deltaExposureINR !== undefined && (
                <div className="text-right shrink-0">
                  <span className={`font-bold text-sm ${log.deltaExposureINR < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {log.deltaExposureINR < 0 ? '' : '+'}{formatINR(log.deltaExposureINR)}
                  </span>
                  <div className="text-[10px] text-zinc-500 uppercase font-sans">Model Recalculated</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
