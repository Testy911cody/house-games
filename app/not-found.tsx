"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import TeamDetailClient to handle team routes in 404
const TeamDetailClient = dynamic(() => import("./teams/[id]/TeamDetailClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-cyan-400">Loading team...</div>
    </div>
  ),
});

export default function NotFound() {
  const pathname = usePathname();
  const [isTeamRoute, setIsTeamRoute] = useState(false);

  useEffect(() => {
    // Check if this is a team route that should be handled client-side
    if (pathname?.startsWith("/teams/")) {
      const id = pathname.split("/teams/")[1]?.split("/")[0];
      if (id && id !== "create" && id !== "placeholder") {
        setIsTeamRoute(true);
        return;
      }
    }
    setIsTeamRoute(false);
  }, [pathname]);

  // If it's a team route, render the team detail component
  // TeamDetailClient will extract teamId from URL pathname as fallback
  if (isTeamRoute) {
    return <TeamDetailClient />;
  }

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

