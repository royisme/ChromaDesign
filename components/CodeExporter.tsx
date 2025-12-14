import React, { useState, useMemo } from 'react';
import { ColorToken, ExportFormat } from '../types';
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { generateShades } from '../utils/colorUtils';

interface CodeExporterProps {
  colors: ColorToken[];
}

export const CodeExporter: React.FC<CodeExporterProps> = ({ colors }) => {
  const [activeTab, setActiveTab] = useState<ExportFormat>(ExportFormat.TAILWIND);
  const [copied, setCopied] = useState(false);
  const [showShades, setShowShades] = useState(true);

  // Helper to sanitize names
  const toKebabCase = (str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const toCamelCase = (str: string) => {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
  };

  // Memoize generated shades to avoid recalculation
  const extendedColors = useMemo(() => {
    return colors.map(c => ({
      ...c,
      shades: generateShades(c.hex)
    }));
  }, [colors]);

  // Updated for Tailwind v4 (@theme syntax)
  const generateTailwindV4Config = () => {
    const variables = extendedColors.map(c => {
      // Base variable (optional in v4 if you map everything to numbers, but good for reference)
      // const base = `  --color-${toKebabCase(c.name)}: ${c.hex};`; 
      const shadeVars = Object.entries(c.shades).map(([k, v]) => `  --color-${toKebabCase(c.name)}-${k}: ${v};`).join('\n');
      return `  /* ${c.name} (${c.role || 'Custom'}) */\n${shadeVars}`;
    }).join('\n\n');

    return `/* main.css */
@import "tailwindcss";

@theme {
${variables}
}

/* 
  Usage Examples:
  bg-${toKebabCase(extendedColors[0]?.name || 'color')}-500
  text-${toKebabCase(extendedColors[0]?.name || 'color')}-900
*/`;
  };

  const generateCSSVariables = () => {
    const vars = extendedColors.map(c => {
        const base = `  /* ${c.name} */\n  --color-${toKebabCase(c.name)}: ${c.hex};`;
        const shades = Object.entries(c.shades).map(([k, v]) => `  --color-${toKebabCase(c.name)}-${k}: ${v};`).join('\n');
        return `${base}\n${shades}`;
    }).join('\n\n');

    return `/* global.css */
:root {
${vars}
}`;
  };

  const generateJSON = () => {
    const obj = extendedColors.reduce((acc, c) => {
      acc[toCamelCase(c.name)] = c.shades;
      return acc;
    }, {} as Record<string, any>);
    return JSON.stringify(obj, null, 2);
  };

  const getCode = () => {
    switch (activeTab) {
      case ExportFormat.TAILWIND: return generateTailwindV4Config();
      case ExportFormat.CSS_VARS: return generateCSSVariables();
      case ExportFormat.JSON: return generateJSON();
      default: return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      
      {/* 1. Shades Preview Grid */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <button 
          onClick={() => setShowShades(!showShades)}
          className="w-full px-6 py-4 flex items-center justify-between text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <span>Generated Shades (50-950)</span>
          {showShades ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showShades && (
           <div className="overflow-x-auto p-6 custom-scrollbar bg-slate-900/30">
             <div className="flex gap-6 min-w-max">
               {extendedColors.map((color) => (
                 <div key={color.id} className="w-40 shrink-0 flex flex-col gap-1.5">
                   {/* Header */}
                   <div className="mb-2 pb-2 border-b border-slate-800">
                     <div className="font-bold text-slate-200 text-sm truncate" title={color.name}>{color.name}</div>
                     <div className="text-[10px] text-slate-500 uppercase tracking-wider">{color.role}</div>
                   </div>
                   
                   {/* Shades Stack */}
                   <div className="flex flex-col rounded-lg overflow-hidden ring-1 ring-slate-800 shadow-lg">
                     {Object.entries(color.shades).map(([shade, hex]) => (
                       <div key={shade} className="group relative flex items-center justify-between h-9 px-3 bg-slate-900">
                          {/* Background Color Bar */}
                          <div 
                            className="absolute inset-0 z-0 opacity-100 group-hover:hidden transition-opacity" 
                            style={{ backgroundColor: hex }} 
                          />
                          <div 
                            className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                            style={{ backgroundColor: hex }} 
                          />
                          
                          {/* Text Info */}
                          <span className={`relative z-10 text-[10px] font-mono font-medium ${parseInt(shade) > 400 ? 'text-white/90' : 'text-slate-900/90'}`}>
                            {shade}
                          </span>
                          <span className={`relative z-10 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${parseInt(shade) > 400 ? 'text-white' : 'text-slate-900'}`}>
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
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
          {[ExportFormat.TAILWIND, ExportFormat.CSS_VARS, ExportFormat.JSON].map((format) => (
            <button
              key={format}
              onClick={() => setActiveTab(format)}
              className={`px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                activeTab === format 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {format === ExportFormat.TAILWIND ? 'Tailwind v4' : format === ExportFormat.CSS_VARS ? 'CSS' : 'JSON'}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/20"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Copy Code'}</span>
        </button>
      </div>

      {/* 3. Code View */}
      <div className="relative group bg-[#0d1117] min-h-[400px]">
        <pre className="p-6 text-xs sm:text-sm font-mono leading-relaxed text-slate-300 overflow-x-auto">
          {getCode()}
        </pre>
      </div>
    </div>
  );
};