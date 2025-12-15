/**
 * Color Scheme Generation Service
 * 
 * Server function for generating color schemes from images using AI
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createAIClient, getDefaultModel } from '@/server/clients/ai'
import { requireValidTurnstile } from '@/server/clients/turnstile'
import { COLOR_SCHEME_SYSTEM_PROMPT, COLOR_SCHEME_USER_PROMPT } from '@/server/prompts/color-scheme'
import { calculateDarkVariant } from '@/utils/colorUtils'
import type { GenerateColorRequest, GenerationResult, ColorToken } from '@/types/chroma'

// Zod schema for validating AI responses
const colorSchemeResponseSchema = z.object({
  mood: z.string().describe("A one or two word description of the color palette's mood."),
  scheme: z.object({
    primary: z.object({
      name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
    }),
    secondary: z.object({
      name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
    }),
    accent: z.object({
      name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
    }),
    background: z.object({
      name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
    }),
    surface: z.object({
      name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
    }),
    text: z.object({
      name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
    }),
  }),
})

// Validator for color generation request
const generateColorValidator = (input: unknown): GenerateColorRequest => {
  const data = input as GenerateColorRequest
  if (!data.imageBase64 || !data.mimeType) {
    throw new Error('Invalid input: imageBase64 and mimeType are required')
  }
  return data
}

/**
 * Generate color scheme from an image using AI Gateway
 */
export const generateColorScheme = createServerFn({ method: 'POST' })
  .inputValidator(generateColorValidator)
  .handler(async ({ data }): Promise<GenerationResult> => {
    // Verify Turnstile token first
    await requireValidTurnstile(data.turnstileToken)
    
    const client = await createAIClient()
    const model = getDefaultModel()

    try {
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
                text: COLOR_SCHEME_USER_PROMPT,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${data.mimeType};base64,${data.imageBase64}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.7,
      })

      const choice = response.choices[0]
      if (!choice?.message?.content) {
        throw new Error('No content received from AI model.')
      }

      // Parse and validate the response
      let parsedResponse
      try {
        parsedResponse = JSON.parse(choice.message.content)
      } catch (parseError) {
        throw new Error('Failed to parse AI response as JSON.')
      }

      const validatedResponse = colorSchemeResponseSchema.parse(parsedResponse)

      // Convert the object structure to an ordered array for the frontend
      const orderedKeys = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'] as const
      const colors: ColorToken[] = orderedKeys.map((key) => {
        const colorData = validatedResponse.scheme[key]
        return {
          id: crypto.randomUUID(),
          role: key,
          name: colorData.name,
          hex: colorData.hex,
          darkHex: calculateDarkVariant(colorData.hex, key),
        }
      })

      return {
        mood: validatedResponse.mood,
        colors,
      }
    } catch (error) {
      console.error('AI Gateway Error:', error)
      throw error
    }
  })
