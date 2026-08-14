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

    // Get all DMs
    const dmsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/directMessages?key=${apiKey}`;
    
    const dmsResponse = await fetch(dmsUrl);
    
    if (!dmsResponse.ok) {
      const errorData = await dmsResponse.json();
      console.error('Firestore error:', errorData);
      return NextResponse.json(
        { error: 'Failed to load direct messages' },
        { status: 500 }
      );
    }

    const dmsData = await dmsResponse.json();
    const directMessages = [];

    if (dmsData.documents) {
      for (const doc of dmsData.documents) {
        const fields = doc.fields || {};
        const participants = fields.participants?.arrayValue?.values || [];
        const participantIds = participants.map((v: any) => v.stringValue);
        
        // Only include DMs where user is a participant
        if (participantIds.includes(userId)) {
          const dmId = doc.name.split('/').pop();
          
          // Get last message if exists
          const messagesUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/messages?key=${apiKey}`;
          const messagesResponse = await fetch(messagesUrl);
          
          let lastMessage;
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            
            if (messagesData.documents) {
              // Filter messages for this DM and sort by timestamp
              const dmMessages = messagesData.documents
                .filter((msg: any) => msg.fields?.groupId?.stringValue === dmId)
                .map((msg: any) => ({
                  text: msg.fields?.text?.stringValue || '',
                  senderId: msg.fields?.senderId?.stringValue || '',
                  senderName: msg.fields?.senderName?.stringValue || '',
                  timestamp: msg.fields?.timestamp?.stringValue || new Date().toISOString()
                }))
                .sort((a: any, b: any) => 
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
              
              if (dmMessages.length > 0) {
                lastMessage = dmMessages[0];
              }
            }
          }
          
          directMessages.push({
            id: dmId,
            participants: participantIds,
            createdAt: fields.createdAt?.stringValue || new Date().toISOString(),
            updatedAt: fields.updatedAt?.stringValue || new Date().toISOString(),
            lastMessage
          });
        }
      }
    }

    // Sort by last message timestamp
    directMessages.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a.updatedAt;
      const bTime = b.lastMessage?.timestamp || b.updatedAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return NextResponse.json({
      success: true,
      directMessages
    });
  } catch (error: any) {
    console.error('Error loading DMs:', error);
    return NextResponse.json(
      { error: 'Failed to load direct messages', message: error.message },
      { status: 500 }
    );
  }
}
