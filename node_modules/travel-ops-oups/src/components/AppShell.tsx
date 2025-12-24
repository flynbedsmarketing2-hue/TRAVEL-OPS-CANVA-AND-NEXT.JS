'use client';

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useBookingStore } from "../stores/useBookingStore";
import { useCrmStore } from "../stores/useCrmStore";
import { useMarketingStore } from "../stores/useMarketingStore";
import { usePackageStore } from "../stores/usePackageStore";
import { useTaskStore } from "../stores/useTaskStore";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadPackages = usePackageStore((state) => state.loadFromServer);
  const loadBookings = useBookingStore((state) => state.loadFromServer);
  const loadCrm = useCrmStore((state) => state.loadFromServer);
  const loadTasks = useTaskStore((state) => state.loadFromServer);
  const loadMarketing = useMarketingStore((state) => state.loadFromServer);

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

  return (
    <div ref={containerRef} className="flex min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-900/15 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main id="main-content" role="main" className="flex-1 px-4 py-6 lg:px-6">
          <div className="mx-auto w-full max-w-7xl 2xl:max-w-none">{children}</div>
        </main>
      </div>
    </div>
  );
}
