"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HomeButton() {
  const pathname = usePathname();
  
  // Hide on home page
  if (pathname === "/") {
    return null;
  }

  return (
    <Link
      href="/"
      className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 inline-flex items-center justify-center active:opacity-80 min-h-[44px] min-w-[44px] p-2 rounded-lg bg-gray-900/80 backdrop-blur-sm border-2 border-cyan-500/50 hover:border-cyan-400 hover:animate-pulse-glow transition-all animate-fade-in group"
      title="Home"
    >
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 120 120" 
        className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-110"
        style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 12px rgba(255, 0, 255, 0.6))' }}
      >
        <defs>
          <linearGradient id="homeBtnTreeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="50%" stopColor="#A0522D" />
            <stop offset="100%" stopColor="#654321" />
          </linearGradient>
          <linearGradient id="homeBtnHouseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D2691E" />
            <stop offset="50%" stopColor="#CD853F" />
            <stop offset="100%" stopColor="#A0522D" />
          </linearGradient>
          <linearGradient id="homeBtnRoofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B0000" />
            <stop offset="50%" stopColor="#A52A2A" />
            <stop offset="100%" stopColor="#6B0000" />
          </linearGradient>
        </defs>
        
        {/* Tree trunk */}
        <rect x="50" y="70" width="20" height="40" fill="url(#homeBtnTreeGradient)" rx="2"/>
        
        {/* Tree foliage */}
        <ellipse cx="60" cy="45" rx="35" ry="25" fill="#228B22" opacity="0.9"/>
        
        {/* Treehouse base */}
        <rect x="25" y="50" width="70" height="35" fill="url(#homeBtnHouseGradient)" stroke="#00ffff" strokeWidth="2" rx="2"/>
        
        {/* Roof */}
        <polygon points="15,50 60,25 105,50" fill="url(#homeBtnRoofGradient)" stroke="#ff00ff" strokeWidth="2.5"/>
        
        {/* Balcony */}
        <rect x="70" y="65" width="25" height="20" fill="url(#homeBtnHouseGradient)" stroke="#00ffff" strokeWidth="1.5" rx="1"/>
        <rect x="70" y="63" width="25" height="3" fill="#00ffff" opacity="0.8"/>
        
        {/* Windows */}
        <rect x="32" y="58" width="12" height="12" fill="#1A1A1A" stroke="#00ffff" strokeWidth="1.5" rx="1">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
        </rect>
        <line x1="38" y1="58" x2="38" y2="70" stroke="#00ffff" strokeWidth="0.8" opacity="0.8"/>
        <line x1="32" y1="64" x2="44" y2="64" stroke="#00ffff" strokeWidth="0.8" opacity="0.8"/>
        
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
        
        {/* Bunting flags */}
        <polygon points="25,75 28,70 31,75" fill="#ff00ff"/>
        <polygon points="32,75 35,70 38,75" fill="#ffff00"/>
        <polygon points="39,75 42,70 45,75" fill="#00ff00"/>
        <polygon points="46,75 49,70 52,75" fill="#00ffff"/>
        
        {/* Balloons */}
        <ellipse cx="20" cy="35" rx="4" ry="6" fill="#ffff00" stroke="#00ffff" strokeWidth="1">
          <animate attributeName="cy" values="35;33;35" dur="2s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="100" cy="30" rx="4" ry="6" fill="#ff00ff" stroke="#00ffff" strokeWidth="1">
          <animate attributeName="cy" values="30;28;30" dur="2.2s" repeatCount="indefinite"/>
        </ellipse>
      </svg>
    </Link>
  );
}

