'use client';

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useBookingStore } from "../stores/useBookingStore";
import { usePackageStore } from "../stores/usePackageStore";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadPackages = usePackageStore((state) => state.loadFromServer);
  const loadBookings = useBookingStore((state) => state.loadFromServer);

  useEffect(() => {
    void loadPackages();
    void loadBookings();

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
  }, [loadBookings, loadPackages]);

  return (
    <div ref={containerRef} className="flex min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main id="main-content" role="main" className="flex-1 px-4 py-6 lg:px-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
