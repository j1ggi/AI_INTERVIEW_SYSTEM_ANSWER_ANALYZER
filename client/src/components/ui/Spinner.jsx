import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '', label }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-[#7A263A] dark:text-[#D4AA6A]`} />
      {label && <p className="font-mono text-xs tracking-tight text-[#68645E] dark:text-[#9E988F]">{label}</p>}
    </div>
  );
};
