import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layoutKey?: string; // For In-feed ads
  className?: string;
  label?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  slotId, 
  format = 'auto', 
  layoutKey,
  className = '',
  label = 'Advertisement'
}) => {
  const initialized = useRef(false);
  // Use a placeholder if you don't have a real slot ID yet for dev purposes
  const isDev = slotId === 'PLACEHOLDER_SLOT_ID';

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initialized.current) return;
    
    // Don't initialize AdSense if we are showing the placeholder
    if (isDev) return;

    try {
      // Check if AdSense script is loaded globally
      if (typeof window !== 'undefined') {
         // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        initialized.current = true;
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, [isDev]);

  return (
    <div className={`flex flex-col items-center justify-center my-4 overflow-hidden ${className}`}>
      {label && <span className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">{label}</span>}
      
      {isDev ? (
        // Development Placeholder
        <div className="w-full h-32 bg-slate-800/50 border border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 text-xs text-center p-4">
          Google Ad<br/>(Slot: {slotId})
        </div>
      ) : (
        // Actual AdSense Code
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // REPLACE WITH YOUR PUBLISHER ID
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
          data-ad-layout-key={layoutKey}
        />
      )}
    </div>
  );
};