"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap, Users, X, MessageSquare, Send, Check } from "lucide-react";

export default function GamesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [suggestion, setSuggestion] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(user));
    
    // Check if there's a current team
    const team = localStorage.getItem("currentTeam");
    if (team) {
      setCurrentTeam(JSON.parse(team));
    }
  }, [router]);

  const clearTeam = () => {
    localStorage.removeItem("currentTeam");
    setCurrentTeam(null);
  };

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    const suggestions = JSON.parse(localStorage.getItem("game_suggestions") || "[]");
    const newSuggestion = {
      id: `suggestion_${Date.now()}`,
      text: suggestion.trim(),
      user: currentUser?.name || "Anonymous",
      userId: currentUser?.id || null,
      timestamp: new Date().toISOString(),
    };

    suggestions.push(newSuggestion);
    localStorage.setItem("game_suggestions", JSON.stringify(suggestions));

    setSuggestion("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const games = [
    {
      id: "codenames",
      name: "CODENAMES",
      description: "Give clues to help your team find all your words first!",
      icon: "🔍",
      color: "cyan",
      players: "2 Teams",
    },
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
      id: "drawguess",
      name: "DRAW & GUESS",
      description: "Take turns drawing words while others guess what you drew!",
      icon: "🎨",
      color: "purple",
      players: "2+ Players",
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
    {
      id: "pacman",
      name: "PACMAN",
      description: "Collect dots, avoid ghosts, and get the highest score!",
      icon: "👻",
      color: "yellow",
      players: "2-4 Players",
    },
    {
      id: "flappy",
      name: "NEON FLAP",
      description: "Multiplayer flappy bird - last bird flying wins!",
      icon: "🐦",
      color: "cyan",
      players: "2-4 Players",
    },
    {
      id: "tetris",
      name: "TETRIS",
      description: "Classic Tetris multiplayer - clear lines and compete for the highest score!",
      icon: "🧩",
      color: "cyan",
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

        {/* Current Team Display */}
        {currentTeam && (
          <div className="neon-card neon-box-purple p-4 mb-6 card-3d animate-slide-fade-in delay-400">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 animate-fade-in-left">
                <Users className="w-5 h-5 text-purple-400 animate-pulse" />
                <div>
                  <div className="text-purple-400 font-bold">Playing as Team: {currentTeam.name}</div>
                  <div className="text-cyan-300/70 text-sm">
                    {currentTeam.members.length + 1} member{currentTeam.members.length !== 0 ? "s" : ""}
                  </div>
                </div>
              </div>
              <button
                onClick={clearTeam}
                className="neon-btn neon-btn-red px-4 py-2 text-sm font-bold flex items-center gap-2 btn-3d hover:animate-shake"
              >
                <X className="w-4 h-4" />
                LEAVE TEAM
              </button>
            </div>
          </div>
        )}

        {/* Team Selection Prompt */}
        {!currentTeam && (
          <div className="neon-card neon-box-cyan p-4 mb-6 card-3d animate-slide-fade-in delay-400">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 animate-fade-in-left">
                <Users className="w-5 h-5 text-cyan-400 animate-pulse" />
                <div>
                  <div className="text-cyan-400 font-bold">Want to play as a team?</div>
                  <div className="text-cyan-300/70 text-sm">Create or join a team to play together!</div>
                </div>
              </div>
              <Link
                href="/teams"
                className="neon-btn neon-btn-purple px-4 py-2 text-sm font-bold flex items-center gap-2 btn-3d hover:animate-pulse-glow"
              >
                <Users className="w-4 h-4" />
                GO TO TEAMS
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

        {/* Suggestions Box */}
        <div className="mt-12 mb-8 animate-fade-in-up delay-500">
          <div className="neon-card neon-box-cyan p-4 sm:p-6 card-3d">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse" />
              <h3 className="text-lg sm:text-xl font-bold text-cyan-400 neon-glow-cyan">
                Have a Suggestion?
              </h3>
            </div>
            <p className="text-sm sm:text-base text-cyan-300/70 mb-4">
              Share your ideas for new games, features, or improvements!{" "}
              <Link
                href="/suggestions"
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
              >
                View all suggestions
              </Link>
            </p>
            <form onSubmit={handleSuggestionSubmit} className="space-y-4">
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Type your suggestion here..."
                className="w-full bg-black/40 border-2 border-cyan-500/50 rounded-lg p-3 sm:p-4 text-cyan-200 placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 min-h-[100px] sm:min-h-[120px] resize-y neon-glow-cyan/20"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-400/60">
                  {suggestion.length}/500 characters
                </span>
                <button
                  type="submit"
                  disabled={!suggestion.trim() || showSuccess}
                  className="neon-btn neon-btn-green px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold flex items-center gap-2 btn-3d hover:animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {showSuccess ? (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      SENT!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      SUBMIT
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
