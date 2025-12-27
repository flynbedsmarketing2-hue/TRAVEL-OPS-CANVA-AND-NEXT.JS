'use client';

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import RowActionsMenu from "../../../components/RowActionsMenu";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "../../../components/ui/table";
import { useMarketingStore } from "../../../stores/useMarketingStore";
import type { ContentItem, ContentStatus } from "../../../types";

const statusLabels: Record<ContentStatus, string> = {
  idea: "Idea",
  in_production: "In production",
  scheduled: "Scheduled",
  posted: "Posted",
};

type ContentForm = Omit<ContentItem, "id" | "createdAt" | "updatedAt">;

const defaultContentForm: ContentForm = {
  title: "",
  platform: "",
  status: "idea",
};

const omitContentMetadata = (item: ContentItem): ContentForm => {
  const { id, createdAt, updatedAt, ...rest } = item;
  void id;
  void createdAt;
  void updatedAt;
  return rest;
};

type ContentModalProps = {
  open: boolean;
  initial?: ContentItem | null;
  onClose: () => void;
  onSave: (payload: ContentForm) => void;
};

function ContentModal({ open, initial, onClose, onSave }: ContentModalProps) {
  const initialForm = initial ? omitContentMetadata(initial) : { ...defaultContentForm };
  const [form, setForm] = useState<ContentForm>(initialForm);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--token-text)]/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)]/60 bg-[var(--token-surface)]/95 p-6 shadow-md dark:border-[var(--border)] dark:bg-[var(--token-surface)]/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">
            {initial ? "Edit content" : "Add content"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]/60"
          >
            Close
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Platform
            <input
              value={form.platform}
              onChange={(event) => setForm({ ...form, platform: event.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
              Status
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as ContentStatus })}
                className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
              Publish date
              <input
                type="date"
                value={form.publishDate ?? ""}
                onChange={(event) => setForm({ ...form, publishDate: event.target.value || undefined })}
                className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Campaign link (ID)
            <input
              value={form.linkedCampaignId ?? ""}
              onChange={(event) => setForm({ ...form, linkedCampaignId: event.target.value || undefined })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Package link (ID)
            <input
              value={form.linkedPackageId ?? ""}
              onChange={(event) => setForm({ ...form, linkedPackageId: event.target.value || undefined })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save content
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ContentPage() {
  const { content, addContent, updateContent, deleteContent } = useMarketingStore();
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [titleFilter, setTitleFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ContentItem | null>(null);

  const filtered = useMemo(() => {
    return content.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (titleFilter && !item.title.toLowerCase().includes(titleFilter.toLowerCase())) return false;
      return true;
    });
  }, [content, statusFilter, titleFilter]);

  const openModal = (item?: ContentItem) => {
    setModalContent(item ?? null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const handleSave = (payload: ContentForm) => {
    if (modalContent) {
      updateContent(modalContent.id, payload);
    } else {
      addContent(payload);
    }
    closeModal();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketing"
        title="Content"
        subtitle="Track posts, articles, and assets."
        actions={
          <Button variant="primary" onClick={() => openModal()}>
            <Plus className="h-4 w-4" />
            Add content
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as ContentStatus | "")}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Title
            <Input
              placeholder="Search content"
              className="mt-1"
              value={titleFilter}
              onChange={(event) => setTitleFilter(event.target.value)}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--muted)]">No content items.</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Title</TH>
                  <TH>Platform</TH>
                  <TH>Status</TH>
                  <TH>Publish</TH>
                  <TH>Campaign</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((item) => (
                  <TR key={item.id}>
                    <TD>
                      <p className="font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">{item.title}</p>
                    </TD>
                    <TD>{item.platform}</TD>
                    <TD>{statusLabels[item.status]}</TD>
                    <TD>{item.publishDate ? new Date(item.publishDate).toLocaleDateString() : "-"}</TD>
                    <TD>{item.linkedCampaignId ?? "-"}</TD>
                    <TD className="text-right">
                      <RowActionsMenu
                        actions={[
                          {
                            label: "Edit",
                            onClick: () => openModal(item),
                          },
                          {
                            label: "Delete",
                            tone: "danger",
                            onClick: () => deleteContent(item.id),
                          },
                        ]}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ContentModal
        key={modalContent?.id ?? "content-modal"}
        open={modalOpen}
        initial={modalContent}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}

