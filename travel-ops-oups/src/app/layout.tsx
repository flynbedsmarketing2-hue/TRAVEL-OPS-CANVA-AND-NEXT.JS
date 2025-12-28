import type { Metadata } from "next";
import { Fragment_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppShell from "../components/AppShell";
import ThemeProvider from "../components/ThemeProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fragment-mono",
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
  title: "Nouba Plus",
  description: "Backoffice voyage Next.js local-only",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${fragmentMono.variable} min-h-screen transition-colors`}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
