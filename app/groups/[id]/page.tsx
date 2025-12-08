"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Crown, UserPlus, Trash2, Edit2, Save, X, Copy, Check, Users, Gamepad2 } from "lucide-react";

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

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [group, setGroup] = useState<Group | null>(null);
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
      loadGroup();
    }
  }, [groupId, currentUser]);

  const loadGroup = () => {
    if (!currentUser) return;
    const allGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const foundGroup = allGroups.find((g: Group) => g.id === groupId);
    
    if (!foundGroup) {
      router.push("/groups");
      return;
    }

    // Allow anyone to view groups, but restrict editing to members/admins
    setGroup(foundGroup);
    setEditName(foundGroup.name);
    setEditDescription(foundGroup.description || "");
  };

  const handleJoinGroup = () => {
    if (!group || !currentUser) return;
    
    const isMember = group.members.some((m: GroupMember) => m.id === currentUser.id);
    const isAdmin = group.adminId === currentUser.id;
    
    if (isMember || isAdmin) {
      return; // Already a member
    }

    const allGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const groupIndex = allGroups.findIndex((g: Group) => g.id === groupId);
    
    if (groupIndex === -1) return;

    // Add user to group
    allGroups[groupIndex].members.push({
      id: currentUser.id,
      name: currentUser.name,
      joinedAt: new Date().toISOString(),
    });

    localStorage.setItem("groups", JSON.stringify(allGroups));
    loadGroup(); // Reload to update UI
  };

  const saveGroup = () => {
    if (!group) return;

    const allGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const groupIndex = allGroups.findIndex((g: Group) => g.id === groupId);
    
    if (groupIndex === -1) return;

    allGroups[groupIndex].name = editName.trim();
    allGroups[groupIndex].description = editDescription.trim() || undefined;

    localStorage.setItem("groups", JSON.stringify(allGroups));
    setGroup(allGroups[groupIndex]);
    setIsEditing(false);
  };

  const deleteGroup = () => {
    if (!group) return;

    const allGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const filteredGroups = allGroups.filter((g: Group) => g.id !== groupId);
    localStorage.setItem("groups", JSON.stringify(filteredGroups));
    router.push("/groups");
  };

  const removeMember = (memberId: string) => {
    if (!group) return;

    const allGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const groupIndex = allGroups.findIndex((g: Group) => g.id === groupId);
    
    if (groupIndex === -1) return;

    allGroups[groupIndex].members = allGroups[groupIndex].members.filter(
      (m: GroupMember) => m.id !== memberId
    );

    localStorage.setItem("groups", JSON.stringify(allGroups));
    setGroup(allGroups[groupIndex]);
    setRemoveMemberId(null);
  };

  const copyCode = () => {
    if (group) {
      navigator.clipboard.writeText(group.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const startGame = () => {
    if (!group) return;
    // Store current group in localStorage for games to access
    localStorage.setItem("currentGroup", JSON.stringify(group));
    router.push("/games");
  };

  if (!currentUser || !group) {
    return null;
  }

  const isAdmin = group.adminId === currentUser.id;
  const isMember = group.members.some((m: GroupMember) => m.id === currentUser.id) || isAdmin;
  const memberCount = group.members.length + 1; // +1 for admin

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/groups"
          className="inline-flex items-center gap-2 text-cyan-400 active:opacity-80 mb-4 sm:mb-8 font-semibold neon-glow-cyan min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">BACK TO GROUPS</span>
        </Link>

        {/* Group Header */}
        <div className="neon-card neon-box-purple p-6 sm:p-8 mb-6">
          {!isEditing ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="pixel-font text-2xl sm:text-3xl font-bold text-purple-400 neon-glow-purple">
                      {group.name}
                    </h1>
                    {isAdmin && (
                      <Crown className="w-6 h-6 text-yellow-400" />
                    )}
                  </div>
                  {group.description && (
                    <p className="text-cyan-300/70 mb-4">{group.description}</p>
                  )}
                </div>
                {(isAdmin || isMember) && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors p-2"
                    title="Edit group"
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
                  <span className="text-purple-300 font-mono font-bold">{group.code}</span>
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
                  Created {new Date(group.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ) : (
            isAdmin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-cyan-300 mb-2 font-semibold">Group Name</label>
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
                    onClick={saveGroup}
                    className="neon-btn neon-btn-green px-4 py-2 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    SAVE
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(group.name);
                      setEditDescription(group.description || "");
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
              onClick={handleJoinGroup}
              className="neon-btn neon-btn-green w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              JOIN THIS GROUP
            </button>
          ) : (
            <button
              onClick={startGame}
              className="neon-btn neon-btn-green w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              PLAY GAMES WITH GROUP
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
                  <div className="font-bold text-yellow-400">{group.adminName}</div>
                  <div className="text-xs text-cyan-300/50">Admin</div>
                </div>
              </div>
            </div>

            {/* Members */}
            {group.members.map((member) => (
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
                DELETE GROUP
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-300">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={deleteGroup}
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

