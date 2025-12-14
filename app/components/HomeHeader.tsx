"use client";

import { usePathname } from "next/navigation";

export default function HomeHeader() {
  const pathname = usePathname();
  
  // Only show on home page
  if (pathname !== "/") {
    return null;
  }

  return (
    <>
      <h1 className="pixel-font text-2xl sm:text-4xl md:text-6xl font-bold text-cyan-400 neon-glow-cyan mb-4 sm:mb-6 animate-glow-pulse text-center">
        HOUSE GAMES
      </h1>
    </>
  );
}
