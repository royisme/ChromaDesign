import { GoogleGenAI, Type } from "@google/genai";
import { GenerationResult, ColorToken } from "../types";
import { calculateDarkVariant } from "../utils/colorUtils";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
`;

/**
 * Reads a File and returns both the base64 data and the detected mime type.
 * This is safer than relying on file.type which might be wrong or manually set.
 */
const fileToGenerativePart = async (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Format is "data:image/jpeg;base64,..."
      const matches = base64String.match(/^data:(.+);base64,(.+)$/);
      
      if (matches && matches.length === 3) {
        resolve({
          mimeType: matches[1],
          data: matches[2]
        });
      } else {
        // Fallback if regex fails (unlikely for readAsDataURL)
        const rawBase64 = base64String.split(',')[1];
        resolve({
          mimeType: file.type || 'image/jpeg',
          data: rawBase64
        });
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateColorScheme = async (imageFile: File): Promise<GenerationResult> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const { data, mimeType } = await fileToGenerativePart(imageFile);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: data,
                mimeType: mimeType,
              },
            },
            {
              text: "Analyze this image and generate a UI color scheme.",
            },
          ],
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: {
              type: Type.STRING,
              description: "A one or two word description of the color palette's mood.",
            },
            // We ask for an object to ensure semantic roles are filled, then convert to array
            scheme: {
              type: Type.OBJECT,
              properties: {
                primary: {
                  type: Type.OBJECT,
                  properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                  required: ["name", "hex"],
                },
                secondary: {
                  type: Type.OBJECT,
                  properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                  required: ["name", "hex"],
                },
                accent: {
                  type: Type.OBJECT,
                  properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                  required: ["name", "hex"],
                },
                background: {
                  type: Type.OBJECT,
                  properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                  required: ["name", "hex"],
                },
                surface: {
                  type: Type.OBJECT,
                  properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                  required: ["name", "hex"],
                },
                text: {
                  type: Type.OBJECT,
                  properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                  required: ["name", "hex"],
                },
              },
              required: ["primary", "secondary", "accent", "background", "surface", "text"],
            },
          },
          required: ["mood", "scheme"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    const rawData = JSON.parse(response.text);
    
    // Convert the object structure to an ordered array for the frontend
    const orderedKeys = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'];
    const colors: ColorToken[] = orderedKeys.map((key) => {
      const hex = rawData.scheme[key].hex;
      return {
        id: crypto.randomUUID(),
        role: key,
        name: rawData.scheme[key].name,
        hex: hex,
        darkHex: calculateDarkVariant(hex, key) // Automatically generate dark variant
      };
    });

    return {
      mood: rawData.mood,
      colors: colors
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Edits an image based on a text prompt using Gemini 2.5 Flash Image.
 * Returns a File object containing the edited image.
 */
export const editImage = async (imageFile: File, prompt: string): Promise<File> => {
  if (!API_KEY) {
    throw new Error("API Key is missing.");
  }

  const { data, mimeType } = await fileToGenerativePart(imageFile);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: data,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        }
      ],
    });

    // Iterate through parts to find the image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Response = part.inlineData.data;
        const responseMimeType = part.inlineData.mimeType || 'image/png';
        
        // Convert Base64 back to a Blob/File
        const byteCharacters = atob(base64Response);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: responseMimeType });
        
        return new File([blob], `edited-${Date.now()}.png`, { type: responseMimeType });
      }
    }

    throw new Error("No image data returned from the model.");

  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};