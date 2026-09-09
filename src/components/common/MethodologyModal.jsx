import React from 'react';
import { X, BookOpen, Calculator, ShieldCheck } from 'lucide-react';

export const MethodologyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#14151e] border border-white/[0.1] w-full max-w-2xl rounded-2xl shadow-2xl shadow-black/90 flex flex-col max-h-[85vh] overflow-hidden text-xs animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-[#181924] border-b border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Quantitative Risk Methodology & Assumptions</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-zinc-300 leading-relaxed">
          <div className="bg-[#181924] p-4 rounded-2xl border border-white/[0.07] space-y-1.5 shadow-sm">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Methodology Framework</span>
            <p className="text-xs text-zinc-300">
              ResilienceOS uses a <strong>FAIR-informed (Factor Analysis of Information Risk)</strong> quantitative framework combined with parametric lognormal loss distributions to calculate estimated annual exposure and Value at Risk (VaR).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">1. Loss Event Frequency (LEF)</h4>
            <div className="font-mono bg-[#0f1016] p-3.5 rounded-xl border border-white/[0.06] text-[11px] text-amber-300 font-semibold">
              LEF = Threat Event Frequency (TEF) × Vulnerability Exploitation Factor (Vuln)
            </div>
            <p className="text-[11px] text-zinc-400">
              TEF is estimated from network exposure vectors (Internet-Facing vs Internal) and CISA KEV active exploitation feeds. Vulnerability Factor is evaluated by combining CVSS v3.1 base score, EPSS probability, and existing compound control strengths.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">2. Loss Magnitude (LM) Breakdown</h4>
            <div className="font-mono bg-[#0f1016] p-3.5 rounded-xl border border-white/[0.06] text-[11px] text-amber-300 font-semibold">
              Total Loss = Downtime (MTTR × Hourly Cost) + Data Breach Liability + Incident Response + Regulatory Penalties + System Recovery
            </div>
            <p className="text-[11px] text-zinc-400">
              Data breach liability is estimated using Indian Digital Personal Data Protection (DPDP) Act metrics (average ₹1,916/record for sensitive PII/PCI). Downtime cost is derived directly from the asset owner's operational business criticality.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">3. Expected Annual Loss & Uncertainty Modeling</h4>
            <p className="text-[11px] text-zinc-400">
              <strong>Expected Annual Loss (EAL)</strong> is the mean annual loss: <span className="font-mono text-zinc-200">EAL = LEF × Mean LM</span>. 
              Because single-point predictions are inherently uncertain, exposure is modeled as a lognormal distribution generating <strong>95% Value at Risk (VaR)</strong> and <strong>P10–P90 confidence bands</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">4. 0/1 Knapsack Capital Optimization & ROSI</h4>
            <div className="font-mono bg-[#0f1016] p-3.5 rounded-xl border border-white/[0.06] text-[11px] text-amber-300 font-semibold">
              Maximize ∑ (ΔEAL_i) Subject to: ∑ (Cost_i) ≤ Available Budget
            </div>
            <p className="text-[11px] text-zinc-400">
              Return on Security Investment is computed over a 12-month horizon as: <span className="font-mono text-zinc-200">ROSI = ((ΔEAL - Cost) / Cost) × 100%</span>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#12131a] border-t border-white/[0.07] flex items-center justify-between text-[11px] text-zinc-400">
          <span>All values represent statistical modeled exposure, not guaranteed predictions.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1a1c27] hover:bg-[#222432] text-zinc-200 rounded-xl text-xs font-semibold border border-white/[0.08] hover:border-white/[0.15] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
