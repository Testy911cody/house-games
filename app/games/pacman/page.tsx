"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, RotateCcw, Trophy, Zap, Ghost } from "lucide-react";

// Maze layout: 0 = wall, 1 = dot, 2 = power pellet, 3 = empty
const MAZE_LAYOUT = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0],
  [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [0, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 0],
  [0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const MAZE_HEIGHT = MAZE_LAYOUT.length;
const MAZE_WIDTH = MAZE_LAYOUT[0].length;

// Player colors
const PLAYER_COLORS = [
  { main: "#ffff00", name: "Yellow", icon: "🟡" }, // Classic Pacman
  { main: "#00ff00", name: "Green", icon: "🟢" },
  { main: "#00ffff", name: "Cyan", icon: "🔵" },
  { main: "#ff00ff", name: "Pink", icon: "🟣" },
];

// Starting positions for players (spawn points)
const START_POSITIONS = [
  { x: 1, y: 1 },   // Top-left area
  { x: 18, y: 1 },  // Top-right area
  { x: 1, y: 18 },  // Bottom-left area
  { x: 18, y: 18 }, // Bottom-right area
];

// Ghost starting positions
const GHOST_POSITIONS = [
  { x: 9, y: 9, color: "#ff0000", name: "Blinky" },
  { x: 10, y: 9, color: "#ffb8ff", name: "Pinky" },
  { x: 9, y: 10, color: "#00ffff", name: "Inky" },
  { x: 10, y: 10, color: "#ffb851", name: "Clyde" },
];

type Direction = "up" | "down" | "left" | "right" | null;

interface Player {
  id: number;
  name: string;
  color: typeof PLAYER_COLORS[0];
  x: number;
  y: number;
  score: number;
  lives: number;
  isPowered: boolean;
  powerTimer: number;
  direction: Direction;
  nextDirection: Direction;
}

interface Ghost {
  id: number;
  x: number;
  y: number;
  color: string;
  name: string;
  direction: Direction;
  isScared: boolean;
  scaredTimer: number;
}

export default function PacmanPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameState, setGameState] = useState<"setup" | "playing" | "paused" | "ended">("setup");
  const [players, setPlayers] = useState<Player[]>([]);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [maze, setMaze] = useState<number[][]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", "", ""]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [message, setMessage] = useState("");
  const [totalDots, setTotalDots] = useState(0);
  const [dotsCollected, setDotsCollected] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(500); // milliseconds between moves

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

  // Initialize maze
  const initializeMaze = useCallback(() => {
    const newMaze = MAZE_LAYOUT.map(row => [...row]);
    let dots = 0;
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        if (newMaze[y][x] === 1 || newMaze[y][x] === 2) {
          dots++;
        }
      }
    }
    setTotalDots(dots);
    setDotsCollected(0);
    setMaze(newMaze);
    return newMaze;
  }, []);

  // Initialize game
  const initializeGame = () => {
    const newMaze = initializeMaze();
    const newPlayers: Player[] = [];
    
    for (let i = 0; i < playerCount; i++) {
      const startPos = START_POSITIONS[i];
      // Use playerName if set, otherwise use placeholder only at game start
      const playerName = playerNames[i]?.trim() || `Player ${i + 1}`;
      newPlayers.push({
        id: i,
        name: playerName,
        color: PLAYER_COLORS[i],
        x: startPos.x,
        y: startPos.y,
        score: 0,
        lives: 3,
        isPowered: false,
        powerTimer: 0,
        direction: null,
        nextDirection: null,
      });
    }
    
    const newGhosts: Ghost[] = GHOST_POSITIONS.map((ghost, idx) => ({
      id: idx,
      x: ghost.x,
      y: ghost.y,
      color: ghost.color,
      name: ghost.name,
      direction: "left" as Direction,
      isScared: false,
      scaredTimer: 0,
    }));
    
    setPlayers(newPlayers);
    setGhosts(newGhosts);
    setCurrentPlayerIndex(0);
    setWinner(null);
    setMessage(`${newPlayers[0].name}'s turn! Use arrow keys to move.`);
    setGameState("playing");
  };

  // Check if position is valid (not a wall)
  const isValidPosition = (x: number, y: number, maze: number[][]): boolean => {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) return false;
    return maze[y][x] !== 0;
  };

  // Move player
  const movePlayer = useCallback((playerIndex: number, direction: Direction) => {
    if (!direction) return false;
    
    setPlayers(prevPlayers => {
      const player = prevPlayers[playerIndex];
      if (!player) return prevPlayers;
      
      let newX = player.x;
      let newY = player.y;
      
      switch (direction) {
        case "up":
          newY--;
          break;
        case "down":
          newY++;
          break;
        case "left":
          newX--;
          break;
        case "right":
          newX++;
          break;
      }
      
      // Wrap around (tunnel effect)
      if (newX < 0) newX = MAZE_WIDTH - 1;
      if (newX >= MAZE_WIDTH) newX = 0;
      
      if (!isValidPosition(newX, newY, maze)) return prevPlayers;
      
      const newPlayers = [...prevPlayers];
      newPlayers[playerIndex] = {
        ...player,
        x: newX,
        y: newY,
        direction: direction,
      };
      
      // Collect dot or power pellet
      const cellValue = maze[newY][newX];
      if (cellValue === 1) {
        // Regular dot
        const newMaze = maze.map(row => [...row]);
        newMaze[newY][newX] = 3; // Empty
        setMaze(newMaze);
        
        newPlayers[playerIndex].score += 10;
        setDotsCollected(prev => prev + 1);
        setMessage(`${player.name} collected a dot! +10 points`);
      } else if (cellValue === 2) {
        // Power pellet
        const newMaze = maze.map(row => [...row]);
        newMaze[newY][newX] = 3; // Empty
        setMaze(newMaze);
        
        newPlayers[playerIndex].score += 50;
        newPlayers[playerIndex].isPowered = true;
        newPlayers[playerIndex].powerTimer = 20; // 20 moves of power
        setDotsCollected(prev => prev + 1);
        
        // Make ghosts scared
        setGhosts(prevGhosts => prevGhosts.map(g => ({
          ...g,
          isScared: true,
          scaredTimer: 20,
        })));
        
        setMessage(`${player.name} collected a power pellet! Ghosts are scared!`);
      }
      
      return newPlayers;
    });
    return true;
  }, [maze]);

  // Move ghost (simple AI)
  const moveGhost = useCallback((ghostIndex: number) => {
    setGhosts(prevGhosts => {
      const ghost = prevGhosts[ghostIndex];
      if (!ghost) return prevGhosts;
      
      const directions: Direction[] = ["up", "down", "left", "right"];
      const validDirections: Direction[] = [];
      
      for (const dir of directions) {
        let newX = ghost.x;
        let newY = ghost.y;
        
        switch (dir) {
          case "up":
            newY--;
            break;
          case "down":
            newY++;
            break;
          case "left":
            newX--;
            break;
          case "right":
            newX++;
            break;
        }
        
        // Wrap around
        if (newX < 0) newX = MAZE_WIDTH - 1;
        if (newX >= MAZE_WIDTH) newX = 0;
        
        if (isValidPosition(newX, newY, maze)) {
          validDirections.push(dir);
        }
      }
      
      if (validDirections.length === 0) return prevGhosts;
      
      // Choose random direction (can be improved with pathfinding)
      const chosenDir = validDirections[Math.floor(Math.random() * validDirections.length)];
      
      let newX = ghost.x;
      let newY = ghost.y;
      
      switch (chosenDir) {
        case "up":
          newY--;
          break;
        case "down":
          newY++;
          break;
        case "left":
          newX--;
          break;
        case "right":
          newX++;
          break;
      }
      
      // Wrap around
      if (newX < 0) newX = MAZE_WIDTH - 1;
      if (newX >= MAZE_WIDTH) newX = 0;
      
      const newGhosts = [...prevGhosts];
      newGhosts[ghostIndex] = {
        ...ghost,
        x: newX,
        y: newY,
        direction: chosenDir,
        scaredTimer: Math.max(0, ghost.scaredTimer - 1),
        isScared: ghost.scaredTimer > 1,
      };
      
      return newGhosts;
    });
  }, [maze]);

  // Check collisions - separate effect to avoid nested setState
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer) return;
    
    // Check ghost collisions
    ghosts.forEach((ghost, ghostIndex) => {
      if (ghost.x === currentPlayer.x && ghost.y === currentPlayer.y) {
        if (currentPlayer.isPowered && ghost.isScared) {
          // Eat ghost
          setPlayers(prevPlayers => {
            const newPlayers = [...prevPlayers];
            newPlayers[currentPlayerIndex].score += 200;
            return newPlayers;
          });
          
          // Reset ghost position
          setGhosts(prevGhosts => {
            const newGhosts = [...prevGhosts];
            newGhosts[ghostIndex] = {
              ...ghost,
              x: GHOST_POSITIONS[ghostIndex].x,
              y: GHOST_POSITIONS[ghostIndex].y,
              isScared: false,
              scaredTimer: 0,
            };
            return newGhosts;
          });
          
          setMessage(`${currentPlayer.name} ate ${ghost.name}! +200 points`);
        } else if (!currentPlayer.isPowered || !ghost.isScared) {
          // Player dies
          setPlayers(prevPlayers => {
            const newPlayers = [...prevPlayers];
            newPlayers[currentPlayerIndex].lives--;
            newPlayers[currentPlayerIndex].x = START_POSITIONS[currentPlayerIndex].x;
            newPlayers[currentPlayerIndex].y = START_POSITIONS[currentPlayerIndex].y;
            newPlayers[currentPlayerIndex].isPowered = false;
            newPlayers[currentPlayerIndex].powerTimer = 0;
            
            if (newPlayers[currentPlayerIndex].lives <= 0) {
              setMessage(`${currentPlayer.name} is out of lives!`);
            } else {
              setMessage(`${currentPlayer.name} was caught! Lives remaining: ${newPlayers[currentPlayerIndex].lives}`);
            }
            return newPlayers;
          });
        }
      }
    });
    
    // Update power timer
    if (currentPlayer.isPowered) {
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        newPlayers[currentPlayerIndex].powerTimer--;
        if (newPlayers[currentPlayerIndex].powerTimer <= 0) {
          newPlayers[currentPlayerIndex].isPowered = false;
          setMessage(`${currentPlayer.name}'s power-up expired!`);
        }
        return newPlayers;
      });
    }
    
    // Check win condition
    if (dotsCollected >= totalDots) {
      const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
      setWinner(sortedPlayers[0]);
      setGameState("ended");
      setMessage(`Game Over! ${sortedPlayers[0].name} wins with ${sortedPlayers[0].score} points!`);
    }
  }, [gameState, players, currentPlayerIndex, ghosts, dotsCollected, totalDots]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const interval = setInterval(() => {
      setPlayers(prevPlayers => {
        const currentPlayer = prevPlayers[currentPlayerIndex];
        if (currentPlayer && currentPlayer.nextDirection) {
          movePlayer(currentPlayerIndex, currentPlayer.nextDirection);
          const newPlayers = [...prevPlayers];
          newPlayers[currentPlayerIndex].nextDirection = null;
          return newPlayers;
        }
        return prevPlayers;
      });
      
      // Move all ghosts
      for (let i = 0; i < 4; i++) {
        moveGhost(i);
      }
    }, gameSpeed);
    
    return () => clearInterval(interval);
  }, [gameState, currentPlayerIndex, movePlayer, moveGhost, gameSpeed]);

  // Handle direction input (keyboard, touch, or button)
  const handleDirectionInput = useCallback((direction: Direction) => {
    if (!direction || gameState !== "playing") return;
    
    setPlayers(prevPlayers => {
      const currentPlayer = prevPlayers[currentPlayerIndex];
      if (!currentPlayer) return prevPlayers;
      
      const newPlayers = [...prevPlayers];
      newPlayers[currentPlayerIndex].nextDirection = direction;
      return newPlayers;
    });
  }, [gameState, currentPlayerIndex]);

  // Keyboard controls
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      let direction: Direction = null;
      
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          direction = "up";
          break;
        case "ArrowDown":
        case "s":
        case "S":
          direction = "down";
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          direction = "left";
          break;
        case "ArrowRight":
        case "d":
        case "D":
          direction = "right";
          break;
      }
      
      if (direction) {
        e.preventDefault();
        handleDirectionInput(direction);
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, handleDirectionInput]);

  // Touch/Swipe controls for mobile
  useEffect(() => {
    if (gameState !== "playing") return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 30; // Minimum distance for a swipe
    
    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      const touch = touchEvent.touches[0];
      if (touch) {
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }
    };
    
    const handleTouchEnd = (e: Event) => {
      const touchEvent = e as TouchEvent;
      if (!touchEvent.changedTouches[0]) return;
      
      const touch = touchEvent.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      // Only register swipe if movement is significant
      if (absDeltaX < minSwipeDistance && absDeltaY < minSwipeDistance) {
        return; // Too small, ignore
      }
      
      let direction: Direction = null;
      
      // Determine swipe direction (prioritize the larger movement)
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        direction = deltaX > 0 ? "right" : "left";
      } else {
        // Vertical swipe
        direction = deltaY > 0 ? "down" : "up";
      }
      
      if (direction) {
        e.preventDefault();
        handleDirectionInput(direction);
      }
    };
    
    // Add touch listeners to the game board container
    const gameBoard = document.querySelector('[data-game-board]');
    if (gameBoard) {
      gameBoard.addEventListener("touchstart", handleTouchStart, { passive: true });
      gameBoard.addEventListener("touchend", handleTouchEnd, { passive: false });
    }
    
    return () => {
      if (gameBoard) {
        gameBoard.removeEventListener("touchstart", handleTouchStart);
        gameBoard.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [gameState, handleDirectionInput]);

  const nextTurn = useCallback(() => {
    setPlayers(prevPlayers => {
      // Find next active player
      let nextIndex = (currentPlayerIndex + 1) % playerCount;
      let attempts = 0;
      
      while (prevPlayers[nextIndex]?.lives <= 0 && attempts < playerCount) {
        nextIndex = (nextIndex + 1) % playerCount;
        attempts++;
      }
      
      // Check if game should end
      const activePlayers = prevPlayers.filter(p => p.lives > 0);
      if (activePlayers.length <= 1) {
        if (activePlayers.length === 1) {
          setWinner(activePlayers[0]);
        } else {
          // Highest score wins
          const sortedPlayers = [...prevPlayers].sort((a, b) => b.score - a.score);
          setWinner(sortedPlayers[0]);
        }
        setGameState("ended");
        return prevPlayers;
      }
      
      setCurrentPlayerIndex(nextIndex);
      const nextPlayer = prevPlayers[nextIndex];
      if (nextPlayer) {
        setMessage(`${nextPlayer.name}'s turn! Use arrow keys to move.`);
      }
      
      return prevPlayers;
    });
  }, [currentPlayerIndex, playerCount]);

  // Auto-advance turn after a delay
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const timer = setTimeout(() => {
      nextTurn();
    }, 10000); // 10 seconds per turn
    
    return () => clearTimeout(timer);
  }, [currentPlayerIndex, gameState, nextTurn]);

  if (!currentUser) {
    return null;
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
            👻 PACMAN MULTIPLAYER 👻
          </h1>
          <p className="text-sm sm:text-base text-cyan-300">
            Collect dots, avoid ghosts, and get the highest score!
          </p>
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

        {gameState === "setup" && (
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
                    <label className="block text-cyan-300 mb-1 text-sm">
                      Player {i + 1} Name {PLAYER_COLORS[i]?.icon}
                    </label>
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
                    {players[currentPlayerIndex]?.name} {players[currentPlayerIndex]?.color.icon}
                  </div>
                </div>
                <div className="text-cyan-300">|</div>
                <div>
                  <div className="text-sm text-cyan-300">Score</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {players[currentPlayerIndex]?.score}
                  </div>
                </div>
                <div className="text-cyan-300">|</div>
                <div>
                  <div className="text-sm text-cyan-300">Lives</div>
                  <div className="text-xl font-bold text-red-400">
                    {"❤️".repeat(players[currentPlayerIndex]?.lives || 0)}
                  </div>
                </div>
                {players[currentPlayerIndex]?.isPowered && (
                  <>
                    <div className="text-cyan-300">|</div>
                    <div>
                      <div className="text-sm text-cyan-300">Power-Up</div>
                      <div className="text-xl font-bold text-green-400 animate-pulse">
                        ⚡ {players[currentPlayerIndex]?.powerTimer}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Game Board */}
            <div className="neon-card neon-box-purple p-4 card-3d">
              <div 
                className="relative bg-black rounded-lg overflow-hidden touch-none" 
                style={{ aspectRatio: `${MAZE_WIDTH}/${MAZE_HEIGHT}` }}
                data-game-board
              >
                <div className="grid gap-0 h-full" style={{ gridTemplateColumns: `repeat(${MAZE_WIDTH}, 1fr)`, gridTemplateRows: `repeat(${MAZE_HEIGHT}, 1fr)` }}>
                  {Array.from({ length: MAZE_HEIGHT * MAZE_WIDTH }).map((_, i) => {
                    const y = Math.floor(i / MAZE_WIDTH);
                    const x = i % MAZE_WIDTH;
                    const cellValue = maze[y]?.[x] ?? 0;
                    const isWall = cellValue === 0;
                    const hasDot = cellValue === 1;
                    const hasPowerPellet = cellValue === 2;
                    
                    // Check if player is here
                    const playerHere = players.find(p => p.x === x && p.y === y);
                    // Check if ghost is here
                    const ghostHere = ghosts.find(g => g.x === x && g.y === y);
                    
                    return (
                      <div
                        key={i}
                        className={`relative flex items-center justify-center ${
                          isWall ? "bg-blue-900" : "bg-black"
                        }`}
                        style={{ minHeight: "20px", minWidth: "20px" }}
                      >
                        {!isWall && (
                          <>
                            {hasDot && !playerHere && (
                              <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse"></div>
                            )}
                            {hasPowerPellet && !playerHere && (
                              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-ping"></div>
                            )}
                            {playerHere && (
                              <div
                                className="w-6 h-6 rounded-full animate-pulse relative z-10"
                                style={{ backgroundColor: playerHere.color.main }}
                              >
                                <div className="absolute inset-0 flex items-center justify-center text-xs">
                                  👤
                                </div>
                              </div>
                            )}
                            {ghostHere && !playerHere && (
                              <div
                                className="w-6 h-6 rounded-full relative z-10"
                                style={{
                                  backgroundColor: ghostHere.isScared ? "#0000ff" : ghostHere.color,
                                  opacity: ghostHere.isScared ? 0.7 : 1,
                                }}
                              >
                                <div className="absolute inset-0 flex items-center justify-center text-xs">
                                  {ghostHere.isScared ? "😨" : "👻"}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="neon-card neon-box-green p-4 sm:p-6 card-3d">
              <div className="text-center mb-4">
                <div className="text-cyan-300 mb-2">{message}</div>
                <div className="text-sm text-cyan-300/70">
                  Progress: {dotsCollected} / {totalDots} dots collected
                </div>
              </div>
              
              <div className="flex gap-4 justify-center flex-wrap">
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
                      {player.name} {player.color.icon}
                    </div>
                    <div className="text-sm text-cyan-300 space-y-1">
                      <div>Score: {player.score}</div>
                      <div>Lives: {"❤️".repeat(player.lives)}</div>
                      {player.isPowered && (
                        <div className="text-green-400 animate-pulse">⚡ Powered Up!</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Directional Pad */}
            <div className="neon-card neon-box-cyan p-4 card-3d md:hidden">
              <div className="text-sm text-cyan-300 mb-4 text-center font-bold">Touch Controls</div>
              <div className="flex flex-col items-center gap-2">
                {/* Up Button */}
                <button
                  onClick={() => handleDirectionInput("up")}
                  className="w-16 h-16 bg-cyan-500/20 border-2 border-cyan-500 rounded-lg flex items-center justify-center text-2xl hover:bg-cyan-500/40 active:bg-cyan-500/60 transition-colors touch-manipulation"
                  aria-label="Move Up"
                >
                  ↑
                </button>
                {/* Middle Row */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDirectionInput("left")}
                    className="w-16 h-16 bg-cyan-500/20 border-2 border-cyan-500 rounded-lg flex items-center justify-center text-2xl hover:bg-cyan-500/40 active:bg-cyan-500/60 transition-colors touch-manipulation"
                    aria-label="Move Left"
                  >
                    ←
                  </button>
                  <div className="w-16 h-16"></div>
                  <button
                    onClick={() => handleDirectionInput("right")}
                    className="w-16 h-16 bg-cyan-500/20 border-2 border-cyan-500 rounded-lg flex items-center justify-center text-2xl hover:bg-cyan-500/40 active:bg-cyan-500/60 transition-colors touch-manipulation"
                    aria-label="Move Right"
                  >
                    →
                  </button>
                </div>
                {/* Down Button */}
                <button
                  onClick={() => handleDirectionInput("down")}
                  className="w-16 h-16 bg-cyan-500/20 border-2 border-cyan-500 rounded-lg flex items-center justify-center text-2xl hover:bg-cyan-500/40 active:bg-cyan-500/60 transition-colors touch-manipulation"
                  aria-label="Move Down"
                >
                  ↓
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="neon-card neon-box-cyan p-4 card-3d">
              <div className="text-sm text-cyan-300 space-y-2">
                <div className="font-bold mb-2">Controls:</div>
                <div className="hidden md:block">
                  <div>• Use Arrow Keys or WASD to move</div>
                </div>
                <div className="md:hidden">
                  <div>• Swipe on the game board or use the buttons below to move</div>
                </div>
                <div>• Collect dots (10 points) and power pellets (50 points)</div>
                <div>• Eat scared ghosts for 200 points each</div>
                <div>• Avoid ghosts when not powered up!</div>
                <div>• Each player gets 10 seconds per turn</div>
              </div>
            </div>
          </div>
        )}

        {gameState === "ended" && winner && (
          <div className="neon-card neon-box-yellow p-8 text-center max-w-2xl mx-auto card-3d">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">GAME OVER!</h2>
            <div className="text-2xl font-bold mb-2" style={{ color: winner.color.main }}>
              {winner.name} WINS!
            </div>
            <div className="text-xl text-cyan-300 mb-6">
              Final Score: {winner.score} points
            </div>
            <div className="space-y-2 mb-6">
              <div className="text-lg font-bold text-cyan-300">Final Scores:</div>
              {[...players].sort((a, b) => b.score - a.score).map((p, idx) => (
                <div key={p.id} className="text-cyan-200">
                  {idx + 1}. {p.name}: {p.score} points
                </div>
              ))}
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

