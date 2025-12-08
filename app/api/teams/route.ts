import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Fallback in-memory storage (only used if Supabase is not configured)
let teamsStorage: any[] = [];

async function getTeamsFromDB() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Supabase error:', error);
      return [];
    }
  }
  return teamsStorage;
}

async function saveTeamToDB(team: any) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          id: team.id,
          name: team.name,
          code: team.code,
          admin_id: team.adminId,
          admin_name: team.adminName,
          members: team.members,
          description: team.description,
          created_at: team.createdAt,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  }
  teamsStorage.push(team);
  return team;
}

async function updateTeamInDB(teamId: string, updates: any) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  }
  const index = teamsStorage.findIndex(t => t.id === teamId);
  if (index >= 0) {
    teamsStorage[index] = { ...teamsStorage[index], ...updates };
    return teamsStorage[index];
  }
  return null;
}

async function deleteTeamFromDB(teamId: string) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  }
  const index = teamsStorage.findIndex(t => t.id === teamId);
  if (index >= 0) {
    teamsStorage.splice(index, 1);
    return true;
  }
  return false;
}

function transformTeamFromDB(dbTeam: any) {
  return {
    id: dbTeam.id,
    name: dbTeam.name,
    code: dbTeam.code,
    adminId: dbTeam.admin_id,
    adminName: dbTeam.admin_name,
    members: dbTeam.members || [],
    description: dbTeam.description,
    createdAt: dbTeam.created_at,
  };
}

// Helper to add no-cache headers for rapid multiplayer sync
function getNoCacheHeaders() {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

export async function GET(request: NextRequest) {
  try {
    const dbTeams = await getTeamsFromDB();
    
    // Transform teams from database format to app format
    const teams = dbTeams.map((dbTeam: any) => {
      // If already in app format (from fallback storage), return as-is
      if (dbTeam.adminId) {
        return dbTeam;
      }
      // Otherwise transform from database format
      return transformTeamFromDB(dbTeam);
    });
    
    return NextResponse.json(
      { success: true, teams },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch teams' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, team, teamId, userId, userName } = body;

    if (action === 'create') {
      // Create new team
      if (!team) {
        return NextResponse.json(
          { success: false, error: 'Team data required' },
          { status: 400 }
        );
      }
      
      // Check for duplicate code
      const allTeams = await getTeamsFromDB();
      const existingTeam = allTeams.find((t: any) => 
        (t.code || '').toUpperCase() === team.code.toUpperCase()
      );
      if (existingTeam) {
        return NextResponse.json(
          { success: false, error: 'Team code already exists' },
          { status: 400 }
        );
      }
      
      const savedTeam = await saveTeamToDB(team);
      return NextResponse.json(
        { success: true, team: transformTeamFromDB(savedTeam) },
        { headers: getNoCacheHeaders() }
      );
    }

    if (action === 'join') {
      // Join a team - anyone online can join
      const allTeams = await getTeamsFromDB();
      const dbTeam = allTeams.find((t: any) => t.id === teamId);
      if (!dbTeam) {
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }

      const team = transformTeamFromDB(dbTeam);

      // Check if already a member
      if (team.members.some((m: any) => m.id === userId) || team.adminId === userId) {
        return NextResponse.json(
          { success: false, error: 'Already a member' },
          { status: 400 }
        );
      }

      // Add member - anyone can join
      const updatedMembers = [
        ...team.members,
        {
          id: userId,
          name: userName,
          joinedAt: new Date().toISOString(),
        }
      ];

      const updatedTeam = await updateTeamInDB(teamId, { members: updatedMembers });
      return NextResponse.json(
        { success: true, team: transformTeamFromDB(updatedTeam) },
        { headers: getNoCacheHeaders() }
      );
    }

    if (action === 'update') {
      // Update team
      const updateData: any = {};
      if (team.name) updateData.name = team.name;
      if (team.description !== undefined) updateData.description = team.description;
      if (team.members) updateData.members = team.members;
      
      const updatedTeam = await updateTeamInDB(teamId, updateData);
      if (!updatedTeam) {
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, team: transformTeamFromDB(updatedTeam) },
        { headers: getNoCacheHeaders() }
      );
    }

    if (action === 'delete') {
      // Delete team
      const deleted = await deleteTeamFromDB(teamId);
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true },
        { headers: getNoCacheHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

