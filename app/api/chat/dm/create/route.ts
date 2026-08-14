import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, or, and } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase not initialized' },
        { status: 500 }
      );
    }

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

    // Check if DM already exists between these two users
    const firestore = db; // Type assertion to avoid TypeScript issues
    const dmsRef = collection(firestore, 'directMessages');
    const q = query(
      dmsRef,
      or(
        and(
          where('participant1', '==', userId1),
          where('participant2', '==', userId2)
        ),
        and(
          where('participant1', '==', userId2),
          where('participant2', '==', userId1)
        )
      )
    );

    const existingDMs = await getDocs(q);
    
    if (!existingDMs.empty) {
      // Return existing DM ID
      return NextResponse.json({
        success: true,
        dmId: existingDMs.docs[0].id,
        message: 'DM already exists'
      });
    }

    // Create new DM
    const dmData = {
      participant1: userId1,
      participant2: userId2,
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(dmsRef, dmData);

    return NextResponse.json({
      success: true,
      dmId: docRef.id
    });
  } catch (error) {
    console.error('Error creating DM:', error);
    return NextResponse.json(
      { error: 'Failed to create direct message' },
      { status: 500 }
    );
  }
}
