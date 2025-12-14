import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { PaletteDisplay } from './PaletteDisplay';
import { CodeExporter } from './CodeExporter';
import { ThemeGallery } from './ThemeGallery';
import { Button } from './Button';
import { Modal } from './Modal';
import { generateColorScheme, editImage } from '../services/geminiService';
import { ColorToken } from '../types';
import { Palette, Wand2, Sparkles, ChevronLeft } from 'lucide-react';
import { calculateDarkVariant } from '../utils/colorUtils';
import { AdBanner } from './AdBanner';

interface GeneratorAppProps {
  initialFile: File | null;
  onBack: () => void;
}

export const GeneratorApp: React.FC<GeneratorAppProps> = ({ initialFile, onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [colors, setColors] = useState<ColorToken[]>([]);
  const [mood, setMood] = useState<string>('');
  
  // Editing State
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // UI State
  const [showExportModal, setShowExportModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle initial file passed from landing page
  useEffect(() => {
    if (initialFile && !previewUrl) {
      handleGenerate(initialFile);
      const url = URL.createObjectURL(initialFile);
      setPreviewUrl(url);
    }
  }, [initialFile]);

  const handleImageSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setColors([]);
    setMood('');
    setError(null);
    setEditPrompt('');
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setColors([]);
    setMood('');
    setError(null);
    setEditPrompt('');
  }, [previewUrl]);

  const handleGenerate = async (fileToProcess?: File) => {
    const file = fileToProcess || selectedFile;
    if (!file) return;

    setIsGenerating(true);
    setError(null);

    try {
      const data = await generateColorScheme(file);
      setColors(data.colors);
      setMood(data.mood);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate color scheme. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGallerySelect = async (file: File) => {
      handleImageSelect(file);
      await new Promise(r => setTimeout(r, 100));
      await handleGenerate(file);
  };

  const handleEditImage = async () => {
    if (!selectedFile || !editPrompt.trim()) return;

    setIsEditing(true);
    setError(null);

    try {
      const newFile = await editImage(selectedFile, editPrompt);
      setSelectedFile(newFile);
      const newUrl = URL.createObjectURL(newFile);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(newUrl);
      setEditPrompt('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to edit image. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleUpdateColor = (id: string, updates: Partial<ColorToken>) => {
    setColors(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleRemoveColor = (id: string) => {
    setColors(prev => prev.filter(c => c.id !== id));
  };

  const handleAddColor = () => {
    const defaultHex = '#71717a'; // Zinc-500
    const newColor: ColorToken = {
      id: crypto.randomUUID(),
      name: 'New Color',
      hex: defaultHex,
      darkHex: calculateDarkVariant(defaultHex, 'custom'),
      role: 'custom'
    };
    setColors(prev => [...prev, newColor]);
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-6 pt-6 max-w-[1800px] mx-auto animate-in fade-in duration-500 font-sans">
      {/* Header - Refined Monochrome */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={onBack} className="mr-2 px-2 hover:bg-zinc-800 text-zinc-400">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          {/* Logo Icon - White on Zinc-900 */}
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
        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
          
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
              <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800 space-y-2">
                <div className="flex items-center space-x-2 text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase">AI Editor</span>
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g. Retro filter..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleEditImage()}
                  />
                  <Button 
                    variant="secondary" 
                    onClick={handleEditImage}
                    isLoading={isEditing}
                    disabled={!editPrompt.trim() || isGenerating}
                    className="w-full text-sm py-1.5"
                  >
                    Apply Edit
                  </Button>
                </div>
              </div>

               <Button 
                variant="primary"
                onClick={() => handleGenerate()} 
                isLoading={isGenerating}
                disabled={isEditing}
                className="w-full py-3 text-base"
              >
                {!isGenerating && <Wand2 className="w-4 h-4 mr-2" />}
                Generate Palette
              </Button>
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
                <AdBanner slotId="PLACEHOLDER_SLOT_ID" format="rectangle" className="my-0 opacity-70 hover:opacity-100 transition-opacity" />
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

      <Modal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)}
        title="Export Color Palette"
      >
        <CodeExporter colors={colors} />
      </Modal>
    </div>
  );
};