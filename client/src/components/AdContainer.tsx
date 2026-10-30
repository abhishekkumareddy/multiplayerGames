import React from 'react';

interface AdContainerProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

/**
 * AdContainer - Policy-compliant placeholder for Google AdSense monetization.
 * - Adheres to Google Publisher Policies: Clearly labeled with "ADVERTISEMENT".
 * - Prevents Cumulative Layout Shift (CLS) by maintaining minimum reserved height.
 * - Strictly placed on non-interactive content zones (guides, public footers, info sections).
 * - NEVER placed inside active gameplay grids or covering controls.
 * - Ready for production AdSense unit insertion when publisher ID is provided.
 */
export const AdContainer: React.FC<AdContainerProps> = ({
  format = 'horizontal',
  className = '',
}) => {
  const getFormatClasses = () => {
    switch (format) {
      case 'rectangle':
        return 'w-full max-w-[336px] min-h-[280px]';
      case 'vertical':
        return 'w-full max-w-[300px] min-h-[600px]';
      case 'horizontal':
      default:
        return 'w-full max-w-4xl min-h-[100px] sm:min-h-[120px]';
    }
  };

  return (
    <div
      className={`mx-auto my-6 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800/80 text-center transition-colors ${getFormatClasses()} ${className}`}
      aria-label="Advertisement Placement Zone"
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 select-none">
        Advertisement
      </span>
      <div className="flex-1 w-full flex items-center justify-center text-slate-600 text-xs">
        {/* Placeholder ready for <ins className="adsbygoogle" ... /> */}
        <span className="text-[11px] text-slate-500 font-mono">
          Sponsored Space
        </span>
      </div>
    </div>
  );
};
