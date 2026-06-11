import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/CommandPalette";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/SessionProvider";
import { ConditionalShell } from "@/components/ConditionalShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Settlr | AI-Native Financial Operations",
  description: "Financial operations platform for agencies and freelancers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-neutral-950 text-neutral-50 flex`}>
        <SessionProvider>
          <CommandPalette />
          <Toaster theme="dark" position="bottom-right" />
          <ConditionalShell>{children}</ConditionalShell>
        </SessionProvider>
      </body>
    </html>
  );
}
