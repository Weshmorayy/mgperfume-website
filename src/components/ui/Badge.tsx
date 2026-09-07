import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'surface';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-brand-50 text-brand-700 border-brand-200/60 dark:bg-brand-950/50 dark:text-brand-300 dark:border-brand-800/60',
    secondary: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
    outline: 'bg-transparent text-surface-700 border-surface-300 dark:text-surface-300 dark:border-surface-700',
    surface: 'bg-surface-100 text-surface-800 border-surface-200 dark:bg-surface-800 dark:text-surface-200 dark:border-surface-700',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs font-medium',
    md: 'px-3.5 py-1 text-xs sm:text-sm font-semibold tracking-wide',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border shadow-sm transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
