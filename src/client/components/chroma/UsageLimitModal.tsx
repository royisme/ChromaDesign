import { Link2, Clock, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/client/ui/dialog'
import { Button } from '@/client/ui/button'
import type { UsageStatus } from '@/types/usage'

interface UsageLimitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: UsageStatus | null
  canUseBonus: boolean
  onClaimBonus: () => Promise<{ success: boolean; message: string }>
  isClaimingBonus?: boolean
}

export function UsageLimitModal({
  open,
  onOpenChange,
  status,
  canUseBonus,
  onClaimBonus,
  isClaimingBonus = false,
}: UsageLimitModalProps) {
  const handleClaimBonus = async () => {
    const result = await onClaimBonus()
    if (result.success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">😊</span>
            Daily free limit reached
          </DialogTitle>
          <DialogDescription>
            Free quota resets at UTC 0:00 daily
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Share to unlock */}
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-800">
                <Link2 className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-zinc-200">Share with friends</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Copy link to help more designers discover this tool
                </p>
                <Button
                  onClick={handleClaimBonus}
                  disabled={!canUseBonus || isClaimingBonus}
                  className="mt-3 w-full"
                  variant={canUseBonus ? 'default' : 'secondary'}
                >
                  {isClaimingBonus ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {canUseBonus ? 'Copy link to get +1 quota' : 'Claimed today'}
                </Button>
              </div>
            </div>
          </div>

          {/* Come back tomorrow */}
          <div className="p-4 rounded-lg border border-dashed border-zinc-800">
            <div className="flex items-center gap-3 text-zinc-500">
              <Clock className="w-5 h-5" />
              <div>
                <p className="font-medium text-zinc-400">Or come back tomorrow</p>
                <p className="text-sm">
                  Next reset: {status?.resetAt ? new Date(status.resetAt).toLocaleString() : 'Tomorrow'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}