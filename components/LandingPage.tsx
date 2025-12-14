import React from 'react';
import { Palette, Zap, Code2, Layout, ArrowRight, Upload } from 'lucide-react';
import { Button } from './Button';
import { ThemeGallery } from './ThemeGallery';
import { AdBanner } from './AdBanner';

interface LandingPageProps {
  onStart: () => void;
  onGallerySelect: (file: File) => void;
  isProcessing: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onGallerySelect, isProcessing }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-white/20">
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-grid-pattern" />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-24 px-6 border-b border-zinc-800/50">
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-3 h-3 fill-zinc-400" />
            <span>Powered by Gemini 2.5 AI Vision</span>
          </div>
          
          {/* Headline - Solid White, Tight Tracking */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Design Systems <br/>
            <span className="text-zinc-500">from Photos.</span>
          </h1>
          
          {/* Subheading - Neutral Grey */}
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 font-light">
            Instantly extract semantic, accessible color tokens for Tailwind CSS. 
            No magic, just precise design engineering.
          </p>
          
          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Button 
              onClick={onStart} 
              variant="primary"
              className="h-12 px-8 text-base"
            >
              Start Generating
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={onStart} 
              className="h-12 px-8 text-base bg-zinc-900/50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </div>
        </div>
      </section>

      {/* Ad Section */}
      <section className="max-w-5xl mx-auto w-full px-6 py-12 border-b border-zinc-800/50 relative z-10">
         <AdBanner slotId="PLACEHOLDER_SLOT_ID" label="Sponsored" className="min-h-[120px] opacity-80 hover:opacity-100 transition-opacity" />
      </section>

      {/* Features Grid */}
      <section className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Palette,
                title: "Semantic Mapping",
                desc: "We don't just find colors. We assign roles: Surface, Primary, and Accent based on visual hierarchy."
              },
              {
                icon: Layout,
                title: "Live Preview",
                desc: "Visualize your palette on a complex, professional dashboard interface in real-time."
              },
              {
                icon: Code2,
                title: "Export Ready",
                desc: "Copy-paste ready code for Tailwind v4 (@theme variables) and standard CSS Custom Properties."
              }
            ].map((f, i) => (
              <div key={i} className="group p-6 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-zinc-100 border border-zinc-700 group-hover:border-zinc-600 transition-colors">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start / Gallery Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full border-t border-zinc-800/50 relative z-10 bg-[#09090b]">
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Curated Presets</h2>
            <p className="text-zinc-400">Jump start your design with these hand-picked compositions.</p>
          </div>
        </div>
        
        {/* Gallery Container - subtle refinement */}
        <div className="bg-zinc-900/30 p-1 rounded-2xl border border-zinc-800/50">
          <ThemeGallery onSelect={(file) => {
             onGallerySelect(file);
             onStart();
          }} isProcessing={isProcessing} />
        </div>
      </section>

      <footer className="py-12 text-center text-zinc-600 text-sm border-t border-zinc-800 relative z-10 bg-[#09090b]">
        <p>© {new Date().getFullYear()} ChromaGen AI.</p>
      </footer>
    </div>
  );
};