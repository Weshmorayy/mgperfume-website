import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  glass?: boolean;
}

export function Card({
  children,
  hoverEffect = true,
  glass = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-6 sm:p-8 transition-all duration-300',
        glass
          ? 'bg-white/80 backdrop-blur-md border-surface-200/80 dark:bg-surface-900/80 dark:border-surface-800/80 shadow-sm'
          : 'bg-white border-surface-200/80 dark:bg-surface-900 dark:border-surface-800 shadow-sm',
        hoverEffect && 'hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 dark:hover:border-brand-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
