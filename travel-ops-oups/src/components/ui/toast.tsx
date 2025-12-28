"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { cn } from "./cn";
import { generateId } from "../../stores/storeUtils";

type ToastVariant = "success" | "error" | "info";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastRecord = ToastOptions & { id: string };

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
};

const toastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(toastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timeouts.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timeouts.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info" }: ToastOptions) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      const timer = setTimeout(() => removeToast(id), 4500);
      timeouts.current.set(id, timer);
    },
    [removeToast]
  );

  return (
    <toastContext.Provider value={{ toast }}>
      {children}
      <Toaster toasts={toasts} onRemove={removeToast} />
    </toastContext.Provider>
  );
}

const variantClasses: Record<ToastVariant, string> = {
  success: "border-[var(--token-primary)]/30 bg-[var(--token-surface-2)] text-[var(--token-primary)]",
  error: "border-[var(--token-accent)]/30 bg-[var(--token-surface-2)] text-[var(--token-accent)]",
  info: "border-[var(--border)] bg-[var(--token-surface)] text-[var(--text)]",
};

function Toaster({
  toasts,
  onRemove,
}: {
  toasts: ToastRecord[];
  onRemove: (id: string) => void;
}) {
  if (!toasts.length) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-6 z-50 flex flex-col items-end gap-3 px-4 sm:inset-x-auto sm:right-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "w-full max-w-sm rounded-2xl border px-4 py-3 shadow-md transition duration-150 ease-out md:w-80",
            variantClasses[toast.variant ?? "info"]
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-semibold leading-snug">{toast.title}</p>
              {toast.description ? (
                <p className="text-xs leading-tight text-[var(--muted)]">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)] transition hover:text-[var(--text)]"
              onClick={() => onRemove(toast.id)}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
