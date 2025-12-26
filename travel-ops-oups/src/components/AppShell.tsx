'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Moon,
  PlusCircle,
  PlusSquare,
  Sun,
  Telescope,
  Users,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./command/CommandPalette";
import ShortcutsHelp from "./command/ShortcutsHelp";
import { useCommandPalette } from "./command/useCommandPalette";
import { ToastProvider } from "./ui/toast";
import { useBookingStore } from "../stores/useBookingStore";
import { useCrmStore } from "../stores/useCrmStore";
import { useMarketingStore } from "../stores/useMarketingStore";
import { usePackageStore } from "../stores/usePackageStore";
import { useResolvedTheme } from "../hooks/useResolvedTheme";
import { useTaskStore } from "../stores/useTaskStore";
import { useUiStore } from "../stores/useUiStore";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadPackages = usePackageStore((state) => state.loadFromServer);
  const loadBookings = useBookingStore((state) => state.loadFromServer);
  const loadCrm = useCrmStore((state) => state.loadFromServer);
  const loadTasks = useTaskStore((state) => state.loadFromServer);
  const loadMarketing = useMarketingStore((state) => state.loadFromServer);
  const { toggleTheme } = useUiStore();
  const resolvedTheme = useResolvedTheme();
  const router = useRouter();

  const commands = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Go to Dashboard",
        group: "Navigation",
        icon: <LayoutDashboard className="h-4 w-4" />,
        action: () => void router.push("/dashboard"),
      },
      {
        id: "sales",
        label: "Go to Sales",
        group: "Navigation",
        icon: <ListChecks className="h-4 w-4" />,
        action: () => void router.push("/sales"),
      },
      {
        id: "packages",
        label: "Go to Packages",
        group: "Navigation",
        icon: <Briefcase className="h-4 w-4" />,
        action: () => void router.push("/packages"),
      },
      {
        id: "crm",
        label: "Go to CRM",
        group: "Navigation",
        icon: <Users className="h-4 w-4" />,
        action: () => void router.push("/crm"),
      },
      {
        id: "tasks",
        label: "Go to Tasks",
        group: "Navigation",
        icon: <ClipboardList className="h-4 w-4" />,
        action: () => void router.push("/tasks"),
      },
      {
        id: "marketing",
        label: "Go to Marketing",
        group: "Navigation",
        icon: <Megaphone className="h-4 w-4" />,
        action: () => void router.push("/marketing"),
      },
      {
        id: "ops",
        label: "Go to Ops",
        group: "Navigation",
        icon: <Telescope className="h-4 w-4" />,
        action: () => void router.push("/ops"),
      },
      {
        id: "create-package",
        label: "Create package",
        group: "Create",
        icon: <PlusSquare className="h-4 w-4" />,
        keywords: ["offer", "new"],
        action: () => void router.push("/packages/new"),
      },
      {
        id: "create-booking",
        label: "Create booking",
        group: "Create",
        icon: <PlusCircle className="h-4 w-4" />,
        keywords: ["reservation"],
        action: () => void router.push("/sales"),
      },
      {
        id: "toggle-theme",
        label: `Toggle theme (${resolvedTheme === "dark" ? "light" : "dark"})`,
        group: "Tools",
        icon: resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        keywords: ["mode", "color"],
        action: () => toggleTheme(),
      },
    ],
    [router, toggleTheme, resolvedTheme]
  );
  const palette = useCommandPalette(commands);
  const paletteIsOpen = palette.isOpen;
  const paletteClose = palette.close;

  useEffect(() => {
    void loadPackages();
    void loadBookings();
    void loadCrm();
    void loadTasks();
    void loadMarketing();

    const node = containerRef.current;
    if (!node) return;

    const syncInertState = () => {
      const isAriaHidden =
        node.getAttribute("aria-hidden") === "true" || node.getAttribute("data-aria-hidden") === "true";
      if (isAriaHidden) {
        node.setAttribute("inert", "true");
      } else {
        node.removeAttribute("inert");
      }
    };

    syncInertState();
    const observer = new MutationObserver(syncInertState);
    observer.observe(node, { attributes: true, attributeFilter: ["aria-hidden", "data-aria-hidden"] });
    return () => observer.disconnect();
  }, [loadBookings, loadPackages, loadCrm, loadTasks, loadMarketing]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "?" && !event.ctrlKey && !event.metaKey && !isEditable) {
        event.preventDefault();
        if (paletteIsOpen) {
          paletteClose();
        }
        setShortcutsOpen(true);
      } else if (event.key === "Escape" && shortcutsOpen) {
        setShortcutsOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [paletteClose, paletteIsOpen, shortcutsOpen]);

  return (
    <ToastProvider>
      <div ref={containerRef} className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-slate-900/15 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main
            id="main-content"
            role="main"
            className="flex-1 min-h-0 overflow-y-auto px-6 py-6 lg:px-8"
          >
            <div className="w-full max-w-7xl 2xl:max-w-none">{children}</div>
          </main>
        </div>
        <CommandPalette
          isOpen={palette.isOpen}
          query={palette.query}
          setQuery={palette.setQuery}
          filteredCommands={palette.filteredCommands}
          highlightedIndex={palette.highlightedIndex}
          handleInputKeyDown={palette.handleInputKeyDown}
          close={palette.close}
          selectCommand={palette.selectCommand}
        />
        <ShortcutsHelp isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      </div>
    </ToastProvider>
  );
}
