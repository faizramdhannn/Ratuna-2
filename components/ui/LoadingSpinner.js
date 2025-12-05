'use client';

import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ 
  size = 'md', 
  text,
  fullScreen = false,
  className = ''
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizes[size]} text-shopify-accent-primary animate-spin`} />
      {text && (
        <p className="text-sm text-shopify-gray-400 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-shopify-dark bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

export function LoadingOverlay({ text = 'Loading...' }) {
  return (
    <div className="absolute inset-0 bg-shopify-dark bg-opacity-80 backdrop-blur-sm flex items-center justify-center rounded-shopify-lg z-10">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}