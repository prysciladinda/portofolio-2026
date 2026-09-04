import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pryscila Dinda Eliana — Front-End Developer & AI Automation Engineer",
  description: "Official portfolio of Pryscila Dinda Eliana. Specialized in high-performance React & Next.js applications, UI/UX design systems, custom AI agent workflows, and n8n automations based in Tangerang, Indonesia.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
