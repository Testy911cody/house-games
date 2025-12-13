"use client";

import { useEffect, useState } from "react";
import { Users, Clock, AlertTriangle, Zap } from "lucide-react";
import Link from "next/link";

interface AvailableTeam {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  adminName: string;
}

interface WaitingRoomProps {
  gameType: string;
  gameName: string;
  gameIcon: string;
  currentTeamName: string;
  currentTeamId: string | null;
  gameId: string;
  currentUser: any;
  onTeamJoined?: (teamId: string, teamName: string) => void;
  onStartGame: () => void;
  onPlayAgainstComputer: () => void;
  minPlayers?: number;
  maxPlayers?: number;
  waitTime?: number; // seconds
  showAvailableGames?: boolean; // Show other games waiting for players
}

export default function WaitingRoom({
  gameType,
  gameName,
  gameIcon,
  currentTeamName,
  currentTeamId,
  gameId,
  currentUser,
  onTeamJoined,
  onStartGame,
  onPlayAgainstComputer,
  minPlayers = 2,
  maxPlayers = 4,
  waitTime = 30,
  showAvailableGames = true,
}: WaitingRoomProps) {
  const [availableTeams, setAvailableTeams] = useState<AvailableTeam[]>([]);
  const [joinedTeamIds, setJoinedTeamIds] = useState<string[]>([]);
  const [isPlayingAgainstComputer, setIsPlayingAgainstComputer] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [waitingRoomStartTime, setWaitingRoomStartTime] = useState<number | null>(null);
  const [availableGames, setAvailableGames] = useState<any[]>([]);

  useEffect(() => {
    setWaitingRoomStartTime(Date.now());
    loadAvailableTeams();
    if (showAvailableGames) {
      loadAvailableGames();
    }
    
    // Update team's last game access when entering waiting room
    if (currentTeamId) {
      const updateAccess = async () => {
        try {
          const { teamsAPI } = await import('@/lib/api-utils');
          await teamsAPI.updateTeamGameAccess(currentTeamId);
        } catch (error) {
          console.error('Error updating team game access:', error);
        }
      };
      updateAccess();
    }
  }, []);

  // Load available teams for this game
  const loadAvailableTeams = async () => {
    try {
      const { teamsAPI } = await import('@/lib/api-utils');
      const result = await teamsAPI.getTeams();
      
      if (result.success && result.teams) {
        // Filter to only show teams that are online and not already in this game
        const onlineTeams = result.teams
          .filter((team: any) => {
            // Don't show the current user's team
            if (team.id === currentTeamId) return false;
            
            // Check if team has online members
            const adminOnline = teamsAPI.isUserOnline(team.adminId);
            const membersOnline = team.members?.some((member: any) => 
              teamsAPI.isUserOnline(member.id)
            ) || false;
            
            // Also show new teams (created in last 10 minutes)
            const teamAge = Date.now() - new Date(team.createdAt).getTime();
            const isNewTeam = teamAge < 10 * 60 * 1000;
            
            return adminOnline || membersOnline || isNewTeam;
          })
          .map((team: any) => ({
            id: team.id,
            name: team.name,
            code: team.code,
            memberCount: (team.members?.length || 0) + 1,
            adminName: team.adminName,
          }));
        
        setAvailableTeams(onlineTeams);
      }
    } catch (error) {
      console.error('Error loading available teams:', error);
      setAvailableTeams([]);
    }
  };

  // Load other games waiting for players
  const loadAvailableGames = async () => {
    try {
      const { gameStateAPI } = await import('@/lib/api-utils');
      const result = await gameStateAPI.getWaitingGames(gameType);
      
      if (result.success && result.games) {
        // Filter out this game
        const otherGames = result.games.filter((game: any) => game.id !== gameId);
        setAvailableGames(otherGames);
      }
    } catch (error) {
      console.error('Error loading available games:', error);
    }
  };

  // Auto-refresh available teams
  useEffect(() => {
    const interval = setInterval(() => {
      loadAvailableTeams();
      if (showAvailableGames) {
        loadAvailableGames();
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [gameId, showAvailableGames]);

  // Countdown timer
  useEffect(() => {
    if (!waitingRoomStartTime) return;
    
    const elapsed = Math.floor((Date.now() - waitingRoomStartTime) / 1000);
    const remaining = Math.max(0, waitTime - elapsed);
    
    if (remaining > 0) {
      setCountdown(remaining);
      const timer = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - waitingRoomStartTime) / 1000);
        const newRemaining = Math.max(0, waitTime - newElapsed);
        setCountdown(newRemaining);
        
        if (newRemaining === 0 && isPlayingAgainstComputer && joinedTeamIds.length < minPlayers - 1) {
          // Auto-start if no teams joined and we need more players
          onPlayAgainstComputer();
        }
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      if (isPlayingAgainstComputer && joinedTeamIds.length < minPlayers - 1) {
        onPlayAgainstComputer();
      }
    }
  }, [waitingRoomStartTime, waitTime, isPlayingAgainstComputer, joinedTeamIds.length, minPlayers]);

  // Function to join as a team
  const joinAsTeam = async (teamId: string) => {
    try {
      const { teamsAPI } = await import('@/lib/api-utils');
      const result = await teamsAPI.getTeams();
      
      if (result.success && result.teams) {
        const team = result.teams.find((t: any) => t.id === teamId);
        if (team) {
          setJoinedTeamIds(prev => [...prev, teamId]);
          setIsPlayingAgainstComputer(false);
          
          // Update game state
          if (gameId && currentUser) {
            const { gameStateAPI } = await import('@/lib/api-utils');
            await gameStateAPI.saveGameState({
              id: gameId,
              gameType: gameType,
              teamId: currentTeamId || undefined,
              state: {
                phase: "waiting",
                joinedTeamIds: [...joinedTeamIds, teamId],
                isPlayingAgainstComputer: false,
              },
              lastUpdated: new Date().toISOString(),
              updatedBy: currentUser.id,
            });
          }
          
          if (onTeamJoined) {
            onTeamJoined(teamId, team.name);
          }
          
          loadAvailableTeams();
        }
      }
    } catch (error) {
      console.error('Error joining as team:', error);
    }
  };

  const playerCount = 1 + joinedTeamIds.length; // Current team + joined teams
  const canStart = playerCount >= minPlayers;
  const isFull = playerCount >= maxPlayers;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="pixel-font text-3xl md:text-5xl font-bold text-pink-400 neon-glow-pink mb-4 float">
            {gameIcon} {gameName}
          </h1>
          <p className="text-cyan-300">
            Waiting for players to join...
          </p>
        </div>

        {/* Current Team Info */}
        {currentTeamName && (
          <div className="neon-card neon-box-purple p-4 mb-6 card-3d">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-purple-400 font-bold">You are playing as: {currentTeamName}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Status */}
        <div className="neon-card neon-box-cyan p-6 mb-6 card-3d">
          <h2 className="pixel-font text-xl text-cyan-400 neon-glow-cyan mb-4 text-center">
            🎮 GAME STATUS
          </h2>
          
          {/* Player Count */}
          <div className="bg-gray-800/50 rounded-xl p-4 border-2 border-gray-600 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{playerCount} / {maxPlayers}</div>
              <div className="text-gray-400 text-sm">Players Joined</div>
              {!canStart && (
                <div className="text-yellow-400 text-sm mt-2">
                  Need at least {minPlayers} players to start
                </div>
              )}
              {isFull && (
                <div className="text-green-400 text-sm mt-2">
                  Game is full! Ready to start
                </div>
              )}
            </div>
          </div>

          {/* Countdown Timer */}
          {countdown !== null && countdown > 0 && (
            <div className="text-center mb-4">
              <div className="text-yellow-400 font-bold text-2xl mb-2 flex items-center justify-center gap-2">
                <Clock className="w-6 h-6" />
                {isPlayingAgainstComputer && joinedTeamIds.length < minPlayers - 1
                  ? `Starting in ${countdown} seconds...`
                  : "Waiting for players..."}
              </div>
              {isPlayingAgainstComputer && joinedTeamIds.length < minPlayers - 1 && (
                <p className="text-cyan-300/70 text-sm">
                  Game will start automatically with computer players if no one joins
                </p>
              )}
            </div>
          )}

          {/* Available Teams */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              AVAILABLE TEAMS TO JOIN
            </h3>
            
            {availableTeams.length === 0 ? (
              <div className="bg-gray-800/30 rounded-xl p-6 border-2 border-gray-600 text-center">
                <div className="text-gray-400 mb-2">No other teams online</div>
                <div className="text-gray-500 text-sm">
                  {isPlayingAgainstComputer 
                    ? "You'll play against computer players"
                    : "Waiting for teams to come online..."}
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {availableTeams.map((team) => {
                  const isJoined = joinedTeamIds.includes(team.id);
                  const canJoin = !isFull && !isJoined;
                  
                  return (
                    <div
                      key={team.id}
                      className={`bg-gray-800/50 rounded-xl p-4 border-2 ${
                        isJoined ? "border-green-500" : canJoin ? "border-gray-600 hover:border-cyan-500" : "border-gray-700 opacity-50"
                      } transition-all flex items-center justify-between`}
                    >
                      <div className="flex-1">
                        <div className="text-white font-semibold">{team.name}</div>
                        <div className="text-gray-400 text-sm">
                          {team.memberCount} member{team.memberCount !== 1 ? "s" : ""} • Admin: {team.adminName}
                        </div>
                        <div className="text-cyan-400 text-xs font-mono mt-1">Code: {team.code}</div>
                      </div>
                      {isJoined ? (
                        <div className="px-4 py-2 bg-green-500/20 border border-green-500 rounded text-green-400 font-bold text-sm">
                          JOINED ✓
                        </div>
                      ) : canJoin ? (
                        <button
                          onClick={() => joinAsTeam(team.id)}
                          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded transition-all hover:scale-105"
                        >
                          JOIN
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-gray-700 text-gray-500 font-bold text-sm rounded">
                          FULL
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Other Games Waiting */}
          {showAvailableGames && availableGames.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                OTHER {gameName.toUpperCase()} GAMES WAITING
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${gameType}?join=${game.id}`}
                    className="block bg-purple-900/30 rounded-xl p-3 border-2 border-purple-500 hover:border-purple-400 transition-all"
                  >
                    <div className="text-white font-semibold text-sm">
                      {game.state?.currentTeamName || "Game"} waiting for players
                    </div>
                    <div className="text-purple-300 text-xs mt-1">
                      Click to join this game
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {canStart && (
              <button
                onClick={onStartGame}
                className="flex-1 neon-btn neon-btn-green py-4 text-lg font-bold"
              >
                START GAME ({playerCount} PLAYERS)
              </button>
            )}
            {isPlayingAgainstComputer && joinedTeamIds.length < minPlayers - 1 && (
              <button
                onClick={onPlayAgainstComputer}
                className="flex-1 neon-btn neon-btn-yellow py-4 text-lg font-bold"
              >
                START VS COMPUTER
              </button>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-900/20 rounded-xl border-2 border-blue-500/50">
            <h3 className="font-bold text-blue-400 mb-2">ℹ️ HOW IT WORKS</h3>
            <ul className="text-blue-300/80 space-y-1 text-sm">
              <li>• You are playing as: <span className="text-purple-400 font-bold">{currentTeamName || "Solo Player"}</span></li>
              <li>• Other online teams can join your game</li>
              <li>• Need {minPlayers}-{maxPlayers} players to start</li>
              {isPlayingAgainstComputer && (
                <li>• If no one joins, you'll play against <span className="text-yellow-400 font-bold">COMPUTER</span> players</li>
              )}
              <li>• Game will start automatically after {waitTime} seconds, or click to start early</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

