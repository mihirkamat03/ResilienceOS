import React, { useState, useEffect } from 'react';
import { Search, X, AlertTriangle, Server, FileCheck } from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { formatINR } from '../../core/riskEngine';

export const GlobalSearchModal = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    risks,
    assets,
    complianceControls,
    setSelectedRiskId,
    setSelectedAssetId,
    setActiveTab
  } = useRiskStore();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(!isSearchModalOpen);
      }
      if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const filteredRisks = risks.filter(
    r =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.id.toLowerCase().includes(query.toLowerCase()) ||
      r.vulnId.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAssets = assets.filter(
    a =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.id.toLowerCase().includes(query.toLowerCase()) ||
      a.businessUnit.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCompliance = complianceControls.filter(
    c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.controlCode.toLowerCase().includes(query.toLowerCase()) ||
      c.framework.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search risks, assets, CVEs, compliance controls, remediations..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="p-3 overflow-y-auto space-y-4">
          {/* Risks */}
          {filteredRisks.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Risks & Exposures ({filteredRisks.length})</span>
              </div>
              <div className="space-y-1">
                {filteredRisks.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRiskId(r.id);
                      setActiveTab('risk');
                      setIsSearchModalOpen(false);
                    }}
                    className="flex items-center justify-between p-2 hover:bg-slate-800/80 rounded cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <div className="text-slate-200 font-medium">{r.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {r.id} • {r.vulnId} • Asset: {r.assetId}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-mono font-medium">
                        {formatINR(r.fairMetrics.expectedAnnualLoss)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">EAL</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assets */}
          {filteredAssets.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                <span>Enterprise Assets ({filteredAssets.length})</span>
              </div>
              <div className="space-y-1">
                {filteredAssets.map(a => (
                  <div
                    key={a.id}
                    onClick={() => {
                      setSelectedAssetId(a.id);
                      setActiveTab('assets');
                      setIsSearchModalOpen(false);
                    }}
                    className="flex items-center justify-between p-2 hover:bg-slate-800/80 rounded cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <div className="text-slate-200 font-medium">{a.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {a.id} • {a.businessUnit} • {a.criticality}
                      </div>
                    </div>
                    <div className="text-right text-slate-300 font-mono">
                      {formatINR(a.financialExposure)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance */}
          {filteredCompliance.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center space-x-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Compliance Controls ({filteredCompliance.length})</span>
              </div>
              <div className="space-y-1">
                {filteredCompliance.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveTab('compliance');
                      setIsSearchModalOpen(false);
                    }}
                    className="flex items-center justify-between p-2 hover:bg-slate-800/80 rounded cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <div className="text-slate-200 font-medium">
                        [{c.framework}] {c.controlCode} - {c.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{c.domain}</div>
                    </div>
                    <div className="text-right text-xs font-mono text-slate-300">
                      {c.coveragePercentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredRisks.length === 0 && filteredAssets.length === 0 && filteredCompliance.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Tip: Jump directly across risks, assets, and regulatory controls</span>
          <span>Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
