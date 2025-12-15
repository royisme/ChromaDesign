import { Link2, Clock, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import type { UsageStatus } from '~/types/usage'

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
            今日免费次数已用完
          </DialogTitle>
          <DialogDescription>
            每天 UTC 0:00 刷新免费次数
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* 分享解锁 */}
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-800">
                <Link2 className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-zinc-200">分享给朋友</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  复制链接，帮助更多设计师发现这个工具
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
                  {canUseBonus ? '复制链接获得 +1 次' : '今日已领取'}
                </Button>
              </div>
            </div>
          </div>

          {/* 明天再来 */}
          <div className="p-4 rounded-lg border border-dashed border-zinc-800">
            <div className="flex items-center gap-3 text-zinc-500">
              <Clock className="w-5 h-5" />
              <div>
                <p className="font-medium text-zinc-400">或者明天再来</p>
                <p className="text-sm">
                  下次刷新: {status?.resetAt ? new Date(status.resetAt).toLocaleString() : '明天'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}