import React, { useEffect } from 'react';

interface AdContainerProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

/**
 * AdContainer - Policy-compliant container for Google AdSense monetization.
 * - Adheres to Google Publisher Policies: Clearly labeled with "ADVERTISEMENT".
 * - Prevents Cumulative Layout Shift (CLS) by maintaining minimum reserved height.
 * - Strictly placed on non-interactive content zones (guides, public footers, info sections).
 * - NEVER placed inside active gameplay grids or covering controls.
 */
export const AdContainer: React.FC<AdContainerProps> = ({
  slotId,
  format = 'horizontal',
  className = '',
}) => {
  useEffect(() => {
    if (slotId && typeof window !== 'undefined') {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {}
    }
  }, [slotId]);

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
      className={`mx-auto my-6 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800/80 text-center transition-colors ${getFormatClasses()} ${className}`}
      aria-label="Advertisement Placement Zone"
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 select-none">
        Advertisement
      </span>
      <div className="flex-1 w-full flex items-center justify-center text-slate-500 text-xs overflow-hidden">
        {slotId ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
            data-ad-client="ca-pub-2468333646239600"
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Sponsored Space
          </span>
        )}
      </div>
    </div>
  );
};
