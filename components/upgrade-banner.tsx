import { X } from 'lucide-react';
import Link from 'next/link';

interface UpgradeBannerProps {
  visible: boolean;
  onClose: () => void;
}

export function UpgradeBanner({ visible, onClose }: UpgradeBannerProps) {
  if (!visible) return null;

  return (
    <div className="flex items-center justify-between px-4 pt-6 py-2 -z-40 -translate-y-9 bg-neutral-800/0 border border-t-0 border-neutral-200 dark:border-neutral-800 rounded-b-xl">
      <div className="text-neutral-800 dark:text-neutral-400 text-sm">
        Upgrade to Pro to unlock all of Zap&apos;s features
      </div>
      <div className="flex items-center gap-4">
        <Link 
          href="/view-plans"
          className="text-sm text-purple-400 hover:text-purple-400/80 transition-colors"
        >
          Upgrade Plan
        </Link>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-400 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}