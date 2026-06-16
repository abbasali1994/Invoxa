import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/CommandPalette";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/SessionProvider";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { NavigationArrows } from "@/components/NavigationArrows";
import { AppShell } from "@/components/AppShell";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Invoxa | AI-Native Financial Operations",
  description: "Financial operations platform for agencies and freelancers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Detect login page server-side to hide sidebar
  const headersList = headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isLoginPage = pathname === "/login" || pathname.startsWith("/login") || pathname.startsWith("/invite");

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-neutral-950 text-neutral-50 flex`}>
        <SessionProvider>
          <CommandPalette />
          <Toaster theme="dark" position="bottom-right" />

          {!isLoginPage && (
            <AppShell>{children}</AppShell>
          )}

          {isLoginPage && children}
        </SessionProvider>
      </body>
    </html>
  );
}
