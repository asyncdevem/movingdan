import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Fetch groups where user is a member using Firestore REST API
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'groups' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'memberIds' },
              op: 'ARRAY_CONTAINS',
              value: { stringValue: userId }
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firestore API error:', response.status, errorText);
      throw new Error(`Failed to fetch groups: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle empty results - Firestore returns an array with empty objects when no matches
    if (!Array.isArray(data)) {
      console.error('Unexpected response format:', data);
      return NextResponse.json({
        success: true,
        groups: [],
      });
    }
    
    const groups = data
      .filter((r: any) => r.document)
      .map((r: any) => {
        const fields = r.document.fields;
        const docId = r.document.name.split('/').pop();
        
        const group: any = { id: docId };
        
        for (const [key, value] of Object.entries(fields)) {
          const field = value as any;
          if (field.stringValue !== undefined) group[key] = field.stringValue;
          else if (field.arrayValue !== undefined) {
            group[key] = field.arrayValue.values?.map((v: any) => v.stringValue || v) || [];
          }
          else if (field.mapValue !== undefined && key === 'lastMessage') {
            const lastMsg: any = {};
            const msgFields = field.mapValue.fields || {};
            for (const [msgKey, msgValue] of Object.entries(msgFields)) {
              const msgField = msgValue as any;
              if (msgField.stringValue !== undefined) lastMsg[msgKey] = msgField.stringValue;
            }
            group[key] = lastMsg;
          }
        }
        
        return group;
      });

    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (error: any) {
    console.error('Error fetching chat groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups', message: error.message },
      { status: 500 }
    );
  }
}
