"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap, Users, X } from "lucide-react";

export default function GamesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentGroup, setCurrentGroup] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(user));
    
    // Check if there's a current group
    const group = localStorage.getItem("currentGroup");
    if (group) {
      setCurrentGroup(JSON.parse(group));
    }
  }, [router]);

  const clearGroup = () => {
    localStorage.removeItem("currentGroup");
    setCurrentGroup(null);
  };

  const games = [
    {
      id: "taboo",
      name: "TABOO",
      description: "Get your team to guess words without saying them!",
      icon: "🚫",
      color: "pink",
      players: "2+ Teams",
    },
    {
      id: "jeopardy",
      name: "JEOPARDY",
      description: "Pick categories & test your trivia knowledge!",
      icon: "🎯",
      color: "yellow",
      players: "2+ Teams",
    },
    {
      id: "monopoly",
      name: "MONOPOLY",
      description: "Buy properties, collect rent & bankrupt your friends!",
      icon: "🎩",
      color: "green",
      players: "2-6 Players",
    },
    {
      id: "codenames",
      name: "CODENAMES",
      description: "Give clues to help your team find all your words first!",
      icon: "🔍",
      color: "cyan",
      players: "2 Teams",
    },
    {
      id: "werewolf",
      name: "WEREWOLF",
      description: "Find the imposters! A social deduction game of trust and betrayal.",
      icon: "🐺",
      color: "red",
      players: "5-8 Players",
    },
    {
      id: "ludo",
      name: "LUDO",
      description: "Race your tokens around the board to victory!",
      icon: "🎲",
      color: "purple",
      players: "2-4 Players",
    },
  ];

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
          <h1 className="pixel-font text-2xl sm:text-3xl md:text-5xl font-bold text-pink-400 neon-glow-pink mb-2 sm:mb-4 text-3d float-3d animate-glow-pulse">
            GAME SELECT
          </h1>
          <p className="text-sm sm:text-base text-cyan-300 animate-fade-in-up delay-300">
            Choose your game, <span className="text-yellow-400 animate-heartbeat">{currentUser.name}</span>!
          </p>
        </div>

        {/* Current Group Display */}
        {currentGroup && (
          <div className="neon-card neon-box-purple p-4 mb-6 card-3d animate-slide-fade-in delay-400">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 animate-fade-in-left">
                <Users className="w-5 h-5 text-purple-400 animate-pulse" />
                <div>
                  <div className="text-purple-400 font-bold">Playing with Group: {currentGroup.name}</div>
                  <div className="text-cyan-300/70 text-sm">
                    {currentGroup.members.length + 1} member{currentGroup.members.length !== 0 ? "s" : ""}
                  </div>
                </div>
              </div>
              <button
                onClick={clearGroup}
                className="neon-btn neon-btn-red px-4 py-2 text-sm font-bold flex items-center gap-2 btn-3d hover:animate-shake"
              >
                <X className="w-4 h-4" />
                LEAVE GROUP
              </button>
            </div>
          </div>
        )}

        {/* Group Selection Prompt */}
        {!currentGroup && (
          <div className="neon-card neon-box-cyan p-4 mb-6 card-3d animate-slide-fade-in delay-400">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 animate-fade-in-left">
                <Users className="w-5 h-5 text-cyan-400 animate-pulse" />
                <div>
                  <div className="text-cyan-400 font-bold">Want to play with a group?</div>
                  <div className="text-cyan-300/70 text-sm">Create or join a group to play together!</div>
                </div>
              </div>
              <Link
                href="/groups"
                className="neon-btn neon-btn-purple px-4 py-2 text-sm font-bold flex items-center gap-2 btn-3d hover:animate-pulse-glow"
              >
                <Users className="w-4 h-4" />
                GO TO GROUPS
              </Link>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 grid-3d">
          {games.map((game, index) => {
            const colorClasses: Record<string, { box: string; text: string; glow: string }> = {
              pink: { box: "neon-box-pink", text: "text-pink-400", glow: "neon-glow-pink" },
              yellow: { box: "neon-box-yellow", text: "text-yellow-400", glow: "neon-glow-yellow" },
              cyan: { box: "neon-box-cyan", text: "text-cyan-400", glow: "neon-glow-cyan" },
              green: { box: "neon-box-green", text: "text-green-400", glow: "neon-glow-green" },
              red: { box: "neon-box-red", text: "text-red-400", glow: "neon-glow-red" },
              purple: { box: "neon-box-purple", text: "text-purple-400", glow: "neon-glow-purple" },
            };
            const colors = colorClasses[game.color] || colorClasses.pink;
            const delay = (index + 1) * 0.1;
            
            return (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="group relative block"
              >
                <div className={`neon-card ${colors.box} p-4 sm:p-6 lg:p-8 h-full active:scale-95 transition-all duration-300 min-h-[200px] sm:min-h-[240px] game-card-3d grid-item-3d card-3d-enhanced card-enter hover:animate-pulse-glow`} style={{ animationDelay: `${delay}s` }}>
                  <div className="text-center space-y-2 sm:space-y-4">
                    <div className="text-5xl sm:text-6xl lg:text-7xl mb-2 sm:mb-4 float-3d icon-3d animate-bounce-in">{game.icon}</div>
                    <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${colors.text} pixel-font text-xs sm:text-sm ${colors.glow} text-3d animate-fade-in-up`}>
                      {game.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-cyan-300/70 px-2 animate-fade-in delay-200">{game.description}</p>
                    <div className="flex items-center justify-center gap-2 text-yellow-400 text-xs sm:text-sm animate-fade-in delay-300">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 animate-spin-pulse" />
                      {game.players}
                    </div>
                    <div className="neon-btn neon-btn-green w-full mt-2 sm:mt-4 text-center min-h-[44px] text-xs sm:text-sm btn-3d hover:animate-button-press">
                      PLAY NOW →
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Coming Soon Cards */}
          {[1, 2, 3].map((i) => (
            <div
              key={`coming-${i}`}
              className="neon-card border-2 border-gray-700 p-4 sm:p-6 lg:p-8 opacity-50 min-h-[200px] sm:min-h-[240px] animate-fade-in"
              style={{ animationDelay: `${(games.length + i) * 0.1}s` }}
            >
              <div className="text-center space-y-2 sm:space-y-4">
                <div className="text-5xl sm:text-6xl lg:text-7xl mb-2 sm:mb-4 grayscale animate-pulse">❓</div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-500 pixel-font text-xs sm:text-sm">
                  COMING SOON
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">More games on the way!</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
