"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, Users } from "lucide-react";

// Player colors
const PLAYER_COLORS = [
  { main: "#ff0000", light: "#ff6666", dark: "#cc0000", name: "Red" },
  { main: "#00ff00", light: "#66ff66", dark: "#00cc00", name: "Green" },
  { main: "#0000ff", light: "#6666ff", dark: "#0000cc", name: "Blue" },
  { main: "#ffff00", light: "#ffff66", dark: "#cccc00", name: "Yellow" },
];

// Board path positions (52 spaces around the board)
// Path goes: top (right to left), left (top to bottom), bottom (left to right), right (bottom to top)
const BOARD_PATH: Array<{ x: number; y: number }> = [];
// Top row: positions 0-5 (x: 6 to 1, y: 0)
for (let i = 0; i < 6; i++) {
  BOARD_PATH.push({ x: 6 - i, y: 0 });
}
// Left column: positions 6-12 (x: 0, y: 1 to 6)
for (let i = 1; i <= 6; i++) {
  BOARD_PATH.push({ x: 0, y: i });
}
// Bottom row: positions 13-18 (x: 1 to 6, y: 6)
for (let i = 1; i <= 6; i++) {
  BOARD_PATH.push({ x: i, y: 6 });
}
// Right column: positions 19-25 (x: 6, y: 5 to 0)
for (let i = 5; i >= 0; i--) {
  BOARD_PATH.push({ x: 6, y: i });
}
// Repeat for second lap: positions 26-51
for (let i = 0; i < 26; i++) {
  BOARD_PATH.push(BOARD_PATH[i]);
}

// Safe zones (home positions for each player)
const SAFE_ZONES = [
  { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 1, y: 5 }, // Red
  { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, // Green
  { x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 }, // Blue
  { x: 5, y: 1 }, { x: 4, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 }, // Yellow
];

// Starting positions for each player's tokens
const START_POSITIONS = [
  [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 2 }], // Red
  [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 5 }, { x: 6, y: 6 }], // Green
  [{ x: 5, y: 1 }, { x: 5, y: 2 }, { x: 6, y: 1 }, { x: 6, y: 2 }], // Blue
  [{ x: 1, y: 5 }, { x: 1, y: 6 }, { x: 2, y: 5 }, { x: 2, y: 6 }], // Yellow
];

// Entry points to the board path for each player
const ENTRY_POINTS = [0, 13, 26, 39]; // Starting positions on the board path

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

const DiceIcon = ({ value }: { value: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return <Icon className="w-8 h-8 sm:w-10 sm:h-10" />;
};

export default function LudoPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameState, setGameState] = useState<"setup" | "playing" | "ended">("setup");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [hasRolled, setHasRolled] = useState(false);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(["Player 1", "Player 2", "Player 3", "Player 4"]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(user));
  }, [router]);

  const initializeGame = () => {
    const newPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        id: i,
        name: playerNames[i] || `Player ${i + 1}`,
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
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setDiceValue(0);
    setHasRolled(false);
    setSelectedToken(null);
    setMessage(`${newPlayers[0].name}'s turn! Roll the dice.`);
    setGameState("playing");
    setConsecutiveSixes(0);
  };

  const rollDice = useCallback(() => {
    if (hasRolled && diceValue !== 6) return;
    
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);
    setHasRolled(true);
    
    const currentPlayer = players[currentPlayerIndex];
    
    if (roll === 6) {
      setConsecutiveSixes(prev => prev + 1);
      if (consecutiveSixes >= 2) {
        setMessage(`${currentPlayer.name} rolled three 6s! Turn skipped.`);
        setConsecutiveSixes(0);
        nextTurn();
        return;
      }
      setMessage(`${currentPlayer.name} rolled a 6! You can move a token out or move again.`);
    } else {
      setConsecutiveSixes(0);
      setMessage(`${currentPlayer.name} rolled a ${roll}. Select a token to move.`);
    }
  }, [hasRolled, diceValue, players, currentPlayerIndex, consecutiveSixes]);

  const canMoveToken = (player: Player, token: Token): boolean => {
    if (token.isFinished) return false;
    
    if (diceValue === 6) {
      // Can move out of home or move on board
      return true;
    }
    
    // Can only move if token is on board
    return !token.isHome && token.position >= 0;
  };

  const moveToken = (playerIndex: number, tokenIndex: number) => {
    if (hasRolled && diceValue === 6 && consecutiveSixes >= 2) return;
    
    const player = players[playerIndex];
    const token = player.tokens[tokenIndex];
    
    if (!canMoveToken(player, token)) {
      setMessage("Cannot move this token!");
      return;
    }

    const newPlayers = [...players];
    const newToken = { ...token };
    
    if (token.isHome && diceValue === 6) {
      // Move token out of home - position 0 means at start of board path
      newToken.isHome = false;
      newToken.position = 0;
      setMessage(`${player.name} moved token ${tokenIndex + 1} onto the board!`);
    } else if (!token.isHome && token.position < 100) {
      // Move token on board (position is relative, 0-51)
      let newPosition = token.position + diceValue;
      
      // Check if token can enter home column (needs exactly the right number to enter)
      // Each player needs to travel 51 spaces to complete the loop
      if (newPosition >= 51) {
        // Token can enter home column
        const homeColumnPosition = 100 + (newPosition - 51);
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
        newPosition = newPosition % 52;
        
        // Check for captures (except in safe zones)
        // Safe zones are at entry points: 0, 13, 26, 39
        const isSafeZone = newPosition === 0 || newPosition === 13 || newPosition === 26 || newPosition === 39;
        
        if (!isSafeZone) {
          // Check if any opponent token is on this same relative position
          for (let i = 0; i < newPlayers.length; i++) {
            if (i === playerIndex) continue;
            const opponent = newPlayers[i];
            for (let j = 0; j < opponent.tokens.length; j++) {
              const opponentToken = opponent.tokens[j];
              // Convert opponent's relative position to absolute and check
              const opponentAbsolutePos = (opponent.startPosition + opponentToken.position) % 52;
              const myAbsolutePos = (player.startPosition + newPosition) % 52;
              if (!opponentToken.isHome && opponentToken.position < 100 && opponentAbsolutePos === myAbsolutePos) {
                // Capture!
                opponentToken.isHome = true;
                opponentToken.position = -1;
                setMessage(`${player.name} captured ${opponent.name}'s token!`);
              }
            }
          }
        }
        
        newToken.position = newPosition;
        setMessage(`${player.name} moved token ${tokenIndex + 1}.`);
      }
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
      } else {
        setMessage("Cannot move that far in home column!");
        return;
      }
    }
    
    newPlayers[playerIndex].tokens[tokenIndex] = newToken;
    setPlayers(newPlayers);
    setSelectedToken(null);
    
    // Check for win
    if (newPlayers[playerIndex].tokens.every(t => t.isFinished)) {
      setWinner(newPlayers[playerIndex]);
      setGameState("ended");
      setMessage(`${player.name} wins! All tokens finished!`);
      return;
    }
    
    // If rolled 6, can roll again, otherwise next turn
    if (diceValue === 6 && consecutiveSixes < 2) {
      setHasRolled(false);
      setMessage(`${player.name} rolled a 6! Roll again or move another token.`);
    } else {
      nextTurn();
    }
  };

  const nextTurn = () => {
    setConsecutiveSixes(0);
    setHasRolled(false);
    setDiceValue(0);
    setSelectedToken(null);
    setCurrentPlayerIndex((prev) => (prev + 1) % playerCount);
    const nextPlayer = players[(currentPlayerIndex + 1) % playerCount];
    setMessage(`${nextPlayer.name}'s turn! Roll the dice.`);
  };

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
      // Red enters at (1,0), home column: (1,1), (1,2), (1,3), (2,3), (3,3)
      // Green enters at (6,5), home column: (5,5), (4,5), (3,5), (3,4), (3,3)
      // Blue enters at (6,0), home column: (5,0), (4,0), (3,0), (3,1), (3,2), (3,3)
      // Yellow enters at (0,5), home column: (0,4), (0,3), (1,3), (2,3), (3,3)
      if (player.id === 0) {
        // Red: goes down then right
        if (homeColumnIndex < 3) {
          return { x: 1, y: 1 + homeColumnIndex };
        } else {
          return { x: 1 + (homeColumnIndex - 2), y: 3 };
        }
      } else if (player.id === 1) {
        // Green: goes left then up
        if (homeColumnIndex < 3) {
          return { x: 5 - homeColumnIndex, y: 5 };
        } else {
          return { x: 3, y: 5 - (homeColumnIndex - 2) };
        }
      } else if (player.id === 2) {
        // Blue: goes left then down
        if (homeColumnIndex < 3) {
          return { x: 5 - homeColumnIndex, y: 0 };
        } else {
          return { x: 3, y: homeColumnIndex - 2 };
        }
      } else {
        // Yellow: goes up then right
        if (homeColumnIndex < 3) {
          return { x: 0, y: 5 - homeColumnIndex };
        } else {
          return { x: homeColumnIndex - 2, y: 3 };
        }
      }
    } else {
      // On board path - position is relative to player's start
      const absolutePosition = (player.startPosition + token.position) % 52;
      return BOARD_PATH[absolutePosition];
    }
  };

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
            🎲 LUDO 🎲
          </h1>
          <p className="text-sm sm:text-base text-cyan-300">
            Race your tokens around the board!
          </p>
        </div>

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
                    <DiceIcon value={diceValue} />
                  ) : (
                    <div className="w-10 h-10 bg-gray-700 rounded"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Game Board */}
            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
              <div className="grid grid-cols-7 gap-1 max-w-2xl mx-auto">
                {Array.from({ length: 49 }).map((_, i) => {
                  const row = Math.floor(i / 7);
                  const col = i % 7;
                  
                  // Determine cell type
                  let cellType = "path";
                  let cellColor = "bg-gray-700";
                  
                  // Center area (home bases)
                  if (row >= 2 && row <= 4 && col >= 2 && col <= 4) {
                    cellType = "center";
                    cellColor = "bg-yellow-900";
                  }
                  
                  // Player home areas
                  if (row < 2 && col < 2) {
                    cellColor = "bg-red-900";
                  } else if (row < 2 && col >= 5) {
                    cellColor = "bg-blue-900";
                  } else if (row >= 5 && col < 2) {
                    cellColor = "bg-green-900";
                  } else if (row >= 5 && col >= 5) {
                    cellColor = "bg-yellow-900";
                  }
                  
                  // Safe zones (white cells)
                  const isSafeZone = (row === 0 && col === 1) || (row === 1 && col === 0) ||
                                    (row === 0 && col === 5) || (row === 1 && col === 6) ||
                                    (row === 5 && col === 0) || (row === 6 && col === 1) ||
                                    (row === 5 && col === 6) || (row === 6 && col === 5);
                  if (isSafeZone) {
                    cellColor = "bg-white";
                  }
                  
                  // Path cells
                  if (cellType === "path" && !isSafeZone && 
                      !(row >= 2 && row <= 4 && col >= 2 && col <= 4)) {
                    if ((row === 0 && col > 1 && col < 5) ||
                        (row === 6 && col > 1 && col < 5) ||
                        (col === 0 && row > 1 && row < 5) ||
                        (col === 6 && row > 1 && row < 5)) {
                      cellColor = "bg-blue-600";
                    }
                  }
                  
                  return (
                    <div
                      key={i}
                      className={`${cellColor} aspect-square rounded flex items-center justify-center relative`}
                      style={{ minHeight: "40px" }}
                    >
                      {/* Render tokens */}
                      {players.map((player) =>
                        player.tokens.map((token, tokenIdx) => {
                          const pos = getTokenPosition(player, token);
                          if (pos.x === col && pos.y === row) {
                            return (
                              <div
                                key={`${player.id}-${tokenIdx}`}
                                className={`absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold cursor-pointer transition-transform hover:scale-110 ${
                                  gameState === "playing" &&
                                  currentPlayerIndex === player.id &&
                                  canMoveToken(player, token) &&
                                  hasRolled
                                    ? "ring-2 ring-yellow-400 animate-pulse"
                                    : ""
                                }`}
                                style={{
                                  backgroundColor: player.color.main,
                                  left: `${(tokenIdx % 2) * 50}%`,
                                  top: `${Math.floor(tokenIdx / 2) * 50}%`,
                                }}
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
                                title={`${player.name} Token ${tokenIdx + 1}${token.isFinished ? " (Finished)" : token.isHome ? " (Home)" : ""}`}
                              >
                                {tokenIdx + 1}
                              </div>
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

            {/* Game Controls */}
            <div className="neon-card neon-box-green p-4 sm:p-6 card-3d">
              <div className="text-center mb-4">
                <div className="text-cyan-300 mb-2">{message}</div>
              </div>
              
              <div className="flex gap-4 justify-center flex-wrap">
                {!hasRolled || (diceValue === 6 && consecutiveSixes < 2) ? (
                  <button
                    onClick={rollDice}
                    className="neon-btn neon-btn-yellow px-6 py-3 text-lg font-bold flex items-center gap-2 btn-3d"
                  >
                    <DiceIcon value={diceValue || 1} />
                    ROLL DICE
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

