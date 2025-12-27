import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "h-4 w-full animate-pulse rounded-lg bg-[var(--token-surface-2)] transition-colors duration-200",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
