"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, RotateCcw, Users, Zap } from "lucide-react";

// Tetris pieces (Tetrominoes)
const TETROMINOES = {
  I: [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
  ],
  O: [
    [[1, 1], [1, 1]],
  ],
  T: [
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1], [1, 1], [0, 1]],
  ],
  S: [
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 1], [0, 1]],
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1], [1, 1], [1, 0]],
  ],
  J: [
    [[1, 0, 0], [1, 1, 1]],
    [[1, 1], [1, 0], [1, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[0, 1], [0, 1], [1, 1]],
  ],
  L: [
    [[0, 0, 1], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1], [0, 1], [0, 1]],
  ],
};

const PIECE_COLORS: Record<string, string> = {
  I: "#00ffff", // Cyan
  O: "#ffff00", // Yellow
  T: "#a000f0", // Purple
  S: "#00ff00", // Green
  Z: "#ff0000", // Red
  J: "#0000ff", // Blue
  L: "#ffa500", // Orange
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const DROP_INTERVAL = 1000; // milliseconds

interface Player {
  id: number;
  name: string;
  board: number[][];
  currentPiece: { shape: number[][]; x: number; y: number; type: string } | null;
  nextPiece: string;
  score: number;
  lines: number;
  level: number;
  isGameOver: boolean;
  color: string;
}

type GameState = "setup" | "playing" | "paused" | "ended";

export default function TetrisPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState>("setup");
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", "", ""]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const dropTimerRef = useRef<number | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  const PLAYER_COLORS = [
    { main: "#00ffff", name: "Cyan" },
    { main: "#ffff00", name: "Yellow" },
    { main: "#00ff00", name: "Green" },
    { main: "#ff00ff", name: "Pink" },
  ];

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

  // Create empty board
  const createBoard = (): number[][] => {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
  };

  // Get random piece type
  const getRandomPiece = (): string => {
    const types = Object.keys(TETROMINOES);
    return types[Math.floor(Math.random() * types.length)];
  };

  // Create piece at starting position
  const createPiece = (type: string) => {
    const shapes = TETROMINOES[type as keyof typeof TETROMINOES];
    return {
      shape: shapes[0],
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shapes[0][0].length / 2),
      y: 0,
      type: type,
    };
  };

  // Check if piece can be placed at position
  const canPlacePiece = (board: number[][], piece: { shape: number[][]; x: number; y: number }, x: number, y: number): boolean => {
    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px]) {
          const newX = x + px;
          const newY = y + py;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX] !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Rotate piece
  const rotatePiece = (piece: { shape: number[][]; x: number; y: number; type: string }) => {
    const shapes = TETROMINOES[piece.type as keyof typeof TETROMINOES];
    const currentIndex = shapes.findIndex(s => JSON.stringify(s) === JSON.stringify(piece.shape));
    const nextIndex = (currentIndex + 1) % shapes.length;
    return {
      ...piece,
      shape: shapes[nextIndex],
    };
  };

  // Place piece on board
  const placePiece = (board: number[][], piece: { shape: number[][]; x: number; y: number; type: string }) => {
    const newBoard = board.map(row => [...row]);
    const colorValue = piece.type.charCodeAt(0); // Use character code as color identifier
    
    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px]) {
          const y = piece.y + py;
          const x = piece.x + px;
          if (y >= 0) {
            newBoard[y][x] = colorValue;
          }
        }
      }
    }
    return newBoard;
  };

  // Clear completed lines
  const clearLines = (board: number[][]): { board: number[][]; linesCleared: number } => {
    const newBoard = board.filter(row => !row.every(cell => cell !== 0));
    const linesCleared = BOARD_HEIGHT - newBoard.length;
    
    // Add empty rows at top
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    return { board: newBoard, linesCleared };
  };

  // Initialize game
  const initializeGame = () => {
    const newPlayers: Player[] = [];
    
    for (let i = 0; i < playerCount; i++) {
      const firstPiece = getRandomPiece();
      const nextPiece = getRandomPiece();
      
      // Use playerName if set, otherwise use placeholder only at game start
      const playerName = playerNames[i]?.trim() || `Player ${i + 1}`;
      newPlayers.push({
        id: i,
        name: playerName,
        board: createBoard(),
        currentPiece: createPiece(firstPiece),
        nextPiece: nextPiece,
        score: 0,
        lines: 0,
        level: 1,
        isGameOver: false,
        color: PLAYER_COLORS[i].main,
      });
    }
    
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setWinner(null);
    setGameState("playing");
    startGameLoop();
  };

  // Move piece
  const movePiece = (playerIndex: number, dx: number, dy: number) => {
    setPlayers(prevPlayers => {
      const player = prevPlayers[playerIndex];
      if (!player || !player.currentPiece || player.isGameOver) return prevPlayers;
      
      const newX = player.currentPiece.x + dx;
      const newY = player.currentPiece.y + dy;
      
      if (canPlacePiece(player.board, player.currentPiece, newX, newY)) {
        const newPlayers = [...prevPlayers];
        newPlayers[playerIndex] = {
          ...player,
          currentPiece: {
            ...player.currentPiece,
            x: newX,
            y: newY,
          },
        };
        return newPlayers;
      }
      
      return prevPlayers;
    });
  };

  // Rotate current piece
  const rotateCurrentPiece = (playerIndex: number) => {
    setPlayers(prevPlayers => {
      const player = prevPlayers[playerIndex];
      if (!player || !player.currentPiece || player.isGameOver) return prevPlayers;
      
      const rotated = rotatePiece(player.currentPiece);
      
      if (canPlacePiece(player.board, rotated, rotated.x, rotated.y)) {
        const newPlayers = [...prevPlayers];
        newPlayers[playerIndex] = {
          ...player,
          currentPiece: rotated,
        };
        return newPlayers;
      }
      
      return prevPlayers;
    });
  };

  // Drop piece one row (manual drop)
  const dropPiece = (playerIndex: number) => {
    setPlayers(prevPlayers => {
      const player = prevPlayers[playerIndex];
      if (!player || !player.currentPiece || player.isGameOver) return prevPlayers;
      
      const newY = player.currentPiece.y + 1;
      
      if (canPlacePiece(player.board, player.currentPiece, player.currentPiece.x, newY)) {
        const newPlayers = [...prevPlayers];
        newPlayers[playerIndex] = {
          ...player,
          currentPiece: {
            ...player.currentPiece,
            y: newY,
          },
        };
        return newPlayers;
      } else {
        // Piece can't move down, lock it in place
        const newBoard = placePiece(player.board, player.currentPiece);
        const { board: clearedBoard, linesCleared } = clearLines(newBoard);
        
        // Calculate score
        const lineScores = [0, 100, 300, 500, 800];
        const points = lineScores[linesCleared] * (player.level + 1);
        const newLevel = Math.floor((player.lines + linesCleared) / 10) + 1;
        
        // Check game over
        const isGameOver = player.currentPiece.y < 0;
        
        // Spawn next piece
        const nextPieceType = player.nextPiece;
        const newNextPiece = getRandomPiece();
        
        const newPlayers = [...prevPlayers];
        newPlayers[playerIndex] = {
          ...player,
          board: clearedBoard,
          currentPiece: isGameOver ? null : createPiece(nextPieceType),
          nextPiece: newNextPiece,
          score: player.score + points,
          lines: player.lines + linesCleared,
          level: newLevel,
          isGameOver: isGameOver,
        };
        
        // Check if all players are game over
        const allGameOver = newPlayers.every(p => p.isGameOver);
        if (allGameOver) {
          const sortedPlayers = [...newPlayers].sort((a, b) => b.score - a.score);
          setWinner(sortedPlayers[0]);
          setGameState("ended");
          stopGameLoop();
        }
        
        return newPlayers;
      }
    });
  };

  // Game loop
  const startGameLoop = useCallback(() => {
    if (dropTimerRef.current) {
      clearInterval(dropTimerRef.current);
    }
    
    const gameLoop = () => {
      setPlayers(prevPlayers => {
        const newPlayers = prevPlayers.map((player) => {
          if (player.isGameOver || !player.currentPiece) {
            return player;
          }
          
          const newY = player.currentPiece.y + 1;
          
          if (canPlacePiece(player.board, player.currentPiece, player.currentPiece.x, newY)) {
            return {
              ...player,
              currentPiece: {
                ...player.currentPiece,
                y: newY,
              },
            };
          } else {
            // Piece can't move down, lock it in place
            const newBoard = placePiece(player.board, player.currentPiece);
            const { board: clearedBoard, linesCleared } = clearLines(newBoard);
            
            // Calculate score
            const lineScores = [0, 100, 300, 500, 800];
            const points = lineScores[linesCleared] * (player.level + 1);
            const newLevel = Math.floor((player.lines + linesCleared) / 10) + 1;
            
            // Check game over
            const isGameOver = player.currentPiece.y < 0;
            
            // Spawn next piece
            const nextPieceType = player.nextPiece;
            const newNextPiece = getRandomPiece();
            
            return {
              ...player,
              board: clearedBoard,
              currentPiece: isGameOver ? null : createPiece(nextPieceType),
              nextPiece: newNextPiece,
              score: player.score + points,
              lines: player.lines + linesCleared,
              level: newLevel,
              isGameOver: isGameOver,
            };
          }
        });
        
        // Check if all players are game over
        const allGameOver = newPlayers.every(p => p.isGameOver);
        if (allGameOver) {
          setTimeout(() => {
            const sortedPlayers = [...newPlayers].sort((a, b) => b.score - a.score);
            setWinner(sortedPlayers[0]);
            setGameState("ended");
            stopGameLoop();
          }, 100);
        }
        
        return newPlayers;
      });
    };
    
    dropTimerRef.current = window.setInterval(gameLoop, DROP_INTERVAL);
  }, []);

  const stopGameLoop = () => {
    if (dropTimerRef.current) {
      clearInterval(dropTimerRef.current);
      dropTimerRef.current = null;
    }
  };

  // Keyboard controls
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      const activePlayer = players[currentPlayerIndex];
      if (!activePlayer || activePlayer.isGameOver) return;
      
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          movePiece(currentPlayerIndex, -1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          movePiece(currentPlayerIndex, 1, 0);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          dropPiece(currentPlayerIndex);
          break;
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          rotateCurrentPiece(currentPlayerIndex);
          break;
        case " ":
          e.preventDefault();
          // Hard drop
          while (activePlayer.currentPiece && canPlacePiece(activePlayer.board, activePlayer.currentPiece, activePlayer.currentPiece.x, activePlayer.currentPiece.y + 1)) {
            movePiece(currentPlayerIndex, 0, 1);
          }
          dropPiece(currentPlayerIndex);
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, currentPlayerIndex, players]);

  // Switch player turn (for turn-based mode, or simultaneous)
  useEffect(() => {
    if (gameState === "playing") {
      // In Tetris, all players play simultaneously, but we can highlight current player
      const interval = setInterval(() => {
        setCurrentPlayerIndex(prev => (prev + 1) % playerCount);
      }, 5000); // Switch highlight every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [gameState, playerCount]);

  // Cleanup on unmount or game state change
  useEffect(() => {
    if (gameState !== "playing") {
      stopGameLoop();
    }
    return () => {
      stopGameLoop();
    };
  }, [gameState]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-cyan-400 active:opacity-80 mb-4 sm:mb-8 font-semibold neon-glow-cyan min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">BACK TO GAMES</span>
        </Link>

        <div className="text-center mb-6">
          <h1 className="pixel-font text-2xl sm:text-3xl md:text-5xl font-bold text-cyan-400 neon-glow-cyan mb-2">
            🎮 TETRIS MULTIPLAYER 🎮
          </h1>
          <p className="text-sm sm:text-base text-cyan-300">
            Clear lines and compete for the highest score!
          </p>
        </div>

        {/* Team Info Banner */}
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
          <div className="neon-card neon-box-cyan p-6 sm:p-8 max-w-2xl mx-auto card-3d">
            <h2 className="text-xl sm:text-2xl font-bold text-cyan-400 mb-6 text-center">Game Setup</h2>
            
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
                          ? "bg-cyan-400 text-gray-900 font-bold"
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
                      Player {i + 1} Name
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
            {/* Player Boards Grid */}
            <div className={`grid gap-4 ${
              playerCount === 2 ? "md:grid-cols-2" : 
              playerCount === 3 ? "md:grid-cols-3" : 
              "md:grid-cols-2 lg:grid-cols-4"
            }`}>
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`neon-card p-4 card-3d ${
                    currentPlayerIndex === index && !player.isGameOver
                      ? "ring-2 ring-cyan-400 neon-box-cyan"
                      : player.isGameOver
                      ? "opacity-50 neon-box-red"
                      : "neon-box-purple"
                  }`}
                >
                  <div className="text-center mb-2">
                    <div className="font-bold mb-1" style={{ color: player.color }}>
                      {player.name}
                      {currentPlayerIndex === index && !player.isGameOver && " ⭐"}
                    </div>
                    {player.isGameOver && (
                      <div className="text-red-400 text-sm font-bold">GAME OVER</div>
                    )}
                    <div className="text-sm text-cyan-300">
                      Score: <span className="text-yellow-400 font-bold">{player.score}</span>
                    </div>
                    <div className="text-xs text-cyan-300/70">
                      Lines: {player.lines} | Level: {player.level}
                    </div>
                  </div>

                  {/* Game Board */}
                  <div className="bg-black rounded p-2 mb-2">
                    <div className="grid gap-0" style={{ 
                      gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                      aspectRatio: `${BOARD_WIDTH}/${BOARD_HEIGHT}`
                    }}>
                      {Array.from({ length: BOARD_HEIGHT * BOARD_WIDTH }).map((_, i) => {
                        const y = Math.floor(i / BOARD_WIDTH);
                        const x = i % BOARD_WIDTH;
                        const cellValue = player.board[y]?.[x] || 0;
                        const hasPiece = cellValue !== 0;
                        
                        // Check if current piece overlaps
                        let hasCurrentPiece = false;
                        let pieceColor = "";
                        if (player.currentPiece && !player.isGameOver) {
                          const px = x - player.currentPiece.x;
                          const py = y - player.currentPiece.y;
                          if (
                            py >= 0 && py < player.currentPiece.shape.length &&
                            px >= 0 && px < player.currentPiece.shape[py].length &&
                            player.currentPiece.shape[py][px]
                          ) {
                            hasCurrentPiece = true;
                            pieceColor = PIECE_COLORS[player.currentPiece.type] || "#ffffff";
                          }
                        }
                        
                        return (
                          <div
                            key={i}
                            className={`border border-gray-800 ${
                              hasCurrentPiece
                                ? ""
                                : hasPiece
                                ? ""
                                : ""
                            }`}
                            style={{
                              backgroundColor: hasCurrentPiece
                                ? pieceColor
                                : hasPiece
                                ? PIECE_COLORS[String.fromCharCode(cellValue)] || "#ffffff"
                                : "#1a1a2e",
                              minHeight: "12px",
                              minWidth: "12px",
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Next Piece Preview */}
                  {!player.isGameOver && (
                    <div className="text-center">
                      <div className="text-xs text-cyan-300/70 mb-1">Next:</div>
                      <div className="inline-block bg-black rounded p-2">
                        <div className="grid gap-0" style={{
                          gridTemplateColumns: `repeat(${TETROMINOES[player.nextPiece as keyof typeof TETROMINOES][0][0].length}, 1fr)`,
                        }}>
                          {TETROMINOES[player.nextPiece as keyof typeof TETROMINOES][0].flat().map((cell, i) => (
                            <div
                              key={i}
                              className="border border-gray-800"
                              style={{
                                backgroundColor: cell ? PIECE_COLORS[player.nextPiece] : "transparent",
                                width: "16px",
                                height: "16px",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Controls Info */}
            <div className="neon-card neon-box-cyan p-4 card-3d">
              <div className="text-sm text-cyan-300 space-y-2">
                <div className="font-bold mb-2">Controls (Player {currentPlayerIndex + 1}):</div>
                <div>• Arrow Keys / WASD: Move and rotate</div>
                <div>• Space: Hard drop</div>
                <div>• All players play simultaneously!</div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  stopGameLoop();
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
        )}

        {gameState === "ended" && winner && (
          <div className="neon-card neon-box-yellow p-8 text-center max-w-2xl mx-auto card-3d">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">GAME OVER!</h2>
            <div className="text-2xl font-bold mb-2" style={{ color: winner.color }}>
              {winner.name} WINS!
            </div>
            <div className="text-xl text-cyan-300 mb-6">
              Final Score: {winner.score} points | Lines: {winner.lines} | Level: {winner.level}
            </div>
            <div className="space-y-2 mb-6">
              <div className="text-lg font-bold text-cyan-300">Final Scores:</div>
              {[...players].sort((a, b) => b.score - a.score).map((p, idx) => (
                <div key={p.id} className="text-cyan-200">
                  {idx + 1}. {p.name}: {p.score} points ({p.lines} lines)
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

