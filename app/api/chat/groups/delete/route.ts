import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { groupId } = await request.json();

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
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

    // First, fetch all messages for this group
    const messagesQueryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
    
    const messagesResponse = await fetch(messagesQueryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'messages' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'groupId' },
              op: 'EQUAL',
              value: { stringValue: groupId }
            }
          }
        }
      })
    });

    if (messagesResponse.ok) {
      const messagesData = await messagesResponse.json();
      
      // Delete all messages in the group
      const deletePromises = messagesData
        .filter((r: any) => r.document)
        .map((r: any) => {
          const docPath = r.document.name;
          return fetch(`https://firestore.googleapis.com/v1/${docPath}?key=${apiKey}`, {
            method: 'DELETE'
          });
        });

      await Promise.all(deletePromises);
    }

    // Delete the group itself
    const groupUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/groups/${groupId}?key=${apiKey}`;
    
    const groupResponse = await fetch(groupUrl, {
      method: 'DELETE'
    });

    if (!groupResponse.ok) {
      const errorData = await groupResponse.json();
      console.error('Firestore error:', errorData);
      return NextResponse.json(
        { error: 'Failed to delete group' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Group and all messages deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting chat group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group', message: error.message },
      { status: 500 }
    );
  }
}
