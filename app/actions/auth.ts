'use server';

import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Manager login - Creates session after client-side Firebase auth
export async function createManagerSession(userId: string, email: string, name: string) {
  try {
    // Create session cookie
    await createSession({
      userId,
      role: 'manager',
      email,
      name,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[createManagerSession] Error:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

// Employee login with phone + password
export async function loginEmployee(phone: string, password: string) {
  try {
    // Call the employee login API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/employee-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!data.success) {
      return { success: false, error: data.error || 'Invalid credentials' };
    }

    // Create session cookie
    await createSession({
      userId: data.employee.id,
      role: 'employee',
      phone: data.employee.phone,
      name: data.employee.name,
      email: data.employee.email,
    });

    return { success: true, employee: data.employee };
  } catch (error: any) {
    console.error('Employee login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

// Logout (both manager and employee)
export async function logout() {
  try {
    await deleteSession();
  } catch (error) {
    console.error('[logout] Error:', error);
  }
  redirect('/');
}
