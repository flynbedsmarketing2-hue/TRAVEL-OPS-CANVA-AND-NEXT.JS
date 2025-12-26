import Skeleton from "./Skeleton";
import { cn } from "./cn";

type CardSkeletonProps = {
  items?: number;
};

export default function CardSkeleton({ items = 3 }: CardSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 transition-colors duration-150">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={`card-${index}`}
          className={cn(
            "rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition-colors duration-150 dark:border-slate-800 dark:bg-slate-900"
          )}
        >
          <Skeleton className="h-36 w-full" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
