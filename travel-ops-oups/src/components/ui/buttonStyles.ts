import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background-light disabled:pointer-events-none disabled:opacity-60 active:translate-y-[1px] dark:focus-visible:ring-offset-background-dark";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-[#7c8bff] via-[#6ba7ff] to-[#5ed0ff] text-white shadow-[8px_8px_18px_rgba(118,136,200,0.32),-6px_-6px_16px_rgba(255,255,255,0.9)] hover:shadow-[10px_10px_22px_rgba(118,136,200,0.32),-8px_-8px_18px_rgba(255,255,255,0.92)]",
  secondary:
    "border border-white/70 bg-[linear-gradient(145deg,#f9fbff,#e9eeff)] text-slate-800 shadow-[6px_6px_14px_rgba(182,193,224,0.34),-6px_-6px_14px_rgba(255,255,255,0.9)] hover:text-primary",
  outline:
    "border border-white/70 bg-white/60 text-slate-800 shadow-[4px_4px_10px_rgba(182,193,224,0.32),-4px_-4px_10px_rgba(255,255,255,0.85)] hover:border-primary/50 hover:text-primary",
  ghost:
    "text-slate-700 hover:bg-white/60 hover:shadow-[inset_4px_4px_8px_rgba(182,193,224,0.35),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] dark:text-slate-200",
  danger:
    "bg-gradient-to-br from-[#ff6b6b] to-[#ff9472] text-white shadow-[8px_8px_16px_rgba(223,125,125,0.28),-6px_-6px_14px_rgba(255,255,255,0.9)]",
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-3.5 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "h-10 w-10",
};

export function buttonClassName(options?: { variant?: ButtonVariant; size?: ButtonSize; className?: string }) {
  return cn(
    buttonBase,
    buttonVariants[options?.variant ?? "primary"],
    buttonSizes[options?.size ?? "md"],
    options?.className
  );
}

