"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Users } from "lucide-react";

export default function CreateGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const generateGroupCode = (): string => {
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
      setError("Please enter a group name");
      return;
    }

    if (name.length > 30) {
      setError("Group name must be 30 characters or less");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.id) {
      setError("Please log in first");
      router.push("/");
      return;
    }

    const allGroups = JSON.parse(localStorage.getItem("groups") || "[]");

    // Check for duplicate names (case-insensitive)
    if (allGroups.some((g: any) => g.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("A group with this name already exists");
      return;
    }

    // Generate unique code (always uppercase)
    let code = generateGroupCode().toUpperCase();
    while (allGroups.some((g: any) => (g.code || "").toUpperCase() === code)) {
      code = generateGroupCode().toUpperCase();
    }

    const newGroup = {
      id: `group_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      code: code, // Always store in uppercase
      adminId: currentUser.id,
      adminName: currentUser.name,
      members: [],
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage first
    allGroups.push(newGroup);
    localStorage.setItem("groups", JSON.stringify(allGroups));

    // Try to sync to API for cross-device sharing
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          action: 'create',
          group: newGroup,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // API sync successful - the group is now on the server
          console.log("Group synced to server successfully");
        } else {
          console.log("API returned error:", data.error);
        }
      } else {
        console.log("API request failed with status:", response.status);
      }
    } catch (error) {
      // API failed, but continue with local storage
      console.log("API sync failed, using local storage only:", error);
    }

    router.push(`/groups/${newGroup.id}`);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/groups"
          className="inline-flex items-center gap-2 text-cyan-400 active:opacity-80 mb-4 sm:mb-8 font-semibold neon-glow-cyan min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">BACK TO GROUPS</span>
        </Link>

        <div className="text-center mb-6">
          <h1 className="pixel-font text-2xl sm:text-3xl md:text-5xl font-bold text-purple-400 neon-glow-purple mb-2">
            CREATE GROUP
          </h1>
          <p className="text-sm sm:text-base text-cyan-300">
            Start a new group to play games together!
          </p>
        </div>

        <div className="neon-card neon-box-purple p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-cyan-300 mb-2 font-semibold">
                Group Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Enter group name"
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
                placeholder="Describe your group..."
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
                CREATE GROUP
              </button>
              <Link
                href="/groups"
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
              <h3 className="text-cyan-400 font-bold mb-2">About Groups</h3>
              <ul className="text-cyan-300/70 text-sm space-y-1">
                <li>• You'll be the admin of your group</li>
                <li>• Share the group code to invite members</li>
                <li>• Play games together as a group</li>
                <li>• Manage members and group settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

