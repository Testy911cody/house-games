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

// Track if Supabase is unreachable to avoid spamming errors
let supabaseUnreachable = false;
let lastUnreachableCheck = 0;
const UNREACHABLE_CHECK_INTERVAL = 60000; // Check again after 1 minute

function isNetworkError(error: any): boolean {
  const errorMsg = error?.message || error?.toString() || '';
  return errorMsg.includes('ERR_NAME_NOT_RESOLVED') ||
         errorMsg.includes('Failed to fetch') ||
         errorMsg.includes('NetworkError') ||
         errorMsg.includes('Network request failed') ||
         errorMsg.includes('ERR_INTERNET_DISCONNECTED') ||
         errorMsg.includes('ERR_CONNECTION_REFUSED') ||
         errorMsg.includes('ERR_CONNECTION_TIMED_OUT');
}

export interface Team {
  id: string;
  name: string;
  code: string;
  adminId: string;
  adminName: string;
  members: any[];
  createdAt: string;
  description?: string;
  lastGameAccess?: string; // ISO timestamp of last game access
}

// Fallback in-memory storage (only used if Supabase is not configured)
let teamsStorage: Team[] = [];

async function getTeamFromDB(teamId: string): Promise<Team | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();
      
      if (error || !data) return null;
      
      return {
        id: data.id,
        name: data.name,
        code: data.code,
        adminId: data.admin_id,
        adminName: data.admin_name,
        members: data.members || [],
        createdAt: data.created_at,
        description: data.description,
        lastGameAccess: data.last_game_access || null,
      };
    } catch (error) {
      console.error('Error getting team from DB:', error);
      return null;
    }
  }
  
  // Fallback to local storage
  return teamsStorage.find(t => t.id === teamId) || null;
}

async function getTeamsFromDB(): Promise<Team[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      console.log('🔍 Querying Supabase for all teams...');
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase query error:', error);
        console.error('   Error code:', error.code);
        console.error('   Error message:', error.message);
        console.error('   Error details:', error.details);
        console.error('   Error hint:', error.hint);
        throw error;
      }
      
      console.log(`📊 Raw Supabase response: ${data?.length || 0} teams found`);
      if (data && data.length > 0) {
        console.log('   Team IDs:', data.map((t: any) => t.id));
        console.log('   Team names:', data.map((t: any) => t.name));
        console.log('   Team details:', data.map((t: any) => ({
          id: t.id,
          name: t.name,
          admin_id: t.admin_id,
          admin_name: t.admin_name,
          members_count: t.members?.length || 0,
          created_at: t.created_at,
          last_game_access: t.last_game_access
        })));
      } else {
        console.warn('⚠️  No teams found in Supabase. This could mean:');
        console.warn('   1. No teams have been created yet');
        console.warn('   2. Teams are being created but not saved to Supabase');
        console.warn('   3. RLS policies are blocking access');
      }
      
      const mappedTeams = (data || []).map((team: any) => ({
        id: team.id,
        name: team.name,
        code: team.code,
        adminId: team.admin_id,
        adminName: team.admin_name,
        members: team.members || [],
        createdAt: team.created_at,
        description: team.description,
        lastGameAccess: team.last_game_access || null,
      }));
      
      // Filter out empty teams (teams with no members should not be shown)
      const nonEmptyTeams = mappedTeams.filter(team => team.members && team.members.length > 0);
      
      console.log(`✅ Successfully mapped ${mappedTeams.length} teams from Supabase (${nonEmptyTeams.length} non-empty)`);
      return nonEmptyTeams;
    } catch (error: any) {
      console.error('❌ Supabase error getting teams:', error);
      if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('policy')) {
        console.error('⚠️  RLS Policy Error: Row Level Security might be blocking access.');
        console.error('   Make sure the "Allow all operations" policy exists in Supabase.');
        console.error('   Check your Supabase dashboard -> Authentication -> Policies');
      }
      return [];
    }
  }
  console.log('⚠️  Supabase not configured, returning local storage teams');
  // Filter out empty teams
  return teamsStorage.filter(team => team.members && team.members.length > 0);
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
      
      // Build insert data object, conditionally including last_game_access
      // (in case the column doesn't exist in the database yet)
      const insertData: any = {
        id: team.id,
        name: team.name,
        code: team.code,
        admin_id: team.adminId,
        admin_name: team.adminName,
        members: team.members,
        description: team.description,
        created_at: team.createdAt,
      };
      
      // Only include last_game_access if it's defined (and column exists)
      // We'll try with it first, and if it fails, retry without it
      if (team.lastGameAccess !== undefined) {
        insertData.last_game_access = team.lastGameAccess;
      }
      
      // Use insert with onConflict to handle duplicates gracefully
      // This avoids the 400 error from upsert's onConflict option
      let { data, error } = await supabase
        .from('teams')
        .insert(insertData)
        .select()
        .single();
      
      // If error is about missing column, retry without last_game_access
      if (error && error.message?.includes('last_game_access') && error.message?.includes('schema cache')) {
        console.warn('⚠️  last_game_access column not found, retrying without it...');
        console.warn('   Run SUPABASE_ADD_LAST_GAME_ACCESS.sql in your Supabase SQL editor to add this column');
        delete insertData.last_game_access;
        const retryResult = await supabase
          .from('teams')
          .insert(insertData)
          .select()
          .single();
        data = retryResult.data;
        error = retryResult.error;
      }
      
      // If insert fails due to conflict, try update instead
      if (error && (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('conflict'))) {
        console.log('   Team exists (duplicate key), updating instead...');
        
        // Build update data object
        const updateDataObj: any = {
          name: team.name,
          code: team.code,
          admin_id: team.adminId,
          admin_name: team.adminName,
          members: team.members,
          description: team.description,
          created_at: team.createdAt,
        };
        
        // Only include last_game_access if it's defined
        if (team.lastGameAccess !== undefined) {
          updateDataObj.last_game_access = team.lastGameAccess;
        }
        
        let { data: updateData, error: updateError } = await supabase
          .from('teams')
          .update(updateDataObj)
          .eq('id', team.id)
          .select()
          .single();
        
        // If error is about missing column, retry without last_game_access
        if (updateError && updateError.message?.includes('last_game_access') && updateError.message?.includes('schema cache')) {
          console.warn('⚠️  last_game_access column not found in update, retrying without it...');
          delete updateDataObj.last_game_access;
          const retryUpdate = await supabase
            .from('teams')
            .update(updateDataObj)
            .eq('id', team.id)
            .select()
            .single();
          updateData = retryUpdate.data;
          updateError = retryUpdate.error;
        }
        
        if (updateError) {
          console.error('❌ Supabase update error:', updateError);
          throw updateError;
        }
        
        if (!updateData) {
          console.error('❌ Supabase returned no data after update');
          throw new Error('No data returned from Supabase after update');
        }
        
        console.log('✅ Team updated in Supabase successfully:', updateData.id);
        console.log('   Verifying team is accessible...');
        
        // Verify the team can be retrieved (to ensure it's visible to other devices)
        const { data: verifyData, error: verifyError } = await supabase
          .from('teams')
          .select('id')
          .eq('id', team.id)
          .single();
        
        if (verifyError || !verifyData) {
          console.warn('⚠️  Warning: Team was updated but could not be verified. It may not be visible to other devices.');
        } else {
          console.log('✅ Team verified - should be visible to other devices');
        }
        
        return {
          id: updateData.id,
          name: updateData.name,
          code: updateData.code,
          adminId: updateData.admin_id,
          adminName: updateData.admin_name,
          members: updateData.members || [],
          createdAt: updateData.created_at,
          description: updateData.description,
          lastGameAccess: updateData.last_game_access || null,
        };
      }
      
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
        console.error('❌ Supabase returned no data after insert');
        throw new Error('No data returned from Supabase after insert');
      }
      
      console.log('✅ Team saved to Supabase successfully:', data.id);
      console.log('   Verifying team is accessible...');
      
      // Verify the team can be retrieved (to ensure it's visible to other devices)
      const { data: verifyData, error: verifyError } = await supabase
        .from('teams')
        .select('id')
        .eq('id', team.id)
        .single();
      
      if (verifyError || !verifyData) {
        console.warn('⚠️  Warning: Team was saved but could not be verified. It may not be visible to other devices.');
        console.warn('   This could indicate an RLS policy issue. Check your Supabase policies.');
      } else {
        console.log('✅ Team verified - should be visible to other devices');
      }
      
      return {
        id: data.id,
        name: data.name,
        code: data.code,
        adminId: data.admin_id,
        adminName: data.admin_name,
        members: data.members || [],
        createdAt: data.created_at,
        description: data.description,
        lastGameAccess: data.last_game_access || null,
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
      if (updates.lastGameAccess !== undefined) updateData.last_game_access = updates.lastGameAccess;
      
      let { data, error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', teamId)
        .select()
        .single();
      
      // If error is about missing column, retry without last_game_access
      if (error && error.message?.includes('last_game_access') && error.message?.includes('schema cache')) {
        console.warn('⚠️  last_game_access column not found in updateTeamInDB, retrying without it...');
        console.warn('   Run SUPABASE_ADD_LAST_GAME_ACCESS.sql in your Supabase SQL editor to add this column');
        delete updateData.last_game_access;
        const retryResult = await supabase
          .from('teams')
          .update(updateData)
          .eq('id', teamId)
          .select()
          .single();
        data = retryResult.data;
        error = retryResult.error;
      }
      
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
        lastGameAccess: data.last_game_access || null,
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

/**
 * Update team's last game access timestamp
 */
async function updateTeamGameAccess(teamId: string): Promise<void> {
  try {
    const teams = await getTeamsFromDB();
    const team = teams.find(t => t.id === teamId);
    
    if (team) {
      const updatedTeam: Team = {
        ...team,
        lastGameAccess: new Date().toISOString(),
      };
      await saveTeamToDB(updatedTeam);
    }
  } catch (error) {
    console.error('Error updating team game access:', error);
  }
}

async function getAllTeamsForCleanup(): Promise<Team[]> {
  // Get ALL teams from database (including empty ones) for cleanup
  // This is separate from getTeamsFromDB to avoid circular dependency
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        // Check if it's a network error
        if (isNetworkError(error)) {
          const now = Date.now();
          supabaseUnreachable = true;
          lastUnreachableCheck = now;
          if ((now - lastUnreachableCheck) >= UNREACHABLE_CHECK_INTERVAL) {
            console.warn('⚠️ Supabase unreachable. Skipping team cleanup.');
          }
          return [];
        }
        console.error('❌ Supabase query error during cleanup:', error);
        return [];
      }
      
      // Reset unreachable flag on success
      supabaseUnreachable = false;
      
      return (data || []).map((team: any) => ({
        id: team.id,
        name: team.name,
        code: team.code,
        adminId: team.admin_id,
        adminName: team.admin_name,
        members: team.members || [],
        createdAt: team.created_at,
        description: team.description,
        lastGameAccess: team.last_game_access || null,
      }));
    } catch (error: any) {
      // Check if it's a network error
      if (isNetworkError(error)) {
        const now = Date.now();
        supabaseUnreachable = true;
        lastUnreachableCheck = now;
        if ((now - lastUnreachableCheck) >= UNREACHABLE_CHECK_INTERVAL) {
          console.warn('⚠️ Supabase unreachable. Skipping team cleanup.');
        }
        return [];
      }
      console.error('Error fetching teams for cleanup:', error);
      return [];
    }
  }
  
  return teamsStorage;
}

async function cleanupInactiveTeams(): Promise<void> {
  try {
    // Skip cleanup if Supabase is unreachable
    const now = Date.now();
    if (supabaseUnreachable && (now - lastUnreachableCheck) < UNREACHABLE_CHECK_INTERVAL) {
      return; // Silently skip, don't spam errors
    }
    
    console.log('🧹 Starting aggressive team cleanup...');
    // Get ALL teams from database (including empty ones) for cleanup
    const allTeams = await getAllTeamsForCleanup();
    
    if (!Array.isArray(allTeams)) {
      console.log('⚠️ No teams found or invalid response');
      return;
    }

    console.log(`📊 Found ${allTeams.length} teams to check for cleanup`);
    const teamsToDelete: string[] = [];
    // Reuse 'now' from above
    const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
    const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const THREE_HOURS = 3 * ONE_HOUR; // 3 hours - delete teams older than this even if created today
    
    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    for (const team of allTeams) {
      const teamCreatedAt = new Date(team.createdAt).getTime();
      const teamAge = now - teamCreatedAt;
      
      // Check if team was created on a different day (before today)
      const teamCreatedDate = new Date(teamCreatedAt);
      teamCreatedDate.setHours(0, 0, 0, 0);
      const isFromPreviousDay = teamCreatedDate.getTime() < todayStart;
      
      // Check if admin is online
      const adminOnline = isUserOnline(team.adminId);
      
      // Check if any members are online
      const membersOnline = team.members?.some((member: any) => 
        isUserOnline(member.id)
      ) || false;
      
      // Determine if team is active (admin or any member is online)
      const hasActiveUsers = adminOnline || membersOnline;
      
      let shouldDelete = false;
      let deleteReason = '';
      
      // PRIORITY 1: Delete ALL teams from previous days IMMEDIATELY (no exceptions)
      if (isFromPreviousDay) {
        shouldDelete = true;
        const daysOld = Math.floor(teamAge / ONE_DAY);
        deleteReason = `Team from previous day (${daysOld} day${daysOld !== 1 ? 's' : ''} old) - AGGRESSIVE CLEANUP`;
      }
      // PRIORITY 2: Delete empty teams (no members) immediately
      else if (!team.members || team.members.length === 0) {
        shouldDelete = true;
        deleteReason = `Empty team (no members)`;
      }
      // PRIORITY 3: Delete teams older than 3 hours even if created today (if no active users)
      else if (teamAge > THREE_HOURS && !hasActiveUsers) {
        shouldDelete = true;
        const hoursOld = Math.floor(teamAge / ONE_HOUR);
        deleteReason = `Team older than 3 hours with no active users (${hoursOld} hours old)`;
      }
      // PRIORITY 4: Delete teams immediately if no members are online (regardless of age)
      else if (!hasActiveUsers) {
        shouldDelete = true;
        const daysOld = Math.floor(teamAge / ONE_DAY);
        const hoursOld = Math.floor(teamAge / ONE_HOUR);
        if (daysOld > 0) {
          deleteReason = `No members online (${daysOld} days old)`;
        } else if (hoursOld > 0) {
          deleteReason = `No members online (${hoursOld} hours old)`;
        } else {
          deleteReason = `No members online`;
        }
      }
      
      if (shouldDelete) {
        teamsToDelete.push(team.id);
        console.log(`🗑️ Marking team for deletion: ${team.name} (ID: ${team.id}) - ${deleteReason}`);
      } else {
        console.log(`✓ Keeping team: ${team.name} (ID: ${team.id}) - has active users or is new`);
      }
    }

    console.log(`🗑️ Deleting ${teamsToDelete.length} team(s)...`);
    
    // Delete inactive teams from Supabase
    if (teamsToDelete.length > 0 && isSupabaseConfigured() && supabase) {
      try {
        // Delete all teams in batch for better performance
        const { error: batchError } = await supabase
          .from('teams')
          .delete()
          .in('id', teamsToDelete);
        
        if (batchError) {
          console.error('❌ Batch delete error, trying individual deletes:', batchError);
          // Fallback to individual deletes
          for (const teamId of teamsToDelete) {
            try {
              await deleteTeamFromDB(teamId);
            } catch (error) {
              console.error(`❌ Error deleting team ${teamId}:`, error);
            }
          }
        } else {
          console.log(`✅ Batch deleted ${teamsToDelete.length} team(s) from Supabase`);
        }
      } catch (error) {
        console.error('❌ Error in batch delete, trying individual:', error);
        // Fallback to individual deletes
        for (const teamId of teamsToDelete) {
          try {
            await deleteTeamFromDB(teamId);
          } catch (error) {
            console.error(`❌ Error deleting team ${teamId}:`, error);
          }
        }
      }
    } else {
      // Individual deletes for local storage or fallback
      for (const teamId of teamsToDelete) {
        try {
          await deleteTeamFromDB(teamId);
          console.log(`✅ Auto-deleted inactive team: ${teamId}`);
        } catch (error) {
          console.error(`❌ Error deleting team ${teamId}:`, error);
        }
      }
    }
    
    // Also remove from localStorage
    if (typeof window !== 'undefined' && teamsToDelete.length > 0) {
      const localTeams = JSON.parse(localStorage.getItem("teams") || "[]");
      const filteredTeams = localTeams.filter((t: Team) => !teamsToDelete.includes(t.id));
      localStorage.setItem("teams", JSON.stringify(filteredTeams));
      console.log(`🧹 Cleaned ${teamsToDelete.length} team(s) from localStorage`);
    }
    
    if (teamsToDelete.length > 0) {
      console.log(`✅ Cleanup complete: Deleted ${teamsToDelete.length} inactive team(s)`);
    } else {
      console.log(`✅ Cleanup complete: No inactive teams to delete`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up inactive teams:', error);
  }
}

export const teamsAPI = {
  async getTeams(): Promise<{ success: boolean; teams: Team[] }> {
    try {
      // Run cleanup first to remove old teams before fetching
      await cleanupInactiveTeams();
      
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
  
  async updateTeam(teamId: string, updates: Partial<Team>): Promise<{ success: boolean; team?: Team; deleted?: boolean; error?: string }> {
    try {
      // Get current team to check if admin is being changed
      const currentTeam = await getTeamFromDB(teamId);
      if (!currentTeam) {
        return { success: false, error: 'Team not found' };
      }
      
      // If adminId is being changed (admin is leaving), delete the team immediately
      if (updates.adminId !== undefined && updates.adminId !== currentTeam.adminId) {
        console.log(`🗑️ Deleting team ${currentTeam.name} because admin left (adminId changed)`);
        await deleteTeamFromDB(teamId);
        return { success: true, deleted: true };
      }
      
      const updatedTeam = await updateTeamInDB(teamId, updates);
      if (!updatedTeam) {
        return { success: false, error: 'Team not found' };
      }
      
      // If team has no members after update, delete it
      if (!updatedTeam.members || updatedTeam.members.length === 0) {
        console.log(`🗑️ Deleting empty team ${updatedTeam.name} after last member removed`);
        await deleteTeamFromDB(teamId);
        return { success: true, deleted: true };
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
  
  // Aggressive cleanup - delete all teams from previous days directly from Supabase
  async aggressiveCleanupTeams(): Promise<{ success: boolean; deleted: number; error?: string }> {
    try {
      if (isSupabaseConfigured() && supabase) {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();
        
        // Delete all teams created before today
        const { data, error } = await supabase
          .from('teams')
          .delete()
          .lt('created_at', todayISO)
          .select('id');
        
        if (error) {
          console.error('❌ Error in aggressive cleanup:', error);
          return { success: false, deleted: 0, error: error.message };
        }
        
        const deletedCount = data?.length || 0;
        console.log(`✅ Aggressive cleanup: Deleted ${deletedCount} team(s) from previous days`);
        
        // Also clean localStorage
        if (typeof window !== 'undefined') {
          const localTeams = JSON.parse(localStorage.getItem("teams") || "[]");
          const todayStart = today.getTime();
          const filteredTeams = localTeams.filter((t: Team) => {
            const teamCreatedDate = new Date(t.createdAt);
            teamCreatedDate.setHours(0, 0, 0, 0);
            return teamCreatedDate.getTime() >= todayStart;
          });
          localStorage.setItem("teams", JSON.stringify(filteredTeams));
        }
        
        return { success: true, deleted: deletedCount };
      }
      
      return { success: false, deleted: 0, error: 'Supabase not configured' };
    } catch (error: any) {
      console.error('❌ Error in aggressive cleanup:', error);
      return { success: false, deleted: 0, error: error.message };
    }
  },
  
  // Update team game access timestamp
  updateTeamGameAccess,
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
  deviceId?: string; // Device/session ID to track which device made the update (for multi-device sync)
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
        // Handle specific error codes gracefully
        if (error.code === 'PGRST116') return null; // Not found
        if ((error as any).status === 406 || (error as any).status === 409) {
          // RLS policy or conflict - return null instead of throwing
          console.warn('Supabase query blocked (RLS or conflict):', error.message);
          return null;
        }
        // Only throw for unexpected errors
        console.error('Supabase error getting game state:', error);
        return null;
      }
      
      if (!data) return null;
      
      // Extract deviceId from state metadata if present
      const stateWithDeviceId = data.state as any;
      const deviceId = stateWithDeviceId?._deviceId || stateWithDeviceId?.deviceId;
      
      // Remove deviceId from state before returning (clean state)
      const cleanState = { ...data.state };
      if (cleanState._deviceId) delete cleanState._deviceId;
      if (cleanState.deviceId && !stateWithDeviceId._deviceId) delete cleanState.deviceId;
      
      return {
        id: data.id,
        gameType: data.game_type,
        teamId: data.team_id,
        state: cleanState,
        lastUpdated: data.last_updated,
        updatedBy: data.updated_by,
        deviceId: deviceId,
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
      // Use insert with error handling for conflicts to avoid 400/409 errors
      const { data, error } = await supabase
        .from('game_states')
        .insert({
          id: gameState.id,
          game_type: gameState.gameType,
          team_id: gameState.teamId,
          state: gameState.deviceId ? { ...gameState.state, _deviceId: gameState.deviceId } : gameState.state,
          last_updated: new Date().toISOString(),
          updated_by: gameState.updatedBy,
        })
        .select()
        .single();
      
      // If insert fails due to conflict (duplicate key), try update instead
      // Check for various error indicators: error code, status code, or error message
      const isConflictError = error && (
        error.code === '23505' || // PostgreSQL duplicate key error
        error.code === 'PGRST301' || // PostgREST conflict
        (error as any).status === 409 || // HTTP 409 Conflict
        (error as any).statusCode === 409 || // HTTP 409 Conflict (alternative)
        error.message?.toLowerCase().includes('duplicate') ||
        error.message?.toLowerCase().includes('conflict') ||
        error.message?.toLowerCase().includes('already exists')
      );
      
      if (isConflictError) {
        // Game state already exists, update it instead
        const { data: updateData, error: updateError } = await supabase
          .from('game_states')
          .update({
            game_type: gameState.gameType,
            team_id: gameState.teamId,
            state: gameState.deviceId ? { ...gameState.state, _deviceId: gameState.deviceId } : gameState.state,
            last_updated: new Date().toISOString(),
            updated_by: gameState.updatedBy,
          })
          .eq('id', gameState.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('❌ Supabase update error after conflict:', updateError);
          throw updateError;
        }
        if (!updateData) {
          console.error('❌ No data returned from Supabase after update');
          throw new Error('No data returned from Supabase after update');
        }
        
        // Extract deviceId from state metadata if present
        const stateWithDeviceId = updateData.state as any;
        const deviceId = stateWithDeviceId?._deviceId || stateWithDeviceId?.deviceId;
        
        // Remove deviceId from state before returning (clean state)
        const cleanState = { ...updateData.state };
        if (cleanState._deviceId) delete cleanState._deviceId;
        if (cleanState.deviceId && !stateWithDeviceId._deviceId) delete cleanState.deviceId;
        
        return {
          id: updateData.id,
          gameType: updateData.game_type,
          teamId: updateData.team_id,
          state: cleanState,
          lastUpdated: updateData.last_updated,
          updatedBy: updateData.updated_by,
          deviceId: deviceId,
        };
      }
      
      if (error) {
        console.error('❌ Supabase insert error:', error);
        console.error('   Error code:', error.code);
        console.error('   Error message:', error.message);
        console.error('   Error status:', (error as any).status);
        throw error;
      }
      if (!data) {
        console.error('❌ No data returned from Supabase after insert');
        throw new Error('No data returned from Supabase after insert');
      }
      
      // Extract deviceId from state metadata if present
      const stateWithDeviceId = data.state as any;
      const deviceId = stateWithDeviceId?._deviceId || stateWithDeviceId?.deviceId;
      
      return {
        id: data.id,
        gameType: data.game_type,
        teamId: data.team_id,
        state: data.state,
        lastUpdated: data.last_updated,
        updatedBy: data.updated_by,
        deviceId: deviceId,
      };
    } catch (error) {
      console.error('❌ Supabase error saving game state:', error);
      throw error;
    }
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    // Store deviceId in state metadata for localStorage
    const stateWithDeviceId = {
      ...gameState.state,
      _deviceId: gameState.deviceId,
    };
    const gameStateWithDeviceId = {
      ...gameState,
      state: stateWithDeviceId,
    };
    localStorage.setItem(`game_state_${gameState.id}`, JSON.stringify(gameStateWithDeviceId));
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
  
  /**
   * Get all waiting games (games in "waiting" phase that need players)
   */
  async getWaitingGames(gameType?: string): Promise<{ success: boolean; games?: any[]; error?: string }> {
    try {
      if (isSupabaseConfigured() && supabase) {
        let query = supabase
          .from('game_states')
          .select('*')
          .order('last_updated', { ascending: false });
        
        if (gameType) {
          query = query.eq('game_type', gameType);
        }
        
        const { data, error } = await query;
        
        if (error) {
          // Handle RLS/conflict errors gracefully
          if ((error as any).status === 406 || (error as any).status === 409) {
            console.warn('Supabase query blocked (RLS or conflict) for waiting games:', error.message);
            return { success: true, games: [] };
          }
          throw error;
        }
        
        // Filter to only games in "waiting" phase
        const waitingGames = (data || [])
          .filter((game: any) => {
            try {
              const state = game.state;
              return state && state.phase === "waiting";
            } catch (e) {
              return false;
            }
          })
          .map((game: any) => ({
            id: game.id,
            gameType: game.game_type,
            teamId: game.team_id,
            state: game.state,
            lastUpdated: game.last_updated,
            updatedBy: game.updated_by,
          }));
        
        return { success: true, games: waitingGames };
      }
      
      // Fallback: return empty array
      return { success: true, games: [] };
    } catch (error: any) {
      console.error('Error fetching waiting games:', error);
      return { success: false, error: error.message || 'Failed to fetch waiting games' };
    }
  },
};

/**
 * Game Rooms API for multiplayer lobby system
 * Manages game rooms/lobbies where players can join before starting a game
 */

export interface GameRoomPlayer {
  id: string;
  name: string;
  team?: string;        // Team ID for team-based games
  isReady: boolean;
  isHost: boolean;
  joinedAt: string;
  lastActive?: string;  // Last time player was active (polling, actions, etc.)
}

export interface GameRoomTeam {
  id: string;
  name: string;
  color: string;
  players: { id: string; name: string }[];
}

export interface GameRoom {
  id: string;
  code: string;                  // 6-char room code (e.g., "ABC123")
  gameType: string;              // "codenames", "ludo", etc.
  hostId: string;                // User ID who created the room
  hostName: string;              // Display name of the host
  isPrivate: boolean;            // Private (code-only) vs public (visible in lobby)
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  minPlayers: number;
  currentPlayers: GameRoomPlayer[];
  settings: Record<string, any>; // Game-specific settings
  teamMode: boolean;             // Whether this is a team-based game
  teams: GameRoomTeam[];         // For team games
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
}

// Generate a random 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (I, O, 0, 1)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Fallback in-memory storage for rooms (only used if Supabase is not configured)
let roomsStorage: GameRoom[] = [];

async function getRoomFromDB(roomId: string): Promise<GameRoom | null> {
  if (isSupabaseConfigured() && supabase) {
    // Skip if Supabase is unreachable
    const now = Date.now();
    if (supabaseUnreachable && (now - lastUnreachableCheck) < UNREACHABLE_CHECK_INTERVAL) {
      return roomsStorage.find(r => r.id === roomId) || null; // Fallback to local
    }
    
    try {
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (error) {
        // Check for network errors
        if (isNetworkError(error)) {
          supabaseUnreachable = true;
          lastUnreachableCheck = now;
          return roomsStorage.find(r => r.id === roomId) || null; // Fallback to local
        }
        // Handle specific error codes gracefully
        if (error.code === 'PGRST116') return null; // Not found
        if ((error as any).status === 406 || (error as any).status === 409) {
          // RLS policy or conflict - return null instead of throwing
          console.warn('Supabase query blocked (RLS or conflict) for room:', error.message);
          return null;
        }
        // Only log unexpected errors, don't throw
        console.error('Supabase error getting room:', error);
        return null;
      }
      
      // Reset unreachable flag on success
      supabaseUnreachable = false;
      
      if (!data) return null;
      
      const room = mapDBRoomToGameRoom(data);
      
      // Update current user's activity if they're in the room (async, don't wait)
      if (typeof window !== 'undefined' && room) {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          try {
            const userData = JSON.parse(currentUser);
            const playerIndex = room.currentPlayers.findIndex(p => p.id === userData.id);
            if (playerIndex >= 0) {
              // Update activity timestamp for current user
              room.currentPlayers[playerIndex] = {
                ...room.currentPlayers[playerIndex],
                lastActive: new Date().toISOString(),
              };
              // Save updated activity (async, don't wait)
              saveRoomToDB(room).catch(err => console.error('Error updating player activity:', err));
            }
          } catch (e) {
            // Ignore errors
          }
        }
      }
      
      return room;
    } catch (error: any) {
      // Check for network errors
      if (isNetworkError(error)) {
        supabaseUnreachable = true;
        lastUnreachableCheck = Date.now();
        return roomsStorage.find(r => r.id === roomId) || null; // Fallback to local
      }
      console.error('Supabase error getting room:', error);
      return null;
    }
  }
  
  // Fallback to local storage
  return roomsStorage.find(r => r.id === roomId) || null;
}

async function getRoomByCodeFromDB(code: string): Promise<GameRoom | null> {
  if (isSupabaseConfigured() && supabase) {
    // Skip if Supabase is unreachable
    const now = Date.now();
    if (supabaseUnreachable && (now - lastUnreachableCheck) < UNREACHABLE_CHECK_INTERVAL) {
      return roomsStorage.find(r => r.code.toUpperCase() === code.toUpperCase()) || null;
    }
    
    try {
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();
      
      if (error) {
        // Check for network errors
        if (isNetworkError(error)) {
          supabaseUnreachable = true;
          lastUnreachableCheck = now;
          return roomsStorage.find(r => r.code.toUpperCase() === code.toUpperCase()) || null;
        }
        // Handle specific error codes gracefully
        if (error.code === 'PGRST116') return null; // Not found
        if ((error as any).status === 406 || (error as any).status === 409) {
          // RLS policy or conflict - return null instead of throwing
          console.warn('Supabase query blocked (RLS or conflict):', error.message);
          return null;
        }
        // Only log unexpected errors, don't throw
        console.error('Supabase error getting room by code:', error);
        return null;
      }
      
      // Reset unreachable flag on success
      supabaseUnreachable = false;
      
      if (!data) return null;
      
      const room = mapDBRoomToGameRoom(data);
      
      // Update current user's activity if they're in the room (async, don't wait)
      if (typeof window !== 'undefined' && room) {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          try {
            const userData = JSON.parse(currentUser);
            const playerIndex = room.currentPlayers.findIndex(p => p.id === userData.id);
            if (playerIndex >= 0) {
              // Update activity timestamp for current user
              room.currentPlayers[playerIndex] = {
                ...room.currentPlayers[playerIndex],
                lastActive: new Date().toISOString(),
              };
              // Save updated activity (async, don't wait)
              saveRoomToDB(room).catch(err => console.error('Error updating player activity:', err));
            }
          } catch (e) {
            // Ignore errors
          }
        }
      }
      
      return room;
    } catch (error: any) {
      // Check for network errors
      if (isNetworkError(error)) {
        supabaseUnreachable = true;
        lastUnreachableCheck = Date.now();
        return roomsStorage.find(r => r.code.toUpperCase() === code.toUpperCase()) || null;
      }
      console.error('Supabase error getting room by code:', error);
      return null;
    }
  }
  
  // Fallback to local storage
  return roomsStorage.find(r => r.code === code.toUpperCase()) || null;
}

async function getPublicRoomsFromDB(gameType?: string): Promise<GameRoom[]> {
  if (isSupabaseConfigured() && supabase) {
    // Skip if we recently detected Supabase is unreachable
    const now = Date.now();
    if (supabaseUnreachable && (now - lastUnreachableCheck) < UNREACHABLE_CHECK_INTERVAL) {
      return []; // Silently return empty, don't spam errors
    }
    
    try {
      let query = supabase
        .from('game_rooms')
        .select('*')
        .eq('is_private', false)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });
      
      if (gameType) {
        query = query.eq('game_type', gameType);
      }
      
      const { data, error } = await query;
      
      // Reset unreachable flag on success
      if (!error) {
        supabaseUnreachable = false;
      }
      
      if (error) {
        // Check if it's a network/unreachable error
        if (isNetworkError(error)) {
          supabaseUnreachable = true;
          lastUnreachableCheck = now;
          // Only log once per interval
          if ((now - lastUnreachableCheck) >= UNREACHABLE_CHECK_INTERVAL) {
            console.warn('⚠️ Supabase unreachable (network error). Will retry in 1 minute.');
          }
          return [];
        }
        
        // Handle RLS/conflict errors gracefully
        if ((error as any).status === 406 || (error as any).status === 409) {
          console.warn('Supabase query blocked (RLS or conflict) for public rooms:', error.message);
          return [];
        }
        // Log other errors but don't throw
        console.error('Supabase error getting public rooms:', error);
        return [];
      }
      
      // Filter out empty rooms and very old rooms aggressively
      const now2 = Date.now();
      const TEN_MINUTES = 10 * 60 * 1000;
      const rooms = (data || [])
        .map(mapDBRoomToGameRoom)
        .filter(room => {
          // Must have at least 1 player
          if (!room.currentPlayers || room.currentPlayers.length === 0) {
            return false;
          }
          // Filter out very old waiting rooms (older than 10 minutes)
          const createdAge = now2 - new Date(room.createdAt).getTime();
          if (room.status === 'waiting' && createdAge > TEN_MINUTES) {
            return false;
          }
          return true;
        });
      
      return rooms;
    } catch (error: any) {
      // Check if it's a network/unreachable error
      if (isNetworkError(error)) {
        supabaseUnreachable = true;
        lastUnreachableCheck = now;
        // Only log once per interval
        if ((now - lastUnreachableCheck) >= UNREACHABLE_CHECK_INTERVAL) {
          console.warn('⚠️ Supabase unreachable (network error). Will retry in 1 minute.');
        }
        return [];
      }
      console.error('Supabase error getting public rooms:', error);
      return [];
    }
  }
  
  // Fallback to local storage - filter out empty rooms and old rooms
  const now = Date.now();
  const TEN_MINUTES = 10 * 60 * 1000;
  let rooms = roomsStorage.filter(r => {
    if (r.isPrivate || r.status !== 'waiting') return false;
    if (!r.currentPlayers || r.currentPlayers.length === 0) return false;
    // Filter out old waiting rooms
    const createdAge = now - new Date(r.createdAt).getTime();
    if (createdAge > TEN_MINUTES) return false;
    return true;
  });
  if (gameType) {
    rooms = rooms.filter(r => r.gameType === gameType);
  }
  return rooms;
}

async function saveRoomToDB(room: GameRoom): Promise<GameRoom> {
  if (isSupabaseConfigured() && supabase) {
    // Skip if Supabase is unreachable - use local storage instead
    const now = Date.now();
    if (supabaseUnreachable && (now - lastUnreachableCheck) < UNREACHABLE_CHECK_INTERVAL) {
      // Fallback to local storage
      const index = roomsStorage.findIndex(r => r.id === room.id);
      if (index >= 0) {
        roomsStorage[index] = { ...room, updatedAt: new Date().toISOString() };
      } else {
        roomsStorage.push(room);
      }
      return room;
    }
    
    try {
      const dbRoom = {
        id: room.id,
        code: room.code,
        game_type: room.gameType,
        host_id: room.hostId,
        host_name: room.hostName,
        is_private: room.isPrivate,
        status: room.status,
        max_players: room.maxPlayers,
        min_players: room.minPlayers,
        current_players: room.currentPlayers,
        settings: room.settings,
        team_mode: room.teamMode,
        teams: room.teams,
        created_at: room.createdAt,
        updated_at: new Date().toISOString(),
        started_at: room.startedAt,
        finished_at: room.finishedAt,
      };
      
      // Try insert first
      let { data, error } = await supabase
        .from('game_rooms')
        .insert(dbRoom)
        .select()
        .single();
      
      // Check for network errors
      if (error && isNetworkError(error)) {
        supabaseUnreachable = true;
        lastUnreachableCheck = now;
        // Fallback to local storage
        const index = roomsStorage.findIndex(r => r.id === room.id);
        if (index >= 0) {
          roomsStorage[index] = { ...room, updatedAt: new Date().toISOString() };
        } else {
          roomsStorage.push(room);
        }
        return room;
      }
      
      // If conflict, update instead
      if (error && (error.code === '23505' || error.message?.includes('duplicate'))) {
        const { data: updateData, error: updateError } = await supabase
          .from('game_rooms')
          .update({
            ...dbRoom,
            id: undefined, // Don't update the ID
          })
          .eq('id', room.id)
          .select()
          .single();
        
        // Check for network errors on update
        if (updateError && isNetworkError(updateError)) {
          supabaseUnreachable = true;
          lastUnreachableCheck = now;
          const index = roomsStorage.findIndex(r => r.id === room.id);
          if (index >= 0) {
            roomsStorage[index] = { ...room, updatedAt: new Date().toISOString() };
          } else {
            roomsStorage.push(room);
          }
          return room;
        }
        
        if (updateError) throw updateError;
        data = updateData;
      } else if (error) {
        throw error;
      }
      
      if (!data) throw new Error('No data returned from Supabase');
      
      // Reset unreachable flag on success
      supabaseUnreachable = false;
      
      return mapDBRoomToGameRoom(data);
    } catch (error: any) {
      // Check for network errors
      if (isNetworkError(error)) {
        supabaseUnreachable = true;
        lastUnreachableCheck = Date.now();
        // Fallback to local storage
        const index = roomsStorage.findIndex(r => r.id === room.id);
        if (index >= 0) {
          roomsStorage[index] = { ...room, updatedAt: new Date().toISOString() };
        } else {
          roomsStorage.push(room);
        }
        return room;
      }
      console.error('Supabase error saving room:', error);
      throw error;
    }
  }
  
  // Fallback to local storage
  const index = roomsStorage.findIndex(r => r.id === room.id);
  if (index >= 0) {
    roomsStorage[index] = { ...room, updatedAt: new Date().toISOString() };
  } else {
    roomsStorage.push(room);
  }
  return room;
}

async function deleteRoomFromDB(roomId: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('game_rooms')
        .delete()
        .eq('id', roomId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Supabase error deleting room:', error);
      return false;
    }
  }
  
  // Fallback to local storage
  roomsStorage = roomsStorage.filter(r => r.id !== roomId);
  return true;
}

function mapDBRoomToGameRoom(dbRoom: any): GameRoom {
  return {
    id: dbRoom.id,
    code: dbRoom.code,
    gameType: dbRoom.game_type,
    hostId: dbRoom.host_id,
    hostName: dbRoom.host_name,
    isPrivate: dbRoom.is_private,
    status: dbRoom.status,
    maxPlayers: dbRoom.max_players,
    minPlayers: dbRoom.min_players,
    currentPlayers: dbRoom.current_players || [],
    settings: dbRoom.settings || {},
    teamMode: dbRoom.team_mode,
    teams: dbRoom.teams || [],
    createdAt: dbRoom.created_at,
    updatedAt: dbRoom.updated_at,
    startedAt: dbRoom.started_at,
    finishedAt: dbRoom.finished_at,
  };
}

export const gameRoomsAPI = {
  /**
   * Create a new game room
   */
  async createRoom(options: {
    gameType: string;
    hostId: string;
    hostName: string;
    isPrivate?: boolean;
    maxPlayers?: number;
    minPlayers?: number;
    settings?: Record<string, any>;
    teamMode?: boolean;
    teams?: GameRoomTeam[];
  }): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    try {
      // Check if user already has a room for this game type
      if (isSupabaseConfigured() && supabase) {
        const { data: existingRooms } = await supabase
          .from('game_rooms')
          .select('*')
          .eq('host_id', options.hostId)
          .eq('game_type', options.gameType)
          .in('status', ['waiting', 'playing']);
        
        if (existingRooms && existingRooms.length > 0) {
          // User already has a room - check if they're still in it
          for (const existingRoom of existingRooms) {
            const room = mapDBRoomToGameRoom(existingRoom);
            const isUserInRoom = room.currentPlayers.some(p => p.id === options.hostId);
            
            if (isUserInRoom) {
              // User is still in their existing room, return it instead of creating a new one
              console.log(`♻️ User ${options.hostId} already has room ${room.code}, returning existing room`);
              return { success: true, room };
            } else {
              // User left their room, delete it
              console.log(`🗑️ Deleting abandoned room ${room.code} for user ${options.hostId}`);
              await deleteRoomFromDB(room.id);
            }
          }
        }
      } else {
        // Local storage check
        const existingRoom = roomsStorage.find(r => 
          r.hostId === options.hostId && 
          r.gameType === options.gameType && 
          (r.status === 'waiting' || r.status === 'playing')
        );
        
        if (existingRoom) {
          const isUserInRoom = existingRoom.currentPlayers.some(p => p.id === options.hostId);
          if (isUserInRoom) {
            console.log(`♻️ User ${options.hostId} already has room ${existingRoom.code}, returning existing room`);
            return { success: true, room: existingRoom };
          } else {
            // Remove abandoned room
            roomsStorage = roomsStorage.filter(r => r.id !== existingRoom.id);
          }
        }
      }
      
      // Generate a unique room code
      let code = generateRoomCode();
      let attempts = 0;
      while (await getRoomByCodeFromDB(code) && attempts < 10) {
        code = generateRoomCode();
        attempts++;
      }
      
      const now = new Date().toISOString();
      const room: GameRoom = {
        id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        code,
        gameType: options.gameType,
        hostId: options.hostId,
        hostName: options.hostName,
        isPrivate: options.isPrivate ?? false,
        status: 'waiting',
        maxPlayers: options.maxPlayers ?? 4,
        minPlayers: options.minPlayers ?? 2,
        currentPlayers: [{
          id: options.hostId,
          name: options.hostName,
          isReady: true,
          isHost: true,
          joinedAt: now,
          lastActive: now,
        }],
        settings: options.settings ?? {},
        teamMode: options.teamMode ?? false,
        teams: options.teams ?? [],
        createdAt: now,
        updatedAt: now,
      };
      
      const savedRoom = await saveRoomToDB(room);
      return { success: true, room: savedRoom };
    } catch (error: any) {
      console.error('Error creating room:', error);
      return { success: false, error: error.message || 'Failed to create room' };
    }
  },
  
  /**
   * Join a room by code
   */
  async joinRoom(code: string, userId: string, userName: string): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    try {
      const room = await getRoomByCodeFromDB(code.toUpperCase());
      
      if (!room) {
        return { success: false, error: 'Room not found' };
      }
      
      if (room.status !== 'waiting') {
        return { success: false, error: 'Game has already started' };
      }
      
      if (room.currentPlayers.length >= room.maxPlayers) {
        return { success: false, error: 'Room is full' };
      }
      
      // Check if user is already in the room
      if (room.currentPlayers.some(p => p.id === userId)) {
        return { success: true, room }; // Already in room, return success
      }
      
      // Add player to room
      const now = new Date().toISOString();
      room.currentPlayers.push({
        id: userId,
        name: userName,
        isReady: false,
        isHost: false,
        joinedAt: now,
        lastActive: now,
      });
      
      const savedRoom = await saveRoomToDB(room);
      return { success: true, room: savedRoom };
    } catch (error: any) {
      console.error('Error joining room:', error);
      return { success: false, error: error.message || 'Failed to join room' };
    }
  },
  
  /**
   * Leave a room
   */
  async leaveRoom(roomId: string, userId: string): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    try {
      const room = await getRoomFromDB(roomId);
      
      if (!room) {
        return { success: false, error: 'Room not found' };
      }
      
      // Remove player from room
      room.currentPlayers = room.currentPlayers.filter(p => p.id !== userId);
      
      // Also remove from team if team mode
      if (room.teamMode && room.teams) {
        room.teams.forEach(team => {
          team.players = team.players.filter(p => p.id !== userId);
        });
        // Remove empty teams
        room.teams = room.teams.filter(team => team.players.length > 0);
      }
      
      // If the host left, delete the room immediately (don't assign new host)
      if (room.hostId === userId) {
        console.log(`🗑️ Deleting room ${room.code} because host left`);
        await deleteRoomFromDB(roomId);
        return { success: true };
      }
      
      // If room is empty, delete it immediately
      if (room.currentPlayers.length === 0) {
        console.log(`🗑️ Deleting empty room ${room.code} after last player left`);
        await deleteRoomFromDB(roomId);
        return { success: true };
      }
      
      const savedRoom = await saveRoomToDB(room);
      return { success: true, room: savedRoom };
    } catch (error: any) {
      console.error('Error leaving room:', error);
      return { success: false, error: error.message || 'Failed to leave room' };
    }
  },
  
  /**
   * Leave a room by code
   */
  async leaveRoomByCode(code: string, userId: string): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    try {
      const room = await getRoomByCodeFromDB(code);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }
      return this.leaveRoom(room.id, userId);
    } catch (error: any) {
      console.error('Error leaving room by code:', error);
      return { success: false, error: error.message || 'Failed to leave room' };
    }
  },
  
  /**
   * Update player info in room
   */
  async updatePlayer(roomId: string, userId: string, updates: Partial<GameRoomPlayer>): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    try {
      const room = await getRoomFromDB(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }
      
      const playerIndex = room.currentPlayers.findIndex(p => p.id === userId);
      if (playerIndex === -1) {
        return { success: false, error: 'Player not in room' };
      }
      
      // Update player (always update lastActive when player info changes)
      room.currentPlayers[playerIndex] = {
        ...room.currentPlayers[playerIndex],
        ...updates,
        lastActive: new Date().toISOString(), // Update activity on any player update
      };
      
      const savedRoom = await saveRoomToDB(room);
      return { success: true, room: savedRoom };
    } catch (error: any) {
      console.error('Error updating player:', error);
      return { success: false, error: error.message || 'Failed to update player' };
    }
  },
  
  /**
   * Get room by ID
   */
  async getRoom(roomId: string): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    try {
      const room = await getRoomFromDB(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }
      return { success: true, room };
    } catch (error: any) {
      console.error('Error getting room:', error);
      return { success: false, error: error.message || 'Failed to get room' };
    }
  },
  
  /**
   * Update player activity timestamp (called when player polls or interacts)
   */
  async updatePlayerActivity(roomId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const room = await getRoomFromDB(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }
      
      const playerIndex = room.currentPlayers.findIndex(p => p.id === userId);
      if (playerIndex >= 0) {
        room.currentPlayers[playerIndex] = {
          ...room.currentPlayers[playerIndex],
          lastActive: new Date().toISOString(),
        };
        await saveRoomToDB(room);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating player activity:', error);
      return { success: false, error: error.message || 'Failed to update player activity' };
    }
  },
  
  /**
   * Clean up inactive players from rooms (players inactive for more than 3 minutes)
   */
  async cleanupInactivePlayers(): Promise<{ success: boolean; cleaned: number; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { success: true, cleaned: 0 };
      }
      
      const { data: rooms, error } = await supabase
        .from('game_rooms')
        .select('*')
        .in('status', ['waiting', 'playing']);
      
      if (error) {
        console.error('Error fetching rooms for cleanup:', error);
        return { success: false, error: error.message, cleaned: 0 };
      }
      
      if (!rooms || rooms.length === 0) {
        return { success: true, cleaned: 0 };
      }
      
      const now = Date.now();
      const INACTIVE_THRESHOLD = 3 * 60 * 1000; // 3 minutes in milliseconds
      let totalCleaned = 0;
      
      for (const dbRoom of rooms) {
        try {
          const room = mapDBRoomToGameRoom(dbRoom);
          const activePlayers: GameRoomPlayer[] = [];
          let cleaned = 0;
          
          for (const player of room.currentPlayers) {
            const lastActive = player.lastActive ? new Date(player.lastActive).getTime() : new Date(player.joinedAt).getTime();
            const timeSinceActive = now - lastActive;
            
            // Keep player if:
            // 1. They've been active within the threshold, OR
            // 2. They're the host (don't auto-remove host)
            if (timeSinceActive < INACTIVE_THRESHOLD || player.isHost) {
              activePlayers.push(player);
            } else {
              cleaned++;
              console.log(`🧹 Removing inactive player ${player.name} (${player.id}) from room ${room.code} - inactive for ${Math.floor(timeSinceActive / 1000)}s`);
            }
          }
          
          if (cleaned > 0) {
            room.currentPlayers = activePlayers;
            
            // Clean up teams that have no active players
            if (room.teamMode && room.teams) {
              const activePlayerIds = new Set(activePlayers.map(p => p.id));
              room.teams = room.teams.map(team => ({
                ...team,
                players: team.players.filter(p => activePlayerIds.has(p.id))
              })).filter(team => team.players.length > 0); // Remove empty teams
            }
            
            // If host was removed and there are still players, assign new host
            if (room.currentPlayers.length > 0 && !room.currentPlayers.some(p => p.isHost)) {
              const newHost = room.currentPlayers[0];
              room.hostId = newHost.id;
              room.hostName = newHost.name;
              newHost.isHost = true;
            }
            
            // If room is empty, delete it
            if (room.currentPlayers.length === 0) {
              await deleteRoomFromDB(room.id);
              console.log(`🗑️ Deleted empty room ${room.code}`);
            } else {
              await saveRoomToDB(room);
            }
            
            totalCleaned += cleaned;
          }
        } catch (error) {
          console.error(`Error cleaning up room ${dbRoom.code}:`, error);
        }
      }
      
      if (totalCleaned > 0) {
        console.log(`✅ Cleaned up ${totalCleaned} inactive player(s) from ${rooms.length} room(s)`);
      }
      
      return { success: true, cleaned: totalCleaned };
    } catch (error: any) {
      console.error('Error cleaning up inactive players:', error);
      return { success: false, error: error.message || 'Failed to clean up inactive players', cleaned: 0 };
    }
  },
  
  /**
   * Get room by code
   */
  async getRoomByCode(code: string): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    try {
      const room = await getRoomByCodeFromDB(code);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }
      return { success: true, room };
    } catch (error: any) {
      console.error('Error getting room by code:', error);
      return { success: false, error: error.message || 'Failed to get room' };
    }
  },
  
  /**
   * Get all public rooms (optionally filtered by game type)
   */
  async getPublicRooms(gameType?: string): Promise<{ success: boolean; rooms: GameRoom[]; error?: string }> {
    try {
      const rooms = await getPublicRoomsFromDB(gameType);
      return { success: true, rooms };
    } catch (error: any) {
      console.error('Error getting public rooms:', error);
      return { success: false, rooms: [], error: error.message || 'Failed to get public rooms' };
    }
  },
  
  /**
   * Update room status
   */
  async updateRoomStatus(roomId: string, status: 'waiting' | 'playing' | 'finished'): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    try {
      const room = await getRoomFromDB(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }
      
      room.status = status;
      if (status === 'playing') {
        room.startedAt = new Date().toISOString();
      } else if (status === 'finished') {
        room.finishedAt = new Date().toISOString();
      }
      
      const savedRoom = await saveRoomToDB(room);
      return { success: true, room: savedRoom };
    } catch (error: any) {
      console.error('Error updating room status:', error);
      return { success: false, error: error.message || 'Failed to update room status' };
    }
  },
  
  /**
   * Set player ready status
   */
  async setPlayerReady(roomId: string, userId: string, isReady: boolean): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    try {
      const room = await getRoomFromDB(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }
      
      const player = room.currentPlayers.find(p => p.id === userId);
      if (!player) {
        return { success: false, error: 'Player not in room' };
      }
      
      player.isReady = isReady;
      player.lastActive = new Date().toISOString(); // Update activity on ready status change
      
      const savedRoom = await saveRoomToDB(room);
      return { success: true, room: savedRoom };
    } catch (error: any) {
      console.error('Error setting player ready:', error);
      return { success: false, error: error.message || 'Failed to set player ready' };
    }
  },
  
  /**
   * Assign player to a team (for team-based games)
   */
  async assignPlayerToTeam(roomId: string, userId: string, teamId: string): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    try {
      const room = await getRoomFromDB(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }
      
      const player = room.currentPlayers.find(p => p.id === userId);
      if (!player) {
        return { success: false, error: 'Player not in room' };
      }
      
      // Remove player from current team if any
      for (const team of room.teams) {
        team.players = team.players.filter(p => p.id !== userId);
      }
      
      // Add player to new team
      const team = room.teams.find(t => t.id === teamId);
      if (team) {
        team.players.push({ id: userId, name: player.name });
        player.team = teamId;
      }
      
      const savedRoom = await saveRoomToDB(room);
      return { success: true, room: savedRoom };
    } catch (error: any) {
      console.error('Error assigning player to team:', error);
      return { success: false, error: error.message || 'Failed to assign player to team' };
    }
  },
  
  /**
   * Update room settings
   */
  async updateRoomSettings(roomId: string, settings: Record<string, any>): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    try {
      const room = await getRoomFromDB(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }
      
      room.settings = { ...room.settings, ...settings };
      
      const savedRoom = await saveRoomToDB(room);
      return { success: true, room: savedRoom };
    } catch (error: any) {
      console.error('Error updating room settings:', error);
      return { success: false, error: error.message || 'Failed to update room settings' };
    }
  },
  
  /**
   * Quick match - join an available public room or create a new one
   * Checks for existing rooms first to prevent duplicates
   */
  async quickMatch(options: {
    gameType: string;
    userId: string;
    userName: string;
    maxPlayers?: number;
    minPlayers?: number;
    settings?: Record<string, any>;
  }): Promise<{ success: boolean; room?: GameRoom; isNew: boolean; error?: string }> {
    try {
      // First, check if user already has a room for this game type
      if (isSupabaseConfigured() && supabase) {
        const { data: existingRooms } = await supabase
          .from('game_rooms')
          .select('*')
          .eq('host_id', options.userId)
          .eq('game_type', options.gameType)
          .in('status', ['waiting', 'playing']);
        
        if (existingRooms && existingRooms.length > 0) {
          for (const existingRoom of existingRooms) {
            const room = mapDBRoomToGameRoom(existingRoom);
            const isUserInRoom = room.currentPlayers.some(p => p.id === options.userId);
            
            if (isUserInRoom) {
              // User is still in their existing room, return it
              console.log(`♻️ Quick match: User ${options.userId} already in room ${room.code}`);
              return { success: true, room, isNew: false };
            }
          }
        }
      }
      
      // Look for an available public room
      const publicRooms = await getPublicRoomsFromDB(options.gameType);
      
      // Find a room that's not full and user is not already in
      const availableRoom = publicRooms.find(r => 
        r.currentPlayers.length < r.maxPlayers &&
        !r.currentPlayers.some(p => p.id === options.userId)
      );
      
      if (availableRoom) {
        // Join existing room
        const result = await this.joinRoom(availableRoom.code, options.userId, options.userName);
        return { ...result, isNew: false };
      }
      
      // No available room, create a new one (createRoom will check for duplicates)
      const result = await this.createRoom({
        gameType: options.gameType,
        hostId: options.userId,
        hostName: options.userName,
        isPrivate: false,
        maxPlayers: options.maxPlayers,
        minPlayers: options.minPlayers,
        settings: options.settings,
      });
      
      return { ...result, isNew: true };
    } catch (error: any) {
      console.error('Error in quick match:', error);
      return { success: false, isNew: false, error: error.message || 'Failed to quick match' };
    }
  },
  
  /**
   * Delete a room
   */
  async deleteRoom(roomId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const deleted = await deleteRoomFromDB(roomId);
      return { success: deleted };
    } catch (error: any) {
      console.error('Error deleting room:', error);
      return { success: false, error: error.message || 'Failed to delete room' };
    }
  },
  
  /**
   * Clean up stale rooms (rooms that are empty, old, or abandoned)
   * More aggressive: deletes empty rooms immediately, old waiting rooms quickly
   */
  async cleanupStaleRooms(): Promise<void> {
    try {
      // Skip cleanup if Supabase is unreachable
      const now = Date.now();
      if (supabaseUnreachable && (now - lastUnreachableCheck) < UNREACHABLE_CHECK_INTERVAL) {
        return; // Silently skip, don't spam errors
      }
      
      console.log('🧹 Starting aggressive room cleanup...');
      if (isSupabaseConfigured() && supabase) {
        try {
          // Get all rooms to check
          const { data: allRooms, error: queryError } = await supabase
            .from('game_rooms')
            .select('id, code, current_players, status, created_at, finished_at, updated_at');
          
          // Check if it's a network error
          if (queryError && isNetworkError(queryError)) {
            supabaseUnreachable = true;
            lastUnreachableCheck = now;
            if ((now - lastUnreachableCheck) >= UNREACHABLE_CHECK_INTERVAL) {
              console.warn('⚠️ Supabase unreachable. Skipping cleanup.');
            }
            return;
          }
          
          if (queryError) {
            console.error('Error fetching rooms for cleanup:', queryError);
            return;
          }
        
        if (allRooms) {
          console.log(`📊 Found ${allRooms.length} rooms to check for cleanup`);
          const now = Date.now();
          const ONE_MINUTE = 60 * 1000;
          const FIVE_MINUTES = 5 * 60 * 1000;
          const ONE_HOUR = 60 * 60 * 1000;
          const ONE_DAY = 24 * 60 * 60 * 1000;
          
          // Get today's date at midnight for comparison
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayStart = today.getTime();
          
          const roomsToDelete: string[] = [];
          
          for (const room of allRooms) {
            let shouldDelete = false;
            const players = room.current_players || [];
            const playersArray = Array.isArray(players) ? players : [];
            const createdAge = now - new Date(room.created_at).getTime();
            const finishedAge = room.finished_at ? now - new Date(room.finished_at).getTime() : 0;
            const updatedAge = room.updated_at ? now - new Date(room.updated_at).getTime() : Infinity;
            
            // Check if room was created on a different day (before today)
            const roomCreatedDate = new Date(room.created_at);
            roomCreatedDate.setHours(0, 0, 0, 0);
            const isFromPreviousDay = roomCreatedDate.getTime() < todayStart;
            
            // PRIORITY 1: Delete ALL rooms from previous days IMMEDIATELY (no exceptions)
            if (isFromPreviousDay) {
              shouldDelete = true;
              const daysOld = Math.floor(createdAge / ONE_DAY);
              console.log(`🗑️ Deleting room ${room.code} from previous day (${daysOld} day${daysOld !== 1 ? 's' : ''} old) - AGGRESSIVE CLEANUP`);
            }
            // PRIORITY 2: Delete empty rooms immediately
            else if (playersArray.length === 0) {
              shouldDelete = true;
              console.log(`🗑️ Deleting empty room ${room.code} immediately`);
            }
            // PRIORITY 3: Delete finished rooms immediately (no need to keep them)
            else if (room.status === 'finished') {
              shouldDelete = true;
              console.log(`🗑️ Deleting finished room ${room.code} immediately`);
            }
            // PRIORITY 4: Delete waiting rooms with only 1 player after 1 minute (very aggressive)
            else if (room.status === 'waiting' && playersArray.length === 1 && createdAge > ONE_MINUTE) {
              shouldDelete = true;
              console.log(`🗑️ Deleting abandoned waiting room ${room.code} (1 player, ${Math.floor(createdAge / 60000)} min old)`);
            }
            // PRIORITY 5: Delete waiting rooms older than 10 minutes (even with multiple players if inactive)
            else if (room.status === 'waiting' && createdAge > 10 * ONE_MINUTE && updatedAge > 5 * ONE_MINUTE) {
              shouldDelete = true;
              console.log(`🗑️ Deleting inactive waiting room ${room.code} (${Math.floor(createdAge / 60000)} min old, no updates)`);
            }
            // PRIORITY 6: Delete rooms playing for more than 2 hours (likely abandoned)
            else if (room.status === 'playing' && createdAge > 2 * ONE_HOUR) {
              shouldDelete = true;
              console.log(`🗑️ Deleting abandoned playing room ${room.code} (${Math.floor(createdAge / ONE_HOUR)} hours old)`);
            }
            
            if (shouldDelete) {
              roomsToDelete.push(room.id);
            }
          }
          
          // Batch delete rooms for better performance
          if (roomsToDelete.length > 0) {
            console.log(`🗑️ Deleting ${roomsToDelete.length} room(s)...`);
            const { error: batchError } = await supabase
              .from('game_rooms')
              .delete()
              .in('id', roomsToDelete);
            
            if (batchError) {
              console.error('❌ Batch delete error, trying individual deletes:', batchError);
              // Fallback to individual deletes
              for (const roomId of roomsToDelete) {
                try {
                  await deleteRoomFromDB(roomId);
                } catch (error) {
                  console.error(`❌ Error deleting room ${roomId}:`, error);
                }
              }
            } else {
              console.log(`✅ Batch deleted ${roomsToDelete.length} room(s) from Supabase`);
            }
          } else {
            console.log(`✅ No rooms to delete`);
          }
        }
        
          // Also run the stored procedure for any additional cleanup
          try {
            await supabase.rpc('cleanup_stale_game_rooms');
          } catch (rpcError: any) {
            // Check if it's a network error
            if (isNetworkError(rpcError)) {
              supabaseUnreachable = true;
              lastUnreachableCheck = now;
              return;
            }
            // RPC might not exist, that's okay
            console.warn('Could not run cleanup_stale_game_rooms RPC:', rpcError);
          }
        } catch (error: any) {
          // Check if it's a network error
          if (isNetworkError(error)) {
            supabaseUnreachable = true;
            lastUnreachableCheck = now;
            if ((now - lastUnreachableCheck) >= UNREACHABLE_CHECK_INTERVAL) {
              console.warn('⚠️ Supabase unreachable. Skipping cleanup.');
            }
            return;
          }
          throw error; // Re-throw non-network errors
        }
      } else {
        // Local cleanup - very aggressive
        const now = Date.now();
        const ONE_MINUTE = 60 * 1000;
        const FIVE_MINUTES = 5 * 60 * 1000;
        const ONE_HOUR = 60 * 60 * 1000;
        
        roomsStorage = roomsStorage.filter(room => {
          const createdAge = now - new Date(room.createdAt).getTime();
          const finishedAge = room.finishedAt ? now - new Date(room.finishedAt).getTime() : 0;
          const updatedAge = now - new Date(room.updatedAt).getTime();
          
          // Delete empty rooms immediately
          if (room.currentPlayers.length === 0) {
            console.log(`🗑️ Removing empty room ${room.code}`);
            return false;
          }
          // Delete finished rooms immediately
          if (room.status === 'finished') {
            console.log(`🗑️ Removing finished room ${room.code}`);
            return false;
          }
          // Delete waiting rooms with 1 player after 1 minute
          if (room.status === 'waiting' && room.currentPlayers.length === 1 && createdAge > ONE_MINUTE) {
            console.log(`🗑️ Removing abandoned waiting room ${room.code}`);
            return false;
          }
          // Delete inactive waiting rooms (10 min old, no updates for 5 min)
          if (room.status === 'waiting' && createdAge > 10 * ONE_MINUTE && updatedAge > 5 * ONE_MINUTE) {
            console.log(`🗑️ Removing inactive waiting room ${room.code}`);
            return false;
          }
          // Keep active waiting rooms with 2+ players
          if (room.status === 'waiting' && room.currentPlayers.length >= 2) return true;
          // Delete playing rooms older than 2 hours
          if (room.status === 'playing' && createdAge > 2 * ONE_HOUR) {
            console.log(`🗑️ Removing old playing room ${room.code}`);
            return false;
          }
          // Keep active playing rooms
          if (room.status === 'playing') return true;
          
          return false;
        });
      }
    } catch (error) {
      console.error('Error cleaning up stale rooms:', error);
    }
  },
  
  /**
   * Get active player count for a game type
   */
  async getActivePlayerCount(gameType: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const rooms = await getPublicRoomsFromDB(gameType);
      const count = rooms.reduce((total, room) => total + room.currentPlayers.length, 0);
      return { success: true, count };
    } catch (error: any) {
      console.error('Error getting active player count:', error);
      return { success: false, count: 0, error: error.message || 'Failed to get player count' };
    }
  },
  
  /**
   * Generate a room code (utility function)
   */
  generateRoomCode,
};

