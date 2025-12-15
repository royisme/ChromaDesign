import { useMemo } from 'react'
import type { ColorToken } from '~/types/chroma'
import { Signal, Wifi, Battery, Menu, Search, ShoppingBag, Heart, Home, User } from 'lucide-react'

interface PreviewMobileProps {
  colors: ColorToken[]
}

export function PreviewMobile({ colors }: PreviewMobileProps) {
  const themeStyles = useMemo(() => {
    const get = (rolePart: string, fallback: string) => {
      const token = colors.find((c) => c.role?.toLowerCase().includes(rolePart))
      return token ? token.hex : fallback
    }

    return {
      '--bg': get('background', '#ffffff'),
      '--surface': get('surface', '#f4f4f5'),
      '--primary': get('primary', '#000000'),
      '--secondary': get('secondary', '#71717a'),
      '--accent': get('accent', '#3b82f6'),
      '--text': get('text', '#000000'),
      '--text-inv': '#ffffff',
    } as React.CSSProperties
  }, [colors])

  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900/50 p-4">
      <div
        className="w-[320px] h-[640px] rounded-[3rem] border-8 border-zinc-800 bg-white overflow-hidden relative shadow-2xl"
        style={themeStyles}
      >
        {/* Dynamic Background */}
        <div className="absolute inset-0 transition-colors duration-300" style={{ backgroundColor: 'var(--bg)' }}></div>

        {/* Status Bar */}
        <div className="relative z-10 px-6 py-4 flex justify-between items-center text-xs font-medium" style={{ color: 'var(--text)' }}>
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Header */}
        <div className="relative z-10 px-6 py-2 flex justify-between items-center mb-4">
          <Menu className="w-6 h-6" style={{ color: 'var(--text)' }} />
          <div className="flex items-center gap-4">
            <Search className="w-6 h-6" style={{ color: 'var(--text)' }} />
            <ShoppingBag className="w-6 h-6" style={{ color: 'var(--text)' }} />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 space-y-6 h-[calc(100%-140px)] overflow-y-auto no-scrollbar">
          {/* Hero Card */}
          <div className="rounded-2xl p-6 shadow-lg transform transition-transform active:scale-95" style={{ backgroundColor: 'var(--primary)' }}>
            <span className="inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'var(--text-inv)' }}>
              New Arrival
            </span>
            <h2 className="text-2xl font-bold mb-2 leading-tight" style={{ color: 'var(--text-inv)' }}>
              Summer <br/> Collection
            </h2>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold mt-2" style={{ backgroundColor: 'var(--accent)', color: 'var(--text-inv)' }}>
              Shop Now
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
            {['All', 'Shoes', 'Clothing', 'Accessories'].map((cat, i) => (
              <button
                key={i}
                className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: i === 0 ? 'var(--secondary)' : 'var(--surface)',
                  color: i === 0 ? 'var(--text-inv)' : 'var(--text)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-4">
             {[1, 2, 3, 4].map((item) => (
               <div key={item} className="flex flex-col gap-2">
                 <div className="aspect-[3/4] rounded-xl relative" style={{ backgroundColor: 'var(--surface)' }}>
                    <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/50 backdrop-blur-sm">
                      <Heart className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    </button>
                 </div>
                 <div>
                   <h3 className="text-sm font-medium" style={{ color: 'var(--text)' }}>Modern Tee</h3>
                   <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--secondary)' }}>$120.00</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 left-0 right-0 h-20 px-6 pb-4 flex items-center justify-around backdrop-blur-lg border-t border-black/5" style={{ backgroundColor: 'var(--bg)', opacity: 0.95 }}>
          <Home className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          <Heart className="w-6 h-6" style={{ color: 'var(--secondary)', opacity: 0.5 }} />
          <User className="w-6 h-6" style={{ color: 'var(--secondary)', opacity: 0.5 }} />
        </div>
      </div>
    </div>
  )
}
