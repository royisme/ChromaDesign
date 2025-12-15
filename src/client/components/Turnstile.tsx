/**
 * Cloudflare Turnstile Component
 *
 * A React component for Cloudflare Turnstile CAPTCHA verification.
 * https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
 */

import { useEffect, useRef, useCallback, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: TurnstileOptions
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
      getResponse: (widgetId: string) => string | undefined
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileOptions {
  sitekey: string
  callback?: (token: string) => void
  'error-callback'?: () => void
  'expired-callback'?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact' | 'invisible'
  appearance?: 'always' | 'execute' | 'interaction-only'
  'refresh-expired'?: 'auto' | 'manual' | 'never'
  retry?: 'auto' | 'never'
  'retry-interval'?: number
}

export interface TurnstileProps {
  siteKey: string
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact' | 'invisible'
  className?: string
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script'
const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad'

export function Turnstile({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = 'dark',
  size = 'normal',
  className,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Only run on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const renderWidget = useCallback(() => {
    if (typeof window === 'undefined') return
    if (!containerRef.current || !window.turnstile) return

    // Clean up existing widget
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch {
        // Ignore errors during cleanup
      }
    }

    // Render new widget
    // Note: Using retry: 'never' to avoid infinite retry loops on Workers subdomains
    // that don't support /cdn-cgi/ paths (PAT challenge)
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'error-callback': onError,
      'expired-callback': onExpire,
      'refresh-expired': 'auto',
      retry: 'never',
      theme,
      size,
    })
  }, [siteKey, onVerify, onError, onExpire, theme, size])

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined' || !isMounted) return

    // Check if script is already loaded
    if (window.turnstile) {
      renderWidget()
      return
    }

    // Check if script is loading
    if (document.getElementById(TURNSTILE_SCRIPT_ID)) {
      window.onTurnstileLoad = renderWidget
      return
    }

    // Load script
    const script = document.createElement('script')
    script.id = TURNSTILE_SCRIPT_ID
    script.src = TURNSTILE_SCRIPT_URL
    script.async = true
    script.defer = true

    window.onTurnstileLoad = renderWidget

    document.head.appendChild(script)

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Ignore errors during cleanup
        }
      }
    }
  }, [renderWidget, isMounted])

  // Don't render anything on server side
  if (!isMounted) {
    return <div className={className} />
  }

  return <div ref={containerRef} className={className} />
}

/**
 * Hook to manage Turnstile token state
 */
export function useTurnstile(siteKey: string | undefined) {
  const tokenRef = useRef<string | null>(null)

  const setToken = useCallback((token: string) => {
    tokenRef.current = token
  }, [])

  const clearToken = useCallback(() => {
    tokenRef.current = null
  }, [])

  const getToken = useCallback(() => {
    return tokenRef.current
  }, [])

  return {
    siteKey,
    token: tokenRef.current,
    setToken,
    clearToken,
    getToken,
    isConfigured: !!siteKey,
  }
}
