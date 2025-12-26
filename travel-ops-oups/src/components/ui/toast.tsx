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
  success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200",
  error: "border-rose-200 bg-rose-50 text-rose-900 dark:bg-rose-900/80 dark:text-rose-200",
  info: "border-slate-200 bg-slate-50 text-slate-900 dark:bg-slate-900/70 dark:text-slate-100",
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
            "w-full max-w-sm rounded-2xl border px-4 py-3 shadow-soft transition duration-150 ease-out md:w-80",
            variantClasses[toast.variant]
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-semibold leading-snug">{toast.title}</p>
              {toast.description ? (
                <p className="text-xs leading-tight text-slate-700 dark:text-slate-200/80">
                  {toast.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-900 dark:text-slate-300"
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
