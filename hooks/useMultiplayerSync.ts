"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Types for multiplayer sync
export interface RoomPlayer {
  id: string;
  name: string;
  team?: string;
  isReady: boolean;
  isHost: boolean;
  joinedAt: string;
}

export interface GameRoom {
  id: string;
  code: string;
  gameType: string;
  hostId: string;
  hostName: string;
  isPrivate: boolean;
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  minPlayers: number;
  currentPlayers: RoomPlayer[];
  settings: Record<string, any>;
  teamMode: boolean;
  teams: Array<{ id: string; name: string; color: string; players: Array<{ id: string; name: string }> }>;
  createdAt: string;
  updatedAt: string;
}

export interface MultiplayerState<T = any> {
  room: GameRoom | null;
  gameState: T | null;
  isHost: boolean;
  isConnected: boolean;
  myPlayerIndex: number;
  error: string | null;
}

export interface UseMultiplayerSyncOptions {
  gameType: string;
  roomCode?: string;
  roomId?: string;
  currentUser: { id: string; name: string } | null;
  onRoomUpdate?: (room: GameRoom) => void;
  onPlayerJoined?: (player: RoomPlayer) => void;
  onPlayerLeft?: (player: RoomPlayer) => void;
  onGameStart?: () => void;
  onGameStateUpdate?: (state: any) => void;
  pollInterval?: number; // ms, default 1000
}

/**
 * Hook for managing multiplayer game synchronization
 * Handles room state, player joining/leaving, and game state sync
 */
export function useMultiplayerSync<T = any>(options: UseMultiplayerSyncOptions) {
  const {
    gameType,
    roomCode,
    roomId,
    currentUser,
    onRoomUpdate,
    onPlayerJoined,
    onPlayerLeft,
    onGameStart,
    onGameStateUpdate,
    pollInterval = 1000,
  } = options;

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [gameState, setGameState] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const previousPlayersRef = useRef<RoomPlayer[]>([]);
  const previousStatusRef = useRef<string>('waiting');
  const lastGameStateRef = useRef<string>("");
  const deviceIdRef = useRef<string>("");

  // Generate a unique device ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('deviceId', deviceId);
      }
      deviceIdRef.current = deviceId;
    }
  }, []);

  // Calculate derived state
  const isHost = room ? currentUser?.id === room.hostId : false;
  const myPlayerIndex = room ? room.currentPlayers.findIndex(p => p.id === currentUser?.id) : -1;

  // Fetch room by code or ID
  const fetchRoom = useCallback(async () => {
    if (!currentUser) return null;
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      
      let result;
      if (roomCode) {
        result = await gameRoomsAPI.getRoomByCode(roomCode);
      } else if (roomId) {
        result = await gameRoomsAPI.getRoom(roomId);
      } else {
        return null;
      }
      
      if (result.success && result.room) {
        return result.room;
      } else if (result.error) {
        // Don't set error for missing table
        if (!result.error.includes("game_rooms") && !result.error.includes("schema cache")) {
          setError(result.error);
        }
      }
      return null;
    } catch (err: any) {
      if (!err.message?.includes("game_rooms") && !err.message?.includes("schema cache")) {
        setError(err.message || "Failed to fetch room");
      }
      return null;
    }
  }, [roomCode, roomId, currentUser]);

  // Fetch game state
  const fetchGameState = useCallback(async (gameId: string) => {
    try {
      const { gameStateAPI } = await import("@/lib/api-utils");
      const result = await gameStateAPI.getGameState(gameId);
      
      if (result.success && result.state) {
        // Check if this update was from another device
        const stateJson = JSON.stringify(result.state.state);
        if (stateJson !== lastGameStateRef.current) {
          // Only update if from different device
          if (result.state.deviceId !== deviceIdRef.current || result.state.updatedBy !== currentUser?.id) {
            lastGameStateRef.current = stateJson;
            return result.state.state;
          }
        }
      }
      return null;
    } catch (err) {
      console.error("Error fetching game state:", err);
      return null;
    }
  }, [currentUser]);

  // Save game state
  const saveGameState = useCallback(async (state: T) => {
    if (!room || !currentUser) return false;
    
    try {
      const { gameStateAPI } = await import("@/lib/api-utils");
      const gameId = `${gameType}_${room.code}`;
      
      const stateJson = JSON.stringify(state);
      lastGameStateRef.current = stateJson;
      
      await gameStateAPI.saveGameState({
        id: gameId,
        gameType,
        state,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser.id,
        deviceId: deviceIdRef.current,
      });
      
      setGameState(state);
      return true;
    } catch (err) {
      console.error("Error saving game state:", err);
      return false;
    }
  }, [room, currentUser, gameType]);

  // Join room
  const joinRoom = useCallback(async (code: string) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      const result = await gameRoomsAPI.joinRoom(code, currentUser.id, currentUser.name);
      
      if (result.success && result.room) {
        setRoom(result.room);
        setIsConnected(true);
        previousPlayersRef.current = result.room.currentPlayers;
        previousStatusRef.current = result.room.status;
        onRoomUpdate?.(result.room);
        return { success: true, room: result.room };
      } else {
        setError(result.error || "Failed to join room");
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      setError(err.message || "Failed to join room");
      return { success: false, error: err.message };
    }
  }, [currentUser, onRoomUpdate]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!room || !currentUser) return false;
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      await gameRoomsAPI.leaveRoom(room.id, currentUser.id);
      
      setRoom(null);
      setIsConnected(false);
      previousPlayersRef.current = [];
      return true;
    } catch (err) {
      console.error("Error leaving room:", err);
      return false;
    }
  }, [room, currentUser]);

  // Set player ready status
  const setReady = useCallback(async (ready: boolean) => {
    if (!room || !currentUser) return false;
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      await gameRoomsAPI.setPlayerReady(room.id, currentUser.id, ready);
      return true;
    } catch (err) {
      console.error("Error setting ready:", err);
      return false;
    }
  }, [room, currentUser]);

  // Start game (host only)
  const startGame = useCallback(async () => {
    if (!room || !currentUser || currentUser.id !== room.hostId) return false;
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      await gameRoomsAPI.updateRoomStatus(room.id, 'playing');
      return true;
    } catch (err) {
      console.error("Error starting game:", err);
      return false;
    }
  }, [room, currentUser]);

  // Create room
  const createRoom = useCallback(async (options: {
    isPrivate?: boolean;
    maxPlayers?: number;
    minPlayers?: number;
    teamMode?: boolean;
    teams?: Array<{ id: string; name: string; color: string }>;
    settings?: Record<string, any>;
  }) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      const result = await gameRoomsAPI.createRoom({
        gameType,
        hostId: currentUser.id,
        hostName: currentUser.name,
        isPrivate: options.isPrivate ?? false,
        maxPlayers: options.maxPlayers ?? 4,
        minPlayers: options.minPlayers ?? 2,
        teamMode: options.teamMode ?? false,
        teams: options.teams?.map(t => ({ ...t, players: [] })) ?? [],
        settings: options.settings ?? {},
      });
      
      if (result.success && result.room) {
        setRoom(result.room);
        setIsConnected(true);
        previousPlayersRef.current = result.room.currentPlayers;
        previousStatusRef.current = result.room.status;
        onRoomUpdate?.(result.room);
        return { success: true, room: result.room };
      } else {
        setError(result.error || "Failed to create room");
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      setError(err.message || "Failed to create room");
      return { success: false, error: err.message };
    }
  }, [currentUser, gameType, onRoomUpdate]);

  // Assign player to team
  const assignToTeam = useCallback(async (playerId: string, teamId: string) => {
    if (!room || !currentUser) return false;
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      await gameRoomsAPI.assignPlayerToTeam(room.id, playerId, teamId);
      return true;
    } catch (err) {
      console.error("Error assigning to team:", err);
      return false;
    }
  }, [room, currentUser]);

  // Update room settings
  const updateSettings = useCallback(async (settings: Record<string, any>) => {
    if (!room || !currentUser || currentUser.id !== room.hostId) return false;
    
    try {
      const { gameRoomsAPI } = await import("@/lib/api-utils");
      await gameRoomsAPI.updateRoomSettings(room.id, settings);
      return true;
    } catch (err) {
      console.error("Error updating settings:", err);
      return false;
    }
  }, [room, currentUser]);

  // Poll for room updates
  useEffect(() => {
    if (!roomCode && !roomId) return;
    if (!currentUser) return;
    
    let isActive = true;
    
    const pollRoom = async () => {
      if (!isActive) return;
      
      const newRoom = await fetchRoom();
      if (!newRoom || !isActive) return;
      
      // Detect player changes
      const previousPlayers = previousPlayersRef.current;
      const currentPlayers = newRoom.currentPlayers;
      
      // Find joined players
      const joinedPlayers = currentPlayers.filter(
        p => !previousPlayers.some(prev => prev.id === p.id)
      );
      
      // Find left players
      const leftPlayers = previousPlayers.filter(
        p => !currentPlayers.some(curr => curr.id === p.id)
      );
      
      // Notify about player changes
      joinedPlayers.forEach(player => {
        if (player.id !== currentUser.id) {
          onPlayerJoined?.(player);
        }
      });
      
      leftPlayers.forEach(player => {
        if (player.id !== currentUser.id) {
          onPlayerLeft?.(player);
        }
      });
      
      // Check if game started
      if (previousStatusRef.current === 'waiting' && newRoom.status === 'playing') {
        onGameStart?.();
      }
      
      // Update state
      previousPlayersRef.current = currentPlayers;
      previousStatusRef.current = newRoom.status;
      setRoom(newRoom);
      setIsConnected(true);
      onRoomUpdate?.(newRoom);
    };
    
    // Initial poll
    pollRoom();
    
    // Set up interval
    const intervalId = setInterval(pollRoom, pollInterval);
    
    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [roomCode, roomId, currentUser, fetchRoom, pollInterval, onRoomUpdate, onPlayerJoined, onPlayerLeft, onGameStart]);

  // Poll for game state updates (when game is playing)
  useEffect(() => {
    if (!room || room.status !== 'playing' || !currentUser) return;
    
    let isActive = true;
    const gameId = `${gameType}_${room.code}`;
    
    const pollGameState = async () => {
      if (!isActive) return;
      
      const newState = await fetchGameState(gameId);
      if (newState && isActive) {
        setGameState(newState);
        onGameStateUpdate?.(newState);
      }
    };
    
    // Set up interval
    const intervalId = setInterval(pollGameState, pollInterval);
    
    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [room, currentUser, gameType, pollInterval, fetchGameState, onGameStateUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Leave room on unmount if connected
      if (room && currentUser) {
        const cleanup = async () => {
          try {
            const { gameRoomsAPI } = await import("@/lib/api-utils");
            await gameRoomsAPI.leaveRoom(room.id, currentUser.id);
          } catch (err) {
            console.error("Error leaving room on cleanup:", err);
          }
        };
        cleanup();
      }
    };
  }, [room, currentUser]);

  return {
    // State
    room,
    gameState,
    isHost,
    isConnected,
    myPlayerIndex,
    error,
    
    // Room actions
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    startGame,
    assignToTeam,
    updateSettings,
    
    // Game state actions
    saveGameState,
    setGameState,
    
    // Utils
    refreshRoom: fetchRoom,
  };
}

export default useMultiplayerSync;

