"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Users, Play, RotateCcw, Palette, Eraser, Trash2, Zap, Clock, Trophy, Globe } from "lucide-react";
import WaitingRoom from "@/app/components/WaitingRoom";
import GameLobby from "@/app/components/GameLobby";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

const DRAWING_WORDS = [
  "Cat", "Dog", "Elephant", "Lion", "Tiger", "Bear", "Rabbit", "Horse", "Cow", "Pig",
  "Pizza", "Hamburger", "Ice Cream", "Cake", "Apple", "Banana", "Carrot", "Cookie", "Donut", "Sandwich",
  "House", "Tree", "Sun", "Moon", "Star", "Cloud", "Rainbow", "Flower", "Mountain", "Ocean",
  "Car", "Bicycle", "Airplane", "Boat", "Train", "Bus", "Rocket", "Helicopter", "Motorcycle", "Truck",
  "Computer", "Phone", "Camera", "Guitar", "Piano", "Book", "Pen", "Clock", "Glasses", "Hat",
  "Doctor", "Teacher", "Firefighter", "Astronaut", "Pirate", "Wizard", "Princess", "Knight", "Robot", "Superhero",
  "Dragon", "Unicorn", "Castle", "Bridge", "Lighthouse", "Tent", "Campfire", "Telescope", "Microscope", "Globe",
  "Basketball", "Soccer", "Tennis", "Baseball", "Football", "Volleyball", "Swimming", "Skiing", "Surfing", "Skating",
  "Butterfly", "Bee", "Bird", "Fish", "Shark", "Whale", "Dolphin", "Octopus", "Jellyfish", "Turtle",
  "Cactus", "Palm Tree", "Snowman", "Gift", "Balloon", "Kite", "Umbrella", "Key", "Lock", "Crown"
];

type GamePhase = "waitingRoom" | "setup" | "waiting" | "drawing" | "guessing" | "roundEnd" | "gameOver";
type PlayerRole = "drawer" | "guesser";

interface Player {
  id: string;
  name: string;
  score: number;
  hasDrawn: boolean;
}

function DrawGuessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guesserCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<{ player: string; guess: string; correct: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [phase, setPhase] = useState<GamePhase>("waitingRoom");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentDrawerIndex, setCurrentDrawerIndex] = useState(0);
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [round, setRound] = useState(1);
  const [roundsPerPlayer, setRoundsPerPlayer] = useState(2);
  const [brushColor, setBrushColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(5);
  const [showWordSelection, setShowWordSelection] = useState(false);
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const guessInputRef = useRef<HTMLInputElement>(null);

  const [showLobby, setShowLobby] = useState(true);
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [lastSyncedState, setLastSyncedState] = useState<string>("");
  const [joinedTeamIds, setJoinedTeamIds] = useState<string[]>([]);
  const [isPlayingAgainstComputer, setIsPlayingAgainstComputer] = useState(true);

  // Check for room code in URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setShowLobby(false);
      joinRoomByCode(code);
    }
  }, [searchParams]);

  // Poll room status to detect when game starts (even when in waiting phase)
  useEffect(() => {
    if (!gameRoom || !currentUser || phase !== "waitingRoom") return;
    
    let previousStatus = gameRoom.status;
    
    const pollRoomStatus = async () => {
      try {
        const { gameRoomsAPI } = await import("@/lib/api-utils");
        const result = await gameRoomsAPI.getRoomByCode(gameRoom.code);
        
        if (result.success && result.room) {
          const newRoom = result.room;
          
          // Check if game status changed from waiting to playing
          if (previousStatus === 'waiting' && newRoom.status === 'playing') {
            // Game was started - move to setup phase
            setPhase("setup");
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
  }, [gameRoom?.code, currentUser, phase]);

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
        setShowLobby(false);
        setGameId(`drawguess_${result.room.code}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  // Handle room joined from lobby
  const handleJoinRoom = (room: GameRoom) => {
    setGameRoom(room);
    setShowLobby(false);
    setGameId(`drawguess_${room.code}`);
  };
  
  // Update gameId when gameRoom changes
  useEffect(() => {
    if (gameRoom) {
      setGameId(`drawguess_${gameRoom.code}`);
    }
  }, [gameRoom?.code]);
  
  // Update gameId when gameRoom changes
  useEffect(() => {
    if (gameRoom) {
      setGameId(`drawguess_${gameRoom.code}`);
    }
  }, [gameRoom?.code]);

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
    setShowLobby(true);
    router.push("/games/drawguess");
  };
  // Device/session ID to track which device made the update (for multi-device same-user sync)
  const getDeviceId = (): string => {
    if (typeof window !== 'undefined') {
      let deviceId = sessionStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('deviceId', deviceId);
      }
      return deviceId;
    }
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  const deviceIdRef = useRef<string>(getDeviceId());

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    const userData = JSON.parse(user);
    setCurrentUser(userData);
    
    // Create game ID
    const currentTeam = localStorage.getItem("currentTeam");
    const { gameStateAPI } = require('@/lib/api-utils');
    const id = gameStateAPI.createGameId(currentTeam ? JSON.parse(currentTeam).id : null, 'drawguess');
    setGameId(id);
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;
    
    // Initialize players from group if available
    const currentTeam = localStorage.getItem("currentTeam");
    if (currentTeam && players.length === 0) {
      try {
        const team = JSON.parse(currentTeam);
        const teamPlayers: Player[] = [
          { id: currentUser.id, name: currentUser.name, score: 0, hasDrawn: false },
          ...team.members.map((m: any) => ({ 
            id: m.id, 
            name: m.name, 
            score: 0, 
            hasDrawn: false 
          }))
        ];
        setPlayers(teamPlayers);
      } catch (e) {
        console.error("Error loading group:", e);
      }
    }
  }, [currentUser, players.length]);

  useEffect(() => {
    if (phase === "drawing" && role === "drawer" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === "drawing" && timeLeft === 0) {
      endRound();
    }
  }, [phase, role, timeLeft]);

  // Save game state to Supabase whenever it changes
  useEffect(() => {
    if (!currentUser || !gameId) return;
    
    const saveState = async () => {
      try {
        const { gameStateAPI } = await import('@/lib/api-utils');
        
        // Get current drawing from canvas
        let drawingData = "";
        if (canvasRef.current && role === "drawer") {
          drawingData = canvasRef.current.toDataURL();
        }
        
        const stateToSave = {
          phase,
        currentWord,
        timeLeft,
        guesses,
          players,
          currentDrawerIndex,
          round,
          roundsPerPlayer,
          drawingData,
        };
        
        const stateString = JSON.stringify(stateToSave);
        if (stateString === lastSyncedState) return; // Skip if unchanged
        
        await gameStateAPI.saveGameState({
          id: gameId,
          gameType: 'drawguess',
          teamId: (() => {
            const team = localStorage.getItem("currentTeam");
            if (team) {
              try {
                return JSON.parse(team).id;
              } catch (e) {
                return undefined;
              }
            }
            return undefined;
          })(),
          state: stateToSave,
          lastUpdated: new Date().toISOString(),
          updatedBy: currentUser.id,
          deviceId: deviceIdRef.current,
        });
        
        setLastSyncedState(stateString);
      } catch (error) {
        console.error('Error saving game state:', error);
      }
    };
    
    // Debounce saves
    const timeoutId = setTimeout(saveState, 500);
    return () => clearTimeout(timeoutId);
  }, [phase, currentWord, timeLeft, guesses, players, currentDrawerIndex, round, roundsPerPlayer, currentUser, gameId, lastSyncedState, role]);

  // Use Supabase realtime subscription for instant updates, fallback to polling
  useEffect(() => {
    if (!currentUser || !gameId) return;
    
    if (isSupabaseConfigured() && supabase) {
      // Set up realtime subscription for instant updates
      const channel = supabase
        .channel(`game_state_${gameId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'game_states',
            filter: `id=eq.${gameId}`,
          },
          async (payload) => {
            try {
              const { gameStateAPI } = await import('@/lib/api-utils');
              const result = await gameStateAPI.getGameState(gameId);
              
              if (result.success && result.state) {
                const remoteState = result.state.state;
                const remoteStateString = JSON.stringify(remoteState);
                
                // Update if state is different and not from this device
                const isFromThisDevice = (result.state as any).deviceId === deviceIdRef.current;
                
                if (remoteStateString !== lastSyncedState && !isFromThisDevice) {
                  // Merge remote state
                  if (remoteState.phase) setPhase(remoteState.phase);
                  if (remoteState.currentWord !== undefined) setCurrentWord(remoteState.currentWord);
                  if (remoteState.timeLeft !== undefined) setTimeLeft(remoteState.timeLeft);
                  if (remoteState.guesses) setGuesses(remoteState.guesses);
                  if (remoteState.players) setPlayers(remoteState.players);
                  if (remoteState.currentDrawerIndex !== undefined) setCurrentDrawerIndex(remoteState.currentDrawerIndex);
                  if (remoteState.round !== undefined) setRound(remoteState.round);
                  if (remoteState.roundsPerPlayer !== undefined) setRoundsPerPlayer(remoteState.roundsPerPlayer);
                  
                  // Update drawing canvas for guessers
                  if (remoteState.drawingData && role === "guesser" && guesserCanvasRef.current) {
                    const canvas = guesserCanvasRef.current;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      const img = new Image();
                      img.onload = () => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                      };
                      img.src = remoteState.drawingData;
                    }
                  }
                  
                  setLastSyncedState(remoteStateString);
                }
              }
            } catch (error) {
              console.error('Error handling realtime update:', error);
            }
          }
        )
        .subscribe();
      
      // Also poll initially and as fallback
      const pollState = async () => {
        try {
          const { gameStateAPI } = await import('@/lib/api-utils');
          const result = await gameStateAPI.getGameState(gameId);
          
          if (result.success && result.state) {
            const remoteState = result.state.state;
            const remoteStateString = JSON.stringify(remoteState);
            
            // Update if state is different and not from this device
            const isFromThisDevice = (result.state as any).deviceId === deviceIdRef.current;
            
            if (remoteStateString !== lastSyncedState && !isFromThisDevice) {
              // Merge remote state
              if (remoteState.phase) setPhase(remoteState.phase);
              if (remoteState.currentWord !== undefined) setCurrentWord(remoteState.currentWord);
              if (remoteState.timeLeft !== undefined) setTimeLeft(remoteState.timeLeft);
              if (remoteState.guesses) setGuesses(remoteState.guesses);
              if (remoteState.players) setPlayers(remoteState.players);
              if (remoteState.currentDrawerIndex !== undefined) setCurrentDrawerIndex(remoteState.currentDrawerIndex);
              if (remoteState.round !== undefined) setRound(remoteState.round);
              if (remoteState.roundsPerPlayer !== undefined) setRoundsPerPlayer(remoteState.roundsPerPlayer);
              
              // Update drawing canvas for guessers
              if (remoteState.drawingData && role === "guesser" && guesserCanvasRef.current) {
                const canvas = guesserCanvasRef.current;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  const img = new Image();
                  img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                  };
                  img.src = remoteState.drawingData;
                }
              }
              
              setLastSyncedState(remoteStateString);
            }
          }
        } catch (error) {
          console.error('Error polling game state:', error);
        }
      };
      
      // Initial poll
      pollState();
      // Fallback polling every 500ms (less frequent since we have realtime)
      const intervalId = setInterval(pollState, 500);
      
      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
        clearInterval(intervalId);
      };
    } else {
      // Fallback to polling if Supabase not configured
      const pollState = async () => {
        try {
          const { gameStateAPI } = await import('@/lib/api-utils');
          const result = await gameStateAPI.getGameState(gameId);
          
          if (result.success && result.state) {
            const remoteState = result.state.state;
            const remoteStateString = JSON.stringify(remoteState);
            
            // Update if state is different and from another user/device
            const isFromThisDevice = (result.state as any).deviceId === deviceIdRef.current;
            const isFromOtherUser = result.state.updatedBy !== currentUser.id;
            
            if (remoteStateString !== lastSyncedState && (!isFromThisDevice || isFromOtherUser)) {
              // Merge remote state
              if (remoteState.phase) setPhase(remoteState.phase);
              if (remoteState.currentWord !== undefined) setCurrentWord(remoteState.currentWord);
              if (remoteState.timeLeft !== undefined) setTimeLeft(remoteState.timeLeft);
              if (remoteState.guesses) setGuesses(remoteState.guesses);
              if (remoteState.players) setPlayers(remoteState.players);
              if (remoteState.currentDrawerIndex !== undefined) setCurrentDrawerIndex(remoteState.currentDrawerIndex);
              if (remoteState.round !== undefined) setRound(remoteState.round);
              if (remoteState.roundsPerPlayer !== undefined) setRoundsPerPlayer(remoteState.roundsPerPlayer);
              
              // Update drawing canvas for guessers
              if (remoteState.drawingData && role === "guesser" && guesserCanvasRef.current) {
                const canvas = guesserCanvasRef.current;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  const img = new Image();
                  img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                  };
                  img.src = remoteState.drawingData;
                }
              }
              
              setLastSyncedState(remoteStateString);
            }
          }
        } catch (error) {
          console.error('Error polling game state:', error);
        }
      };
      
      // Poll every 300ms for real-time updates
      const intervalId = setInterval(pollState, 300);
      pollState(); // Initial poll
      
      return () => clearInterval(intervalId);
    }
  }, [currentUser, gameId, phase, lastSyncedState, role]);

  useEffect(() => {
    if (phase === "drawing" && role === "guesser" && guessInputRef.current) {
      guessInputRef.current.focus();
    }
  }, [phase, role]);

  useEffect(() => {
    if (role === "drawer" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Load drawing from game state or localStorage
      const loadDrawing = async () => {
        if (gameId && currentUser) {
          try {
            const { gameStateAPI } = await import('@/lib/api-utils');
            const result = await gameStateAPI.getGameState(gameId);
            if (result.success && result.state?.state?.drawingData) {
              const img = new Image();
              img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
              };
              img.src = result.state.state.drawingData;
              return;
            }
          } catch (error) {
            console.error('Error loading drawing:', error);
          }
        }
        
        // Fallback to localStorage
      const savedDrawing = localStorage.getItem("drawguess_drawing");
      if (savedDrawing) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = savedDrawing;
      } else {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      };
      
      loadDrawing();
    }
  }, [role, phase, gameId, currentUser]);

  // Load drawing for guessers (handled by pollState useEffect above)
  useEffect(() => {
    if (role === "guesser" && phase === "drawing" && guesserCanvasRef.current) {
      const canvas = guesserCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [role, phase]);

  const initializeCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem("drawguess_drawing");
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (role !== "drawer" || !canvasRef.current) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || role !== "drawer") return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Save drawing to localStorage (for immediate local sync)
    const dataURL = canvas.toDataURL();
    localStorage.setItem("drawguess_drawing", dataURL);
    
    // Also trigger state save (will be debounced by useEffect)
    setLastSyncedState(""); // Force update
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    initializeCanvas();
  };

  const addPlayer = () => {
    // Try to get next available team member name
    let playerName = `Player ${players.length + 1}`;
    
    const currentTeamData = localStorage.getItem("currentTeam");
    if (currentTeamData) {
      try {
        const team = JSON.parse(currentTeamData);
        const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
        
        // Get admin name
        const admin = allUsers.find((u: any) => u.id === team.adminId);
        const teamMemberNames: string[] = [];
        if (admin) teamMemberNames.push(admin.name);
        
        // Add all team member names
        team.members.forEach((member: any) => {
          teamMemberNames.push(member.name);
        });
        
        // Find a team member not already in players list
        const existingPlayerNames = players.map(p => p.name.toLowerCase());
        const availableMember = teamMemberNames.find(
          name => !existingPlayerNames.includes(name.toLowerCase())
        );
        
        if (availableMember) {
          playerName = availableMember;
        }
      } catch (e) {
        console.error("Error getting team member name:", e);
      }
    }
    
    const newPlayer: Player = {
      id: `player_${Date.now()}`,
      name: playerName,
      score: 0,
      hasDrawn: false
    };
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
  };

  const startGame = async () => {
    if (players.length < 2) return;
    
    // Try to load existing game state
    if (gameId && currentUser) {
      try {
        const { gameStateAPI } = await import('@/lib/api-utils');
        const result = await gameStateAPI.getGameState(gameId);
        
        if (result.success && result.state && result.state.state.phase !== "setup") {
          // Load existing game state
          const savedState = result.state.state;
          setPhase(savedState.phase || "waiting");
          setCurrentWord(savedState.currentWord || null);
          setTimeLeft(savedState.timeLeft || 60);
          setGuesses(savedState.guesses || []);
          setPlayers(savedState.players || players);
          setCurrentDrawerIndex(savedState.currentDrawerIndex || 0);
          setRound(savedState.round || 1);
          setRoundsPerPlayer(savedState.roundsPerPlayer || roundsPerPlayer);
          return;
        }
      } catch (error) {
        console.error('Error loading game state:', error);
      }
    }
    
    // Start new game
    setPhase("waiting");
    setCurrentDrawerIndex(0);
    setRound(1);
  };

  const selectWord = () => {
    // Generate 3 random word options
    const shuffled = [...DRAWING_WORDS].sort(() => Math.random() - 0.5);
    setWordOptions(shuffled.slice(0, 3));
    setShowWordSelection(true);
  };

  const chooseWord = (word: string) => {
    setCurrentWord(word);
    setShowWordSelection(false);
    setPhase("drawing");
    setTimeLeft(60);
    initializeCanvas();
    setGuesses([]);
    localStorage.setItem("drawguess_guesses", JSON.stringify([]));
  };

  const submitGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || !currentWord || role !== "guesser") return;

    const guessText = guess.trim();
    const isCorrect = guessText.toLowerCase() === currentWord.toLowerCase();
    
    const newGuess = {
      player: currentUser.name,
      guess: guessText,
      correct: isCorrect
    };

    const updatedGuesses = [...guesses, newGuess];
    setGuesses(updatedGuesses);
    setGuess("");

    if (isCorrect) {
      // Award points
      const updatedPlayers = players.map(p => 
        p.id === currentUser.id ? { ...p, score: p.score + 10 } : p
      );
      setPlayers(updatedPlayers);
      
      // Immediately sync correct guess
      if (gameId && currentUser) {
        try {
          const { gameStateAPI } = await import('@/lib/api-utils');
          let drawingData = "";
          if (canvasRef.current) {
            drawingData = canvasRef.current.toDataURL();
          }
          
          await gameStateAPI.saveGameState({
            id: gameId,
            gameType: 'drawguess',
            teamId: (() => {
              const team = localStorage.getItem("currentTeam");
              if (team) {
                try {
                  return JSON.parse(team).id;
                } catch (e) {
                  return undefined;
                }
              }
              return undefined;
            })(),
            state: {
              phase: "roundEnd",
      currentWord,
      timeLeft,
      guesses: updatedGuesses,
              players: updatedPlayers,
              currentDrawerIndex,
              round,
              roundsPerPlayer,
              drawingData,
            },
            lastUpdated: new Date().toISOString(),
            updatedBy: currentUser.id,
          });
        } catch (error) {
          console.error('Error syncing guess:', error);
        }
      }
      
      setTimeout(() => {
        endRound();
      }, 1500);
    } else {
      // Sync incorrect guess
      if (gameId && currentUser) {
        try {
          const { gameStateAPI } = await import('@/lib/api-utils');
          let drawingData = "";
          if (canvasRef.current) {
            drawingData = canvasRef.current.toDataURL();
          }
          
          await gameStateAPI.saveGameState({
            id: gameId,
            gameType: 'drawguess',
            teamId: (() => {
              const team = localStorage.getItem("currentTeam");
              if (team) {
                try {
                  return JSON.parse(team).id;
                } catch (e) {
                  return undefined;
                }
              }
              return undefined;
            })(),
            state: {
              phase,
              currentWord,
              timeLeft,
              guesses: updatedGuesses,
              players,
              currentDrawerIndex,
              round,
              roundsPerPlayer,
              drawingData,
            },
            lastUpdated: new Date().toISOString(),
            updatedBy: currentUser.id,
          });
        } catch (error) {
          console.error('Error syncing guess:', error);
        }
      }
    }
  };

  const endRound = () => {
    const currentDrawer = players[currentDrawerIndex];
    
    // Award points to drawer based on correct guesses
    const correctGuesses = guesses.filter(g => g.correct).length;
    const drawerPoints = correctGuesses * 5;
    
    setPlayers(players.map(p => 
      p.id === currentDrawer.id ? { ...p, score: p.score + drawerPoints, hasDrawn: true } : p
    ));

    localStorage.setItem("drawguess_game_state", JSON.stringify({
      currentWord: null,
      timeLeft: 0,
      guesses,
      phase: "roundEnd"
    }));

    setPhase("roundEnd");
  };

  const nextRound = () => {
    // Check if all players have drawn
    const allPlayersDrawn = players.every(p => p.hasDrawn);
    const roundsCompleted = Math.floor((round - 1) / players.length) + 1;

    if (allPlayersDrawn && roundsCompleted >= roundsPerPlayer) {
      setPhase("gameOver");
      return;
    }

    // Find next player who hasn't drawn
    let nextIndex = (currentDrawerIndex + 1) % players.length;
    while (players[nextIndex].hasDrawn && !allPlayersDrawn) {
      nextIndex = (nextIndex + 1) % players.length;
    }

    // If all have drawn, reset and start new round
    if (allPlayersDrawn) {
      setPlayers(players.map(p => ({ ...p, hasDrawn: false })));
      setRound(round + 1);
      nextIndex = 0;
    }

    setCurrentDrawerIndex(nextIndex);
    setRole(null);
    setCurrentWord(null);
    setGuesses([]);
    setGuess("");
    setTimeLeft(60);
    setShowWordSelection(false);
    localStorage.removeItem("drawguess_drawing");
    localStorage.removeItem("drawguess_guesses");
    setPhase("waiting");
  };

  const selectRole = (selectedRole: PlayerRole) => {
    setRole(selectedRole);
    if (selectedRole === "drawer") {
      selectWord();
    } else {
      setPhase("drawing");
    }
  };

  const resetGame = () => {
    setPhase("setup");
    setPlayers(players.map(p => ({ ...p, score: 0, hasDrawn: false })));
    setCurrentDrawerIndex(0);
    setRound(1);
    setRole(null);
    setCurrentWord(null);
    setGuesses([]);
    setGuess("");
    setTimeLeft(60);
    setShowWordSelection(false);
    localStorage.removeItem("drawguess_game_state");
    localStorage.removeItem("drawguess_drawing");
    localStorage.removeItem("drawguess_guesses");
  };

  if (!currentUser) return null;

  const currentDrawer = players[currentDrawerIndex];

  // LOBBY PHASE - Show game lobby for online multiplayer
  if (showLobby && phase === "waitingRoom") {
    return (
      <GameLobby
        gameType="drawguess"
        gameName="DRAW & GUESS"
        gameIcon="🎨"
        maxPlayers={8}
        minPlayers={2}
        onJoinRoom={handleJoinRoom}
        backUrl="/games"
      />
    );
  }

  // WAITING ROOM PHASE
  if (phase === "waitingRoom") {
    const currentTeamData = localStorage.getItem("currentTeam");
    let teamInfo = null;
    if (currentTeamData) {
      try {
        teamInfo = JSON.parse(currentTeamData);
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    const currentTeamName = teamInfo?.name || "Solo Player";
    const currentTeamId = teamInfo?.id || null;

    return (
      <WaitingRoom
        gameType="drawguess"
        gameName="DRAW & GUESS"
        gameIcon="🎨"
        currentTeamName={currentTeamName}
        currentTeamId={currentTeamId}
        gameId={gameRoom ? `drawguess_${gameRoom.code}` : gameId || ""}
        currentUser={currentUser}
        roomCode={gameRoom?.code}
        room={gameRoom || undefined}
        onLeaveRoom={handleLeaveRoom}
        onTeamJoined={async (teamId, teamName) => {
          setJoinedTeamIds(prev => [...prev, teamId]);
          setIsPlayingAgainstComputer(false);
          // Add players from joined team
          const { teamsAPI } = await import('@/lib/api-utils');
          const result = await teamsAPI.getTeams();
          if (result.success && result.teams) {
            const team = result.teams.find((t: any) => t.id === teamId);
            if (team) {
              const newPlayers: Player[] = team.members.map((m: any) => ({ 
                id: m.id, 
                name: m.name, 
                score: 0, 
                hasDrawn: false 
              }));
              // Only add players that don't already exist
              setPlayers(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const uniqueNewPlayers = newPlayers.filter(p => !existingIds.has(p.id));
                return [...prev, ...uniqueNewPlayers];
              });
            }
          }
        }}
        onStartGame={() => {
          setPhase("setup");
        }}
        onPlayAgainstComputer={() => {
          setIsPlayingAgainstComputer(true);
          setPhase("setup");
        }}
        minPlayers={2}
        maxPlayers={8}
        waitTime={30}
        showAvailableGames={true}
      />
    );
  }

  // SETUP PHASE
  if (phase === "setup") {
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
      <div className="min-h-screen p-4 md:p-8 page-enter">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-semibold animate-fade-in-left hover:animate-pulse-glow"
          >
            <ArrowLeft className="w-5 h-5 animate-fade-in-right" />
            BACK TO GAMES
          </Link>

          <div className="text-center mb-8 animate-fade-in-down delay-200">
            <h1 className="pixel-font text-3xl md:text-5xl font-bold text-pink-400 neon-glow-pink mb-4 float animate-glow-pulse">
              🎨 DRAW & GUESS
            </h1>
            <p className="text-cyan-300 animate-fade-in-up delay-300">
              Take turns drawing words while others guess!
            </p>
          </div>

          {teamInfo && (
            <div className="neon-card neon-box-purple p-4 mb-6 card-3d animate-slide-fade-in delay-300">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-purple-400 font-bold">Playing as Team: {teamInfo.name}</div>
                    <div className="text-cyan-300/70 text-sm">
                      {teamInfo.members.length + 1} player{teamInfo.members.length !== 0 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="neon-card neon-box-pink p-8 card-3d animate-scale-in delay-400">
            <h2 className="pixel-font text-xl text-cyan-400 neon-glow-cyan mb-6 text-center animate-fade-in-up">
              👥 PLAYERS
            </h2>

            <div className="space-y-4 mb-6">
              {players.map((player, idx) => (
                <div
                  key={player.id}
                  className="bg-purple-900/30 rounded-xl p-4 border-2 border-purple-500 neon-box-purple flex items-center gap-4 transition-all card-enter hover:animate-pulse-glow"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-black font-bold text-lg animate-bounce-in">
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayerName(player.id, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-black/50 border-2 border-gray-600 text-white font-semibold focus:outline-none focus:border-cyan-400 input-3d focus:animate-pulse-glow"
                    maxLength={20}
                  />
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded-lg transition-colors hover:animate-shake"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {players.length < 8 && (
              <button
                onClick={addPlayer}
                className="w-full py-4 border-2 border-dashed border-cyan-500/50 rounded-xl text-cyan-400 font-bold hover:bg-cyan-900/20 transition-colors flex items-center justify-center gap-2 animate-fade-in-up delay-500 hover:animate-pulse-glow"
              >
                <Users className="w-6 h-6 animate-rotate-in" />
                ADD PLAYER
              </button>
            )}

            <div className="mt-8 p-4 bg-black/30 rounded-xl border-2 border-yellow-500/50 animate-fade-in delay-600">
              <label className="block text-yellow-400 font-semibold mb-3">
                ROUNDS PER PLAYER
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setRoundsPerPlayer(num)}
                    className={`w-12 h-12 rounded-lg font-bold text-lg transition-all hover:animate-scale-up ${
                      roundsPerPlayer === num
                        ? "bg-yellow-500 text-black neon-box-yellow animate-pulse"
                        : "bg-black/50 text-gray-400 border-2 border-gray-600 hover:border-yellow-500"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              disabled={players.length < 2}
              className={`w-full mt-8 py-5 rounded-xl text-xl font-bold transition-all flex items-center justify-center gap-3 ${
                players.length >= 2
                  ? "neon-btn neon-btn-green hover:animate-button-press"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700"
              } animate-fade-in-up delay-700`}
            >
              <Play className="w-6 h-6 animate-pulse" />
              {players.length < 2 ? "ADD AT LEAST 2 PLAYERS" : "START GAME!"}
            </button>

            <div className="mt-8 p-6 bg-blue-900/20 rounded-xl border-2 border-blue-500/50">
              <h3 className="font-bold text-blue-400 mb-3">📖 HOW TO PLAY</h3>
              <ul className="text-blue-300/80 space-y-2 text-sm">
                <li>• Players take turns drawing a randomly chosen word</li>
                <li>• The <span className="text-pink-400">DRAWER</span> gets 60 seconds to draw</li>
                <li>• Other players try to <span className="text-cyan-400">GUESS</span> what's being drawn</li>
                <li>• Correct guessers get 10 points, drawer gets 5 points per correct guess</li>
                <li>• Most points wins!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // WAITING PHASE - Role Selection
  if (phase === "waiting" && !role) {
    return (
      <div className="min-h-screen p-4 md:p-8 page-enter">
        <div className="max-w-4xl mx-auto">
          {/* Scoreboard */}
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {players.map((player, idx) => (
              <div
                key={player.id}
                className={`bg-purple-900/30 rounded-xl p-3 border-2 border-purple-500 ${
                  idx === currentDrawerIndex ? "neon-box-purple scale-105 animate-pulse" : "opacity-70"
                } transition-all card-enter hover:animate-pulse-glow`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="text-purple-400 font-bold text-xs truncate">{player.name}</div>
                <div className="text-purple-400 text-2xl font-bold animate-bounce-in pixel-font">{player.score}</div>
              </div>
            ))}
          </div>

          {/* Current Drawer Banner */}
          <div className="bg-purple-900/30 rounded-2xl p-8 border-2 border-purple-500 neon-box-purple text-center mb-8 animate-bounce-in delay-300">
            <div className="text-sm text-gray-400 mb-2 animate-fade-in-up">IT'S TIME FOR...</div>
            <h2 className="pixel-font text-3xl md:text-4xl font-bold text-purple-400 mb-2 animate-glow-pulse">
              {currentDrawer?.name || "Player"}
            </h2>
            <div className="text-gray-400 animate-fade-in-up delay-200">Round {round}</div>
          </div>

          {/* Role Selection */}
          <div className="neon-card neon-box-cyan p-8 card-3d animate-scale-in delay-400">
            <h3 className="text-xl font-bold text-center text-cyan-400 mb-6 animate-fade-in-up">WHAT'S YOUR ROLE?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {currentDrawer?.id === currentUser.id ? (
                <button
                  onClick={() => selectRole("drawer")}
                  className="bg-purple-900/30 border-2 border-purple-500 neon-box-purple p-8 rounded-2xl transition-all hover:scale-105 flex flex-col items-center gap-4 card-enter animate-stagger-1 hover:animate-pulse-glow"
                >
                  <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center animate-rotate-in">
                    <Palette className="w-10 h-10 text-black animate-bounce" />
                  </div>
                  <span className="text-2xl font-bold text-purple-400 pixel-font text-sm">DRAWER</span>
                  <span className="text-gray-400 text-sm text-center">
                    You're drawing this round!
                  </span>
                </button>
              ) : (
                <div className="bg-gray-800/50 border-2 border-gray-600 p-8 rounded-2xl opacity-50 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                    <Palette className="w-10 h-10 text-gray-500" />
                  </div>
                  <span className="text-2xl font-bold text-gray-500 pixel-font text-sm">DRAWER</span>
                  <span className="text-gray-600 text-sm text-center">
                    {currentDrawer?.name} is drawing
                  </span>
                </div>
              )}

              {currentDrawer?.id !== currentUser.id ? (
                <button
                  onClick={() => selectRole("guesser")}
                  className="bg-cyan-900/30 border-2 border-cyan-500 neon-box-cyan p-8 rounded-2xl transition-all hover:scale-105 flex flex-col items-center gap-4 card-enter animate-stagger-2 hover:animate-pulse-glow"
                >
                  <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center animate-rotate-in delay-200">
                    <Zap className="w-10 h-10 text-black animate-pulse" />
                  </div>
                  <span className="text-2xl font-bold text-cyan-400 pixel-font text-sm">GUESSER</span>
                  <span className="text-gray-400 text-sm text-center">
                    Guess what {currentDrawer?.name} is drawing!
                  </span>
                </button>
              ) : (
                <div className="bg-gray-800/50 border-2 border-gray-600 p-8 rounded-2xl opacity-50 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                    <Zap className="w-10 h-10 text-gray-500" />
                  </div>
                  <span className="text-2xl font-bold text-gray-500 pixel-font text-sm">GUESSER</span>
                  <span className="text-gray-600 text-sm text-center">
                    You're drawing this round
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // WORD SELECTION
  if (showWordSelection && role === "drawer") {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="neon-card neon-box-pink p-8 card-3d animate-scale-in">
            <h2 className="text-2xl font-bold text-center text-pink-400 mb-6 pixel-font text-sm">
              CHOOSE A WORD TO DRAW
            </h2>
            <div className="grid gap-4">
              {wordOptions.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => chooseWord(word)}
                  className="bg-purple-900/30 border-2 border-purple-500 neon-box-purple p-6 rounded-xl text-2xl font-bold text-purple-400 hover:scale-105 transition-all hover:animate-pulse-glow animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DRAWING PHASE
  if (phase === "drawing" && role === "drawer" && currentWord) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-purple-900/30 rounded-2xl p-4 mb-6 border-2 border-purple-500 neon-box-purple">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400">DRAWING</div>
                <div className="text-xl font-bold text-purple-400">{currentWord}</div>
              </div>
              <div className={`text-5xl md:text-6xl font-bold pixel-font ${
                timeLeft <= 10 ? "text-red-400 neon-glow-pink animate-heartbeat" : "text-purple-400"
              } animate-bounce-in`}>
                {timeLeft}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={clearCanvas}
                  className="neon-btn neon-btn-red px-4 py-2 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  CLEAR
                </button>
                <button
                  onClick={endRound}
                  className="neon-btn neon-btn-yellow px-4 py-2"
                >
                  END ROUND
                </button>
              </div>
            </div>
          </div>

          {/* Drawing Tools */}
          <div className="neon-card neon-box-cyan p-4 mb-4 card-3d">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 font-semibold">COLOR:</span>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-semibold">SIZE:</span>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-cyan-400 font-bold">{brushSize}px</span>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="neon-card neon-box-cyan p-4 card-3d">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              className="w-full bg-gray-900 rounded-lg cursor-crosshair"
              style={{ height: "500px", touchAction: "none" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // GUESSING PHASE
  if (phase === "drawing" && role === "guesser") {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-cyan-900/30 rounded-2xl p-6 mb-6 border-2 border-cyan-500 neon-box-cyan text-center">
            <div className="text-sm text-gray-400 mb-1">{currentDrawer?.name} is drawing...</div>
            <div className={`text-5xl font-bold pixel-font ${
              timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-cyan-400"
            }`}>
              {timeLeft}
            </div>
          </div>

          {/* Drawing Display */}
          <div className="neon-card neon-box-cyan p-4 mb-6 card-3d">
            <canvas
              ref={guesserCanvasRef}
              className="w-full bg-gray-900 rounded-lg"
              style={{ height: "500px", touchAction: "none" }}
            />
          </div>

          {/* Guess Input */}
          <div className="neon-card neon-box-pink p-4 md:p-8 mb-6 card-3d">
            <div className="text-center mb-4 md:mb-6">
              <div className="text-lg md:text-2xl font-bold text-pink-400 mb-2 pixel-font text-xs md:text-sm">
                🎯 WHAT ARE THEY DRAWING?
              </div>
            </div>

            <form onSubmit={submitGuess} className="space-y-4">
              <input
                ref={guessInputRef}
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your guess here..."
                className="w-full px-4 md:px-6 py-3 md:py-5 rounded-xl text-base md:text-xl font-semibold text-center bg-black/50 border-2 border-cyan-500 text-white focus:outline-none focus:border-cyan-400 transition-all"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!guess.trim()}
                className={`w-full py-3 md:py-5 rounded-xl text-base md:text-xl font-bold transition-all ${
                  guess.trim()
                    ? "neon-btn neon-btn-green"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700"
                }`}
              >
                <Zap className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
                SUBMIT GUESS
              </button>
            </form>
          </div>

          {/* Guesses List */}
          {guesses.length > 0 && (
            <div className="neon-card p-6 border-2 border-gray-700 card-3d">
              <h3 className="font-bold text-gray-400 mb-3 text-sm">GUESSES:</h3>
              <div className="flex flex-wrap gap-2">
                {guesses.map((item, idx) => (
                  <span
                    key={idx}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      item.correct 
                        ? "bg-green-900/50 text-green-400 border border-green-500" 
                        : "bg-gray-800 text-gray-500 border border-gray-700"
                    }`}
                  >
                    {item.player}: {item.guess}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ROUND END PHASE
  if (phase === "roundEnd") {
    const correctGuesses = guesses.filter(g => g.correct);
    
    return (
      <div className="min-h-screen p-4 md:p-8 py-8">
        <div className="max-w-2xl w-full mx-auto">
          <div className="bg-purple-900/30 rounded-2xl p-8 border-2 border-purple-500 neon-box-purple text-center">
            <div className="text-6xl mb-4 float">🎉</div>
            <h2 className="pixel-font text-2xl md:text-3xl font-bold text-purple-400 mb-2">
              ROUND COMPLETE!
            </h2>
            <div className="text-gray-400 mb-6">The word was: <span className="text-purple-400 font-bold text-xl">{currentWord}</span></div>
            
            <div className="bg-black/30 rounded-xl p-6 mb-8 neon-box-green">
              <div className="text-5xl font-bold text-green-400 mb-2 pixel-font">{correctGuesses.length}</div>
              <div className="text-green-300">CORRECT GUESS{correctGuesses.length !== 1 ? "ES" : ""}</div>
            </div>

            {correctGuesses.length > 0 && (
              <div className="bg-black/20 rounded-xl p-4 mb-8">
                <div className="text-sm text-gray-400 mb-2">CORRECT GUESSERS:</div>
                <div className="space-y-2">
                  {correctGuesses.map((g, idx) => (
                    <div key={idx} className="text-purple-400 font-bold">
                      ✓ {g.player}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={nextRound}
              className="neon-btn neon-btn-cyan w-full py-5 text-xl btn-3d"
            >
              NEXT ROUND →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GAME OVER PHASE
  if (phase === "gameOver") {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Winner Banner */}
          <div className="bg-purple-900/30 rounded-2xl p-8 border-2 border-purple-500 neon-box-purple text-center mb-8">
            <div className="text-6xl mb-4 float">🏆</div>
            <div className="text-sm text-gray-400 mb-2">THE WINNER IS...</div>
            <h1 className="pixel-font text-3xl md:text-5xl font-bold text-purple-400 mb-4">
              {winner.name}
            </h1>
            <div className="text-3xl font-bold text-purple-400 pixel-font">{winner.score} POINTS!</div>
          </div>

          {/* Final Standings */}
          <div className="neon-card neon-box-cyan p-8 mb-8 card-3d">
            <h2 className="text-xl font-bold text-cyan-400 mb-6 text-center pixel-font">FINAL STANDINGS</h2>
            <div className="space-y-4">
              {sortedPlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className={`bg-purple-900/30 rounded-xl p-4 border-2 border-purple-500 ${idx === 0 ? "neon-box-purple" : ''} flex items-center gap-4`}
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-black font-bold text-xl">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-purple-400 font-bold text-xl">{player.name}</div>
                  </div>
                  <div className="text-purple-400 text-3xl font-bold pixel-font">{player.score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={resetGame}
              className="flex-1 neon-btn neon-btn-green py-5 text-xl flex items-center justify-center gap-2 btn-3d"
            >
              <RotateCcw className="w-6 h-6" />
              PLAY AGAIN
            </button>
            <Link
              href="/games"
              className="flex-1 neon-btn neon-btn-pink py-5 text-xl flex items-center justify-center gap-2 btn-3d"
            >
              <ArrowLeft className="w-6 h-6" />
              BACK TO GAMES
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function DrawGuessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-cyan-400 text-xl">Loading game...</div>
      </div>
    }>
      <DrawGuessPageContent />
    </Suspense>
  );
}

