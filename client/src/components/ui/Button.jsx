import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  // Editorial restrained tactile press styling (10-12px corner radii, subtle shadows)
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[10px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#F7F4EE] dark:focus:ring-offset-[#141210] focus:ring-[#7A263A] disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-y-[1px]';

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm md:text-base gap-2.5 font-semibold',
  };

  const variants = {
    primary:
      'bg-[#7A263A] hover:bg-[#641F30] text-white border border-[#7A263A]/80 shadow-sm',
    secondary:
      'bg-[#F0ECE4] hover:bg-[#E8E2D8] dark:bg-[#262320] dark:hover:bg-[#302B26] text-[#171717] dark:text-[#F7F4EE] border border-[#DED9D0] dark:border-[#332F2A] shadow-sm',
    outline:
      'bg-transparent border border-[#DED9D0] dark:border-[#332F2A] text-[#171717] dark:text-[#F7F4EE] hover:bg-[#F0ECE4] dark:hover:bg-[#262320]',
    ghost:
      'bg-transparent text-[#68645E] dark:text-[#9E988F] hover:bg-[#F0ECE4] dark:hover:bg-[#262320] hover:text-[#171717] dark:hover:text-[#F7F4EE]',
    brass:
      'bg-[#C59A5B] hover:bg-[#B38747] text-white border border-[#C59A5B]/80 shadow-sm',
    danger:
      'bg-[#A33B3B] hover:bg-[#8F3232] text-white border border-[#A33B3B]/80 shadow-sm',
    success:
      'bg-[#3F6B52] hover:bg-[#335742] text-white border border-[#3F6B52]/80 shadow-sm',
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
