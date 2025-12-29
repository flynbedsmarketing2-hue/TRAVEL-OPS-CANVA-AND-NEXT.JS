import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import AppShell from "../components/AppShell";
import ThemeProvider from "../components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-ibm-plex-mono",
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
    document.documentElement.classList.toggle("light", resolved === "light");
  } catch (error) {
    console.error(error);
  }
})();
`;

export const metadata: Metadata = {
  title: "TravelOPS",
  description: "Backoffice voyage Next.js local-only",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${ibmPlexMono.variable} min-h-screen transition-colors`}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
