/**
 * Utility functions for color manipulation and shade generation.
 * Simulates Tailwind's color palette generation logic.
 */

// Parse hex to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

// Convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

// RGB to HSL
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s: number
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return [h * 360, s * 100, l * 100]
}

// HSL to RGB helper (internal)
const hue2rgb = (p: number, q: number, t: number) => {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

// HSL to Hex
const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360
  s /= 100
  l /= 100
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return rgbToHex(r * 255, g * 255, b * 255)
}

// Mix color with white (tint) or black (shade)
// weight: 0-1 (0 = original, 1 = target)
const mix = (
  color: [number, number, number],
  target: [number, number, number],
  weight: number
): [number, number, number] => {
  return [
    Math.round(color[0] + (target[0] - color[0]) * weight),
    Math.round(color[1] + (target[1] - color[1]) * weight),
    Math.round(color[2] + (target[2] - color[2]) * weight),
  ]
}

/**
 * Generate Tailwind-like shade scale (50-950) from a base color
 */
export const generateShades = (baseHex: string): Record<number | string, string> => {
  const rgb = hexToRgb(baseHex)
  const white: [number, number, number] = [255, 255, 255]
  const black: [number, number, number] = [15, 23, 42] // Slate-900ish black for richer darks

  // Tailwind-like scale logic
  return {
    50: rgbToHex(...mix(rgb, white, 0.95)),
    100: rgbToHex(...mix(rgb, white, 0.9)),
    200: rgbToHex(...mix(rgb, white, 0.75)),
    300: rgbToHex(...mix(rgb, white, 0.6)),
    400: rgbToHex(...mix(rgb, white, 0.3)),
    500: baseHex, // Base color
    600: rgbToHex(...mix(rgb, black, 0.2)),
    700: rgbToHex(...mix(rgb, black, 0.4)),
    800: rgbToHex(...mix(rgb, black, 0.6)),
    900: rgbToHex(...mix(rgb, black, 0.8)),
    950: rgbToHex(...mix(rgb, black, 0.9)),
  }
}

/**
 * Intelligent Dark Mode Generator
 * Creates a dark variant based on the semantic role and HSL properties.
 */
export const calculateDarkVariant = (hex: string, role?: string): string => {
  const rgb = hexToRgb(hex)
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2])

  const roleKey = role?.toLowerCase() || ''

  if (roleKey.includes('background') || roleKey.includes('bg')) {
    // For backgrounds: Invert lightness but keep it very dark (Slate-like tint)
    // Map Light (100) -> Dark (10-15)
    return hslToHex(222, 47, 11) // Standard Slate-950 base
  }

  if (roleKey.includes('surface') || roleKey.includes('container') || roleKey.includes('card')) {
    // Surface: Slightly lighter than background
    return hslToHex(222, 47, 16) // Standard Slate-900 base
  }

  if (roleKey.includes('text') || roleKey.includes('content') || roleKey.includes('foreground')) {
    // Text: If original is dark, make it light.
    if (l < 50) return '#f8fafc' // Slate-50
    return hex // Already light? Keep it.
  }

  // Brand/Accents (Primary, Secondary, Accent)
  // Usually we need to lighten them slightly to make them pop against dark backgrounds,
  // or desaturate them to reduce eye strain.
  if (l < 40) {
    // If it's a dark color (e.g., Navy Blue), lighten it significantly for dark mode
    return hslToHex(h, s * 0.9, 60)
  } else if (l > 70) {
    // If it's very pastel, it might be fine, or darken slightly
    return hex
  } else {
    // Mid-tones: Lighten slightly
    return hslToHex(h, s, Math.min(l + 10, 85))
  }
}

// --- Accessibility & Contrast Utils ---

// Calculate relative luminance
// https://www.w3.org/TR/WCAG20/#relativeluminancedef
const getLuminance = (r: number, g: number, b: number) => {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
export const getContrastRatio = (hex1: string, hex2: string): number => {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  const l1 = getLuminance(...rgb1)
  const l2 = getLuminance(...rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Get WCAG accessibility rating for a contrast ratio
 */
export const getWcagRating = (
  ratio: number
): { score: string; label: string; pass: boolean } => {
  if (ratio >= 7) return { score: 'AAA', label: 'Excellent', pass: true }
  if (ratio >= 4.5) return { score: 'AA', label: 'Pass', pass: true }
  if (ratio >= 3) return { score: 'AA+', label: 'Large Text', pass: true }
  return { score: 'Fail', label: 'Low Contrast', pass: false }
}

/**
 * Get best text color (black or white) for a given background
 */
export const getBestTextColor = (bgHex: string): string => {
  const whiteContrast = getContrastRatio(bgHex, '#FFFFFF')
  const blackContrast = getContrastRatio(bgHex, '#000000')
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000'
}
