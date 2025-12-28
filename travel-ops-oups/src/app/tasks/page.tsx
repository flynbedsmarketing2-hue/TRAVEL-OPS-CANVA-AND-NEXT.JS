'use client';

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import RowActionsMenu from "../../components/RowActionsMenu";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TBody, TD, THead, TH, TR } from "../../components/ui/table";
import { taskPriorities, taskStatuses, useTaskStore } from "../../stores/useTaskStore";
import type { Task, TaskLink, TaskPriority, TaskStatus } from "../../types";

type TaskForm = Omit<Task, "id" | "createdAt" | "updatedAt">;

const defaultTaskForm: TaskForm = {
  title: "",
  description: "",
  owner: "Me",
  status: "todo",
  priority: "medium",
  dueDate: undefined,
  link: undefined,
};

const omitTaskMetadata = (task: Task): TaskForm => {
  const { id, createdAt, updatedAt, ...rest } = task;
  void id;
  void createdAt;
  void updatedAt;
  return rest;
};

type TaskModalProps = {
  open: boolean;
  initial?: Task | null;
  link?: TaskLink | null;
  onClose: () => void;
  onSave: (payload: TaskForm) => void;
};

function TaskModal({ open, initial, link, onClose, onSave }: TaskModalProps) {
  const initialForm = initial ? omitTaskMetadata(initial) : { ...defaultTaskForm, link: link ?? undefined };
  const [form, setForm] = useState<TaskForm>(initialForm);

  if (!open) return null;

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--token-text)]/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)]/60 bg-[var(--token-surface)]/95 p-6 shadow-md dark:border-[var(--border)] dark:bg-[var(--token-surface)]/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">
            {initial ? "Edit task" : "Add task"}
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
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="mt-1 h-20 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
              Priority
              <select
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })}
                className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              >
                {taskPriorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
              Status
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })}
                className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              >
                {taskStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
              Owner
              <input
                value={form.owner}
                onChange={(event) => setForm({ ...form, owner: event.target.value })}
                className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
              Due date
              <input
                type="date"
                value={form.dueDate ?? ""}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value || undefined })}
                className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save task
          </Button>
        </div>
      </div>
    </div>
  );
}

type DueFilter = "all" | "today" | "overdue" | "upcoming";

export default function TasksPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const setTaskStatus = useTaskStore((state) => state.setTaskStatus);

  const [tab, setTab] = useState<"mine" | "team">("mine");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">("");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [modalLink, setModalLink] = useState<TaskLink | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const params = new URLSearchParams(window.location.search);
    const linkType = params.get("linkType");
    const linkId = params.get("linkId");
    if (linkType && linkId) {
      setModalLink({ type: linkType as TaskLink["type"], id: linkId });
      setModalOpen(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const filteredTasks = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = startOfDay + 86_399_999;

    return tasks
      .filter((task) => (tab === "mine" ? task.owner === "Me" : task.owner !== "Me"))
      .filter((task) => (statusFilter ? task.status === statusFilter : true))
      .filter((task) => (priorityFilter ? task.priority === priorityFilter : true))
      .filter((task) => {
        if (dueFilter === "today") {
          return task.dueDate && new Date(task.dueDate).getTime() >= startOfDay && new Date(task.dueDate).getTime() <= endOfDay;
        }
        if (dueFilter === "overdue") {
          return task.dueDate && new Date(task.dueDate).getTime() < startOfDay;
        }
        if (dueFilter === "upcoming") {
          return task.dueDate && new Date(task.dueDate).getTime() > endOfDay;
        }
        return true;
      });
  }, [tasks, tab, statusFilter, priorityFilter, dueFilter]);

  const openModal = (task?: Task) => {
    setModalTask(task ?? null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTask(null);
    setModalLink(null);
  };

  const handleSave = (payload: TaskForm) => {
    if (modalTask) {
      updateTask(modalTask.id, payload);
    } else {
      addTask(payload);
    }
    closeModal();
  };

  const getLinkHref = (link?: TaskLink) => {
    if (!link) return undefined;
    switch (link.type) {
      case "lead":
        return `/crm/leads`;
      case "booking":
        return `/sales`;
      case "package":
        return `/packages`;
      case "opsGroup":
        return `/ops`;
      default:
        return undefined;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tasks"
        title="Tasks"
        subtitle="Track priorities across leads, packages, and bookings."
        actions={
          <Button variant="primary" onClick={() => openModal()}>
            <Plus className="h-4 w-4" />
            Create task
          </Button>
        }
      />

      <Card>
        <CardHeader className="items-center gap-4">
          <CardTitle>View</CardTitle>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("mine")}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                tab === "mine"
                  ? "border border-[var(--token-accent)]/60 bg-[var(--token-accent)]/10 text-[var(--token-accent)]"
                  : "border border-[var(--border)] text-[var(--text)]"
              }`}
            >
              My tasks
            </button>
            <button
              type="button"
              onClick={() => setTab("team")}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                tab === "team"
                  ? "border border-[var(--token-accent)]/60 bg-[var(--token-accent)]/10 text-[var(--token-accent)]"
                  : "border border-[var(--border)] text-[var(--text)]"
              }`}
            >
              Team
            </button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as TaskStatus | "")}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {taskStatuses.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Priority
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as TaskPriority | "")}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {taskPriorities.map((priorityOption) => (
                <option key={priorityOption.value} value={priorityOption.value}>
                  {priorityOption.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Due date
            <select
              value={dueFilter}
              onChange={(event) => setDueFilter(event.target.value as DueFilter)}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="overdue">Overdue</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] dark:text-[var(--muted)]">
            <Filter className="h-4 w-4" />
            {filteredTasks.length} result(s)
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--muted)]">No tasks for this filter.</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Title</TH>
                  <TH>Owner</TH>
                  <TH>Priority</TH>
                  <TH>Status</TH>
                  <TH>Due date</TH>
                  <TH>Link</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filteredTasks.map((task) => {
                  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                  const todayStart = new Date().setHours(0, 0, 0, 0);
                  const isOverdue = dueDate ? dueDate.getTime() < todayStart : false;
                  const linkHref = getLinkHref(task.link);
                  return (
                    <TR key={task.id} className={isOverdue ? "bg-[var(--token-danger)]/10 text-[var(--token-danger)]" : ""}>
                      <TD>
                        <p className="font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">{task.title}</p>
                        {task.description ? (
                          <p className="text-xs text-[var(--muted)] dark:text-[var(--muted)]">{task.description}</p>
                        ) : null}
                      </TD>
                      <TD>{task.owner}</TD>
                      <TD>
                        <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                          {taskPriorities.find((p) => p.value === task.priority)?.label ?? task.priority}
                        </span>
                      </TD>
                      <TD>
                        <span className="text-xs text-[var(--muted)] dark:text-[var(--muted)]">
                          {taskStatuses.find((s) => s.value === task.status)?.label ?? task.status}
                        </span>
                      </TD>
                      <TD>{dueDate ? dueDate.toLocaleDateString() : "-"}</TD>
                      <TD>
                        {linkHref ? (
                          <Link href={linkHref} className="text-xs text-primary underline">
                            View
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TD>
                      <TD className="text-right">
                        <RowActionsMenu
                          actions={[
                            {
                              label: task.status === "done" ? "Reopen task" : "Mark as done",
                              onClick: () =>
                                setTaskStatus(task.id, task.status === "done" ? "todo" : "done"),
                            },
                            {
                              label: "Edit",
                              onClick: () => openModal(task),
                            },
                            {
                              label: "Delete",
                              tone: "danger",
                              onClick: () => deleteTask(task.id),
                            },
                            ...(linkHref
                              ? [
                                  {
                                    label: "View linked item",
                                    href: linkHref,
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TaskModal
        key={modalTask?.id ?? modalLink?.id ?? "task-modal"}
        open={modalOpen}
        initial={modalTask}
        link={modalLink}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}

