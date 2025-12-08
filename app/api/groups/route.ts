import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Fallback in-memory storage (only used if Supabase is not configured)
let groupsStorage: any[] = [];

async function getGroupsFromDB() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Supabase error:', error);
      return [];
    }
  }
  return groupsStorage;
}

async function saveGroupToDB(group: any) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          id: group.id,
          name: group.name,
          code: group.code,
          admin_id: group.adminId,
          admin_name: group.adminName,
          members: group.members,
          description: group.description,
          created_at: group.createdAt,
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
  groupsStorage.push(group);
  return group;
}

async function updateGroupInDB(groupId: string, updates: any) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  }
  const index = groupsStorage.findIndex(g => g.id === groupId);
  if (index >= 0) {
    groupsStorage[index] = { ...groupsStorage[index], ...updates };
    return groupsStorage[index];
  }
  return null;
}

async function deleteGroupFromDB(groupId: string) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  }
  const index = groupsStorage.findIndex(g => g.id === groupId);
  if (index >= 0) {
    groupsStorage.splice(index, 1);
    return true;
  }
  return false;
}

function transformGroupFromDB(dbGroup: any) {
  return {
    id: dbGroup.id,
    name: dbGroup.name,
    code: dbGroup.code,
    adminId: dbGroup.admin_id,
    adminName: dbGroup.admin_name,
    members: dbGroup.members || [],
    description: dbGroup.description,
    createdAt: dbGroup.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const dbGroups = await getGroupsFromDB();
    const groups = dbGroups.map(transformGroupFromDB);
    return NextResponse.json({ success: true, groups });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, group, groupId, userId, userName } = body;

    if (action === 'create') {
      // Create new group
      if (!group) {
        return NextResponse.json(
          { success: false, error: 'Group data required' },
          { status: 400 }
        );
      }
      
      // Check for duplicate code
      const allGroups = await getGroupsFromDB();
      const existingGroup = allGroups.find((g: any) => 
        (g.code || '').toUpperCase() === group.code.toUpperCase()
      );
      if (existingGroup) {
        return NextResponse.json(
          { success: false, error: 'Group code already exists' },
          { status: 400 }
        );
      }
      
      const savedGroup = await saveGroupToDB(group);
      return NextResponse.json({ success: true, group: transformGroupFromDB(savedGroup) });
    }

    if (action === 'join') {
      // Join a group
      const allGroups = await getGroupsFromDB();
      const dbGroup = allGroups.find((g: any) => g.id === groupId);
      if (!dbGroup) {
        return NextResponse.json(
          { success: false, error: 'Group not found' },
          { status: 404 }
        );
      }

      const group = transformGroupFromDB(dbGroup);

      // Check if already a member
      if (group.members.some((m: any) => m.id === userId) || group.adminId === userId) {
        return NextResponse.json(
          { success: false, error: 'Already a member' },
          { status: 400 }
        );
      }

      // Add member
      const updatedMembers = [
        ...group.members,
        {
          id: userId,
          name: userName,
          joinedAt: new Date().toISOString(),
        }
      ];

      const updatedGroup = await updateGroupInDB(groupId, { members: updatedMembers });
      return NextResponse.json({ success: true, group: transformGroupFromDB(updatedGroup) });
    }

    if (action === 'update') {
      // Update group
      const updateData: any = {};
      if (group.name) updateData.name = group.name;
      if (group.description !== undefined) updateData.description = group.description;
      if (group.members) updateData.members = group.members;
      
      const updatedGroup = await updateGroupInDB(groupId, updateData);
      if (!updatedGroup) {
        return NextResponse.json(
          { success: false, error: 'Group not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, group: transformGroupFromDB(updatedGroup) });
    }

    if (action === 'delete') {
      // Delete group
      const deleted = await deleteGroupFromDB(groupId);
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Group not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true });
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

