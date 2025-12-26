import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export const buttonBase =
  "inline-flex items-center justify-center gap-2 font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-60 active:translate-y-[1px] rounded-[var(--radius-md)] dark:focus-visible:ring-offset-slate-900";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-[var(--token-primary)] via-[var(--token-primary-strong)] to-[var(--token-secondary)] text-white shadow-soft hover:shadow-lg active:scale-[0.98]",
  secondary:
    "border border-[var(--token-border)] bg-[var(--token-surface)] text-[var(--text)] shadow-sm hover:border-[var(--token-primary)] dark:text-white",
  outline:
    "border border-[var(--token-border)] bg-transparent text-[var(--text)] shadow-sm hover:border-[var(--token-primary)]",
  ghost:
    "text-[var(--text)] hover:text-[var(--token-primary)]",
  danger:
    "bg-gradient-to-br from-[#ff6b6b] to-[#ff9472] text-white shadow-md",
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

