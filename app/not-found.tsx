"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if this is a team route that should be handled client-side
    // For GitHub Pages static export, we need to handle dynamic routes here
    if (pathname?.startsWith("/teams/")) {
      const teamId = pathname.split("/teams/")[1]?.split("/")[0];
      if (teamId && teamId !== "create" && teamId !== "placeholder") {
        // Redirect to the team page using Next.js router
        // This will trigger client-side routing which will work
        router.replace(`/teams/${teamId}`);
        return;
      }
    }
  }, [pathname, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="pixel-font text-6xl font-bold text-red-400 neon-glow-red mb-4">
          404
        </h1>
        <p className="text-2xl text-cyan-300 mb-8">This page could not be found.</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="neon-btn neon-btn-cyan px-8 py-4 text-lg font-bold inline-block"
          >
            GO HOME
          </Link>
          <Link
            href="/teams"
            className="neon-btn neon-btn-purple px-8 py-4 text-lg font-bold inline-block"
          >
            VIEW TEAMS
          </Link>
        </div>
      </div>
    </div>
  );
}

