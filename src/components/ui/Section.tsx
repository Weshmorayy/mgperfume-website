import React from 'react';
import { Container } from './Container';
import { Badge } from './Badge';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  centered?: boolean;
  background?: 'white' | 'subtle' | 'dark' | 'brand' | 'cream' | 'card';
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}

export function Section({
  id,
  badge,
  title,
  subtitle,
  centered = true,
  background = 'white',
  containerSize = 'lg',
  children,
  className,
  ...props
}: SectionProps) {
  const backgroundClasses = {
    white: 'bg-white',
    subtle: 'bg-surface-50/80 border-y border-surface-200/60',
    dark: 'bg-surface-900 text-white',
    brand: 'bg-brand-900 text-white',
    cream: 'bg-[#FAF8F5]',
    card: 'bg-surface-100',
  };

  return (
    <section
      id={id}
      className={cn('py-16 sm:py-20 lg:py-28 relative scroll-mt-16', backgroundClasses[background], className)}
      {...props}
    >
      <Container size={containerSize}>
        {(badge || title || subtitle) && (
          <div
            className={cn(
              'mb-12 sm:mb-16 space-y-4 max-w-3xl',
              centered && 'mx-auto text-center'
            )}
          >
            {badge && (
              <div>
                <Badge variant={background === 'dark' || background === 'brand' ? 'surface' : 'primary'}>
                  {badge}
                </Badge>
              </div>
            )}
            {title && (
              <h2
                className={cn(
                  'text-3xl sm:text-4xl font-extrabold tracking-tight',
                  background === 'dark' || background === 'brand'
                    ? 'text-white'
                    : 'text-surface-900 dark:text-white'
                )}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={cn(
                  'text-lg sm:text-xl font-normal leading-relaxed',
                  background === 'dark' || background === 'brand'
                    ? 'text-surface-300'
                    : 'text-surface-600 dark:text-surface-400'
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
