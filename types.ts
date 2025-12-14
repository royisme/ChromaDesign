export interface ColorToken {
  id: string;       // Unique identifier for React keys and operations
  name: string;     // Human readable name (e.g., "Midnight Blue")
  hex: string;      // The hex code for Light Mode
  darkHex: string;  // The hex code for Dark Mode
  role?: string;    // Original semantic role (e.g., "primary", "background") - useful for default sorting
}

export interface GenerationResult {
  colors: ColorToken[];
  mood: string;
}

export enum ExportFormat {
  TAILWIND = 'TAILWIND',
  CSS_VARS = 'CSS_VARS',
  JSON = 'JSON'
}