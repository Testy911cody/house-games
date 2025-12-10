// Client-side utilities to replace Next.js API routes for GitHub Pages static hosting

/**
 * Generate Jeopardy topic (client-side version of /api/generate-jeopardy-topic)
 */
export function generateJeopardyTopic(topic: string) {
  const topicLower = topic.toLowerCase().trim();
  
  // Emoji and color mapping
  const emojiMap: Record<string, string> = {
    'harry potter': '⚡', 'potter': '⚡',
    'marvel': '🦸', 'superhero': '🦸', 'comics': '🦸',
    'star wars': '⭐', 'wars': '⭐',
    'disney': '🏰', 'animation': '🏰',
    'music': '🎵', 'songs': '🎵', 'artists': '🎵',
    'movies': '🎬', 'films': '🎬', 'cinema': '🎬',
    'sports': '⚽', 'football': '⚽', 'basketball': '🏀',
    'science': '🔬', 'biology': '🔬', 'chemistry': '🔬',
    'history': '📜', 'war': '📜', 'ancient': '📜',
    'geography': '🌍', 'countries': '🌍', 'cities': '🌍',
    'food': '🍕', 'cooking': '🍕', 'cuisine': '🍕',
    'animals': '🐾', 'wildlife': '🐾', 'nature': '🐾',
    'technology': '💻', 'computers': '💻', 'tech': '💻',
    'literature': '📚', 'books': '📚', 'authors': '📚',
    'games': '🎮', 'gaming': '🎮', 'video games': '🎮',
    'space': '🚀', 'astronomy': '🚀', 'planets': '🚀',
    'art': '🎨', 'painting': '🎨', 'artist': '🎨',
    'math': '🔢', 'mathematics': '🔢', 'numbers': '🔢',
  };
  
  const colorMap: Record<string, string> = {
    'harry potter': 'purple', 'potter': 'purple',
    'marvel': 'cyan', 'superhero': 'cyan', 'comics': 'cyan',
    'star wars': 'yellow', 'wars': 'yellow',
    'disney': 'pink', 'animation': 'pink',
    'music': 'pink', 'songs': 'pink', 'artists': 'pink',
    'movies': 'orange', 'films': 'orange', 'cinema': 'orange',
    'sports': 'green', 'football': 'green', 'basketball': 'green',
    'science': 'cyan', 'biology': 'cyan', 'chemistry': 'cyan',
    'history': 'yellow', 'war': 'yellow', 'ancient': 'yellow',
    'geography': 'green', 'countries': 'green', 'cities': 'green',
    'food': 'orange', 'cooking': 'orange', 'cuisine': 'orange',
    'animals': 'green', 'wildlife': 'green', 'nature': 'green',
    'technology': 'cyan', 'computers': 'cyan', 'tech': 'cyan',
    'literature': 'purple', 'books': 'purple', 'authors': 'purple',
    'games': 'cyan', 'gaming': 'cyan', 'video games': 'cyan',
    'space': 'cyan', 'astronomy': 'cyan', 'planets': 'cyan',
    'art': 'pink', 'painting': 'pink', 'artist': 'pink',
    'math': 'yellow', 'mathematics': 'yellow', 'numbers': 'yellow',
  };
  
  // Find matching emoji and color
  let icon = '🎯';
  let color = 'cyan';
  
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (topicLower.includes(key)) {
      icon = emoji;
      break;
    }
  }
  
  for (const [key, col] of Object.entries(colorMap)) {
    if (topicLower.includes(key)) {
      color = col;
      break;
    }
  }
  
  // Enhanced category templates with more variety
  const categoryTemplates = [
    { name: 'Basics', type: 'basic' },
    { name: 'History', type: 'history' },
    { name: 'Key Facts', type: 'facts' },
    { name: 'Important People', type: 'people' },
    { name: 'Details', type: 'details' },
    { name: 'Advanced Concepts', type: 'advanced' },
  ];
  
  // Enhanced question generators by category type
  const generateQuestion = (categoryType: string, difficulty: number, topic: string): { question: string; answer: string } => {
    const points = difficulty;
    const topicCap = topic.charAt(0).toUpperCase() + topic.slice(1);
    
    switch (categoryType) {
      case 'basic':
        if (points === 100) {
          return {
            question: `What is ${topic} most commonly known for?`,
            answer: `The primary characteristic or purpose of ${topic}`
          };
        } else if (points === 200) {
          return {
            question: `In what category or field does ${topic} belong?`,
            answer: `The main category or field of ${topic}`
          };
        } else if (points === 300) {
          return {
            question: `What is a fundamental aspect of ${topic}?`,
            answer: `A core element or principle of ${topic}`
          };
        } else if (points === 400) {
          return {
            question: `What defines the essence of ${topic}?`,
            answer: `The defining characteristics of ${topic}`
          };
        } else {
          return {
            question: `What are the foundational principles of ${topic}?`,
            answer: `The fundamental principles underlying ${topic}`
          };
        }
        
      case 'history':
        if (points === 100) {
          return {
            question: `When did ${topic} first become significant or popular?`,
            answer: `The period when ${topic} gained prominence`
          };
        } else if (points === 200) {
          return {
            question: `What historical event is most associated with ${topic}?`,
            answer: `A key historical event related to ${topic}`
          };
        } else if (points === 300) {
          return {
            question: `How did ${topic} evolve or develop over time?`,
            answer: `The evolution and development of ${topic}`
          };
        } else if (points === 400) {
          return {
            question: `What is the historical significance of ${topic}?`,
            answer: `The historical importance and impact of ${topic}`
          };
        } else {
          return {
            question: `What are the key historical milestones of ${topic}?`,
            answer: `Significant historical milestones in ${topic}`
          };
        }
        
      case 'facts':
        if (points === 100) {
          return {
            question: `What is a basic fact about ${topic}?`,
            answer: `A fundamental fact regarding ${topic}`
          };
        } else if (points === 200) {
          return {
            question: `How many main components or parts does ${topic} typically have?`,
            answer: `The number of main components in ${topic}`
          };
        } else if (points === 300) {
          return {
            question: `What is a notable statistic or number related to ${topic}?`,
            answer: `A significant statistic about ${topic}`
          };
        } else if (points === 400) {
          return {
            question: `What are the key measurements or metrics for ${topic}?`,
            answer: `Important measurements or metrics of ${topic}`
          };
        } else {
          return {
            question: `What complex data or statistics define ${topic}?`,
            answer: `Complex statistical data about ${topic}`
          };
        }
        
      case 'people':
        if (points === 100) {
          return {
            question: `Who is most famously associated with ${topic}?`,
            answer: `A well-known person related to ${topic}`
          };
        } else if (points === 200) {
          return {
            question: `Who created, invented, or founded ${topic}?`,
            answer: `The creator or founder of ${topic}`
          };
        } else if (points === 300) {
          return {
            question: `Who are the key figures or leaders in ${topic}?`,
            answer: `Important figures or leaders in ${topic}`
          };
        } else if (points === 400) {
          return {
            question: `Who made significant contributions to ${topic}?`,
            answer: `People who contributed significantly to ${topic}`
          };
        } else {
          return {
            question: `Who are the experts or specialists in ${topic}?`,
            answer: `Renowned experts or specialists in ${topic}`
          };
        }
        
      case 'details':
        if (points === 100) {
          return {
            question: `What is a specific detail or feature of ${topic}?`,
            answer: `A specific detail about ${topic}`
          };
        } else if (points === 200) {
          return {
            question: `What are the main characteristics of ${topic}?`,
            answer: `Key characteristics of ${topic}`
          };
        } else if (points === 300) {
          return {
            question: `What specific elements make up ${topic}?`,
            answer: `The component elements of ${topic}`
          };
        } else if (points === 400) {
          return {
            question: `What are the intricate details that define ${topic}?`,
            answer: `Complex details that define ${topic}`
          };
        } else {
          return {
            question: `What are the most nuanced aspects of ${topic}?`,
            answer: `The most subtle and nuanced aspects of ${topic}`
          };
        }
        
      case 'advanced':
        if (points === 100) {
          return {
            question: `What is an important concept related to ${topic}?`,
            answer: `An important concept in ${topic}`
          };
        } else if (points === 200) {
          return {
            question: `What theory or framework applies to ${topic}?`,
            answer: `A theoretical framework for ${topic}`
          };
        } else if (points === 300) {
          return {
            question: `What are the advanced principles of ${topic}?`,
            answer: `Advanced principles underlying ${topic}`
          };
        } else if (points === 400) {
          return {
            question: `What is the deeper meaning or significance of ${topic}?`,
            answer: `The deeper significance and meaning of ${topic}`
          };
        } else {
          return {
            question: `What are the most sophisticated concepts within ${topic}?`,
            answer: `The most advanced and sophisticated concepts in ${topic}`
          };
        }
        
      default:
        return {
          question: `What is an important aspect of ${topic}?`,
          answer: `An important aspect of ${topic}`
        };
    }
  };
  
  // Generate categories and questions
  const categories: Record<string, any[]> = {};
  
  // Shuffle category templates for variety
  const shuffledCategories = [...categoryTemplates].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < 6; i++) {
    const catTemplate = shuffledCategories[i];
    const categoryName = `${catTemplate.name} of ${topic}`;
    const questions: any[] = [];
    
    // Generate 5 questions for this category (100, 200, 300, 400, 500 points)
    for (let j = 0; j < 5; j++) {
      const points = [100, 200, 300, 400, 500][j];
      const { question, answer } = generateQuestion(catTemplate.type, points, topic);
      
      questions.push({
        question,
        answer,
        points,
      });
    }
    
    categories[categoryName] = questions;
  }
  
  return {
    icon,
    color,
    categories,
  };
}

/**
 * Generate icon SVG (client-side version of /api/icon)
 */
export function generateIconSVG(size: string = '192'): string {
  const viewBox = size === '512' ? '0 0 512 512' : '0 0 192 192';
  const fontSize = size === '512' ? '320' : '120';
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
    <rect width="${size}" height="${size}" fill="#0a0a1a"/>
    <text x="50%" y="50%" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle" fill="#00ffff">🏠</text>
  </svg>`;
}

/**
 * Teams API client-side functions
 * These use Supabase directly from the client
 */
import { supabase, isSupabaseConfigured } from './supabase';

export interface Team {
  id: string;
  name: string;
  code: string;
  adminId: string;
  adminName: string;
  members: any[];
  createdAt: string;
  description?: string;
}

// Fallback in-memory storage (only used if Supabase is not configured)
let teamsStorage: Team[] = [];

async function getTeamsFromDB(): Promise<Team[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase query error:', error);
        console.error('   Error code:', error.code);
        console.error('   Error message:', error.message);
        console.error('   Error details:', error.details);
        throw error;
      }
      
      console.log(`📊 Raw Supabase response: ${data?.length || 0} teams found`);
      if (data && data.length > 0) {
        console.log('   Team IDs:', data.map((t: any) => t.id));
      }
      
      return (data || []).map((team: any) => ({
        id: team.id,
        name: team.name,
        code: team.code,
        adminId: team.admin_id,
        adminName: team.admin_name,
        members: team.members || [],
        createdAt: team.created_at,
        description: team.description,
      }));
    } catch (error: any) {
      console.error('❌ Supabase error getting teams:', error);
      if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('policy')) {
        console.error('⚠️  RLS Policy Error: Row Level Security might be blocking access.');
        console.error('   Make sure the "Allow all operations" policy exists in Supabase.');
      }
      return [];
    }
  }
  return teamsStorage;
}

async function saveTeamToDB(team: Team): Promise<Team> {
  console.log('🔍 saveTeamToDB called with team:', team.id, team.name);
  console.log('   isSupabaseConfigured():', isSupabaseConfigured());
  console.log('   supabase client exists:', !!supabase);
  
  if (isSupabaseConfigured() && supabase) {
    try {
      console.log('💾 Saving team to Supabase:', team.id, team.name);
      console.log('   Team data to save:', {
        id: team.id,
        name: team.name,
        code: team.code,
        admin_id: team.adminId,
        admin_name: team.adminName,
        members: team.members,
        description: team.description,
        created_at: team.createdAt,
      });
      
      // Use upsert instead of insert to handle duplicates gracefully
      const { data, error } = await supabase
        .from('teams')
        .upsert([{
          id: team.id,
          name: team.name,
          code: team.code,
          admin_id: team.adminId,
          admin_name: team.adminName,
          members: team.members,
          description: team.description,
          created_at: team.createdAt,
        }], {
          onConflict: 'id'
        })
        .select()
        .single();
      
      console.log('   Supabase response - data:', data);
      console.log('   Supabase response - error:', error);
      
      if (error) {
        console.error('❌ Supabase insert error:', error);
        console.error('   Error code:', error.code);
        console.error('   Error message:', error.message);
        console.error('   Error details:', error.details);
        console.error('   Error hint:', error.hint);
        if (error.code === '23505') {
          console.warn('   ⚠️  Duplicate key - team might already exist');
        }
        if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('policy')) {
          console.error('   ⚠️  RLS Policy Error: Row Level Security might be blocking insert.');
          console.error('   Make sure the "Allow all operations" policy exists in Supabase.');
        }
        throw error;
      }
      
      if (!data) {
        console.error('❌ Supabase returned no data after upsert');
        throw new Error('No data returned from Supabase after upsert');
      }
      
      console.log('✅ Team saved to Supabase successfully:', data.id);
      return {
        id: data.id,
        name: data.name,
        code: data.code,
        adminId: data.admin_id,
        adminName: data.admin_name,
        members: data.members || [],
        createdAt: data.created_at,
        description: data.description,
      };
    } catch (error: any) {
      console.error('❌ Supabase error saving team:', error);
      console.error('   Error type:', typeof error);
      console.error('   Error constructor:', error?.constructor?.name);
      if (error?.message) {
        console.error('   Error message:', error.message);
      }
      throw error;
    }
  } else {
    console.warn('⚠️ Supabase not configured or client not available - saving to local storage only');
    teamsStorage.push(team);
    return team;
  }
}

async function updateTeamInDB(teamId: string, updates: Partial<Team>): Promise<Team | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.members !== undefined) updateData.members = updates.members;
      if (updates.description !== undefined) updateData.description = updates.description;
      
      const { data, error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', teamId)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        code: data.code,
        adminId: data.admin_id,
        adminName: data.admin_name,
        members: data.members || [],
        createdAt: data.created_at,
        description: data.description,
      };
    } catch (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  }
  const index = teamsStorage.findIndex(t => t.id === teamId);
  if (index === -1) return null;
  teamsStorage[index] = { ...teamsStorage[index], ...updates };
  return teamsStorage[index];
}

async function deleteTeamFromDB(teamId: string): Promise<boolean> {
  // Log all team deletions to track what's deleting teams
  console.log(`🗑️ deleteTeamFromDB called for team: ${teamId}`);
  console.trace('Stack trace for team deletion:'); // This will show where the deletion was called from
  
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      
      if (error) {
        console.error('❌ Supabase delete error:', error);
        throw error;
      }
      console.log(`✅ Team ${teamId} deleted from Supabase`);
      return true;
    } catch (error) {
      console.error('❌ Supabase error deleting team:', error);
      return false;
    }
  }
  teamsStorage = teamsStorage.filter(t => t.id !== teamId);
  console.log(`✅ Team ${teamId} deleted from local storage`);
  return true;
}

// Track user activity for auto-delete feature
const USER_ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes of inactivity = offline

function updateUserActivity(userId: string): void {
  if (typeof window === 'undefined') return;
  const activityKey = `user_activity_${userId}`;
  localStorage.setItem(activityKey, Date.now().toString());
}

function isUserOnline(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  const activityKey = `user_activity_${userId}`;
  const lastActivity = localStorage.getItem(activityKey);
  if (!lastActivity) return false;
  
  const lastActivityTime = parseInt(lastActivity, 10);
  const now = Date.now();
  return (now - lastActivityTime) < USER_ACTIVITY_TIMEOUT;
}

async function cleanupInactiveTeams(): Promise<void> {
  // DISABLED: This function uses localStorage to check if users are online,
  // but localStorage is device-specific. When checking from another device,
  // it can't see the activity from the original device, causing teams to be
  // incorrectly deleted. This breaks cross-device multiplayer functionality.
  // 
  // TODO: Implement proper cross-device activity tracking using Supabase
  // before re-enabling this feature.
  
  console.log('⚠️ cleanupInactiveTeams is disabled to prevent incorrect team deletion');
  return;
  
  /* DISABLED CODE - DO NOT USE
  try {
    // Get teams directly without circular import
    const teams = await getTeamsFromDB();
    
    if (!Array.isArray(teams)) {
      return;
    }

    const teamsToDelete: string[] = [];

    for (const team of teams) {
      // Check if admin is online
      const adminOnline = isUserOnline(team.adminId);
      
      // Check if any members are online
      const membersOnline = team.members.some((member: any) => 
        isUserOnline(member.id)
      );

      // Delete team if admin is offline AND no members are online
      if (!adminOnline && !membersOnline) {
        teamsToDelete.push(team.id);
      }
    }

    // Delete inactive teams
    for (const teamId of teamsToDelete) {
      try {
        await deleteTeamFromDB(teamId);
        console.log(`Auto-deleted inactive team: ${teamId}`);
        
        // Also remove from localStorage
        if (typeof window !== 'undefined') {
          const localTeams = JSON.parse(localStorage.getItem("teams") || "[]");
          const filteredTeams = localTeams.filter((t: Team) => t.id !== teamId);
          localStorage.setItem("teams", JSON.stringify(filteredTeams));
        }
      } catch (error) {
        console.error(`Error deleting team ${teamId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error cleaning up inactive teams:', error);
  }
  */
}

export const teamsAPI = {
  async getTeams(): Promise<{ success: boolean; teams: Team[] }> {
    try {
      const teams = await getTeamsFromDB();
      return { success: true, teams };
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      return { success: false, teams: [] };
    }
  },
  
  async createTeam(team: Team): Promise<{ success: boolean; team?: Team; error?: string }> {
    try {
      const savedTeam = await saveTeamToDB(team);
      // Mark admin as active when creating team
      updateUserActivity(team.adminId);
      return { success: true, team: savedTeam };
    } catch (error: any) {
      console.error('Error creating team:', error);
      return { success: false, error: error.message || 'Failed to create team' };
    }
  },
  
  async updateTeam(teamId: string, updates: Partial<Team>): Promise<{ success: boolean; team?: Team; error?: string }> {
    try {
      const updatedTeam = await updateTeamInDB(teamId, updates);
      if (!updatedTeam) {
        return { success: false, error: 'Team not found' };
      }
      
      // Mark admin and members as active when team is updated
      updateUserActivity(updatedTeam.adminId);
      if (updatedTeam.members) {
        updatedTeam.members.forEach((member: any) => {
          updateUserActivity(member.id);
        });
      }
      
      return { success: true, team: updatedTeam };
    } catch (error: any) {
      console.error('Error updating team:', error);
      return { success: false, error: error.message || 'Failed to update team' };
    }
  },
  
  async deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const deleted = await deleteTeamFromDB(teamId);
      return { success: deleted };
    } catch (error: any) {
      console.error('Error deleting team:', error);
      return { success: false, error: error.message || 'Failed to delete team' };
    }
  },

  // Update user activity (call this periodically to keep user "online")
  updateUserActivity,

  // Check if user is online
  isUserOnline,

  // Clean up inactive teams
  cleanupInactiveTeams,
};

/**
 * Game State API for multiplayer synchronization
 * Stores game state in Supabase for real-time cross-device sync
 */
export interface GameState {
  id: string; // gameId (e.g., "codenames_team123")
  gameType: string; // "codenames", "drawguess", "taboo", etc.
  teamId?: string; // Optional team ID if game is team-based
  state: any; // Game-specific state object
  lastUpdated: string; // ISO timestamp
  updatedBy: string; // User ID who last updated
}

async function getGameStateFromDB(gameId: string): Promise<GameState | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('game_states')
        .select('*')
        .eq('id', gameId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        gameType: data.game_type,
        teamId: data.team_id,
        state: data.state,
        lastUpdated: data.last_updated,
        updatedBy: data.updated_by,
      };
    } catch (error) {
      console.error('Supabase error getting game state:', error);
      return null;
    }
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const localState = localStorage.getItem(`game_state_${gameId}`);
    if (localState) {
      try {
        return JSON.parse(localState);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

async function saveGameStateToDB(gameState: GameState): Promise<GameState> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('game_states')
        .upsert([{
          id: gameState.id,
          game_type: gameState.gameType,
          team_id: gameState.teamId,
          state: gameState.state,
          last_updated: new Date().toISOString(),
          updated_by: gameState.updatedBy,
        }], {
          onConflict: 'id'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        gameType: data.game_type,
        teamId: data.team_id,
        state: data.state,
        lastUpdated: data.last_updated,
        updatedBy: data.updated_by,
      };
    } catch (error) {
      console.error('Supabase error saving game state:', error);
      throw error;
    }
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(`game_state_${gameState.id}`, JSON.stringify(gameState));
  }
  return gameState;
}

async function deleteGameStateFromDB(gameId: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('game_states')
        .delete()
        .eq('id', gameId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Supabase error deleting game state:', error);
      return false;
    }
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`game_state_${gameId}`);
  }
  return true;
}

export const gameStateAPI = {
  /**
   * Get game state by game ID
   */
  async getGameState(gameId: string): Promise<{ success: boolean; state?: GameState }> {
    try {
      const state = await getGameStateFromDB(gameId);
      if (!state) {
        return { success: false };
      }
      return { success: true, state };
    } catch (error: any) {
      console.error('Error fetching game state:', error);
      return { success: false };
    }
  },
  
  /**
   * Save or update game state
   */
  async saveGameState(gameState: GameState): Promise<{ success: boolean; state?: GameState; error?: string }> {
    try {
      const savedState = await saveGameStateToDB({
        ...gameState,
        lastUpdated: new Date().toISOString(),
      });
      return { success: true, state: savedState };
    } catch (error: any) {
      console.error('Error saving game state:', error);
      return { success: false, error: error.message || 'Failed to save game state' };
    }
  },
  
  /**
   * Delete game state
   */
  async deleteGameState(gameId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const deleted = await deleteGameStateFromDB(gameId);
      return { success: deleted };
    } catch (error: any) {
      console.error('Error deleting game state:', error);
      return { success: false, error: error.message || 'Failed to delete game state' };
    }
  },
  
  /**
   * Create a game ID from team ID and game type
   */
  createGameId(teamId: string | null, gameType: string): string {
    if (teamId) {
      return `${gameType}_${teamId}`;
    }
    // For games without teams, use user ID
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('currentUser');
      if (user) {
        try {
          const userData = JSON.parse(user);
          return `${gameType}_${userData.id}`;
        } catch (e) {
          return `${gameType}_${Date.now()}`;
        }
      }
    }
    return `${gameType}_${Date.now()}`;
  },
};

