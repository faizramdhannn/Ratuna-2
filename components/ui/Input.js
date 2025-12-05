'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export const Input = forwardRef(({ 
  label, 
  error, 
  helperText,
  icon: Icon,
  className,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-shopify-gray-300 mb-2">
          {label}
          {props.required && <span className="text-shopify-accent-critical ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-shopify-gray-500">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            error ? 'input-shopify-error' : 'input-shopify',
            Icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-shopify-accent-critical">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-shopify-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({ 
  label, 
  error, 
  helperText,
  className,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-shopify-gray-300 mb-2">
          {label}
          {props.required && <span className="text-shopify-accent-critical ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          error ? 'input-shopify-error' : 'input-shopify',
          'resize-none',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-shopify-accent-critical">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-shopify-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export const Select = forwardRef(({ 
  label, 
  error, 
  helperText,
  options = [],
  className,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-shopify-gray-300 mb-2">
          {label}
          {props.required && <span className="text-shopify-accent-critical ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          error ? 'input-shopify-error' : 'input-shopify',
          className
        )}
        {...props}
      >
        {options.map((option, idx) => (
          <option key={idx} value={option.value} className="bg-shopify-charcoal text-white">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-shopify-accent-critical">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-shopify-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';