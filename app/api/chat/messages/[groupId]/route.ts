import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

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

    // Fetch messages for this group using Firestore REST API
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
    
    const response = await fetch(url, {
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

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const data = await response.json();
    
    const messages = data
      .filter((r: any) => r.document)
      .map((r: any) => {
        const fields = r.document.fields;
        const docId = r.document.name.split('/').pop();
        
        const message: any = { id: docId };
        
        for (const [key, value] of Object.entries(fields)) {
          const field = value as any;
          if (field.stringValue !== undefined) message[key] = field.stringValue;
          else if (field.arrayValue !== undefined) {
            message[key] = field.arrayValue.values?.map((v: any) => v.stringValue || v) || [];
          }
        }
        
        return message;
      })
      .sort((a: any, b: any) => {
        // Sort by timestamp
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', message: error.message },
      { status: 500 }
    );
  }
}
