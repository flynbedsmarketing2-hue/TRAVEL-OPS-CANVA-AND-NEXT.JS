'use client';

import Link from "next/link";
import PageHeader from "../../../components/PageHeader";
import { buttonClassName } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { leadStages, useCrmStore } from "../../../stores/useCrmStore";

export default function PipelinePage() {
  const leads = useCrmStore((state) => state.leads);
  const setLeadStage = useCrmStore((state) => state.setLeadStage);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Pipeline"
        subtitle="Track opportunities by stage."
        actions={
          <Link href="/crm/leads" className={buttonClassName({ variant: "outline" })}>
            View leads
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        {leadStages.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.stage === stage.value);
          return (
            <Card key={stage.value} className="overflow-hidden">
              <CardHeader className="items-center">
                <CardTitle>{stage.label}</CardTitle>
                <span className="text-xs font-semibold text-[var(--muted)] dark:text-[var(--muted)]">{stageLeads.length}</span>
              </CardHeader>
              <CardContent className="space-y-3">
                {stageLeads.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] dark:text-[var(--muted)]">No opportunities.</p>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="space-y-2 rounded-xl border border-[var(--border)]/60 bg-[var(--token-surface)]/80 px-3 py-2 text-sm dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">{lead.name}</p>
                          <p className="text-xs text-[var(--muted)] dark:text-[var(--muted)]">{lead.company}</p>
                        </div>
                        <select
                          value={lead.stage}
                          onChange={(event) =>
                            setLeadStage(lead.id, event.target.value as (typeof leadStages)[number]["value"])
                          }
                          className="rounded-md border border-[var(--border)] px-2 py-1 text-xs"
                        >
                          {leadStages.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)] dark:text-[var(--muted)]">
                        <span>{lead.owner ?? "Unassigned"}</span>
                        <span>
                          {lead.nextContact
                            ? `Next contact ${new Date(lead.nextContact).toLocaleDateString()}`
                            : "No follow-up scheduled"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

