"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, Users, Trophy, Zap, Globe, Lock, Copy, Check } from "lucide-react";
import GameLobby from "@/app/components/GameLobby";
import WaitingRoom from "@/app/components/WaitingRoom";

// Player colors - matching the image
const PLAYER_COLORS = [
  { main: "#ff0000", light: "#ff6666", dark: "#cc0000", name: "Red" },    // Red - top-left
  { main: "#00ff00", light: "#66ff66", dark: "#00cc00", name: "Green" },  // Green - bottom-left
  { main: "#0000ff", light: "#6666ff", dark: "#0000cc", name: "Blue" },  // Blue - top-right
  { main: "#ffff00", light: "#ffff66", dark: "#cccc00", name: "Yellow" }, // Yellow - bottom-right
];

// Board path positions (28 spaces around the board, then repeats)
// Standard Ludo path: goes clockwise around the board
// Red starts at (1,0), goes right, then down, then left, then up
const BOARD_PATH: Array<{ x: number; y: number }> = [];
// Top row: positions 0-5 (x: 1 to 6, y: 0) - Red's starting area
for (let i = 0; i < 6; i++) {
  BOARD_PATH.push({ x: 1 + i, y: 0 });
}
// Right column: positions 6-11 (x: 6, y: 1 to 6) - Blue's area
for (let i = 1; i <= 6; i++) {
  BOARD_PATH.push({ x: 6, y: i });
}
// Bottom row: positions 12-17 (x: 5 to 0, y: 6) - Yellow's area
for (let i = 5; i >= 0; i--) {
  BOARD_PATH.push({ x: i, y: 6 });
}
// Left column: positions 18-23 (x: 0, y: 5 to 0) - Green's area
for (let i = 5; i >= 0; i--) {
  BOARD_PATH.push({ x: 0, y: i });
}
// Total: 28 spaces. Each player needs to complete one full lap (28 spaces) before entering home column

// Starting positions for each player's tokens (in their home bases)
const START_POSITIONS = [
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }], // Red - top-left
  [{ x: 0, y: 5 }, { x: 0, y: 6 }, { x: 1, y: 5 }, { x: 1, y: 6 }], // Green - bottom-left
  [{ x: 5, y: 0 }, { x: 5, y: 1 }, { x: 6, y: 0 }, { x: 6, y: 1 }], // Blue - top-right
  [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 5 }, { x: 6, y: 6 }], // Yellow - bottom-right
];

// Entry points to the board path for each player (where they enter the main path)
const ENTRY_POINTS = [
  0,   // Red enters at position 0 (x: 1, y: 0)
  6,   // Blue enters at position 6 (x: 6, y: 1)
  12,  // Yellow enters at position 12 (x: 5, y: 6)
  18,  // Green enters at position 18 (x: 0, y: 5)
];

// Safe zones (white squares with stars) - these are safe from capture
const SAFE_ZONES = [
  { x: 1, y: 0 }, { x: 0, y: 1 }, // Red safe zones
  { x: 6, y: 1 }, { x: 5, y: 0 }, // Blue safe zones
  { x: 5, y: 6 }, { x: 6, y: 5 }, // Yellow safe zones
  { x: 0, y: 5 }, { x: 1, y: 6 }, // Green safe zones
];

interface Token {
  id: number;
  position: number; // -1 = home, 0-51 = on board path, 100+ = in home column
  isHome: boolean;
  isFinished: boolean;
}

interface Player {
  id: number;
  name: string;
  color: typeof PLAYER_COLORS[0];
  tokens: Token[];
  startPosition: number; // Entry point on board
}

const DiceIcon = ({ value, isRolling }: { value: number; isRolling?: boolean }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return (
    <div className={`relative ${isRolling ? 'animate-dice-roll' : ''}`}>
      <Icon className="w-10 h-10 sm:w-12 sm:h-12" />
    </div>
  );
};

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

function LudoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gamePhase, setGamePhase] = useState<"lobby" | "waiting" | "setup" | "playing" | "ended">("lobby");
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [isOnlineGame, setIsOnlineGame] = useState(false);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number | null>(null);
  
  // Legacy gameState for compatibility
  const gameState = gamePhase === "setup" ? "setup" : gamePhase === "playing" ? "playing" : gamePhase === "ended" ? "ended" : "setup";
  const setGameState = (state: "setup" | "playing" | "ended") => {
    if (state === "setup") setGamePhase("setup");
    else if (state === "playing") setGamePhase("playing");
    else if (state === "ended") setGamePhase("ended");
  };
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [hasRolled, setHasRolled] = useState(false);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", "", ""]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  
  // Animation states
  const [animatingToken, setAnimatingToken] = useState<{ playerId: number; tokenId: number } | null>(null);
  const [animatingFromPos, setAnimatingFromPos] = useState<{ x: number; y: number } | null>(null);
  const [animatingToPos, setAnimatingToPos] = useState<{ x: number; y: number } | null>(null);

  // Check for room code in URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      // Join existing room
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
        setGamePhase("waiting");
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    const userData = JSON.parse(user);
    setCurrentUser(userData);

    // Check if there's a current team and auto-populate players
    const currentTeamData = localStorage.getItem("currentTeam");
    if (currentTeamData) {
      try {
        const team = JSON.parse(currentTeamData);
        const teamMemberNames: string[] = [];
        
        // Add admin
        const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const admin = allUsers.find((u: any) => u.id === team.adminId);
        if (admin) {
          teamMemberNames.push(admin.name);
        }
        
        // Add members
        team.members.forEach((member: any) => {
          // Avoid duplicates
          if (!teamMemberNames.includes(member.name)) {
            teamMemberNames.push(member.name);
          }
        });
        
        // Update player names and count
        if (teamMemberNames.length > 0) {
          const newNames = [...teamMemberNames];
          // Keep remaining slots empty - don't use generic names
          while (newNames.length < 4) {
            newNames.push("");
          }
          setPlayerNames(newNames);
          setPlayerCount(Math.min(teamMemberNames.length, 4));
        } else {
          // Fallback: use current user name
          const newNames = [userData.name, "", "", ""];
          setPlayerNames(newNames);
        }
      } catch (e) {
        console.error("Error loading team:", e);
        // Fallback: use current user name
        const newNames = [userData.name, "", "", ""];
        setPlayerNames(newNames);
      }
    } else {
      // No team - use current user name as first player
      const newNames = [userData.name, "", "", ""];
      setPlayerNames(newNames);
    }
  }, [router]);

  // Sync game state for online multiplayer (works during playing AND setup phases)
  useEffect(() => {
    if (!isOnlineGame || !gameRoom) return;
    if (gamePhase !== "playing" && gamePhase !== "setup") return;
    
    const syncGameState = async () => {
      try {
        const { gameStateAPI } = await import("@/lib/api-utils");
        const gameId = `ludo_${gameRoom.code}`;
        const result = await gameStateAPI.getGameState(gameId);
        
        if (result.success && result.state && result.state.lastUpdated !== lastSyncTime) {
          const remoteState = result.state.state;
          
          // Only update if from another player
          if (result.state.updatedBy !== currentUser?.id) {
            if (remoteState.players) setPlayers(remoteState.players);
            if (remoteState.currentPlayerIndex !== undefined) setCurrentPlayerIndex(remoteState.currentPlayerIndex);
            if (remoteState.diceValue !== undefined) setDiceValue(remoteState.diceValue);
            if (remoteState.hasRolled !== undefined) setHasRolled(remoteState.hasRolled);
            if (remoteState.message) setMessage(remoteState.message);
            if (remoteState.consecutiveSixes !== undefined) setConsecutiveSixes(remoteState.consecutiveSixes);
            if (remoteState.winner) {
              setWinner(remoteState.winner);
              setGamePhase("ended");
            }
            // If remote state shows game is playing but we're still in setup, start playing
            if (remoteState.gamePhase === "playing" && gamePhase === "setup") {
              setGamePhase("playing");
            }
          }
          setLastSyncTime(result.state.lastUpdated);
        }
      } catch (error) {
        console.error("Error syncing game state:", error);
      }
    };
    
    const intervalId = setInterval(syncGameState, 300);
    syncGameState(); // Initial sync
    return () => clearInterval(intervalId);
  }, [isOnlineGame, gameRoom, gamePhase, currentUser, lastSyncTime]);

  // Save game state after changes
  const saveOnlineGameState = useCallback(async (state: any) => {
    if (!isOnlineGame || !gameRoom || !currentUser) return;
    
    try {
      const { gameStateAPI } = await import("@/lib/api-utils");
      const gameId = `ludo_${gameRoom.code}`;
      await gameStateAPI.saveGameState({
        id: gameId,
        gameType: "ludo",
        state: {
          players: state.players || players,
          currentPlayerIndex: state.currentPlayerIndex ?? currentPlayerIndex,
          diceValue: state.diceValue ?? diceValue,
          hasRolled: state.hasRolled ?? hasRolled,
          message: state.message || message,
          winner: state.winner || winner,
          gamePhase: state.gamePhase || gamePhase,
          consecutiveSixes: state.consecutiveSixes ?? consecutiveSixes,
        },
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser.id,
      });
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  }, [isOnlineGame, gameRoom, currentUser, players, currentPlayerIndex, diceValue, hasRolled, message, winner, gamePhase, consecutiveSixes]);

  // Handle room joined from lobby
  const handleJoinRoom = (room: GameRoom) => {
    setGameRoom(room);
    setIsOnlineGame(true);
    setGamePhase("waiting");
  };

  // Poll room status to detect when game starts (even when in waiting phase)
  useEffect(() => {
    if (!gameRoom || !currentUser || gamePhase !== "waiting" || !isOnlineGame) return;
    
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
  }, [gameRoom?.code, currentUser, gamePhase, isOnlineGame]);

  // Start online game from waiting room
  const handleStartOnlineGame = async () => {
    if (!gameRoom) return;
    
    // Set player names from room players
    const roomPlayerNames = gameRoom.currentPlayers.map(p => p.name);
    // Keep slots empty for additional players - don't use generic names
    while (roomPlayerNames.length < 4) {
      roomPlayerNames.push("");
    }
    setPlayerNames(roomPlayerNames);
    setPlayerCount(Math.min(gameRoom.currentPlayers.length, 4));
    
    // Find my player index
    const myIndex = gameRoom.currentPlayers.findIndex(p => p.id === currentUser?.id);
    setMyPlayerIndex(myIndex >= 0 ? myIndex : 0);
    
    // Update room status
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      await gameRoomsAPI.updateRoomStatus(gameRoom.id, 'playing');
    } catch (error) {
      console.error("Error updating room status:", error);
    }
    
    // Skip setup phase for room-based games - go directly to playing
    if (gameRoom.currentPlayers.length >= gameRoom.minPlayers) {
      initializeGame();
    } else {
      setGamePhase("setup");
    }
  };

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
    setIsOnlineGame(false);
    setGamePhase("lobby");
    router.push("/games/ludo");
  };

  // Auto-skip setup phase if we're in a room with players already assigned
  useEffect(() => {
    if (gamePhase === "setup" && gameRoom && gameRoom.currentPlayers && gameRoom.currentPlayers.length >= (gameRoom.minPlayers || 2)) {
      // Extract player information from room
      const roomPlayerNames = gameRoom.currentPlayers.map(p => p.name);
      while (roomPlayerNames.length < 4) {
        roomPlayerNames.push("");
      }
      setPlayerNames(roomPlayerNames);
      setPlayerCount(Math.min(gameRoom.currentPlayers.length, 4));
      
      const myIndex = gameRoom.currentPlayers.findIndex(p => p.id === currentUser?.id);
      setMyPlayerIndex(myIndex >= 0 ? myIndex : 0);
      
      // Start game directly - skip setup phase
      initializeGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, gameRoom, currentUser]);

  const initializeGame = async () => {
    const newPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      // Use playerName if set, otherwise use placeholder only at game start
      const playerName = playerNames[i]?.trim() || `Player ${i + 1}`;
      newPlayers.push({
        id: i,
        name: playerName,
        color: PLAYER_COLORS[i],
        startPosition: ENTRY_POINTS[i],
        tokens: [
          { id: 0, position: -1, isHome: true, isFinished: false },
          { id: 1, position: -1, isHome: true, isFinished: false },
          { id: 2, position: -1, isHome: true, isFinished: false },
          { id: 3, position: -1, isHome: true, isFinished: false },
        ],
      });
    }
    const initialMessage = `${newPlayers[0].name}'s turn! Roll the dice.`;
    
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setDiceValue(0);
    setHasRolled(false);
    setSelectedToken(null);
    setMessage(initialMessage);
    setGameState("playing");
    setConsecutiveSixes(0);
    
    // Sync initial state for online games
    if (isOnlineGame && gameRoom && currentUser) {
      try {
        const { gameStateAPI } = await import("@/lib/api-utils");
        const gameId = `ludo_${gameRoom.code}`;
        await gameStateAPI.saveGameState({
          id: gameId,
          gameType: "ludo",
          state: {
            players: newPlayers,
            currentPlayerIndex: 0,
            diceValue: 0,
            hasRolled: false,
            message: initialMessage,
            winner: null,
            gamePhase: "playing",
            consecutiveSixes: 0,
          },
          lastUpdated: new Date().toISOString(),
          updatedBy: currentUser.id,
        });
      } catch (error) {
        console.error("Error syncing initial game state:", error);
      }
    }
  };

  const rollDice = useCallback(() => {
    if (hasRolled && diceValue !== 6) return;
    if (isRollingDice) return;
    
    // For online games, only the current player can roll
    if (isOnlineGame && myPlayerIndex !== null && myPlayerIndex !== currentPlayerIndex) {
      setMessage("Wait for your turn!");
      return;
    }
    
    setIsRollingDice(true);
    
    // Animate dice rolling
    const rollInterval = setInterval(() => {
      const tempRoll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(tempRoll);
    }, 100);
    
    setTimeout(() => {
      clearInterval(rollInterval);
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(roll);
      setIsRollingDice(false);
      setHasRolled(true);
      
      const currentPlayer = players[currentPlayerIndex];
      let newMessage = "";
      
      if (roll === 6) {
        setConsecutiveSixes(prev => prev + 1);
        if (consecutiveSixes >= 2) {
          newMessage = `${currentPlayer.name} rolled three 6s! Turn skipped.`;
          setMessage(newMessage);
          setConsecutiveSixes(0);
          // Sync before next turn
          if (isOnlineGame) {
            saveOnlineGameState({ diceValue: roll, hasRolled: true, message: newMessage });
          }
          nextTurn();
          return;
        }
        newMessage = `${currentPlayer.name} rolled a 6! You can move a token out or move again.`;
      } else {
        setConsecutiveSixes(0);
        newMessage = `${currentPlayer.name} rolled a ${roll}. Select a token to move.`;
      }
      
      setMessage(newMessage);
      
      // Sync game state for online games
      if (isOnlineGame) {
        saveOnlineGameState({ diceValue: roll, hasRolled: true, message: newMessage });
      }
    }, 1500);
  }, [hasRolled, diceValue, players, currentPlayerIndex, consecutiveSixes, isRollingDice, isOnlineGame, myPlayerIndex, saveOnlineGameState]);

  const canMoveToken = (player: Player, token: Token): boolean => {
    if (token.isFinished) return false;
    
    if (diceValue === 6) {
      // Can move out of home or move on board
      return true;
    }
    
    // Can only move if token is on board (not at home)
    if (token.isHome) return false;
    
    // If token is in home column, check if move is valid
    if (token.position >= 100) {
      const homeColumnIndex = token.position - 100;
      const newHomeColumnIndex = homeColumnIndex + diceValue;
      return newHomeColumnIndex <= 6; // Can move if won't exceed finish
    }
    
    // Token is on main path, can always move
    return true;
  };

  const animateTokenMove = (fromPos: { x: number; y: number }, toPos: { x: number; y: number }, playerId: number, tokenId: number) => {
    setAnimatingToken({ playerId, tokenId });
    setAnimatingFromPos(fromPos);
    setAnimatingToPos(toPos);
    setIsMoving(true);
    
    // Clear animation after it completes (600ms for transition + small buffer)
    setTimeout(() => {
      setAnimatingToken(null);
      setAnimatingFromPos(null);
      setAnimatingToPos(null);
      setIsMoving(false);
    }, 650);
  };

  const moveToken = (playerIndex: number, tokenIndex: number) => {
    if (hasRolled && diceValue === 6 && consecutiveSixes >= 2) return;
    if (isMoving) return;
    
    // For online games, only the current player can move their tokens
    if (isOnlineGame && myPlayerIndex !== null && myPlayerIndex !== currentPlayerIndex) {
      setMessage("Wait for your turn!");
      return;
    }
    
    const player = players[playerIndex];
    const token = player.tokens[tokenIndex];
    
    if (!canMoveToken(player, token)) {
      setMessage("Cannot move this token!");
      return;
    }

    const newPlayers = players.map((p, idx) => 
      idx === playerIndex 
        ? { ...p, tokens: [...p.tokens] }
        : { ...p, tokens: [...p.tokens] }
    );
    const newToken = { ...token };
    
    const fromPos = getTokenPosition(player, token);
    
    if (token.isHome && diceValue === 6) {
      // Move token out of home - position 0 means at start of board path
      newToken.isHome = false;
      newToken.position = 0;
      newPlayers[playerIndex].tokens[tokenIndex] = newToken;
      // Update state immediately
      setPlayers(newPlayers);
      const toPos = getTokenPosition(newPlayers[playerIndex], newToken);
      setTimeout(() => {
        animateTokenMove(fromPos, toPos, playerIndex, tokenIndex);
      }, 50);
      setMessage(`${player.name} moved token ${tokenIndex + 1} onto the board!`);
    } else if (!token.isHome && token.position < 100) {
      // Move token on board (position is relative, 0-27 for one lap)
      let newPosition = token.position + diceValue;
      
      // Check if token can enter home column (needs exactly the right number to enter)
      // Each player needs to travel 28 spaces to complete one full lap
      if (newPosition >= 28) {
        // Token can enter home column
        const homeColumnPosition = 100 + (newPosition - 28);
        // Home column has 6 spaces (100-105), position 106 means finished
        if (homeColumnPosition <= 106) {
          newToken.position = homeColumnPosition;
          if (homeColumnPosition === 106) {
            newToken.isFinished = true;
            setMessage(`${player.name} finished token ${tokenIndex + 1}!`);
          } else {
            setMessage(`${player.name} moved token ${tokenIndex + 1} into home column!`);
          }
        } else {
          setMessage("Cannot move that far! Need exact number to finish.");
          return;
        }
      } else {
        // Normal movement around the board
        newPosition = newPosition % 28;
        
        // Check for captures (except in safe zones)
        const absolutePos = (player.startPosition + newPosition) % 28;
        const boardPos = BOARD_PATH[absolutePos];
        const isSafeZone = SAFE_ZONES.some(sz => sz.x === boardPos.x && sz.y === boardPos.y);
        
        if (!isSafeZone) {
          // Check if any opponent token is on this same position
          for (let i = 0; i < newPlayers.length; i++) {
            if (i === playerIndex) continue;
            const opponent = newPlayers[i];
            for (let j = 0; j < opponent.tokens.length; j++) {
              const opponentToken = opponent.tokens[j];
              if (!opponentToken.isHome && opponentToken.position < 100) {
                const opponentAbsolutePos = (opponent.startPosition + opponentToken.position) % 28;
                if (opponentAbsolutePos === absolutePos) {
                  // Capture! Send opponent token back home
                  newPlayers[i].tokens[j] = {
                    ...opponentToken,
                    isHome: true,
                    position: -1
                  };
                  setMessage(`${player.name} captured ${opponent.name}'s token!`);
                }
              }
            }
          }
        }
        
        newToken.position = newPosition;
        setMessage(`${player.name} moved token ${tokenIndex + 1}.`);
      }
      
      // Update state immediately before animation
      newPlayers[playerIndex].tokens[tokenIndex] = newToken;
      setPlayers(newPlayers);
      const toPos = getTokenPosition(newPlayers[playerIndex], newToken);
      setTimeout(() => {
        animateTokenMove(fromPos, toPos, playerIndex, tokenIndex);
      }, 50);
    } else if (token.position >= 100) {
      // Token is in home column
      const homeColumnIndex = token.position - 100;
      const newHomeColumnIndex = homeColumnIndex + diceValue;
      if (newHomeColumnIndex <= 6) {
        newToken.position = 100 + newHomeColumnIndex;
        if (newHomeColumnIndex === 6) {
          newToken.isFinished = true;
          setMessage(`${player.name} finished token ${tokenIndex + 1}!`);
        } else {
          setMessage(`${player.name} moved token ${tokenIndex + 1} in home column!`);
        }
        // Update state immediately before animation
        newPlayers[playerIndex].tokens[tokenIndex] = newToken;
        setPlayers(newPlayers);
        const toPos = getTokenPosition(newPlayers[playerIndex], newToken);
        setTimeout(() => {
          animateTokenMove(fromPos, toPos, playerIndex, tokenIndex);
        }, 50);
      } else {
        setMessage("Cannot move that far in home column!");
        return;
      }
    }
    
    setSelectedToken(null);
    
    // Check for win
    if (newPlayers[playerIndex].tokens.every(t => t.isFinished)) {
      setWinner(newPlayers[playerIndex]);
      setGameState("ended");
      const winMessage = `${player.name} wins! All tokens finished!`;
      setMessage(winMessage);
      
      // Sync win state for online games
      if (isOnlineGame) {
        saveOnlineGameState({ players: newPlayers, winner: newPlayers[playerIndex], message: winMessage, gamePhase: "ended" });
      }
      return;
    }
    
    // Sync move for online games
    if (isOnlineGame) {
      saveOnlineGameState({ players: newPlayers });
    }
    
    // If rolled 6, can roll again, otherwise next turn
    if (diceValue === 6 && consecutiveSixes < 2) {
      setHasRolled(false);
      setMessage(`${player.name} rolled a 6! Roll again or move another token.`);
    } else {
      nextTurn();
    }
  };

  const nextTurn = useCallback(() => {
    setConsecutiveSixes(0);
    setHasRolled(false);
    setDiceValue(0);
    setSelectedToken(null);
    const nextIndex = (currentPlayerIndex + 1) % playerCount;
    setCurrentPlayerIndex(nextIndex);
    const nextPlayer = players[nextIndex];
    const newMessage = nextPlayer ? `${nextPlayer.name}'s turn! Roll the dice.` : "";
    setMessage(newMessage);
    
    // Sync game state for online games
    if (isOnlineGame) {
      saveOnlineGameState({
        currentPlayerIndex: nextIndex,
        diceValue: 0,
        hasRolled: false,
        message: newMessage,
        players,
      });
    }
  }, [currentPlayerIndex, playerCount, players, isOnlineGame, saveOnlineGameState]);

  const getTokenPosition = (player: Player, token: Token): { x: number; y: number } => {
    if (token.isHome) {
      return START_POSITIONS[player.id][token.id];
    } else if (token.position >= 100) {
      // In home column (positions 100-106, where 106 = finished)
      const homeColumnIndex = token.position - 100;
      if (homeColumnIndex >= 6) {
        // Token is finished, show in center
        return { x: 3, y: 3 };
      }
      // Home columns go from entry point towards center (3,3)
      // Red: from (1,0) goes down then right to (3,3)
      // Blue: from (6,1) goes left then down to (3,3)
      // Yellow: from (5,6) goes left then up to (3,3)
      // Green: from (0,5) goes right then up to (3,3)
      if (player.id === 0) {
        // Red: goes down then right
        if (homeColumnIndex < 3) {
          return { x: 1, y: 1 + homeColumnIndex };
        } else {
          return { x: 1 + (homeColumnIndex - 2), y: 3 };
        }
      } else if (player.id === 1) {
        // Green: goes right then up
        if (homeColumnIndex < 3) {
          return { x: 1 + homeColumnIndex, y: 5 };
        } else {
          return { x: 3, y: 5 - (homeColumnIndex - 2) };
        }
      } else if (player.id === 2) {
        // Blue: goes left then down
        if (homeColumnIndex < 3) {
          return { x: 5 - homeColumnIndex, y: 1 };
        } else {
          return { x: 3, y: 1 + (homeColumnIndex - 2) };
        }
      } else {
        // Yellow: goes left then up
        if (homeColumnIndex < 3) {
          return { x: 5 - homeColumnIndex, y: 5 };
        } else {
          return { x: 3, y: 5 - (homeColumnIndex - 2) };
        }
      }
    } else {
      // On board path - position is relative to player's start
      const absolutePosition = (player.startPosition + token.position) % 28;
      return BOARD_PATH[absolutePosition];
    }
  };

  // Helper function to determine cell type and color
  const getCellInfo = (row: number, col: number) => {
    // Player home bases (2x2 corners)
    if (row < 2 && col < 2) {
      return { type: "home", color: PLAYER_COLORS[0], playerId: 0 }; // Red
    }
    if (row < 2 && col >= 5) {
      return { type: "home", color: PLAYER_COLORS[2], playerId: 2 }; // Blue
    }
    if (row >= 5 && col < 2) {
      return { type: "home", color: PLAYER_COLORS[1], playerId: 1 }; // Green
    }
    if (row >= 5 && col >= 5) {
      return { type: "home", color: PLAYER_COLORS[3], playerId: 3 }; // Yellow
    }
    
    // Center area - cross-shaped yellow finish path
    // Only the cross itself (row 3 OR col 3) is the finish path
    if (row >= 2 && row <= 4 && col >= 2 && col <= 4) {
      // Cross pattern: center row (row 3) OR center column (col 3)
      if (row === 3 || col === 3) {
        return { type: "finish", color: PLAYER_COLORS[3] }; // Yellow finish path
      }
      // Corner squares of center area - these are part of the board background
      return { type: "center", color: null };
    }
    
    // Safe zones
    const isSafeZone = SAFE_ZONES.some(sz => sz.x === col && sz.y === row);
    if (isSafeZone) {
      return { type: "safe", color: null };
    }
    
    // Main path - determine which player's colored section
    // Top row (y=0): Red section (x: 1-6)
    if (row === 0 && col >= 1 && col <= 6) {
      return { type: "path", color: PLAYER_COLORS[0] }; // Red
    }
    // Right column (x=6): Blue section (y: 1-6)
    if (col === 6 && row >= 1 && row <= 6) {
      return { type: "path", color: PLAYER_COLORS[2] }; // Blue
    }
    // Bottom row (y=6): Yellow section (x: 0-5)
    if (row === 6 && col >= 0 && col <= 5) {
      return { type: "path", color: PLAYER_COLORS[3] }; // Yellow
    }
    // Left column (x=0): Green section (y: 0-5)
    if (col === 0 && row >= 0 && row <= 5) {
      return { type: "path", color: PLAYER_COLORS[1] }; // Green
    }
    
    return { type: "empty", color: null };
  };

  if (!currentUser) {
    return null;
  }

  // LOBBY PHASE - Show game lobby for online multiplayer
  if (gamePhase === "lobby") {
    return (
      <GameLobby
        gameType="ludo"
        gameName="LUDO"
        gameIcon="🎲"
        maxPlayers={4}
        minPlayers={2}
        onJoinRoom={handleJoinRoom}
        backUrl="/games"
      />
    );
  }

  // WAITING ROOM PHASE - Wait for players
  if (gamePhase === "waiting" && gameRoom) {
    return (
      <WaitingRoom
        gameType="ludo"
        gameName="LUDO"
        gameIcon="🎲"
        currentTeamName={currentUser?.name || "Player"}
        currentTeamId={null}
        gameId={`ludo_${gameRoom.code}`}
        currentUser={currentUser}
        roomCode={gameRoom.code}
        room={gameRoom}
        onStartGame={handleStartOnlineGame}
        onPlayAgainstComputer={() => {
          setIsOnlineGame(false);
          // Only go to setup if not in a room
          if (!gameRoom) {
            setGamePhase("setup");
          } else {
            // For room games, start directly
            initializeGame();
          }
        }}
        onLeaveRoom={handleLeaveRoom}
        minPlayers={2}
        maxPlayers={4}
        waitTime={60}
        showAvailableGames={true}
        showAvailableTeams={false}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-cyan-400 active:opacity-80 mb-4 sm:mb-8 font-semibold neon-glow-cyan min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">BACK TO GAMES</span>
        </Link>

        <div className="text-center mb-6">
          <h1 className="pixel-font text-2xl sm:text-3xl md:text-5xl font-bold text-yellow-400 neon-glow-yellow mb-2">
            🎲 LUDO 🎲
          </h1>
          <p className="text-sm sm:text-base text-cyan-300">
            Race your tokens around the board!
          </p>
        </div>

        {/* Online Game Info Banner */}
        {isOnlineGame && gameRoom && (
          <div className="neon-card neon-box-yellow p-4 mb-6 card-3d max-w-2xl mx-auto">
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

        {/* Team Info Banner */}
        {!isOnlineGame && (() => {
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
            <div className="neon-card neon-box-purple p-4 mb-6 card-3d max-w-2xl mx-auto">
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

        {gameState === "setup" && !(gameRoom && gameRoom.currentPlayers && gameRoom.currentPlayers.length >= (gameRoom.minPlayers || 2)) && (
          <div className="neon-card neon-box-yellow p-6 sm:p-8 max-w-2xl mx-auto card-3d">
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-6 text-center">Game Setup</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-cyan-300 mb-2">Number of Players</label>
                <div className="flex gap-2">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      onClick={() => setPlayerCount(count)}
                      className={`flex-1 py-2 px-4 rounded ${
                        playerCount === count
                          ? "bg-yellow-400 text-gray-900 font-bold"
                          : "bg-gray-700 text-cyan-300"
                      }`}
                    >
                      {count} Players
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {Array.from({ length: playerCount }).map((_, i) => (
                  <div key={i}>
                    <label className="block text-cyan-300 mb-1 text-sm">Player {i + 1} Name</label>
                    <input
                      type="text"
                      value={playerNames[i]}
                      onChange={(e) => {
                        const newNames = [...playerNames];
                        newNames[i] = e.target.value;
                        setPlayerNames(newNames);
                      }}
                      className="w-full px-4 py-2 bg-gray-800 border border-cyan-500 rounded text-cyan-300"
                      placeholder={`Player ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={initializeGame}
              className="neon-btn neon-btn-green w-full py-3 text-lg font-bold btn-3d"
            >
              START GAME
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="space-y-6">
            {/* Current Player Info */}
            <div className="neon-card neon-box-cyan p-4 text-center card-3d">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div>
                  <div className="text-sm text-cyan-300">Current Player</div>
                  <div className="text-xl font-bold" style={{ color: players[currentPlayerIndex]?.color.main }}>
                    {players[currentPlayerIndex]?.name}
                  </div>
                </div>
                <div className="text-cyan-300">|</div>
                <div>
                  <div className="text-sm text-cyan-300">Dice</div>
                  {diceValue > 0 ? (
                    <DiceIcon value={diceValue} isRolling={isRollingDice} />
                  ) : (
                    <div className="w-10 h-10 bg-gray-700 rounded"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Game Board - Realistic Design */}
            <div className="relative w-full max-w-2xl mx-auto" style={{ aspectRatio: "1/1" }}>
              {/* Animated Token Overlay */}
              {animatingToken && animatingFromPos && animatingToPos && (
                <AnimatedToken
                  player={players[animatingToken.playerId]}
                  fromPos={animatingFromPos}
                  toPos={animatingToPos}
                  tokenId={animatingToken.tokenId}
                />
              )}
              
              {/* Realistic Board */}
              <div 
                className="absolute inset-0 rounded-lg shadow-2xl border-4 border-amber-800"
                style={{
                  background: `
                    linear-gradient(135deg, #8B4513 0%, #A0522D 25%, #8B4513 50%, #654321 75%, #8B4513 100%),
                    repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 2px,
                      rgba(0, 0, 0, 0.1) 2px,
                      rgba(0, 0, 0, 0.1) 4px
                    )
                  `,
                  boxShadow: `
                    inset 0 0 50px rgba(0, 0, 0, 0.5),
                    0 10px 40px rgba(0, 0, 0, 0.8),
                    0 0 0 2px #654321
                  `
                }}
              >
                <div className="grid grid-cols-7 gap-1 h-full p-2 sm:p-4">
                  {Array.from({ length: 49 }).map((_, i) => {
                    const row = Math.floor(i / 7);
                    const col = i % 7;
                    const cellInfo = getCellInfo(row, col);
                    const isSafeZone = SAFE_ZONES.some(sz => sz.x === col && sz.y === row);
                    
                    let cellStyle: React.CSSProperties = {};
                    
                    // Apply styles based on cell type
                    if (cellInfo.type === "home") {
                      cellStyle = {
                        background: `linear-gradient(135deg, ${cellInfo.color!.dark} 0%, ${cellInfo.color!.main} 50%, ${cellInfo.color!.dark} 100%)`,
                        boxShadow: "inset 0 0 15px rgba(0, 0, 0, 0.4)"
                      };
                    } else if (cellInfo.type === "finish") {
                      cellStyle = {
                        background: "linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)",
                        boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.3)"
                      };
                    } else if (cellInfo.type === "safe") {
                      cellStyle = {
                        background: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #FFFFFF 100%)",
                        boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.2), 0 0 20px rgba(255, 255, 255, 0.5)"
                      };
                    } else if (cellInfo.type === "path") {
                      // Dark grey path with subtle player color accent
                      cellStyle = {
                        background: `linear-gradient(135deg, #374151 0%, #4B5563 50%, #374151 100%)`,
                        boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.3)",
                        border: `2px solid ${cellInfo.color!.main}40`
                      };
                    } else if (cellInfo.type === "center") {
                      // Center corner squares - match board background
                      cellStyle = {
                        background: "linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)",
                        boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.3)"
                      };
                    } else {
                      // Empty/fallback
                      cellStyle = {
                        background: "linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)",
                        boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.3)"
                      };
                    }
                    
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded flex items-center justify-center relative border border-gray-800/50"
                        style={{ 
                          minHeight: "40px",
                          ...cellStyle
                        }}
                      >
                        {/* Safe zone star indicator */}
                        {isSafeZone && (
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="text-yellow-400 text-lg sm:text-2xl" style={{ textShadow: "0 0 10px rgba(255, 255, 0, 0.8)" }}>
                              ⭐
                            </div>
                          </div>
                        )}
                        
                        {/* Render tokens */}
                        {players.map((player) =>
                          player.tokens.map((token, tokenIdx) => {
                            const pos = getTokenPosition(player, token);
                            const isAnimating = animatingToken?.playerId === player.id && animatingToken?.tokenId === tokenIdx;
                            
                            // Show token if it's at this position and not currently animating
                            // OR if it's animating but we want to show it at the new position
                            if (pos.x === col && pos.y === row) {
                              // Don't render if this exact token is animating (it's shown in the overlay)
                              if (isAnimating) {
                                return null;
                              }
                              return (
                                <TokenPiece
                                  key={`${player.id}-${tokenIdx}`}
                                  player={player}
                                  token={token}
                                  tokenIdx={tokenIdx}
                                  gameState={gameState}
                                  currentPlayerIndex={currentPlayerIndex}
                                  canMove={canMoveToken(player, token)}
                                  hasRolled={hasRolled}
                                  onClick={() => {
                                    if (
                                      gameState === "playing" &&
                                      currentPlayerIndex === player.id &&
                                      canMoveToken(player, token) &&
                                      hasRolled
                                    ) {
                                      moveToken(player.id, token.id);
                                    }
                                  }}
                                />
                              );
                            }
                            return null;
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="neon-card neon-box-green p-4 sm:p-6 card-3d">
              <div className="text-center mb-4">
                <div className="text-cyan-300 mb-2">{message}</div>
              </div>
              
              <div className="flex gap-4 justify-center flex-wrap">
                {(!hasRolled || (diceValue === 6 && consecutiveSixes < 2)) && !isRollingDice && !isMoving ? (
                  <button
                    onClick={rollDice}
                    disabled={isRollingDice || isMoving}
                    className="neon-btn neon-btn-yellow px-6 py-3 text-lg font-bold flex items-center gap-2 btn-3d"
                  >
                    <DiceIcon value={diceValue || 1} isRolling={isRollingDice} />
                    {isRollingDice ? "ROLLING..." : "ROLL DICE"}
                  </button>
                ) : (
                  <div className="text-cyan-300">Select a token to move</div>
                )}
                
                <button
                  onClick={() => {
                    setGameState("setup");
                    setPlayers([]);
                    setWinner(null);
                  }}
                  className="neon-btn neon-btn-red px-6 py-3 text-lg font-bold flex items-center gap-2 btn-3d"
                >
                  <RotateCcw className="w-5 h-5" />
                  RESET
                </button>
              </div>
            </div>

            {/* Player Status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`neon-card p-4 tile-3d ${
                    currentPlayerIndex === player.id ? "ring-2 ring-yellow-400" : ""
                  }`}
                  style={{ borderColor: player.color.main }}
                >
                  <div className="text-center">
                    <div className="font-bold mb-2" style={{ color: player.color.main }}>
                      {player.name}
                    </div>
                    <div className="text-sm text-cyan-300 space-y-1">
                      {player.tokens.map((token, idx) => (
                        <div key={idx} className="flex items-center justify-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: player.color.main }}
                          ></div>
                          <span>
                            {token.isFinished
                              ? "🏁 Finished"
                              : token.isHome
                              ? "🏠 Home"
                              : `📍 On Board`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState === "ended" && winner && (
          <div className="neon-card neon-box-yellow p-8 text-center max-w-2xl mx-auto card-3d">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">GAME OVER!</h2>
            <div className="text-2xl font-bold mb-6" style={{ color: winner.color.main }}>
              {winner.name} WINS!
            </div>
            <button
              onClick={() => {
                setGameState("setup");
                setPlayers([]);
                setWinner(null);
              }}
              className="neon-btn neon-btn-green px-8 py-3 text-lg font-bold btn-3d"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LudoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-cyan-400 text-xl">Loading game...</div>
      </div>
    }>
      <LudoPageContent />
    </Suspense>
  );
}

// Animated Token Component
function AnimatedToken({
  player,
  fromPos,
  toPos,
  tokenId
}: {
  player: Player;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  tokenId: number;
}) {
  const [position, setPosition] = useState(fromPos);
  const cellSize = 100 / 7; // 7x7 grid
  
  useEffect(() => {
    // Trigger animation after a brief delay
    const timer = setTimeout(() => {
      setPosition(toPos);
    }, 10);
    return () => clearTimeout(timer);
  }, [toPos]);
  
  const x = (position.x * cellSize) + (cellSize / 2);
  const y = (position.y * cellSize) + (cellSize / 2);
  
  return (
    <div
      className="absolute pointer-events-none z-50 player-token-animated"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1), top 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="relative animate-piece-move">
        <TokenPiece
          player={player}
          token={{ id: tokenId, position: 0, isHome: false, isFinished: false }}
          tokenIdx={tokenId}
          gameState="playing"
          currentPlayerIndex={player.id}
          canMove={false}
          hasRolled={false}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

// Realistic Token Piece Component
function TokenPiece({
  player,
  token,
  tokenIdx,
  gameState,
  currentPlayerIndex,
  canMove,
  hasRolled,
  onClick
}: {
  player: Player;
  token: Token;
  tokenIdx: number;
  gameState: string;
  currentPlayerIndex: number;
  canMove: boolean;
  hasRolled: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-300 ${
        gameState === "playing" &&
        currentPlayerIndex === player.id &&
        canMove &&
        hasRolled
          ? "ring-4 ring-yellow-400 animate-pulse scale-110 shadow-lg"
          : ""
      }`}
      style={{
        backgroundColor: player.color.main,
        boxShadow: `
          0 4px 8px rgba(0, 0, 0, 0.4),
          0 0 20px ${player.color.main}40,
          inset 0 2px 4px rgba(255, 255, 255, 0.3),
          inset 0 -2px 4px rgba(0, 0, 0, 0.3)
        `,
        background: `radial-gradient(circle at 30% 30%, ${player.color.light}, ${player.color.main} 60%, ${player.color.dark})`,
        left: `${(tokenIdx % 2) * 50}%`,
        top: `${Math.floor(tokenIdx / 2) * 50}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      onClick={onClick}
      title={`${player.name} Token ${tokenIdx + 1}${token.isFinished ? " (Finished)" : token.isHome ? " (Home)" : ""}`}
    >
      <div 
        className="w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 70%)`,
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)"
        }}
      >
        {tokenIdx + 1}
      </div>
    </div>
  );
}
