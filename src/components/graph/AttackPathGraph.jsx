import React, { useState, useMemo } from 'react';
import {
  GitFork,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  Activity,
  Zap,
  Info
} from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { formatINR } from '../../core/riskEngine';
import {
  computeGraphState,
  getAssetAttackPath,
  getAssetBlastRadius
} from '../../core/graphEngine';
import { CriticalityBadge, SeverityBadge, Badge } from '../common/Badge';

export const AttackPathGraph = () => {
  const { assets, risks, setSelectedRiskId, setSelectedAssetId, setActiveTab } = useRiskStore();

  const [selectedNodeId, setSelectedNodeId] = useState('AST-DB-01');
  const [highlightAttackPath, setHighlightAttackPath] = useState(true);

  // Dynamic Graph Nodes & Edges derived from live store assets & active risks
  const { nodes, edges } = useMemo(() => {
    return computeGraphState(assets, risks);
  }, [assets, risks]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[4];
  const linkedAsset = assets.find(a => a.id === selectedNode.id);
  const linkedRisks = risks.filter(r => r.assetId === selectedNode.id && r.status !== 'Remediated');
  const attackPathSteps = getAssetAttackPath(selectedNode.id);
  const blastRadius = getAssetBlastRadius(selectedNode.id);

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-base font-bold text-white tracking-tight">Attack Propagation & Dependency Topology</h1>
            <span className="text-[10px] bg-[#0c1220] text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30 font-mono font-medium">
              Graph Traversal Model
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Directed acyclic graph tracing perimeter ingress exposure vectors toward core financial database clusters
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setHighlightAttackPath(!highlightAttackPath)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1.5 shadow-sm ${
              highlightAttackPath
                ? 'bg-rose-950/70 text-rose-300 border-rose-800/80'
                : 'bg-[#0c1220] text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px]">{highlightAttackPath ? 'Emphasize Active Vulnerable Vectors' : 'Show All Network Edges'}</span>
          </button>
        </div>
      </div>

      {/* Network Posture Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-black/40 border-t-2 border-t-rose-500">
          <div>
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Perimeter Ingress Vectors</div>
            <div className="text-xl font-bold text-white font-mono mt-0.5">1 Active Entrypoint</div>
          </div>
          <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-900/60 font-semibold shadow-sm">
            CVE-2024-3400
          </span>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-black/40 border-t-2 border-t-sky-500">
          <div>
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Lateral Hop Distance</div>
            <div className="text-xl font-bold text-white font-mono mt-0.5">4 Lateral Hops</div>
          </div>
          <span className="text-[10px] font-mono text-zinc-300 bg-[#101117] px-2.5 py-1 rounded-full border border-zinc-800 shadow-sm">
            Perimeter ➔ Core DB
          </span>
        </div>

        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-black/40 border-t-2 border-t-amber-500">
          <div>
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Downstream Crown Jewel</div>
            <div className="text-xl font-bold text-white font-mono mt-0.5">AST-DB-01</div>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-900/60 font-semibold shadow-sm">
            480K Sensitive Records
          </span>
        </div>
      </div>

      {/* Main Canvas & Inspection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Interactive Topology Canvas */}
        <div className="lg:col-span-2 bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[500px] shadow-2xl shadow-black/50">
          {/* Legend */}
          <div className="absolute top-4 left-4 z-10 bg-[#080c14]/95 border border-slate-800 p-2.5 rounded-lg text-[10px] space-y-1.5 shadow-md">
            <div className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Topology State</div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-slate-300 font-medium">Vulnerable Ingress Path</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-slate-300 font-medium">Protected Lateral Hop</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-300 font-medium">Tier-1 Crown Jewel Target</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center pt-8">
            <svg viewBox="0 0 1020 400" className="w-full h-auto select-none">
              <defs>
                {/* Subtle blueprint grid */}
                <pattern id="topology-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" opacity="0.3" />
                </pattern>
                <marker
                  id="arrow-vulnerable"
                  markerWidth="8"
                  markerHeight="8"
                  refX="18"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 0, 8 4, 0 8" fill="#ef4444" />
                </marker>
                <marker
                  id="arrow-default"
                  markerWidth="8"
                  markerHeight="8"
                  refX="18"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 0, 8 4, 0 8" fill="#64748b" />
                </marker>
              </defs>

              {/* Background grid */}
              <rect width="100%" height="100%" fill="url(#topology-grid)" />

              {/* Edge Connections */}
              {edges.map((edge, idx) => {
                const source = nodes.find(n => n.id === edge.from);
                const target = nodes.find(n => n.id === edge.to);
                if (!source || !target) return null;

                const isPath = highlightAttackPath && edge.isVulnerablePath;
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g key={idx}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isPath ? '#ef4444' : '#334155'}
                      strokeWidth={isPath ? 2.5 : 1.5}
                      strokeDasharray={isPath ? 'none' : '4 4'}
                      markerEnd={isPath ? 'url(#arrow-vulnerable)' : 'url(#arrow-default)'}
                    />
                    {/* Edge Protocol Badge with background pill */}
                    <g transform={`translate(${midX}, ${midY - 8})`}>
                      <rect
                        x="-20"
                        y="-7"
                        width="40"
                        height="14"
                        rx="3"
                        fill="#080c14"
                        stroke={isPath ? '#7f1d1d' : '#1e293b'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3.5"
                        fill={isPath ? '#fca5a5' : '#94a3b8'}
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {edge.protocol}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Topology Nodes */}
              {nodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                const isVuln = node.activeVulnCount > 0 || node.nodeEAL > 0;
                const isTier1 = node.criticality === 'Tier 1';

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer transition-transform duration-150"
                  >
                    {/* Clean Outer Ring on Selection without glowing effects */}
                    {isSelected && (
                      <circle
                        r="33"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Node Core Circle */}
                    <circle
                      r="26"
                      fill={isVuln ? '#1a0e14' : '#0c1220'}
                      stroke={
                        isSelected
                          ? '#38bdf8'
                          : isVuln
                          ? '#ef4444'
                          : isTier1
                          ? '#f59e0b'
                          : '#334155'
                      }
                      strokeWidth={isSelected ? 2.5 : isVuln ? 2 : 1.5}
                    />

                    {/* Node Icon / Type Initial */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill={isVuln ? '#f87171' : isTier1 ? '#fbbf24' : '#94a3b8'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {node.id === 'INTERNET' ? 'WWW' : node.type.slice(0, 3).toUpperCase()}
                    </text>

                    {/* Node Label Below */}
                    <text
                      textAnchor="middle"
                      dy="42"
                      fill="#f1f5f9"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {node.name}
                    </text>

                    {/* Financial EAL Tag */}
                    {node.nodeEAL > 0 && (
                      <text
                        textAnchor="middle"
                        dy="54"
                        fill="#fbbf24"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {formatINR(node.nodeEAL)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Primary Ingress Chain: <strong className="text-slate-200">Internet → PAN-OS Gateway → Payment API → Core Banking DB</strong></span>
            <span className="font-mono text-emerald-400 flex items-center space-x-1 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>
              <span>Topology Model Synchronized</span>
            </span>
          </div>
        </div>

        {/* Selected Node Inspector Drawer */}
        <div className="bg-[#161720]/95 border border-white/[0.07] rounded-2xl p-5 space-y-4 text-xs flex flex-col justify-between shadow-2xl shadow-black/50 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-orange-400 uppercase tracking-wider font-mono font-semibold">
                  {selectedNode.id}
                </span>
                <h2 className="text-sm font-bold text-white mt-0.5">{selectedNode.name}</h2>
              </div>
              <CriticalityBadge criticality={selectedNode.criticality} />
            </div>

            {/* Financial & Technical Details */}
            <div className="space-y-2 font-mono">
              <div className="bg-[#101117] p-2.5 rounded-xl border border-zinc-800/80 flex justify-between items-center">
                <span className="text-zinc-400 text-[11px]">Current Node EAL:</span>
                <span className="text-orange-400 font-bold text-xs">{formatINR(selectedNode.nodeEAL)}</span>
              </div>

              <div className="bg-[#101117] p-2.5 rounded-xl border border-zinc-800/80 flex justify-between items-center">
                <span className="text-zinc-400 text-[11px]">Single Loss Exposure:</span>
                <span className="text-zinc-200 font-semibold text-xs">{formatINR(selectedNode.financialExposure)}</span>
              </div>

              <div className="bg-[#101117] p-2.5 rounded-xl border border-zinc-800/80 flex justify-between items-center">
                <span className="text-zinc-400 text-[11px]">Active Vulnerabilities:</span>
                <span className={`text-xs font-bold ${selectedNode.activeVulnCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedNode.activeVulnCount} Findings
                </span>
              </div>
            </div>

            {/* Canonical Ingress Attack Path */}
            <div className="space-y-1.5">
              <div className="font-semibold text-zinc-300 uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                <GitFork className="w-3 h-3 text-orange-400" />
                <span>Lateral Attack Path:</span>
              </div>
              <div className="bg-[#101117] p-2.5 rounded-xl border border-zinc-800/80 space-y-1.5">
                {attackPathSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-[11px]">
                    <span className="font-mono text-orange-400 font-bold">{idx + 1}.</span>
                    <span className={step.id === selectedNode.id ? 'font-bold text-white' : 'text-zinc-400'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blast Radius Context */}
            <div className="bg-[#101117] p-3 rounded-xl border border-zinc-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-300">Downstream Blast Radius:</span>
                <Badge variant={blastRadius.severity === 'CRITICAL' ? 'critical' : blastRadius.severity === 'HIGH' ? 'high' : 'info'}>
                  {blastRadius.severity}
                </Badge>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">{blastRadius.description}</p>
            </div>

            {/* Linked Risks for this node */}
            {linkedRisks.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-semibold text-zinc-300 uppercase text-[10px] tracking-wider">
                  Active Financial Risks ({linkedRisks.length}):
                </div>
                <div className="space-y-1">
                  {linkedRisks.map(r => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedRiskId(r.id);
                        setActiveTab('risk');
                      }}
                      className="bg-[#101117] p-2.5 rounded-xl border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <span className="font-medium text-zinc-200 group-hover:text-white truncate max-w-[170px]">{r.title}</span>
                      <span className="font-mono text-orange-400 font-bold text-[11px] shrink-0">
                        {formatINR(r.fairMetrics?.expectedAnnualLoss || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action CTA */}
          {linkedAsset && (
            <div className="pt-3 border-t border-zinc-800/80">
              <button
                onClick={() => {
                  setSelectedAssetId(linkedAsset.id);
                  setActiveTab('assets');
                }}
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-medium flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-orange-950/40"
              >
                <span>Inspect Asset Details & Controls</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
