'use client';

import { CreditCard, ListTodo, PlaneTakeoff, Users } from "lucide-react";
import { StatCard } from "./StatCard";

const stats = [
  {
    label: "New leads",
    value: "34",
    badge: "+12% vs last week",
    icon: Users,
    tone: "primary" as const,
  },
  {
    label: "Open tasks",
    value: "18",
    badge: "4 overdue",
    icon: ListTodo,
    tone: "secondary" as const,
  },
  {
    label: "Upcoming departures",
    value: "6",
    badge: "7-day outlook",
    icon: PlaneTakeoff,
    tone: "accent" as const,
  },
  {
    label: "Payments processed",
    value: "€128.4K",
    badge: "Today",
    icon: CreditCard,
    tone: "primary" as const,
  },
];

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function TodayOverview() {
  const today = formatDate(new Date());

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Today overview</h2>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{today}</span>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
