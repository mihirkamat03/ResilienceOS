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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4">
      <div className="bg-[#14151e] border border-white/[0.1] w-full max-w-2xl rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[70vh] animate-fade-in">
        {/* Search Header */}
        <div className="p-4 border-b border-white/[0.07] flex items-center space-x-3 bg-[#181924]">
          <Search className="w-4 h-4 text-amber-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search risks, assets, CVEs, compliance controls, remediations..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="p-3.5 overflow-y-auto space-y-4">
          {/* Risks */}
          {filteredRisks.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-2 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
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
                    className="flex items-center justify-between p-3 hover:bg-white/[0.04] rounded-xl cursor-pointer transition-all text-xs border border-transparent hover:border-white/[0.08]"
                  >
                    <div>
                      <div className="text-zinc-200 font-semibold">{r.title}</div>
                      <div className="text-[11px] text-zinc-400 font-mono flex items-center space-x-2 mt-0.5">
                        <span className="text-amber-400 font-semibold">{r.id}</span>
                        <span>•</span>
                        <span>{r.vulnId}</span>
                        <span>•</span>
                        <span>Asset: {r.assetId}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-mono font-bold">
                        {formatINR(r.fairMetrics.expectedAnnualLoss)}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono uppercase">EAL</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assets */}
          {filteredAssets.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-2 flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-amber-400" />
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
                    className="flex items-center justify-between p-3 hover:bg-white/[0.04] rounded-xl cursor-pointer transition-all text-xs border border-transparent hover:border-white/[0.08]"
                  >
                    <div>
                      <div className="text-zinc-200 font-semibold">{a.name}</div>
                      <div className="text-[11px] text-zinc-400 flex items-center space-x-2 mt-0.5">
                        <span className="font-mono text-amber-400">{a.id}</span>
                        <span>•</span>
                        <span>{a.businessUnit}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-medium">{a.criticality}</span>
                      </div>
                    </div>
                    <div className="text-right text-zinc-200 font-mono font-bold">
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
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-2 flex items-center space-x-1.5">
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
                    className="flex items-center justify-between p-3 hover:bg-white/[0.04] rounded-xl cursor-pointer transition-all text-xs border border-transparent hover:border-white/[0.08]"
                  >
                    <div>
                      <div className="text-zinc-200 font-semibold">
                        <span className="text-zinc-400 mr-1.5 font-mono">[{c.framework}]</span>
                        <span className="font-mono text-amber-400 mr-1.5">{c.controlCode}</span>
                        {c.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{c.domain}</div>
                    </div>
                    <div className="text-right text-xs font-mono text-emerald-400 font-bold">
                      {c.coveragePercentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredRisks.length === 0 && filteredAssets.length === 0 && filteredCompliance.length === 0 && (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No matching records found for "{query}".
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="p-3.5 bg-[#12131a] border-t border-white/[0.07] text-[11px] text-zinc-400 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <kbd className="px-2 py-0.5 bg-[#1a1c27] border border-white/[0.08] rounded-md font-mono text-[10px] text-zinc-300">Tab</kbd>
            <span>Jump across risks, assets & regulatory controls</span>
          </span>
          <span className="flex items-center space-x-1.5 font-mono text-[10px] text-zinc-500">
            <kbd className="px-2 py-0.5 bg-[#1a1c27] border border-white/[0.08] rounded-md text-zinc-300">ESC</kbd>
            <span>to close</span>
          </span>
        </div>
      </div>
    </div>
  );
};
