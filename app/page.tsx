"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gamepad2, User, Users, Zap, UserCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleAnonymousLogin = () => {
    const anonymousUser = {
      id: `anon_${Date.now()}`,
      name: "Anonymous Guest",
      isAnonymous: true,
    };
    localStorage.setItem("currentUser", JSON.stringify(anonymousUser));
    setCurrentUser(anonymousUser);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 page-enter">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12 animate-fade-in-down">
          <div className="float">
            <h1 className="pixel-font text-2xl sm:text-4xl md:text-6xl font-bold text-cyan-400 neon-glow-cyan mb-4 sm:mb-6 animate-glow-pulse">
              HOUSE GAMES
            </h1>
          </div>
          <p className="text-base sm:text-xl text-pink-400 neon-glow-pink pixel-font text-xs sm:text-sm animate-fade-in delay-200">
            ★ NEON ARCADE ★
          </p>
          <div className="flex justify-center gap-1 sm:gap-2 mt-2 sm:mt-4">
            {['🎮', '🕹️', '👾', '🎯', '🏆'].map((emoji, i) => (
              <span key={i} className="text-2xl sm:text-3xl float animate-bounce-in" style={{ animationDelay: `${i * 0.2}s` }}>
                {emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="neon-card neon-box-cyan p-4 sm:p-8 animate-scale-in delay-300">
          {!currentUser ? (
            <div className="text-center space-y-4 sm:space-y-8 animate-fade-in delay-400">
              <p className="text-lg sm:text-xl text-cyan-300 mb-4 sm:mb-8 animate-fade-in-up delay-500">
                SELECT YOUR PLAY MODE
              </p>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <button
                  onClick={handleAnonymousLogin}
                  className="group relative bg-gradient-to-br from-green-900/50 to-green-950/50 border-2 border-green-500 p-6 sm:p-8 rounded-2xl transition-all active:scale-95 neon-box-green min-h-[140px] sm:min-h-[180px] card-enter animate-stagger-1 hover:animate-pulse-glow"
                >
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <Users className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 animate-rotate-in" />
                    <span className="text-lg sm:text-2xl font-bold text-green-400 pixel-font text-xs sm:text-sm">QUICK PLAY</span>
                    <span className="text-green-300/70 text-xs sm:text-sm">Jump in without an account</span>
                  </div>
                </button>
                <Link
                  href="/profile/create"
                  className="group relative bg-gradient-to-br from-pink-900/50 to-pink-950/50 border-2 border-pink-500 p-6 sm:p-8 rounded-2xl transition-all active:scale-95 neon-box-pink min-h-[140px] sm:min-h-[180px] card-enter animate-stagger-2 hover:animate-pulse-glow"
                >
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-pink-400 animate-rotate-in delay-200" />
                    <span className="text-lg sm:text-2xl font-bold text-pink-400 pixel-font text-xs sm:text-sm">CREATE PROFILE</span>
                    <span className="text-pink-300/70 text-xs sm:text-sm">Save your progress & stats</span>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 sm:space-y-8 animate-fade-in delay-400">
              <div className="mb-4 sm:mb-6 animate-bounce-in delay-500">
                <p className="text-xs sm:text-sm text-cyan-300/70 mb-2">WELCOME BACK</p>
                <p className="text-xl sm:text-3xl text-cyan-400 font-bold pixel-font neon-glow-cyan animate-glow-pulse">
                  {currentUser.name}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Link
                  href="/games"
                  className="group relative bg-gradient-to-br from-green-900/50 to-green-950/50 border-2 border-green-500 p-6 sm:p-8 rounded-2xl transition-all active:scale-95 neon-box-green min-h-[140px] sm:min-h-[180px] card-enter animate-stagger-1 hover:animate-pulse-glow"
                >
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <Gamepad2 className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 animate-rotate-in" />
                    <span className="text-lg sm:text-2xl font-bold text-green-400 pixel-font text-xs sm:text-sm">PLAY GAMES</span>
                  </div>
                </Link>
                <Link
                  href="/groups"
                  className="group relative bg-gradient-to-br from-purple-900/50 to-purple-950/50 border-2 border-purple-500 p-6 sm:p-8 rounded-2xl transition-all active:scale-95 neon-box-purple min-h-[140px] sm:min-h-[180px] card-enter animate-stagger-2 hover:animate-pulse-glow"
                >
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <UserCircle className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 animate-rotate-in delay-200" />
                    <span className="text-lg sm:text-2xl font-bold text-purple-400 pixel-font text-xs sm:text-sm">GROUPS</span>
                    <span className="text-purple-300/70 text-xs sm:text-sm">Play with friends</span>
                  </div>
                </Link>
                {!currentUser.isAnonymous && (
                  <Link
                    href="/profile"
                    className="group relative bg-gradient-to-br from-pink-900/50 to-pink-950/50 border-2 border-pink-500 p-6 sm:p-8 rounded-2xl transition-all active:scale-95 neon-box-pink min-h-[140px] sm:min-h-[180px] card-enter animate-stagger-3 hover:animate-pulse-glow"
                  >
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <User className="w-12 h-12 sm:w-16 sm:h-16 text-pink-400 animate-rotate-in delay-300" />
                      <span className="text-lg sm:text-2xl font-bold text-pink-400 pixel-font text-xs sm:text-sm">MY PROFILE</span>
                    </div>
                  </Link>
                )}
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("currentUser");
                  setCurrentUser(null);
                }}
                className="neon-btn neon-btn-yellow w-full mt-4 min-h-[48px] text-sm sm:text-base animate-fade-in-up delay-600 hover:animate-button-press"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2 animate-spin-pulse" />
                SWITCH USER / LOGOUT
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-8 animate-fade-in delay-700">
          <p className="text-cyan-500/50 text-xs sm:text-sm animate-pulse">
            ▸ INSERT COIN TO CONTINUE ◂
          </p>
        </div>
      </div>
    </div>
  );
}
