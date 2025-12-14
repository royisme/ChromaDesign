import { useState } from 'react'
import type { ColorToken } from '~/types/chroma'
import { Trash2, Plus, Type, Code2, Pencil, LayoutTemplate } from 'lucide-react'
import { getContrastRatio, getWcagRating, getBestTextColor } from '~/utils/colorUtils'
import { Button } from '~/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { PreviewDashboard } from './PreviewDashboard'

interface PaletteDisplayProps {
  colors: ColorToken[]
  mood: string
  onUpdateColor: (id: string, updates: Partial<ColorToken>) => void
  onRemoveColor: (id: string) => void
  onAddColor: () => void
  onExport: () => void
}

export function PaletteDisplay({
  colors,
  mood,
  onUpdateColor,
  onRemoveColor,
  onAddColor,
  onExport,
}: PaletteDisplayProps) {
  const [contrastBaseline, setContrastBaseline] = useState<string>('auto')

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800 animate-in fade-in slide-in-from-bottom-8 duration-700 h-full">
      <Tabs defaultValue="editor" className="flex flex-col h-full">
        {/* Toolbar & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur shrink-0 gap-4 sm:gap-0">
          {/* Title & Tabs */}
          <div className="flex items-center gap-6">
            <TabsList className="bg-zinc-800/50 border border-zinc-700/50">
              <TabsTrigger value="editor" className="gap-2 data-[state=active]:bg-zinc-700">
                <Pencil className="w-3.5 h-3.5" />
                <span>Editor</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 data-[state=active]:bg-zinc-700">
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>

            {mood && (
              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                {mood}
              </span>
            )}
          </div>

          {/* Actions (Only show in Editor Mode) */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Contrast Controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Type className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none z-10" />
                <Select value={contrastBaseline} onValueChange={setContrastBaseline}>
                  <SelectTrigger className="pl-9 min-w-[140px] bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Contrast</SelectItem>
                    <SelectItem value="white">vs White</SelectItem>
                    <SelectItem value="black">vs Black</SelectItem>
                    {colors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        vs {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Export Button */}
            <Button variant="secondary" onClick={onExport} className="gap-2">
              <Code2 className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative bg-zinc-900">
          {/* EDITOR VIEW */}
          <TabsContent value="editor" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full flex flex-col divide-y divide-zinc-800/50 overflow-y-auto">
              {colors.map((token) => {
                // Contrast Calculation Logic
                const contrastHex =
                  contrastBaseline === 'auto'
                    ? getBestTextColor(token.hex)
                    : contrastBaseline === 'white'
                      ? '#FFFFFF'
                      : contrastBaseline === 'black'
                        ? '#000000'
                        : colors.find((c) => c.id === contrastBaseline)?.hex || '#000000'

                const ratio = getContrastRatio(token.hex, contrastHex)
                const rating = getWcagRating(ratio)

                return (
                  <div
                    key={token.id}
                    className="flex flex-col md:flex-row min-h-[120px] md:min-h-[100px] group relative shrink-0 hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Color Blocks Area (Light & Dark) */}
                    <div className="relative flex w-full md:w-64 shrink-0 h-16 md:h-auto">
                      {/* Light Mode Color */}
                      <div className="relative flex-1 border-r border-zinc-800/50 group/light">
                        <div
                          className="absolute inset-0 transition-transform duration-300 z-0"
                          style={{ backgroundColor: token.hex }}
                        />
                        <input
                          type="color"
                          value={token.hex}
                          onChange={(e) => onUpdateColor(token.id, { hex: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          title="Change Light Mode Color"
                        />
                        <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/40 text-white px-1.5 rounded backdrop-blur-sm opacity-0 group-hover/light:opacity-100 transition-opacity pointer-events-none z-20">
                          Light
                        </span>
                      </div>

                      {/* Dark Mode Color */}
                      <div className="relative flex-1 border-r border-zinc-800/50 group/dark">
                        <div
                          className="absolute inset-0 transition-transform duration-300 z-0"
                          style={{ backgroundColor: token.darkHex || '#000' }}
                        />
                        <input
                          type="color"
                          value={token.darkHex || '#000000'}
                          onChange={(e) => onUpdateColor(token.id, { darkHex: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          title="Change Dark Mode Color"
                        />
                        <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/40 text-white px-1.5 rounded backdrop-blur-sm opacity-0 group-hover/dark:opacity-100 transition-opacity pointer-events-none z-20">
                          Dark
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveColor(token.id)}
                        className="absolute top-2 left-2 z-30 p-1.5 bg-black/20 hover:bg-red-500 text-white/70 hover:text-white rounded-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Remove color"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Info Area (Right Side) */}
                    <div className="flex-1 flex flex-col justify-center px-4 py-3 md:px-6 md:py-4 z-10 relative">
                      {/* Top Row: Name and Role */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 mr-4">
                          <input
                            type="text"
                            value={token.name}
                            onChange={(e) => onUpdateColor(token.id, { name: e.target.value })}
                            className="w-full bg-transparent text-zinc-100 font-bold text-base md:text-lg focus:outline-none focus:text-white border-b border-transparent focus:border-primary transition-all truncate placeholder-zinc-600"
                            placeholder="Color Name"
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium bg-zinc-800/80 px-2 py-1 rounded-md border border-zinc-700/50 uppercase tracking-wider shrink-0">
                          {token.role || 'Custom'}
                        </span>
                      </div>

                      {/* Middle Row: Hex Codes (Editable Text) */}
                      <div className="flex gap-4 mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-600 uppercase">Light Hex</span>
                          <input
                            type="text"
                            value={token.hex}
                            onChange={(e) => onUpdateColor(token.id, { hex: e.target.value })}
                            className="bg-transparent text-zinc-400 font-mono text-xs focus:outline-none focus:text-primary uppercase tracking-widest w-20"
                          />
                        </div>
                        <div className="flex flex-col border-l border-zinc-800 pl-4">
                          <span className="text-[10px] text-zinc-600 uppercase">Dark Hex</span>
                          <input
                            type="text"
                            value={token.darkHex || ''}
                            onChange={(e) => onUpdateColor(token.id, { darkHex: e.target.value })}
                            className="bg-transparent text-zinc-400 font-mono text-xs focus:outline-none focus:text-primary uppercase tracking-widest w-20"
                            placeholder="N/A"
                          />
                        </div>
                      </div>

                      {/* Bottom Row: Accessibility Badge */}
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-help">
                          <div
                            className={`flex items-center gap-2 px-2 py-1 rounded-md border ${
                              rating.pass
                                ? 'bg-emerald-500/10 border-emerald-500/20'
                                : 'bg-red-500/10 border-red-500/20'
                            }`}
                          >
                            <span
                              className={`text-xs font-bold ${
                                rating.pass ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {rating.score}
                            </span>
                            <div
                              className={`h-3 w-px ${
                                rating.pass ? 'bg-emerald-500/20' : 'bg-red-500/20'
                              }`}
                            />
                            <span className="text-xs text-zinc-400 font-mono">
                              {ratio.toFixed(2)}:1
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Add Color Button */}
              <button
                onClick={onAddColor}
                className="h-16 shrink-0 flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 hover:text-primary transition-all border-t border-zinc-800/50 group"
                title="Add new color"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg group-hover:bg-zinc-700/50 transition-colors">
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Add Color</span>
                </div>
              </button>
            </div>
          </TabsContent>

          {/* PREVIEW VIEW */}
          <TabsContent value="preview" className="h-full m-0 p-4 md:p-6 data-[state=inactive]:hidden">
            <PreviewDashboard colors={colors} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
