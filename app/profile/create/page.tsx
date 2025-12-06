"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Zap } from "lucide-react";

export default function CreateProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    if (name.length > 20) {
      setError("Name must be 20 characters or less");
      return;
    }

    const existingProfiles = JSON.parse(
      localStorage.getItem("profiles") || "[]"
    );

    if (existingProfiles.some((p: any) => p.name.toLowerCase() === name.toLowerCase())) {
      setError("A profile with this name already exists");
      return;
    }

    const newProfile = {
      id: `profile_${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      stats: {
        taboo: {
          gamesPlayed: 0,
          bestScore: 0,
          totalCorrect: 0,
        },
      },
    };

    existingProfiles.push(newProfile);
    localStorage.setItem("profiles", JSON.stringify(existingProfiles));
    localStorage.setItem("currentUser", JSON.stringify(newProfile));
    router.push("/");
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-semibold neon-glow-cyan"
        >
          <ArrowLeft className="w-5 h-5" />
          BACK TO HOME
        </Link>

        <div className="neon-card neon-box-pink p-8">
          <div className="text-center mb-8">
            <h1 className="pixel-font text-2xl md:text-3xl font-bold text-pink-400 neon-glow-pink mb-4">
              CREATE PROFILE
            </h1>
            <p className="text-cyan-300">
              Enter your name to save your progress!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-lg font-semibold text-cyan-400 mb-3"
              >
                PLAYER NAME
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Enter your name..."
                className="w-full px-6 py-4 rounded-xl bg-black/50 border-2 border-cyan-500 text-cyan-300 text-xl focus:outline-none focus:border-pink-500 focus:shadow-[0_0_20px_rgba(255,0,255,0.5)] transition-all"
                maxLength={20}
              />
              <div className="flex justify-between mt-2">
                <p className="text-sm text-cyan-500/50">
                  {name.length}/20 characters
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border-2 border-red-500 rounded-xl p-4 text-red-400 font-semibold neon-box-orange">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              className="neon-btn neon-btn-green w-full py-5 text-xl flex items-center justify-center gap-3"
            >
              <Zap className="w-6 h-6" />
              CREATE PROFILE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
