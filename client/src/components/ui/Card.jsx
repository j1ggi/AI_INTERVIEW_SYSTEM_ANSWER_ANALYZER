import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  ...props
}) => {
  const cardClass = hover ? 'stitch-card-interactive' : 'stitch-card';

  return (
    <div className={`${cardClass} p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between pb-3.5 border-b border-[#DED9D0]/80 dark:border-[#332F2A]/80 mb-4 ${className}`}>
    <div>
      {title && <h3 className="text-base sm:text-lg font-serif font-semibold tracking-tight text-[#171717] dark:text-[#F7F4EE]">{title}</h3>}
      {subtitle && <p className="text-xs text-[#68645E] dark:text-[#9E988F] mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0 ml-4">{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`pt-3.5 mt-4 border-t border-[#DED9D0]/80 dark:border-[#332F2A]/80 flex items-center justify-between ${className}`}>
    {children}
  </div>
);
