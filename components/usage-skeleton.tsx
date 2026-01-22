interface UsageSkeletonProps {
  textSize?: string;
}

export function UsageSkeleton({ textSize }: UsageSkeletonProps) {
  const sizeMap: Record<string, string> = {
    "text-xs": "h-3 w-24",
    "text-sm": "h-4 w-28",
    "text-base": "h-5 w-32",
  };

  const sizeClass = sizeMap[textSize ?? "text-sm"] ?? "h-4 w-28";

  return (
    <div
      className={`rounded bg-neutral-300 dark:bg-neutral-700 animate-pulse ${sizeClass}`}
    />
  );
}
