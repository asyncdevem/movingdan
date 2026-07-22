import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { groupId, memberIds } = await request.json();

    if (!groupId || !memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json(
        { error: 'Group ID and member IDs array are required' },
        { status: 400 }
      );
    }

    if (memberIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one member must be provided' },
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

    // First, fetch the current group to get existing members
    const getGroupUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/groups/${groupId}?key=${apiKey}`;
    
    const getResponse = await fetch(getGroupUrl);
    
    if (!getResponse.ok) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const groupData = await getResponse.json();
    const existingMemberIds = groupData.fields.memberIds?.arrayValue?.values?.map((v: any) => v.stringValue) || [];

    // Merge with new members (avoid duplicates)
    const allMemberIds = [...new Set([...existingMemberIds, ...memberIds])];

    // Update the group with new members
    const updateGroupUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/groups/${groupId}?updateMask.fieldPaths=memberIds&updateMask.fieldPaths=updatedAt&key=${apiKey}`;
    
    const timestamp = new Date().toISOString();
    
    const updateResponse = await fetch(updateGroupUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          memberIds: {
            arrayValue: {
              values: allMemberIds.map((id: string) => ({ stringValue: id }))
            }
          },
          updatedAt: { stringValue: timestamp },
        }
      })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('Firestore error:', errorData);
      return NextResponse.json(
        { error: 'Failed to add members to group' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Members added successfully',
      memberIds: allMemberIds
    });
  } catch (error: any) {
    console.error('Error adding members to group:', error);
    return NextResponse.json(
      { error: 'Failed to add members', message: error.message },
      { status: 500 }
    );
  }
}
