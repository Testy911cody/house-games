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
    // Navigate to games page after setting user
    router.push("/games");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 page-enter relative">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12 animate-fade-in-down">
          {/* House Icon */}
          <div className="flex justify-center mb-4 sm:mb-6 float">
            <div className="relative">
              <svg 
                width="120" 
                height="120" 
                viewBox="0 0 120 120" 
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 animate-glow-pulse"
                style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 25px rgba(255, 0, 255, 0.6)) drop-shadow(0 0 35px rgba(0, 255, 0, 0.4))' }}
              >
                <defs>
                  <linearGradient id="treeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B4513" />
                    <stop offset="50%" stopColor="#A0522D" />
                    <stop offset="100%" stopColor="#654321" />
                  </linearGradient>
                  <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D2691E" />
                    <stop offset="50%" stopColor="#CD853F" />
                    <stop offset="100%" stopColor="#A0522D" />
                  </linearGradient>
                  <linearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B0000" />
                    <stop offset="50%" stopColor="#A52A2A" />
                    <stop offset="100%" stopColor="#6B0000" />
                  </linearGradient>
                </defs>
                
                {/* Tree trunk - thick and sturdy */}
                <rect x="50" y="70" width="20" height="40" fill="url(#treeGradient)" rx="2"/>
                <rect x="52" y="70" width="16" height="40" fill="#A0522D" opacity="0.6" rx="1"/>
                
                {/* Tree foliage - rounded and bushy */}
                <ellipse cx="60" cy="45" rx="35" ry="25" fill="#228B22" opacity="0.9"/>
                <ellipse cx="50" cy="50" rx="20" ry="18" fill="#32CD32" opacity="0.7"/>
                <ellipse cx="70" cy="50" rx="20" ry="18" fill="#32CD32" opacity="0.7"/>
                
                {/* Treehouse base - wooden planks */}
                <rect x="25" y="50" width="70" height="35" fill="url(#houseGradient)" stroke="#00ffff" strokeWidth="2" rx="2"/>
                <line x1="35" y1="50" x2="35" y2="85" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
                <line x1="45" y1="50" x2="45" y2="85" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
                <line x1="55" y1="50" x2="55" y2="85" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
                <line x1="65" y1="50" x2="65" y2="85" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
                <line x1="75" y1="50" x2="75" y2="85" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
                <line x1="85" y1="50" x2="85" y2="85" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
                
                {/* Roof - sloped and colorful */}
                <polygon points="15,50 60,25 105,50" fill="url(#roofGradient)" stroke="#ff00ff" strokeWidth="2.5"/>
                <polygon points="20,50 60,30 100,50" fill="#6B0000" opacity="0.5"/>
                
                {/* Balcony */}
                <rect x="70" y="65" width="25" height="20" fill="url(#houseGradient)" stroke="#00ffff" strokeWidth="1.5" rx="1"/>
                <line x1="75" y1="65" x2="75" y2="85" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
                <line x1="80" y1="65" x2="80" y2="85" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
                <line x1="85" y1="65" x2="85" y2="85" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
                <line x1="90" y1="65" x2="90" y2="85" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
                
                {/* Balcony railing */}
                <rect x="70" y="63" width="25" height="3" fill="#00ffff" opacity="0.8"/>
                <line x1="72" y1="63" x2="72" y2="66" stroke="#00ffff" strokeWidth="1"/>
                <line x1="77" y1="63" x2="77" y2="66" stroke="#00ffff" strokeWidth="1"/>
                <line x1="82" y1="63" x2="82" y2="66" stroke="#00ffff" strokeWidth="1"/>
                <line x1="87" y1="63" x2="87" y2="66" stroke="#00ffff" strokeWidth="1"/>
                <line x1="92" y1="63" x2="92" y2="66" stroke="#00ffff" strokeWidth="1"/>
                
                {/* Windows */}
                <rect x="32" y="58" width="12" height="12" fill="#1A1A1A" stroke="#00ffff" strokeWidth="1.5" rx="1">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
                </rect>
                <line x1="38" y1="58" x2="38" y2="70" stroke="#00ffff" strokeWidth="0.8" opacity="0.8"/>
                <line x1="32" y1="64" x2="44" y2="64" stroke="#00ffff" strokeWidth="0.8" opacity="0.8"/>
                
                <rect x="50" y="58" width="12" height="12" fill="#1A1A1A" stroke="#ff00ff" strokeWidth="1.5" rx="1">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/>
                </rect>
                <line x1="56" y1="58" x2="56" y2="70" stroke="#ff00ff" strokeWidth="0.8" opacity="0.8"/>
                <line x1="50" y1="64" x2="62" y2="64" stroke="#ff00ff" strokeWidth="0.8" opacity="0.8"/>
                
                {/* Door */}
                <rect x="40" y="70" width="14" height="15" fill="#1A1A1A" stroke="#00ff00" strokeWidth="2" rx="1"/>
                <circle cx="51" cy="77" r="1.5" fill="#00ff00">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                
                {/* Ladder */}
                <line x1="48" y1="70" x2="48" y2="110" stroke="#8B4513" strokeWidth="3"/>
                <line x1="52" y1="70" x2="52" y2="110" stroke="#8B4513" strokeWidth="3"/>
                <line x1="48" y1="78" x2="52" y2="78" stroke="#654321" strokeWidth="2"/>
                <line x1="48" y1="86" x2="52" y2="86" stroke="#654321" strokeWidth="2"/>
                <line x1="48" y1="94" x2="52" y2="94" stroke="#654321" strokeWidth="2"/>
                <line x1="48" y1="102" x2="52" y2="102" stroke="#654321" strokeWidth="2"/>
                
                {/* Colorful bunting flags */}
                <polygon points="25,75 28,70 31,75" fill="#ff00ff" stroke="#ff00ff" strokeWidth="0.5"/>
                <polygon points="32,75 35,70 38,75" fill="#ffff00" stroke="#ffff00" strokeWidth="0.5"/>
                <polygon points="39,75 42,70 45,75" fill="#00ff00" stroke="#00ff00" strokeWidth="0.5"/>
                <polygon points="46,75 49,70 52,75" fill="#00ffff" stroke="#00ffff" strokeWidth="0.5"/>
                <line x1="25" y1="75" x2="52" y2="75" stroke="#00ffff" strokeWidth="1" opacity="0.6"/>
                
                {/* Balloons */}
                <ellipse cx="20" cy="35" rx="4" ry="6" fill="#ffff00" stroke="#00ffff" strokeWidth="1">
                  <animate attributeName="cy" values="35;33;35" dur="2s" repeatCount="indefinite"/>
                </ellipse>
                <line x1="20" y1="41" x2="20" y2="50" stroke="#00ffff" strokeWidth="1" opacity="0.6"/>
                
                <ellipse cx="100" cy="30" rx="4" ry="6" fill="#ff00ff" stroke="#00ffff" strokeWidth="1">
                  <animate attributeName="cy" values="30;28;30" dur="2.2s" repeatCount="indefinite"/>
                </ellipse>
                <line x1="100" y1="36" x2="100" y2="45" stroke="#00ffff" strokeWidth="1" opacity="0.6"/>
                
                {/* Decorative sparkles */}
                <circle cx="15" cy="20" r="1.5" fill="#ffff00">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="105" cy="20" r="1.5" fill="#00ffff">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="10" cy="40" r="1" fill="#ff00ff">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" repeatCount="indefinite"/>
                </circle>
                <circle cx="110" cy="50" r="1" fill="#00ff00">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite"/>
                </circle>
                
                {/* Glow effects */}
                <rect x="25" y="50" width="70" height="35" fill="none" stroke="#00ffff" strokeWidth="1" opacity="0.4">
                  <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite"/>
                </rect>
                <polygon points="15,50 60,25 105,50" fill="none" stroke="#ff00ff" strokeWidth="1" opacity="0.3">
                  <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2.5s" repeatCount="indefinite"/>
                </polygon>
              </svg>
            </div>
          </div>
          <div className="float">
            <h1 className="pixel-font text-2xl sm:text-4xl md:text-6xl font-bold text-cyan-400 neon-glow-cyan mb-4 sm:mb-6 animate-glow-pulse">
              HOUSE GAMES
            </h1>
          </div>
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

      {/* Signature */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 animate-fade-in delay-800">
        <p className="text-cyan-400/60 text-xs sm:text-sm pixel-font neon-glow-cyan">
          Created with ❤️ by Africo
        </p>
      </div>

      {/* Africo Branding - Bottom Right */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 animate-fade-in delay-800 z-20 flex items-center gap-2">
        <p className="text-cyan-400/60 text-xs sm:text-sm pixel-font neon-glow-cyan">
          by
        </p>
        {/* Africo Logo - Africa Map with AFRICO text */}
        <div className="relative">
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 80 80" 
            className="w-12 h-12 sm:w-16 sm:h-16 animate-glow-pulse"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 12px rgba(255, 0, 255, 0.6))' }}
          >
            <defs>
              <linearGradient id="africaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ffff" />
                <stop offset="50%" stopColor="#ff00ff" />
                <stop offset="100%" stopColor="#00ff00" />
              </linearGradient>
              <linearGradient id="africaGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff00ff" />
                <stop offset="50%" stopColor="#00ff00" />
                <stop offset="100%" stopColor="#00ffff" />
              </linearGradient>
            </defs>
            
            {/* Africa Continent Outline - Simplified but recognizable shape */}
            <path 
              d="M 15 20 
                 L 20 15 
                 L 30 12 
                 L 45 10 
                 L 60 12 
                 L 65 15 
                 L 68 20 
                 L 70 28 
                 L 68 35 
                 L 65 42 
                 L 62 50 
                 L 58 58 
                 L 52 65 
                 L 45 68 
                 L 35 70 
                 L 25 68 
                 L 18 65 
                 L 12 58 
                 L 10 50 
                 L 8 42 
                 L 10 35 
                 L 12 28 
                 Z" 
              fill="url(#africaGradient)" 
              stroke="#00ffff" 
              strokeWidth="1.5"
              opacity="0.9"
            />
            
            {/* Glow effect for Africa outline */}
            <path 
              d="M 15 20 
                 L 20 15 
                 L 30 12 
                 L 45 10 
                 L 60 12 
                 L 65 15 
                 L 68 20 
                 L 70 28 
                 L 68 35 
                 L 65 42 
                 L 62 50 
                 L 58 58 
                 L 52 65 
                 L 45 68 
                 L 35 70 
                 L 25 68 
                 L 18 65 
                 L 12 58 
                 L 10 50 
                 L 8 42 
                 L 10 35 
                 L 12 28 
                 Z" 
              fill="none" 
              stroke="url(#africaGradient2)" 
              strokeWidth="2"
              opacity="0.6"
            >
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
            </path>
            
            {/* AFRICO Text inside the map */}
            <text 
              x="40" 
              y="42" 
              textAnchor="middle" 
              fontSize="14"
              fontWeight="bold"
              fill="#ffffff"
              stroke="#00ffff"
              strokeWidth="1"
              style={{ 
                fontFamily: 'monospace',
                filter: 'drop-shadow(0 0 6px rgba(0, 255, 255, 1)) drop-shadow(0 0 8px rgba(255, 0, 255, 0.9))',
                textShadow: '0 0 10px rgba(0, 255, 255, 1), 0 0 15px rgba(255, 0, 255, 0.8)'
              }}
            >
              AFRICO
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
