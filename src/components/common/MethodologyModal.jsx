import React from 'react';
import { X, BookOpen, Calculator, ShieldCheck } from 'lucide-react';

export const MethodologyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Quantitative Risk Methodology & Assumptions</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-300 leading-relaxed">
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">Methodology Framework</span>
            <p className="text-xs text-slate-300">
              ResilienceOS uses a <strong>FAIR-informed (Factor Analysis of Information Risk)</strong> quantitative framework combined with parametric lognormal loss distributions to calculate estimated annual exposure and Value at Risk (VaR).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">1. Loss Event Frequency (LEF)</h4>
            <div className="font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] text-slate-300">
              LEF = Threat Event Frequency (TEF) × Vulnerability Exploitation Factor (Vuln)
            </div>
            <p className="text-[11px] text-slate-400">
              TEF is estimated from network exposure vectors (Internet-Facing vs Internal) and CISA KEV active exploitation feeds. Vulnerability Factor is evaluated by combining CVSS v3.1 base score, EPSS probability, and existing compound control strengths.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">2. Loss Magnitude (LM) Breakdown</h4>
            <div className="font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] text-slate-300">
              Total Loss = Downtime (MTTR × Hourly Cost) + Data Breach Liability + Incident Response + Regulatory Penalties + System Recovery
            </div>
            <p className="text-[11px] text-slate-400">
              Data breach liability is estimated using Indian Digital Personal Data Protection (DPDP) Act metrics (average ₹1,916/record for sensitive PII/PCI). Downtime cost is derived directly from the asset owner's operational business criticality.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">3. Expected Annual Loss & Uncertainty Modeling</h4>
            <p className="text-[11px] text-slate-400">
              <strong>Expected Annual Loss (EAL)</strong> is the mean annual loss: <span className="font-mono text-slate-200">EAL = LEF × Mean LM</span>. 
              Because single-point predictions are inherently uncertain, exposure is modeled as a lognormal distribution generating <strong>95% Value at Risk (VaR)</strong> and <strong>P10–P90 confidence bands</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">4. 0/1 Knapsack Capital Optimization & ROSI</h4>
            <div className="font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] text-slate-300">
              Maximize ∑ (ΔEAL_i) Subject to: ∑ (Cost_i) ≤ Available Budget
            </div>
            <p className="text-[11px] text-slate-400">
              Return on Security Investment is computed over a 12-month horizon as: <span className="font-mono text-slate-200">ROSI = ((ΔEAL - Cost) / Cost) × 100%</span>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>All values represent statistical modeled exposure, not guaranteed predictions.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
