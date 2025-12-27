"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Lock,
  Globe,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Plus,
  Search,
  Play,
  Crown,
  Clock,
} from "lucide-react";

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
  teams: Array<{
    id: string;
    name: string;
    color: string;
    players: Array<{ id: string; name: string }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface GameLobbyProps {
  gameType: string;
  gameName: string;
  gameIcon: string;
  maxPlayers?: number;
  minPlayers?: number;
  teamMode?: boolean;
  defaultTeams?: Array<{ id: string; name: string; color: string }>;
  onJoinRoom: (room: GameRoom) => void;
  onCreateRoom?: (room: GameRoom) => void;
  backUrl?: string;
}

export default function GameLobby({
  gameType,
  gameName,
  gameIcon,
  maxPlayers = 4,
  minPlayers = 2,
  teamMode = false,
  defaultTeams = [],
  onJoinRoom,
  onCreateRoom,
  backUrl = "/games",
}: GameLobbyProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [publicRooms, setPublicRooms] = useState<GameRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createAsPrivate, setCreateAsPrivate] = useState(false);

  // Load current user
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(user));
  }, [router]);

  // Load public rooms
  const loadPublicRooms = useCallback(async () => {
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      
      // Clean up stale/empty rooms before fetching
      await gameRoomsAPI.cleanupStaleRooms();
      
      const result = await gameRoomsAPI.getPublicRooms(gameType);
      if (result.success) {
        // Additional client-side filter: only show rooms with at least 1 player
        const validRooms = result.rooms.filter((room: any) => 
          room.currentPlayers && room.currentPlayers.length > 0
        );
        setPublicRooms(validRooms);
      } else if (result.error) {
        // Don't show error for missing table - just show empty list
        if (!result.error.includes("game_rooms") && !result.error.includes("schema cache")) {
          console.error("Error loading public rooms:", result.error);
        }
      }
    } catch (error: any) {
      // Don't show error for missing table
      if (!error.message?.includes("game_rooms") && !error.message?.includes("schema cache")) {
        console.error("Error loading public rooms:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [gameType]);

  useEffect(() => {
    if (currentUser) {
      loadPublicRooms();
      // Refresh every 2 seconds
      const interval = setInterval(loadPublicRooms, 2000);
      return () => clearInterval(interval);
    }
  }, [currentUser, loadPublicRooms]);

  // Create a new room
  const handleCreateRoom = async (isPrivate: boolean) => {
    if (!currentUser || isCreating) return;
    
    setIsCreating(true);
    setJoinError("");
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      
      const result = await gameRoomsAPI.createRoom({
        gameType,
        hostId: currentUser.id,
        hostName: currentUser.name,
        isPrivate,
        maxPlayers,
        minPlayers,
        teamMode,
        teams: teamMode ? defaultTeams.map(t => ({ ...t, players: [] })) : [],
      });
      
      if (result.success && result.room) {
        if (onCreateRoom) {
          onCreateRoom(result.room);
        }
        onJoinRoom(result.room);
      } else {
        const errorMsg = result.error || "Failed to create room";
        // Check if it's a database table error
        if (errorMsg.includes("game_rooms") || errorMsg.includes("schema cache")) {
          setJoinError("Database not set up. Please run SUPABASE_GAME_ROOMS.sql in your Supabase SQL editor.");
        } else {
          setJoinError(errorMsg);
        }
      }
    } catch (error: any) {
      console.error("Error creating room:", error);
      const errorMsg = error.message || "Failed to create room";
      if (errorMsg.includes("game_rooms") || errorMsg.includes("schema cache")) {
        setJoinError("Database not set up. Please run SUPABASE_GAME_ROOMS.sql in your Supabase SQL editor.");
      } else {
        setJoinError(errorMsg);
      }
    } finally {
      setIsCreating(false);
      setShowCreateModal(false);
    }
  };

  // Join room by code
  const handleJoinByCode = async () => {
    if (!currentUser || !joinCode.trim()) return;
    
    setJoinError("");
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      const result = await gameRoomsAPI.joinRoom(
        joinCode.trim().toUpperCase(),
        currentUser.id,
        currentUser.name
      );
      
      if (result.success && result.room) {
        onJoinRoom(result.room);
      } else {
        const errorMsg = result.error || "Failed to join room";
        // Check if it's a database table error
        if (errorMsg.includes("game_rooms") || errorMsg.includes("schema cache")) {
          setJoinError("Database not set up. Please run SUPABASE_GAME_ROOMS.sql in your Supabase SQL editor.");
        } else {
          setJoinError(errorMsg);
        }
      }
    } catch (error: any) {
      console.error("Error joining room:", error);
      const errorMsg = error.message || "Failed to join room";
      if (errorMsg.includes("game_rooms") || errorMsg.includes("schema cache")) {
        setJoinError("Database not set up. Please run SUPABASE_GAME_ROOMS.sql in your Supabase SQL editor.");
      } else {
        setJoinError(errorMsg);
      }
    }
  };

  // Quick match
  const handleQuickMatch = async () => {
    if (!currentUser || isCreating) return;
    
    setIsCreating(true);
    setJoinError("");
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      const result = await gameRoomsAPI.quickMatch({
        gameType,
        userId: currentUser.id,
        userName: currentUser.name,
        maxPlayers,
        minPlayers,
      });
      
      if (result.success && result.room) {
        onJoinRoom(result.room);
      } else {
        const errorMsg = result.error || "Failed to find match";
        // Check if it's a database table error
        if (errorMsg.includes("game_rooms") || errorMsg.includes("schema cache")) {
          setJoinError("Database not set up. Please run SUPABASE_GAME_ROOMS.sql in your Supabase SQL editor.");
        } else {
          setJoinError(errorMsg);
        }
      }
    } catch (error: any) {
      console.error("Error in quick match:", error);
      const errorMsg = error.message || "Failed to find match";
      if (errorMsg.includes("game_rooms") || errorMsg.includes("schema cache")) {
        setJoinError("Database not set up. Please run SUPABASE_GAME_ROOMS.sql in your Supabase SQL editor.");
      } else {
        setJoinError(errorMsg);
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Join existing room
  const handleJoinRoom = async (room: GameRoom) => {
    if (!currentUser) return;
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      const result = await gameRoomsAPI.joinRoom(
        room.code,
        currentUser.id,
        currentUser.name
      );
      
      if (result.success && result.room) {
        onJoinRoom(result.room);
      } else {
        const errorMsg = result.error || "Failed to join room";
        // Check if it's a database table error
        if (errorMsg.includes("game_rooms") || errorMsg.includes("schema cache")) {
          setJoinError("Database not set up. Please run SUPABASE_GAME_ROOMS.sql in your Supabase SQL editor.");
        } else {
          setJoinError(errorMsg);
        }
      }
    } catch (error: any) {
      console.error("Error joining room:", error);
      const errorMsg = error.message || "Failed to join room";
      if (errorMsg.includes("game_rooms") || errorMsg.includes("schema cache")) {
        setJoinError("Database not set up. Please run SUPABASE_GAME_ROOMS.sql in your Supabase SQL editor.");
      } else {
        setJoinError(errorMsg);
      }
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>BACK TO GAMES</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="pixel-font text-3xl md:text-5xl font-bold text-pink-400 neon-glow-pink mb-4">
            {gameIcon} {gameName}
          </h1>
          <p className="text-cyan-300">
            Join a game or create your own room
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Quick Match */}
          <button
            onClick={handleQuickMatch}
            disabled={isCreating}
            className="neon-card neon-box-green p-6 text-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Zap className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <h3 className="text-xl font-bold text-green-400 mb-2">QUICK MATCH</h3>
            <p className="text-green-300/70 text-sm">
              Join or create a public game instantly
            </p>
          </button>

          {/* Create Public Room */}
          <button
            onClick={() => handleCreateRoom(false)}
            disabled={isCreating}
            className="neon-card neon-box-cyan p-6 text-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Globe className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
            <h3 className="text-xl font-bold text-cyan-400 mb-2">PUBLIC ROOM</h3>
            <p className="text-cyan-300/70 text-sm">
              Create a room anyone can join
            </p>
          </button>

          {/* Create Private Room */}
          <button
            onClick={() => handleCreateRoom(true)}
            disabled={isCreating}
            className="neon-card neon-box-purple p-6 text-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Lock className="w-12 h-12 mx-auto mb-3 text-purple-400" />
            <h3 className="text-xl font-bold text-purple-400 mb-2">PRIVATE ROOM</h3>
            <p className="text-purple-300/70 text-sm">
              Create a room with invite code
            </p>
          </button>
        </div>

        {/* Join by Code */}
        <div className="neon-card neon-box-yellow p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            JOIN WITH CODE
          </h2>
          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                setJoinError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleJoinByCode();
                }
              }}
              placeholder="Enter room code (e.g., ABC123)"
              className="flex-1 px-4 py-3 bg-gray-800 border-2 border-yellow-500/50 rounded-lg text-yellow-300 placeholder-yellow-500/50 font-mono text-lg tracking-widest focus:border-yellow-400 focus:outline-none"
              maxLength={6}
            />
            <button
              onClick={handleJoinByCode}
              disabled={!joinCode.trim() || joinCode.length !== 6}
              className="neon-btn neon-btn-yellow px-6 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5 inline mr-2" />
              JOIN
            </button>
          </div>
          {joinError && (
            <div className="mt-3 text-red-400 text-sm">{joinError}</div>
          )}
        </div>

        {/* Public Rooms List */}
        <div className="neon-card neon-box-cyan p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
              <Users className="w-5 h-5" />
              PUBLIC GAMES
            </h2>
            <button
              onClick={loadPublicRooms}
              className="text-cyan-400 hover:text-cyan-300 transition-colors p-2"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-cyan-300/70">
              Loading available games...
            </div>
          ) : publicRooms.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
              <p className="text-cyan-300/70 mb-2">No public games available</p>
              <p className="text-cyan-300/50 text-sm">
                Be the first to create one!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {publicRooms.map((room) => {
                const isFull = room.currentPlayers.length >= room.maxPlayers;
                const isInRoom = room.currentPlayers.some(p => p.id === currentUser.id);
                
                return (
                  <div
                    key={room.id}
                    className={`bg-gray-800/50 rounded-xl p-4 border-2 transition-all ${
                      isInRoom
                        ? "border-green-500"
                        : isFull
                        ? "border-gray-600 opacity-50"
                        : "border-cyan-500/50 hover:border-cyan-400"
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Crown className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-semibold truncate">
                            {room.hostName}'s Game
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-cyan-300/70">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {room.currentPlayers.length}/{room.maxPlayers}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimeAgo(room.createdAt)}
                          </span>
                          <span className="font-mono text-cyan-400">
                            #{room.code}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(room.code)}
                          className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                          title="Copy code"
                        >
                          {copiedCode === room.code ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                        
                        {isInRoom ? (
                          <button
                            onClick={() => onJoinRoom(room)}
                            className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg"
                          >
                            REJOIN
                          </button>
                        ) : isFull ? (
                          <span className="px-4 py-2 bg-gray-700 text-gray-500 font-bold rounded-lg">
                            FULL
                          </span>
                        ) : (
                          <button
                            onClick={() => handleJoinRoom(room)}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors"
                          >
                            JOIN
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Player list */}
                    {room.currentPlayers.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="flex flex-wrap gap-2">
                          {room.currentPlayers.map((player) => (
                            <span
                              key={player.id}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                player.isHost
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-cyan-500/20 text-cyan-400"
                              }`}
                            >
                              {player.isHost && "👑 "}
                              {player.name}
                              {player.isReady && " ✓"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-900/20 rounded-xl border-2 border-blue-500/50">
          <h3 className="font-bold text-blue-400 mb-2">ℹ️ HOW IT WORKS</h3>
          <ul className="text-blue-300/80 space-y-1 text-sm">
            <li>• <strong>Quick Match:</strong> Instantly join an available game or create a new one</li>
            <li>• <strong>Public Room:</strong> Anyone can see and join your game</li>
            <li>• <strong>Private Room:</strong> Share the 6-digit code with friends to let them join</li>
            <li>• Players: {minPlayers}-{maxPlayers} players per game</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

