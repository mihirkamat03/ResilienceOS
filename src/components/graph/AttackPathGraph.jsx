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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Attack Propagation & Dependency Graph</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tracing lateral exposure vectors from perimeter entry points toward critical data stores
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setHighlightAttackPath(!highlightAttackPath)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
              highlightAttackPath
                ? 'bg-red-950/80 text-red-300 border-red-800/80'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{highlightAttackPath ? 'Vulnerable Vectors Emphasized' : 'Show All Network Paths'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Interactive Topology Canvas */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded p-4 relative overflow-hidden flex flex-col justify-between min-h-[480px]">
          {/* Legend */}
          <div className="absolute top-3 left-3 z-10 bg-slate-900/90 border border-slate-800 p-2.5 rounded text-[11px] space-y-1">
            <div className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider">Topology State</div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-slate-300">Vulnerable / Active Finding</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-slate-300">Protected Lateral Hop</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-300">Tier-1 Core Asset Target</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center pt-6">
            <svg viewBox="0 0 1020 400" className="w-full h-auto select-none">
              <defs>
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

              {/* Edge Connections */}
              {edges.map((edge, idx) => {
                const source = nodes.find(n => n.id === edge.from);
                const target = nodes.find(n => n.id === edge.to);
                if (!source || !target) return null;

                const isPath = highlightAttackPath && edge.isVulnerablePath;

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
                    {/* Edge Protocol Label */}
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2 - 8}
                      fill={isPath ? '#fca5a5' : '#64748b'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {edge.protocol}
                    </text>
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
                    {/* Outer Ring on Selection */}
                    {isSelected && (
                      <circle
                        r="34"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        className="animate-spin-slow"
                      />
                    )}

                    {/* Node Core Circle */}
                    <circle
                      r="26"
                      fill={isVuln ? '#1e1b2e' : '#0f172a'}
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
                      fill="#e2e8f0"
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
            <span>Primary Ingress Chain: <strong>Internet → PAN-OS Gateway → Payment API → Core Banking DB</strong></span>
            <span className="font-mono text-slate-300">Live State Synced</span>
          </div>
        </div>

        {/* Selected Node Inspector Drawer */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4 text-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  {selectedNode.id}
                </span>
                <h2 className="text-sm font-bold text-white mt-0.5">{selectedNode.name}</h2>
              </div>
              <CriticalityBadge criticality={selectedNode.criticality} />
            </div>

            {/* Financial & Technical Details */}
            <div className="space-y-2 font-mono">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Current Node EAL:</span>
                <span className="text-amber-400 font-bold">{formatINR(selectedNode.nodeEAL)}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Single Loss Exposure:</span>
                <span className="text-slate-200">{formatINR(selectedNode.financialExposure)}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Active Vulnerabilities:</span>
                <span className={selectedNode.activeVulnCount > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                  {selectedNode.activeVulnCount} Findings
                </span>
              </div>
            </div>

            {/* Canonical Ingress Attack Path */}
            <div className="space-y-1.5">
              <div className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider flex items-center space-x-1">
                <GitFork className="w-3 h-3 text-sky-400" />
                <span>Lateral Attack Path:</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                {attackPathSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 text-[11px]">
                    <span className="font-mono text-sky-400">{idx + 1}.</span>
                    <span className={step.id === selectedNode.id ? 'font-bold text-white' : 'text-slate-400'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blast Radius Context */}
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-300">Downstream Blast Radius:</span>
                <Badge variant={blastRadius.severity === 'CRITICAL' ? 'critical' : blastRadius.severity === 'HIGH' ? 'high' : 'info'}>
                  {blastRadius.severity}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">{blastRadius.description}</p>
            </div>

            {/* Linked Risks for this node */}
            {linkedRisks.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider">
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
                      className="bg-slate-950 p-2 rounded border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-200 truncate max-w-[170px]">{r.title}</span>
                      <span className="font-mono text-amber-400 font-bold text-[11px] shrink-0">
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
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setSelectedAssetId(linkedAsset.id);
                  setActiveTab('assets');
                }}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium flex items-center justify-center space-x-1.5 transition-colors"
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
