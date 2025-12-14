import React, { useState } from 'react';
import { Loader2, Palette } from 'lucide-react';

interface ThemeGalleryProps {
  onSelect: (file: File) => void;
  isProcessing: boolean;
}

const THEMES = [
  {
    id: 'sunset',
    title: 'Sunset Peaks',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    credit: 'Kalen Emsley',
    colors: ['#fed7aa', '#f97316', '#7c3aed', '#4c1d95']
  },
  {
    id: 'cyberpunk',
    title: 'Neon Tokyo',
    url: 'https://images.unsplash.com/photo-1542382772-e4276709f6b5?w=600&q=80',
    credit: 'Jezael Melgoza',
    colors: ['#f0abfc', '#d946ef', '#22d3ee', '#0f172a']
  },
  {
    id: 'minimal',
    title: 'Clean Desk',
    url: 'https://images.unsplash.com/photo-1493723843684-a63fe689df56?w=600&q=80',
    credit: 'D. Cohen',
    colors: ['#f8fafc', '#e2e8f0', '#94a3b8', '#475569']
  },
  {
    id: 'forest',
    title: 'Deep Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?w=600&q=80',
    credit: 'Paul Jarvis',
    colors: ['#dcfce7', '#22c55e', '#14532d', '#3f6212']
  },
  {
    id: 'pastel',
    title: 'Soft Architecture',
    url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=80',
    credit: 'Davide Cantelli',
    colors: ['#fce7f3', '#fbcfe8', '#bae6fd', '#e0f2fe']
  },
  {
    id: 'ocean',
    title: 'Deep Ocean',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80',
    credit: 'Matt Hardy',
    colors: ['#e0f2fe', '#38bdf8', '#0284c7', '#0c4a6e']
  }
];

export const ThemeGallery: React.FC<ThemeGalleryProps> = ({ onSelect, isProcessing }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelect = async (id: string, url: string, title: string) => {
    if (isProcessing || loadingId) return;

    try {
      setLoadingId(id);
      const response = await fetch(url);
      const blob = await response.blob();
      const mimeType = blob.type || 'image/jpeg';
      const file = new File([blob], `${title}.jpg`, { type: mimeType });
      onSelect(file);
    } catch (error) {
      console.error("Failed to load image", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3.5 h-3.5" />
          Preset Themes
        </h2>
        <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
          Curated Styles
        </span>
      </div>
     
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleSelect(theme.id, theme.url, theme.title)}
            disabled={isProcessing || !!loadingId}
            className="group relative flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all text-left h-full"
          >
            {/* Image Area */}
            <div className="relative aspect-video w-full overflow-hidden">
              <img 
                src={theme.url} 
                alt={theme.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
              
              {/* Loading State Overlay */}
              {loadingId === theme.id && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="p-3 flex flex-col gap-2 flex-1 w-full bg-slate-900">
              <div>
                <span className="block text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                  {theme.title}
                </span>
                <span className="block text-[10px] text-slate-500 truncate">
                  by {theme.credit}
                </span>
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
            <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-transparent group-hover:ring-indigo-500/30 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};