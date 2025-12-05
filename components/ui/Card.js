'use client';

import { cn } from '@/lib/utils';

export function Card({ children, hover = false, className, ...props }) {
  return (
    <div
      className={cn(
        hover ? 'card-shopify-hover' : 'card-shopify',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-shopify-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-white',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p
      className={cn(
        'text-sm text-shopify-gray-400 mt-1',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div
      className={cn('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-shopify-gray-800 bg-shopify-darker',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}