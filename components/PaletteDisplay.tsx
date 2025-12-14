import React, { useState } from 'react';
import { ColorToken } from '../types';
import { Trash2, Plus, Type, Code2, LayoutTemplate, Pencil } from 'lucide-react';
import { getContrastRatio, getWcagRating, getBestTextColor } from '../utils/colorUtils';
import { Button } from './Button';
import { PreviewDashboard } from './PreviewDashboard';

interface PaletteDisplayProps {
  colors: ColorToken[];
  mood: string;
  onUpdateColor: (id: string, updates: Partial<ColorToken>) => void;
  onRemoveColor: (id: string) => void;
  onAddColor: () => void;
  onExport: () => void;
}

type Tab = 'editor' | 'preview';

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ 
  colors, 
  mood, 
  onUpdateColor,
  onRemoveColor,
  onAddColor,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [contrastBaseline, setContrastBaseline] = useState<string>('auto'); // 'auto' | 'white' | 'black' | colorId

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 animate-in fade-in slide-in-from-bottom-8 duration-700 h-full">
      
      {/* Toolbar & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur shrink-0 gap-4 sm:gap-0">
        
        {/* Title & Tabs */}
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'editor' 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'preview' 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {mood && (
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_-3px_rgba(99,102,241,0.3)]">
              {mood}
            </span>
          )}
        </div>
        
        {/* Actions (Only show in Editor Mode) */}
        {activeTab === 'editor' && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end animate-in fade-in">
            {/* Contrast Controls */}
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Type className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <select 
                    value={contrastBaseline}
                    onChange={(e) => setContrastBaseline(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:bg-slate-750 transition-colors cursor-pointer appearance-none min-w-[140px]"
                >
                  <option value="auto">Auto Contrast</option>
                  <option value="white">vs White</option>
                  <option value="black">vs Black</option>
                  <option disabled>──────────</option>
                  {colors.map(c => (
                    <option key={c.id} value={c.id}>vs {c.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <Button 
              variant="secondary" 
              onClick={onExport}
              className="px-4 py-2 text-xs h-[34px] flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            >
              <Code2 className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-slate-900">
        
        {/* EDITOR VIEW */}
        <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${activeTab === 'editor' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <div className="flex-1 flex flex-col divide-y divide-slate-800/50 overflow-y-auto custom-scrollbar">
            {colors.map((token) => {
              // Contrast Calculation Logic
              const contrastHex = contrastBaseline === 'auto' 
                  ? getBestTextColor(token.hex) 
                  : (contrastBaseline === 'white' ? '#FFFFFF' : (contrastBaseline === 'black' ? '#000000' : colors.find(c => c.id === contrastBaseline)?.hex || '#000000'));
              
              const ratio = getContrastRatio(token.hex, contrastHex);
              const rating = getWcagRating(ratio);
              const baselineName = contrastBaseline === 'auto' 
                  ? (contrastHex === '#FFFFFF' ? 'White' : 'Black') 
                  : (contrastBaseline === 'white' ? 'White' : (contrastBaseline === 'black' ? 'Black' : colors.find(c => c.id === contrastBaseline)?.name || 'Ref'));

              return (
                <div 
                  key={token.id} 
                  className="flex flex-col md:flex-row min-h-[120px] md:min-h-[100px] group relative shrink-0 hover:bg-slate-800/30 transition-colors"
                >
                  {/* Color Blocks Area (Light & Dark) */}
                  <div className="relative flex w-full md:w-64 shrink-0 h-16 md:h-auto">
                    {/* Light Mode Color */}
                    <div className="relative flex-1 border-r border-slate-800/50 group/light">
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
                    <div className="relative flex-1 border-r border-slate-800/50 group/dark">
                      <div 
                        className="absolute inset-0 transition-transform duration-300 z-0"
                        style={{ backgroundColor: token.darkHex || '#000' }} // Fallback
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
                          className="w-full bg-transparent text-slate-100 font-bold text-base md:text-lg focus:outline-none focus:text-white border-b border-transparent focus:border-indigo-500 transition-all truncate placeholder-slate-600"
                          placeholder="Color Name"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/50 uppercase tracking-wider shrink-0">
                        {token.role || 'Custom'}
                      </span>
                    </div>
                    
                    {/* Middle Row: Hex Codes (Editable Text) */}
                    <div className="flex gap-4 mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-600 uppercase">Light Hex</span>
                        <input 
                          type="text"
                          value={token.hex}
                          onChange={(e) => onUpdateColor(token.id, { hex: e.target.value })}
                          className="bg-transparent text-slate-400 font-mono text-xs focus:outline-none focus:text-indigo-400 uppercase tracking-widest w-20"
                        />
                      </div>
                      <div className="flex flex-col border-l border-slate-800 pl-4">
                        <span className="text-[10px] text-slate-600 uppercase">Dark Hex</span>
                        <input 
                          type="text"
                          value={token.darkHex || ''}
                          onChange={(e) => onUpdateColor(token.id, { darkHex: e.target.value })}
                          className="bg-transparent text-slate-400 font-mono text-xs focus:outline-none focus:text-indigo-400 uppercase tracking-widest w-20"
                          placeholder="N/A"
                        />
                      </div>
                    </div>

                    {/* Bottom Row: Accessibility Badge (Calculated based on Light mode for now) */}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-3 group/acc cursor-help" title={`Light Mode Contrast ratio against ${baselineName}`}>
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-md border ${rating.pass ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <span className={`text-xs font-bold ${rating.pass ? 'text-emerald-400' : 'text-red-400'}`}>
                              {rating.score}
                            </span>
                            <div className={`h-3 w-px ${rating.pass ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}></div>
                            <span className="text-xs text-slate-400 font-mono">
                              {ratio.toFixed(2)}:1
                            </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Color Button */}
            <button 
              onClick={onAddColor}
              className="h-16 shrink-0 flex items-center justify-center bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-indigo-400 transition-all border-t border-slate-800/50 group"
              title="Add new color"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg group-hover:bg-slate-700/50 transition-colors">
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Add Color</span>
              </div>
            </button>
          </div>
        </div>

        {/* PREVIEW VIEW */}
        <div className={`absolute inset-0 p-4 md:p-6 transition-opacity duration-300 ${activeTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <PreviewDashboard colors={colors} />
        </div>

      </div>
    </div>
  );
};