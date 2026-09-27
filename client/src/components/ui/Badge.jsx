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
    brand: 'bg-blue-50 text-blue-700 border border-blue-200',
    brass: 'bg-amber-50 text-amber-700 border border-amber-200',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const dotColors = {
    brand: 'bg-blue-600',
    brass: 'bg-amber-600',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    danger: 'bg-red-600',
    neutral: 'bg-slate-500',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded ${sizes[size]} ${variants[variant] || variants.brand} ${className}`}
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

export default Badge;
