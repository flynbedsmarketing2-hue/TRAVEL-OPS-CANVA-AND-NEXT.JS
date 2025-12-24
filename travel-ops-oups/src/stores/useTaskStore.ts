'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, TaskPriority, TaskStatus } from "../types";
import { generateId, makePersistStorage } from "./storeUtils";

const TASKS_ENDPOINT = "/api/shared/tasks";

const persistTasksToServer = (tasks: Task[]) => {
  if (typeof window === "undefined") return;
  void fetch(TASKS_ENDPOINT, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tasks }),
  }).catch((error) => {
    console.error("Unable to sync tasks", error);
  });
};

const loadTasksFromServer = async (): Promise<Task[] | null> => {
  if (typeof window === "undefined") return null;
  try {
    const response = await fetch(TASKS_ENDPOINT);
    if (!response.ok) {
      console.error("Tasks backend unavailable", response.statusText);
      return null;
    }
    return (await response.json()) as Task[];
  } catch (error) {
    console.error("Failed to load tasks", error);
    return null;
  }
};

export const taskStatuses: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "À faire" },
  { value: "in_progress", label: "En cours" },
  { value: "blocked", label: "Bloqué" },
  { value: "done", label: "Terminé" },
];

export const taskPriorities: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Faible" },
  { value: "medium", label: "Moyen" },
  { value: "high", label: "Élevé" },
  { value: "urgent", label: "Urgent" },
];

type TaskStore = {
  tasks: Task[];
  addTask: (payload: Omit<Task, "id" | "createdAt" | "updatedAt">) => Task;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => Task | null;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  loadFromServer: () => Promise<void>;
};

const storage = makePersistStorage();

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => {
      const sync = () => persistTasksToServer(get().tasks);

      return {
        tasks: [],
        addTask: (payload) => {
          const now = new Date().toISOString();
          const task: Task = { id: generateId(), createdAt: now, updatedAt: now, ...payload };
          set({ tasks: [task, ...get().tasks] });
          sync();
          return task;
        },
        updateTask: (id, updates) => {
          let result: Task | null = null;
          set({
            tasks: get().tasks.map((task) => {
              if (task.id !== id) return task;
              result = { ...task, ...updates, updatedAt: new Date().toISOString() };
              return result;
            }),
          });
          if (result) sync();
          return result;
        },
        deleteTask: (id) => {
          set({ tasks: get().tasks.filter((task) => task.id !== id) });
          sync();
        },
        setTaskStatus: (id, status) => {
          set({
            tasks: get().tasks.map((task) =>
              task.id === id ? { ...task, status, updatedAt: new Date().toISOString() } : task
            ),
          });
          sync();
        },
        loadFromServer: async () => {
          const tasks = await loadTasksFromServer();
          if (tasks) set({ tasks });
        },
      };
    },
    {
      name: "travelops-tasks-store",
      storage,
    }
  )
);
