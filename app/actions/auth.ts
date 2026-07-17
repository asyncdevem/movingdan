'use server';

import { createSession, deleteSession } from '@/lib/auth';
import { validateEmployeeCredentials } from '@/lib/employee-auth';
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
    // Validate employee credentials directly (no HTTP fetch)
    const result = await validateEmployeeCredentials(phone, password);

    if (!result.success || !result.employee) {
      return { success: false, error: result.error || 'Invalid credentials' };
    }

    // Create session cookie
    await createSession({
      userId: result.employee.id,
      role: 'employee',
      phone: result.employee.phone,
      name: result.employee.name,
      email: result.employee.email,
    });

    return { success: true, employee: result.employee };
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
