"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

export default function HomeButton() {
  const pathname = usePathname();
  
  // Hide on home page
  if (pathname === "/") {
    return null;
  }

  return (
    <Link
      href="/"
      className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 inline-flex items-center gap-2 text-cyan-400 active:opacity-80 font-semibold neon-glow-cyan min-h-[44px] px-4 py-2 rounded-lg bg-gray-900/80 backdrop-blur-sm border border-cyan-500/50 hover:border-cyan-400 hover:animate-pulse-glow transition-all animate-fade-in"
      title="Home"
    >
      <Home className="w-5 h-5 sm:w-6 sm:h-6 animate-fade-in-right" />
      <span className="text-sm sm:text-base pixel-font">HOME</span>
    </Link>
  );
}

