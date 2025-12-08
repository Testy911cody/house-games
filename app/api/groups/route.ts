import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (for now - in production, use a database)
// This will reset on server restart, but works for cross-device sharing
let groupsStorage: any[] = [];

export async function GET(request: NextRequest) {
  try {
    // Return all groups
    return NextResponse.json({ success: true, groups: groupsStorage });
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
      const existingGroup = groupsStorage.find(g => g.code === group.code);
      if (existingGroup) {
        return NextResponse.json(
          { success: false, error: 'Group code already exists' },
          { status: 400 }
        );
      }
      
      groupsStorage.push(group);
      return NextResponse.json({ success: true, group });
    }

    if (action === 'join') {
      // Join a group
      const group = groupsStorage.find(g => g.id === groupId);
      if (!group) {
        return NextResponse.json(
          { success: false, error: 'Group not found' },
          { status: 404 }
        );
      }

      // Check if already a member
      if (group.members.some((m: any) => m.id === userId) || group.adminId === userId) {
        return NextResponse.json(
          { success: false, error: 'Already a member' },
          { status: 400 }
        );
      }

      // Add member
      group.members.push({
        id: userId,
        name: userName,
        joinedAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, group });
    }

    if (action === 'update') {
      // Update group
      const index = groupsStorage.findIndex(g => g.id === groupId);
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Group not found' },
          { status: 404 }
        );
      }
      groupsStorage[index] = { ...groupsStorage[index], ...group };
      return NextResponse.json({ success: true, group: groupsStorage[index] });
    }

    if (action === 'delete') {
      // Delete group
      const index = groupsStorage.findIndex(g => g.id === groupId);
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Group not found' },
          { status: 404 }
        );
      }
      groupsStorage.splice(index, 1);
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

