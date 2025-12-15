/**
 * AI Color Scheme Generation Tests
 *
 * Tests the AI color scheme generation using free OpenRouter models.
 * Injects environment variables from .dev.vars for testing.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { z } from 'zod'

// Load .dev.vars environment variables
function loadDevVars(): Record<string, string> {
  try {
    const devVarsPath = resolve(__dirname, '../.dev.vars')
    const content = readFileSync(devVarsPath, 'utf-8')
    const vars: Record<string, string> = {}

    content.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          vars[key.trim()] = valueParts.join('=').trim()
        }
      }
    })

    return vars
  } catch {
    return {}
  }
}

// Color scheme response schema (matching the server validation)
const colorSchemeResponseSchema = z.object({
  mood: z.string(),
  scheme: z.object({
    primary: z.object({
      name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
    secondary: z.object({
      name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
    accent: z.object({
      name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
    background: z.object({
      name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
    surface: z.object({
      name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
    text: z.object({
      name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
  }),
})

// System prompt for color scheme generation
const COLOR_SCHEME_SYSTEM_PROMPT = `
You are an expert UI/UX Designer and Color Theory specialist.
Your task is to analyze an image and extract a cohesive, accessible, and aesthetic color scheme for a web application.
Do not just pick the most frequent colors. Instead, pick colors that work well together functionally.

Return the result as a list of semantic color roles, but ensure each color has a creative name (e.g. instead of "Dark Grey", use "Mine Shaft").

Roles to generate:
- Primary
- Secondary
- Accent
- Background
- Surface
- Text

Response format (JSON):
{
  "mood": "A one or two word description of the color palette's mood",
  "scheme": {
    "primary": { "name": "Creative Color Name", "hex": "#RRGGBB" },
    "secondary": { "name": "Creative Color Name", "hex": "#RRGGBB" },
    "accent": { "name": "Creative Color Name", "hex": "#RRGGBB" },
    "background": { "name": "Creative Color Name", "hex": "#RRGGBB" },
    "surface": { "name": "Creative Color Name", "hex": "#RRGGBB" },
    "text": { "name": "Creative Color Name", "hex": "#RRGGBB" }
  }
}
`

// Free models for testing
const FREE_MODELS = [
  'mistralai/devstral-small:free',
  'z-ai/glm-4.5-air:free',
] as const

// Test configuration
interface TestConfig {
  apiKey: string
  baseUrl: string
}

let testConfig: TestConfig

beforeAll(() => {
  const devVars = loadDevVars()
  const apiKey = process.env.AI_API_KEY || devVars.AI_API_KEY

  if (!apiKey) {
    console.warn(
      'AI_API_KEY not found in environment or .dev.vars. Tests will be skipped.'
    )
  }

  testConfig = {
    apiKey: apiKey || '',
    baseUrl: 'https://openrouter.ai/api/v1',
  }
})

// Helper to create OpenAI client for OpenRouter
function createOpenRouterClient(): OpenAI {
  return new OpenAI({
    apiKey: testConfig.apiKey,
    baseURL: testConfig.baseUrl,
  })
}

// Helper to load test image as base64
function loadTestImage(): { base64: string; mimeType: string } {
  const imagePath = resolve(
    __dirname,
    '../public/assets/example/james-wheeler-XuAxyq0uRT0-unsplash.jpg'
  )
  const imageBuffer = readFileSync(imagePath)
  return {
    base64: imageBuffer.toString('base64'),
    mimeType: 'image/jpeg',
  }
}

describe('AI Color Scheme Generation', () => {
  describe.skipIf(!testConfig?.apiKey)('OpenRouter API Tests', () => {
    it('should connect to OpenRouter API', async () => {
      const client = createOpenRouterClient()

      // Simple connectivity test - list models
      const response = await client.models.list()
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data)).toBe(true)
    })

    describe.each(FREE_MODELS)('Model: %s', (model) => {
      it('should generate a valid color scheme response', async () => {
        const client = createOpenRouterClient()
        const testImage = loadTestImage()

        const response = await client.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: COLOR_SCHEME_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and generate a UI color scheme.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${testImage.mimeType};base64,${testImage.base64}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1000,
          temperature: 0.7,
        })

        // Verify response structure
        expect(response.choices).toBeDefined()
        expect(response.choices.length).toBeGreaterThan(0)

        const content = response.choices[0]?.message?.content
        expect(content).toBeDefined()
        expect(typeof content).toBe('string')

        // Parse and validate JSON
        const parsed = JSON.parse(content!)
        const validated = colorSchemeResponseSchema.safeParse(parsed)

        if (!validated.success) {
          console.error('Validation errors:', validated.error.issues)
          console.error('Received response:', parsed)
        }

        expect(validated.success).toBe(true)

        if (validated.success) {
          // Verify mood
          expect(validated.data.mood).toBeTruthy()
          expect(validated.data.mood.length).toBeLessThan(50)

          // Verify all color roles exist
          const { scheme } = validated.data
          expect(scheme.primary.hex).toMatch(/^#[0-9A-Fa-f]{6}$/)
          expect(scheme.secondary.hex).toMatch(/^#[0-9A-Fa-f]{6}$/)
          expect(scheme.accent.hex).toMatch(/^#[0-9A-Fa-f]{6}$/)
          expect(scheme.background.hex).toMatch(/^#[0-9A-Fa-f]{6}$/)
          expect(scheme.surface.hex).toMatch(/^#[0-9A-Fa-f]{6}$/)
          expect(scheme.text.hex).toMatch(/^#[0-9A-Fa-f]{6}$/)

          // Log the generated scheme for review
          console.log(`\n[${model}] Generated Color Scheme:`)
          console.log(`  Mood: ${validated.data.mood}`)
          Object.entries(scheme).forEach(([role, color]) => {
            console.log(`  ${role}: ${color.name} (${color.hex})`)
          })
        }
      }, 60000) // 60s timeout for AI API calls

      it('should handle text-only prompts', async () => {
        const client = createOpenRouterClient()

        const response = await client.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: COLOR_SCHEME_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content:
                'Generate a UI color scheme for a modern fintech banking app with a professional and trustworthy feel.',
            },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1000,
          temperature: 0.7,
        })

        expect(response.choices).toBeDefined()
        expect(response.choices.length).toBeGreaterThan(0)

        const content = response.choices[0]?.message?.content
        expect(content).toBeDefined()

        const parsed = JSON.parse(content!)
        const validated = colorSchemeResponseSchema.safeParse(parsed)

        expect(validated.success).toBe(true)

        if (validated.success) {
          console.log(`\n[${model}] Fintech Color Scheme:`)
          console.log(`  Mood: ${validated.data.mood}`)
        }
      }, 60000)
    })
  })

  describe('Schema Validation', () => {
    it('should validate correct color scheme format', () => {
      const validResponse = {
        mood: 'Serene',
        scheme: {
          primary: { name: 'Ocean Blue', hex: '#1E90FF' },
          secondary: { name: 'Soft Gray', hex: '#A9A9A9' },
          accent: { name: 'Coral Sunset', hex: '#FF7F50' },
          background: { name: 'Snow White', hex: '#FFFAFA' },
          surface: { name: 'Cloud Whisper', hex: '#F5F5F5' },
          text: { name: 'Charcoal', hex: '#36454F' },
        },
      }

      const result = colorSchemeResponseSchema.safeParse(validResponse)
      expect(result.success).toBe(true)
    })

    it('should reject invalid hex colors', () => {
      const invalidResponse = {
        mood: 'Broken',
        scheme: {
          primary: { name: 'Bad Color', hex: '#GGG' },
          secondary: { name: 'Soft Gray', hex: '#A9A9A9' },
          accent: { name: 'Coral Sunset', hex: '#FF7F50' },
          background: { name: 'Snow White', hex: '#FFFAFA' },
          surface: { name: 'Cloud Whisper', hex: '#F5F5F5' },
          text: { name: 'Charcoal', hex: '#36454F' },
        },
      }

      const result = colorSchemeResponseSchema.safeParse(invalidResponse)
      expect(result.success).toBe(false)
    })

    it('should reject missing color roles', () => {
      const incompleteResponse = {
        mood: 'Incomplete',
        scheme: {
          primary: { name: 'Ocean Blue', hex: '#1E90FF' },
          // Missing other required roles
        },
      }

      const result = colorSchemeResponseSchema.safeParse(incompleteResponse)
      expect(result.success).toBe(false)
    })
  })
})
