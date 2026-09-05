import React from 'react';

export const MetricCard = ({
  label,
  value,
  subValue,
  change,
  variant = 'default',
  tooltip,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 rounded p-4 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-slate-700' : ''
      }`}
      title={tooltip}
    >
      <div>
        <div className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
          {label}
        </div>
        <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums mt-1.5">
          {value}
        </div>
      </div>

      {(subValue || change) && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {change ? (
            <span
              className={`font-mono text-[11px] font-medium ${
                change.isPositive ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {change.value}
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">{subValue}</span>
          )}
          {change && subValue && (
            <span className="text-slate-500 text-[10px]">{subValue}</span>
          )}
        </div>
      )}
    </div>
  );
};
