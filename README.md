# ChromaGen AI

AI-powered color palette generator that extracts semantic, accessible color tokens from images for Tailwind CSS.

## Features

- **AI Vision Analysis** - Uses Google Gemini 2.5 to analyze images and extract meaningful colors
- **Semantic Mapping** - Automatically assigns roles (Surface, Primary, Accent) based on visual hierarchy
- **Accessible Colors** - Generates WCAG-compliant color scales with proper contrast ratios
- **Live Preview** - Visualize your palette on a professional dashboard interface in real-time
- **Export Ready** - Copy-paste ready code for Tailwind v4 (`@theme` variables) and CSS Custom Properties
- **Preset Themes** - Curated photo presets to jumpstart your design

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 + SSR) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| AI | [Google Gemini 2.5 Flash](https://ai.google.dev/) |
| Deployment | [Cloudflare Workers](https://workers.cloudflare.com/) |
| Package Manager | [Bun](https://bun.sh/) |

## Project Structure

```
src/
├── components/
│   ├── chroma/                 # Business components
│   │   ├── AdBanner.tsx        # Google AdSense integration
│   │   ├── CodeExporter.tsx    # Tailwind/CSS code export
│   │   ├── ImageUploader.tsx   # Drag & drop image upload
│   │   ├── PaletteDisplay.tsx  # Color palette visualization
│   │   ├── PreviewDashboard.tsx # Live theme preview
│   │   └── ThemeGallery.tsx    # Preset theme gallery
│   └── ui/                     # shadcn/ui components
├── lib/
│   └── utils.ts                # Utility functions (cn)
├── routes/
│   ├── __root.tsx              # Root layout
│   ├── index.tsx               # Landing page (/)
│   └── app.tsx                 # Main app (/app)
├── services/
│   └── gemini.ts               # Gemini AI server functions
├── styles/
│   └── app.css                 # Global styles + Tailwind
├── types/
│   └── chroma.ts               # TypeScript type definitions
└── utils/
    ├── colorUtils.ts           # Color manipulation utilities
    └── seo.ts                  # SEO meta tags helper
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- [Google Gemini API Key](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ChromaDesign

# Install dependencies
bun install
```

### Environment Setup

Create a `.dev.vars` file for local development:

```bash
# .dev.vars (for local Cloudflare Workers development)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Development

```bash
# Start development server
bun run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

## Deployment

### Cloudflare Workers

1. **Set up secrets**

```bash
# Add your Gemini API key as a secret
wrangler secret put GEMINI_API_KEY
```

2. **Deploy**

```bash
# Deploy to Cloudflare Workers
wrangler deploy
```

### Configuration

The `wrangler.jsonc` file contains Cloudflare Workers configuration:

```jsonc
{
  "name": "chromagen",
  "compatibility_date": "2025-04-01",
  "main": "./dist/server/server.js",
  "assets": {
    "directory": "./dist/client",
    "binding": "ASSETS"
  }
}
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with features overview and preset themes |
| `/app` | Main application - upload images and generate palettes |

## API

### Server Functions

The app uses TanStack Start server functions to securely call the Gemini API:

- `generateColorScheme(imageBase64)` - Analyzes an image and returns semantic color tokens
- `editImage(imageBase64, prompt)` - AI image editing (reserved for future features)

## License

MIT
