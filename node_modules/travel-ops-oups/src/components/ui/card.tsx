import * as React from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/70 bg-[linear-gradient(145deg,#f9fbff,#e9eeff)] shadow-[14px_14px_30px_rgba(182,193,224,0.4),-12px_-12px_26px_rgba(255,255,255,0.9)] backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80 dark:shadow-[10px_10px_32px_rgba(0,0,0,0.45),-10px_-10px_28px_rgba(40,40,80,0.35)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between gap-2 px-5 pt-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-heading text-sm font-semibold uppercase tracking-[0.08em] text-slate-800 dark:text-slate-100", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-slate-500 dark:text-slate-300", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5 pt-2", className)} {...props} />;
}
