/**
 * Email Helper Functions
 * Utilities for triggering emails from the UI
 */

import { 
  scheduleWeeklyDigest, 
  sendImmediateNotification 
} from "./firebase";

// ==========================================
// Send Test Weekly Digest
// ==========================================
export const sendTestWeeklyDigest = async (
  userId: string,
  userName: string,
  userEmail: string,
  warnings: any[],
  signatures: any[],
  policies: any[]
) => {
  const weekStartDate = getWeekStartDate();
  const weekEndDate = getWeekEndDate();

  // Get this week's data
  const weekStart = weekStartDate.getTime();
  const weekEnd = weekEndDate.getTime();

  const newWarnings = warnings.filter((w) => {
    const warnDate = new Date(w.date).getTime();
    return warnDate >= weekStart && warnDate <= weekEnd;
  });

  const newSignatures = signatures.map((sig) => {
    const policy = policies.find((p) => p.id === sig.policyId);
    return {
      ...sig,
      policyTitle: policy?.title || "Unknown Policy",
    };
  }).filter((sig) => {
    const sigDate = new Date(sig.signedAt).getTime();
    return sigDate >= weekStart && sigDate <= weekEnd;
  });

  try {
    await scheduleWeeklyDigest(userId, {
      employeeId: userId,
      employeeName: userName,
      employeeEmail: userEmail,
      warningsSummary: newWarnings,
      signaturesSummary: newSignatures,
      weekStartDate: formatDate(weekStartDate),
      weekEndDate: formatDate(weekEndDate),
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending test digest:", error);
    return { success: false, error };
  }
};

// ==========================================
// Send Warning Notification
// ==========================================
export const sendWarningNotification = async (
  userId: string,
  userName: string,
  userEmail: string,
  warning: {
    warningType: string;
    date: string;
    severity: string;
    incidentDetails: string;
    cost: number;
    issuedBy: string;
  }
) => {
  try {
    await sendImmediateNotification(userId, "warning_issued", {
      employeeName: userName,
      employeeEmail: userEmail,
      warningType: warning.warningType,
      warningDate: warning.date,
      severity: warning.severity,
      incidentDetails: warning.incidentDetails,
      cost: warning.cost,
      issuedBy: warning.issuedBy,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending warning notification:", error);
    return { success: false, error };
  }
};

// ==========================================
// Send New Policy Notification
// ==========================================
export const sendNewPolicyNotification = async (
  users: any[],
  policy: {
    title: string;
    shortDesc: string;
  }
) => {
  const employees = users.filter((u) => u.role === "employee");

  try {
    const promises = employees.map((emp) =>
      sendImmediateNotification(emp.id, "policy_added", {
        employeeName: emp.name,
        employeeEmail: emp.email,
        policyTitle: policy.title,
        policyDescription: policy.shortDesc,
      })
    );

    await Promise.all(promises);
    return { success: true, sentTo: employees.length };
  } catch (error) {
    console.error("Error sending policy notifications:", error);
    return { success: false, error };
  }
};

// ==========================================
// Helper: Get Week Start Date (Monday)
// ==========================================
function getWeekStartDate(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// ==========================================
// Helper: Get Week End Date (Sunday)
// ==========================================
function getWeekEndDate(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? 0 : 7); // Adjust to Sunday
  const sunday = new Date(now.setDate(diff));
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

// ==========================================
// Helper: Format Date for Display
// ==========================================
function formatDate(date: Date): string {
  const months = ["January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// ==========================================
// Calculate Email Metrics
// ==========================================
export const getEmailMetrics = (emailQueue: any[]) => {
  const total = emailQueue.length;
  const sent = emailQueue.filter((e) => e.status === "sent").length;
  const failed = emailQueue.filter((e) => e.status === "failed").length;
  const pending = emailQueue.filter((e) => e.status === "pending").length;
  const processing = emailQueue.filter((e) => e.status === "processing").length;

  return {
    total,
    sent,
    failed,
    pending,
    processing,
    successRate: total > 0 ? Math.round((sent / total) * 100) : 0,
  };
};

// ==========================================
// Validate Email Address
// ==========================================
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ==========================================
// Validate Phone Number (E.164 format)
// ==========================================
export const isValidPhone = (phone: string): boolean => {
  // E.164 format: +[country code][number]
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

// ==========================================
// Format Phone Number for Display
// ==========================================
export const formatPhoneNumber = (phone: string): string => {
  // Convert +15551234567 to +1 (555) 123-4567
  if (!phone.startsWith("+")) return phone;
  
  const cleaned = phone.slice(1); // Remove +
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    // US number
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return as-is for other countries
};

// ==========================================
// Get Email Schedule Info
// ==========================================
export const getNextWeeklyDigestTime = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const friday = 5;

  let daysUntilFriday = friday - dayOfWeek;
  if (daysUntilFriday <= 0) {
    daysUntilFriday += 7; // Next Friday
  }

  const nextFriday = new Date(now);
  nextFriday.setDate(now.getDate() + daysUntilFriday);
  nextFriday.setHours(17, 0, 0, 0); // 5:00 PM

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return nextFriday.toLocaleString("en-US", options);
};
