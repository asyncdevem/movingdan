"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export type UserRole = "employee" | "manager";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  title: string;
  avatar: string;
}

export interface Policy {
  id: string;
  title: string;
  shortDesc: string;
  iconName: string; // Used to map to Lucide icons
  content: string;
}

export interface Signature {
  policyId: string;
  employeeId: string;
  signedAt: string;
  signatureData: string; // base64 canvas image data
}

export interface Warning {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  category: string;
  severity: "Verbal" | "Written" | "Final Warning";
  details: string;
  issuedBy: string;
  employeeSignature?: string;
  managerSignature: string;
}

interface AppContextProps {
  currentUser: User;
  users: User[];
  policies: Policy[];
  signatures: Signature[];
  warnings: Warning[];
  currentScreen: string; // navigation
  activeTab: string; // bottom navigation
  selectedPolicyId: string | null;
  selectedEmployeeId: string | null; // for warning detail or profile
  switchRole: (role: UserRole) => void;
  loginAs: (userId: string) => void;
  addEmployee: (employee: Omit<User, "id" | "avatar">) => void;
  signPolicy: (policyId: string, signatureData: string) => void;
  issueWarning: (warning: Omit<Warning, "id" | "date" | "issuedBy">) => void;
  setNavigation: (screen: string, policyId?: string | null) => void;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pre-seeded Users
  const [users, setUsers] = useState<User[]>([
    {
      id: "emp1",
      name: "Marcus Miller",
      role: "employee",
      email: "marcus@movingdan.com",
      title: "Professional Mover & Driver",
      avatar: "MM",
    },
    {
      id: "emp2",
      name: "Sarah Jenkins",
      role: "employee",
      email: "sarah@movingdan.com",
      title: "Mover & Packing Specialist",
      avatar: "SJ",
    },
    {
      id: "emp3",
      name: "Lamar Washington",
      role: "employee",
      email: "lamar@movingdan.com",
      title: "Crew Lead & heavy Lifting Expert",
      avatar: "LW",
    },
    {
      id: "emp4",
      name: "David Cooper",
      role: "employee",
      email: "david@movingdan.com",
      title: "Mover / Driver",
      avatar: "DC",
    },
    {
      id: "mgr1",
      name: "Dan Stevens",
      role: "manager",
      email: "dan@movingdan.com",
      title: "Owner / Operations Manager",
      avatar: "DS",
    },
  ]);

  // Default active user is Marcus (Mover) so employee flow is visible first
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  // Navigation states
  const [currentScreen, setCurrentScreen] = useState<string>("home"); // home, policy-list, policy-detail, warning-form, add-employee, report-view
  const [activeTab, setActiveTabInternal] = useState<string>("home"); // home, employees, reports, settings
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Pre-seeded Policies
  const policies: Policy[] = [
    {
      id: "renting-uhaul",
      title: "Renting a Uhaul",
      shortDesc: "Steps for renting a Uhaul for company moves, inspection rules, and returning.",
      iconName: "Truck",
      content: `### 1. Pre-Rental Authorization
All truck rentals must be approved in writing by Operations Manager Dan Stevens before pickup. Ensure you have the authorized digital purchase order number.

### 2. Vehicle Inspection & Verification
Before leaving the U-Haul rental lot, the driver must conduct a comprehensive inspection:
* **Damage Checklist:** Walk around the vehicle, take high-resolution photos of all sides, tires, windshield, and existing dents/scratches. Upload photos to the team chat group.
* **Fluid Check:** Confirm fuel level on the rental agreement matches the actual gauge.
* **Safety Equipment Check:** Verify the cabin contains the authorized hand truck, 20 furniture pads, and safety straps.

### 3. During Operation
* The authorized company driver is the ONLY person permitted to operate the vehicle.
* Adhere strictly to height clearances (always assume 12ft clearance minimum).
* Never leave the truck unlocked or unattended when loaded.

### 4. Returning the Vehicle
* Clean out all debris from the truck bed and cabin.
* Refuel to the exact level noted upon pickup. (Failure to refuel results in a $50 company administrative charge + rental company fees).
* Park the truck in the designated return area and drop keys in the secure lockbox. Report the return in the company system immediately.`,
    },
    {
      id: "requesting-time-off",
      title: "Requesting Times Off",
      shortDesc: "Notice period, approval flow, and holiday scheduling rules.",
      iconName: "Calendar",
      content: `### 1. General Notice Requirements
To maintain dispatch schedule integrity, all planned time-off requests must be submitted at least **seven (7) calendar days** in advance.

### 2. Submission & Approval Flow
* Submit your request via the application or email to dispatch.
* Requests will be reviewed within 48 hours.
* Approval is based on crew capacity and order of submission.
* **Do not** assume time off is approved until you receive an official notification from the manager.

### 3. Emergency Leaves & Sick Calls
If you cannot report to work due to unexpected illness or family emergency, follow the **Calling In** policy immediately. Do not use the general time-off flow for sudden emergencies.

### 4. Peak Moving Season Restrictions
Between May 15 and September 10 (Peak Moving Season), time-off requests exceeding 3 consecutive days require special approval and may be restricted to ensure customer service coverage.`,
    },
    {
      id: "clocking-in-out",
      title: "Clocking In and Out",
      shortDesc: "Instructions on tracking hours, break compliance, and timesheet edits.",
      iconName: "Clock",
      content: `### 1. Punctuality
Mover and driver shifts begin exactly at the scheduled dispatch time. You must be present, in company uniform, and ready to work before clocking in.

### 2. Clocking In & Out Procedures
* **Start Shift:** Clock in immediately upon arrival at the warehouse or job site as instructed.
* **Lunch Breaks:** You must clock out for unpaid lunch breaks (minimum 30 minutes) on jobs lasting over 6 hours.
* **End Shift:** Clock out immediately after completing post-job unloading, cleanup, and truck keys return.

### 3. Unauthorized Time Card Adjustments
* Clocking in other team members ("buddy punching") is strictly prohibited and results in immediate disciplinary action up to termination.
* Never clock in early or clock out late to artificially pad hours.

### 4. Timesheet Correction
If you miss a clock-in/out or encounter an error, document the correct times and email your crew leader and admin on the same day for corrections.`,
    },
    {
      id: "reimbursements",
      title: "Requesting Reimbursements",
      shortDesc: "Filing receipts, toll policies, and reimbursement schedules.",
      iconName: "Receipt",
      content: `### 1. Eligible Expenses
The company reimburses employees for specific job-related expenses incurred on behalf of the company:
* Approved vehicle fuel for rental trucks.
* Toll road fees on official transit routes.
* Parking fees at job locations.
* Emergency hardware/supplies explicitly approved by the crew lead.

### 2. Expense Submission Requirements
* **Itemized Receipt:** A credit card slip is not sufficient. You must submit the itemized, printed receipt.
* **Timeliness:** Submit receipts within **three (3) days** of the occurrence.
* **Context:** Write the Job ID/Customer Name and truck number directly on the receipt before submitting.

### 3. Process & Payment
All approved reimbursements will be processed and added to the employee's payroll on the subsequent bi-weekly pay cycle.`,
    },
    {
      id: "calling-in",
      title: "Calling In Policy",
      shortDesc: "Emergency absence reporting lines and tardiness warnings.",
      iconName: "PhoneCall",
      content: `### 1. Timely Notification
If you are unable to report to your scheduled shift due to illness or an unexpected emergency, you must call the Dispatch Hotline at least **two (2) hours** prior to your scheduled start time.

### 2. Accepted Methods
* You must call and speak directly to the Dispatcher or Manager.
* **Text messages, emails, or leaving messages with fellow movers are NOT acceptable.**

### 3. No-Call No-Show (NCNS)
Failure to report to a shift and failing to call in will be treated as a No-Call No-Show.
* First NCNS: Final Written Warning.
* Second NCNS: Immediate termination of employment.

### 4. Doctor's Note
Absences exceeding two (2) consecutive days require a medical clearance/doctor's note before returning to active duty.`,
    },
    {
      id: "handling-damage",
      title: "Handling Damage",
      shortDesc: "Documenting property damage, incident report filing, and notifications.",
      iconName: "ShieldAlert",
      content: `### 1. Safety First
If damage occurs (e.g., dropped furniture, wall scrape), immediately secure the area to prevent injury or further damage.

### 2. Immediate Customer Notification
Always be honest and professional. Explain to the customer that an incident occurred and that a manager will contact them. Do not debate value, fault, or insurance terms with the customer.

### 3. Take Photos and Document
* Take clear, close-up photos of the damage.
* Take wide-angle photos showing context.
* Inspect the item and the surrounding walls/floors.

### 4. File a Damage Report
Within **four (4) hours** of the incident, file a formal Incident/Damage Report via the app or email. Include photos, customer name, date, item description, and crew members present.`,
    },
  ];

  // Pre-seeded Signatures
  const [signatures, setSignatures] = useState<Signature[]>([
    {
      policyId: "clocking-in-out",
      employeeId: "emp1",
      signedAt: "2026-06-15T09:30:00Z",
      signatureData: "MOCK_SIGNATURE_DATA_MARCUS_CLOCK",
    },
    {
      policyId: "renting-uhaul",
      employeeId: "emp1",
      signedAt: "2026-06-20T10:15:00Z",
      signatureData: "MOCK_SIGNATURE_DATA_MARCUS_UHAUL",
    },
    {
      policyId: "clocking-in-out",
      employeeId: "emp2",
      signedAt: "2026-06-18T08:00:00Z",
      signatureData: "MOCK_SIGNATURE_DATA_SARAH_CLOCK",
    },
  ]);

  // Pre-seeded Warnings
  const [warnings, setWarnings] = useState<Warning[]>([
    {
      id: "wrn1",
      employeeId: "emp3",
      employeeName: "Lamar Washington",
      date: "2026-06-12",
      category: "Tardiness / Lateness",
      severity: "Written",
      details: "Lamar arrived 45 minutes late for the dispatch of the Johnson house move, causing the entire crew to be delayed and receiving a client complaint.",
      issuedBy: "Dan Stevens",
      managerSignature: "MOCK_DAN_SIG",
    },
    {
      id: "wrn2",
      employeeId: "emp1",
      employeeName: "Marcus Miller",
      date: "2026-06-28",
      category: "Property Damage",
      severity: "Verbal",
      details: "Marcus scraped a hallway wall while moving a heavy dresser. Minor drywall scuffs occurred. Customer was notified, and Marcus reported it promptly.",
      issuedBy: "Dan Stevens",
      employeeSignature: "MOCK_MARCUS_SIG",
      managerSignature: "MOCK_DAN_SIG",
    },
  ]);

  // Role switching helper
  const switchRole = (role: UserRole) => {
    // Switch active user based on role
    if (role === "manager") {
      const mgr = users.find((u) => u.role === "manager") || users[users.length - 1];
      setCurrentUser(mgr);
    } else {
      const emp = users.find((u) => u.role === "employee") || users[0];
      setCurrentUser(emp);
    }
    // Return to main dashboard tab upon role change
    setActiveTabInternal("home");
    setCurrentScreen("home");
  };

  // Specific user login helper (for demo authentication)
  const loginAs = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setActiveTabInternal("home");
      setCurrentScreen("home");
    }
  };

  // Add Employee (Manager-only)
  const addEmployee = (employeeData: Omit<User, "id" | "avatar">) => {
    const newId = `emp${users.length + 1}`;
    const initials = employeeData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    const newEmployee: User = {
      ...employeeData,
      id: newId,
      avatar: initials,
    };

    setUsers((prev) => [...prev, newEmployee]);
  };

  // Sign policy (Employee-only)
  const signPolicy = (policyId: string, signatureData: string) => {
    // Check if already signed
    const exists = signatures.some(
      (s) => s.policyId === policyId && s.employeeId === currentUser.id
    );

    if (exists) return;

    const newSig: Signature = {
      policyId,
      employeeId: currentUser.id,
      signedAt: new Date().toISOString(),
      signatureData,
    };

    setSignatures((prev) => [...prev, newSig]);
  };

  // Issue Written Warning (Manager-only)
  const issueWarning = (warningData: Omit<Warning, "id" | "date" | "issuedBy">) => {
    const targetEmployee = users.find((u) => u.id === warningData.employeeId);
    const newWarning: Warning = {
      ...warningData,
      id: `wrn${warnings.length + 1}`,
      employeeName: targetEmployee ? targetEmployee.name : "Unknown Employee",
      date: new Date().toISOString().split("T")[0],
      issuedBy: currentUser.name,
      managerSignature: "MANAGER_SIGNATURE_SUBMITTED",
    };

    setWarnings((prev) => [newWarning, ...prev]);
  };

  // Navigation helpers
  const setNavigation = (screen: string, policyId: string | null = null) => {
    setCurrentScreen(screen);
    if (policyId) {
      setSelectedPolicyId(policyId);
    }
  };

  const setActiveTab = (tab: string) => {
    setActiveTabInternal(tab);
    setCurrentScreen("home"); // reset drill-downs when tab changes
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        policies,
        signatures,
        warnings,
        currentScreen,
        activeTab,
        selectedPolicyId,
        selectedEmployeeId,
        switchRole,
        loginAs,
        addEmployee,
        signPolicy,
        issueWarning,
        setNavigation,
        setActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
