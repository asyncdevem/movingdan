import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase not initialized' },
        { status: 500 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all DMs where user is a participant
    const firestore = db; // Type assertion to avoid TypeScript issues
    const dmsRef = collection(firestore, 'directMessages');
    const q = query(
      dmsRef,
      where('participants', 'array-contains', userId)
    );

    const dmsSnapshot = await getDocs(q);
    
    const directMessages = await Promise.all(
      dmsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Get last message if exists
        const messagesRef = collection(firestore, `directMessages/${doc.id}/messages`);
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));
        const messagesSnapshot = await getDocs(messagesQuery);
        
        let lastMessage = undefined;
        if (!messagesSnapshot.empty) {
          const lastMsg = messagesSnapshot.docs[0].data();
          lastMessage = {
            text: lastMsg.text,
            senderId: lastMsg.senderId,
            senderName: lastMsg.senderName,
            timestamp: lastMsg.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
          };
        }

        return {
          id: doc.id,
          participants: data.participants,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastMessage
        };
      })
    );

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
  } catch (error) {
    console.error('Error loading DMs:', error);
    return NextResponse.json(
      { error: 'Failed to load direct messages' },
      { status: 500 }
    );
  }
}
