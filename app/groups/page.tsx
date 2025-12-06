"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Plus, Search, Crown, UserPlus, Copy, Check } from "lucide-react";

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

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    const userData = JSON.parse(user);
    setCurrentUser(userData);
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      loadGroups();
    }
  }, [currentUser]);

  const loadGroups = () => {
    if (!currentUser) return;
    const allGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    // Filter groups where current user is a member
    const userGroups = allGroups.filter((group: Group) =>
      group.members.some((m: GroupMember) => m.id === currentUser.id) ||
      group.adminId === currentUser.id
    );
    setGroups(userGroups);
  };

  const handleJoinGroup = () => {
    setJoinError("");
    if (!joinCode.trim()) {
      setJoinError("Please enter a group code");
      return;
    }

    const allGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const group = allGroups.find((g: Group) => g.code.toLowerCase() === joinCode.trim().toLowerCase());

    if (!group) {
      setJoinError("Group not found. Please check the code.");
      return;
    }

    // Check if user is already a member
    if (group.members.some((m: GroupMember) => m.id === currentUser.id) || group.adminId === currentUser.id) {
      setJoinError("You are already a member of this group");
      return;
    }

    // Add user to group
    group.members.push({
      id: currentUser.id,
      name: currentUser.name,
      joinedAt: new Date().toISOString(),
    });

    localStorage.setItem("groups", JSON.stringify(allGroups));
    setJoinCode("");
    loadGroups();
    router.push(`/groups/${group.id}`);
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
            Create or join groups to play games together!
          </p>
        </div>

        {/* Create Group Button */}
        <div className="mb-6 animate-scale-in delay-400">
          <Link
            href="/groups/create"
            className="block neon-btn neon-btn-purple w-full sm:w-auto sm:inline-block py-3 px-6 text-center text-lg font-bold hover:animate-pulse-glow"
          >
            <Plus className="w-5 h-5 inline mr-2 animate-rotate-in" />
            CREATE NEW GROUP
          </Link>
        </div>

        {/* Join Group Section */}
        <div className="neon-card neon-box-cyan p-6 mb-6 animate-slide-fade-in delay-500">
          <h2 className="text-xl font-bold text-cyan-400 mb-4 pixel-font text-sm animate-fade-in-left">JOIN GROUP</h2>
          <div className="flex gap-2 flex-col sm:flex-row animate-fade-in-up delay-600">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setJoinError("");
              }}
              placeholder="Enter group code"
              className="flex-1 px-4 py-3 bg-gray-800 border border-cyan-500 rounded text-cyan-300 placeholder-cyan-500/50 input-3d focus:animate-pulse-glow"
              maxLength={6}
            />
            <button
              onClick={handleJoinGroup}
              className="neon-btn neon-btn-green px-6 py-3 font-bold hover:animate-button-press"
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              JOIN
            </button>
          </div>
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
                placeholder="Search groups..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-cyan-500 rounded text-cyan-300 placeholder-cyan-500/50 input-3d focus:animate-pulse-glow"
              />
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
              const memberCount = group.members.length + 1; // +1 for admin
              const delay = (index + 1) * 0.1;

              return (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="neon-card neon-box-purple p-6 active:scale-95 transition-all card-enter hover:animate-pulse-glow"
                  style={{ animationDelay: `${delay}s` }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between animate-fade-in-left">
                      <h3 className="text-xl font-bold text-purple-400 pixel-font text-sm flex-1">
                        {group.name}
                      </h3>
                      {isAdmin && (
                        <Crown className="w-5 h-5 text-yellow-400 flex-shrink-0 ml-2 animate-bounce-in" />
                      )}
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
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

