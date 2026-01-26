"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Trophy, Gamepad2, Plus, Zap } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    const userData = JSON.parse(user);
    if (userData.isAnonymous) {
      router.push("/");
      return;
    }
    setCurrentUser(userData);

    const allProfiles = JSON.parse(localStorage.getItem("profiles") || "[]");
    setProfiles(allProfiles);
  }, [router]);

  const switchProfile = (profile: any) => {
    localStorage.setItem("currentUser", JSON.stringify(profile));
    setCurrentUser(profile);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-semibold neon-glow-cyan"
        >
          <ArrowLeft className="w-5 h-5" />
          BACK TO HOME
        </Link>

        <div className="space-y-8">
          {/* Current Profile */}
          <div className="neon-card neon-box-pink p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center neon-box-pink">
                <User className="w-12 h-12 text-white" />
              </div>
              <h1 className="pixel-font text-2xl md:text-3xl font-bold text-pink-400 neon-glow-pink mb-2">
                {currentUser.name}
              </h1>
              <p className="text-cyan-300/70 text-sm">
                Member since {new Date(currentUser.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-xl p-4 text-center border-2 border-yellow-500/50 hover:neon-box-yellow transition-all">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-3xl font-bold text-yellow-400">
                  {currentUser.stats?.taboo?.gamesPlayed || 0}
                </div>
                <div className="text-sm text-yellow-300/70">Games Played</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 text-center border-2 border-green-500/50 hover:neon-box-green transition-all">
                <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-3xl font-bold text-green-400">
                  {currentUser.stats?.taboo?.bestScore || 0}
                </div>
                <div className="text-sm text-green-300/70">Best Score</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 text-center border-2 border-cyan-500/50 hover:neon-box-cyan transition-all">
                <Zap className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                <div className="text-3xl font-bold text-cyan-400">
                  {currentUser.stats?.taboo?.totalCorrect || 0}
                </div>
                <div className="text-sm text-cyan-300/70">Total Correct</div>
              </div>
            </div>
          </div>

          {/* Switch Profile */}
          {profiles.length > 1 && (
            <div className="neon-card neon-box-cyan p-8">
              <h2 className="text-xl font-bold text-cyan-400 mb-4 pixel-font text-sm">
                SWITCH PROFILE
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => switchProfile(profile)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      profile.id === currentUser.id
                        ? "bg-green-900/50 border-green-500 neon-box-green"
                        : "bg-black/30 border-gray-600 hover:border-cyan-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className={`w-6 h-6 ${profile.id === currentUser.id ? 'text-green-400' : 'text-gray-400'}`} />
                      <div className="text-left">
                        <div className={`font-bold ${profile.id === currentUser.id ? 'text-green-400' : 'text-gray-300'}`}>
                          {profile.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {profile.stats?.taboo?.gamesPlayed || 0} games
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create New Profile */}
          <Link
            href="/profile/create"
            className="block neon-btn neon-btn-pink w-full py-5 text-center text-xl"
          >
            <Plus className="w-6 h-6 inline mr-2" />
            CREATE NEW PROFILE
          </Link>
        </div>
      </div>
    </div>
  );
}
