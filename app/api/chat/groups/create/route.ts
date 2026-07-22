import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, createdBy, createdByName, memberIds } = await request.json();

    if (!name || !createdBy || !createdByName || !memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json(
        { error: 'Group name, creator info, and member IDs are required' },
        { status: 400 }
      );
    }

    if (memberIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one member is required' },
        { status: 400 }
      );
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create group using Firestore REST API
    const groupUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/groups?key=${apiKey}`;
    
    const timestamp = new Date().toISOString();
    
    const groupResponse = await fetch(groupUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          name: { stringValue: name },
          createdBy: { stringValue: createdBy },
          createdByName: { stringValue: createdByName },
          memberIds: {
            arrayValue: {
              values: memberIds.map((id: string) => ({ stringValue: id }))
            }
          },
          createdAt: { stringValue: timestamp },
          updatedAt: { stringValue: timestamp },
        }
      })
    });

    if (!groupResponse.ok) {
      const errorData = await groupResponse.json();
      console.error('Firestore error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      );
    }

    const groupData = await groupResponse.json();
    const groupId = groupData.name.split('/').pop();

    // Create system message
    const messagesUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/messages?key=${apiKey}`;
    
    await fetch(messagesUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          groupId: { stringValue: groupId },
          senderId: { stringValue: 'system' },
          senderName: { stringValue: 'System' },
          senderAvatar: { stringValue: 'SYS' },
          text: { stringValue: `${createdByName} created this group` },
          timestamp: { stringValue: timestamp },
          type: { stringValue: 'system' },
          readBy: { arrayValue: { values: [] } },
        }
      })
    });

    return NextResponse.json({ 
      success: true, 
      groupId 
    });
  } catch (error: any) {
    console.error('Error creating chat group:', error);
    return NextResponse.json(
      { error: 'Failed to create group', message: error.message },
      { status: 500 }
    );
  }
}
