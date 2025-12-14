import { createServerFn } from '@tanstack/react-start'
import { GoogleGenAI, Type } from '@google/genai'
import type {
  GenerateColorRequest,
  GenerationResult,
  ColorToken,
  EditImageRequest,
  EditImageResponse,
} from '~/types/chroma'
import { calculateDarkVariant } from '~/utils/colorUtils'

const SYSTEM_INSTRUCTION = `
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
`

// Validator for color generation request
const generateColorValidator = (input: unknown): GenerateColorRequest => {
  const data = input as GenerateColorRequest
  if (!data.imageBase64 || !data.mimeType) {
    throw new Error('Invalid input: imageBase64 and mimeType are required')
  }
  return data
}

// Validator for image edit request
const editImageValidator = (input: unknown): EditImageRequest => {
  const data = input as EditImageRequest
  if (!data.imageBase64 || !data.mimeType || !data.prompt) {
    throw new Error('Invalid input: imageBase64, mimeType, and prompt are required')
  }
  return data
}

/**
 * Generate color scheme from an image using Gemini AI
 */
export const generateColorScheme = createServerFn({ method: 'POST' })
  .inputValidator(generateColorValidator)
  .handler(async ({ data }): Promise<GenerationResult> => {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please set it in .dev.vars (local) or via wrangler secret (production).')
    }

    const ai = new GoogleGenAI({ apiKey })

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: data.imageBase64,
                  mimeType: data.mimeType,
                },
              },
              {
                text: 'Analyze this image and generate a UI color scheme.',
              },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mood: {
                type: Type.STRING,
                description: "A one or two word description of the color palette's mood.",
              },
              scheme: {
                type: Type.OBJECT,
                properties: {
                  primary: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                    required: ['name', 'hex'],
                  },
                  secondary: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                    required: ['name', 'hex'],
                  },
                  accent: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                    required: ['name', 'hex'],
                  },
                  background: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                    required: ['name', 'hex'],
                  },
                  surface: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                    required: ['name', 'hex'],
                  },
                  text: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                    required: ['name', 'hex'],
                  },
                },
                required: ['primary', 'secondary', 'accent', 'background', 'surface', 'text'],
              },
            },
            required: ['mood', 'scheme'],
          },
        },
      })

      if (!response.text) {
        throw new Error('No response text received from Gemini.')
      }

      const rawData = JSON.parse(response.text)

      // Convert the object structure to an ordered array for the frontend
      const orderedKeys = ['primary', 'secondary', 'accent', 'background', 'surface', 'text']
      const colors: ColorToken[] = orderedKeys.map((key) => {
        const hex = rawData.scheme[key].hex
        return {
          id: crypto.randomUUID(),
          role: key,
          name: rawData.scheme[key].name,
          hex: hex,
          darkHex: calculateDarkVariant(hex, key),
        }
      })

      return {
        mood: rawData.mood,
        colors: colors,
      }
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw error
    }
  })

/**
 * Edit an image using Gemini AI (Premium feature - not exposed in UI yet)
 * TODO: Premium feature - image editing
 */
export const editImage = createServerFn({ method: 'POST' })
  .inputValidator(editImageValidator)
  .handler(async ({ data }): Promise<EditImageResponse> => {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.')
    }

    const ai = new GoogleGenAI({ apiKey })

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-05-20',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: data.imageBase64,
                  mimeType: data.mimeType,
                },
              },
              {
                text: data.prompt,
              },
            ],
          },
        ],
      })

      // Iterate through parts to find the image part
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return {
            imageBase64: part.inlineData.data || '',
            mimeType: part.inlineData.mimeType || 'image/png',
          }
        }
      }

      throw new Error('No image data returned from the model.')
    } catch (error) {
      console.error('Gemini Image Edit Error:', error)
      throw error
    }
  })
