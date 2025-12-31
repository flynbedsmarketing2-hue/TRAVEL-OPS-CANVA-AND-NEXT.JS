# UX smoke checklist

1. Open the app and verify the sidebar shows only the four Primary links (Dashboard, Packages, Pricing, Tasks) up top.
2. Confirm that the remaining routes now live under a "More tools" section so the sidebar feels less crowded.
3. Toggle between two primary routes (e.g., Dashboard -> Packages) and check the active state underlines/highlights correctly.
4. On the dashboard, read the helper copy and happy-path card to ensure they explain the steps and surface the "Create product" CTA.
5. Click the dashboard CTA to go straight to `/packages/new` and verify the form loads (the button should be visible in the UI).
6. Visit the Packages page and see the expanded subtitle plus the "Create product" action in the header. Ensure the empty state still invites you to create a product when no records exist.
7. Visit the Pricing page and confirm the new header copy describes the wizard, plus the "Back to packages" action is in place.
8. Go to the Tasks page and verify the subtitle explains how filters keep work items actionable.
9. Apply filters (e.g., status + priority) so no rows match and confirm the empty state shows "Create task" and "Reset filters" buttons.
10. Jump between the happy-path pages (Dashboard -> Pricing -> Tasks) to ensure no route breaks and the sidebar navigation still loads each page.
