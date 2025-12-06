"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, RotateCcw, Users, Skull } from "lucide-react";

// Game Configuration
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GRAVITY = 0.4;
const FLAP_POWER = -8;
const PIPE_SPEED = 3;
const PIPE_GAP = 140;
const PIPE_WIDTH = 50;

interface Bird {
  x: number;
  y: number;
  velocity: number;
  alive: boolean;
  score: number;
  color: string;
  name: string;
  flapKey: string[];
}

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

export default function FlappyGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "ended">("waiting");
  const [birds, setBirds] = useState<Bird[]>([]);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const pipeTimerRef = useRef<number>(0);

  // Initialize birds
  const initBirds = useCallback((): Bird[] => {
    return [
      {
        x: 150,
        y: CANVAS_HEIGHT / 2 - 50,
        velocity: 0,
        alive: true,
        score: 0,
        color: "#ff00ff",
        name: "Player 1",
        flapKey: ["w", "W"],
      },
      {
        x: 150,
        y: CANVAS_HEIGHT / 2 + 50,
        velocity: 0,
        alive: true,
        score: 0,
        color: "#00f5ff",
        name: "Player 2",
        flapKey: ["ArrowUp"],
      },
    ];
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setBirds(initBirds());
    setPipes([]);
    setGameState("playing");
    setWinner(null);
    pipeTimerRef.current = Date.now();
  }, [initBirds]);

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
      if (!keysPressed.current.has(e.key)) {
        keysPressed.current.add(e.key);
        
        // Flap on key press (not hold)
        if (gameState === "playing") {
          setBirds(currentBirds => {
            return currentBirds.map(bird => {
              if (bird.alive && bird.flapKey.includes(e.key)) {
                return { ...bird, velocity: FLAP_POWER };
              }
              return bird;
            });
          });
        }
      }
      
      if (["ArrowUp", "ArrowDown", "w", "W", " "].includes(e.key)) {
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
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      if (gameState !== "playing") return;

      // Update birds
      setBirds(currentBirds => {
        const newBirds = currentBirds.map(bird => {
          if (!bird.alive) return bird;

          const newVelocity = bird.velocity + GRAVITY;
          const newY = bird.y + newVelocity;

          // Check bounds
          if (newY < 0 || newY > CANVAS_HEIGHT - 30) {
            return { ...bird, alive: false, velocity: newVelocity, y: newY };
          }

          return { ...bird, velocity: newVelocity, y: newY };
        });

        return newBirds;
      });

      // Update pipes
      setPipes(currentPipes => {
        let newPipes = currentPipes
          .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter(pipe => pipe.x > -PIPE_WIDTH);

        // Spawn new pipes
        if (Date.now() - pipeTimerRef.current > 1800) {
          const gapY = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
          newPipes.push({ x: CANVAS_WIDTH, gapY, passed: false });
          pipeTimerRef.current = Date.now();
        }

        return newPipes;
      });

      // Check collisions and scoring
      setBirds(currentBirds => {
        return currentBirds.map(bird => {
          if (!bird.alive) return bird;

          let newScore = bird.score;
          let isAlive: boolean = true;

          pipes.forEach(pipe => {
            // Score
            if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
              newScore++;
            }

            // Collision
            if (
              bird.x + 20 > pipe.x &&
              bird.x < pipe.x + PIPE_WIDTH
            ) {
              if (bird.y < pipe.gapY || bird.y + 25 > pipe.gapY + PIPE_GAP) {
                isAlive = false;
              }
            }
          });

          return { ...bird, score: newScore, alive: isAlive };
        });
      });

      // Mark passed pipes
      setPipes(currentPipes => {
        return currentPipes.map(pipe => {
          if (!pipe.passed && pipe.x + PIPE_WIDTH < 150) {
            return { ...pipe, passed: true };
          }
          return pipe;
        });
      });

      // Check game end
      setBirds(currentBirds => {
        const aliveBirds = currentBirds.filter(b => b.alive);
        if (aliveBirds.length === 0) {
          // Both dead - highest score wins
          const maxScore = Math.max(...currentBirds.map(b => b.score));
          const winners = currentBirds.filter(b => b.score === maxScore);
          if (winners.length === 1) {
            setWinner(winners[0].name);
          } else {
            setWinner("Tie!");
          }
          setGameState("ended");
        } else if (aliveBirds.length === 1 && currentBirds.length > 1) {
          // One bird remaining - they win if other died
          const deadBird = currentBirds.find(b => !b.alive);
          if (deadBird) {
            setWinner(aliveBirds[0].name);
            setGameState("ended");
          }
        }
        return currentBirds;
      });

      // Render
      render(ctx, canvas);

      animationId = requestAnimationFrame(gameLoop);
    };

    const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0a0a1a");
      gradient.addColorStop(0.5, "#1a0a2e");
      gradient.addColorStop(1, "#0a1a2e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      for (let i = 0; i < 50; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 37) % (canvas.height * 0.6);
        const size = (Math.sin(Date.now() / 500 + i) + 1) * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Grid
      ctx.strokeStyle = "rgba(100, 100, 200, 0.1)";
      ctx.lineWidth = 1;
      for (let y = canvas.height * 0.6; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw pipes
      pipes.forEach(pipe => {
        ctx.save();
        ctx.shadowColor = "#00f5ff";
        ctx.shadowBlur = 15;

        // Top pipe
        ctx.fillStyle = "#00f5ff";
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        ctx.fillStyle = "#0a0a1a";
        ctx.fillRect(pipe.x + 5, 0, PIPE_WIDTH - 10, pipe.gapY - 5);

        // Top cap
        ctx.fillStyle = "#00f5ff";
        ctx.fillRect(pipe.x - 5, pipe.gapY - 20, PIPE_WIDTH + 10, 20);

        // Bottom pipe
        ctx.fillStyle = "#00f5ff";
        ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, canvas.height);
        ctx.fillStyle = "#0a0a1a";
        ctx.fillRect(pipe.x + 5, pipe.gapY + PIPE_GAP + 5, PIPE_WIDTH - 10, canvas.height);

        // Bottom cap
        ctx.fillStyle = "#00f5ff";
        ctx.fillRect(pipe.x - 5, pipe.gapY + PIPE_GAP, PIPE_WIDTH + 10, 20);

        ctx.restore();
      });

      // Draw birds
      birds.forEach((bird, index) => {
        if (!bird.alive) return;

        const rotation = Math.min(bird.velocity * 3, 60);

        ctx.save();
        ctx.translate(bird.x + 15, bird.y + 12);
        ctx.rotate((rotation * Math.PI) / 180);

        // Glow
        ctx.shadowColor = bird.color;
        ctx.shadowBlur = 15;

        // Body
        ctx.fillStyle = bird.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner
        ctx.fillStyle = index === 0 ? "#ff6b00" : "#0088aa";
        ctx.beginPath();
        ctx.ellipse(0, 0, 17, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(8, -4, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(10, -4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(28, -4);
        ctx.lineTo(28, 4);
        ctx.closePath();
        ctx.fill();

        // Wing
        const wingY = Math.sin(Date.now() / 50) * 3;
        ctx.fillStyle = index === 0 ? "#ff00ff" : "#00f5ff";
        ctx.shadowColor = bird.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(-5, wingY + 5, 10, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Player label
        ctx.fillStyle = bird.color;
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`P${index + 1}`, bird.x + 15, bird.y - 10);
      });

      // Draw scores
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "left";
      
      birds.forEach((bird, index) => {
        const yPos = 30 + index * 35;
        ctx.fillStyle = bird.color;
        ctx.fillText(`P${index + 1}: ${bird.score}`, 20, yPos);
        
        if (!bird.alive) {
          ctx.fillStyle = "#ff0000";
          ctx.fillText(" 💀", 100, yPos);
        }
      });

      // Ground glow
      ctx.strokeStyle = "#39ff14";
      ctx.shadowColor = "#39ff14";
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 2);
      ctx.lineTo(canvas.width, canvas.height - 2);
      ctx.stroke();
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gameState, pipes]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-100 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Games
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-500 mb-2">
            🐦 Flappy Race
          </h1>
          <p className="text-cyan-300">
            Survive longer than your opponent!
          </p>
        </div>

        {gameState === "waiting" && (
          <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-8 text-center border border-cyan-500/30">
            <Users className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">2 Player Survival</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-pink-500/20 p-4 rounded-xl border border-pink-500/50">
                <div className="text-3xl mb-2">🟣</div>
                <h3 className="text-pink-400 font-bold text-xl mb-2">Player 1</h3>
                <div className="flex justify-center">
                  <span className="bg-pink-600 px-6 py-2 rounded text-white font-mono text-xl">W</span>
                </div>
                <p className="text-pink-300 mt-2 text-sm">Press to flap</p>
              </div>
              
              <div className="bg-cyan-500/20 p-4 rounded-xl border border-cyan-500/50">
                <div className="text-3xl mb-2">🔵</div>
                <h3 className="text-cyan-400 font-bold text-xl mb-2">Player 2</h3>
                <div className="flex justify-center">
                  <span className="bg-cyan-600 px-6 py-2 rounded text-white font-mono text-xl">↑</span>
                </div>
                <p className="text-cyan-300 mt-2 text-sm">Press to flap</p>
              </div>
            </div>

            <p className="text-yellow-400 mb-6">🏆 Last bird flying wins! Pass pipes for bonus points.</p>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105"
            >
              Start Race!
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="text-center">
            <div className="inline-block p-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-lg">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="rounded-lg"
              />
            </div>
          </div>
        )}

        {gameState === "ended" && (
          <div className="bg-slate-800/90 backdrop-blur rounded-2xl p-8 text-center border border-yellow-500/50">
            {winner === "Tie!" ? (
              <>
                <Skull className="w-20 h-20 mx-auto text-gray-400 mb-4" />
                <h2 className="text-4xl font-bold text-gray-300 mb-4">It's a Tie! 🤝</h2>
              </>
            ) : (
              <>
                <Trophy className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
                  {winner} Wins! 🎉
                </h2>
              </>
            )}
            
            <div className="flex justify-center gap-8 mb-8">
              {birds.map((bird, index) => (
                <div key={index} className="text-center">
                  <p className={`font-bold ${index === 0 ? "text-pink-400" : "text-cyan-400"}`}>
                    Player {index + 1}
                  </p>
                  <p className="text-3xl text-white">{bird.score} pts</p>
                  {!bird.alive && <p className="text-red-400 text-sm">💀 Crashed</p>}
                </div>
              ))}
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

