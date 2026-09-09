import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-medium';
  
  const variantClasses = {
    critical: 'bg-red-950/60 text-red-300 border border-red-800/60',
    high: 'bg-amber-950/60 text-amber-300 border border-amber-800/60',
    medium: 'bg-yellow-950/60 text-yellow-300 border border-yellow-800/60',
    low: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60',
    info: 'bg-sky-950/60 text-sky-300 border border-sky-800/60',
    neutral: 'bg-slate-800/80 text-slate-300 border border-slate-700',
    purple: 'bg-purple-950/60 text-purple-300 border border-purple-800/60'
  }[variant] || 'bg-slate-800 text-slate-300 border border-slate-700';

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};

export const SeverityBadge = ({ severity }) => {
  const map = {
    CRITICAL: { variant: 'critical', label: 'CRITICAL' },
    HIGH: { variant: 'high', label: 'HIGH' },
    MEDIUM: { variant: 'medium', label: 'MEDIUM' },
    LOW: { variant: 'low', label: 'LOW' }
  };
  const { variant, label } = map[severity] || { variant: 'neutral', label: severity };
  return <Badge variant={variant}>{label}</Badge>;
};

export const CriticalityBadge = ({ criticality }) => {
  const variant = criticality === 'Tier 1' ? 'critical' : criticality === 'Tier 2' ? 'high' : criticality === 'Tier 3' ? 'medium' : 'low';
  return <Badge variant={variant}>{criticality}</Badge>;
};

export const StatusBadge = ({ status }) => {
  let variant = 'neutral';
  if (status === 'Verified' || status === 'Satisfied') variant = 'low';
  else if (status === 'In Progress' || status === 'Partially Satisfied') variant = 'info';
  else if (status === 'Assigned') variant = 'medium';
  else if (status === 'Identified' || status === 'Gap / Deficient') variant = 'critical';

  return <Badge variant={variant}>{status}</Badge>;
};
