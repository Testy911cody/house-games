"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Crown, UserPlus, Trash2, Edit2, Save, X, Copy, Check, Users, Gamepad2 } from "lucide-react";

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

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);

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
      loadTeam();
    }
  }, [teamId, currentUser]);

  const loadTeam = () => {
    if (!currentUser) return;
    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const foundTeam = allTeams.find((t: Team) => t.id === teamId);
    
    if (!foundTeam) {
      router.push("/teams");
      return;
    }

    // Allow anyone to view teams, but restrict editing to members/admins
    setTeam(foundTeam);
    setEditName(foundTeam.name);
    setEditDescription(foundTeam.description || "");
  };

  const handleJoinTeam = () => {
    if (!team || !currentUser) return;
    
    const isMember = team.members.some((m: TeamMember) => m.id === currentUser.id);
    const isAdmin = team.adminId === currentUser.id;
    
    if (isMember || isAdmin) {
      return; // Already a member
    }

    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const teamIndex = allTeams.findIndex((t: Team) => t.id === teamId);
    
    if (teamIndex === -1) return;

    // Add user to team - anyone online can join
    allTeams[teamIndex].members.push({
      id: currentUser.id,
      name: currentUser.name,
      joinedAt: new Date().toISOString(),
    });

    localStorage.setItem("teams", JSON.stringify(allTeams));
    loadTeam(); // Reload to update UI
  };

  const saveTeam = () => {
    if (!team) return;

    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const teamIndex = allTeams.findIndex((t: Team) => t.id === teamId);
    
    if (teamIndex === -1) return;

    allTeams[teamIndex].name = editName.trim();
    allTeams[teamIndex].description = editDescription.trim() || undefined;

    localStorage.setItem("teams", JSON.stringify(allTeams));
    setTeam(allTeams[teamIndex]);
    setIsEditing(false);
  };

  const deleteTeam = () => {
    if (!team) return;

    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const filteredTeams = allTeams.filter((t: Team) => t.id !== teamId);
    localStorage.setItem("teams", JSON.stringify(filteredTeams));
    router.push("/teams");
  };

  const removeMember = (memberId: string) => {
    if (!team) return;

    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const teamIndex = allTeams.findIndex((t: Team) => t.id === teamId);
    
    if (teamIndex === -1) return;

    allTeams[teamIndex].members = allTeams[teamIndex].members.filter(
      (m: TeamMember) => m.id !== memberId
    );

    localStorage.setItem("teams", JSON.stringify(allTeams));
    setTeam(allTeams[teamIndex]);
    setRemoveMemberId(null);
  };

  const copyCode = () => {
    if (team) {
      navigator.clipboard.writeText(team.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const startGame = () => {
    if (!team) return;
    // Store current team in localStorage for games to access
    localStorage.setItem("currentTeam", JSON.stringify(team));
    router.push("/games");
  };

  if (!currentUser || !team) {
    return null;
  }

  const isAdmin = team.adminId === currentUser.id;
  const isMember = team.members.some((m: TeamMember) => m.id === currentUser.id) || isAdmin;
  const memberCount = team.members.length + 1; // +1 for admin

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-cyan-400 active:opacity-80 mb-4 sm:mb-8 font-semibold neon-glow-cyan min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">BACK TO TEAMS</span>
        </Link>

        {/* Team Header */}
        <div className="neon-card neon-box-purple p-6 sm:p-8 mb-6">
          {!isEditing ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="pixel-font text-2xl sm:text-3xl font-bold text-purple-400 neon-glow-purple">
                      {team.name}
                    </h1>
                    {isAdmin && (
                      <Crown className="w-6 h-6 text-yellow-400" />
                    )}
                  </div>
                  {team.description && (
                    <p className="text-cyan-300/70 mb-4">{team.description}</p>
                  )}
                </div>
                {(isAdmin || isMember) && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors p-2"
                    title="Edit team"
                    disabled={!isAdmin}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Users className="w-4 h-4" />
                  <span>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-300 font-mono font-bold">{team.code}</span>
                  <button
                    onClick={copyCode}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    title="Copy code"
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-cyan-300/50 text-xs">
                  Created {new Date(team.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ) : (
            isAdmin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-cyan-300 mb-2 font-semibold">Team Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={30}
                    className="w-full px-4 py-2 bg-gray-800 border border-purple-500 rounded text-cyan-300"
                  />
                </div>
                <div>
                  <label className="block text-cyan-300 mb-2 font-semibold">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    maxLength={200}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800 border border-purple-500 rounded text-cyan-300 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveTeam}
                    className="neon-btn neon-btn-green px-4 py-2 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    SAVE
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(team.name);
                      setEditDescription(team.description || "");
                    }}
                    className="neon-btn neon-btn-red px-4 py-2 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    CANCEL
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Join/Play Game Button */}
        <div className="mb-6">
          {!isMember ? (
            <button
              onClick={handleJoinTeam}
              className="neon-btn neon-btn-green w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              JOIN THIS TEAM
            </button>
          ) : (
            <button
              onClick={startGame}
              className="neon-btn neon-btn-green w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              PLAY GAMES AS TEAM
            </button>
          )}
        </div>

        {/* Members List */}
        <div className="neon-card neon-box-cyan p-6 mb-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4 pixel-font text-sm flex items-center gap-2">
            <Users className="w-5 h-5" />
            MEMBERS ({memberCount})
          </h2>

          <div className="space-y-3">
            {/* Admin */}
            <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-500/50 rounded">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="font-bold text-yellow-400">{team.adminName}</div>
                  <div className="text-xs text-cyan-300/50">Admin</div>
                </div>
              </div>
            </div>

            {/* Members */}
            {team.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 border border-cyan-500/30 rounded"
              >
                <div>
                  <div className="font-bold text-cyan-300">{member.name}</div>
                  <div className="text-xs text-cyan-300/50">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                </div>
                {isAdmin && member.id !== currentUser.id && (
                  <div className="flex gap-2">
                    {removeMemberId === member.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => removeMember(member.id)}
                          className="text-red-400 hover:text-red-300 px-3 py-1 text-sm border border-red-500 rounded"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setRemoveMemberId(null)}
                          className="text-cyan-400 hover:text-cyan-300 px-3 py-1 text-sm border border-cyan-500 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRemoveMemberId(member.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="neon-card neon-box-red p-6">
            <h2 className="text-xl font-bold text-red-400 mb-4 pixel-font text-sm">
              DANGER ZONE
            </h2>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="neon-btn neon-btn-red px-6 py-3 font-bold flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                DELETE TEAM
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-300">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={deleteTeam}
                    className="neon-btn neon-btn-red px-6 py-3 font-bold"
                  >
                    YES, DELETE
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="neon-btn neon-btn-cyan px-6 py-3 font-bold"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

