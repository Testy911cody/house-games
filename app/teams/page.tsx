"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Plus, Search, Crown, UserPlus, Copy, Check, RefreshCw } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  joinedAt: string;
}

interface Team {
  id: string;
  name: string;
  code: string;
  adminId: string;
  adminName: string;
  members: TeamMember[];
  createdAt: string;
  description?: string;
}

export default function TeamsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"checking" | "connected" | "offline">("checking");

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    const userData = JSON.parse(user);
    setCurrentUser(userData);
    
    // Load teams immediately when user is set
    if (userData) {
      loadTeams();
    }
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      // Update user activity immediately
      const updateActivity = async () => {
        try {
          const { teamsAPI } = await import('@/lib/api-utils');
          teamsAPI.updateUserActivity(currentUser.id);
        } catch (e) {
          // Silently fail
        }
      };
      updateActivity();

      loadTeams();
      
      // Auto-refresh teams every 2 seconds for rapid multiplayer sync
      const refreshInterval = setInterval(() => {
        loadTeams();
        // Update user activity on each refresh
        updateActivity();
      }, 2000);
      
      // Cleanup inactive teams every 30 seconds
      const cleanupInterval = setInterval(async () => {
        try {
          const { teamsAPI } = await import('@/lib/api-utils');
          await teamsAPI.cleanupInactiveTeams();
          // Reload teams after cleanup
          loadTeams();
        } catch (e) {
          // Silently fail
        }
      }, 30000); // Every 30 seconds
      
      // Refresh when page becomes visible (user switches back to tab)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          loadTeams();
          updateActivity();
        }
      };
      
      // Refresh when window gains focus
      const handleFocus = () => {
        loadTeams();
        updateActivity();
      };
      
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleFocus);
      
      return () => {
        clearInterval(refreshInterval);
        clearInterval(cleanupInterval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("focus", handleFocus);
      };
    }
  }, [currentUser]);

  const loadTeams = async () => {
    // Show ALL available teams - anyone online can join
    try {
      // Try to fetch from client-side API utility first (for cross-device sharing)
      let apiTeams: Team[] = [];
      try {
        const { teamsAPI } = await import('@/lib/api-utils');
        const { isSupabaseConfigured } = await import('@/lib/supabase');
        
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
          console.warn("⚠️ Supabase not configured - teams will only sync locally. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for cross-browser sync.");
          setApiStatus("offline");
        } else {
          const data = await teamsAPI.getTeams();
          
          if (data.success && Array.isArray(data.teams)) {
            apiTeams = data.teams;
            setApiStatus("connected");
            console.log(`✅ Loaded ${apiTeams.length} teams from Supabase`);
          } else {
            setApiStatus("offline");
            console.log("API response invalid:", data);
          }
        }
      } catch (apiError) {
        // API failed, continue with localStorage
        setApiStatus("offline");
        console.error("❌ API unavailable, using localStorage only:", apiError);
      }
      
      // Get local teams
      const localTeams = JSON.parse(localStorage.getItem("teams") || "[]");
      
      // Merge: combine API and local teams
      // If a team exists in both, prefer the one with more members (more up-to-date)
      const mergedTeams: Team[] = [];
      const allTeamIds = new Set<string>();
      
      // Add API teams first (these are the source of truth for cross-device)
      apiTeams.forEach((apiTeam: Team) => {
        if (apiTeam && apiTeam.id) {
          mergedTeams.push(apiTeam);
          allTeamIds.add(apiTeam.id);
        }
      });
      
      // Add local teams that aren't in API (for offline support)
      localTeams.forEach((localTeam: Team) => {
        if (localTeam && localTeam.id && !allTeamIds.has(localTeam.id)) {
          mergedTeams.push(localTeam);
        } else if (localTeam && localTeam.id) {
          // Team exists in both - prefer API version (it's the source of truth)
          // Only update if API version is missing data
          const existingIndex = mergedTeams.findIndex(t => t.id === localTeam.id);
          if (existingIndex >= 0) {
            const existing = mergedTeams[existingIndex];
            // Prefer API version, but merge members if local has more
            const localMemberCount = (localTeam.members?.length || 0) + 1;
            const apiMemberCount = (existing.members?.length || 0) + 1;
            if (localMemberCount > apiMemberCount && apiMemberCount === 1) {
              // Only if API version seems incomplete
              mergedTeams[existingIndex] = localTeam;
            }
          }
        }
      });
      
      // Sort by creation date (newest first)
      const sortedTeams = mergedTeams.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setTeams(sortedTeams);
      
      // Sync merged teams back to localStorage
      localStorage.setItem("teams", JSON.stringify(sortedTeams));
    } catch (error) {
      console.error("Error loading teams:", error);
      // Fallback to localStorage only
      try {
        const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
        const sortedTeams = [...allTeams].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTeams(sortedTeams);
      } catch (e) {
        setTeams([]);
      }
    }
  };

  const joinTeamByCode = async (code: string) => {
    if (!currentUser) {
      setJoinError("Please log in first");
      return false;
    }

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode || trimmedCode.length !== 6) {
      setJoinError("Invalid team code");
      return false;
    }

    // Try API first
    try {
      const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
      const team = allTeams.find((t: Team) => {
        const storedCode = (t.code || "").trim().toUpperCase();
        return storedCode === trimmedCode;
      });

      if (!team) {
        // Try fetching from API
        const { teamsAPI } = await import('@/lib/api-utils');
        const data = await teamsAPI.getTeams();
        if (data.success && data.teams) {
          const apiTeam = data.teams.find((t: Team) => {
            const storedCode = (t.code || "").trim().toUpperCase();
            return storedCode === trimmedCode;
          });
          
          if (apiTeam) {
            // Join via API - anyone online can join
            const updatedMembers = [...(apiTeam.members || []), {
              id: currentUser.id,
              name: currentUser.name,
              joinedAt: new Date().toISOString(),
            }];
            
            const joinData = await teamsAPI.updateTeam(apiTeam.id, { members: updatedMembers });
            if (joinData.success && joinData.team) {
              // Update localStorage
              const updatedTeams = JSON.parse(localStorage.getItem("teams") || "[]");
              const index = updatedTeams.findIndex((t: Team) => t.id === apiTeam.id);
              if (index >= 0) {
                updatedTeams[index] = joinData.team;
              } else {
                updatedTeams.push(joinData.team);
              }
              localStorage.setItem("teams", JSON.stringify(updatedTeams));
              loadTeams();
              router.push(`/teams/${apiTeam.id}`);
              return true;
            }
          }
        }
      } else {
        // Found in localStorage, join locally and sync to API
        if (team.members.some((m: TeamMember) => m.id === currentUser.id) || team.adminId === currentUser.id) {
          setJoinError("You are already a member of this team");
          return false;
        }

        // Add user to team - anyone can join
        team.members.push({
          id: currentUser.id,
          name: currentUser.name,
          joinedAt: new Date().toISOString(),
        });

        // Try to sync to API immediately
        try {
          const { teamsAPI } = await import('@/lib/api-utils');
          const updateResult = await teamsAPI.updateTeam(team.id, { members: team.members });
          
          if (updateResult.success && updateResult.team) {
            // Update with API response
            const updatedTeams = JSON.parse(localStorage.getItem("teams") || "[]");
            const index = updatedTeams.findIndex((t: Team) => t.id === team.id);
            if (index >= 0) {
              updatedTeams[index] = updateResult.team;
            } else {
              updatedTeams.push(updateResult.team);
            }
            localStorage.setItem("teams", JSON.stringify(updatedTeams));
            loadTeams(); // Immediate reload
            router.push(`/teams/${team.id}`);
            return true;
          }
        } catch (e) {
          // API failed, continue with local
        }

        localStorage.setItem("teams", JSON.stringify(allTeams));
        loadTeams(); // Immediate reload
        router.push(`/teams/${team.id}`);
        return true;
      }
    } catch (error) {
      console.error("Error joining team:", error);
    }

    setJoinError("Team not found. Please check the code.");
    return false;
  };

  const handleJoinTeam = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setJoinError("");
    
    const trimmedCode = joinCode.trim().toUpperCase();
    if (!trimmedCode) {
      setJoinError("Please enter a team code");
      return;
    }

    if (trimmedCode.length !== 6) {
      setJoinError("Team code must be 6 characters");
      return;
    }

    const success = await joinTeamByCode(trimmedCode);
    if (success) {
      setJoinCode("");
    }
  };

  const handleQuickJoin = async (teamCode: string) => {
    setJoinError("");
    const success = await joinTeamByCode(teamCode);
    if (!success) {
      // Error is already set by joinTeamByCode
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 page-enter">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-cyan-400 active:opacity-80 mb-4 sm:mb-8 font-semibold neon-glow-cyan min-h-[44px] animate-fade-in-left hover:animate-pulse-glow"
        >
          <ArrowLeft className="w-5 h-5 animate-fade-in-right" />
          <span className="text-sm sm:text-base">BACK TO HOME</span>
        </Link>

        <div className="text-center mb-6 sm:mb-12 animate-fade-in-down delay-200">
          <h1 className="pixel-font text-2xl sm:text-3xl md:text-5xl font-bold text-purple-400 neon-glow-purple mb-2 sm:mb-4 animate-glow-pulse">
            👥 TEAMS
          </h1>
          <p className="text-sm sm:text-base text-cyan-300 animate-fade-in-up delay-300">
            Browse all available teams or create your own to play games together! Anyone online can join a team.
          </p>
          {apiStatus === "connected" && (
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
              <span>✓</span> Connected to Supabase - teams sync across all browsers
            </p>
          )}
          {apiStatus === "offline" && (
            <div className="text-xs text-yellow-400 mt-2 space-y-1">
              <p className="flex items-center gap-1">
                <span>⚠</span> Local storage only - teams won't sync across browsers
              </p>
              <p className="text-yellow-500/70 text-[10px]">
                Set up Supabase for cross-browser sync (see console for details)
              </p>
            </div>
          )}
        </div>

        {/* Create Team Button and Refresh */}
        <div className="mb-6 animate-scale-in delay-400 flex gap-3 flex-wrap">
          <Link
            href="/teams/create"
            className="block neon-btn neon-btn-purple flex-1 sm:flex-none sm:inline-block py-3 px-6 text-center text-lg font-bold hover:animate-pulse-glow"
          >
            <Plus className="w-5 h-5 inline mr-2 animate-rotate-in" />
            CREATE NEW TEAM
          </Link>
          <button
            onClick={async () => {
              await loadTeams();
              setSearchQuery("");
            }}
            className="neon-btn neon-btn-cyan py-3 px-6 text-lg font-bold hover:animate-pulse-glow flex items-center gap-2"
            title="Refresh teams list"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden sm:inline">REFRESH</span>
          </button>
        </div>

        {/* Join Team Section */}
        <div className="neon-card neon-box-cyan p-6 mb-6 animate-slide-fade-in delay-500">
          <h2 className="text-xl font-bold text-cyan-400 mb-4 pixel-font text-sm animate-fade-in-left">JOIN TEAM</h2>
          <form onSubmit={handleJoinTeam} className="flex gap-2 flex-col sm:flex-row animate-fade-in-up delay-600">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                setJoinError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleJoinTeam(e);
                }
              }}
              placeholder="Enter team code"
              className="flex-1 px-4 py-3 bg-gray-800 border border-cyan-500 rounded text-cyan-300 placeholder-cyan-500/50 input-3d focus:animate-pulse-glow"
              maxLength={6}
              pattern="[A-Z0-9]{6}"
            />
            <button
              type="submit"
              className="neon-btn neon-btn-green px-6 py-3 font-bold hover:animate-button-press"
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              JOIN
            </button>
          </form>
          {joinError && (
            <div className="mt-2 text-red-400 text-sm animate-error">{joinError}</div>
          )}
        </div>

        {/* Search */}
        {teams.length > 0 && (
          <div className="mb-6 animate-fade-in delay-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5 animate-pulse" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all available teams..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-cyan-500 rounded text-cyan-300 placeholder-cyan-500/50 input-3d focus:animate-pulse-glow"
              />
            </div>
            <div className="mt-2 text-sm text-cyan-300/70">
              Showing {filteredTeams.length} of {teams.length} available team{teams.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Teams List */}
        {filteredTeams.length === 0 ? (
          <div className="neon-card neon-box-yellow p-8 text-center animate-bounce-in delay-700">
            <Users className="w-16 h-16 mx-auto mb-4 text-yellow-400 animate-rotate-in" />
            <h3 className="text-xl font-bold text-yellow-400 mb-2 animate-fade-in-up">No Teams Yet</h3>
            <p className="text-cyan-300/70 mb-4 animate-fade-in-up delay-200">
              {teams.length === 0
                ? "Create your first team or join one with a code!"
                : "No teams match your search."}
            </p>
            <Link
              href="/teams/create"
              className="inline-block neon-btn neon-btn-purple px-6 py-3 hover:animate-button-press"
            >
              CREATE TEAM
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTeams.map((team, index) => {
              const isAdmin = team.adminId === currentUser.id;
              const isMember = team.members.some((m: TeamMember) => m.id === currentUser.id) || isAdmin;
              const memberCount = team.members.length + 1; // +1 for admin
              const delay = (index + 1) * 0.1;


              return (
                <div
                  key={team.id}
                  className="neon-card neon-box-purple p-6 active:scale-95 transition-all card-enter hover:animate-pulse-glow relative"
                  style={{ animationDelay: `${delay}s` }}
                >
                  <Link
                    href={`/teams/${team.id}`}
                    className="block space-y-4"
                  >
                    <div className="flex items-start justify-between animate-fade-in-left">
                      <h3 className="text-xl font-bold text-purple-400 pixel-font text-sm flex-1">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isAdmin && (
                          <div title="You are the admin">
                            <Crown className="w-5 h-5 text-yellow-400 animate-bounce-in" />
                          </div>
                        )}
                        {isMember && !isAdmin && (
                          <div className="px-2 py-1 bg-green-500/20 border border-green-500 rounded text-xs text-green-400 font-bold">
                            MEMBER
                          </div>
                        )}
                        {!isMember && (
                          <div className="px-2 py-1 bg-cyan-500/20 border border-cyan-500 rounded text-xs text-cyan-400 font-bold">
                            JOIN
                          </div>
                        )}
                      </div>
                    </div>

                    {team.description && (
                      <p className="text-cyan-300/70 text-sm animate-fade-in-up delay-200">{team.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-purple-500/30 animate-fade-in-up delay-300">
                      <div className="flex items-center gap-2 text-cyan-300 text-sm">
                        <Users className="w-4 h-4 animate-pulse" />
                        <span>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-300 text-sm font-mono">{team.code}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyToClipboard(team.code);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors hover:animate-rotate-in"
                          title="Copy code"
                        >
                          {copiedCode === team.code ? (
                            <Check className="w-4 h-4 animate-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-cyan-300/50 animate-fade-in delay-400">
                      Admin: {team.adminName}
                    </div>
                  </Link>
                  
                  {!isMember && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuickJoin(team.code);
                      }}
                      className="w-full mt-4 neon-btn neon-btn-green py-2 px-4 text-sm font-bold hover:animate-button-press"
                    >
                      <UserPlus className="w-4 h-4 inline mr-2" />
                      QUICK JOIN
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

