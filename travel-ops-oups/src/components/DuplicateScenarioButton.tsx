'use client';

import type { PricingScenarioPayload } from "@/lib/pricing/types";
import { useRouter } from "next/navigation";

export function DuplicateScenarioButton({ scenario }: { scenario: PricingScenarioPayload }) {
  const router = useRouter();

  const handleDuplicate = async () => {
    await fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...scenario,
        name: `${scenario.name} (variant)`,
      }),
    });
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--token-surface)] p-5 shadow-sm">
      <p className="text-sm text-[var(--muted)]">
        Create a variant of this scenario for quick comparisons.
      </p>
      <button
        onClick={handleDuplicate}
        className="mt-3 rounded-full bg-[var(--token-accent)] px-4 py-2 text-sm font-semibold text-[var(--token-inverse)]"
      >
        Duplicate scenario
      </button>
    </div>
  );
}

