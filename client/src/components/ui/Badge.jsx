import React from 'react';

export const Badge = ({
  children,
  variant = 'brand',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 leading-none',
    md: 'text-xs px-2 py-0.5 leading-tight',
    lg: 'text-xs px-2.5 py-1 leading-normal font-semibold',
  };

  const variants = {
    brand:
      'bg-[#FAF0F2] text-[#7A263A] dark:bg-[#7A263A]/20 dark:text-[#E8A5B2] border border-[#E8C5CC] dark:border-[#7A263A]/40',
    brass:
      'bg-[#FBF6EE] text-[#8C642A] dark:bg-[#C59A5B]/20 dark:text-[#E8CDA0] border border-[#E8D5B8] dark:border-[#C59A5B]/40',
    success:
      'bg-[#EFF5F1] text-[#3F6B52] dark:bg-[#3F6B52]/20 dark:text-[#88BA9D] border border-[#C2D9CB] dark:border-[#3F6B52]/40',
    warning:
      'bg-[#FBF5EC] text-[#A66A24] dark:bg-[#A66A24]/20 dark:text-[#DEAC74] border border-[#E8D5BE] dark:border-[#A66A24]/40',
    danger:
      'bg-[#FAF0F0] text-[#A33B3B] dark:bg-[#A33B3B]/20 dark:text-[#E59797] border border-[#E8C4C4] dark:border-[#A33B3B]/40',
    neutral:
      'bg-[#F0ECE4] text-[#68645E] dark:bg-[#24201C] dark:text-[#9E988F] border border-[#DED9D0] dark:border-[#332F2A]',
  };

  const dotColors = {
    brand: 'bg-[#7A263A]',
    brass: 'bg-[#C59A5B]',
    success: 'bg-[#3F6B52]',
    warning: 'bg-[#A66A24]',
    danger: 'bg-[#A33B3B]',
    neutral: 'bg-[#948F87]',
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-md tracking-tight ${sizes[size]} ${variants[variant] || variants.brand} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${dotColors[variant] || dotColors.brand}`}
        />
      )}
      {children}
    </span>
  );
};
