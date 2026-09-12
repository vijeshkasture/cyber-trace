import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Querying investigation vault...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size] || 'w-6 h-6';

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className={`${sizeClasses} text-police-accent animate-spin mb-3`} />
      {text && <p className="text-sm font-medium text-police-textMuted">{text}</p>}
    </div>
  );
}
