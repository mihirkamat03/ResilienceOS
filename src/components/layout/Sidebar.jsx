import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Server,
  GitFork,
  Sliders,
  TrendingUp,
  CheckSquare,
  FileCheck,
  Radio,
  Shield,
  MoreHorizontal,
  SlidersHorizontal,
  Bell,
  Settings,
  User,
  Sparkles
} from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    activeRole,
    openCriticalRisksCount,
    remediations,
    complianceControls,
    risks,
    setIsCopilotDrawerOpen
  } = useRiskStore();

  const inProgressRemediations = (remediations || []).filter(r => r.status !== 'Verified').length;
  const gapComplianceCount = (complianceControls || []).filter(c => c.status === 'Partially Implemented' || c.status === 'Not Implemented' || c.status === 'Gap / Deficient').length;
  const activeUnremediatedRisksCount = (risks || []).filter(r => r.status !== 'Remediated').length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'risk',
      label: 'Attack Surface',
      icon: AlertTriangle,
      badge: openCriticalRisksCount > 0 ? openCriticalRisksCount : null,
      badgeVariant: 'critical'
    },
    {
      id: 'assets',
      label: 'Asset Intelligence',
      icon: Server,
    },
    {
      id: 'graph',
      label: 'Lateral Attack Path',
      icon: GitFork,
    },
    {
      id: 'remediation',
      label: 'Remediation Hub',
      icon: CheckSquare,
      badge: inProgressRemediations > 0 ? inProgressRemediations : null,
      badgeVariant: 'amber'
    },
    {
      id: 'simulator',
      label: 'What-If Simulation',
      icon: Sliders,
    },
    {
      id: 'optimizer',
      label: 'Capital Optimizer',
      icon: TrendingUp,
    },
    {
      id: 'compliance',
      label: 'Compliance Engine',
      icon: FileCheck,
      badge: gapComplianceCount > 0 ? gapComplianceCount : null,
      badgeVariant: 'purple'
    },
    {
      id: 'telemetry',
      label: 'Continuous Telemetry',
      icon: Radio,
    }
  ];

  return (
    <aside className="w-64 bg-[#111218] border-r border-zinc-800/70 flex flex-col justify-between shrink-0 h-[calc(100vh-3.25rem)] select-none z-20">
      {/* Brand Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center space-x-2.5">
            {/* Orange diamond brand badge matching RAPID7 style */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-950/40 border border-amber-300/30">
              <Shield className="w-4 h-4 fill-white/20 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                RESILIENCE<span className="text-amber-400">OS</span>
              </div>
              <div className="text-[9px] text-zinc-400 font-medium">SIH PS 26105</div>
            </div>
          </div>
          <button
            type="button"
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
            title="Workspace Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-3 py-2 space-y-4 overflow-y-auto flex-1">
        <div>
          {/* MENU section header with icon */}
          <div className="flex items-center justify-between px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            <span>MENU</span>
            <SlidersHorizontal className="w-3 h-3 text-zinc-400" />
          </div>

          <div className="space-y-1 mt-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent text-white font-semibold border border-amber-500/30 shadow-lg shadow-orange-950/20'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] font-medium'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.4)]'
                          : 'text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ml-1.5 shadow-sm ${
                        item.badgeVariant === 'critical'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : item.badgeVariant === 'amber'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Copilot Quick Launcher Card */}
        <div className="pt-1">
          <button
            onClick={() => setIsCopilotDrawerOpen(true)}
            className="w-full bg-gradient-to-br from-[#181922] to-[#12131a] hover:from-[#1d1f2b] hover:to-[#161720] border border-amber-500/25 hover:border-amber-500/45 rounded-2xl p-3 transition-all duration-300 flex items-center justify-between text-left group shadow-lg shadow-black/30"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-100 group-hover:text-white">AI Risk Copilot</div>
                <div className="text-[10px] text-zinc-400">Grounded in FAIR engine</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">⌘/</span>
          </button>
        </div>
      </div>

      {/* Modern SaaS Bottom Footer (Notification, Settings, Profile) */}
      <div className="p-3 border-t border-zinc-800/70 bg-[#0e0f14] space-y-1.5">
        {/* Notification row with red count badge matching reference */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors cursor-pointer">
          <div className="flex items-center space-x-2.5">
            <Bell className="w-4 h-4 text-zinc-400" />
            <span>Notification</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white shadow-sm">
            {activeUnremediatedRisksCount || 6}
          </span>
        </div>

        {/* Role Workspace */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors cursor-pointer">
          <div className="flex items-center space-x-2.5 min-w-0">
            <User className="w-4 h-4 text-zinc-400" />
            <span className="truncate">{activeRole} Workspace</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        </div>
      </div>
    </aside>
  );
};
