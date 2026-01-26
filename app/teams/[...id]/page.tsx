// Catch-all route for team pages - handles all team IDs including dynamic ones
import TeamDetailClient from "../[id]/TeamDetailClient";

export async function generateStaticParams() {
  // Return at least one placeholder ID for static export
  // Actual team pages will be handled via client-side routing
  // This satisfies Next.js requirement for static export with dynamic routes
  return [
    { id: ['placeholder'] }
  ];
}

export const dynamicParams = true;

export default function TeamCatchAllPage() {
  return <TeamDetailClient />;
}

