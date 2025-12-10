// Catch-all route for team pages - handles all team IDs including dynamic ones
import TeamDetailClient from "../[id]/TeamDetailClient";

export default function TeamCatchAllPage() {
  return <TeamDetailClient />;
}

