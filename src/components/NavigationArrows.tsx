"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function NavigationArrows() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on dashboard as it's the root
  if (pathname === "/") return null;

  return (
    <div className="flex items-center gap-2 mb-6 -mt-2">
      <button 
        onClick={() => router.back()} 
        className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        title="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button 
        onClick={() => router.forward()} 
        className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        title="Go forward"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
