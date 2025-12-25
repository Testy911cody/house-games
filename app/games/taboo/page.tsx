"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, X, Users, Plus, Trash2, Play, Crown, RotateCcw, Zap, Globe } from "lucide-react";
import Link from "next/link";
import WaitingRoom from "@/app/components/WaitingRoom";
import GameLobby from "@/app/components/GameLobby";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Taboo word card structure: each word has a guess word and forbidden taboo words
interface TabooCard {
  word: string;
  tabooWords: string[];
}

// Generate taboo words for a given word (simplified - in real game these are pre-defined)
const generateTabooWords = (word: string, difficulty: Difficulty): string[] => {
  const wordLower = word.toLowerCase();
  // Common taboo words based on word relationships
  const tabooMap: Record<string, string[]> = {
    "pizza": ["cheese", "slice", "italian", "topping", "delivery"],
    "elephant": ["trunk", "africa", "big", "gray", "tusk"],
    "computer": ["keyboard", "screen", "mouse", "internet", "laptop"],
    "beach": ["sand", "ocean", "water", "swim", "sun"],
    "doctor": ["hospital", "patient", "medicine", "nurse", "stethoscope"],
    "bicycle": ["wheel", "pedal", "ride", "bike", "chain"],
    "library": ["book", "read", "quiet", "shelf", "study"],
    "guitar": ["string", "music", "play", "sound", "strum"],
    "rainbow": ["color", "rain", "sky", "arc", "light"],
    "butterfly": ["wing", "fly", "insect", "flower", "caterpillar"],
    "penguin": ["antarctica", "bird", "ice", "swim", "black"],
    "castle": ["king", "stone", "tower", "medieval", "fortress"],
    "dragon": ["fire", "myth", "wing", "scaly", "fantasy"],
    "ship": ["boat", "water", "sail", "ocean", "captain"],
    "island": ["water", "land", "beach", "tropical", "isolated"],
    "mountain": ["peak", "high", "climb", "snow", "hill"],
    "forest": ["tree", "wood", "nature", "green", "wild"],
    "river": ["water", "flow", "stream", "bank", "fish"],
    "ocean": ["water", "sea", "wave", "blue", "deep"],
    "desert": ["sand", "hot", "dry", "cactus", "camel"],
    "jungle": ["tree", "tropical", "wild", "animal", "green"],
    "rocket": ["space", "launch", "fuel", "nasa", "moon"],
    "astronaut": ["space", "moon", "rocket", "nasa", "helmet"],
    "planet": ["earth", "space", "orbit", "sun", "mars"],
    "star": ["sky", "night", "bright", "twinkle", "sun"],
    "moon": ["night", "sky", "round", "lunar", "bright"],
    "sun": ["day", "bright", "hot", "solar", "sky"],
    "cloud": ["sky", "rain", "white", "weather", "float"],
    "camera": ["photo", "picture", "lens", "shoot", "film"],
    "chocolate": ["sweet", "candy", "brown", "cocoa", "bar"],
    "diamond": ["jewel", "ring", "precious", "sparkle", "gem"],
    "garden": ["flower", "plant", "grow", "soil", "vegetable"],
    "hamburger": ["meat", "bun", "cheese", "fast", "food"],
    "umbrella": ["rain", "wet", "cover", "handle", "open"],
    "waterfall": ["water", "fall", "height", "nature", "flow"],
  };
  
  // Return pre-defined taboo words if available, otherwise generate generic ones
  if (tabooMap[wordLower]) {
    return tabooMap[wordLower];
  }
  
  // Generic taboo words based on difficulty
  if (difficulty === "easy") {
    return ["thing", "item", "object", "stuff", "one"];
  } else if (difficulty === "hard") {
    return ["concept", "notion", "idea", "term", "entity"];
  }
  return ["thing", "item", "word", "term", "one"];
};

// Difficulty-based word lists
const TABOO_WORDS_EASY = [
  "Pizza", "Elephant", "Computer", "Beach", "Doctor", "Bicycle", "Library",
  "Guitar", "Rainbow", "Butterfly", "Penguin", "Castle", "Dragon", "Ship",
  "Island", "Mountain", "Forest", "River", "Ocean", "Desert", "Jungle",
  "Rocket", "Astronaut", "Planet", "Star", "Moon", "Sun", "Cloud",
  "Camera", "Chocolate", "Diamond", "Garden", "Hamburger", "Umbrella", "Waterfall"
];

const TABOO_WORDS_MEDIUM = [
  "Telescope", "Volcano", "Dinosaur", "Helicopter", "Cactus", "Kangaroo",
  "Tornado", "Pyramid", "Wizard", "Treasure", "Pirate", "Space",
  "Firework", "Iceberg", "Jellyfish", "Kingdom", "Lighthouse", "Mermaid",
  "Orchestra", "Parachute", "Rollercoaster", "Submarine", "Trampoline", "Vampire", "Xylophone"
];

const TABOO_WORDS_HARD = [
  "Philosophy", "Metaphor", "Ambiguity", "Paradox", "Abstract", "Conceptual",
  "Existential", "Theoretical", "Hypothetical", "Paradigm", "Epistemology",
  "Ontology", "Axiom", "Postulate", "Synthesis", "Analysis", "Deduction",
  "Induction", "Inference", "Rationale", "Cognition", "Perception", "Consciousness",
  "Subconscious", "Empirical", "Objective", "Subjective", "Relative", "Absolute",
  "Transcendent", "Immanent", "Dialectical", "Hermeneutic", "Phenomenological",
  "Semiotics", "Semantics", "Syntax", "Pragmatic", "Contextual", "Nuanced",
  "Sophisticated", "Intricate", "Complex", "Multifaceted", "Multidimensional"
];

// Combined word list for medium difficulty
const TABOO_WORDS = [...TABOO_WORDS_EASY, ...TABOO_WORDS_MEDIUM, ...TABOO_WORDS_HARD];

type Difficulty = "easy" | "medium" | "hard";

const TEAM_COLORS = [
  { name: "Pink", bg: "bg-pink-500", border: "border-pink-500", text: "text-pink-400", glow: "neon-box-pink", light: "bg-pink-900/30" },
  { name: "Cyan", bg: "bg-cyan-500", border: "border-cyan-500", text: "text-cyan-400", glow: "neon-box-cyan", light: "bg-cyan-900/30" },
  { name: "Green", bg: "bg-green-500", border: "border-green-500", text: "text-green-400", glow: "neon-box-green", light: "bg-green-900/30" },
  { name: "Yellow", bg: "bg-yellow-500", border: "border-yellow-500", text: "text-yellow-400", glow: "neon-box-yellow", light: "bg-yellow-900/30" },
  { name: "Orange", bg: "bg-orange-500", border: "border-orange-500", text: "text-orange-400", glow: "neon-box-orange", light: "bg-orange-900/30" },
  { name: "Purple", bg: "bg-purple-500", border: "border-purple-500", text: "text-purple-400", glow: "neon-box-purple", light: "bg-purple-900/30" },
];

interface Team {
  id: string;
  name: string;
  color: typeof TEAM_COLORS[0];
  score: number;
}

type GamePhase = "waiting" | "setup" | "playing" | "roundEnd" | "gameOver";
type PlayerRole = "describer" | "guesser";

// Game Room types
interface GameRoom {
  id: string;
  code: string;
  gameType: string;
  hostId: string;
  hostName: string;
  isPrivate: boolean;
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  minPlayers: number;
  currentPlayers: Array<{
    id: string;
    name: string;
    team?: string;
    isReady: boolean;
    isHost: boolean;
    joinedAt: string;
  }>;
  settings: Record<string, any>;
  teamMode: boolean;
  teams: any[];
  createdAt: string;
  updatedAt: string;
}

function TabooPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const guessInputRef = useRef<HTMLInputElement>(null);
  
  const [showLobby, setShowLobby] = useState(true);
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [joinedTeamIds, setJoinedTeamIds] = useState<string[]>([]);
  const [isPlayingAgainstComputer, setIsPlayingAgainstComputer] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [roundsPerTeam, setRoundsPerTeam] = useState(2);
  const [roundsPlayed, setRoundsPlayed] = useState<Record<string, number>>({});
  
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [role, setRole] = useState<PlayerRole | null>(null);
  
  const [words, setWords] = useState<TabooCard[]>([]);
  const [currentWord, setCurrentWord] = useState<TabooCard | null>(null);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundScore, setRoundScore] = useState({ correct: 0, skipped: 0, violations: 0 });
  const [describerText, setDescriberText] = useState("");
  const [showViolation, setShowViolation] = useState(false);
  
  const [guess, setGuess] = useState("");
  const [guessHistory, setGuessHistory] = useState<{ guess: string; correct: boolean }[]>([]);
  const [showCorrectFeedback, setShowCorrectFeedback] = useState(false);

  const [gameId, setGameId] = useState<string | null>(null);
  const [lastSyncedState, setLastSyncedState] = useState<string>("");
  // Device/session ID to track which device made the update (for multi-device same-user sync)
  const getDeviceId = (): string => {
    if (typeof window !== 'undefined') {
      let deviceId = sessionStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('deviceId', deviceId);
      }
      return deviceId;
    }
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  const deviceIdRef = useRef<string>(getDeviceId());

  // Check for room code in URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setShowLobby(false);
      joinRoomByCode(code);
    }
  }, [searchParams]);

  // Poll room status to detect when game starts (even when in waiting phase)
  useEffect(() => {
    if (!gameRoom || !currentUser || phase !== "waiting") return;
    
    let previousStatus = gameRoom.status;
    
    const pollRoomStatus = async () => {
      try {
        const { gameRoomsAPI } = await import("@/lib/api-utils");
        const result = await gameRoomsAPI.getRoomByCode(gameRoom.code);
        
        if (result.success && result.room) {
          const newRoom = result.room;
          
          // Check if game status changed from waiting to playing
          if (previousStatus === 'waiting' && newRoom.status === 'playing') {
            // Game was started - move to setup phase
            setPhase("setup");
          }
          
          // Update room state (players, etc.)
          previousStatus = newRoom.status;
          setGameRoom(newRoom);
        }
      } catch (error) {
        console.error("Error polling room status:", error);
      }
    };
    
    const intervalId = setInterval(pollRoomStatus, 1000);
    pollRoomStatus(); // Initial poll
    
    return () => clearInterval(intervalId);
  }, [gameRoom?.code, currentUser, phase]);

  // Join room by code from URL
  const joinRoomByCode = async (code: string) => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    const userData = JSON.parse(user);
    setCurrentUser(userData);
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      const result = await gameRoomsAPI.joinRoom(code, userData.id, userData.name);
      if (result.success && result.room) {
        setGameRoom(result.room);
        setShowLobby(false);
        setGameId(`taboo_${result.room.code}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  // Handle room joined from lobby
  const handleJoinRoom = (room: GameRoom) => {
    setGameRoom(room);
    setShowLobby(false);
    setGameId(`taboo_${room.code}`);
  };
  
  // Update gameId when gameRoom changes
  useEffect(() => {
    if (gameRoom) {
      setGameId(`taboo_${gameRoom.code}`);
    }
  }, [gameRoom?.code]);

  // Handle leaving room
  const handleLeaveRoom = async () => {
    if (gameRoom && currentUser) {
      try {
        const { gameRoomsAPI } = await import("@/lib/api-utils");
        await gameRoomsAPI.leaveRoom(gameRoom.id, currentUser.id);
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    }
    setGameRoom(null);
    setShowLobby(true);
    router.push("/games/taboo");
  };

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    const userData = JSON.parse(user);
    setCurrentUser(userData);
    
    // Create game ID
    const currentTeam = localStorage.getItem("currentTeam");
    const { gameStateAPI, teamsAPI } = require('@/lib/api-utils');
    const id = gameRoom ? `taboo_${gameRoom.code}` : gameStateAPI.createGameId(currentTeam ? JSON.parse(currentTeam).id : null, 'taboo');
    setGameId(id);
    
    // Update team's last game access if team exists
    if (currentTeam) {
      try {
        const team = JSON.parse(currentTeam);
        teamsAPI.updateTeamGameAccess(team.id);
      } catch (e) {
        console.error("Error updating team game access:", e);
      }
    }
  }, [router]);

  // Separate effect to initialize team from currentTeam
  useEffect(() => {
    if (!currentUser) return;
    
    // Check if there's a current team and auto-populate team
    const currentTeamData = localStorage.getItem("currentTeam");
    if (currentTeamData && teams.length === 0) {
      try {
        const teamData = JSON.parse(currentTeamData);
        const availableColor = TEAM_COLORS[0];
        
        // Create a team from the team data
        const gameTeam: Team = {
          id: `team_${teamData.id}`,
          name: teamData.name,
          color: availableColor,
          score: 0
        };
        setTeams([gameTeam]);
      } catch (e) {
        console.error("Error loading team:", e);
      }
    }
  }, [currentUser, teams.length]);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isPlaying) {
      endRound();
    }
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (role === "guesser" && currentWord && guessInputRef.current) {
      guessInputRef.current.focus();
    }
  }, [currentWord, role]);

  // Save game state to Supabase whenever it changes
  useEffect(() => {
    if (!currentUser || !gameId) return;
    
    const saveState = async () => {
      try {
        const { gameStateAPI } = await import('@/lib/api-utils');
        const stateToSave = {
            phase,
            difficulty,
            teams,
            currentTeamIndex,
            roundsPerTeam,
            roundsPlayed,
            selectedTeam,
            role,
            words,
            currentWord,
            usedWords,
            timeLeft,
            isPlaying,
            roundScore,
            guessHistory,
            describerText,
          };
        
        const stateString = JSON.stringify(stateToSave);
        if (stateString === lastSyncedState) return; // Skip if unchanged
        
        await gameStateAPI.saveGameState({
          id: gameId,
          gameType: 'taboo',
          teamId: (() => {
            const team = localStorage.getItem("currentTeam");
            if (team) {
              try {
                return JSON.parse(team).id;
              } catch (e) {
                return undefined;
              }
            }
            return undefined;
          })(),
          state: stateToSave,
          lastUpdated: new Date().toISOString(),
          updatedBy: currentUser.id,
          deviceId: deviceIdRef.current,
        });
        
        setLastSyncedState(stateString);
      } catch (error) {
        console.error('Error saving game state:', error);
          }
    };
    
    // Debounce saves
    const timeoutId = setTimeout(saveState, 500);
    return () => clearTimeout(timeoutId);
  }, [phase, difficulty, teams, currentTeamIndex, roundsPerTeam, roundsPlayed, selectedTeam, role, words, currentWord, usedWords, timeLeft, isPlaying, roundScore, guessHistory, currentUser, gameId, lastSyncedState]);

  // Use Supabase realtime subscription for instant updates, fallback to polling
  useEffect(() => {
    if (!currentUser || !gameId) return;
    
    if (isSupabaseConfigured() && supabase) {
      // Set up realtime subscription for instant updates
      const channel = supabase
        .channel(`game_state_${gameId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'game_states',
            filter: `id=eq.${gameId}`,
          },
          async (payload) => {
            try {
              const { gameStateAPI } = await import('@/lib/api-utils');
              const result = await gameStateAPI.getGameState(gameId);
              
              if (result.success && result.state) {
                const remoteState = result.state.state;
                const remoteStateString = JSON.stringify(remoteState);
                
                // Update if state is different and not from this device
                const isFromThisDevice = (result.state as any).deviceId === deviceIdRef.current;
                
                if (remoteStateString !== lastSyncedState && !isFromThisDevice) {
                  // Merge remote state
                  if (remoteState.phase) setPhase(remoteState.phase);
                  if (remoteState.difficulty) setDifficulty(remoteState.difficulty);
                  if (remoteState.teams) setTeams(remoteState.teams);
                  if (remoteState.currentTeamIndex !== undefined) setCurrentTeamIndex(remoteState.currentTeamIndex);
                  if (remoteState.roundsPerTeam !== undefined) setRoundsPerTeam(remoteState.roundsPerTeam);
                  if (remoteState.roundsPlayed) setRoundsPlayed(remoteState.roundsPlayed);
                  if (remoteState.selectedTeam) setSelectedTeam(remoteState.selectedTeam);
                  if (remoteState.role) setRole(remoteState.role);
                  if (remoteState.words) setWords(remoteState.words);
                  if (remoteState.currentWord !== undefined) setCurrentWord(remoteState.currentWord);
                  if (remoteState.usedWords) setUsedWords(remoteState.usedWords);
                  if (remoteState.timeLeft !== undefined) setTimeLeft(remoteState.timeLeft);
                  if (remoteState.isPlaying !== undefined) setIsPlaying(remoteState.isPlaying);
                  if (remoteState.roundScore) setRoundScore(remoteState.roundScore);
                  if (remoteState.guessHistory) setGuessHistory(remoteState.guessHistory);
                  
                  setLastSyncedState(remoteStateString);
                }
              }
            } catch (error) {
              console.error('Error handling realtime update:', error);
            }
          }
        )
        .subscribe();
      
      // Also poll initially and as fallback
      const pollState = async () => {
        try {
          const { gameStateAPI } = await import('@/lib/api-utils');
          const result = await gameStateAPI.getGameState(gameId);
          
          if (result.success && result.state) {
            const remoteState = result.state.state;
            const remoteStateString = JSON.stringify(remoteState);
            
            // Update if state is different and not from this device
            const isFromThisDevice = (result.state as any).deviceId === deviceIdRef.current;
            
            if (remoteStateString !== lastSyncedState && !isFromThisDevice) {
              // Merge remote state
              if (remoteState.phase) setPhase(remoteState.phase);
              if (remoteState.difficulty) setDifficulty(remoteState.difficulty);
              if (remoteState.teams) setTeams(remoteState.teams);
              if (remoteState.currentTeamIndex !== undefined) setCurrentTeamIndex(remoteState.currentTeamIndex);
              if (remoteState.roundsPerTeam !== undefined) setRoundsPerTeam(remoteState.roundsPerTeam);
              if (remoteState.roundsPlayed) setRoundsPlayed(remoteState.roundsPlayed);
              if (remoteState.selectedTeam) setSelectedTeam(remoteState.selectedTeam);
              if (remoteState.role) setRole(remoteState.role);
              if (remoteState.words) setWords(remoteState.words);
              if (remoteState.currentWord !== undefined) setCurrentWord(remoteState.currentWord);
              if (remoteState.usedWords) setUsedWords(remoteState.usedWords);
              if (remoteState.timeLeft !== undefined) setTimeLeft(remoteState.timeLeft);
              if (remoteState.isPlaying !== undefined) setIsPlaying(remoteState.isPlaying);
              if (remoteState.roundScore) setRoundScore(remoteState.roundScore);
              if (remoteState.guessHistory) setGuessHistory(remoteState.guessHistory);
              
              setLastSyncedState(remoteStateString);
            }
          }
        } catch (error) {
          console.error('Error polling game state:', error);
        }
      };
      
      // Initial poll
      pollState();
      // Fallback polling every 2 seconds (less frequent since we have realtime)
      const intervalId = setInterval(pollState, 2000);
      
      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
        clearInterval(intervalId);
      };
    } else {
      // Fallback to polling if Supabase not configured
      const pollState = async () => {
        try {
          const { gameStateAPI } = await import('@/lib/api-utils');
          const result = await gameStateAPI.getGameState(gameId);
          
          if (result.success && result.state) {
            const remoteState = result.state.state;
            const remoteStateString = JSON.stringify(remoteState);
            
            // Update if state is different and from another user/device
            const isFromThisDevice = (result.state as any).deviceId === deviceIdRef.current;
            const isFromOtherUser = result.state.updatedBy !== currentUser.id;
            
            if (remoteStateString !== lastSyncedState && (!isFromThisDevice || isFromOtherUser)) {
              // Merge remote state
              if (remoteState.phase) setPhase(remoteState.phase);
              if (remoteState.difficulty) setDifficulty(remoteState.difficulty);
              if (remoteState.teams) setTeams(remoteState.teams);
              if (remoteState.currentTeamIndex !== undefined) setCurrentTeamIndex(remoteState.currentTeamIndex);
              if (remoteState.roundsPerTeam !== undefined) setRoundsPerTeam(remoteState.roundsPerTeam);
              if (remoteState.roundsPlayed) setRoundsPlayed(remoteState.roundsPlayed);
              if (remoteState.selectedTeam) setSelectedTeam(remoteState.selectedTeam);
              if (remoteState.role) setRole(remoteState.role);
              if (remoteState.words) setWords(remoteState.words);
              if (remoteState.currentWord !== undefined) setCurrentWord(remoteState.currentWord);
              if (remoteState.usedWords) setUsedWords(remoteState.usedWords);
              if (remoteState.timeLeft !== undefined) setTimeLeft(remoteState.timeLeft);
              if (remoteState.isPlaying !== undefined) setIsPlaying(remoteState.isPlaying);
              if (remoteState.roundScore) setRoundScore(remoteState.roundScore);
              if (remoteState.guessHistory) setGuessHistory(remoteState.guessHistory);
              
              setLastSyncedState(remoteStateString);
            }
          }
        } catch (error) {
          console.error('Error polling game state:', error);
        }
      };
      
      // Poll every 1 second for real-time updates
      const intervalId = setInterval(pollState, 1000);
      pollState(); // Initial poll
      
      return () => clearInterval(intervalId);
    }
  }, [currentUser, gameId, phase, isPlaying, lastSyncedState]);

  useEffect(() => {
    if (role === "describer" && isPlaying) {
      const interval = setInterval(() => {
        const guesses = JSON.parse(localStorage.getItem("taboo_guesses") || "[]");
        if (guesses.length > 0 && currentWord) {
          const correctGuess = guesses.find((g: string) => 
            g.toLowerCase().trim() === currentWord.word.toLowerCase()
          );
          if (correctGuess) {
            handleCorrect();
            localStorage.setItem("taboo_guesses", JSON.stringify([]));
          }
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [role, isPlaying, currentWord]);

  const generateWordGrid = (): TabooCard[] => {
    // Select words based on difficulty
    let wordPool: string[];
    switch (difficulty) {
      case "easy":
        wordPool = TABOO_WORDS_EASY;
        break;
      case "hard":
        wordPool = TABOO_WORDS_HARD;
        break;
      case "medium":
      default:
        // Medium uses mix: 50% easy, 30% medium, 20% hard
        const easyCount = Math.floor(25 * 0.5);
        const mediumCount = Math.floor(25 * 0.3);
        const hardCount = 25 - easyCount - mediumCount;
        const easyWords = [...TABOO_WORDS_EASY].sort(() => Math.random() - 0.5).slice(0, easyCount);
        const mediumWords = [...TABOO_WORDS_MEDIUM].sort(() => Math.random() - 0.5).slice(0, mediumCount);
        const hardWords = [...TABOO_WORDS_HARD].sort(() => Math.random() - 0.5).slice(0, hardCount);
        wordPool = [...easyWords, ...mediumWords, ...hardWords];
        break;
    }
    
    const shuffled = [...wordPool].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, 25);
    
    // Create taboo cards with taboo words for each word
    return selectedWords.map(word => ({
      word,
      tabooWords: generateTabooWords(word, difficulty)
    }));
  };

  const addTeam = () => {
    if (teams.length >= 6) return;
    const usedColors = teams.map(t => t.color.name);
    const availableColor = TEAM_COLORS.find(c => !usedColors.includes(c.name)) || TEAM_COLORS[0];
    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name: `Team ${teams.length + 1}`,
      color: availableColor,
      score: 0
    };
    setTeams([...teams, newTeam]);
  };

  const removeTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  const updateTeamName = (id: string, name: string) => {
    setTeams(teams.map(t => t.id === id ? { ...t, name } : t));
  };

  const updateTeamColor = (id: string, color: typeof TEAM_COLORS[0]) => {
    setTeams(teams.map(t => t.id === id ? { ...t, color } : t));
  };

  const startGame = () => {
    if (teams.length < 2) return;
    setPhase("playing");
    setCurrentTeamIndex(0);
    const initialRounds: Record<string, number> = {};
    teams.forEach(t => initialRounds[t.id] = 0);
    setRoundsPlayed(initialRounds);
  };

  const startRound = () => {
    const gridWords = generateWordGrid();
    setWords(gridWords);
    setUsedWords([]);
    setCurrentWord(null);
    setTimeLeft(60);
    setRoundScore({ correct: 0, skipped: 0, violations: 0 });
    setIsPlaying(true);
    setGuessHistory([]);
    setGuess("");
    setDescriberText("");
    localStorage.setItem("taboo_guesses", JSON.stringify([]));
  };

  const selectWord = (card: TabooCard) => {
    if (usedWords.includes(card.word) || role !== "describer") return;
    setCurrentWord(card);
    setDescriberText("");
  };
  
  // Check if describer text contains taboo words
  const checkTabooViolation = (text: string): boolean => {
    if (!currentWord) return false;
    const textLower = text.toLowerCase();
    const wordLower = currentWord.word.toLowerCase();
    
    // Check if the guess word itself is used
    if (textLower.includes(wordLower)) return true;
    
    // Check if any taboo word is used
    for (const tabooWord of currentWord.tabooWords) {
      const tabooLower = tabooWord.toLowerCase();
      // Check for whole word match or as part of a word
      const regex = new RegExp(`\\b${tabooLower}\\b`, 'i');
      if (regex.test(textLower)) return true;
    }
    
    return false;
  };
  
  const handleTabooViolation = () => {
    if (!currentWord) return;
    setRoundScore(prev => ({ ...prev, violations: prev.violations + 1 }));
    setShowViolation(true);
    setTimeout(() => {
      setShowViolation(false);
      // Move to next word (skip current word)
      handleSkip();
    }, 2000);
  };

  const handleCorrect = () => {
    if (!currentWord) return;
    setRoundScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    setUsedWords(prev => [...prev, currentWord.word]);
    setCurrentWord(null);
    setDescriberText("");
    setShowCorrectFeedback(true);
    setTimeout(() => setShowCorrectFeedback(false), 500);
  };

  const handleSkip = () => {
    if (!currentWord || role !== "describer") return;
    setRoundScore(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    setUsedWords(prev => [...prev, currentWord.word]);
    setCurrentWord(null);
    setDescriberText("");
  };

  const submitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    
    const guessText = guess.trim();
    const isCorrect = currentWord && guessText.toLowerCase() === currentWord.word.toLowerCase();
    
    if (isCorrect && currentWord) {
      // Auto-handle correct guess
      handleCorrect();
    }
    
    setGuessHistory(prev => [...prev, { guess: guessText, correct: isCorrect || false }]);
    
    const guesses = JSON.parse(localStorage.getItem("taboo_guesses") || "[]");
    guesses.push(guessText);
    localStorage.setItem("taboo_guesses", JSON.stringify(guesses));
    
    setGuess("");
  };

  const endRound = () => {
    setIsPlaying(false);
    
    const currentTeam = teams[currentTeamIndex];
    // Calculate final score: correct guesses - violations (penalties)
    const finalScore = Math.max(0, roundScore.correct - roundScore.violations);
    setTeams(teams.map(t => 
      t.id === currentTeam.id 
        ? { ...t, score: t.score + finalScore }
        : t
    ));
    
    setRoundsPlayed(prev => ({
      ...prev,
      [currentTeam.id]: (prev[currentTeam.id] || 0) + 1
    }));

    localStorage.setItem("taboo_game_state", JSON.stringify({
      currentWord: null,
      timeLeft: 0,
      roundScore,
      ended: true
    }));
    
    setPhase("roundEnd");
  };

  const nextRound = () => {
    const allTeamsFinished = teams.every(t => 
      (roundsPlayed[t.id] || 0) >= roundsPerTeam
    );
    
    if (allTeamsFinished) {
      setPhase("gameOver");
      return;
    }
    
    let nextIndex = (currentTeamIndex + 1) % teams.length;
    while ((roundsPlayed[teams[nextIndex].id] || 0) >= roundsPerTeam) {
      nextIndex = (nextIndex + 1) % teams.length;
    }
    
    setCurrentTeamIndex(nextIndex);
    setRole(null);
    setSelectedTeam(null);
    setPhase("playing");
  };

  const resetGame = () => {
    setPhase("waiting");
    setTeams([]);
    setCurrentTeamIndex(0);
    setRoundsPlayed({});
    setSelectedTeam(null);
    setRole(null);
    setWords([]);
    setCurrentWord(null);
    setUsedWords([]);
    setTimeLeft(60);
    setIsPlaying(false);
    setRoundScore({ correct: 0, skipped: 0, violations: 0 });
    setGuess("");
    setGuessHistory([]);
    setJoinedTeamIds([]);
    setIsPlayingAgainstComputer(true);
    localStorage.removeItem("taboo_game_state");
    localStorage.removeItem("taboo_guesses");
    // Keep difficulty setting
  };

  if (!currentUser) return null;

  const currentTeam = teams[currentTeamIndex];
  
  // Get current team info
  const currentTeamData = localStorage.getItem("currentTeam");
  let teamInfo = null;
  if (currentTeamData) {
    try {
      teamInfo = JSON.parse(currentTeamData);
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  const currentTeamName = teamInfo?.name || "Solo Player";
  const currentTeamId = teamInfo?.id || null;

  // LOBBY PHASE - Show game lobby for online multiplayer
  if (showLobby && phase === "waiting") {
    return (
      <GameLobby
        gameType="taboo"
        gameName="TABOO"
        gameIcon="🚫"
        maxPlayers={6}
        minPlayers={2}
        teamMode={true}
        onJoinRoom={handleJoinRoom}
        backUrl="/games"
      />
    );
  }

  // WAITING ROOM PHASE
  if (phase === "waiting") {
    return (
      <WaitingRoom
        gameType="taboo"
        gameName="TABOO"
        gameIcon="🚫"
        currentTeamName={currentTeamName}
        currentTeamId={currentTeamId}
        gameId={gameId || ""}
        currentUser={currentUser}
        roomCode={gameRoom?.code}
        room={gameRoom || undefined}
        onLeaveRoom={handleLeaveRoom}
        onTeamJoined={async (teamId, teamName) => {
          setJoinedTeamIds(prev => [...prev, teamId]);
          setIsPlayingAgainstComputer(false);
          // Add team to teams list
          const { teamsAPI } = await import('@/lib/api-utils');
          const result = await teamsAPI.getTeams();
          if (result.success && result.teams) {
            const team = result.teams.find((t: any) => t.id === teamId);
            if (team) {
              const availableColor = TEAM_COLORS[teams.length % TEAM_COLORS.length];
              const newTeam: Team = {
                id: `team_${team.id}`,
                name: team.name,
                color: availableColor,
                score: 0
              };
              setTeams(prev => [...prev, newTeam]);
            }
          }
        }}
        onStartGame={() => {
          setPhase("setup");
        }}
        onPlayAgainstComputer={() => {
          setIsPlayingAgainstComputer(true);
          setPhase("setup");
        }}
        minPlayers={2}
        maxPlayers={6}
        waitTime={30}
        showAvailableGames={true}
      />
    );
  }

  // SETUP PHASE
  if (phase === "setup") {
    const currentTeamData = localStorage.getItem("currentTeam");
    let teamInfo = null;
    if (currentTeamData) {
      try {
        teamInfo = JSON.parse(currentTeamData);
      } catch (e) {
        // Ignore parse errors
      }
    }

    return (
      <div className="min-h-screen p-4 md:p-8 page-enter">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-semibold animate-fade-in-left hover:animate-pulse-glow"
          >
            <ArrowLeft className="w-5 h-5 animate-fade-in-right" />
            BACK TO GAMES
          </Link>

          <div className="text-center mb-8 animate-fade-in-down delay-200">
            <h1 className="pixel-font text-3xl md:text-5xl font-bold text-pink-400 neon-glow-pink mb-4 float animate-glow-pulse">
              🚫 TABOO
            </h1>
            <p className="text-cyan-300 animate-fade-in-up delay-300">
              Teams compete to guess words without saying them!
            </p>
          </div>

          {/* Group Info Banner */}
          {teamInfo && (
            <div className="neon-card neon-box-purple p-4 mb-6 card-3d animate-slide-fade-in delay-300">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-purple-400 font-bold">Playing as Team: {teamInfo.name}</div>
                    <div className="text-cyan-300/70 text-sm">
                      {teamInfo.members.length + 1} member{teamInfo.members.length !== 0 ? "s" : ""} as one team
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="neon-card neon-box-pink p-8 card-3d animate-scale-in delay-400">
            <h2 className="pixel-font text-xl text-cyan-400 neon-glow-cyan mb-6 text-center animate-fade-in-up">
              🏆 CREATE YOUR TEAMS
            </h2>

            {/* Teams List */}
            <div className="space-y-4 mb-6">
              {teams.map((team, idx) => (
                <div
                  key={team.id}
                  className={`${team.color.light} rounded-xl p-4 border-2 ${team.color.border} ${team.color.glow} flex items-center gap-4 transition-all card-enter hover:animate-pulse-glow`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={`w-10 h-10 rounded-full ${team.color.bg} flex items-center justify-center text-black font-bold text-lg animate-bounce-in`} style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}>
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => updateTeamName(team.id, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-black/50 border-2 border-gray-600 text-white font-semibold focus:outline-none focus:border-cyan-400 input-3d focus:animate-pulse-glow"
                    maxLength={20}
                  />
                  <div className="flex gap-1">
                    {TEAM_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => updateTeamColor(team.id, color)}
                        className={`w-6 h-6 rounded-full ${color.bg} ${
                          team.color.name === color.name ? "ring-2 ring-white scale-110 animate-pulse" : "opacity-50 hover:opacity-100"
                        } transition-all hover:animate-scale-up`}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => removeTeam(team.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded-lg transition-colors hover:animate-shake"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {teams.length < 6 && (
              <button
                onClick={addTeam}
                className="w-full py-4 border-2 border-dashed border-cyan-500/50 rounded-xl text-cyan-400 font-bold hover:bg-cyan-900/20 transition-colors flex items-center justify-center gap-2 animate-fade-in-up delay-500 hover:animate-pulse-glow"
              >
                <Plus className="w-6 h-6 animate-rotate-in" />
                ADD TEAM
              </button>
            )}

            {/* Difficulty Selection */}
            <div className="mt-8 p-4 bg-black/30 rounded-xl border-2 border-purple-500/50 animate-fade-in delay-600">
              <label className="block text-purple-400 font-semibold mb-3">
                DIFFICULTY LEVEL
              </label>
              <div className="flex gap-3">
                {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all hover:scale-105 ${
                      difficulty === diff
                        ? "bg-purple-500 text-black neon-box-purple"
                        : "bg-black/50 text-gray-400 border-2 border-gray-600 hover:border-purple-500"
                    }`}
                  >
                    {diff.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                {difficulty === "easy" && "Simple, concrete words"}
                {difficulty === "medium" && "Mix of simple and moderate words"}
                {difficulty === "hard" && "Abstract and complex words"}
              </div>
            </div>

            {/* Rounds Setting */}
            <div className="mt-8 p-4 bg-black/30 rounded-xl border-2 border-yellow-500/50 animate-fade-in delay-700">
              <label className="block text-yellow-400 font-semibold mb-3">
                ROUNDS PER TEAM
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setRoundsPerTeam(num)}
                    className={`w-12 h-12 rounded-lg font-bold text-lg transition-all hover:animate-scale-up ${
                      roundsPerTeam === num
                        ? "bg-yellow-500 text-black neon-box-yellow animate-pulse"
                        : "bg-black/50 text-gray-400 border-2 border-gray-600 hover:border-yellow-500"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startGame}
              disabled={teams.length < 2}
              className={`w-full mt-8 py-5 rounded-xl text-xl font-bold transition-all flex items-center justify-center gap-3 ${
                teams.length >= 2
                  ? "neon-btn neon-btn-green hover:animate-button-press"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700"
              } animate-fade-in-up delay-700`}
            >
              <Play className="w-6 h-6 animate-pulse" />
              {teams.length < 2 ? "ADD AT LEAST 2 TEAMS" : "START GAME!"}
            </button>

            {/* How to Play */}
            <div className="mt-8 p-6 bg-blue-900/20 rounded-xl border-2 border-blue-500/50">
              <h3 className="font-bold text-blue-400 mb-3">📖 HOW TO PLAY</h3>
              <ul className="text-blue-300/80 space-y-2 text-sm">
                <li>• Each team takes turns - one <span className="text-pink-400">DESCRIBER</span>, rest are <span className="text-cyan-400">GUESSERS</span></li>
                <li>• The Describer picks words from a grid and describes them</li>
                <li>• <span className="text-red-400 font-bold">You cannot say the word itself!</span> It's TABOO!</li>
                <li>• Guessers type their guesses - correct guesses score points</li>
                <li>• 60 seconds per round - get as many words as possible!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING PHASE - Role Selection
  if (phase === "playing" && !role) {
    return (
      <div className="min-h-screen p-4 md:p-8 page-enter">
        <div className="max-w-4xl mx-auto">
          {/* Scoreboard */}
          <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {teams.map((team, idx) => (
              <div
                key={team.id}
                className={`${team.color.light} rounded-xl p-3 border-2 ${team.color.border} ${
                  idx === currentTeamIndex ? `${team.color.glow} scale-105 animate-pulse` : "opacity-70"
                } transition-all card-enter hover:animate-pulse-glow`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`${team.color.text} font-bold text-xs truncate`}>{team.name}</div>
                <div className={`${team.color.text} text-2xl font-bold animate-bounce-in`} style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}>{team.score}</div>
                <div className="text-xs text-gray-400">R{(roundsPlayed[team.id] || 0) + 1}/{roundsPerTeam}</div>
              </div>
            ))}
          </div>

          {/* Current Team Banner */}
          <div className={`${currentTeam.color.light} rounded-2xl p-8 border-2 ${currentTeam.color.border} ${currentTeam.color.glow} text-center mb-8 animate-bounce-in delay-300`}>
            <div className="text-sm text-gray-400 mb-2 animate-fade-in-up">IT'S TIME FOR...</div>
            <h2 className={`pixel-font text-3xl md:text-4xl font-bold ${currentTeam.color.text} mb-2 animate-glow-pulse`}>
              {currentTeam.name}
            </h2>
            <div className="text-gray-400 animate-fade-in-up delay-200">Round {(roundsPlayed[currentTeam.id] || 0) + 1} of {roundsPerTeam}</div>
          </div>

          {/* Role Selection */}
          <div className="neon-card neon-box-cyan p-8 card-3d animate-scale-in delay-400">
            <h3 className="text-xl font-bold text-center text-cyan-400 mb-6 animate-fade-in-up">WHAT'S YOUR ROLE?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => { setRole("describer"); startRound(); }}
                className={`${currentTeam.color.light} border-2 ${currentTeam.color.border} ${currentTeam.color.glow} p-8 rounded-2xl transition-all hover:scale-105 flex flex-col items-center gap-4 card-enter animate-stagger-1 hover:animate-pulse-glow`}
              >
                <div className={`w-20 h-20 ${currentTeam.color.bg} rounded-full flex items-center justify-center animate-rotate-in`}>
                  <Crown className="w-10 h-10 text-black animate-bounce" />
                </div>
                <span className={`text-2xl font-bold ${currentTeam.color.text} pixel-font text-sm`}>DESCRIBER</span>
                <span className="text-gray-400 text-sm text-center">
                  Pick words and describe them to your team
                </span>
              </button>

              <button
                onClick={() => { setRole("guesser"); startRound(); }}
                className="bg-gray-800/50 border-2 border-gray-600 hover:border-cyan-500 hover:neon-box-cyan p-8 rounded-2xl transition-all hover:scale-105 flex flex-col items-center gap-4 card-enter animate-stagger-2 hover:animate-pulse-glow"
              >
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center animate-rotate-in delay-200">
                  <Users className="w-10 h-10 text-gray-300 animate-pulse" />
                </div>
                <span className="text-2xl font-bold text-gray-300 pixel-font text-sm">GUESSER</span>
                <span className="text-gray-500 text-sm text-center">
                  Listen and type your guesses
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING PHASE - Describer View
  if (phase === "playing" && role === "describer") {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Timer and Score */}
          <div className={`${currentTeam.color.light} rounded-2xl p-4 mb-6 border-2 ${currentTeam.color.border} ${currentTeam.color.glow}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-400">TEAM</div>
                  <div className={`font-bold ${currentTeam.color.text}`}>{currentTeam.name}</div>
                </div>
              </div>
              <div className={`text-5xl md:text-6xl font-bold pixel-font ${
                timeLeft <= 10 ? "text-red-400 neon-glow-pink animate-heartbeat" : currentTeam.color.text
              } animate-bounce-in`}>
                {timeLeft}
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-xs text-gray-400">CORRECT</div>
                  <div className="font-bold text-2xl text-green-400">{roundScore.correct}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">SKIPPED</div>
                  <div className="font-bold text-2xl text-yellow-400">{roundScore.skipped}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Correct Feedback Animation */}
          {showCorrectFeedback && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
              <div className="bg-green-500 text-black text-4xl md:text-6xl font-bold px-12 py-8 rounded-2xl neon-box-green animate-success pixel-font">
                ✓ CORRECT!
              </div>
            </div>
          )}

          {/* Violation Feedback Animation */}
          {showViolation && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
              <div className="bg-red-500 text-white text-4xl md:text-6xl font-bold px-12 py-8 rounded-2xl neon-box-orange animate-shake pixel-font">
                🚫 TABOO VIOLATION! -1 POINT
              </div>
            </div>
          )}

          {/* Current Word Display */}
          {currentWord ? (
            <div className="neon-card neon-box-pink p-4 md:p-8 mb-6 card-3d animate-zoom-in">
              <div className="text-center">
                <div className="text-xs md:text-sm text-pink-400 font-semibold mb-2 animate-fade-in-down">DESCRIBE THIS WORD:</div>
                <div className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-6 pixel-font neon-glow-cyan animate-bounce-in">
                  {currentWord.word}
                </div>
                <div className="bg-red-900/50 border-2 border-red-500 neon-box-orange text-red-400 rounded-xl p-4 mb-4 inline-block animate-shake">
                  <div className="text-sm md:text-lg font-bold mb-2">🚫 TABOO WORDS (Don't say these!):</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {currentWord.tabooWords.map((taboo, idx) => (
                      <span key={idx} className="bg-red-800/50 px-3 py-1 rounded-lg text-red-300 font-semibold border border-red-500">
                        {taboo}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Describer text input for violation checking */}
                <div className="mt-4">
                  <textarea
                    value={describerText}
                    onChange={(e) => {
                      const text = e.target.value;
                      setDescriberText(text);
                      // Check for violations in real-time
                      if (checkTabooViolation(text)) {
                        handleTabooViolation();
                      }
                    }}
                    placeholder="Type your description here (optional - for violation checking)..."
                    className="w-full px-4 py-3 rounded-lg bg-black/50 border-2 border-gray-600 text-white font-semibold focus:outline-none focus:border-pink-400 text-center resize-none"
                    rows={3}
                  />
                  <div className="text-xs text-gray-400 mt-2">
                    Tip: Describe the word without using the taboo words above!
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center mt-4 md:mt-8 animate-fade-in-up delay-300">
                <button
                  onClick={handleCorrect}
                  className="neon-btn neon-btn-green px-4 md:px-8 py-3 md:py-4 text-sm md:text-xl flex items-center justify-center gap-2 btn-3d hover:animate-button-press"
                >
                  <Check className="w-4 h-4 md:w-6 md:h-6 animate-rotate-in" />
                  TEAM GOT IT!
                </button>
                <button
                  onClick={handleSkip}
                  className="neon-btn neon-btn-yellow px-4 md:px-8 py-3 md:py-4 text-sm md:text-xl flex items-center justify-center gap-2 btn-3d hover:animate-button-press"
                >
                  <X className="w-4 h-4 md:w-6 md:h-6 animate-rotate-in delay-100" />
                  SKIP
                </button>
              </div>
            </div>
          ) : (
            <div className="neon-card neon-box-cyan p-8 mb-6 text-center card-3d animate-pulse">
              <div className="text-xl text-cyan-400 animate-fade-in-up">
                👇 CLICK A WORD FROM THE GRID TO START DESCRIBING!
              </div>
            </div>
          )}

          {/* Word Grid */}
          <div className="neon-card neon-box-cyan p-3 md:p-6 card-3d animate-fade-in delay-400">
            <div className="grid grid-cols-5 gap-1 md:gap-2 lg:gap-3">
              {words.map((card, idx) => {
                const isUsed = usedWords.includes(card.word);
                const isCurrent = currentWord?.word === card.word;
                return (
                  <button
                    key={idx}
                    onClick={() => selectWord(card)}
                    disabled={isUsed}
                    className={`
                      p-1 md:p-2 lg:p-4 rounded-lg font-bold text-[10px] md:text-xs lg:text-base transition-all
                      ${isCurrent 
                        ? `${currentTeam.color.bg} text-black ${currentTeam.color.glow} scale-105 animate-pulse` 
                        : isUsed
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed line-through"
                        : "bg-gray-800/50 text-gray-300 border-2 border-gray-600 hover:border-cyan-400 hover:text-cyan-400 hover:animate-scale-up"
                      }
                    `}
                    style={{ animationDelay: `${idx * 0.02}s` }}
                  >
                    {card.word}
                  </button>
                );
              })}
            </div>
          </div>

          {/* End Round Button */}
          <button
            onClick={endRound}
            className="w-full mt-6 py-4 bg-red-900/50 border-2 border-red-500 text-red-400 rounded-xl font-bold hover:neon-box-orange transition-all"
          >
            END ROUND EARLY
          </button>
        </div>
      </div>
    );
  }

  // PLAYING PHASE - Guesser View
  if (phase === "playing" && role === "guesser") {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className={`${currentTeam.color.light} rounded-2xl p-6 mb-6 border-2 ${currentTeam.color.border} ${currentTeam.color.glow} text-center`}>
            <div className="text-sm text-gray-400 mb-1">{currentTeam.name}</div>
            <div className={`text-5xl font-bold pixel-font ${
              timeLeft <= 10 ? "text-red-400 animate-pulse" : currentTeam.color.text
            }`}>
              {timeLeft}
            </div>
            <div className="mt-2 text-2xl font-bold text-green-400">
              {roundScore.correct} CORRECT
            </div>
          </div>

          {/* Correct Feedback */}
          {showCorrectFeedback && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
              <div className="bg-green-500 text-black text-4xl font-bold px-8 py-6 rounded-2xl neon-box-green animate-bounce pixel-font">
                ✓ CORRECT!
              </div>
            </div>
          )}

          {/* Guess Input */}
          <div className="neon-card neon-box-pink p-4 md:p-8 mb-6 card-3d">
            <div className="text-center mb-4 md:mb-6">
              <div className="text-lg md:text-2xl font-bold text-pink-400 mb-2 pixel-font text-xs md:text-sm">
                {currentWord ? `🎯 GUESS THE WORD: "${currentWord.word.toUpperCase()}"` : "⏳ WAITING..."}
              </div>
              <div className="text-sm md:text-base text-gray-400">
                {currentWord ? "Listen to the clues and type your guess!" : "The describer is choosing a word..."}
              </div>
            </div>

            <form onSubmit={submitGuess} className="space-y-4">
              <input
                ref={guessInputRef}
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your guess here..."
                disabled={!currentWord}
                className={`w-full px-4 md:px-6 py-3 md:py-5 rounded-xl text-base md:text-xl font-semibold text-center bg-black/50 border-2 ${
                  currentWord 
                    ? `${currentTeam.color.border} focus:${currentTeam.color.glow}`
                    : "border-gray-700"
                } text-white focus:outline-none transition-all`}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!currentWord || !guess.trim()}
                className={`w-full py-3 md:py-5 rounded-xl text-base md:text-xl font-bold transition-all ${
                  currentWord && guess.trim()
                    ? "neon-btn neon-btn-green"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700"
                }`}
              >
                <Zap className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
                SUBMIT GUESS
              </button>
            </form>
          </div>

          {/* Guess History */}
          {guessHistory.length > 0 && (
            <div className="neon-card p-6 border-2 border-gray-700 card-3d">
              <h3 className="font-bold text-gray-400 mb-3 text-sm">YOUR GUESSES:</h3>
              <div className="flex flex-wrap gap-2">
                {guessHistory.slice(-10).map((item, idx) => (
                  <span
                    key={idx}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      item.correct 
                        ? "bg-green-900/50 text-green-400 border border-green-500" 
                        : "bg-gray-800 text-gray-500 border border-gray-700"
                    }`}
                  >
                    {item.guess}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ROUND END PHASE
  if (phase === "roundEnd") {
    return (
      <div className="min-h-screen p-4 md:p-8 py-8">
        <div className="max-w-2xl w-full mx-auto">
          <div className={`${currentTeam.color.light} rounded-2xl p-8 border-2 ${currentTeam.color.border} ${currentTeam.color.glow} text-center`}>
            <div className="text-6xl mb-4 float">🎉</div>
            <h2 className={`pixel-font text-2xl md:text-3xl font-bold ${currentTeam.color.text} mb-2`}>
              ROUND COMPLETE!
            </h2>
            <div className="text-gray-400 mb-6">{currentTeam.name}</div>
            
            <div className="bg-black/30 rounded-xl p-6 mb-8 neon-box-green">
              <div className="text-5xl font-bold text-green-400 mb-2 pixel-font">+{roundScore.correct}</div>
              <div className="text-green-300">POINTS THIS ROUND</div>
              <div className="text-sm text-gray-500 mt-2">({roundScore.skipped} skipped)</div>
            </div>

            <div className="bg-black/20 rounded-xl p-4 mb-8">
              <div className="text-sm text-gray-400">TOTAL SCORE</div>
              <div className={`text-3xl font-bold ${currentTeam.color.text} pixel-font`}>
                {(teams.find(t => t.id === currentTeam.id)?.score || 0) + Math.max(0, roundScore.correct - roundScore.violations)}
              </div>
            </div>

            <button
              onClick={nextRound}
              className="neon-btn neon-btn-cyan w-full py-5 text-xl btn-3d"
            >
              NEXT TEAM →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GAME OVER PHASE
  if (phase === "gameOver") {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    const winner = sortedTeams[0];

    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Winner Banner */}
          <div className={`${winner.color.light} rounded-2xl p-8 border-2 ${winner.color.border} ${winner.color.glow} text-center mb-8`}>
            <div className="text-6xl mb-4 float">🏆</div>
            <div className="text-sm text-gray-400 mb-2">THE WINNER IS...</div>
            <h1 className={`pixel-font text-3xl md:text-5xl font-bold ${winner.color.text} mb-4`}>
              {winner.name}
            </h1>
            <div className={`text-3xl font-bold ${winner.color.text} pixel-font`}>{winner.score} POINTS!</div>
          </div>

          {/* Final Standings */}
          <div className="neon-card neon-box-cyan p-8 mb-8 card-3d">
            <h2 className="text-xl font-bold text-cyan-400 mb-6 text-center pixel-font">FINAL STANDINGS</h2>
            <div className="space-y-4">
              {sortedTeams.map((team, idx) => (
                <div
                  key={team.id}
                  className={`${team.color.light} rounded-xl p-4 border-2 ${team.color.border} ${idx === 0 ? team.color.glow : ''} flex items-center gap-4`}
                >
                  <div className={`w-12 h-12 rounded-full ${team.color.bg} flex items-center justify-center text-black font-bold text-xl`}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`${team.color.text} font-bold text-xl`}>{team.name}</div>
                  </div>
                  <div className={`${team.color.text} text-3xl font-bold pixel-font`}>{team.score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={resetGame}
              className="flex-1 neon-btn neon-btn-green py-5 text-xl flex items-center justify-center gap-2 btn-3d"
            >
              <RotateCcw className="w-6 h-6" />
              PLAY AGAIN
            </button>
            <Link
              href="/games"
              className="flex-1 neon-btn neon-btn-pink py-5 text-xl flex items-center justify-center gap-2 btn-3d"
            >
              <ArrowLeft className="w-6 h-6" />
              BACK TO GAMES
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function TabooPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-cyan-400 text-xl">Loading game...</div>
      </div>
    }>
      <TabooPageContent />
    </Suspense>
  );
}
