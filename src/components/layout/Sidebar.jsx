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
  Radio
} from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    openCriticalRisksCount,
    remediations,
    complianceControls,
    telemetryFeeds
  } = useRiskStore();

  const inProgressRemediations = (remediations || []).filter(r => r.status !== 'Verified').length;
  const gapComplianceCount = (complianceControls || []).filter(c => c.status === 'Partially Implemented' || c.status === 'Not Implemented' || c.status === 'Gap / Deficient').length;

  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: 'Executive Overview',
          icon: LayoutDashboard
        }
      ]
    },
    {
      title: 'RISK INTELLIGENCE',
      items: [
        {
          id: 'risk',
          label: 'Risk & Exposure',
          icon: AlertTriangle,
          badge: openCriticalRisksCount > 0 ? `${openCriticalRisksCount} critical` : null,
          badgeVariant: 'critical'
        },
        {
          id: 'assets',
          label: 'Asset Intelligence',
          icon: Server
        },
        {
          id: 'graph',
          label: 'Attack Path Graph',
          icon: GitFork
        }
      ]
    },
    {
      title: 'DECISION SUPPORT',
      items: [
        {
          id: 'simulator',
          label: 'What-If Simulator',
          icon: Sliders
        },
        {
          id: 'optimizer',
          label: 'Investment Optimizer',
          icon: TrendingUp
        }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'remediation',
          label: 'Remediation Center',
          icon: CheckSquare,
          badge: inProgressRemediations > 0 ? inProgressRemediations : null,
          badgeVariant: 'info'
        },
        {
          id: 'compliance',
          label: 'Compliance Hub',
          icon: FileCheck,
          badge: gapComplianceCount > 0 ? `${gapComplianceCount} gaps` : null,
          badgeVariant: 'amber'
        },
        {
          id: 'telemetry',
          label: 'Telemetry Center',
          icon: Radio
        }
      ]
    }
  ];

  return (
    <aside className="w-56 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-3.25rem)] select-none">
      <div className="py-3 px-2 space-y-4">
        {sections.map(section => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[10px] font-semibold text-slate-400 tracking-wider">
              {section.title}
            </div>

            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white border-l-2 border-sky-400 pl-2.5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-l-2 border-transparent pl-2.5'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        item.badgeVariant === 'critical'
                          ? 'bg-red-950/80 text-red-300 border border-red-800/60'
                          : item.badgeVariant === 'amber'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Telemetry Feeds:</span>
          <span className="font-mono text-slate-300">4 / 4 Active</span>
        </div>
      </div>
    </aside>
  );
};
