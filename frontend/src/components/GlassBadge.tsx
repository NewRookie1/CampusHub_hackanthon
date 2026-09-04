import React from 'react';

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export default function GlassBadge({
  children,
  variant = 'blue',
  size = 'md',
  className = '',
}: GlassBadgeProps) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 rounded-lg font-semibold',
    md: 'text-xs px-2.5 py-1 rounded-full font-semibold',
  };

  const variantClasses = {
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/35',
    indigo: 'bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/35',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/35',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/35',
    sky: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/35',
    purple: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/35',
    slate: 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-300 border border-slate-300/80 dark:border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 backdrop-blur-md transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
