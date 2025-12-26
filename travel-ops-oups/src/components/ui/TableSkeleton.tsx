import Skeleton from "./Skeleton";
import { cn } from "./cn";

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  hasToolbar?: boolean;
};

export default function TableSkeleton({ rows = 8, columns = 6, hasToolbar = false }: TableSkeletonProps) {
  const columnTemplates = Array.from({ length: columns }, (_, index) => index);

  return (
    <div className="space-y-4 transition-colors duration-150">
      {hasToolbar ? (
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition-colors duration-150 dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[640px] space-y-2 px-4 py-3">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {columnTemplates.map((column) => (
                  <Skeleton key={`head-${column}`} className="h-3" />
                ))}
              </div>

                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <div
                    key={`row-${rowIndex}`}
                    className={cn(
                      "grid gap-4 rounded-2xl px-1 py-3 transition-colors duration-150",
                      rowIndex % 2 === 0 ? "bg-slate-50/80 dark:bg-slate-800/80" : "bg-white dark:bg-slate-900"
                    )}
                    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                  >
                    {columnTemplates.map((column) => (
                      <Skeleton key={`cell-${rowIndex}-${column}`} className="h-5" />
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
