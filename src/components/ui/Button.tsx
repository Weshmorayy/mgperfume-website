import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  isExternal?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  isExternal,
  className,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-7 py-3.5 text-lg gap-2.5 shadow-md hover:shadow-lg',
  };

  const variantClasses = {
    primary:
      'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 focus-visible:ring-brand-500 active:scale-[0.98]',
    secondary:
      'bg-surface-900 hover:bg-surface-800 text-white shadow-surface-900/20 focus-visible:ring-surface-700 active:scale-[0.98] dark:bg-surface-100 dark:text-surface-900 dark:hover:bg-white',
    outline:
      'border-2 border-surface-300 hover:border-surface-900 text-surface-800 hover:bg-surface-50 focus-visible:ring-surface-400 dark:border-surface-700 dark:text-surface-200 dark:hover:border-surface-300 dark:hover:bg-surface-800',
    ghost:
      'text-surface-700 hover:text-surface-900 hover:bg-surface-100 focus-visible:ring-surface-300 dark:text-surface-300 dark:hover:text-white dark:hover:bg-surface-800',
    glow:
      'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 focus-visible:ring-brand-400 active:scale-[0.98]',
  };

  const combinedClasses = cn(baseClasses, sizeClasses[size], variantClasses[variant], className);

  if (href) {
    return (
      <a
        href={href}
        className={combinedClasses}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
