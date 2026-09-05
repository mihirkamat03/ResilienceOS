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
    <div className="space-y-5 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Radio className="w-4 h-4 text-sky-400" />
            <span>Continuous Telemetry & Data Ingestion Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregates vulnerability scans, cloud posture drift, identity events, and SIEM alerts to feed the continuous risk calculation loop.
          </p>
        </div>

        <button
          onClick={simulateTelemetrySync}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium flex items-center space-x-1.5 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          <span>Sync All Feeds</span>
        </button>
      </div>

      {/* Live Event Trigger Notification Banner */}
      {lastTelemetryEventNotice && (
        <div className="bg-sky-950/40 border border-sky-500/40 p-3.5 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
            <div>
              <span className="font-semibold text-white">Continuous Ingestion Update:</span>{' '}
              <span className="text-sky-300">{lastTelemetryEventNotice.title}</span>{' '}
              <span className="text-slate-400 text-[11px]">({lastTelemetryEventNotice.feed})</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 font-mono">
            <span className={lastTelemetryEventNotice.delta >= 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {lastTelemetryEventNotice.delta >= 0 ? '+' : ''}{formatINR(lastTelemetryEventNotice.delta)} EAL
            </span>
            <span className="text-[10px] text-slate-400">Processed at {lastTelemetryEventNotice.time}</span>
          </div>
        </div>
      )}

      {/* Simulation Control Console for Live Judging Demo */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Telemetry Simulation Controls (Deterministic Ingestion Triggers)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Simulate telemetry events to watch risk cascade live across the platform
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Event A: Critical Vuln Discovery */}
          <button
            onClick={() => triggerPresetTelemetryEvent('EVENT_A_CRITICAL_VULN')}
            className="p-3 bg-slate-950 hover:bg-slate-850 border border-red-900/60 hover:border-red-700 text-left rounded transition-colors group space-y-1"
          >
            <div className="flex items-center justify-between text-red-400 text-xs font-semibold">
              <span className="flex items-center space-x-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>+ Ingest Critical CVE</span>
              </span>
              <span className="text-[10px] font-mono opacity-60">Qualys</span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">Payment Gateway RCE</div>
            <div className="text-[10px] text-slate-400">CVSS 9.8 Apache CGI parameter injection on AST-API-01</div>
          </button>

          {/* Event B: MFA Degradation */}
          <button
            onClick={() => triggerPresetTelemetryEvent('EVENT_B_MFA_DEGRADED')}
            className="p-3 bg-slate-950 hover:bg-slate-850 border border-amber-900/60 hover:border-amber-700 text-left rounded transition-colors group space-y-1"
          >
            <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
              <span className="flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>MFA Policy Degraded</span>
              </span>
              <span className="text-[10px] font-mono opacity-60">Okta IAM</span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">Gateway Auth Bypass Flagged</div>
            <div className="text-[10px] text-slate-400">Lowers control effectiveness on AST-GW-01 to 25%</div>
          </button>

          {/* Event C: Vuln Patched */}
          <button
            onClick={() => triggerPresetTelemetryEvent('EVENT_C_VULN_PATCHED')}
            className="p-3 bg-slate-950 hover:bg-slate-850 border border-emerald-900/60 hover:border-emerald-700 text-left rounded transition-colors group space-y-1"
          >
            <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Vuln Patched & Rescanned</span>
              </span>
              <span className="text-[10px] font-mono opacity-60">Qualys</span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">PAN-OS Hotfix Verified</div>
            <div className="text-[10px] text-slate-400">Eliminates CVE-2024-3400 and reduces gateway risk to 0</div>
          </button>

          {/* Event D: Ingress Drift */}
          <button
            onClick={() => triggerPresetTelemetryEvent('EVENT_D_INTERNET_EXPOSURE_DRIFT')}
            className="p-3 bg-slate-950 hover:bg-slate-850 border border-sky-900/60 hover:border-sky-700 text-left rounded transition-colors group space-y-1"
          >
            <div className="flex items-center justify-between text-sky-400 text-xs font-semibold">
              <span className="flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Internet Exposure Drift</span>
              </span>
              <span className="text-[10px] font-mono opacity-60">Wiz CSPM</span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">EKS Ingress Exposed to 0.0.0.0/0</div>
            <div className="text-[10px] text-slate-400">Jumps AST-K8S-01 TEF to 20/yr, increasing EAL</div>
          </button>
        </div>
      </div>

      {/* Telemetry Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {telemetryFeeds.map(feed => (
          <div
            key={feed.id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white">{feed.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="text-[11px] text-slate-400">{feed.vendor} • {feed.type}</div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Ingested Records</span>
                <span className="text-slate-200 font-bold">{feed.recordsIngested.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Active Findings</span>
                <span className="text-amber-400 font-bold">{feed.activeFindingsCount}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-1 flex justify-between font-mono">
              <span>Last Sync: {feed.lastSync}</span>
              <span className="text-emerald-400">Status: Active Feed</span>
            </div>
          </div>
        ))}
      </div>

      {/* Continuous Event & Audit Recalculation Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>Continuous State Recalculation & Telemetry Event Stream</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Last Model Recalculation: <strong className="text-slate-200">{lastRecalculatedTime}</strong>
          </span>
        </div>

        <div className="space-y-2">
          {auditLogs.map(log => (
            <div
              key={log.id}
              className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-start justify-between gap-4 text-xs font-mono"
            >
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-slate-900 text-sky-400 rounded border border-slate-800 shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-slate-200 font-medium">{log.description}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {log.timestamp} • Event Type: <span className="text-sky-400">{log.type}</span>
                  </div>
                </div>
              </div>

              {log.deltaExposureINR !== undefined && (
                <div className="text-right shrink-0">
                  <span className={log.deltaExposureINR < 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {log.deltaExposureINR < 0 ? '' : '+'}{formatINR(log.deltaExposureINR)}
                  </span>
                  <div className="text-[10px] text-slate-400">Model Recalculated</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
