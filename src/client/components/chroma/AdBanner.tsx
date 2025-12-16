import { useEffect, useRef, useState } from 'react'

interface AdBannerProps {
  slotId: string
  format?: 'auto' | 'fluid' | 'rectangle'
  layoutKey?: string
  className?: string
  label?: string
}

export function AdBanner({
  slotId,
  format = 'auto',
  layoutKey,
  className = '',
  label = 'Advertisement',
}: AdBannerProps) {
  const [mounted, setMounted] = useState(false)
  const initialized = useRef(false)
  const isDev = slotId === 'PLACEHOLDER_SLOT_ID'

  const adsenseClientId =
    import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX'

  // Detect client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load AdSense script and initialize ad
  useEffect(() => {
    if (!mounted || initialized.current || isDev) return

    const loadAndInitAd = () => {
      try {
        // @ts-expect-error AdSense global
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        initialized.current = true
      } catch (err) {
        console.error('AdSense error:', err)
      }
    }

    // Check if AdSense script already loaded
    const existingScript = document.querySelector(
      'script[src*="adsbygoogle.js"]'
    )

    if (!existingScript) {
      const script = document.createElement('script')
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`
      script.async = true
      script.crossOrigin = 'anonymous'
      script.onload = loadAndInitAd
      script.onerror = () => console.error('Failed to load AdSense script')
      document.head.appendChild(script)
    } else {
      // Script already exists, just init the ad
      loadAndInitAd()
    }
  }, [mounted, isDev, adsenseClientId])

  // Return placeholder during SSR
  if (!mounted) {
    return (
      <div
        suppressHydrationWarning
        className={`flex flex-col items-center justify-center my-4 overflow-hidden ${className}`}
      >
        {label && (
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">
            {label}
          </span>
        )}
        <div className="w-full min-h-[100px]" />
      </div>
    )
  }

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col items-center justify-center my-4 overflow-hidden ${className}`}
    >
      {label && (
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">
          {label}
        </span>
      )}

      {isDev ? (
        <div className="w-full h-32 bg-zinc-800/50 border border-dashed border-zinc-700 rounded-lg flex items-center justify-center text-zinc-500 text-xs text-center p-4">
          Google Ad
          <br />
          (Slot: {slotId})
        </div>
      ) : (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={adsenseClientId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
          data-ad-layout-key={layoutKey}
        />
      )}
    </div>
  )
}