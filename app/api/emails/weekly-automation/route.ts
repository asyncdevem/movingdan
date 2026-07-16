import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Fetch all employees
    const usersUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const usersResponse = await fetch(usersUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'users' }]
        }
      })
    });

    const usersData = await usersResponse.json();
    
    const employees: any[] = [];
    const managers: any[] = [];

    usersData?.forEach((item: any) => {
      const fields = item.document?.fields || {};
      const docPath = item.document?.name || '';
      const docId = docPath.split('/').pop();
      
      const user = {
        id: docId,
        name: fields.name?.stringValue || 'Unknown',
        email: fields.email?.stringValue || '',
        role: fields.role?.stringValue || 'employee'
      };

      if (user.role === 'employee') {
        employees.push(user);
      } else if (user.role === 'manager') {
        managers.push(user);
      }
    });

    const results = {
      employeeEmails: [] as string[],
      managerEmails: [] as string[],
      errors: [] as string[]
    };

    // Send digest to all employees
    for (const employee of employees) {
      if (!employee.email) continue;

      try {
        const response = await fetch(`${request.nextUrl.origin}/api/emails/send-employee-digest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: employee.id,
            employeeName: employee.name,
            employeeEmail: employee.email
          })
        });

        if (response.ok) {
          results.employeeEmails.push(employee.email);
        } else {
          results.errors.push(`Failed to send to ${employee.name}`);
        }
      } catch (error) {
        results.errors.push(`Error sending to ${employee.name}: ${error}`);
      }
    }

    // Send stats to all managers
    for (const manager of managers) {
      if (!manager.email) continue;

      try {
        const response = await fetch(`${request.nextUrl.origin}/api/emails/send-manager-stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            managerName: manager.name,
            managerEmail: manager.email
          })
        });

        if (response.ok) {
          results.managerEmails.push(manager.email);
        } else {
          results.errors.push(`Failed to send to ${manager.name}`);
        }
      } catch (error) {
        results.errors.push(`Error sending to ${manager.name}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly emails sent',
      results
    });
  } catch (error: any) {
    console.error('Weekly automation error:', error);
    return NextResponse.json(
      { error: 'Automation failed', message: error.message },
      { status: 500 }
    );
  }
}
