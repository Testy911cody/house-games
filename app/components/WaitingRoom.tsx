"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Users, Clock, Zap, Copy, Check, Crown, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";

interface RoomPlayer {
  id: string;
  name: string;
  team?: string;
  isReady: boolean;
  isHost: boolean;
  joinedAt: string;
}

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
  currentPlayers: RoomPlayer[];
  settings: Record<string, any>;
  teamMode: boolean;
  teams: Array<{ id: string; name: string; color: string; players: Array<{ id: string; name: string }> }>;
  createdAt: string;
  updatedAt: string;
}

interface AvailableTeam {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  adminName: string;
}

interface WaitingRoomProps {
  gameType: string;
  gameName: string;
  gameIcon: string;
  currentTeamName: string;
  currentTeamId: string | null;
  gameId: string;
  currentUser: any;
  roomCode?: string; // New: Room code for sharing
  room?: GameRoom; // New: Room data if using new room system
  onTeamJoined?: (teamId: string, teamName: string) => void;
  onPlayerJoined?: (player: RoomPlayer) => void; // New: Called when a player joins
  onStartGame: () => void;
  onPlayAgainstComputer: () => void;
  onLeaveRoom?: () => void; // New: Called when leaving the room
  minPlayers?: number;
  maxPlayers?: number;
  waitTime?: number; // seconds
  showAvailableGames?: boolean; // Show other games waiting for players
  showAvailableTeams?: boolean; // Show teams to invite (legacy mode)
}

export default function WaitingRoom({
  gameType,
  gameName,
  gameIcon,
  currentTeamName,
  currentTeamId,
  gameId,
  currentUser,
  roomCode,
  room: initialRoom,
  onTeamJoined,
  onPlayerJoined,
  onStartGame,
  onPlayAgainstComputer,
  onLeaveRoom,
  minPlayers = 2,
  maxPlayers = 4,
  waitTime = 30,
  showAvailableGames = true,
  showAvailableTeams = true,
}: WaitingRoomProps) {
  const [room, setRoom] = useState<GameRoom | null>(initialRoom || null);
  const [availableTeams, setAvailableTeams] = useState<AvailableTeam[]>([]);
  const [joinedTeamIds, setJoinedTeamIds] = useState<string[]>([]);
  const [isPlayingAgainstComputer, setIsPlayingAgainstComputer] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [waitingRoomStartTime, setWaitingRoomStartTime] = useState<number | null>(null);
  const [availableGames, setAvailableGames] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Use refs to track previous state without causing re-renders
  const previousPlayersRef = useRef<RoomPlayer[]>(initialRoom?.currentPlayers || []);
  const previousStatusRef = useRef<string>(initialRoom?.status || 'waiting');

  // Get effective room code
  const effectiveRoomCode = roomCode || room?.code || null;
  
  // Check if using new room system
  const isRoomBasedGame = !!room || !!roomCode;

  useEffect(() => {
    setWaitingRoomStartTime(Date.now());
    if (showAvailableTeams) {
    loadAvailableTeams();
    }
    if (showAvailableGames) {
      loadAvailableGames();
    }
    
    // Update team's last game access when entering waiting room
    if (currentTeamId) {
      const updateAccess = async () => {
        try {
          const { teamsAPI } = await import('@/lib/api-utils');
          await teamsAPI.updateTeamGameAccess(currentTeamId);
        } catch (error) {
          console.error('Error updating team game access:', error);
        }
      };
      updateAccess();
    }
  }, []);

  // Sync room state when initialRoom changes
  useEffect(() => {
    if (initialRoom) {
      setRoom(initialRoom);
      previousPlayersRef.current = initialRoom.currentPlayers || [];
      previousStatusRef.current = initialRoom.status || 'waiting';
    }
  }, [initialRoom]);

  // Poll room state for real-time sync (new room system)
  useEffect(() => {
    if (!effectiveRoomCode || !currentUser) return;
    
    const pollRoom = async () => {
      try {
        const { gameRoomsAPI } = await import('@/lib/api-utils');
        const result = await gameRoomsAPI.getRoomByCode(effectiveRoomCode);
        
        if (result.success && result.room) {
          const newRoom = result.room;
          
          // Update our activity when polling (this happens automatically in getRoomByCode, but ensure it's done)
          if (newRoom && currentUser) {
            const { gameRoomsAPI } = await import('@/lib/api-utils');
            gameRoomsAPI.updatePlayerActivity(newRoom.id, currentUser.id).catch(() => {
              // Ignore errors - activity update is best effort
            });
          }
          
          // Get current previous players from ref
          const previousPlayers = previousPlayersRef.current;
          
          // Log player changes for debugging
          if (newRoom.currentPlayers.length !== previousPlayers.length) {
            console.log('👥 Player count changed:', {
              previous: previousPlayers.length,
              current: newRoom.currentPlayers.length,
              previousPlayers: previousPlayers.map(p => p.name),
              currentPlayers: newRoom.currentPlayers.map(p => p.name)
            });
          }
          
          // Check if new players joined
          if (onPlayerJoined) {
            const joinedPlayers = newRoom.currentPlayers.filter(
              p => !previousPlayers.some(existing => existing.id === p.id) && p.id !== currentUser.id
            );
            if (joinedPlayers.length > 0) {
              console.log('👥 New players joined:', joinedPlayers.map(p => p.name));
              joinedPlayers.forEach(player => onPlayerJoined(player));
            }
          }
          
          // Sync my ready status from server
          const myPlayer = newRoom.currentPlayers.find(p => p.id === currentUser.id);
          if (myPlayer) {
            setIsReady(prevReady => {
              if (myPlayer.isReady !== prevReady) {
                return myPlayer.isReady;
              }
              return prevReady;
            });
          }
          
          // Don't auto-start game - only update room state
          // Game should only start when host explicitly clicks start button
          // The onStartGame callback will be called by the host's click action, not here
          
          // Update state - always update to ensure allReady calculation is correct
          // Update refs before setting state to avoid stale closures
          previousPlayersRef.current = newRoom.currentPlayers;
          previousStatusRef.current = newRoom.status;
          
          // Always update room state to ensure UI reflects latest player list
          // This ensures players are displayed immediately when they join
          setRoom(newRoom);
        }
      } catch (error) {
        console.error('Error polling room:', error);
      }
    };
    
    const intervalId = setInterval(pollRoom, 1000);
    pollRoom(); // Initial poll
    
    return () => clearInterval(intervalId);
  }, [effectiveRoomCode, currentUser, onPlayerJoined, onStartGame]);

  // Load available teams for this game (legacy mode)
  const loadAvailableTeams = async () => {
    try {
      const { teamsAPI } = await import('@/lib/api-utils');
      const { isSupabaseConfigured } = await import('@/lib/supabase');
      const result = await teamsAPI.getTeams();
      
      if (result.success && result.teams) {
        const onlineTeams = result.teams
          .filter((team: any) => {
            if (team.id === currentTeamId) return false;
            
            const isFromSupabase = isSupabaseConfigured();
            if (isFromSupabase) return true;
            
            const adminOnline = teamsAPI.isUserOnline(team.adminId);
            const membersOnline = team.members?.some((member: any) => 
              teamsAPI.isUserOnline(member.id)
            ) || false;
            const teamAge = Date.now() - new Date(team.createdAt).getTime();
            const isNewTeam = teamAge < 10 * 60 * 1000;
            
            return adminOnline || membersOnline || isNewTeam;
          })
          .map((team: any) => ({
            id: team.id,
            name: team.name,
            code: team.code,
            memberCount: (team.members?.length || 0) + 1,
            adminName: team.adminName,
          }));
        
        setAvailableTeams(onlineTeams);
      }
    } catch (error) {
      console.error('Error loading available teams:', error);
      setAvailableTeams([]);
    }
  };

  // Load other games waiting for players
  const loadAvailableGames = async () => {
    try {
      const { gameRoomsAPI } = await import('@/lib/api-utils');
      const result = await gameRoomsAPI.getPublicRooms(gameType);
      
      if (result.success && result.rooms) {
        // Filter out current room
        const otherGames = result.rooms.filter((r: any) => 
          r.id !== room?.id && r.code !== effectiveRoomCode
        );
        setAvailableGames(otherGames);
      }
    } catch (error) {
      console.error('Error loading available games:', error);
    }
  };

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (showAvailableTeams) loadAvailableTeams();
      if (showAvailableGames) loadAvailableGames();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [gameId, showAvailableGames, showAvailableTeams]);
  
  // Poll game state for legacy sync
  useEffect(() => {
    if (!gameId || !currentUser || isRoomBasedGame) return;
    
    const pollGameState = async () => {
      try {
        const { gameStateAPI } = await import('@/lib/api-utils');
        const result = await gameStateAPI.getGameState(gameId);
        
        if (result.success && result.state) {
          const remoteState = result.state.state;
          
          if (result.state.updatedBy !== currentUser.id && remoteState.phase === "waiting") {
            if (remoteState.joinedTeamIds && Array.isArray(remoteState.joinedTeamIds)) {
              const remoteJoinedIds = remoteState.joinedTeamIds;
              if (JSON.stringify(remoteJoinedIds.sort()) !== JSON.stringify(joinedTeamIds.sort())) {
                setJoinedTeamIds(remoteJoinedIds);
                setIsPlayingAgainstComputer(remoteState.isPlayingAgainstComputer !== false);
                
                if (onTeamJoined && remoteJoinedIds.length > joinedTeamIds.length) {
                  const newTeams = remoteJoinedIds.filter((id: string) => !joinedTeamIds.includes(id));
                  for (const teamId of newTeams) {
                    const { teamsAPI } = await import('@/lib/api-utils');
                    const teamsResult = await teamsAPI.getTeams();
                    if (teamsResult.success && teamsResult.teams) {
                      const team = teamsResult.teams.find((t: any) => t.id === teamId);
                      if (team) onTeamJoined(teamId, team.name);
                    }
                  }
                }
              }
            }
            
            if (remoteState.isPlayingAgainstComputer !== undefined) {
              setIsPlayingAgainstComputer(remoteState.isPlayingAgainstComputer);
            }
          }
        }
      } catch (error) {
        console.error('Error polling game state:', error);
      }
    };
    
    const intervalId = setInterval(pollGameState, 1000);
    pollGameState();
    
    return () => clearInterval(intervalId);
  }, [gameId, currentUser, joinedTeamIds, onTeamJoined, isRoomBasedGame]);

  // Countdown timer
  useEffect(() => {
    if (!waitingRoomStartTime) return;
    
    const elapsed = Math.floor((Date.now() - waitingRoomStartTime) / 1000);
    const remaining = Math.max(0, waitTime - elapsed);
    
    if (remaining > 0) {
      setCountdown(remaining);
      const timer = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - waitingRoomStartTime) / 1000);
        const newRemaining = Math.max(0, waitTime - newElapsed);
        setCountdown(newRemaining);
        
        if (newRemaining === 0 && isPlayingAgainstComputer && playerCount < minPlayers) {
          onPlayAgainstComputer();
        }
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      if (isPlayingAgainstComputer && playerCount < minPlayers) {
        onPlayAgainstComputer();
      }
    }
  }, [waitingRoomStartTime, waitTime, isPlayingAgainstComputer, minPlayers]);

  // Join as team (legacy)
  const joinAsTeam = async (teamId: string) => {
    try {
      const { teamsAPI } = await import('@/lib/api-utils');
      const result = await teamsAPI.getTeams();
      
      if (result.success && result.teams) {
        const team = result.teams.find((t: any) => t.id === teamId);
        if (team && !joinedTeamIds.includes(teamId)) {
          const updatedJoinedIds = [...joinedTeamIds, teamId];
          setJoinedTeamIds(updatedJoinedIds);
          setIsPlayingAgainstComputer(false);
          
          if (gameId && currentUser) {
            const { gameStateAPI } = await import('@/lib/api-utils');
            await gameStateAPI.saveGameState({
              id: gameId,
              gameType: gameType,
              teamId: currentTeamId || undefined,
              state: {
                phase: "waiting",
                joinedTeamIds: updatedJoinedIds,
                isPlayingAgainstComputer: false,
                currentTeamName: currentTeamName,
                currentTeamId: currentTeamId,
                roomCode: effectiveRoomCode,
              },
              lastUpdated: new Date().toISOString(),
              updatedBy: currentUser.id,
            });
          }
          
          if (onTeamJoined) onTeamJoined(teamId, team.name);
          loadAvailableTeams();
        }
      }
    } catch (error) {
      console.error('Error joining as team:', error);
    }
  };

  // Toggle ready status
  const toggleReady = async () => {
    if (!room || !currentUser) return;
    
    const newReady = !isReady;
    setIsReady(newReady); // Optimistic update
    
    try {
      const { gameRoomsAPI } = await import('@/lib/api-utils');
      const result = await gameRoomsAPI.setPlayerReady(room.id, currentUser.id, newReady);
      if (result.success && result.room) {
        setRoom(result.room);
      } else {
        // Rollback on failure
        setIsReady(!newReady);
      }
    } catch (error) {
      console.error('Error toggling ready:', error);
      // Rollback on error
      setIsReady(!newReady);
    }
  };

  // Copy room code
  const copyRoomCode = () => {
    if (effectiveRoomCode) {
      navigator.clipboard.writeText(effectiveRoomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Share room (native share if available)
  const shareRoom = async () => {
    if (!effectiveRoomCode) return;
    
    const shareData = {
      title: `Join my ${gameName} game!`,
      text: `Join my game with code: ${effectiveRoomCode}`,
      url: `${window.location.origin}/games/${gameType}?code=${effectiveRoomCode}`,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        copyRoomCode();
      }
    } else {
      copyRoomCode();
    }
  };

  // Handle leaving room
  const handleLeaveRoom = async () => {
    if (room && currentUser) {
      try {
        const { gameRoomsAPI } = await import('@/lib/api-utils');
        await gameRoomsAPI.leaveRoom(room.id, currentUser.id);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }
    // Always call onLeaveRoom if provided
    if (onLeaveRoom) {
      onLeaveRoom();
    }
  };

  // Start the game (host only)
  const handleStartGame = async () => {
    console.log('🎮 handleStartGame called', { 
      room: room?.code, 
      hostId: room?.hostId, 
      currentUserId: currentUser?.id,
      isHost: room && currentUser?.id === room.hostId,
      playerCount: room?.currentPlayers?.length 
    });
    
    if (room && currentUser?.id === room.hostId) {
      try {
        const { gameRoomsAPI } = await import('@/lib/api-utils');
        console.log('🎮 Updating room status to playing...');
        const result = await gameRoomsAPI.updateRoomStatus(room.id, 'playing');
        console.log('🎮 Room status update result:', result);
        if (result.success) {
          // Update local room state
          setRoom(prevRoom => prevRoom ? { ...prevRoom, status: 'playing' } : prevRoom);
          // Wait a bit for other clients to receive the update
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.error('❌ Failed to update room status:', result.error);
        }
      } catch (error) {
        console.error('❌ Error starting game:', error);
      }
    } else {
      console.warn('⚠️ Not host or no room:', { 
        hasRoom: !!room, 
        isHost: room && currentUser?.id === room.hostId 
      });
    }
    
    console.log('🎮 Calling onStartGame callback');
    onStartGame();
  };

  // Calculate player count
  const playerCount = isRoomBasedGame 
    ? (room?.currentPlayers.length || 1)
    : (1 + joinedTeamIds.length);
  const canStart = playerCount >= minPlayers;
  const isFull = playerCount >= maxPlayers;
  const isHost = room ? currentUser?.id === room.hostId : true;
  // Calculate allReady: all non-host players must be ready (host can start without being ready themselves)
  // We need at least minPlayers total
  const nonHostPlayers = room ? room.currentPlayers.filter(p => !p.isHost) : [];
  // If there are non-host players, they all must be ready. If no non-host players, we still need minPlayers.
  const allNonHostReady = nonHostPlayers.length === 0 
    ? (room ? room.currentPlayers.length >= minPlayers : true)
    : nonHostPlayers.every(p => p.isReady === true);
  const allReady = room 
    ? (room.currentPlayers.length >= minPlayers && allNonHostReady)
    : true;
  
  // Debug logging (only log when room state changes)
  useEffect(() => {
    if (room && isHost) {
      console.log('🎮 Ready status check:', {
        playerCount: room.currentPlayers.length,
        minPlayers,
        nonHostPlayers: nonHostPlayers.length,
        allNonHostReady,
        allReady,
        players: room.currentPlayers.map(p => ({ id: p.id, name: p.name, isReady: p.isReady, isHost: p.isHost }))
      });
    }
  }, [room?.currentPlayers, allReady, isHost]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleLeaveRoom || (() => window.history.back())}
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>LEAVE ROOM</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="pixel-font text-3xl md:text-5xl font-bold text-pink-400 neon-glow-pink mb-4">
            {gameIcon} {gameName}
          </h1>
          <p className="text-cyan-300">
            Waiting for players to join...
          </p>
        </div>

        {/* Room Code Display */}
        {effectiveRoomCode && (
          <div className="neon-card neon-box-yellow p-6 mb-6 text-center">
            <h2 className="text-lg font-bold text-yellow-400 mb-3">ROOM CODE</h2>
            <div className="flex items-center justify-center gap-4">
              <div className="bg-gray-800 px-6 py-3 rounded-lg border-2 border-yellow-500">
                <span className="text-3xl font-mono font-bold text-yellow-400 tracking-widest">
                  {effectiveRoomCode}
                </span>
              </div>
              <button
                onClick={copyRoomCode}
                className="p-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg border border-yellow-500 transition-colors"
                title="Copy code"
              >
                {copiedCode ? (
                  <Check className="w-6 h-6 text-green-400" />
                ) : (
                  <Copy className="w-6 h-6 text-yellow-400" />
                )}
              </button>
              <button
                onClick={shareRoom}
                className="p-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg border border-yellow-500 transition-colors"
                title="Share"
              >
                <Share2 className="w-6 h-6 text-yellow-400" />
              </button>
            </div>
            <p className="text-yellow-300/70 text-sm mt-3">
              Share this code with friends to let them join!
            </p>
          </div>
        )}

        {/* Current Team/Player Info */}
        <div className="neon-card neon-box-purple p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                <div className="text-purple-400 font-bold">
                  {isHost ? "👑 You are the host" : "You are playing as"}: {currentTeamName || currentUser?.name || "Player"}
                </div>
              </div>
            </div>
            {room && !isHost && (
              <button
                onClick={toggleReady}
                className={`px-4 py-2 font-bold rounded-lg transition-colors ${
                  isReady 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {isReady ? "READY ✓" : "CLICK WHEN READY"}
              </button>
            )}
          </div>
        </div>

        {/* Game Status */}
        <div className="neon-card neon-box-cyan p-6 mb-6">
          <h2 className="pixel-font text-xl text-cyan-400 neon-glow-cyan mb-4 text-center">
            🎮 GAME STATUS
          </h2>
          
          {/* Player Count */}
          <div className="bg-gray-800/50 rounded-xl p-4 border-2 border-gray-600 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                {playerCount} / {maxPlayers}
              </div>
              <div className="text-gray-400 text-sm">Players Joined</div>
              {!canStart && (
                <div className="text-yellow-400 text-sm mt-2">
                  Need at least {minPlayers} players to start
                </div>
              )}
              {isFull && (
                <div className="text-green-400 text-sm mt-2">
                  Game is full! Ready to start
                </div>
              )}
            </div>
          </div>

          {/* Player List (Room-based) */}
          {room && room.currentPlayers.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                PLAYERS IN ROOM
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {room.currentPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg border-2 text-center ${
                      player.isHost
                        ? "bg-yellow-500/20 border-yellow-500"
                        : player.isReady
                        ? "bg-green-500/20 border-green-500"
                        : "bg-gray-800/50 border-gray-600"
                    }`}
                  >
                    {player.isHost && <Crown className="w-4 h-4 text-yellow-400 mx-auto mb-1" />}
                    <div className="text-white font-semibold text-sm truncate">
                      {player.name}
                    </div>
                    <div className={`text-xs mt-1 ${
                      player.isHost ? "text-yellow-400" : player.isReady ? "text-green-400" : "text-gray-500"
                    }`}>
                      {player.isHost ? "HOST" : player.isReady ? "READY" : "NOT READY"}
                    </div>
                  </div>
                ))}
                {/* Empty slots */}
                {Array.from({ length: maxPlayers - room.currentPlayers.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="p-3 rounded-lg border-2 border-dashed border-gray-700 text-center"
                  >
                    <div className="text-gray-600 text-sm">Empty Slot</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Countdown Timer */}
          {countdown !== null && countdown > 0 && !isRoomBasedGame && (
            <div className="text-center mb-4">
              <div className="text-yellow-400 font-bold text-2xl mb-2 flex items-center justify-center gap-2">
                <Clock className="w-6 h-6" />
                {isPlayingAgainstComputer && playerCount < minPlayers
                  ? `Starting in ${countdown} seconds...`
                  : "Waiting for players..."}
              </div>
              {isPlayingAgainstComputer && playerCount < minPlayers && (
                <p className="text-cyan-300/70 text-sm">
                  Game will start automatically with computer players if no one joins
                </p>
              )}
            </div>
          )}

          {/* Available Teams (Legacy) */}
          {showAvailableTeams && !isRoomBasedGame && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              AVAILABLE TEAMS TO JOIN
            </h3>
            
            {availableTeams.length === 0 ? (
              <div className="bg-gray-800/30 rounded-xl p-6 border-2 border-gray-600 text-center">
                <div className="text-gray-400 mb-2">No other teams online</div>
                <div className="text-gray-500 text-sm">
                  {isPlayingAgainstComputer 
                    ? "You'll play against computer players"
                    : "Waiting for teams to come online..."}
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {availableTeams.map((team) => {
                  const isJoined = joinedTeamIds.includes(team.id);
                  const canJoin = !isFull && !isJoined;
                  
                  return (
                    <div
                      key={team.id}
                      className={`bg-gray-800/50 rounded-xl p-4 border-2 ${
                        isJoined ? "border-green-500" : canJoin ? "border-gray-600 hover:border-cyan-500" : "border-gray-700 opacity-50"
                      } transition-all flex items-center justify-between`}
                    >
                      <div className="flex-1">
                        <div className="text-white font-semibold">{team.name}</div>
                        <div className="text-gray-400 text-sm">
                          {team.memberCount} member{team.memberCount !== 1 ? "s" : ""} • Admin: {team.adminName}
                        </div>
                      </div>
                      {isJoined ? (
                        <div className="px-4 py-2 bg-green-500/20 border border-green-500 rounded text-green-400 font-bold text-sm">
                          JOINED ✓
                        </div>
                      ) : canJoin ? (
                        <button
                          onClick={() => joinAsTeam(team.id)}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded transition-all"
                        >
                          JOIN
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-gray-700 text-gray-500 font-bold text-sm rounded">
                          FULL
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* Other Games Waiting */}
          {showAvailableGames && availableGames.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                OTHER {gameName.toUpperCase()} GAMES WAITING
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${gameType}?code=${game.code}`}
                    className="block bg-purple-900/30 rounded-xl p-3 border-2 border-purple-500 hover:border-purple-400 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                    <div className="text-white font-semibold text-sm">
                          {game.hostName}'s Game
                    </div>
                    <div className="text-purple-300 text-xs mt-1">
                          {game.currentPlayers?.length || 1}/{game.maxPlayers} players • Code: {game.code}
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-purple-500 text-white text-sm font-bold rounded">
                        JOIN
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            {isHost && canStart && (
              <button
                onClick={handleStartGame}
                disabled={!!(room && !allReady)}
                className={`flex-1 neon-btn neon-btn-green py-4 text-lg font-bold ${
                  room && !allReady ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {room && !allReady 
                  ? "WAITING FOR PLAYERS TO READY UP"
                  : `START GAME (${playerCount} PLAYERS)`
                }
              </button>
            )}
            {!isHost && room && (
              <div className="flex-1 text-center py-4 text-cyan-300">
                Waiting for host to start the game...
              </div>
            )}
            {!isRoomBasedGame && isPlayingAgainstComputer && playerCount < minPlayers && (
              <button
                onClick={onPlayAgainstComputer}
                className="flex-1 neon-btn neon-btn-yellow py-4 text-lg font-bold"
              >
                START VS COMPUTER
              </button>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-900/20 rounded-xl border-2 border-blue-500/50">
            <h3 className="font-bold text-blue-400 mb-2">ℹ️ HOW IT WORKS</h3>
            <ul className="text-blue-300/80 space-y-1 text-sm">
              <li>• You are playing as: <span className="text-purple-400 font-bold">{currentTeamName || currentUser?.name || "Player"}</span></li>
              {effectiveRoomCode && (
                <li>• Share the room code <span className="text-yellow-400 font-bold">{effectiveRoomCode}</span> with friends</li>
              )}
              <li>• Need {minPlayers}-{maxPlayers} players to start</li>
              {room && !isHost && (
                <li>• Click "READY" when you're ready to play</li>
              )}
              {isHost && room && (
                <li>• As the host, you can start the game when all players are ready</li>
              )}
              {!isRoomBasedGame && isPlayingAgainstComputer && (
                <li>• If no one joins, you'll play against <span className="text-yellow-400 font-bold">COMPUTER</span> players</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
