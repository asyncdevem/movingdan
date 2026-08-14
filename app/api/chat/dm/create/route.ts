import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId1, userId2 } = await request.json();

    if (!userId1 || !userId2) {
      return NextResponse.json(
        { error: 'Both user IDs are required' },
        { status: 400 }
      );
    }

    if (userId1 === userId2) {
      return NextResponse.json(
        { error: 'Cannot create DM with yourself' },
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

    // Check if DM already exists between these two users
    // We need to check both directions: userId1->userId2 and userId2->userId1
    const listUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/directMessages?key=${apiKey}`;
    
    const listResponse = await fetch(listUrl);
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      
      if (listData.documents) {
        // Check if DM already exists
        for (const doc of listData.documents) {
          const participants = doc.fields?.participants?.arrayValue?.values || [];
          const participantIds = participants.map((v: any) => v.stringValue);
          
          if (
            (participantIds.includes(userId1) && participantIds.includes(userId2))
          ) {
            const dmId = doc.name.split('/').pop();
            return NextResponse.json({
              success: true,
              dmId,
              message: 'DM already exists'
            });
          }
        }
      }
    }

    // Create new DM
    const timestamp = new Date().toISOString();
    const dmUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/directMessages?key=${apiKey}`;
    
    const dmResponse = await fetch(dmUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          participant1: { stringValue: userId1 },
          participant2: { stringValue: userId2 },
          participants: {
            arrayValue: {
              values: [
                { stringValue: userId1 },
                { stringValue: userId2 }
              ]
            }
          },
          createdAt: { stringValue: timestamp },
          updatedAt: { stringValue: timestamp },
        }
      })
    });

    if (!dmResponse.ok) {
      const errorData = await dmResponse.json();
      console.error('Firestore error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create direct message' },
        { status: 500 }
      );
    }

    const dmData = await dmResponse.json();
    const dmId = dmData.name.split('/').pop();

    return NextResponse.json({
      success: true,
      dmId
    });
  } catch (error: any) {
    console.error('Error creating DM:', error);
    return NextResponse.json(
      { error: 'Failed to create direct message', message: error.message },
      { status: 500 }
    );
  }
}
