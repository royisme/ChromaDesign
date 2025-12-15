/**
 * Cloudflare Turnstile Client
 * 
 * Server-side verification for Turnstile tokens
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

import { env } from 'cloudflare:workers'

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export interface TurnstileVerifyResult {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
  action?: string
  cdata?: string
}

/**
 * Verify a Turnstile token
 * @param token - The token from the client-side Turnstile widget
 * @param remoteip - Optional: The user's IP address
 * @returns Verification result
 */
export async function verifyTurnstileToken(
  token: string,
  remoteip?: string
): Promise<TurnstileVerifyResult> {
  const secretKey = env.TURNSTILE_SECERT_KEY
  
  if (!secretKey) {
    console.error('TURNSTILE_SECERT_KEY is not configured')
    // In development, we might want to skip validation
    if (env.ENVIRONMENT === 'development') {
      console.warn('Skipping Turnstile validation in development mode')
      return { success: true }
    }
    return { success: false, 'error-codes': ['missing-secret-key'] }
  }

  const formData = new FormData()
  formData.append('secret', secretKey)
  formData.append('response', token)
  if (remoteip) {
    formData.append('remoteip', remoteip)
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json() as TurnstileVerifyResult
    return result
  } catch (error) {
    console.error('Turnstile verification failed:', error)
    return { success: false, 'error-codes': ['verification-failed'] }
  }
}

/**
 * Quick check if Turnstile token is valid
 * Throws an error if invalid
 */
export async function requireValidTurnstile(token: string | undefined): Promise<void> {
  if (!token) {
    throw new Error('Turnstile token is required')
  }

  const result = await verifyTurnstileToken(token)
  
  if (!result.success) {
    const errorCodes = result['error-codes']?.join(', ') || 'unknown'
    throw new Error(`Turnstile validation failed: ${errorCodes}`)
  }
}
