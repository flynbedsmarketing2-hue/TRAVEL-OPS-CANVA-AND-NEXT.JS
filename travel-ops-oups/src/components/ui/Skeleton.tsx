import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "h-4 w-full animate-pulse rounded-lg bg-slate-200/80 transition-colors duration-200 dark:bg-slate-800/60",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
