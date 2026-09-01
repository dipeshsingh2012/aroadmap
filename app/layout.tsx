import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "aroadmap.dev - AI-Native Product Roadmap & Autonomous SDLC Hub",
  description: "Continuous Product Discovery, Living PRDs, RICE Matrix, and Autonomous Agent SDLC for high-velocity software teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
