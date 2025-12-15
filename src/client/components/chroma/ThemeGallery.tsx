import { useState } from 'react'
import { Loader2, Palette } from 'lucide-react'

interface ThemeGalleryProps {
  onSelect: (file: File) => void
  isProcessing: boolean
}

const THEMES = [
  {
    id: 'mountain',
    title: 'Alpine Peaks',
    url: '/assets/example/bogdan-pasca-HWV1XtnPAXw-unsplash.jpg',
    credit: 'Bogdan Pasca',
    colors: ['#e8f4f8', '#7ba3b8', '#3d6b7d', '#1a3a47'],
  },
  {
    id: 'sunset-lake',
    title: 'Golden Sunset',
    url: '/assets/example/james-wheeler-XuAxyq0uRT0-unsplash.jpg',
    credit: 'James Wheeler',
    colors: ['#fef3c7', '#f59e0b', '#dc2626', '#1e3a5f'],
  },
  {
    id: 'northern-lights',
    title: 'Aurora Dreams',
    url: '/assets/example/joel-vodell-TApAkERW5pQ-unsplash.jpg',
    credit: 'Joel Vodell',
    colors: ['#c4f1e9', '#34d399', '#6366f1', '#1e1b4b'],
  },
  {
    id: 'waterfall',
    title: 'Misty Falls',
    url: '/assets/example/luke-vodell-C7FXIG9DoaU-unsplash.jpg',
    credit: 'Luke Vodell',
    colors: ['#f0fdf4', '#86efac', '#22c55e', '#14532d'],
  },
  {
    id: 'architecture',
    title: 'Urban Lines',
    url: '/assets/example/nattu-adnan-vvHRdOwqHcg-unsplash.jpg',
    credit: 'Nattu Adnan',
    colors: ['#f8fafc', '#94a3b8', '#475569', '#0f172a'],
  },
  {
    id: 'neon-city',
    title: 'Neon Nights',
    url: '/assets/example/pang-yuhao-8z0UI6IDCHY-unsplash.jpg',
    credit: 'Pang Yuhao',
    colors: ['#fce7f3', '#ec4899', '#8b5cf6', '#1e1b4b'],
  },
]

export function ThemeGallery({ onSelect, isProcessing }: ThemeGalleryProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleSelect = async (id: string, url: string, title: string) => {
    if (isProcessing || loadingId) return

    try {
      setLoadingId(id)
      const response = await fetch(url)
      const blob = await response.blob()
      const mimeType = blob.type || 'image/jpeg'
      const file = new File([blob], `${title}.jpg`, { type: mimeType })
      onSelect(file)
    } catch (error) {
      console.error('Failed to load image', error)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3.5 h-3.5" />
          Preset Themes
        </h2>
        <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
          Curated Styles
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleSelect(theme.id, theme.url, theme.title)}
            disabled={isProcessing || !!loadingId}
            className="group relative flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all text-left h-full"
          >
            {/* Image Area */}
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={theme.url}
                alt={theme.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />

              {/* Loading State Overlay */}
              {loadingId === theme.id && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="p-3 flex flex-col gap-2 flex-1 w-full bg-zinc-900">
              <div>
                <span className="block text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                  {theme.title}
                </span>
                <span className="block text-[10px] text-zinc-500 truncate">by {theme.credit}</span>
              </div>

              {/* Color Preview Dots */}
              <div className="flex items-center gap-1.5 mt-auto pt-1">
                {theme.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-full ring-1 ring-white/10 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-transparent group-hover:ring-primary/30 transition-all" />
          </button>
        ))}
      </div>
    </div>
  )
}
