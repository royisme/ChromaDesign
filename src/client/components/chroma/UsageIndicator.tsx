import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UsageIndicatorProps {
  remaining: number
  total: number
  className?: string
}

export function UsageIndicator({ remaining, total, className }: UsageIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1.5 text-sm', className)}>
      <Sparkles className="w-4 h-4 text-zinc-500" />
      <span className="text-zinc-400">
        {remaining}/{total}
      </span>
      <div className="flex gap-0.5 ml-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              i < remaining ? 'bg-emerald-500' : 'bg-zinc-700'
            )}
          />
        ))}
      </div>
    </div>
  )
}