'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClassName } from "../ui/buttonStyles";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--token-surface)] p-8 shadow-soft">
      <div className="max-w-4xl space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--primary)]">Nouba Plus</p>
        <h1 className="text-3xl font-extrabold leading-tight text-[var(--text)] md:text-4xl">
          Nouba Plus backoffice, minimal and fast
        </h1>
        <p className="text-lg font-medium text-[var(--muted)]">
          CRM, sales, operations and marketing combined in a single workspace built for lean travel teams.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className={buttonClassName({ variant: "primary", size: "lg" })}>
            Go to Dashboard
          </Link>
          <Link href="/crm" className={buttonClassName({ variant: "outline", size: "lg" })}>
            Explore modules
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3 text-[var(--primary)]" />
            <span>Built for dense workflows</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3 text-[var(--primary)]" />
            <span>Designed for high velocity teams</span>
          </div>
        </div>
      </div>
    </section>
  );
}
