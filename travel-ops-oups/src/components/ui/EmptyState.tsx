import type { ReactNode } from "react";
import { cn } from "./cn";
import { Button } from "./button";
import type { ButtonVariant } from "./buttonStyles";

type ActionButton = {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
};

type EmptyStateVariant = "page" | "section" | "inline";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  primaryAction?: ReactNode | ActionButton;
  secondaryAction?: ReactNode | ActionButton;
  variant?: EmptyStateVariant;
  className?: string;
};

const variantStyles: Record<EmptyStateVariant, string> = {
  section: "border border-[var(--border)] bg-[var(--token-surface)] p-8 text-center shadow-sm transition-colors duration-150",
  page: "bg-transparent p-12 text-center",
  inline: "bg-transparent border-0 p-0 text-left",
};

const isActionButton = (value: unknown): value is ActionButton =>
  typeof value === "object" && value !== null && "label" in value && typeof (value as ActionButton).label === "string";

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = "section",
  className,
}: EmptyStateProps) {
  const renderAction = (action?: ReactNode | ActionButton) => {
    if (!action) return null;
    if (isActionButton(action)) {
      return (
        <Button variant={action.variant ?? "primary"} onClick={action.onClick}>
          {action.label}
        </Button>
      );
    }
    return action;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-[var(--radius-lg)] text-center transition-colors duration-150",
        variantStyles[variant],
        variant === "inline" ? "items-start text-left" : "items-center text-center",
        className
      )}
    >
      {icon ? <div className="text-primary">{icon}</div> : null}
      <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
      {description ? <p className="text-sm text-[var(--muted)]">{description}</p> : null}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {renderAction(primaryAction)}
          {renderAction(secondaryAction)}
        </div>
      )}
    </div>
  );
}
