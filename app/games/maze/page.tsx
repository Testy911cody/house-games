"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, RotateCcw, Users } from "lucide-react";

// Game Configuration
const CELL_SIZE = 25;
const MAZE_WIDTH = 25;
const MAZE_HEIGHT = 17;

interface Player {
  x: number;
  y: number;
  color: string;
  glowColor: string;
  name: string;
  keys: { up: string[]; down: string[]; left: string[]; right: string[] };
}

export default function MazeGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "won">("waiting");
  const [winner, setWinner] = useState<string | null>(null);
  const [maze, setMaze] = useState<number[][]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [deaths, setDeaths] = useState<{ [key: string]: number }>({});
  const gameLoopRef = useRef<number | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());

  const finish = { x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2 };

  // Generate maze
  const generateMaze = useCallback(() => {
    const newMaze: number[][] = [];
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      newMaze[y] = [];
      for (let x = 0; x < MAZE_WIDTH; x++) {
        newMaze[y][x] = 1;
      }
    }

    function carve(x: number, y: number) {
      newMaze[y][x] = 0;
      const directions = [
        [0, -2], [0, 2], [-2, 0], [2, 0]
      ].sort(() => Math.random() - 0.5);

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx > 0 && nx < MAZE_WIDTH - 1 && ny > 0 && ny < MAZE_HEIGHT - 1 && newMaze[ny][nx] === 1) {
          newMaze[y + dy / 2][x + dx / 2] = 0;
          carve(nx, ny);
        }
      }
    }

    carve(1, 1);
    newMaze[1][1] = 0;
    newMaze[finish.y][finish.x] = 0;
    newMaze[finish.y][finish.x - 1] = 0;
    
    return newMaze;
  }, []);

  // Initialize players
  const initPlayers = useCallback(() => {
    return [
      {
        x: 1,
        y: 1,
        color: "#ff00ff",
        glowColor: "rgba(255, 0, 255, 0.6)",
        name: "Player 1",
        keys: {
          up: ["w", "W"],
          down: ["s", "S"],
          left: ["a", "A"],
          right: ["d", "D"],
        },
      },
      {
        x: 1,
        y: 1,
        color: "#00f5ff",
        glowColor: "rgba(0, 245, 255, 0.6)",
        name: "Player 2",
        keys: {
          up: ["ArrowUp"],
          down: ["ArrowDown"],
          left: ["ArrowLeft"],
          right: ["ArrowRight"],
        },
      },
    ];
  }, []);

  // Start game
  const startGame = useCallback(() => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    setPlayers(initPlayers());
    setDeaths({ "Player 1": 0, "Player 2": 0 });
    setGameState("playing");
    setWinner(null);
  }, [generateMaze, initPlayers]);

  // Check user
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(user));
  }, [router]);

  // Handle key events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let lastMoveTime = 0;
    const moveDelay = 120;

    const gameLoop = (timestamp: number) => {
      if (gameState !== "playing") return;

      // Move players
      if (timestamp - lastMoveTime > moveDelay) {
        setPlayers((currentPlayers) => {
          const newPlayers = currentPlayers.map((player, index) => {
            let dx = 0, dy = 0;

            if (player.keys.up.some(k => keysPressed.current.has(k))) dy = -1;
            else if (player.keys.down.some(k => keysPressed.current.has(k))) dy = 1;
            else if (player.keys.left.some(k => keysPressed.current.has(k))) dx = -1;
            else if (player.keys.right.some(k => keysPressed.current.has(k))) dx = 1;

            if (dx === 0 && dy === 0) return player;

            const newX = player.x + dx;
            const newY = player.y + dy;

            // Check bounds
            if (newX < 0 || newX >= MAZE_WIDTH || newY < 0 || newY >= MAZE_HEIGHT) {
              return player;
            }

            // Check wall collision
            if (maze[newY] && maze[newY][newX] === 1) {
              // Hit wall - reset player
              setDeaths(prev => ({ ...prev, [player.name]: prev[player.name] + 1 }));
              return { ...player, x: 1, y: 1 };
            }

            // Check win
            if (newX === finish.x && newY === finish.y) {
              setWinner(player.name);
              setGameState("won");
            }

            return { ...player, x: newX, y: newY };
          });
          return newPlayers;
        });
        lastMoveTime = timestamp;
      }

      // Render
      render(ctx, canvas);

      animationId = requestAnimationFrame(gameLoop);
    };

    const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // Clear
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw maze
      for (let y = 0; y < MAZE_HEIGHT; y++) {
        for (let x = 0; x < MAZE_WIDTH; x++) {
          if (maze[y] && maze[y][x] === 1) {
            ctx.fillStyle = "#0f0f1a";
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            
            // Wall glow
            ctx.strokeStyle = "rgba(100, 100, 150, 0.3)";
            ctx.lineWidth = 1;
            if (y > 0 && maze[y-1] && maze[y-1][x] === 0) {
              ctx.beginPath();
              ctx.moveTo(x * CELL_SIZE, y * CELL_SIZE);
              ctx.lineTo((x + 1) * CELL_SIZE, y * CELL_SIZE);
              ctx.stroke();
            }
          }
        }
      }

      // Draw finish
      const time = Date.now() / 1000;
      const pulse = 1 + Math.sin(time * 3) * 0.2;
      ctx.save();
      ctx.shadowColor = "#39ff14";
      ctx.shadowBlur = 15 * pulse;
      ctx.fillStyle = "#39ff14";
      ctx.fillRect(
        finish.x * CELL_SIZE + CELL_SIZE * 0.2,
        finish.y * CELL_SIZE + CELL_SIZE * 0.2,
        CELL_SIZE * 0.6,
        CELL_SIZE * 0.6
      );
      ctx.restore();
      
      ctx.fillStyle = "#39ff14";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText("EXIT", finish.x * CELL_SIZE + CELL_SIZE / 2, finish.y * CELL_SIZE + CELL_SIZE + 12);

      // Draw players
      players.forEach((player, index) => {
        const px = player.x * CELL_SIZE + CELL_SIZE / 2;
        const py = player.y * CELL_SIZE + CELL_SIZE / 2;
        const size = CELL_SIZE * 0.35;

        ctx.save();
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = player.color;
        
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(px, py - size);
        ctx.lineTo(px + size, py);
        ctx.lineTo(px, py + size);
        ctx.lineTo(px - size, py);
        ctx.closePath();
        ctx.fill();

        // Inner glow
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(px, py, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Player number
        ctx.fillStyle = player.color;
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`P${index + 1}`, px, py - size - 5);
      });
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gameState, maze, players, finish]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Games
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-2">
            🏃 Maze Race
          </h1>
          <p className="text-purple-300">
            Race to the exit! First one there wins!
          </p>
        </div>

        {gameState === "waiting" && (
          <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-8 text-center border border-purple-500/30">
            <Users className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">2 Player Race</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-pink-500/20 p-4 rounded-xl border border-pink-500/50">
                <div className="text-3xl mb-2">🟣</div>
                <h3 className="text-pink-400 font-bold text-xl mb-2">Player 1</h3>
                <div className="flex justify-center gap-1">
                  <span className="bg-pink-600 px-3 py-1 rounded text-white font-mono">W</span>
                  <span className="bg-pink-600 px-3 py-1 rounded text-white font-mono">A</span>
                  <span className="bg-pink-600 px-3 py-1 rounded text-white font-mono">S</span>
                  <span className="bg-pink-600 px-3 py-1 rounded text-white font-mono">D</span>
                </div>
              </div>
              
              <div className="bg-cyan-500/20 p-4 rounded-xl border border-cyan-500/50">
                <div className="text-3xl mb-2">🔵</div>
                <h3 className="text-cyan-400 font-bold text-xl mb-2">Player 2</h3>
                <div className="flex justify-center gap-1">
                  <span className="bg-cyan-600 px-3 py-1 rounded text-white font-mono">↑</span>
                  <span className="bg-cyan-600 px-3 py-1 rounded text-white font-mono">←</span>
                  <span className="bg-cyan-600 px-3 py-1 rounded text-white font-mono">↓</span>
                  <span className="bg-cyan-600 px-3 py-1 rounded text-white font-mono">→</span>
                </div>
              </div>
            </div>

            <p className="text-red-400 mb-6">⚠️ Touch a wall and you reset to start!</p>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105"
            >
              Start Race!
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="text-center">
            <div className="flex justify-center gap-8 mb-4">
              <div className="bg-pink-500/30 px-4 py-2 rounded-lg border border-pink-500">
                <span className="text-pink-400 font-bold">P1 Deaths: {deaths["Player 1"]}</span>
              </div>
              <div className="bg-cyan-500/30 px-4 py-2 rounded-lg border border-cyan-500">
                <span className="text-cyan-400 font-bold">P2 Deaths: {deaths["Player 2"]}</span>
              </div>
            </div>
            
            <div className="inline-block p-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-lg">
              <canvas
                ref={canvasRef}
                width={MAZE_WIDTH * CELL_SIZE}
                height={MAZE_HEIGHT * CELL_SIZE}
                className="rounded-lg"
              />
            </div>
          </div>
        )}

        {gameState === "won" && (
          <div className="bg-slate-800/90 backdrop-blur rounded-2xl p-8 text-center border border-yellow-500/50">
            <Trophy className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
              {winner} Wins! 🎉
            </h2>
            
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-pink-400 font-bold">Player 1 Deaths</p>
                <p className="text-3xl text-white">{deaths["Player 1"]}</p>
              </div>
              <div className="text-center">
                <p className="text-cyan-400 font-bold">Player 2 Deaths</p>
                <p className="text-3xl text-white">{deaths["Player 2"]}</p>
              </div>
            </div>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

