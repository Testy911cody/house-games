"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Users } from "lucide-react";

export default function CreateTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const generateTeamCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a team name");
      return;
    }

    if (name.length > 30) {
      setError("Team name must be 30 characters or less");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.id) {
      setError("Please log in first");
      router.push("/");
      return;
    }

    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");

    // Check for duplicate names (case-insensitive)
    if (allTeams.some((t: any) => t.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("A team with this name already exists");
      return;
    }

    // Generate unique code (always uppercase)
    let code = generateTeamCode().toUpperCase();
    while (allTeams.some((t: any) => (t.code || "").toUpperCase() === code)) {
      code = generateTeamCode().toUpperCase();
    }

    const newTeam = {
      id: `team_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      code: code, // Always store in uppercase
      adminId: currentUser.id,
      adminName: currentUser.name,
      members: [],
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage first
    allTeams.push(newTeam);
    localStorage.setItem("teams", JSON.stringify(allTeams));

    // Try to sync to API for cross-device sharing BEFORE redirecting
    let syncSuccess = false;
    let syncError: string | null = null;
    try {
      const { teamsAPI } = await import('@/lib/api-utils');
      const { isSupabaseConfigured } = await import('@/lib/supabase');
      
      console.log("🔄 Attempting to sync team to Supabase...");
      console.log("   Team data:", JSON.stringify(newTeam, null, 2));
      console.log("   Supabase configured:", isSupabaseConfigured());
      
      if (!isSupabaseConfigured()) {
        syncError = "Supabase not configured. Team created locally only - it won't appear on other devices.";
        console.warn("⚠️", syncError);
      } else {
        console.log("   Calling teamsAPI.createTeam...");
        const result = await teamsAPI.createTeam(newTeam);
        
        console.log("   Result:", JSON.stringify(result, null, 2));
        
        if (result.success) {
          syncSuccess = true;
          // API sync successful - the team is now on the server
          console.log("✅ Team synced to Supabase successfully - visible across all browsers!");
          console.log("   Team ID:", newTeam.id);
          console.log("   Team Name:", newTeam.name);
          // Update admin activity immediately so team shows up
          teamsAPI.updateUserActivity(currentUser.id);
        } else {
          syncError = result.error || "Unknown error saving to Supabase";
          console.error("❌ API returned error:", syncError);
          console.error("   Team was saved locally but NOT to Supabase.");
          console.error("   It will NOT appear on other devices.");
          console.error("   Full error details:", JSON.stringify(result, null, 2));
        }
      }
    } catch (error: any) {
      // API failed, but continue with local storage
      syncError = error?.message || "Failed to sync to Supabase";
      console.error("❌ API sync failed, using local storage only:");
      console.error("   Error:", error);
      console.error("   Error message:", error?.message);
      console.error("   Error stack:", error?.stack);
    }

    // Show error message if sync failed
    if (!syncSuccess && syncError) {
      setError(`Team created locally, but failed to sync to server: ${syncError}. It may not appear on other devices.`);
      // Wait a bit so user can see the error
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Only redirect after sync attempt completes
    if (syncSuccess) {
      console.log("✅ Redirecting to team page...");
    } else {
      console.warn("⚠️ Redirecting despite sync failure - team may not appear on other devices");
    }
    router.push(`/teams/${newTeam.id}`);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-cyan-400 active:opacity-80 mb-4 sm:mb-8 font-semibold neon-glow-cyan min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">BACK TO TEAMS</span>
        </Link>

        <div className="text-center mb-6">
          <h1 className="pixel-font text-2xl sm:text-3xl md:text-5xl font-bold text-purple-400 neon-glow-purple mb-2">
            CREATE TEAM
          </h1>
          <p className="text-sm sm:text-base text-cyan-300">
            Start a new team to play games together!
          </p>
        </div>

        <div className="neon-card neon-box-purple p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-cyan-300 mb-2 font-semibold">
                Team Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Enter team name"
                maxLength={30}
                className="w-full px-4 py-3 bg-gray-800 border border-purple-500 rounded text-cyan-300 placeholder-cyan-500/50 focus:border-purple-400 focus:outline-none"
                required
              />
              <div className="text-xs text-cyan-300/50 mt-1">
                {name.length}/30 characters
              </div>
            </div>

            <div>
              <label className="block text-cyan-300 mb-2 font-semibold">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your team..."
                maxLength={200}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-purple-500 rounded text-cyan-300 placeholder-cyan-500/50 focus:border-purple-400 focus:outline-none resize-none"
              />
              <div className="text-xs text-cyan-300/50 mt-1">
                {description.length}/200 characters
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="neon-btn neon-btn-purple flex-1 py-3 text-lg font-bold flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                CREATE TEAM
              </button>
              <Link
                href="/teams"
                className="neon-btn neon-btn-red px-6 py-3 text-lg font-bold"
              >
                CANCEL
              </Link>
            </div>
          </form>
        </div>

        <div className="neon-card neon-box-cyan p-6 mt-6">
          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-cyan-400 font-bold mb-2">About Teams</h3>
              <ul className="text-cyan-300/70 text-sm space-y-1">
                <li>• You'll be the admin of your team</li>
                <li>• Share the team code to invite members</li>
                <li>• Anyone online can join your team</li>
                <li>• Play games together as a team</li>
                <li>• Manage members and team settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

