"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, RotateCcw, Users, Skull } from "lucide-react";

// Game Configuration
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.5;
const FLAP_POWER = -9;
const PIPE_SPEED = 3;
const PIPE_SPAWN_RATE = 1500;
const PIPE_GAP = 150;
const PIPE_WIDTH = 60;

interface Bird {
  x: number;
  y: number;
  velocity: number;
  width: number;
  height: number;
  rotation: number;
  alive: boolean;
  score: number;
  color: string;
  innerColor: string;
  wingColor: string;
  name: string;
  flapKey: string[];
}

interface Pipe {
  x: number;
  gapY: number;
  passed: Set<number>; // Track which players passed
}

interface Star {
  x: number;
  y: number;
  size: number;
  twinkle: number;
}

export default function FlappyGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "ended">("waiting");
  const [playerCount, setPlayerCount] = useState(2);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const pipeTimerRef = useRef<number>(0);
  const particlesRef = useRef<Array<{x: number, y: number, vx: number, vy: number, life: number, color: string}>>([]);

  // Player configurations
  const playerConfigs = [
    { name: "Player 1", color: "#ffff00", innerColor: "#ff6b00", wingColor: "#ff00ff", flapKey: ["w", "W"] },
    { name: "Player 2", color: "#00f5ff", innerColor: "#0088aa", wingColor: "#00f5ff", flapKey: ["ArrowUp"] },
    { name: "Player 3", color: "#39ff14", innerColor: "#00aa00", wingColor: "#39ff14", flapKey: ["i", "I"] },
    { name: "Player 4", color: "#ff00ff", innerColor: "#aa00aa", wingColor: "#ff00ff", flapKey: ["t", "T"] },
  ];

  // Initialize stars
  const initStars = useCallback((): Star[] => {
    const newStars: Star[] = [];
    for (let i = 0; i < 50; i++) {
      newStars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT * 0.7,
        size: Math.random() * 2 + 0.5,
        twinkle: Math.random() * Math.PI * 2
      });
    }
    return newStars;
  }, []);

  // Initialize birds
  const initBirds = useCallback((count: number): Bird[] => {
    const newBirds: Bird[] = [];
    const spacing = CANVAS_HEIGHT / (count + 1);
    for (let i = 0; i < count; i++) {
      const config = playerConfigs[i];
      newBirds.push({
        x: 80,
        y: spacing * (i + 1) - 15,
        velocity: 0,
        width: 40,
        height: 30,
        rotation: 0,
        alive: true,
        score: 0,
        color: config.color,
        innerColor: config.innerColor,
        wingColor: config.wingColor,
        name: config.name,
        flapKey: config.flapKey,
      });
    }
    return newBirds;
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setBirds(initBirds(playerCount));
    setPipes([]);
    setStars(initStars());
    setGameState("playing");
    setWinner(null);
    pipeTimerRef.current = Date.now();
    particlesRef.current = [];
  }, [initBirds, initStars, playerCount]);

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
        
        if (gameState === "waiting" && (e.key === " " || e.key === "Enter")) {
          startGame();
          e.preventDefault();
          return;
        }
        
        if (gameState === "playing") {
          setBirds(currentBirds => {
            return currentBirds.map(bird => {
              if (bird.alive && bird.flapKey.includes(e.key)) {
                // Add particles
                for (let i = 0; i < 5; i++) {
                  particlesRef.current.push({
                    x: bird.x,
                    y: bird.y + bird.height / 2,
                    vx: -Math.random() * 3 - 1,
                    vy: Math.random() * 2 - 1,
                    life: 1,
                    color: bird.wingColor
                  });
                }
                return { ...bird, velocity: FLAP_POWER };
              }
              return bird;
            });
          });
        }
      }
      
      if (["ArrowUp", "ArrowDown", "w", "W", "i", "I", "t", "T", " "].includes(e.key)) {
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
  }, [gameState, startGame]);

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
          const newRotation = Math.min(newVelocity * 3, 90);

          // Check bounds
          if (newY < 0 || newY > CANVAS_HEIGHT - bird.height) {
            return { ...bird, alive: false, velocity: newVelocity, y: newY, rotation: newRotation };
          }

          return { ...bird, velocity: newVelocity, y: newY, rotation: newRotation };
        });

        return newBirds;
      });

      // Update pipes
      setPipes(currentPipes => {
        let newPipes = currentPipes
          .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter(pipe => pipe.x > -PIPE_WIDTH);

        // Spawn new pipes
        if (Date.now() - pipeTimerRef.current > PIPE_SPAWN_RATE) {
          const minY = 100;
          const maxY = CANVAS_HEIGHT - PIPE_GAP - 100;
          const gapY = Math.random() * (maxY - minY) + minY;
          newPipes.push({ x: CANVAS_WIDTH, gapY, passed: new Set() });
          pipeTimerRef.current = Date.now();
        }

        return newPipes;
      });

      // Check collisions and scoring
      setBirds(currentBirds => {
        return currentBirds.map((bird, birdIndex) => {
          if (!bird.alive) return bird;

          let newScore = bird.score;
          let isAlive = true;

          pipes.forEach(pipe => {
            const birdRight = bird.x + bird.width;
            const birdBottom = bird.y + bird.height;
            const pipeRight = pipe.x + PIPE_WIDTH;

            // Score
            if (!pipe.passed.has(birdIndex) && pipeRight < bird.x) {
              pipe.passed.add(birdIndex);
              newScore++;
              // Score particles
              for (let i = 0; i < 10; i++) {
                particlesRef.current.push({
                  x: bird.x + bird.width,
                  y: bird.y,
                  vx: Math.random() * 4 - 2,
                  vy: Math.random() * 4 - 2,
                  life: 1,
                  color: bird.color
                });
              }
            }

            // Collision
            if (birdRight > pipe.x && bird.x < pipeRight) {
              if (bird.y < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP) {
                isAlive = false;
              }
            }
          });

          return { ...bird, score: newScore, alive: isAlive };
        });
      });

      // Update particles
      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.03
        }))
        .filter(p => p.life > 0);

      // Check game end
      setBirds(currentBirds => {
        const aliveBirds = currentBirds.filter(b => b.alive);
        if (aliveBirds.length === 0) {
          // All dead - highest score wins
          const maxScore = Math.max(...currentBirds.map(b => b.score));
          const winners = currentBirds.filter(b => b.score === maxScore);
          if (winners.length === 1) {
            setWinner(winners[0].name);
          } else if (winners.length > 1) {
            setWinner("Tie!");
          } else {
            setWinner("Game Over");
          }
          setGameState("ended");
        } else if (aliveBirds.length === 1 && currentBirds.length > 1) {
          // One bird remaining
          setWinner(aliveBirds[0].name);
          setGameState("ended");
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
      gradient.addColorStop(0, "#0a0a0f");
      gradient.addColorStop(0.5, "#1a0a2e");
      gradient.addColorStop(1, "#16213e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      const time = Date.now() / 1000;
      stars.forEach(star => {
        const twinkle = Math.sin(time * 2 + star.twinkle) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw grid
      ctx.strokeStyle = "rgba(0, 245, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let y = canvas.height * 0.6; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      const centerX = canvas.width / 2;
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + i * 50, canvas.height * 0.6);
        ctx.lineTo(centerX + i * 150, canvas.height);
        ctx.stroke();
      }

      // Draw pipes
      pipes.forEach(pipe => {
        const topHeight = pipe.gapY;
        const bottomY = pipe.gapY + PIPE_GAP;
        const bottomHeight = canvas.height - bottomY;

        // Glow effect
        ctx.shadowColor = "rgba(0, 245, 255, 0.5)";
        ctx.shadowBlur = 20;

        // Top pipe
        ctx.fillStyle = "#00f5ff";
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topHeight);
        ctx.fillStyle = "#0a0a0f";
        ctx.fillRect(pipe.x + 5, 0, PIPE_WIDTH - 10, topHeight - 5);

        // Top cap
        ctx.fillStyle = "#00f5ff";
        ctx.fillRect(pipe.x - 5, topHeight - 25, PIPE_WIDTH + 10, 25);
        ctx.fillStyle = "#0a0a0f";
        ctx.fillRect(pipe.x, topHeight - 20, PIPE_WIDTH, 15);

        // Bottom pipe
        ctx.fillStyle = "#00f5ff";
        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight);
        ctx.fillStyle = "#0a0a0f";
        ctx.fillRect(pipe.x + 5, bottomY + 5, PIPE_WIDTH - 10, bottomHeight - 5);

        // Bottom cap
        ctx.fillStyle = "#00f5ff";
        ctx.fillRect(pipe.x - 5, bottomY, PIPE_WIDTH + 10, 25);
        ctx.fillStyle = "#0a0a0f";
        ctx.fillRect(pipe.x, bottomY + 5, PIPE_WIDTH, 15);

        ctx.shadowBlur = 0;
      });

      // Draw particles
      particlesRef.current.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Draw birds
      birds.forEach((bird, index) => {
        if (!bird.alive) return;

        ctx.save();
        ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
        ctx.rotate(bird.rotation * Math.PI / 180);

        // Glow effect
        ctx.shadowColor = bird.color;
        ctx.shadowBlur = 15;

        // Body
        ctx.fillStyle = bird.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner body
        ctx.fillStyle = bird.innerColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, bird.width / 2 - 3, bird.height / 2 - 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(8, -5, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(10, -5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = bird.wingColor;
        ctx.beginPath();
        ctx.moveTo(bird.width / 2, 0);
        ctx.lineTo(bird.width / 2 + 12, -5);
        ctx.lineTo(bird.width / 2 + 12, 5);
        ctx.closePath();
        ctx.fill();

        // Wing
        ctx.fillStyle = bird.wingColor;
        ctx.shadowColor = bird.wingColor;
        ctx.shadowBlur = 10;
        const wingY = Math.sin(Date.now() / 50) * 3;
        ctx.beginPath();
        ctx.ellipse(-5, wingY + 5, 10, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Player label
        ctx.fillStyle = bird.color;
        ctx.font = "bold 12px 'Press Start 2P', cursive";
        ctx.textAlign = "center";
        ctx.fillText(`P${index + 1}`, bird.x + bird.width / 2, bird.y - 10);
      });

      // Draw scores
      ctx.font = "bold 20px 'Press Start 2P', cursive";
      ctx.textAlign = "left";
      birds.forEach((bird, index) => {
        const yPos = 20 + index * 30;
        ctx.fillStyle = bird.color;
        ctx.fillText(`P${index + 1}: ${bird.score}`, 10, yPos);
        
        if (!bird.alive) {
          ctx.fillStyle = "#ff0000";
          ctx.fillText(" 💀", 120, yPos);
        }
      });

      // Ground line
      ctx.strokeStyle = "#39ff14";
      ctx.shadowColor = "#39ff14";
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 2);
      ctx.lineTo(canvas.width, canvas.height - 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gameState, pipes, birds, stars]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-100 mb-6 font-semibold neon-glow-cyan"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Games
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-500 mb-2 pixel-font neon-glow-yellow">
            NEON FLAP
          </h1>
          <p className="text-cyan-300 text-sm sm:text-base">
            Multiplayer Flappy Bird - Last bird flying wins!
          </p>
        </div>

        {gameState === "waiting" && (
          <div className="neon-card neon-box-cyan p-4 sm:p-8 text-center card-3d">
            <Users className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Multiplayer Survival</h2>
            
            <div className="mb-6">
              <label className="block text-cyan-300 mb-2">Number of Players:</label>
              <div className="flex justify-center gap-4">
                {[2, 3, 4].map(count => (
                  <button
                    key={count}
                    onClick={() => setPlayerCount(count)}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${
                      playerCount === count
                        ? "bg-cyan-500 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    {count} Players
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {playerConfigs.slice(0, playerCount).map((config, index) => (
                <div key={index} className="bg-slate-700/50 p-4 rounded-xl border border-cyan-500/50">
                  <div className="text-3xl mb-2" style={{color: config.color}}>🐦</div>
                  <h3 className="text-cyan-400 font-bold text-xl mb-2">{config.name}</h3>
                  <div className="flex justify-center">
                    <span className="bg-cyan-600 px-6 py-2 rounded text-white font-mono text-xl">
                      {config.flapKey[0] === "ArrowUp" ? "↑" : config.flapKey[0].toUpperCase()}
                    </span>
                  </div>
                  <p className="text-cyan-300 mt-2 text-sm">Press to flap</p>
                </div>
              ))}
            </div>

            <p className="text-yellow-400 mb-6">🏆 Last bird flying wins! Pass pipes for bonus points.</p>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105"
            >
              Start Game!
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
          <div className="neon-card neon-box-yellow p-4 sm:p-8 text-center card-3d">
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
            
            <div className="flex justify-center gap-8 mb-8 flex-wrap">
              {birds.map((bird, index) => (
                <div key={index} className="text-center">
                  <p className="font-bold" style={{color: bird.color}}>
                    {bird.name}
                  </p>
                  <p className="text-3xl text-white">{bird.score} pts</p>
                  {!bird.alive && <p className="text-red-400 text-sm">💀 Crashed</p>}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setGameState("waiting");
                setBirds([]);
                setPipes([]);
              }}
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
