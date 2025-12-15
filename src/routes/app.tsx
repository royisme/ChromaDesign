import { useState, useCallback, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Palette, Wand2, ChevronLeft } from 'lucide-react'
import { ImageUploader } from '~/components/chroma/ImageUploader'
import { PaletteDisplay } from '~/components/chroma/PaletteDisplay'
import { CodeExporter } from '~/components/chroma/CodeExporter'
import { ThemeGallery } from '~/components/chroma/ThemeGallery'
import { AdBanner } from '~/components/chroma/AdBanner'
import { UsageLimitModal } from '~/components/chroma/UsageLimitModal'
import { UsageIndicator } from '~/components/chroma/UsageIndicator'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { generateColorScheme } from '~/services/gemini'
import { useUsageLimit } from '~/hooks/useUsageLimit'
import type { ColorToken } from '~/types/chroma'
import { calculateDarkVariant } from '~/utils/colorUtils'
import { seo } from '~/utils/seo'

export const Route = createFileRoute('/app')({
  head: () => ({
    meta: seo({
      title: 'Generator - ChromaGen AI',
      description: 'Generate AI-powered color palettes from your images.',
    }),
  }),
  component: GeneratorApp,
})

/**
 * Convert File to base64 string
 */
async function fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      const matches = base64String.match(/^data:(.+);base64,(.+)$/)

      if (matches && matches.length === 3) {
        resolve({
          mimeType: matches[1],
          data: matches[2],
        })
      } else {
        const rawBase64 = base64String.split(',')[1]
        resolve({
          mimeType: file.type || 'image/jpeg',
          data: rawBase64,
        })
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function GeneratorApp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false)
  const [colors, setColors] = useState<ColorToken[]>([])
  const [mood, setMood] = useState<string>('')

  // UI State
  const [showExportModal, setShowExportModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Usage Limit State
  const { 
    status, 
    hasRemaining, 
    canUseBonus, 
    consume, 
    claimBonus, 
    isLoading: isUsageLoading 
  } = useUsageLimit()
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [isClaimingBonus, setIsClaimingBonus] = useState(false)

  const handleImageSelect = useCallback((file: File) => {
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setColors([])
    setMood('')
    setError(null)
  }, [])

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setColors([])
    setMood('')
    setError(null)
  }, [previewUrl])

  const handleGenerate = async (fileToProcess?: File) => {
    const file = fileToProcess || selectedFile
    if (!file) return

    // 检查额度
    if (!hasRemaining) {
      setShowLimitModal(true)
      return
    }

    // 先消耗额度
    const canProceed = await consume()
    if (!canProceed) {
      setShowLimitModal(true)
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const { data: imageBase64, mimeType } = await fileToBase64(file)
      const result = await generateColorScheme({ data: { imageBase64, mimeType } })
      setColors(result.colors)
      setMood(result.mood)
    } catch (err: unknown) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Failed to generate color scheme. Please try again.'
      setError(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGallerySelect = async (file: File) => {
    handleImageSelect(file)
    await new Promise((r) => setTimeout(r, 100))
    await handleGenerate(file)
  }

  const handleClaimBonus = async () => {
    setIsClaimingBonus(true)
    const result = await claimBonus()
    setIsClaimingBonus(false)
    return result
  }

  const handleUpdateColor = (id: string, updates: Partial<ColorToken>) => {
    setColors((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const handleRemoveColor = (id: string) => {
    setColors((prev) => prev.filter((c) => c.id !== id))
  }

  const handleAddColor = () => {
    const defaultHex = '#71717a' // Zinc-500
    const newColor: ColorToken = {
      id: crypto.randomUUID(),
      name: 'New Color',
      hex: defaultHex,
      darkHex: calculateDarkVariant(defaultHex, 'custom'),
      role: 'custom',
    }
    setColors((prev) => [...prev, newColor])
  }

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <div className="min-h-screen pb-20 px-4 md:px-6 pt-6 max-w-[1800px] mx-auto animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button asChild variant="ghost" className="mr-2 px-2 hover:bg-zinc-800 text-zinc-400">
            <Link to="/">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          {/* Logo Icon */}
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ChromaGen AI</h1>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)] min-h-[600px]">
        {/* Left Column: Input (3/12) */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-2">
          <section className="shrink-0">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Source
            </h2>
            <ImageUploader
              onImageSelected={handleImageSelect}
              selectedImage={previewUrl}
              onClear={handleClear}
            />
          </section>

          {selectedFile ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500 shrink-0">
              <Button
                onClick={() => handleGenerate()}
                disabled={isGenerating || isUsageLoading}
                className="w-full py-3 text-base"
              >
                {isGenerating ? (
                  'Generating...'
                ) : isUsageLoading ? (
                  'Loading...'
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Palette
                  </>
                )}
              </Button>
              
              {/* 使用状态指示器 */}
              {status && (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    今日可用
                  </div>
                  <UsageIndicator 
                    remaining={status.remaining} 
                    total={status.total} 
                  />
                </div>
              )}
            </div>
          ) : (
            <section className="shrink-0 animate-in fade-in duration-700 delay-150">
              <ThemeGallery onSelect={handleGallerySelect} isProcessing={isGenerating} />
            </section>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-xs animate-in fade-in shrink-0">
              {error}
            </div>
          )}

          {/* SIDEBAR AD PLACEMENT */}
          <div className="mt-auto pt-4 shrink-0">
            <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl overflow-hidden">
              <AdBanner
                slotId="PLACEHOLDER_SLOT_ID"
                format="rectangle"
                className="my-0 opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
            <p className="text-center text-[10px] text-zinc-600 mt-2">Sponsored</p>
          </div>
        </div>

        {/* Right Column: Results (9/12) */}
        <div className="md:col-span-8 lg:col-span-9 h-full flex flex-col gap-4 overflow-hidden">
          {colors.length > 0 ? (
            <section className="h-full min-h-0 flex flex-col">
              <PaletteDisplay
                colors={colors}
                mood={mood}
                onUpdateColor={handleUpdateColor}
                onRemoveColor={handleRemoveColor}
                onAddColor={handleAddColor}
                onExport={() => setShowExportModal(true)}
              />
            </section>
          ) : (
            <div className="h-full border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/20">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 opacity-80">
                <Palette className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="font-medium text-zinc-300">No palette generated yet</p>
              <p className="text-sm mt-2 opacity-60 max-w-xs text-center">
                Select a theme or upload an image to start.
              </p>
            </div>
          )}
        </div>
      </main>

      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b border-zinc-800">
            <DialogTitle>Export Color Palette</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-80px)]">
            <CodeExporter colors={colors} />
          </div>
        </DialogContent>
      </Dialog>

      {/* 额度用尽弹窗 */}
      <UsageLimitModal
        open={showLimitModal}
        onOpenChange={setShowLimitModal}
        status={status}
        canUseBonus={canUseBonus}
        onClaimBonus={handleClaimBonus}
        isClaimingBonus={isClaimingBonus}
      />
    </div>
  )
}
