import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messageId, groupId } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
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

    // Delete the message
    const messageUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/messages/${messageId}?key=${apiKey}`;
    
    const messageResponse = await fetch(messageUrl, {
      method: 'DELETE'
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json();
      console.error('Firestore error:', errorData);
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      );
    }

    // If groupId provided, update the group's lastMessage
    if (groupId) {
      // Fetch remaining messages to update lastMessage
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
            },
            orderBy: [
              {
                field: { fieldPath: 'timestamp' },
                direction: 'DESCENDING'
              }
            ],
            limit: 1
          }
        })
      });

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        const timestamp = new Date().toISOString();
        
        if (messagesData.length > 0 && messagesData[0].document) {
          // Update with the latest message
          const latestMsg = messagesData[0].document.fields;
          const groupUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/groups/${groupId}?updateMask.fieldPaths=lastMessage&updateMask.fieldPaths=updatedAt&key=${apiKey}`;
          
          await fetch(groupUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: {
                lastMessage: {
                  mapValue: {
                    fields: {
                      text: latestMsg.text,
                      senderId: latestMsg.senderId,
                      senderName: latestMsg.senderName,
                      timestamp: latestMsg.timestamp,
                    }
                  }
                },
                updatedAt: { stringValue: timestamp },
              }
            })
          });
        } else {
          // No messages left, clear lastMessage
          const groupUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/groups/${groupId}?updateMask.fieldPaths=lastMessage&updateMask.fieldPaths=updatedAt&key=${apiKey}`;
          
          await fetch(groupUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: {
                updatedAt: { stringValue: timestamp },
              }
            })
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message', message: error.message },
      { status: 500 }
    );
  }
}
