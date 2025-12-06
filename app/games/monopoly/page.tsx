"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Home, DollarSign, Users, Trophy, Zap } from "lucide-react";

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

const DiceIcon = ({ value }: { value: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return <Icon className="w-12 h-12" />;
};

export default function MonopolyPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameState, setGameState] = useState<"setup" | "playing" | "ended">("setup");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [hasRolled, setHasRolled] = useState(false);
  const [propertyOwnership, setPropertyOwnership] = useState<PropertyOwnership>({});
  const [message, setMessage] = useState("");
  const [showCard, setShowCard] = useState<{ type: string; text: string } | null>(null);
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6"]);
  const [winner, setWinner] = useState<Player | null>(null);

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
    setPlayers(newPlayers);
    setPropertyOwnership({});
    setCurrentPlayerIndex(0);
    setHasRolled(false);
    setMessage(`${newPlayers[0].name}'s turn! Roll the dice.`);
    setGameState("playing");
  };

  const rollDice = useCallback(() => {
    if (hasRolled) return;
    
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    setDice([die1, die2]);
    setHasRolled(true);
    
    const currentPlayer = players[currentPlayerIndex];
    
    // Handle jail
    if (currentPlayer.inJail) {
      if (die1 === die2) {
        // Doubles get out of jail
        setPlayers(prev => prev.map((p, i) => 
          i === currentPlayerIndex ? { ...p, inJail: false, jailTurns: 0 } : p
        ));
        setMessage(`${currentPlayer.name} rolled doubles and is out of jail!`);
        movePlayer(die1 + die2);
      } else {
        setPlayers(prev => prev.map((p, i) => 
          i === currentPlayerIndex ? { ...p, jailTurns: p.jailTurns + 1 } : p
        ));
        if (currentPlayer.jailTurns >= 2) {
          // 3rd turn, must pay to get out
          setPlayers(prev => prev.map((p, i) => 
            i === currentPlayerIndex ? { ...p, money: p.money - 50, inJail: false, jailTurns: 0 } : p
          ));
          setMessage(`${currentPlayer.name} paid $50 to get out of jail.`);
          movePlayer(die1 + die2);
        } else {
          setMessage(`${currentPlayer.name} is still in jail. No doubles.`);
        }
      }
    } else {
      movePlayer(die1 + die2);
    }
  }, [hasRolled, players, currentPlayerIndex]);

  const movePlayer = (spaces: number) => {
    const currentPlayer = players[currentPlayerIndex];
    let newPosition = (currentPlayer.position + spaces) % 40;
    
    // Check if passed GO
    if (newPosition < currentPlayer.position && !currentPlayer.inJail) {
      setPlayers(prev => prev.map((p, i) => 
        i === currentPlayerIndex ? { ...p, money: p.money + 200 } : p
      ));
      setMessage(prev => prev + ` Passed GO! Collect $200.`);
    }
    
    setPlayers(prev => prev.map((p, i) => 
      i === currentPlayerIndex ? { ...p, position: newPosition } : p
    ));
    
    // Handle landing on space
    setTimeout(() => handleLanding(newPosition), 500);
  };

  const handleLanding = (position: number) => {
    const space = BOARD_SPACES[position];
    const currentPlayer = players[currentPlayerIndex];
    
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
            const owner = players[ownerId];
            const rent = space.rent || 25;
            setPlayers(prev => prev.map((p, i) => {
              if (i === currentPlayerIndex) return { ...p, money: p.money - rent };
              if (i === ownerId) return { ...p, money: p.money + rent };
              return p;
            }));
            setMessage(`${currentPlayer.name} pays $${rent} rent to ${owner.name}!`);
          } else {
            setMessage(`${currentPlayer.name} landed on their own property.`);
          }
        } else {
          setMessage(`${currentPlayer.name} landed on ${space.name}. Price: $${space.price}. Click to buy!`);
        }
        break;
        
      case "tax":
        const taxAmount = space.price || 100;
        setPlayers(prev => prev.map((p, i) => 
          i === currentPlayerIndex ? { ...p, money: p.money - taxAmount } : p
        ));
        setMessage(`${currentPlayer.name} pays $${taxAmount} in taxes!`);
        break;
        
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
        setPlayers(prev => prev.map((p, i) => 
          i === currentPlayerIndex ? { ...p, position: 10, inJail: true } : p
        ));
        setMessage(`${currentPlayer.name} goes to Jail!`);
        break;
        
      case "jail":
        setMessage(`${currentPlayer.name} is just visiting Jail.`);
        break;
        
      case "parking":
        setMessage(`${currentPlayer.name} landed on Free Parking.`);
        break;
    }
    
    // Check for bankruptcy
    checkBankruptcy();
  };

  const handleCard = (card: { text: string; action: string; value: number }) => {
    const currentPlayer = players[currentPlayerIndex];
    
    switch (card.action) {
      case "money":
        setPlayers(prev => prev.map((p, i) => 
          i === currentPlayerIndex ? { ...p, money: p.money + card.value } : p
        ));
        break;
      case "move":
        setPlayers(prev => prev.map((p, i) => 
          i === currentPlayerIndex ? { ...p, position: card.value } : p
        ));
        if (card.value === 0) {
          setPlayers(prev => prev.map((p, i) => 
            i === currentPlayerIndex ? { ...p, money: p.money + 200 } : p
          ));
        }
        break;
      case "jail":
        setPlayers(prev => prev.map((p, i) => 
          i === currentPlayerIndex ? { ...p, position: 10, inJail: true } : p
        ));
        break;
      case "back":
        const newPos = (currentPlayer.position - card.value + 40) % 40;
        setPlayers(prev => prev.map((p, i) => 
          i === currentPlayerIndex ? { ...p, position: newPos } : p
        ));
        break;
    }
  };

  const buyProperty = () => {
    const currentPlayer = players[currentPlayerIndex];
    const space = BOARD_SPACES[currentPlayer.position];
    
    if (space.price && propertyOwnership[currentPlayer.position] === undefined) {
      if (currentPlayer.money >= space.price) {
        setPlayers(prev => prev.map((p, i) => 
          i === currentPlayerIndex 
            ? { ...p, money: p.money - space.price!, properties: [...p.properties, currentPlayer.position] } 
            : p
        ));
        setPropertyOwnership(prev => ({ ...prev, [currentPlayer.position]: currentPlayer.id }));
        setMessage(`${currentPlayer.name} bought ${space.name} for $${space.price}!`);
      } else {
        setMessage(`${currentPlayer.name} doesn't have enough money!`);
      }
    }
  };

  const checkBankruptcy = () => {
    const updatedPlayers = players.map(p => ({
      ...p,
      isBankrupt: p.money < 0
    }));
    
    const activePlayers = updatedPlayers.filter(p => !p.isBankrupt);
    
    if (activePlayers.length === 1) {
      setWinner(activePlayers[0]);
      setGameState("ended");
    }
    
    setPlayers(updatedPlayers);
  };

  const endTurn = () => {
    setShowCard(null);
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    
    // Skip bankrupt players
    while (players[nextIndex].isBankrupt && nextIndex !== currentPlayerIndex) {
      nextIndex = (nextIndex + 1) % players.length;
    }
    
    setCurrentPlayerIndex(nextIndex);
    setHasRolled(false);
    setMessage(`${players[nextIndex].name}'s turn! Roll the dice.`);
  };

  const getSpaceColor = (color: string) => {
    const colors: Record<string, string> = {
      brown: "bg-amber-900",
      lightblue: "bg-sky-300",
      pink: "bg-pink-400",
      orange: "bg-orange-500",
      red: "bg-red-600",
      yellow: "bg-yellow-400",
      green: "bg-green-600",
      blue: "bg-blue-800",
    };
    return colors[color] || "";
  };

  if (!currentUser) return null;

  // Setup screen
  if (gameState === "setup") {
    return (
      <div className="min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-cyan-400 active:opacity-80 mb-4 sm:mb-8 font-semibold min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">BACK TO GAMES</span>
          </Link>

          <div className="text-center mb-4 sm:mb-8">
            <h1 className="pixel-font text-2xl sm:text-3xl md:text-4xl font-bold text-green-400 neon-glow-green mb-2 sm:mb-4">
              🎩 MONOPOLY 🎩
            </h1>
            <p className="text-sm sm:text-base text-cyan-300">Set up your multiplayer game</p>
          </div>

          <div className="neon-card neon-box-green p-4 sm:p-6 lg:p-8 max-w-lg mx-auto card-3d">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-green-400 mb-2 pixel-font text-xs">NUMBER OF PLAYERS</label>
                <div className="flex gap-2 flex-wrap">
                  {[2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      onClick={() => setPlayerCount(num)}
                      className={`px-4 py-2 rounded-lg font-bold transition-all min-h-[44px] min-w-[44px] active:scale-95 ${
                        playerCount === num 
                          ? "bg-green-500 text-black" 
                          : "bg-green-900/50 text-green-400 border border-green-500 active:bg-green-800/50"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-green-400 mb-2 pixel-font text-xs">PLAYER NAMES</label>
                {Array.from({ length: playerCount }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl flex-shrink-0">{PLAYER_TOKENS[i]}</span>
                    <input
                      type="text"
                      value={playerNames[i]}
                      onChange={(e) => {
                        const newNames = [...playerNames];
                        newNames[i] = e.target.value;
                        setPlayerNames(newNames);
                      }}
                      className="flex-1 p-2 sm:p-3 rounded-lg text-base sm:text-lg min-h-[48px]"
                      placeholder={`Player ${i + 1}`}
                    />
                    <div 
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: PLAYER_COLORS[i] }}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={initializeGame}
                className="neon-btn neon-btn-green w-full text-base sm:text-lg min-h-[48px] btn-3d"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
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

        <h1 className="pixel-font text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-400 neon-glow-green mb-2 sm:mb-4 text-center">
          🎩 MONOPOLY 🎩
        </h1>

        <div className="grid lg:grid-cols-[1fr_280px] gap-2 sm:gap-4">
          {/* Main Board Area */}
          <div className="space-y-4">
            {/* Message Bar */}
            <div className="neon-card neon-box-cyan p-2 sm:p-4 text-center card-3d">
              <p className="text-cyan-300 text-sm sm:text-base lg:text-lg">{message}</p>
            </div>

            {/* Compact Board Display */}
            <div className="neon-card neon-box-green p-4 card-3d">
              <div className="grid grid-cols-11 gap-1">
                {/* Top row */}
                {BOARD_SPACES.slice(20, 31).map((space) => (
                  <BoardSpace 
                    key={space.id} 
                    space={space} 
                    players={players.filter(p => p.position === space.id)}
                    owner={propertyOwnership[space.id]}
                    playerColors={PLAYER_COLORS}
                    getSpaceColor={getSpaceColor}
                    isCorner={space.id === 20 || space.id === 30}
                  />
                ))}
                
                {/* Middle rows */}
                <div className="col-span-11 grid grid-cols-11 gap-1">
                  {/* Left column (reversed) */}
                  <div className="col-span-1 flex flex-col gap-1">
                    {BOARD_SPACES.slice(11, 20).reverse().map((space) => (
                      <BoardSpace 
                        key={space.id} 
                        space={space} 
                        players={players.filter(p => p.position === space.id)}
                        owner={propertyOwnership[space.id]}
                        playerColors={PLAYER_COLORS}
                        getSpaceColor={getSpaceColor}
                        isCorner={false}
                      />
                    ))}
                  </div>
                  
                  {/* Center area - Current Position Info */}
                  <div className="col-span-9 flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-3xl mb-2">{currentPlayer?.token}</p>
                      <p className="text-xl font-bold" style={{ color: currentPlayer?.color }}>
                        {currentPlayer?.name}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">on</p>
                      <p className="text-lg text-cyan-300">{currentSpace?.name}</p>
                      {currentSpace?.price && (
                        <p className="text-yellow-400">${currentSpace.price}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Right column */}
                  <div className="col-span-1 flex flex-col gap-1">
                    {BOARD_SPACES.slice(31, 40).map((space) => (
                      <BoardSpace 
                        key={space.id} 
                        space={space} 
                        players={players.filter(p => p.position === space.id)}
                        owner={propertyOwnership[space.id]}
                        playerColors={PLAYER_COLORS}
                        getSpaceColor={getSpaceColor}
                        isCorner={false}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Bottom row (reversed) */}
                {BOARD_SPACES.slice(0, 11).reverse().map((space) => (
                  <BoardSpace 
                    key={space.id} 
                    space={space} 
                    players={players.filter(p => p.position === space.id)}
                    owner={propertyOwnership[space.id]}
                    playerColors={PLAYER_COLORS}
                    getSpaceColor={getSpaceColor}
                    isCorner={space.id === 0 || space.id === 10}
                  />
                ))}
              </div>
            </div>

            {/* Dice & Actions */}
            <div className="neon-card neon-box-pink p-2 sm:p-4 card-3d">
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6">
                <div className="flex gap-2 sm:gap-4 text-white">
                  <div className="bg-black/50 p-1 sm:p-2 rounded-lg">
                    <DiceIcon value={dice[0]} />
                  </div>
                  <div className="bg-black/50 p-1 sm:p-2 rounded-lg">
                    <DiceIcon value={dice[1]} />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center w-full sm:w-auto">
                  <button
                    onClick={rollDice}
                    disabled={hasRolled || currentPlayer?.isBankrupt}
                    className={`neon-btn min-h-[48px] text-xs sm:text-sm btn-3d ${!hasRolled ? "neon-btn-green" : "opacity-50 cursor-not-allowed border-gray-500 text-gray-500"}`}
                  >
                    🎲 ROLL DICE
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

// Board Space Component
function BoardSpace({ 
  space, 
  players, 
  owner, 
  playerColors, 
  getSpaceColor,
  isCorner
}: { 
  space: typeof BOARD_SPACES[0];
  players: Player[];
  owner?: number;
  playerColors: string[];
  getSpaceColor: (color: string) => string;
  isCorner: boolean;
}) {
  const typeIcons: Record<string, string> = {
    go: "→",
    jail: "🔒",
    parking: "🅿️",
    gotojail: "👮",
    chance: "❓",
    chest: "📦",
    railroad: "🚂",
    utility: "💡",
    tax: "💰",
  };

  return (
    <div 
      className={`relative bg-gray-900/80 border border-gray-700 rounded text-center ${
        isCorner ? "aspect-square" : "aspect-square"
      }`}
      style={{ minHeight: "40px", minWidth: "40px" }}
    >
      {/* Property color bar */}
      {space.color && (
        <div className={`absolute top-0 left-0 right-0 h-2 ${getSpaceColor(space.color)} rounded-t`} />
      )}
      
      {/* Owner indicator */}
      {owner !== undefined && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: playerColors[owner] }}
        />
      )}
      
      {/* Space content */}
      <div className="absolute inset-0 flex items-center justify-center text-xs p-0.5 overflow-hidden">
        {space.type !== "property" && typeIcons[space.type] ? (
          <span className="text-base">{typeIcons[space.type]}</span>
        ) : (
          <span className="truncate text-[8px] leading-tight text-gray-400">
            {space.name.split(' ')[0]}
          </span>
        )}
      </div>
      
      {/* Player tokens */}
      {players.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-wrap gap-0.5 justify-center">
            {players.map(p => (
              <span key={p.id} className="text-sm drop-shadow-lg">{p.token}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


