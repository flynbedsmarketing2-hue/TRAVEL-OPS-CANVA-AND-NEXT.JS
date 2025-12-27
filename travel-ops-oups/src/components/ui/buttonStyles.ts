import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export const buttonBase =
  "inline-flex items-center justify-center gap-2 font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--token-surface)] disabled:pointer-events-none disabled:opacity-60 active:translate-y-[1px] rounded-[var(--radius-md)]";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-[var(--token-inverse)] shadow-md hover:from-[var(--accent-start)]/95 hover:to-[var(--accent-end)]/95 active:scale-[0.99]",
  secondary:
    "border border-[var(--token-border)] bg-[var(--token-surface)] text-[var(--text)] shadow-sm hover:border-[var(--token-primary)]",
  outline:
    "border border-[var(--token-border)] bg-transparent text-[var(--text)] shadow-sm hover:border-[var(--token-primary)]",
  ghost:
    "text-[var(--text)] hover:bg-[var(--token-surface-2)] hover:text-[var(--token-primary)]",
  danger:
    "bg-[var(--token-danger)] text-[var(--token-inverse)] shadow-sm hover:bg-[var(--token-danger-strong)]",
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


