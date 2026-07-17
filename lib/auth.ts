import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';
const key = new TextEncoder().encode(secretKey);

export type SessionData = {
  userId: string;
  role: 'employee' | 'manager';
  email?: string;
  phone?: string;
  name?: string;
};

// Encrypt session data into JWT
export async function encrypt(payload: SessionData): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days expiration
    .sign(key);
}

// Decrypt JWT to get session data
export async function decrypt(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload as SessionData;
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

// Get session from cookies
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return null;
    }

    return await decrypt(sessionCookie.value);
  } catch (error) {
    console.error('[Auth] Error getting session:', error);
    return null;
  }
}

// Create session cookie
export async function createSession(data: SessionData): Promise<string> {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt(data);
  
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return session;
}

// Delete session cookie
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
