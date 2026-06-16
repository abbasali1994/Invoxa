"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/AppShell";

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname.startsWith("/login/");

  if (isLoginPage) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}
