/**
 * Color token representing a semantic color role
 */
export interface ColorToken {
  id: string // Unique identifier for React keys and operations
  name: string // Human readable name (e.g., "Midnight Blue")
  hex: string // The hex code for Light Mode
  darkHex: string // The hex code for Dark Mode
  role?: string // Original semantic role (e.g., "primary", "background")
}

/**
 * Result from AI color generation
 */
export interface GenerationResult {
  colors: ColorToken[]
  mood: string
}

/**
 * Export format options
 */
export enum ExportFormat {
  TAILWIND = 'TAILWIND',
  CSS_VARS = 'CSS_VARS',
  JSON = 'JSON',
}

/**
 * Request payload for color generation
 */
export interface GenerateColorRequest {
  imageBase64: string
  mimeType: string
}

/**
 * Request payload for image editing (Premium feature)
 */
export interface EditImageRequest {
  imageBase64: string
  mimeType: string
  prompt: string
}

/**
 * Response from image editing
 */
export interface EditImageResponse {
  imageBase64: string
  mimeType: string
}
