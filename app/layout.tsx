import type { Metadata, Viewport } from "next";
import "./globals.css";
import HomeButton from "./components/HomeButton";

export const metadata: Metadata = {
  title: "House Games - Neon Arcade",
  description: "A neon arcade where friends come to play social games together",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "House Games",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  // Allow indexing (default behavior - no robots restrictions)
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#00ffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="neon-bg scanlines">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '1rem', textAlign: 'center' }}>
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
        <div className="grid-bg"></div>
        <div className="relative z-10">
          <HomeButton />
          {children}
        </div>
      </body>
    </html>
  );
}
