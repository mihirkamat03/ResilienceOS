import React from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';

export const MetricCard = ({
  icon: Icon,
  iconColor = 'text-indigo-400',
  iconBg = 'bg-indigo-500/10 border-indigo-500/20',
  label,
  value,
  subValue,
  change,
  badge, // { text: '18%', positive: true }
  viewDetailsText = 'View Details',
  onViewDetails,
  onClick,
  tooltip
}) => {
  return (
    <div
      onClick={onClick || onViewDetails}
      title={tooltip}
      className="group relative bg-[#161720]/90 hover:bg-[#191b26] border border-white/[0.07] hover:border-zinc-700/80 rounded-2xl p-4 flex flex-col justify-between shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm"
    >
      {/* Top row: Icon container on left, View Details on right */}
      <div className="flex items-center justify-between mb-3">
        {Icon ? (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${iconBg} ${iconColor} transition-transform duration-300 group-hover:scale-105 shadow-sm`}>
            <Icon className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails();
            else if (onClick) onClick();
          }}
          className="text-[11px] font-medium text-zinc-400 hover:text-zinc-200 flex items-center space-x-1 group-hover:text-amber-400 transition-colors"
        >
          <span>{viewDetailsText}</span>
          <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Middle: Label */}
      <div className="text-xs font-medium text-zinc-400 truncate">
        {label}
      </div>

      {/* Bottom: Big Value + Pill Badge */}
      <div className="flex items-baseline justify-between gap-2 mt-1">
        <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
          {value}
        </div>

        {badge && (
          <span
            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold shrink-0 border ${
              badge.positive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
            }`}
          >
            {badge.positive ? (
              <ArrowUpRight className="w-2.5 h-2.5" />
            ) : (
              <ArrowDownRight className="w-2.5 h-2.5" />
            )}
            <span>{badge.text}</span>
          </span>
        )}

        {!badge && change && (
          <span
            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold shrink-0 border ${
              change.isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
            }`}
          >
            <span>{change.value}</span>
          </span>
        )}
      </div>

      {/* Optional subValue footer */}
      {subValue && (
        <div className="mt-2 pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 truncate font-mono">
          {subValue}
        </div>
      )}
    </div>
  );
};
