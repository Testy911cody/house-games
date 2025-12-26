"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Moon, Sun, AlertTriangle, Shield, Skull, Vote, Eye, EyeOff, Globe } from "lucide-react";
import GameLobby from "@/app/components/GameLobby";
import WaitingRoom from "@/app/components/WaitingRoom";

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

type Role = "werewolf" | "villager" | "seer" | "guardian";
type Phase = "lobby" | "waiting" | "setup" | "night" | "day" | "voting" | "gameOver";

interface Player {
  id: number;
  name: string;
  role: Role;
  alive: boolean;
  votes: number;
  votedFor?: number;
  color: string;
  icon: string;
}

const PLAYER_COLORS = ["#ff00ff", "#00ffff", "#00ff00", "#ffff00", "#ff6600", "#9900ff", "#ff0066", "#00ff99"];
const PLAYER_ICONS = ["🐺", "👤", "🧙", "🛡️", "🎭", "🔮", "⚔️", "🎪"];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  werewolf: "You are a WEREWOLF! Eliminate all villagers to win. Work with other werewolves secretly.",
  villager: "You are a VILLAGER! Find and vote out the werewolves to win. Trust no one!",
  seer: "You are the SEER! Each night, you can check if someone is a werewolf. Help the villagers!",
  guardian: "You are the GUARDIAN! Each night, you can protect one player from werewolf attacks.",
};

function WerewolfPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [isOnlineGame, setIsOnlineGame] = useState(false);
  const [gameState, setGameState] = useState<Phase>("lobby");
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerCount, setPlayerCount] = useState(5);
  const [playerNames, setPlayerNames] = useState<string[]>([
    "Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6", "Player 7", "Player 8"
  ]);
  const [currentPhase, setCurrentPhase] = useState<"night" | "day">("night");
  const [round, setRound] = useState(1);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [seerCheck, setSeerCheck] = useState<number | null>(null);
  const [guardianProtect, setGuardianProtect] = useState<number | null>(null);
  const [nightActions, setNightActions] = useState<{
    werewolfKill?: number;
    seerCheck?: number;
    guardianProtect?: number;
  }>({});
  const [dayMessage, setDayMessage] = useState("");
  const [votingPhase, setVotingPhase] = useState(false);
  const [winner, setWinner] = useState<{ team: "werewolves" | "villagers"; players: Player[] } | null>(null);
  const [revealedRoles, setRevealedRoles] = useState<Set<number>>(new Set());
  const [showRole, setShowRole] = useState<{ playerId: number; role: Role } | null>(null);
  
  // Device ID for tracking which device made updates
  const getDeviceId = () => {
    if (typeof window === 'undefined') return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let deviceId = localStorage.getItem('werewolf_deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('werewolf_deviceId', deviceId);
    }
    return deviceId;
  };
  const deviceIdRef = useRef<string>(getDeviceId());
  const lastSyncedStateRef = useRef<string>("");
  const [gameId, setGameId] = useState<string | null>(null);

  // Check for room code in URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      joinRoomByCode(code);
    }
  }, [searchParams]);

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
        setIsOnlineGame(true);
        setGameState("waiting");
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  // Handle room joined from lobby
  const handleJoinRoom = (room: GameRoom) => {
    setGameRoom(room);
    setIsOnlineGame(true);
    setGameState("waiting");
    setGameId(`werewolf_${room.code}`);
  };
  
  // Update gameId when gameRoom changes
  useEffect(() => {
    if (gameRoom) {
      setGameId(`werewolf_${gameRoom.code}`);
    }
  }, [gameRoom?.code]);

  // Poll room status to detect when game starts (even when in waiting phase)
  useEffect(() => {
    if (!gameRoom || !currentUser || gameState !== "waiting" || !isOnlineGame) return;
    
    let previousStatus = gameRoom.status;
    
    const pollRoomStatus = async () => {
      try {
        const { gameRoomsAPI } = await import("@/lib/api-utils");
        const result = await gameRoomsAPI.getRoomByCode(gameRoom.code);
        
        if (result.success && result.room) {
          const newRoom = result.room;
          
          // Check if game status changed from waiting to playing
          if (previousStatus === 'waiting' && newRoom.status === 'playing') {
            // Game was started - trigger the start handler
            handleStartOnlineGame();
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
  }, [gameRoom?.code, currentUser, gameState, isOnlineGame]);

  // Leave room properly
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
    setIsOnlineGame(false);
    setGameState("lobby");
    router.push("/games/werewolf");
  };

  // Start game from waiting room
  const handleStartOnlineGame = async () => {
    if (!gameRoom) return;
    
    const roomPlayerNames = gameRoom.currentPlayers.map(p => p.name);
    while (roomPlayerNames.length < 8) {
      roomPlayerNames.push(`Player ${roomPlayerNames.length + 1}`);
    }
    setPlayerNames(roomPlayerNames);
    setPlayerCount(gameRoom.currentPlayers.length);
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      await gameRoomsAPI.updateRoomStatus(gameRoom.id, 'playing');
    } catch (error) {
      console.error("Error updating room status:", error);
    }
    
    setGameState("setup");
  };
  
  // Save game state to Supabase whenever it changes (for multiplayer sync)
  useEffect(() => {
    if (!currentUser || !gameId || !gameRoom || !isOnlineGame) return;
    if (gameState === "waiting" || gameState === "lobby") return;
    
    const saveState = async () => {
      try {
        const { gameStateAPI } = await import('@/lib/api-utils');
        const stateToSave = {
          gameState,
          players,
          playerCount,
          playerNames,
          currentPhase,
          round,
          selectedTarget,
          seerCheck,
          guardianProtect,
          nightActions,
          dayMessage,
          votingPhase,
          winner,
          revealedRoles: Array.from(revealedRoles),
          showRole,
        };
        
        const stateString = JSON.stringify(stateToSave);
        if (stateString === lastSyncedStateRef.current) return; // Skip if unchanged
        
        await gameStateAPI.saveGameState({
          id: gameId,
          gameType: 'werewolf',
          state: stateToSave,
          lastUpdated: new Date().toISOString(),
          updatedBy: currentUser.id,
          deviceId: deviceIdRef.current,
        });
        
        lastSyncedStateRef.current = stateString;
      } catch (error) {
        console.error('Error saving game state:', error);
      }
    };
    
    // Debounce saves to avoid too many API calls
    const timeoutId = setTimeout(saveState, 500);
    return () => clearTimeout(timeoutId);
  }, [gameState, players, playerCount, playerNames, currentPhase, round, selectedTarget, seerCheck, guardianProtect, nightActions, dayMessage, votingPhase, winner, revealedRoles, showRole, currentUser, gameId, gameRoom, isOnlineGame]);

  // Sync game state from other players (polling)
  useEffect(() => {
    if (!currentUser || !gameId || !gameRoom || !isOnlineGame) return;
    if (gameState === "waiting" || gameState === "lobby") return;
    
    const syncGameState = async () => {
      try {
        const { gameStateAPI } = await import('@/lib/api-utils');
        const result = await gameStateAPI.getGameState(gameId);
        
        if (result.success && result.state) {
          const remoteState = result.state.state;
          const remoteStateString = JSON.stringify(remoteState);
          
          // Only update if state is different and not from this device
          const isFromThisDevice = result.state.deviceId === deviceIdRef.current;
          
          // Get current local state string for comparison
          const currentLocalState = JSON.stringify({
            gameState,
            players,
            playerCount,
            playerNames,
            currentPhase,
            round,
            selectedTarget,
            seerCheck,
            guardianProtect,
            nightActions,
            dayMessage,
            votingPhase,
            winner,
            revealedRoles: Array.from(revealedRoles),
            showRole,
          });
          
          // Only sync if remote state is different from local AND not from this device
          if (remoteStateString !== currentLocalState && !isFromThisDevice) {
            console.log('🔄 Syncing Werewolf game state from remote player');
            
            // Update state from remote - only update if different
            if (remoteState.gameState && remoteState.gameState !== gameState) {
              setGameState(remoteState.gameState);
            }
            if (remoteState.players && Array.isArray(remoteState.players) && JSON.stringify(remoteState.players) !== JSON.stringify(players)) {
              setPlayers(remoteState.players);
            }
            if (remoteState.playerCount !== undefined && remoteState.playerCount !== playerCount) {
              setPlayerCount(remoteState.playerCount);
            }
            if (remoteState.playerNames && Array.isArray(remoteState.playerNames) && JSON.stringify(remoteState.playerNames) !== JSON.stringify(playerNames)) {
              setPlayerNames(remoteState.playerNames);
            }
            if (remoteState.currentPhase && remoteState.currentPhase !== currentPhase) {
              setCurrentPhase(remoteState.currentPhase);
            }
            if (remoteState.round !== undefined && remoteState.round !== round) {
              setRound(remoteState.round);
            }
            if (remoteState.selectedTarget !== undefined && remoteState.selectedTarget !== selectedTarget) {
              setSelectedTarget(remoteState.selectedTarget);
            }
            if (remoteState.seerCheck !== undefined && remoteState.seerCheck !== seerCheck) {
              setSeerCheck(remoteState.seerCheck);
            }
            if (remoteState.guardianProtect !== undefined && remoteState.guardianProtect !== guardianProtect) {
              setGuardianProtect(remoteState.guardianProtect);
            }
            if (remoteState.nightActions && JSON.stringify(remoteState.nightActions) !== JSON.stringify(nightActions)) {
              setNightActions(remoteState.nightActions);
            }
            if (remoteState.dayMessage !== undefined && remoteState.dayMessage !== dayMessage) {
              setDayMessage(remoteState.dayMessage);
            }
            if (remoteState.votingPhase !== undefined && remoteState.votingPhase !== votingPhase) {
              setVotingPhase(remoteState.votingPhase);
            }
            if (remoteState.winner && JSON.stringify(remoteState.winner) !== JSON.stringify(winner)) {
              setWinner(remoteState.winner);
            }
            if (remoteState.revealedRoles && Array.isArray(remoteState.revealedRoles)) {
              const remoteSet = new Set<number>(remoteState.revealedRoles);
              const currentSet = revealedRoles;
              const setsEqual = remoteSet.size === currentSet.size && 
                Array.from(remoteSet).every((r) => currentSet.has(r));
              if (!setsEqual) {
                setRevealedRoles(remoteSet);
              }
            }
            if (remoteState.showRole && JSON.stringify(remoteState.showRole) !== JSON.stringify(showRole)) {
              setShowRole(remoteState.showRole);
            }
            
            // Update lastSyncedStateRef to prevent re-syncing the same state
            lastSyncedStateRef.current = remoteStateString;
          }
        }
      } catch (error) {
        console.error('Error syncing game state:', error);
      }
    };
    
    const intervalId = setInterval(syncGameState, 300);
    syncGameState(); // Initial sync
    
    return () => clearInterval(intervalId);
  }, [currentUser, gameId, gameRoom, isOnlineGame, gameState, players, playerCount, playerNames, currentPhase, round, selectedTarget, seerCheck, guardianProtect, nightActions, dayMessage, votingPhase, winner, revealedRoles, showRole]);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(user));

    // Check if there's a current team and auto-populate players
    const currentTeam = localStorage.getItem("currentTeam");
    if (currentTeam) {
      try {
        const team = JSON.parse(currentTeam);
        const teamMemberNames: string[] = [];
        
        // Add admin
        const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const admin = allUsers.find((u: any) => u.id === team.adminId);
        if (admin) {
          teamMemberNames.push(admin.name);
        }
        
        // Add members
        team.members.forEach((member: any) => {
          teamMemberNames.push(member.name);
        });
        
        // Update player names and count
        if (teamMemberNames.length > 0) {
          const newNames = [...teamMemberNames];
          // Fill remaining slots with default names
          while (newNames.length < 8) {
            newNames.push(`Player ${newNames.length + 1}`);
          }
          setPlayerNames(newNames);
          setPlayerCount(Math.min(Math.max(teamMemberNames.length, 5), 8));
        }
      } catch (e) {
        console.error("Error loading group:", e);
      }
    }
  }, [router]);

  const assignRoles = (count: number): Role[] => {
    const roles: Role[] = [];
    
    // Determine number of werewolves based on player count
    let werewolfCount = 1;
    if (count >= 6) werewolfCount = 2;
    if (count >= 9) werewolfCount = 3;
    
    // Add werewolves
    for (let i = 0; i < werewolfCount; i++) {
      roles.push("werewolf");
    }
    
    // Add special roles for larger games
    if (count >= 5) roles.push("seer");
    if (count >= 7) roles.push("guardian");
    
    // Fill rest with villagers
    while (roles.length < count) {
      roles.push("villager");
    }
    
    // Shuffle roles
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }
    
    return roles;
  };

  const initializeGame = () => {
    const roles = assignRoles(playerCount);
    const newPlayers: Player[] = [];
    
    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        id: i,
        name: playerNames[i] || `Player ${i + 1}`,
        role: roles[i],
        alive: true,
        votes: 0,
        color: PLAYER_COLORS[i],
        icon: PLAYER_ICONS[i],
      });
    }
    
    setPlayers(newPlayers);
    setGameState("night");
    setCurrentPhase("night");
    setRound(1);
    setNightActions({});
    setDayMessage("");
    setVotingPhase(false);
    setWinner(null);
    setRevealedRoles(new Set());
    setSelectedTarget(null);
    setSeerCheck(null);
    setGuardianProtect(null);
  };

  const getWerewolves = useCallback(() => {
    return players.filter(p => p.alive && p.role === "werewolf");
  }, [players]);

  const getVillagers = useCallback(() => {
    return players.filter(p => p.alive && (p.role === "villager" || p.role === "seer" || p.role === "guardian"));
  }, [players]);

  const checkWinCondition = useCallback(() => {
    const werewolves = getWerewolves();
    const villagers = getVillagers();
    
    if (werewolves.length === 0) {
      setWinner({ team: "villagers", players: villagers });
      setGameState("gameOver");
      return true;
    }
    
    if (werewolves.length >= villagers.length) {
      setWinner({ team: "werewolves", players: werewolves });
      setGameState("gameOver");
      return true;
    }
    
    return false;
  }, [getWerewolves, getVillagers]);

  const handleNightAction = (actionType: "kill" | "check" | "protect", targetId: number) => {
    setNightActions(prev => ({
      ...prev,
      [actionType === "kill" ? "werewolfKill" : actionType === "check" ? "seerCheck" : "guardianProtect"]: targetId,
    }));
    
    if (actionType === "kill") setSelectedTarget(targetId);
    if (actionType === "check") setSeerCheck(targetId);
    if (actionType === "protect") setGuardianProtect(targetId);
  };

  const resolveNight = () => {
    const werewolves = getWerewolves();
    const seer = players.find(p => p.alive && p.role === "seer");
    const guardian = players.find(p => p.alive && p.role === "guardian");
    
    // Werewolf kill
    let killTarget = nightActions.werewolfKill;
    if (!killTarget && werewolves.length > 0) {
      // If multiple werewolves, use the selected target
      killTarget = selectedTarget ?? nightActions.werewolfKill;
    }
    
    // Guardian protection
    const protectedId = nightActions.guardianProtect;
    
    // Apply kill if not protected
    if (killTarget !== undefined && killTarget !== protectedId) {
      setPlayers(prev => prev.map(p => 
        p.id === killTarget ? { ...p, alive: false } : p
      ));
      
      const killed = players.find(p => p.id === killTarget);
      setDayMessage(`${killed?.name} was killed by werewolves! ${killed?.name} was a ${killed?.role.toUpperCase()}.`);
      setRevealedRoles(prev => new Set([...prev, killTarget!]));
    } else if (killTarget !== undefined && killTarget === protectedId) {
      setDayMessage("The guardian protected someone from the werewolf attack!");
    } else if (werewolves.length > 0) {
      setDayMessage("The werewolves chose not to attack tonight.");
    } else {
      setDayMessage("A peaceful night passed...");
    }
    
    // Seer check result (shown only to seer, but we'll show it in UI)
    if (seer && nightActions.seerCheck !== undefined) {
      const checked = players.find(p => p.id === nightActions.seerCheck);
      // In real game, this would be private to seer
    }
    
    setCurrentPhase("day");
    setNightActions({});
    setSelectedTarget(null);
    setSeerCheck(null);
    setGuardianProtect(null);
    
    // Check win condition
    setTimeout(() => {
      if (!checkWinCondition()) {
        setVotingPhase(false);
      }
    }, 100);
  };

  const startVoting = () => {
    setVotingPhase(true);
    setPlayers(prev => prev.map(p => ({ ...p, votes: 0, votedFor: undefined })));
  };

  const castVote = (voterId: number, targetId: number) => {
    if (!votingPhase) return;
    
    const voter = players.find(p => p.id === voterId);
    if (!voter || !voter.alive || voter.votedFor !== undefined) return;
    
    setPlayers(prev => prev.map(p => {
      if (p.id === voterId) {
        return { ...p, votedFor: targetId };
      }
      if (p.id === targetId) {
        return { ...p, votes: p.votes + 1 };
      }
      return p;
    }));
  };

  const resolveVoting = () => {
    const alivePlayers = players.filter(p => p.alive);
    const votedPlayers = alivePlayers.filter(p => p.votedFor !== undefined);
    
    if (votedPlayers.length < alivePlayers.length) {
      setDayMessage("Not everyone has voted yet!");
      return;
    }
    
    const sortedByVotes = [...alivePlayers].sort((a, b) => b.votes - a.votes);
    const maxVotes = sortedByVotes[0]?.votes || 0;
    const tied = sortedByVotes.filter(p => p.votes === maxVotes);
    
    if (tied.length > 1 || maxVotes === 0) {
      setDayMessage("No one was voted out (tie or no votes). The night continues...");
      setVotingPhase(false);
      setCurrentPhase("night");
      setRound(prev => prev + 1);
      setPlayers(prev => prev.map(p => ({ ...p, votes: 0, votedFor: undefined })));
      return;
    }
    
    const eliminated = sortedByVotes[0];
    setPlayers(prev => prev.map(p => 
      p.id === eliminated.id ? { ...p, alive: false } : p
    ));
    
    setDayMessage(`${eliminated.name} was voted out! ${eliminated.name} was a ${eliminated.role.toUpperCase()}.`);
    setRevealedRoles(prev => new Set([...prev, eliminated.id]));
    setVotingPhase(false);
    
    // Check win condition
    setTimeout(() => {
      if (!checkWinCondition()) {
        setCurrentPhase("night");
        setRound(prev => prev + 1);
        setPlayers(prev => prev.map(p => ({ ...p, votes: 0, votedFor: undefined })));
      }
    }, 2000);
  };

  if (!currentUser) return null;

  // LOBBY PHASE - Show game lobby for online multiplayer
  if (gameState === "lobby") {
    return (
      <GameLobby
        gameType="werewolf"
        gameName="WEREWOLF"
        gameIcon="🐺"
        maxPlayers={8}
        minPlayers={5}
        onJoinRoom={handleJoinRoom}
        backUrl="/games"
      />
    );
  }

  // WAITING ROOM PHASE
  if (gameState === "waiting" && gameRoom) {
    return (
      <WaitingRoom
        gameType="werewolf"
        gameName="WEREWOLF"
        gameIcon="🐺"
        currentTeamName={currentUser?.name || "Player"}
        currentTeamId={null}
        gameId={`werewolf_${gameRoom.code}`}
        currentUser={currentUser}
        roomCode={gameRoom.code}
        room={gameRoom}
        onStartGame={handleStartOnlineGame}
        onPlayAgainstComputer={() => {
          setIsOnlineGame(false);
          setGameState("setup");
        }}
        onLeaveRoom={handleLeaveRoom}
        minPlayers={5}
        maxPlayers={8}
        waitTime={60}
        showAvailableGames={true}
        showAvailableTeams={false}
      />
    );
  }

  // Setup screen
  if (gameState === "setup") {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* Online Game Info Banner */}
          {isOnlineGame && gameRoom && (
            <div className="neon-card neon-box-yellow p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-yellow-400 font-bold">Online Game • Room: {gameRoom.code}</div>
                    <div className="text-cyan-300/70 text-sm">
                      {gameRoom.currentPlayers.length} players connected
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            BACK TO GAMES
          </Link>

          <div className="text-center mb-8">
            <h1 className="pixel-font text-3xl md:text-4xl font-bold text-red-400 neon-glow-red mb-4">
              🐺 WEREWOLF 🐺
            </h1>
            <p className="text-cyan-300">A social deduction game of trust and betrayal</p>
          </div>

          {/* Group Info Banner */}
          {(() => {
            const currentTeamData = localStorage.getItem("currentTeam");
            let teamInfo = null;
            if (currentTeamData) {
              try {
                teamInfo = JSON.parse(currentTeamData);
              } catch (e) {
                // Ignore parse errors
              }
            }
            return teamInfo ? (
              <div className="neon-card neon-box-purple p-4 mb-6 card-3d max-w-lg mx-auto">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-purple-400 font-bold">Playing as Team: {teamInfo.name}</div>
                      <div className="text-cyan-300/70 text-sm">
                        {teamInfo.members.length + 1} member{teamInfo.members.length !== 0 ? "s" : ""} as players
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          <div className="neon-card neon-box-red p-8 max-w-lg mx-auto card-3d">
            <div className="space-y-6">
              <div>
                <label className="block text-red-400 mb-2 pixel-font text-xs">NUMBER OF PLAYERS</label>
                <div className="flex gap-2 flex-wrap">
                  {[5, 6, 7, 8].map(num => (
                    <button
                      key={num}
                      onClick={() => setPlayerCount(num)}
                      className={`px-4 py-2 rounded-lg font-bold transition-all ${
                        playerCount === num 
                          ? "bg-red-500 text-black" 
                          : "bg-red-900/50 text-red-400 border border-red-500 hover:bg-red-800/50"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-red-400 mb-2 pixel-font text-xs">PLAYER NAMES</label>
                {Array.from({ length: playerCount }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-2xl">{PLAYER_ICONS[i]}</span>
                    <input
                      type="text"
                      value={playerNames[i]}
                      onChange={(e) => {
                        const newNames = [...playerNames];
                        newNames[i] = e.target.value;
                        setPlayerNames(newNames);
                      }}
                      className="flex-1 p-3 rounded-lg text-lg bg-gray-800 text-white border border-gray-700"
                      placeholder={`Player ${i + 1}`}
                    />
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ backgroundColor: PLAYER_COLORS[i] }}
                    />
                  </div>
                ))}
              </div>

              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <p className="text-yellow-400 text-sm font-bold mb-2">ROLES:</p>
                <ul className="text-cyan-300 text-xs space-y-1">
                  <li>🐺 Werewolves: Eliminate all villagers</li>
                  <li>👤 Villagers: Find and vote out werewolves</li>
                  <li>🧙 Seer: Check if someone is a werewolf each night</li>
                  <li>🛡️ Guardian: Protect one player each night</li>
                </ul>
              </div>

              <button
                onClick={initializeGame}
                className="neon-btn neon-btn-red w-full text-lg btn-3d"
              >
                <Moon className="w-5 h-5 inline mr-2" />
                START GAME
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Over screen
  if (gameState === "gameOver" && winner) {
    return (
      <div className="min-h-screen p-4 md:p-8 py-8">
        <div className="neon-card neon-box-yellow p-6 md:p-12 text-center max-w-lg mx-auto card-3d">
          {winner.team === "werewolves" ? (
            <Skull className="w-24 h-24 text-red-400 mx-auto mb-6" />
          ) : (
            <Shield className="w-24 h-24 text-green-400 mx-auto mb-6" />
          )}
          <h1 className="pixel-font text-2xl text-yellow-400 neon-glow-yellow mb-4">
            {winner.team === "werewolves" ? "WEREWOLVES WIN!" : "VILLAGERS WIN!"}
          </h1>
          <div className="space-y-2 mb-8">
            {winner.players.map(player => (
              <div key={player.id} className="flex items-center justify-center gap-3">
                <span className="text-2xl">{player.icon}</span>
                <span className="text-xl" style={{ color: player.color }}>{player.name}</span>
                <span className="text-sm text-gray-400">({player.role})</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <button
              onClick={() => {
                setGameState("setup");
                setPlayers([]);
              }}
              className="neon-btn neon-btn-green w-full btn-3d"
            >
              PLAY AGAIN
            </button>
            <Link href="/games" className="neon-btn neon-btn-cyan w-full block btn-3d">
              BACK TO GAMES
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const alivePlayers = players.filter(p => p.alive);
  const currentPlayer = players[0]; // In a real game, this would be the actual current user

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          BACK TO GAMES
        </Link>

        <div className="text-center mb-6">
          <h1 className="pixel-font text-xl md:text-2xl lg:text-3xl font-bold text-red-400 neon-glow-red mb-2">
            🐺 WEREWOLF 🐺
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-cyan-300">Round {round}</span>
            <span className="text-gray-400">|</span>
            {currentPhase === "night" ? (
              <span className="text-purple-400 flex items-center gap-1">
                <Moon className="w-4 h-4" /> NIGHT
              </span>
            ) : (
              <span className="text-yellow-400 flex items-center gap-1">
                <Sun className="w-4 h-4" /> DAY
              </span>
            )}
            <span className="text-gray-400">|</span>
            <span className="text-green-400">{alivePlayers.length} Alive</span>
          </div>
        </div>

        {/* Phase Message */}
        {dayMessage && (
          <div className="neon-card neon-box-cyan p-4 text-center mb-4 card-3d">
            <p className="text-cyan-300 text-lg">{dayMessage}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_300px] gap-4">
          {/* Main Game Area */}
          <div className="space-y-4">
            {/* Players Grid */}
            <div className="neon-card neon-box-red p-4 card-3d">
              <h2 className="pixel-font text-sm text-red-400 neon-glow-red mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" /> PLAYERS
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {players.map((player) => {
                  const isRevealed = revealedRoles.has(player.id);
                  return (
                    <div
                      key={player.id}
                      className={`neon-card p-3 transition-all tile-3d ${
                        !player.alive ? "opacity-50 grayscale" : ""
                      } ${
                        selectedTarget === player.id ? "neon-box-yellow border-2" : "border border-gray-700"
                      }`}
                    >
                      <div className="text-center space-y-2">
                        <div className="text-3xl">{player.icon}</div>
                        <p className="font-bold" style={{ color: player.color }}>
                          {player.name}
                        </p>
                        {!player.alive && (
                          <p className="text-red-500 text-xs">DEAD</p>
                        )}
                        {isRevealed && (
                          <p className="text-yellow-400 text-xs font-bold">
                            {player.role.toUpperCase()}
                          </p>
                        )}
                        {votingPhase && player.alive && (
                          <div className="text-center">
                            <p className="text-cyan-400 text-xs mb-1">Votes: {player.votes}</p>
                            <button
                              onClick={() => castVote(0, player.id)}
                              className="neon-btn neon-btn-red text-xs px-2 py-1 btn-3d"
                            >
                              VOTE
                            </button>
                          </div>
                        )}
                        {currentPhase === "night" && player.alive && (
                          <button
                            onClick={() => {
                              const werewolves = getWerewolves();
                              const seer = players.find(p => p.alive && p.role === "seer");
                              const guardian = players.find(p => p.alive && p.role === "guardian");
                              
                              // In real game, check if current user is werewolf/seer/guardian
                              // For demo, allow all actions
                              if (werewolves.length > 0) {
                                handleNightAction("kill", player.id);
                              }
                              if (seer) {
                                handleNightAction("check", player.id);
                              }
                              if (guardian) {
                                handleNightAction("protect", player.id);
                              }
                            }}
                            className="neon-btn neon-btn-purple text-xs px-2 py-1 mt-1 btn-3d"
                          >
                            SELECT
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            {currentPhase === "night" && (
              <div className="neon-card neon-box-purple p-4 card-3d">
                <div className="space-y-3">
                  <h3 className="text-purple-400 font-bold flex items-center gap-2">
                    <Moon className="w-5 h-5" /> NIGHT ACTIONS
                  </h3>
                  <div className="text-sm text-cyan-300 space-y-2">
                    {getWerewolves().length > 0 && (
                      <p>🐺 Werewolves: {selectedTarget !== null ? `Targeting ${players.find(p => p.id === selectedTarget)?.name}` : "Choose a victim"}</p>
                    )}
                    {players.find(p => p.alive && p.role === "seer") && (
                      <p>🧙 Seer: {seerCheck !== null ? `Checking ${players.find(p => p.id === seerCheck)?.name}` : "Choose someone to check"}</p>
                    )}
                    {players.find(p => p.alive && p.role === "guardian") && (
                      <p>🛡️ Guardian: {guardianProtect !== null ? `Protecting ${players.find(p => p.id === guardianProtect)?.name}` : "Choose someone to protect"}</p>
                    )}
                  </div>
                  <button
                    onClick={resolveNight}
                    className="neon-btn neon-btn-purple w-full btn-3d"
                  >
                    END NIGHT
                  </button>
                </div>
              </div>
            )}

            {currentPhase === "day" && !votingPhase && (
              <div className="neon-card neon-box-yellow p-4 card-3d">
                <div className="space-y-3">
                  <h3 className="text-yellow-400 font-bold flex items-center gap-2">
                    <Sun className="w-5 h-5" /> DAY PHASE
                  </h3>
                  <p className="text-cyan-300 text-sm">
                    Discuss and try to figure out who the werewolves are!
                  </p>
                  <button
                    onClick={startVoting}
                    className="neon-btn neon-btn-yellow w-full btn-3d"
                  >
                    <Vote className="w-5 h-5 inline mr-2" />
                    START VOTING
                  </button>
                </div>
              </div>
            )}

            {votingPhase && (
              <div className="neon-card neon-box-orange p-4 card-3d">
                <div className="space-y-3">
                  <h3 className="text-orange-400 font-bold flex items-center gap-2">
                    <Vote className="w-5 h-5" /> VOTING PHASE
                  </h3>
                  <p className="text-cyan-300 text-sm">
                    Vote to eliminate someone you suspect is a werewolf!
                  </p>
                  <button
                    onClick={resolveVoting}
                    className="neon-btn neon-btn-orange w-full btn-3d"
                  >
                    RESOLVE VOTES
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            <div className="neon-card neon-box-cyan p-4 card-3d">
              <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> GAME INFO
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-400">Alive Players:</p>
                  <p className="text-green-400 font-bold">{alivePlayers.length}</p>
                </div>
                <div>
                  <p className="text-gray-400">Werewolves:</p>
                  <p className="text-red-400 font-bold">{getWerewolves().length}</p>
                </div>
                <div>
                  <p className="text-gray-400">Villagers:</p>
                  <p className="text-blue-400 font-bold">{getVillagers().length}</p>
                </div>
              </div>
            </div>

            <div className="neon-card border border-gray-700 p-4 card-3d">
              <h3 className="text-yellow-400 font-bold mb-3 text-xs">HOW TO PLAY</h3>
              <div className="text-xs text-cyan-300 space-y-2">
                <p><strong className="text-purple-400">NIGHT:</strong> Werewolves choose victims, Seer checks players, Guardian protects.</p>
                <p><strong className="text-yellow-400">DAY:</strong> Discuss and vote out suspected werewolves.</p>
                <p><strong className="text-red-400">WIN:</strong> Werewolves win if they equal villagers. Villagers win if all werewolves are eliminated.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WerewolfPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-cyan-400 text-xl">Loading game...</div>
      </div>
    }>
      <WerewolfPageContent />
    </Suspense>
  );
}

