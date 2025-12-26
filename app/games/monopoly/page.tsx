"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Home, DollarSign, Users, Trophy, Zap, Globe, Lock, Copy, Check } from "lucide-react";
import GameLobby from "@/app/components/GameLobby";
import WaitingRoom from "@/app/components/WaitingRoom";

// Monopoly board spaces
const BOARD_SPACES = [
  { id: 0, name: "GO", type: "go", color: "" },
  { id: 1, name: "Mediterranean Ave", type: "property", color: "brown", price: 60, rent: 2 },
  { id: 2, name: "Community Chest", type: "chest", color: "" },
  { id: 3, name: "Baltic Ave", type: "property", color: "brown", price: 60, rent: 4 },
  { id: 4, name: "Income Tax", type: "tax", color: "", price: 200 },
  { id: 5, name: "Reading Railroad", type: "railroad", color: "", price: 200, rent: 25 },
  { id: 6, name: "Oriental Ave", type: "property", color: "lightblue", price: 100, rent: 6 },
  { id: 7, name: "Chance", type: "chance", color: "" },
  { id: 8, name: "Vermont Ave", type: "property", color: "lightblue", price: 100, rent: 6 },
  { id: 9, name: "Connecticut Ave", type: "property", color: "lightblue", price: 120, rent: 8 },
  { id: 10, name: "Jail / Just Visiting", type: "jail", color: "" },
  { id: 11, name: "St. Charles Place", type: "property", color: "pink", price: 140, rent: 10 },
  { id: 12, name: "Electric Company", type: "utility", color: "", price: 150, rent: 0 },
  { id: 13, name: "States Ave", type: "property", color: "pink", price: 140, rent: 10 },
  { id: 14, name: "Virginia Ave", type: "property", color: "pink", price: 160, rent: 12 },
  { id: 15, name: "Pennsylvania Railroad", type: "railroad", color: "", price: 200, rent: 25 },
  { id: 16, name: "St. James Place", type: "property", color: "orange", price: 180, rent: 14 },
  { id: 17, name: "Community Chest", type: "chest", color: "" },
  { id: 18, name: "Tennessee Ave", type: "property", color: "orange", price: 180, rent: 14 },
  { id: 19, name: "New York Ave", type: "property", color: "orange", price: 200, rent: 16 },
  { id: 20, name: "Free Parking", type: "parking", color: "" },
  { id: 21, name: "Kentucky Ave", type: "property", color: "red", price: 220, rent: 18 },
  { id: 22, name: "Chance", type: "chance", color: "" },
  { id: 23, name: "Indiana Ave", type: "property", color: "red", price: 220, rent: 18 },
  { id: 24, name: "Illinois Ave", type: "property", color: "red", price: 240, rent: 20 },
  { id: 25, name: "B&O Railroad", type: "railroad", color: "", price: 200, rent: 25 },
  { id: 26, name: "Atlantic Ave", type: "property", color: "yellow", price: 260, rent: 22 },
  { id: 27, name: "Ventnor Ave", type: "property", color: "yellow", price: 260, rent: 22 },
  { id: 28, name: "Water Works", type: "utility", color: "", price: 150, rent: 0 },
  { id: 29, name: "Marvin Gardens", type: "property", color: "yellow", price: 280, rent: 24 },
  { id: 30, name: "Go To Jail", type: "gotojail", color: "" },
  { id: 31, name: "Pacific Ave", type: "property", color: "green", price: 300, rent: 26 },
  { id: 32, name: "North Carolina Ave", type: "property", color: "green", price: 300, rent: 26 },
  { id: 33, name: "Community Chest", type: "chest", color: "" },
  { id: 34, name: "Pennsylvania Ave", type: "property", color: "green", price: 320, rent: 28 },
  { id: 35, name: "Short Line Railroad", type: "railroad", color: "", price: 200, rent: 25 },
  { id: 36, name: "Chance", type: "chance", color: "" },
  { id: 37, name: "Park Place", type: "property", color: "blue", price: 350, rent: 35 },
  { id: 38, name: "Luxury Tax", type: "tax", color: "", price: 100 },
  { id: 39, name: "Boardwalk", type: "property", color: "blue", price: 400, rent: 50 },
];

const PLAYER_COLORS = ["#ff00ff", "#00ffff", "#00ff00", "#ffff00", "#ff6600", "#9900ff"];
const PLAYER_TOKENS = ["🎮", "🎯", "🚀", "⭐", "🎪", "🎨"];

// Calculate board position for a space (returns x, y percentage)
const getBoardPosition = (spaceId: number): { x: number; y: number } => {
  // Board layout (11x11 grid):
  // Top row: 20-30 (left to right, 11 spaces)
  // Right column: 31-39 (top to bottom, 9 spaces)
  // Bottom row: 0-10 (right to left, 11 spaces)
  // Left column: 11-19 (bottom to top, 9 spaces)
  // Center: 9x9 grid (spaces not on edges)
  
  // Each cell is approximately 9.09% (100% / 11)
  const cellWidth = 100 / 11;
  const cellHeight = 100 / 11;
  
  // Center offset for corner spaces
  const cornerOffset = cellWidth / 2;
  
  if (spaceId >= 20 && spaceId <= 30) {
    // Top row (left to right)
    const index = spaceId - 20;
    return { 
      x: cornerOffset + (index * cellWidth), 
      y: cornerOffset 
    };
  } else if (spaceId >= 31 && spaceId <= 39) {
    // Right column (top to bottom)
    const index = spaceId - 31;
    return { 
      x: 100 - cornerOffset, 
      y: cornerOffset + cellHeight + (index * cellHeight) 
    };
  } else if (spaceId >= 0 && spaceId <= 10) {
    // Bottom row (right to left)
    const index = 10 - spaceId;
    return { 
      x: cornerOffset + (index * cellWidth), 
      y: 100 - cornerOffset 
    };
  } else if (spaceId >= 11 && spaceId <= 19) {
    // Left column (bottom to top)
    const index = 19 - spaceId;
    return { 
      x: cornerOffset, 
      y: cornerOffset + cellHeight + (index * cellHeight) 
    };
  }
  
  return { x: 50, y: 50 }; // Center fallback
};

const CHANCE_CARDS = [
  { text: "Advance to GO! Collect $200.", action: "move", value: 0 },
  { text: "Bank pays you dividend of $50.", action: "money", value: 50 },
  { text: "Go directly to Jail!", action: "jail", value: 10 },
  { text: "Your building loan matures. Collect $150.", action: "money", value: 150 },
  { text: "You won a crossword competition! Collect $100.", action: "money", value: 100 },
  { text: "Pay poor tax of $15.", action: "money", value: -15 },
  { text: "Advance to Illinois Ave.", action: "move", value: 24 },
  { text: "Go back 3 spaces.", action: "back", value: 3 },
];

const COMMUNITY_CARDS = [
  { text: "Bank error in your favor! Collect $200.", action: "money", value: 200 },
  { text: "Doctor's fee. Pay $50.", action: "money", value: -50 },
  { text: "From sale of stock you get $50.", action: "money", value: 50 },
  { text: "Go directly to Jail!", action: "jail", value: 10 },
  { text: "Holiday fund matures! Receive $100.", action: "money", value: 100 },
  { text: "Income tax refund. Collect $20.", action: "money", value: 20 },
  { text: "Life insurance matures. Collect $100.", action: "money", value: 100 },
  { text: "Pay hospital fees of $100.", action: "money", value: -100 },
];

interface Player {
  id: number;
  name: string;
  money: number;
  position: number;
  color: string;
  token: string;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  isBankrupt: boolean;
}

interface PropertyOwnership {
  [spaceId: number]: number; // player id
}

const DiceIcon = ({ value, isRolling }: { value: number; isRolling?: boolean }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return (
    <div className={`relative ${isRolling ? 'animate-dice-roll' : ''}`}>
      <Icon className="w-12 h-12" />
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

function MonopolyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gamePhase, setGamePhase] = useState<"lobby" | "waiting" | "setup" | "playing" | "ended">("lobby");
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [isOnlineGame, setIsOnlineGame] = useState(false);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  
  // Legacy gameState for compatibility
  const gameState = gamePhase === "setup" ? "setup" : gamePhase === "playing" ? "playing" : gamePhase === "ended" ? "ended" : "setup";
  const setGameState = (state: "setup" | "playing" | "ended") => {
    if (state === "setup") setGamePhase("setup");
    else if (state === "playing") setGamePhase("playing");
    else if (state === "ended") setGamePhase("ended");
  };
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [hasRolled, setHasRolled] = useState(false);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [animatingPlayerId, setAnimatingPlayerId] = useState<number | null>(null);
  const [animatingFromPosition, setAnimatingFromPosition] = useState<number | null>(null);
  const [animatingToPosition, setAnimatingToPosition] = useState<number | null>(null);
  const [propertyOwnership, setPropertyOwnership] = useState<PropertyOwnership>({});
  const [message, setMessage] = useState("");
  const [showCard, setShowCard] = useState<{ type: string; text: string } | null>(null);
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6"]);
  const [winner, setWinner] = useState<Player | null>(null);

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
        setGamePhase("waiting");
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

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
    
    const roomPlayerNames = gameRoom.currentPlayers.map(p => p.name);
    // Keep slots empty for additional players - don't use generic names
    while (roomPlayerNames.length < 6) {
      roomPlayerNames.push("");
    }
    setPlayerNames(roomPlayerNames);
    setPlayerCount(Math.min(gameRoom.currentPlayers.length, 6));
    
    const myIndex = gameRoom.currentPlayers.findIndex(p => p.id === currentUser?.id);
    setMyPlayerIndex(myIndex >= 0 ? myIndex : 0);
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      await gameRoomsAPI.updateRoomStatus(gameRoom.id, 'playing');
    } catch (error) {
      console.error("Error updating room status:", error);
    }
    
    setGamePhase("setup");
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
    router.push("/games/monopoly");
  };

  // Save game state for online multiplayer
  const saveOnlineGameState = useCallback(async (state: any) => {
    if (!isOnlineGame || !gameRoom || !currentUser) return;
    
    try {
      const { gameStateAPI } = await import("@/lib/api-utils");
      const gameId = `monopoly_${gameRoom.code}`;
      await gameStateAPI.saveGameState({
        id: gameId,
        gameType: "monopoly",
        state: {
          players: state.players || players,
          currentPlayerIndex: state.currentPlayerIndex ?? currentPlayerIndex,
          dice: state.dice || dice,
          hasRolled: state.hasRolled ?? hasRolled,
          propertyOwnership: state.propertyOwnership || propertyOwnership,
          message: state.message || message,
          winner: state.winner || winner,
          gamePhase: state.gamePhase || gamePhase,
        },
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser.id,
      });
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  }, [isOnlineGame, gameRoom, currentUser, players, currentPlayerIndex, dice, hasRolled, propertyOwnership, message, winner, gamePhase]);

  // Sync game state for online multiplayer (works during playing AND setup phases)
  useEffect(() => {
    if (!isOnlineGame || !gameRoom) return;
    if (gamePhase !== "playing" && gamePhase !== "setup") return;
    
    const syncGameState = async () => {
      try {
        const { gameStateAPI } = await import("@/lib/api-utils");
        const gameId = `monopoly_${gameRoom.code}`;
        const result = await gameStateAPI.getGameState(gameId);
        
        if (result.success && result.state && result.state.lastUpdated !== lastSyncTime) {
          const remoteState = result.state.state;
          
          if (result.state.updatedBy !== currentUser?.id) {
            if (remoteState.players) setPlayers(remoteState.players);
            if (remoteState.currentPlayerIndex !== undefined) setCurrentPlayerIndex(remoteState.currentPlayerIndex);
            if (remoteState.dice) setDice(remoteState.dice);
            if (remoteState.hasRolled !== undefined) setHasRolled(remoteState.hasRolled);
            if (remoteState.propertyOwnership) setPropertyOwnership(remoteState.propertyOwnership);
            if (remoteState.message) setMessage(remoteState.message);
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
          // Keep remaining slots empty - don't use generic names
          while (newNames.length < 6) {
            newNames.push("");
          }
          setPlayerNames(newNames);
          setPlayerCount(Math.min(teamMemberNames.length, 6));
        }
      } catch (e) {
        console.error("Error loading group:", e);
      }
    }
  }, [router]);

  const initializeGame = async () => {
    const newPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      // Use playerName if set, otherwise use placeholder only at game start
      const playerName = playerNames[i]?.trim() || `Player ${i + 1}`;
      newPlayers.push({
        id: i,
        name: playerName,
        money: 1500,
        position: 0,
        color: PLAYER_COLORS[i],
        token: PLAYER_TOKENS[i],
        properties: [],
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      });
    }
    const initialMessage = `${newPlayers[0].name}'s turn! Roll the dice.`;
    
    setPlayers(newPlayers);
    setPropertyOwnership({});
    setCurrentPlayerIndex(0);
    setHasRolled(false);
    setMessage(initialMessage);
    setGameState("playing");
    
    // Sync initial state for online games
    if (isOnlineGame && gameRoom && currentUser) {
      try {
        const { gameStateAPI } = await import("@/lib/api-utils");
        const gameId = `monopoly_${gameRoom.code}`;
        await gameStateAPI.saveGameState({
          id: gameId,
          gameType: "monopoly",
          state: {
            players: newPlayers,
            currentPlayerIndex: 0,
            dice: [1, 1],
            hasRolled: false,
            propertyOwnership: {},
            message: initialMessage,
            winner: null,
            gamePhase: "playing",
          },
          lastUpdated: new Date().toISOString(),
          updatedBy: currentUser.id,
        });
      } catch (error) {
        console.error("Error syncing initial game state:", error);
      }
    }
  };

  const handleLanding = useCallback((position: number) => {
    setPlayers(prev => {
      const currentPlayer = prev[currentPlayerIndex];
      const space = BOARD_SPACES[position];
      
      switch (space.type) {
        case "go":
          setMessage(`${currentPlayer.name} landed on GO!`);
          break;
          
        case "property":
        case "railroad":
        case "utility":
          if (propertyOwnership[position] !== undefined) {
            const ownerId = propertyOwnership[position];
            if (ownerId !== currentPlayer.id) {
              const owner = prev[ownerId];
              const rent = space.rent || 25;
              // Check if player can afford rent
              if (currentPlayer.money >= rent) {
                const updated = prev.map((p, i) => {
                  if (i === currentPlayerIndex) return { ...p, money: p.money - rent };
                  if (i === ownerId) return { ...p, money: p.money + rent };
                  return p;
                });
                setMessage(`${currentPlayer.name} pays $${rent} rent to ${owner.name}!`);
                // Check bankruptcy after rent payment
                setTimeout(() => checkBankruptcy(), 100);
                return updated;
              } else {
                // Player can't afford rent - bankrupt
                setMessage(`${currentPlayer.name} cannot afford $${rent} rent! Bankrupt!`);
                const updated = prev.map((p, i) => 
                  i === currentPlayerIndex ? { ...p, money: 0, isBankrupt: true } : p
                );
                setTimeout(() => checkBankruptcy(), 100);
                return updated;
              }
            } else {
              setMessage(`${currentPlayer.name} landed on their own property.`);
            }
          } else {
            setMessage(`${currentPlayer.name} landed on ${space.name}. Price: $${space.price}. Click to buy!`);
          }
          break;
          
        case "tax":
          const taxAmount = space.price || 100;
          if (currentPlayer.money >= taxAmount) {
            const updated = prev.map((p, i) => 
              i === currentPlayerIndex ? { ...p, money: p.money - taxAmount } : p
            );
            setMessage(`${currentPlayer.name} pays $${taxAmount} in taxes!`);
            setTimeout(() => checkBankruptcy(), 100);
            return updated;
          } else {
            // Can't afford tax - bankrupt
            const updated = prev.map((p, i) => 
              i === currentPlayerIndex ? { ...p, money: 0, isBankrupt: true } : p
            );
            setMessage(`${currentPlayer.name} cannot afford taxes! Bankrupt!`);
            setTimeout(() => checkBankruptcy(), 100);
            return updated;
          }
          
        case "chance":
          const chanceCard = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
          setShowCard({ type: "Chance", text: chanceCard.text });
          handleCard(chanceCard);
          break;
          
        case "chest":
          const chestCard = COMMUNITY_CARDS[Math.floor(Math.random() * COMMUNITY_CARDS.length)];
          setShowCard({ type: "Community Chest", text: chestCard.text });
          handleCard(chestCard);
          break;
          
        case "gotojail":
          const jailed = prev.map((p, i) => 
            i === currentPlayerIndex ? { ...p, position: 10, inJail: true } : p
          );
          setMessage(`${currentPlayer.name} goes to Jail!`);
          return jailed;
          
        case "jail":
          setMessage(`${currentPlayer.name} is just visiting Jail.`);
          break;
          
        case "parking":
          setMessage(`${currentPlayer.name} landed on Free Parking.`);
          break;
      }
      
      return prev;
    });
  }, [currentPlayerIndex, propertyOwnership]);

  const movePlayer = useCallback((spaces: number) => {
    if (isMoving) return;
    
    const currentPlayer = players[currentPlayerIndex];
    const startPosition = currentPlayer.position;
    let newPosition = (currentPlayer.position + spaces) % 40;
    
    // Check if passed GO (wrapped around)
    const passedGo = (startPosition + spaces) >= 40 && !currentPlayer.inJail;
    if (passedGo) {
      setPlayers(prev => prev.map((p, i) => 
        i === currentPlayerIndex ? { ...p, money: p.money + 200 } : p
      ));
      setMessage(prev => prev + ` Passed GO! Collect $200.`);
    }
    
    // Update position immediately so piece stays visible
    setPlayers(prev => prev.map((p, i) => 
      i === currentPlayerIndex ? { ...p, position: newPosition } : p
    ));
    
    // Start animation
    setIsMoving(true);
    setAnimatingPlayerId(currentPlayer.id);
    setAnimatingFromPosition(startPosition);
    setAnimatingToPosition(newPosition);
    
    // Calculate total spaces to move (handling wrap-around)
    let spacesToMove = spaces;
    if (startPosition + spaces >= 40) {
      // Need to wrap around
      spacesToMove = spaces;
    }
    
    // Animate movement space by space
    let currentAnimPosition = startPosition;
    let spacesMoved = 0;
    const moveInterval = setInterval(() => {
      currentAnimPosition = (currentAnimPosition + 1) % 40;
      spacesMoved++;
      setAnimatingFromPosition(currentAnimPosition);
      
      if (spacesMoved >= spacesToMove) {
        clearInterval(moveInterval);
        // Animation complete - position already updated above
        setIsMoving(false);
        setAnimatingPlayerId(null);
        setAnimatingFromPosition(null);
        setAnimatingToPosition(null);
        
        // Handle landing on space
        setTimeout(() => handleLanding(newPosition), 300);
      }
    }, 200); // 200ms per space
  }, [isMoving, players, currentPlayerIndex, handleLanding]);

  const rollDice = useCallback(() => {
    if (hasRolled || isRollingDice) return;
    
    setIsRollingDice(true);
    
    // Animate dice rolling for 1.5 seconds
    const rollInterval = setInterval(() => {
      const tempDie1 = Math.floor(Math.random() * 6) + 1;
      const tempDie2 = Math.floor(Math.random() * 6) + 1;
      setDice([tempDie1, tempDie2]);
    }, 100);
    
    setTimeout(() => {
      clearInterval(rollInterval);
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      setDice([die1, die2]);
      setIsRollingDice(false);
      setHasRolled(true);
      
      // Use functional update to get fresh player data
      setPlayers(prev => {
        const currentPlayer = prev[currentPlayerIndex];
        
        // Handle jail
        if (currentPlayer.inJail) {
          if (die1 === die2) {
            // Doubles get out of jail
            const updated = prev.map((p, i) => 
              i === currentPlayerIndex ? { ...p, inJail: false, jailTurns: 0 } : p
            );
            setTimeout(() => {
              setMessage(`${currentPlayer.name} rolled doubles and is out of jail!`);
              movePlayer(die1 + die2);
            }, 0);
            return updated;
          } else {
            const updated = prev.map((p, i) => 
              i === currentPlayerIndex ? { ...p, jailTurns: p.jailTurns + 1 } : p
            );
            if (currentPlayer.jailTurns >= 2) {
              // 3rd turn, must pay to get out
              if (currentPlayer.money >= 50) {
                const paid = updated.map((p, i) => 
                  i === currentPlayerIndex ? { ...p, money: p.money - 50, inJail: false, jailTurns: 0 } : p
                );
                setTimeout(() => {
                  setMessage(`${currentPlayer.name} paid $50 to get out of jail.`);
                  movePlayer(die1 + die2);
                  checkBankruptcy();
                }, 0);
                return paid;
              } else {
                // Can't afford to pay - bankrupt
                const bankrupt = updated.map((p, i) => 
                  i === currentPlayerIndex ? { ...p, money: 0, isBankrupt: true } : p
                );
                setTimeout(() => {
                  setMessage(`${currentPlayer.name} cannot afford to pay $50 to get out of jail! Bankrupt!`);
                  checkBankruptcy();
                }, 0);
                return bankrupt;
              }
            } else {
              setTimeout(() => {
                setMessage(`${currentPlayer.name} is still in jail. No doubles.`);
              }, 0);
              return updated;
            }
          }
        } else {
          // Not in jail, move normally
          setTimeout(() => {
            movePlayer(die1 + die2);
          }, 0);
          return prev;
        }
      });
    }, 1500);
  }, [hasRolled, isRollingDice, currentPlayerIndex, movePlayer]);

  const handleCard = (card: { text: string; action: string; value: number }) => {
    setPlayers(prev => {
      const currentPlayer = prev[currentPlayerIndex];
      if (!currentPlayer || currentPlayer.isBankrupt) return prev;
      
      switch (card.action) {
        case "money":
          const newMoney = currentPlayer.money + card.value;
          const updated = prev.map((p, i) => 
            i === currentPlayerIndex ? { ...p, money: Math.max(0, newMoney) } : p
          );
          setTimeout(() => checkBankruptcy(), 100);
          return updated;
          
        case "move":
          const moved = prev.map((p, i) => 
            i === currentPlayerIndex ? { ...p, position: card.value } : p
          );
          if (card.value === 0) {
            // Landed on GO
            const withGoMoney = moved.map((p, i) => 
              i === currentPlayerIndex ? { ...p, money: p.money + 200 } : p
            );
            setTimeout(() => handleLanding(0), 300);
            return withGoMoney;
          } else {
            setTimeout(() => handleLanding(card.value), 300);
            return moved;
          }
          
        case "jail":
          const jailed = prev.map((p, i) => 
            i === currentPlayerIndex ? { ...p, position: 10, inJail: true } : p
          );
          return jailed;
          
        case "back":
          const newPos = (currentPlayer.position - card.value + 40) % 40;
          const movedBack = prev.map((p, i) => 
            i === currentPlayerIndex ? { ...p, position: newPos } : p
          );
          setTimeout(() => handleLanding(newPos), 300);
          return movedBack;
          
        default:
          return prev;
      }
    });
  };

  const buyProperty = () => {
    setPlayers(prev => {
      const currentPlayer = prev[currentPlayerIndex];
      if (!currentPlayer || currentPlayer.isBankrupt) return prev;
      
      const space = BOARD_SPACES[currentPlayer.position];
      
      if (space.price && propertyOwnership[currentPlayer.position] === undefined) {
        if (currentPlayer.money >= space.price) {
          const updated = prev.map((p, i) => 
            i === currentPlayerIndex 
              ? { ...p, money: p.money - space.price!, properties: [...p.properties, currentPlayer.position] } 
              : p
          );
          setPropertyOwnership(prevOwnership => ({ ...prevOwnership, [currentPlayer.position]: currentPlayer.id }));
          setMessage(`${currentPlayer.name} bought ${space.name} for $${space.price}!`);
          return updated;
        } else {
          setMessage(`${currentPlayer.name} doesn't have enough money to buy ${space.name}!`);
          return prev;
        }
      }
      return prev;
    });
  };

  const checkBankruptcy = useCallback(() => {
    setPlayers(prev => {
      const updatedPlayers = prev.map(p => ({
        ...p,
        isBankrupt: p.money < 0 || p.isBankrupt
      }));
      
      const activePlayers = updatedPlayers.filter(p => !p.isBankrupt);
      
      if (activePlayers.length === 1 && updatedPlayers.length > 1) {
        setWinner(activePlayers[0]);
        setGameState("ended");
        setMessage(`${activePlayers[0].name} wins! All other players are bankrupt!`);
      }
      
      return updatedPlayers;
    });
  }, []);

  const endTurn = () => {
    setShowCard(null);
    setPlayers(prev => {
      let nextIndex = (currentPlayerIndex + 1) % prev.length;
      
      // Skip bankrupt players
      let attempts = 0;
      while (prev[nextIndex].isBankrupt && attempts < prev.length) {
        nextIndex = (nextIndex + 1) % prev.length;
        attempts++;
      }
      
      // If all players are bankrupt except one, game should have ended
      const activePlayers = prev.filter(p => !p.isBankrupt);
      if (activePlayers.length <= 1) {
        return prev;
      }
      
      setCurrentPlayerIndex(nextIndex);
      setHasRolled(false);
      setMessage(`${prev[nextIndex].name}'s turn! Roll the dice.`);
      return prev;
    });
  };

  const getSpaceColor = (color: string) => {
    const colors: Record<string, string> = {
      brown: "#8B4513", // Dark brown like real Monopoly
      lightblue: "#87CEEB", // Sky blue
      pink: "#FF69B4", // Hot pink
      orange: "#FF8C00", // Dark orange
      red: "#DC143C", // Crimson red
      yellow: "#FFD700", // Gold yellow
      green: "#228B22", // Forest green
      blue: "#0000CD", // Medium blue
    };
    return colors[color] || "";
  };

  if (!currentUser) return null;

  // LOBBY PHASE - Show game lobby for online multiplayer
  if (gamePhase === "lobby") {
    return (
      <GameLobby
        gameType="monopoly"
        gameName="MONOPOLY"
        gameIcon="🏠"
        maxPlayers={6}
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
        gameType="monopoly"
        gameName="MONOPOLY"
        gameIcon="🏠"
        currentTeamName={currentUser?.name || "Player"}
        currentTeamId={null}
        gameId={`monopoly_${gameRoom.code}`}
        currentUser={currentUser}
        roomCode={gameRoom.code}
        room={gameRoom}
        onStartGame={handleStartOnlineGame}
        onPlayAgainstComputer={() => {
          setIsOnlineGame(false);
          setGamePhase("setup");
        }}
        onLeaveRoom={handleLeaveRoom}
        minPlayers={2}
        maxPlayers={6}
        waitTime={60}
        showAvailableGames={true}
        showAvailableTeams={false}
      />
    );
  }

  // Setup screen
  if (gameState === "setup") {
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
      <div className="min-h-screen p-4 sm:p-8 page-enter">
        <div className="max-w-4xl mx-auto">
          {/* Online Game Info Banner */}
          {isOnlineGame && gameRoom && (
            <div className="neon-card neon-box-yellow p-4 mb-6 card-3d">
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
            className="inline-flex items-center gap-2 text-cyan-400 active:opacity-80 mb-4 sm:mb-8 font-semibold min-h-[44px] animate-fade-in-left hover:animate-pulse-glow"
          >
            <ArrowLeft className="w-5 h-5 animate-fade-in-right" />
            <span className="text-sm sm:text-base">BACK TO GAMES</span>
          </Link>

          <div className="text-center mb-4 sm:mb-8 animate-fade-in-down delay-200">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 animate-glow-pulse" style={{ 
              color: "#DC143C",
              textShadow: "2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff",
              letterSpacing: "0.1em"
            }}>
              MONOPOLY
            </h1>
            <p className="text-sm sm:text-base text-cyan-300 animate-fade-in-up delay-300">Set up your multiplayer game</p>
          </div>

          {/* Group Info Banner */}
          {teamInfo && (
            <div className="neon-card neon-box-purple p-4 mb-6 card-3d max-w-lg mx-auto animate-slide-fade-in delay-400">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 animate-fade-in-left">
                  <Users className="w-5 h-5 text-purple-400 animate-pulse" />
                  <div>
                    <div className="text-purple-400 font-bold">Playing as Team: {teamInfo.name}</div>
                    <div className="text-cyan-300/70 text-sm">
                      {teamInfo.members.length + 1} member{teamInfo.members.length !== 0 ? "s" : ""} as players
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="neon-card neon-box-green p-4 sm:p-6 lg:p-8 max-w-lg mx-auto card-3d animate-scale-in delay-400">
            <div className="space-y-4 sm:space-y-6">
              <div className="animate-fade-in-up delay-500">
                <label className="block text-green-400 mb-2 pixel-font text-xs">NUMBER OF PLAYERS</label>
                <div className="flex gap-2 flex-wrap">
                  {[2, 3, 4, 5, 6].map((num, idx) => (
                    <button
                      key={num}
                      onClick={() => setPlayerCount(num)}
                      className={`px-4 py-2 rounded-lg font-bold transition-all min-h-[44px] min-w-[44px] active:scale-95 hover:animate-scale-up ${
                        playerCount === num 
                          ? "bg-green-500 text-black animate-pulse" 
                          : "bg-green-900/50 text-green-400 border border-green-500 active:bg-green-800/50"
                      }`}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 animate-fade-in-up delay-600">
                <label className="block text-green-400 mb-2 pixel-font text-xs">PLAYER NAMES</label>
                {Array.from({ length: playerCount }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3 card-enter" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="text-xl sm:text-2xl flex-shrink-0 animate-bounce-in">{PLAYER_TOKENS[i]}</span>
                    <input
                      type="text"
                      value={playerNames[i]}
                      onChange={(e) => {
                        const newNames = [...playerNames];
                        newNames[i] = e.target.value;
                        setPlayerNames(newNames);
                      }}
                      className="flex-1 p-2 sm:p-3 rounded-lg text-base sm:text-lg min-h-[48px] input-3d focus:animate-pulse-glow"
                      placeholder={`Player ${i + 1}`}
                    />
                    <div 
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 animate-bounce-in" 
                      style={{ backgroundColor: PLAYER_COLORS[i], animationDelay: `${i * 0.1 + 0.2}s` }}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={initializeGame}
                className="neon-btn neon-btn-green w-full text-base sm:text-lg min-h-[48px] btn-3d animate-fade-in-up delay-700 hover:animate-button-press"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2 animate-spin-pulse" />
                START GAME
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Winner screen
  if (gameState === "ended" && winner) {
    return (
      <div className="min-h-screen p-4 md:p-8 py-8">
        <div className="neon-card neon-box-yellow p-6 md:p-12 text-center max-w-lg mx-auto card-3d">
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
          <h1 className="pixel-font text-2xl text-yellow-400 neon-glow-yellow mb-4">
            WINNER!
          </h1>
          <p className="text-4xl mb-2">{winner.token}</p>
          <p className="text-3xl text-yellow-400 font-bold mb-2">{winner.name}</p>
          <p className="text-green-400 text-xl mb-8">Final Worth: ${winner.money}</p>
          <div className="space-y-4">
            <button
              onClick={() => setGameState("setup")}
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

  const currentPlayer = players[currentPlayerIndex];
  const currentSpace = BOARD_SPACES[currentPlayer?.position || 0];
  const canBuy = currentSpace && 
    (currentSpace.type === "property" || currentSpace.type === "railroad" || currentSpace.type === "utility") &&
    propertyOwnership[currentPlayer?.position] === undefined &&
    hasRolled;

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-cyan-400 active:opacity-80 mb-2 sm:mb-4 font-semibold min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm">BACK TO GAMES</span>
        </Link>

        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-4 text-center" style={{ 
          color: "#DC143C",
          textShadow: "2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff",
          letterSpacing: "0.1em"
        }}>
          MONOPOLY
        </h1>

        <div className="grid lg:grid-cols-[1fr_280px] gap-2 sm:gap-4">
          {/* Main Board Area */}
          <div className="space-y-4">
            {/* Message Bar */}
            <div className="neon-card neon-box-cyan p-2 sm:p-4 text-center card-3d">
              <p className="text-cyan-300 text-sm sm:text-base lg:text-lg">{message}</p>
            </div>

            {/* Classic Monopoly Board */}
            <div className="relative w-full max-w-4xl mx-auto" style={{ aspectRatio: "1/1" }}>
              {/* Animated Player Piece Overlay */}
              {animatingPlayerId !== null && animatingFromPosition !== null && (
                <AnimatedPlayerPiece
                  player={players.find(p => p.id === animatingPlayerId)!}
                  position={animatingFromPosition}
                  playerColors={PLAYER_COLORS}
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-4 border-amber-800 shadow-2xl" style={{ backgroundColor: "#D4E8D1" }}>
                {/* Board Grid */}
                <div className="absolute inset-0 p-2 sm:p-4">
                  <div className="grid grid-cols-11 h-full gap-0.5 sm:gap-1">
                    {/* Top row (20-30, left to right) */}
                    <div className="col-span-11 grid grid-cols-11 gap-0.5 sm:gap-1">
                      {BOARD_SPACES.slice(20, 31).map((space) => (
                        <BoardSpace 
                          key={space.id} 
                          space={space} 
                          players={players.filter(p => p.position === space.id && p.id !== animatingPlayerId)}
                          owner={propertyOwnership[space.id]}
                          playerColors={PLAYER_COLORS}
                          getSpaceColor={getSpaceColor}
                          isCorner={space.id === 20 || space.id === 30}
                          orientation="top"
                        />
                      ))}
                    </div>
                    
                    {/* Middle section */}
                    <div className="col-span-11 grid grid-cols-11 gap-0.5 sm:gap-1">
                      {/* Left column (19-11, bottom to top) */}
                      <div className="col-span-1 grid grid-rows-9 gap-0.5 sm:gap-1">
                        {BOARD_SPACES.slice(11, 20).reverse().map((space) => (
                          <BoardSpace 
                            key={space.id} 
                            space={space} 
                            players={players.filter(p => p.position === space.id && p.id !== animatingPlayerId)}
                            owner={propertyOwnership[space.id]}
                            playerColors={PLAYER_COLORS}
                            getSpaceColor={getSpaceColor}
                            isCorner={false}
                            orientation="left"
                          />
                        ))}
                      </div>
                      
                      {/* Center - MONOPOLY Logo with Dice */}
                      <div className="col-span-9 relative bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-700 shadow-inner" style={{ backgroundColor: "#F5E6D3" }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="transform -rotate-45 origin-center">
                            <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold" style={{ 
                              textShadow: "3px 3px 0px #fff, -3px -3px 0px #fff, 3px -3px 0px #fff, -3px 3px 0px #fff",
                              color: "#DC143C",
                              letterSpacing: "0.1em"
                            }}>
                              MONOPOLY
                            </div>
                          </div>
                        </div>
                        
                        {/* Dice in center */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                          <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <div className="flex gap-2 sm:gap-3 text-white">
                              <div className="bg-black/70 p-2 sm:p-3 rounded-lg animate-bounce-in shadow-lg border-2 border-white/50">
                                <DiceIcon value={dice[0]} isRolling={isRollingDice} />
                              </div>
                              <div className="bg-black/70 p-2 sm:p-3 rounded-lg animate-bounce-in delay-100 shadow-lg border-2 border-white/50">
                                <DiceIcon value={dice[1]} isRolling={isRollingDice} />
                              </div>
                            </div>
                            {dice[0] + dice[1] > 0 && !isRollingDice && (
                              <div className="text-lg sm:text-2xl font-bold text-amber-800" style={{ 
                                textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
                              }}>
                                Total: {dice[0] + dice[1]}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Current player info in center */}
                        <div className="absolute bottom-2 left-0 right-0 text-center">
                          <p className="text-lg sm:text-2xl mb-1">{currentPlayer?.token}</p>
                          <p className="text-xs sm:text-sm font-bold" style={{ color: currentPlayer?.color }}>
                            {currentPlayer?.name}
                          </p>
                          <p className="text-xs text-gray-600">on</p>
                          <p className="text-xs sm:text-sm font-semibold text-gray-800">{currentSpace?.name}</p>
                          {currentSpace?.price && (
                            <p className="text-xs sm:text-sm font-bold text-amber-700">${currentSpace.price}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Right column (31-39, top to bottom) */}
                      <div className="col-span-1 grid grid-rows-9 gap-0.5 sm:gap-1">
                        {BOARD_SPACES.slice(31, 40).map((space) => (
                          <BoardSpace 
                            key={space.id} 
                            space={space} 
                            players={players.filter(p => p.position === space.id && p.id !== animatingPlayerId)}
                            owner={propertyOwnership[space.id]}
                            playerColors={PLAYER_COLORS}
                            getSpaceColor={getSpaceColor}
                            isCorner={false}
                            orientation="right"
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Bottom row (0-10, right to left) */}
                    <div className="col-span-11 grid grid-cols-11 gap-0.5 sm:gap-1">
                      {BOARD_SPACES.slice(0, 11).reverse().map((space) => (
                        <BoardSpace 
                          key={space.id} 
                          space={space} 
                          players={players.filter(p => p.position === space.id && p.id !== animatingPlayerId)}
                          owner={propertyOwnership[space.id]}
                          playerColors={PLAYER_COLORS}
                          getSpaceColor={getSpaceColor}
                          isCorner={space.id === 0 || space.id === 10}
                          orientation="bottom"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="neon-card neon-box-pink p-2 sm:p-4 card-3d">
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center w-full">
                <button
                  onClick={rollDice}
                  disabled={hasRolled || currentPlayer?.isBankrupt || isRollingDice || isMoving}
                  className={`neon-btn min-h-[48px] text-xs sm:text-sm btn-3d ${!hasRolled && !isRollingDice && !isMoving ? "neon-btn-green hover:animate-button-press" : "opacity-50 cursor-not-allowed border-gray-500 text-gray-500"}`}
                >
                  {isRollingDice ? "🎲 ROLLING..." : "🎲 ROLL DICE"}
                </button>
                
                {canBuy && (
                  <button
                    onClick={buyProperty}
                    className="neon-btn neon-btn-yellow min-h-[48px] text-xs sm:text-sm btn-3d"
                  >
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 inline" /> BUY ${currentSpace?.price}
                  </button>
                )}
                
                {hasRolled && (
                  <button
                    onClick={endTurn}
                    className="neon-btn neon-btn-cyan min-h-[48px] text-xs sm:text-sm btn-3d"
                  >
                    END TURN →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Player Panel */}
          <div className="space-y-2 sm:space-y-3 order-first lg:order-last">
            <h2 className="pixel-font text-xs sm:text-sm text-pink-400 neon-glow-pink flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" /> <span>PLAYERS</span>
            </h2>
            
            {players.map((player, index) => (
              <div 
                key={player.id}
                className={`neon-card p-2 sm:p-3 transition-all tile-3d ${
                  index === currentPlayerIndex ? "neon-box-yellow scale-105" : "border border-gray-700"
                } ${player.isBankrupt ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{player.token}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs sm:text-sm truncate" style={{ color: player.color }}>
                      {player.name}
                      {player.isBankrupt && <span className="text-red-500 ml-1 sm:ml-2 text-xs">BANKRUPT</span>}
                      {player.inJail && <span className="text-orange-500 ml-1 sm:ml-2 text-xs">IN JAIL</span>}
                    </p>
                    <p className="text-green-400 font-mono text-xs sm:text-sm">${player.money}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{player.properties.length} props</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Modal */}
        {showCard && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className={`neon-card ${showCard.type === "Chance" ? "neon-box-orange" : "neon-box-cyan"} p-8 max-w-md text-center card-3d`}>
              <h3 className={`pixel-font text-lg mb-4 ${showCard.type === "Chance" ? "text-orange-400" : "text-cyan-400"}`}>
                {showCard.type === "Chance" ? "❓ CHANCE ❓" : "📦 COMMUNITY CHEST 📦"}
              </h3>
              <p className="text-xl text-white mb-6">{showCard.text}</p>
              <button
                onClick={() => setShowCard(null)}
                className={`neon-btn ${showCard.type === "Chance" ? "neon-btn-yellow" : "neon-btn-cyan"} btn-3d`}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Animated Player Piece Component
function AnimatedPlayerPiece({ 
  player, 
  position, 
  playerColors 
}: { 
  player: Player; 
  position: number; 
  playerColors: string[];
}) {
  const boardPos = getBoardPosition(position);
  
  if (!player) return null;
  
  return (
    <div
      className="absolute player-token-animated pointer-events-none"
      style={{
        left: `${boardPos.x}%`,
        top: `${boardPos.y}%`,
        transform: 'translate(-50%, -50%)',
        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
        filter: `drop-shadow(0 4px 8px ${playerColors[player.id]}80)`,
        zIndex: 100,
        transition: 'left 0.2s ease-in-out, top 0.2s ease-in-out',
      }}
    >
      <div
        className="relative animate-piece-move"
        style={{
          textShadow: `0 0 10px ${playerColors[player.id]}, 0 0 20px ${playerColors[player.id]}`,
        }}
      >
        {player.token}
      </div>
    </div>
  );
}

// Board Space Component - Classic Monopoly Style
function BoardSpace({ 
  space, 
  players, 
  owner, 
  playerColors, 
  getSpaceColor,
  isCorner,
  orientation = "top"
}: { 
  space: typeof BOARD_SPACES[0];
  players: Player[];
  owner?: number;
  playerColors: string[];
  getSpaceColor: (color: string) => string;
  isCorner: boolean;
  orientation?: "top" | "bottom" | "left" | "right";
}) {
  const isHorizontal = orientation === "top" || orientation === "bottom";
  const colorValue = space.color ? getSpaceColor(space.color) : "";

  // Corner spaces are larger
  if (isCorner) {
    return (
      <div 
        className="relative bg-white border-2 border-gray-800 rounded-sm shadow-md"
        style={{ 
          backgroundColor: space.type === "go" ? "#FFE4B5" : 
                          space.type === "jail" ? "#F5F5DC" :
                          space.type === "parking" ? "#E0E0E0" :
                          space.type === "gotojail" ? "#FFB6C1" : "#FFFFFF"
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center">
          {space.type === "go" && (
            <>
              <div className="text-xs sm:text-sm font-bold text-red-600 mb-1">GO</div>
              <div className="text-[8px] sm:text-[10px] text-gray-600">Collect $200</div>
              <div className="text-[8px] sm:text-[10px] text-gray-600">salary as you</div>
              <div className="text-[8px] sm:text-[10px] text-gray-600">pass</div>
            </>
          )}
          {space.type === "jail" && (
            <>
              <div className="text-xs sm:text-sm font-bold mb-1">IN JAIL</div>
              <div className="text-[8px] sm:text-[10px] text-gray-600">Just</div>
              <div className="text-[8px] sm:text-[10px] text-gray-600">Visiting</div>
            </>
          )}
          {space.type === "parking" && (
            <>
              <div className="text-xs sm:text-sm font-bold mb-1">FREE</div>
              <div className="text-xs sm:text-sm font-bold">PARKING</div>
            </>
          )}
          {space.type === "gotojail" && (
            <>
              <div className="text-xs sm:text-sm font-bold text-red-600 mb-1">GO TO</div>
              <div className="text-xs sm:text-sm font-bold text-red-600">JAIL</div>
            </>
          )}
        </div>
        {players.length > 0 && (
          <div className="absolute top-1 left-1 flex flex-wrap gap-1 z-10">
            {players.map((p, idx) => (
              <span 
                key={p.id} 
                className="text-lg sm:text-xl md:text-2xl drop-shadow-lg"
                style={{
                  filter: `drop-shadow(0 2px 4px ${playerColors[p.id]}80)`,
                  textShadow: `0 0 4px ${playerColors[p.id]}`,
                  transform: `translate(${idx * 3}px, ${idx * 3}px)`,
                }}
              >
                {p.token}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular property spaces
  return (
    <div 
      className="relative bg-white border border-gray-800 rounded-sm shadow-sm"
      style={{ 
        backgroundColor: "#FFFFFF",
        minHeight: isHorizontal ? "60px" : "50px"
      }}
    >
      {/* Property color bar at top for horizontal, left for vertical */}
      {colorValue && (
        <div 
          className={`absolute ${isHorizontal ? "top-0 left-0 right-0 h-3" : "top-0 left-0 bottom-0 w-3"} rounded-t`}
          style={{ backgroundColor: colorValue }}
        />
      )}
      
      {/* Space content */}
      <div className={`absolute inset-0 flex ${isHorizontal ? "flex-col" : "flex-row"} items-center justify-center p-0.5 sm:p-1 text-center`}>
        {space.type === "property" && (
          <div className="w-full">
            <div className="text-[7px] sm:text-[9px] font-bold text-gray-800 leading-tight px-0.5">
              {space.name.split(' ').slice(0, 2).join(' ')}
            </div>
            {space.price && (
              <div className="text-[6px] sm:text-[8px] text-gray-600 mt-0.5 font-semibold">
                ${space.price}
              </div>
            )}
          </div>
        )}
        
        {space.type === "railroad" && (
          <div className="w-full">
            <div className="text-[8px] sm:text-[10px] font-bold text-gray-800 mb-0.5">🚂</div>
            <div className="text-[7px] sm:text-[9px] text-gray-800 leading-tight px-0.5">
              {space.name.split(' ')[0]}
            </div>
            {space.price && (
              <div className="text-[6px] sm:text-[8px] text-gray-600">${space.price}</div>
            )}
          </div>
        )}
        
        {space.type === "utility" && (
          <div className="w-full">
            <div className="text-[8px] sm:text-[10px] font-bold text-gray-800 mb-0.5">💡</div>
            <div className="text-[7px] sm:text-[9px] text-gray-800 leading-tight px-0.5">
              {space.name}
            </div>
            {space.price && (
              <div className="text-[6px] sm:text-[8px] text-gray-600">${space.price}</div>
            )}
          </div>
        )}
        
        {space.type === "chance" && (
          <div className="w-full flex flex-col items-center justify-center">
            <div className="text-lg sm:text-xl mb-0.5">❓</div>
            <div className="text-[8px] sm:text-[10px] font-bold text-orange-600">CHANCE</div>
          </div>
        )}
        
        {space.type === "chest" && (
          <div className="w-full flex flex-col items-center justify-center">
            <div className="text-lg sm:text-xl mb-0.5">📦</div>
            <div className="text-[7px] sm:text-[9px] font-bold text-blue-600 leading-tight px-1">
              COMMUNITY CHEST
            </div>
          </div>
        )}
        
        {space.type === "tax" && (
          <div className="w-full">
            <div className="text-[8px] sm:text-[10px] font-bold text-gray-800 mb-0.5">💰</div>
            <div className="text-[7px] sm:text-[9px] text-gray-800 leading-tight px-0.5">
              {space.name}
            </div>
            {space.price && (
              <div className="text-[6px] sm:text-[8px] text-red-600 font-bold">Pay ${space.price}</div>
            )}
          </div>
        )}
      </div>
      
      {/* Owner indicator */}
      {owner !== undefined && (
        <div 
          className={`absolute ${isHorizontal ? "bottom-0" : "right-0"} ${isHorizontal ? "left-0 right-0 h-1.5" : "top-0 bottom-0 w-1.5"} rounded-b`}
          style={{ backgroundColor: playerColors[owner] }}
        />
      )}
      
      {/* Player tokens */}
      {players.length > 0 && (
        <div className={`absolute ${isHorizontal ? "top-1" : "left-1"} ${isHorizontal ? "left-1 right-1" : "top-1 bottom-1"} flex ${isHorizontal ? "flex-row" : "flex-col"} gap-0.5 sm:gap-1 items-center justify-center z-10`}>
          {players.map((p, idx) => (
            <span 
              key={p.id} 
              className="text-base sm:text-lg md:text-xl drop-shadow-lg"
              style={{
                filter: `drop-shadow(0 2px 4px ${playerColors[p.id]}80)`,
                textShadow: `0 0 4px ${playerColors[p.id]}`,
                transform: `translate(${idx * 2}px, ${idx * 2}px)`,
              }}
            >
              {p.token}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MonopolyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-cyan-400 text-xl">Loading game...</div>
      </div>
    }>
      <MonopolyPageContent />
    </Suspense>
  );
}


