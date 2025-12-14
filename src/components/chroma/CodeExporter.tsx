import { useState, useMemo } from 'react'
import type { ColorToken } from '~/types/chroma'
import { ExportFormat } from '~/types/chroma'
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { generateShades } from '~/utils/colorUtils'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Button } from '~/components/ui/button'

interface CodeExporterProps {
  colors: ColorToken[]
}

export function CodeExporter({ colors }: CodeExporterProps) {
  const [activeTab, setActiveTab] = useState<ExportFormat>(ExportFormat.TAILWIND)
  const [copied, setCopied] = useState(false)
  const [showShades, setShowShades] = useState(true)

  // Helper to sanitize names
  const toKebabCase = (str: string) =>
    str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  const toCamelCase = (str: string) => {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
  }

  // Memoize generated shades to avoid recalculation
  const extendedColors = useMemo(() => {
    return colors.map((c) => ({
      ...c,
      shades: generateShades(c.hex),
    }))
  }, [colors])

  // Updated for Tailwind v4 (@theme syntax)
  const generateTailwindV4Config = () => {
    const variables = extendedColors
      .map((c) => {
        const shadeVars = Object.entries(c.shades)
          .map(([k, v]) => `  --color-${toKebabCase(c.name)}-${k}: ${v};`)
          .join('\n')
        return `  /* ${c.name} (${c.role || 'Custom'}) */\n${shadeVars}`
      })
      .join('\n\n')

    return `/* main.css */
@import "tailwindcss";

@theme {
${variables}
}

/* 
  Usage Examples:
  bg-${toKebabCase(extendedColors[0]?.name || 'color')}-500
  text-${toKebabCase(extendedColors[0]?.name || 'color')}-900
*/`
  }

  const generateCSSVariables = () => {
    const vars = extendedColors
      .map((c) => {
        const base = `  /* ${c.name} */\n  --color-${toKebabCase(c.name)}: ${c.hex};`
        const shades = Object.entries(c.shades)
          .map(([k, v]) => `  --color-${toKebabCase(c.name)}-${k}: ${v};`)
          .join('\n')
        return `${base}\n${shades}`
      })
      .join('\n\n')

    return `/* global.css */
:root {
${vars}
}`
  }

  const generateJSON = () => {
    const obj = extendedColors.reduce(
      (acc, c) => {
        acc[toCamelCase(c.name)] = c.shades
        return acc
      },
      {} as Record<string, Record<number | string, string>>
    )
    return JSON.stringify(obj, null, 2)
  }

  const getCode = () => {
    switch (activeTab) {
      case ExportFormat.TAILWIND:
        return generateTailwindV4Config()
      case ExportFormat.CSS_VARS:
        return generateCSSVariables()
      case ExportFormat.JSON:
        return generateJSON()
      default:
        return ''
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* 1. Shades Preview Grid */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <button
          onClick={() => setShowShades(!showShades)}
          className="w-full px-6 py-4 flex items-center justify-between text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          <span>Generated Shades (50-950)</span>
          {showShades ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showShades && (
          <div className="overflow-x-auto p-6 bg-zinc-900/30">
            <div className="flex gap-6 min-w-max">
              {extendedColors.map((color) => (
                <div key={color.id} className="w-40 shrink-0 flex flex-col gap-1.5">
                  {/* Header */}
                  <div className="mb-2 pb-2 border-b border-zinc-800">
                    <div
                      className="font-bold text-zinc-200 text-sm truncate"
                      title={color.name}
                    >
                      {color.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                      {color.role}
                    </div>
                  </div>

                  {/* Shades Stack */}
                  <div className="flex flex-col rounded-lg overflow-hidden ring-1 ring-zinc-800 shadow-lg">
                    {Object.entries(color.shades).map(([shade, hex]) => (
                      <div
                        key={shade}
                        className="group relative flex items-center justify-between h-9 px-3"
                        style={{ backgroundColor: hex }}
                      >
                        <span
                          className={`relative z-10 text-[10px] font-mono font-medium ${
                            parseInt(shade) > 400 ? 'text-white/90' : 'text-zinc-900/90'
                          }`}
                        >
                          {shade}
                        </span>
                        <span
                          className={`relative z-10 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${
                            parseInt(shade) > 400 ? 'text-white' : 'text-zinc-900'
                          }`}
                        >
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Code Export Controls */}
      <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ExportFormat)}
          className="w-auto"
        >
          <TabsList className="bg-zinc-800/50 border border-zinc-700/50">
            <TabsTrigger
              value={ExportFormat.TAILWIND}
              className="data-[state=active]:bg-zinc-700"
            >
              Tailwind v4
            </TabsTrigger>
            <TabsTrigger
              value={ExportFormat.CSS_VARS}
              className="data-[state=active]:bg-zinc-700"
            >
              CSS
            </TabsTrigger>
            <TabsTrigger value={ExportFormat.JSON} className="data-[state=active]:bg-zinc-700">
              JSON
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={handleCopy} className="gap-2">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Copy Code'}</span>
        </Button>
      </div>

      {/* 3. Code View */}
      <div className="relative group bg-[#0d1117] min-h-[400px] flex-1 overflow-auto">
        <pre className="p-6 text-xs sm:text-sm font-mono leading-relaxed text-zinc-300">
          {getCode()}
        </pre>
      </div>
    </div>
  )
}
