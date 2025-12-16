import { useState, useEffect, useCallback } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {
  checkUsage,
  consumeUsage,
  claimShareBonus,
} from "@/server/services/usage";
import type { UsageStatus } from "@/types/usage";

export function useUsageLimit() {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [status, setStatus] = useState<UsageStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize fingerprint
  useEffect(() => {
    const init = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setVisitorId(result.visitorId);
      } catch (error) {
        console.error("Failed to get fingerprint:", error);
        // Fallback: use random ID + localStorage
        let fallbackId = localStorage.getItem("chromagen_visitor_id");
        if (!fallbackId) {
          fallbackId = crypto.randomUUID();
          localStorage.setItem("chromagen_visitor_id", fallbackId);
        }
        setVisitorId(fallbackId);
      }
    };
    init();
  }, []);

  // Get usage status
  const refreshStatus = useCallback(async () => {
    if (!visitorId) return;

    try {
      const result = await checkUsage({ data: { visitorId } });
      setStatus(result);
    } catch (error) {
      console.error("Failed to check usage:", error);
    } finally {
      setIsLoading(false);
    }
  }, [visitorId]);

  useEffect(() => {
    if (visitorId) {
      refreshStatus();
    }
  }, [visitorId, refreshStatus]);

  // Consume quota
  const consume = useCallback(async (): Promise<boolean> => {
    if (!visitorId) return false;

    try {
      const result = await consumeUsage({ data: { visitorId } });
      if (result.success) {
        await refreshStatus();
      }
      return result.success;
    } catch (error) {
      console.error("Failed to consume usage:", error);
      return false;
    }
  }, [visitorId, refreshStatus]);

  // Claim share bonus
  const claimBonus = useCallback(async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    if (!visitorId) {
      return { success: false, message: "Unable to identify user" };
    }

    try {
      const result = await claimShareBonus({ data: { visitorId } });
      if (result.success) {
        // Copy share link to clipboard
        const shareUrl = `${window.location.origin}/?ref=${visitorId}`;
        await navigator.clipboard.writeText(shareUrl);
        await refreshStatus();
      }
      return result;
    } catch (error) {
      console.error("Failed to claim bonus:", error);
      return { success: false, message: "Claim failed, please try again" };
    }
  }, [visitorId, refreshStatus]);

  return {
    visitorId,
    status,
    isLoading,
    hasRemaining: (status?.remaining ?? 0) > 0,
    canUseBonus: status?.canUseBonus ?? false,
    consume,
    claimBonus,
    refresh: refreshStatus,
  };
}
