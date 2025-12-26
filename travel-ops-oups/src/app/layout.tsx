import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "../components/AppShell";
import ThemeProvider from "../components/ThemeProvider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

const themeInitScript = `
(function () {
  try {
    const stored = window.localStorage.getItem("travelops-ui-store");
    const data = stored ? JSON.parse(stored) : null;
    const mode = data?.state?.theme ?? data?.theme ?? "system";
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");
    const resolved =
      mode === "system" ? (matcher.matches ? "dark" : "light") : mode;
    document.documentElement.classList.toggle("dark", resolved === "dark");
  } catch (error) {
    console.error(error);
  }
})();
`;

export const metadata: Metadata = {
  title: "TravelOps Platform",
  description: "Backoffice voyage Next.js local-only",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${notoSans.variable} min-h-screen transition-colors`}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
