import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { groupId, senderId, senderName, senderAvatar, text } = await request.json();

    if (!groupId || !senderId || !senderName || !text) {
      return NextResponse.json(
        { error: 'Group ID, sender info, and message text are required' },
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

    const timestamp = new Date().toISOString();

    // Create message using Firestore REST API
    const messagesUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/messages?key=${apiKey}`;
    
    const messageResponse = await fetch(messagesUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          groupId: { stringValue: groupId },
          senderId: { stringValue: senderId },
          senderName: { stringValue: senderName },
          senderAvatar: { stringValue: senderAvatar || 'U' },
          text: { stringValue: text },
          timestamp: { stringValue: timestamp },
          type: { stringValue: 'text' },
          readBy: {
            arrayValue: {
              values: [{ stringValue: senderId }]
            }
          },
        }
      })
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json();
      console.error('Firestore error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    const messageData = await messageResponse.json();
    const messageId = messageData.name.split('/').pop();

    // Update group's lastMessage
    const groupUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/groups/${groupId}?updateMask.fieldPaths=lastMessage&updateMask.fieldPaths=updatedAt&key=${apiKey}`;
    
    await fetch(groupUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          lastMessage: {
            mapValue: {
              fields: {
                text: { stringValue: text },
                senderId: { stringValue: senderId },
                senderName: { stringValue: senderName },
                timestamp: { stringValue: timestamp },
              }
            }
          },
          updatedAt: { stringValue: timestamp },
        }
      })
    });

    return NextResponse.json({ 
      success: true, 
      messageId 
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message', message: error.message },
      { status: 500 }
    );
  }
}
