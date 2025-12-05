'use client';

import { cn } from '@/lib/utils';

const badgeVariants = {
  success: 'badge-success',
  warning: 'badge-warning',
  critical: 'badge-critical',
  info: 'badge-info',
  default: 'badge-shopify bg-shopify-gray-800 text-shopify-gray-300 border-shopify-gray-700',
};

export default function Badge({ 
  children, 
  variant = 'default',
  icon: Icon,
  className,
  ...props 
}) {
  return (
    <span
      className={cn(
        badgeVariants[variant],
        'inline-flex items-center gap-1',
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}