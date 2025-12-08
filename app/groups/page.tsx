"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Plus, Search, Crown, UserPlus, Copy, Check, RefreshCw } from "lucide-react";

interface GroupMember {
  id: string;
  name: string;
  joinedAt: string;
}

interface Group {
  id: string;
  name: string;
  code: string;
  adminId: string;
  adminName: string;
  members: GroupMember[];
  createdAt: string;
  description?: string;
}

export default function GroupsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
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
    
    // Load groups immediately when user is set
    if (userData) {
      loadGroups();
    }
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      loadGroups();
      // Auto-refresh groups every 5 seconds for multiplayer scenarios
      const refreshInterval = setInterval(() => {
        loadGroups();
      }, 5000);
      
      // Refresh when page becomes visible (user switches back to tab)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          loadGroups();
        }
      };
      
      // Refresh when window gains focus
      const handleFocus = () => {
        loadGroups();
      };
      
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleFocus);
      
      return () => {
        clearInterval(refreshInterval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("focus", handleFocus);
      };
    }
  }, [currentUser]);

  const loadGroups = async () => {
    // Show ALL available groups, not just user's groups
    try {
      // Try to fetch from API first (for cross-device sharing)
      let apiGroups: Group[] = [];
      try {
        const response = await fetch('/api/groups', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.groups)) {
            apiGroups = data.groups;
            setApiStatus("connected");
            console.log(`Loaded ${apiGroups.length} groups from API`);
          } else {
            setApiStatus("offline");
            console.log("API response invalid:", data);
          }
        } else {
          setApiStatus("offline");
          console.log("API response not OK:", response.status, response.statusText);
        }
      } catch (apiError) {
        // API failed, continue with localStorage
        setApiStatus("offline");
        console.log("API unavailable, using localStorage only:", apiError);
      }
      
      // Get local groups
      const localGroups = JSON.parse(localStorage.getItem("groups") || "[]");
      
      // Merge: combine API and local groups
      // If a group exists in both, prefer the one with more members (more up-to-date)
      const mergedGroups: Group[] = [];
      const allGroupIds = new Set<string>();
      
      // Add API groups first (these are the source of truth for cross-device)
      apiGroups.forEach((apiGroup: Group) => {
        if (apiGroup && apiGroup.id) {
          mergedGroups.push(apiGroup);
          allGroupIds.add(apiGroup.id);
        }
      });
      
      // Add local groups that aren't in API (for offline support)
      localGroups.forEach((localGroup: Group) => {
        if (localGroup && localGroup.id && !allGroupIds.has(localGroup.id)) {
          mergedGroups.push(localGroup);
        } else if (localGroup && localGroup.id) {
          // Group exists in both - prefer API version (it's the source of truth)
          // Only update if API version is missing data
          const existingIndex = mergedGroups.findIndex(g => g.id === localGroup.id);
          if (existingIndex >= 0) {
            const existing = mergedGroups[existingIndex];
            // Prefer API version, but merge members if local has more
            const localMemberCount = (localGroup.members?.length || 0) + 1;
            const apiMemberCount = (existing.members?.length || 0) + 1;
            if (localMemberCount > apiMemberCount && apiMemberCount === 1) {
              // Only if API version seems incomplete
              mergedGroups[existingIndex] = localGroup;
            }
          }
        }
      });
      
      // Sort by creation date (newest first)
      const sortedGroups = mergedGroups.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setGroups(sortedGroups);
      
      // Sync merged groups back to localStorage
      localStorage.setItem("groups", JSON.stringify(sortedGroups));
    } catch (error) {
      console.error("Error loading groups:", error);
      // Fallback to localStorage only
      try {
        const allGroups = JSON.parse(localStorage.getItem("groups") || "[]");
        const sortedGroups = [...allGroups].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setGroups(sortedGroups);
      } catch (e) {
        setGroups([]);
      }
    }
  };

  const joinGroupByCode = async (code: string) => {
    if (!currentUser) {
      setJoinError("Please log in first");
      return false;
    }

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode || trimmedCode.length !== 6) {
      setJoinError("Invalid group code");
      return false;
    }

    // Try API first
    try {
      const allGroups = JSON.parse(localStorage.getItem("groups") || "[]");
      const group = allGroups.find((g: Group) => {
        const storedCode = (g.code || "").trim().toUpperCase();
        return storedCode === trimmedCode;
      });

      if (!group) {
        // Try fetching from API
        const response = await fetch('/api/groups');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.groups) {
            const apiGroup = data.groups.find((g: Group) => {
              const storedCode = (g.code || "").trim().toUpperCase();
              return storedCode === trimmedCode;
            });
            
            if (apiGroup) {
              // Join via API
              const joinResponse = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'join',
                  groupId: apiGroup.id,
                  userId: currentUser.id,
                  userName: currentUser.name,
                }),
              });
              
              if (joinResponse.ok) {
                const joinData = await joinResponse.json();
                if (joinData.success) {
                  // Update localStorage
                  const updatedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
                  const index = updatedGroups.findIndex((g: Group) => g.id === apiGroup.id);
                  if (index >= 0) {
                    updatedGroups[index] = joinData.group;
                  } else {
                    updatedGroups.push(joinData.group);
                  }
                  localStorage.setItem("groups", JSON.stringify(updatedGroups));
                  loadGroups();
                  router.push(`/groups/${apiGroup.id}`);
                  return true;
                }
              }
            }
          }
        }
      } else {
        // Found in localStorage, join locally and sync to API
        if (group.members.some((m: GroupMember) => m.id === currentUser.id) || group.adminId === currentUser.id) {
          setJoinError("You are already a member of this group");
          return false;
        }

        // Add user to group
        group.members.push({
          id: currentUser.id,
          name: currentUser.name,
          joinedAt: new Date().toISOString(),
        });

        // Try to sync to API
        try {
          await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'join',
              groupId: group.id,
              userId: currentUser.id,
              userName: currentUser.name,
            }),
          });
        } catch (e) {
          // API failed, continue with local
        }

        localStorage.setItem("groups", JSON.stringify(allGroups));
        loadGroups();
        router.push(`/groups/${group.id}`);
        return true;
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }

    setJoinError("Group not found. Please check the code.");
    return false;
  };

  const handleJoinGroup = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setJoinError("");
    
    const trimmedCode = joinCode.trim().toUpperCase();
    if (!trimmedCode) {
      setJoinError("Please enter a group code");
      return;
    }

    if (trimmedCode.length !== 6) {
      setJoinError("Group code must be 6 characters");
      return;
    }

    const success = await joinGroupByCode(trimmedCode);
    if (success) {
      setJoinCode("");
    }
  };

  const handleQuickJoin = async (groupCode: string) => {
    setJoinError("");
    const success = await joinGroupByCode(groupCode);
    if (!success) {
      // Error is already set by joinGroupByCode
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.code.toLowerCase().includes(searchQuery.toLowerCase())
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
            👥 GROUPS
          </h1>
          <p className="text-sm sm:text-base text-cyan-300 animate-fade-in-up delay-300">
            Browse all available groups or create your own to play games together!
          </p>
          {apiStatus === "connected" && (
            <p className="text-xs text-green-400 mt-2">✓ Connected to server - groups sync across devices</p>
          )}
          {apiStatus === "offline" && (
            <p className="text-xs text-yellow-400 mt-2">⚠ Using local storage - groups only visible on this device</p>
          )}
        </div>

        {/* Create Group Button and Refresh */}
        <div className="mb-6 animate-scale-in delay-400 flex gap-3 flex-wrap">
          <Link
            href="/groups/create"
            className="block neon-btn neon-btn-purple flex-1 sm:flex-none sm:inline-block py-3 px-6 text-center text-lg font-bold hover:animate-pulse-glow"
          >
            <Plus className="w-5 h-5 inline mr-2 animate-rotate-in" />
            CREATE NEW GROUP
          </Link>
          <button
            onClick={async () => {
              await loadGroups();
              setSearchQuery("");
            }}
            className="neon-btn neon-btn-cyan py-3 px-6 text-lg font-bold hover:animate-pulse-glow flex items-center gap-2"
            title="Refresh groups list"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden sm:inline">REFRESH</span>
          </button>
        </div>

        {/* Join Group Section */}
        <div className="neon-card neon-box-cyan p-6 mb-6 animate-slide-fade-in delay-500">
          <h2 className="text-xl font-bold text-cyan-400 mb-4 pixel-font text-sm animate-fade-in-left">JOIN GROUP</h2>
          <form onSubmit={handleJoinGroup} className="flex gap-2 flex-col sm:flex-row animate-fade-in-up delay-600">
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
                  handleJoinGroup(e);
                }
              }}
              placeholder="Enter group code"
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
        {groups.length > 0 && (
          <div className="mb-6 animate-fade-in delay-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5 animate-pulse" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all available groups..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-cyan-500 rounded text-cyan-300 placeholder-cyan-500/50 input-3d focus:animate-pulse-glow"
              />
            </div>
            <div className="mt-2 text-sm text-cyan-300/70">
              Showing {filteredGroups.length} of {groups.length} available group{groups.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Groups List */}
        {filteredGroups.length === 0 ? (
          <div className="neon-card neon-box-yellow p-8 text-center animate-bounce-in delay-700">
            <Users className="w-16 h-16 mx-auto mb-4 text-yellow-400 animate-rotate-in" />
            <h3 className="text-xl font-bold text-yellow-400 mb-2 animate-fade-in-up">No Groups Yet</h3>
            <p className="text-cyan-300/70 mb-4 animate-fade-in-up delay-200">
              {groups.length === 0
                ? "Create your first group or join one with a code!"
                : "No groups match your search."}
            </p>
            <Link
              href="/groups/create"
              className="inline-block neon-btn neon-btn-purple px-6 py-3 hover:animate-button-press"
            >
              CREATE GROUP
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredGroups.map((group, index) => {
              const isAdmin = group.adminId === currentUser.id;
              const isMember = group.members.some((m: GroupMember) => m.id === currentUser.id) || isAdmin;
              const memberCount = group.members.length + 1; // +1 for admin
              const delay = (index + 1) * 0.1;


              return (
                <div
                  key={group.id}
                  className="neon-card neon-box-purple p-6 active:scale-95 transition-all card-enter hover:animate-pulse-glow relative"
                  style={{ animationDelay: `${delay}s` }}
                >
                  <Link
                    href={`/groups/${group.id}`}
                    className="block space-y-4"
                  >
                    <div className="flex items-start justify-between animate-fade-in-left">
                      <h3 className="text-xl font-bold text-purple-400 pixel-font text-sm flex-1">
                        {group.name}
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

                    {group.description && (
                      <p className="text-cyan-300/70 text-sm animate-fade-in-up delay-200">{group.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-purple-500/30 animate-fade-in-up delay-300">
                      <div className="flex items-center gap-2 text-cyan-300 text-sm">
                        <Users className="w-4 h-4 animate-pulse" />
                        <span>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-300 text-sm font-mono">{group.code}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyToClipboard(group.code);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors hover:animate-rotate-in"
                          title="Copy code"
                        >
                          {copiedCode === group.code ? (
                            <Check className="w-4 h-4 animate-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-cyan-300/50 animate-fade-in delay-400">
                      Admin: {group.adminName}
                    </div>
                  </Link>
                  
                  {!isMember && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuickJoin(group.code);
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

