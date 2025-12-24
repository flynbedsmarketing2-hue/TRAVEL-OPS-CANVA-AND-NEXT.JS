'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClassName } from "../ui/buttonStyles";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,#e0e7ff,#f4f7fe)] p-8 shadow-soft dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">TravelOps V2.0</p>
        <h1 className="text-3xl font-extrabold leading-tight text-slate-900 dark:text-white md:text-4xl">
          TravelOps backoffice, minimal and fast
        </h1>
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
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
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3 text-secondary" />
            <span>Built for dense workflows</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3 text-secondary" />
            <span>Designed for high velocity teams</span>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-primary/40 blur-[80px]"></div>
        <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full bg-secondary/40 blur-[100px]"></div>
      </div>
    </section>
  );
}
