import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import { cn } from '~/lib/utils'

interface ImageUploaderProps {
  onImageSelected: (file: File) => void
  selectedImage: string | null
  onClear: () => void
}

export function ImageUploader({ onImageSelected, selectedImage, onClear }: ImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageSelected(acceptedFiles[0])
      }
    },
    [onImageSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
    },
    maxFiles: 1,
    multiple: false,
  })

  if (selectedImage) {
    return (
      <div className="relative w-full h-48 lg:h-64 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shadow-2xl group">
        <img
          src={selectedImage}
          alt="Preview"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClear()
          }}
          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white transition-all duration-200 transform opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative w-full h-48 lg:h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300',
        isDragActive
          ? 'border-primary bg-primary/10'
          : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-500'
      )}
    >
      <input {...getInputProps()} />
      <div className="p-3 bg-zinc-800 rounded-full mb-3 shadow-lg ring-1 ring-white/10">
        <Upload className={cn('w-6 h-6', isDragActive ? 'text-primary' : 'text-zinc-400')} />
      </div>
      <p className="text-base font-medium text-zinc-200">Drop photo here</p>
      <p className="text-xs text-zinc-500 mt-1">or click to browse</p>
    </div>
  )
}
