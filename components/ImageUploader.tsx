import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, selectedImage, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  };

  if (selectedImage) {
    return (
      <div className="relative w-full h-48 lg:h-64 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl group">
        <img 
          src={selectedImage} 
          alt="Preview" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        <button
          onClick={onClear}
          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white transition-all duration-200 transform opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-48 lg:h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
        isDragging 
          ? 'border-indigo-500 bg-indigo-500/10' 
          : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="p-3 bg-slate-800 rounded-full mb-3 shadow-lg ring-1 ring-white/10">
        <Upload className={`w-6 h-6 ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`} />
      </div>
      <p className="text-base font-medium text-slate-200">
        Drop photo here
      </p>
      <p className="text-xs text-slate-500 mt-1">
        or click to browse
      </p>
    </div>
  );
};