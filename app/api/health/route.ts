import { NextResponse } from 'next/server';

export async function GET() {
  const health: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    firebase: {
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT_SET',
    },
  };

  // Try to query Firestore using REST API
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (projectId) {
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?pageSize=1`;
      const response = await fetch(queryUrl);
      
      if (response.ok) {
        const data = await response.json();
        health.firebase.firestoreWorks = true;
        health.firebase.canQueryUsers = true;
        health.firebase.userCount = data.documents?.length || 0;
      } else {
        health.firebase.firestoreWorks = false;
        health.firebase.error = `HTTP ${response.status}`;
      }
    }
  } catch (error: any) {
    health.firebase.firestoreWorks = false;
    health.firebase.error = error.message;
  }

  return NextResponse.json(health);
}
