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
  password?: string;
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
  warningType: string; // "Damage" | "Late" | "Call In / No Show" | "Not Following Rules" | "Other"
  cost: number;
  incidentDetails: string;
  damageDate?: string;
  damageCost?: string;
  additionalNotes?: string;
  photos?: string[]; // array of base64 images or mock image paths
  severity: "Verbal" | "Written" | "Final Warning";
  details: string; // general description
  issuedBy: string;
  employeeSignature?: string;
  managerSignature: string;
  status: "Active" | "Resolved";
}

interface AppContextProps {
  currentUser: User | null;
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
  issueWarning: (warning: Omit<Warning, "id" | "issuedBy" | "employeeName" | "details" | "status">) => void;
  addPolicy: (policy: Omit<Policy, "id">) => void;
  setNavigation: (screen: string, policyId?: string | null) => void;
  setActiveTab: (tab: string) => void;
  setSelectedEmployeeId: (employeeId: string | null) => void;
  login: (email: string, password?: string) => boolean;
  signup: (name: string, email: string, role: UserRole, title: string, password?: string) => void;
  logout: () => void;
  updateWarningStatus: (warningId: string, status: "Active" | "Resolved") => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Initial Seed Users
const INITIAL_USERS: User[] = [
  {
    id: "emp1",
    name: "Marcus Miller",
    role: "employee",
    email: "marcus@movingdan.com",
    title: "Professional Mover & Driver",
    avatar: "MM",
    password: "password",
  },
  {
    id: "emp2",
    name: "Sarah Jenkins",
    role: "employee",
    email: "sarah@movingdan.com",
    title: "Mover & Packing Specialist",
    avatar: "SJ",
    password: "password",
  },
  {
    id: "emp3",
    name: "Lamar Washington",
    role: "employee",
    email: "lamar@movingdan.com",
    title: "Crew Lead & Heavy Lifting Expert",
    avatar: "LW",
    password: "password",
  },
  {
    id: "emp4",
    name: "David Cooper",
    role: "employee",
    email: "david@movingdan.com",
    title: "Mover / Driver",
    avatar: "DC",
    password: "password",
  },
  {
    id: "emp5",
    name: "Alex Johnson",
    role: "employee",
    email: "alex@movingdan.com",
    title: "Professional Mover & Driver",
    avatar: "AJ",
    password: "password",
  },
  {
    id: "mgr1",
    name: "Dan Stevens",
    role: "manager",
    email: "dan@movingdan.com",
    title: "Owner / Operations Manager",
    avatar: "DS",
    password: "password",
  },
];

// Initial Seed Policies
const POLICIES: Policy[] = [
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
Within **four (4) hours of the incident, file a formal Incident/Damage Report via the app or email. Include photos, customer name, date, item description, and crew members present.`,
  },
];

// Initial Seed Signatures
const INITIAL_SIGNATURES: Signature[] = [
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
];

// Initial Seed Warnings (including Alex Johnson mockup history)
const INITIAL_WARNINGS: Warning[] = [
  {
    id: "wrn-alex-1",
    employeeId: "emp5",
    employeeName: "Alex Johnson",
    date: "May 22, 2024 10:45 AM",
    warningType: "Damage",
    cost: 750,
    incidentDetails: "Backed into client's fence while exiting driveway.",
    damageDate: "May 22, 2024",
    damageCost: "750.00",
    additionalNotes: "Client provided estimate for repairs. Will follow up if additional costs are needed.",
    photos: ["/mock_damage_fence.jpg", "/mock_damage_truck.jpg"],
    severity: "Written",
    details: "Backed into client's fence while exiting driveway.",
    issuedBy: "Dan Stevens",
    managerSignature: "MOCK_DAN_SIG",
    status: "Active",
  },
  {
    id: "wrn-alex-2",
    employeeId: "emp5",
    employeeName: "Alex Johnson",
    date: "May 10, 2024 09:15 AM",
    warningType: "Late",
    cost: 50,
    incidentDetails: "Arrived late to work shift.",
    severity: "Written",
    details: "Arrived late to work shift.",
    issuedBy: "Dan Stevens",
    managerSignature: "MOCK_DAN_SIG",
    status: "Active",
  },
  {
    id: "wrn-alex-3",
    employeeId: "emp5",
    employeeName: "Alex Johnson",
    date: "Apr 28, 2024 08:00 AM",
    warningType: "Call In / No Show",
    cost: 100,
    incidentDetails: "Missed scheduled shift without timely notice.",
    severity: "Written",
    details: "Missed scheduled shift without timely notice.",
    issuedBy: "Dan Stevens",
    managerSignature: "MOCK_DAN_SIG",
    status: "Resolved",
  },
  {
    id: "wrn-alex-4",
    employeeId: "emp5",
    employeeName: "Alex Johnson",
    date: "Apr 18, 2024 02:30 PM",
    warningType: "Not Following Rules",
    cost: 0,
    incidentDetails: "Failed to wear safety harness.",
    severity: "Verbal",
    details: "Failed to wear safety harness.",
    issuedBy: "Dan Stevens",
    managerSignature: "MOCK_DAN_SIG",
    status: "Resolved",
  },
  {
    id: "wrn1",
    employeeId: "emp3",
    employeeName: "Lamar Washington",
    date: "Jun 12, 2026 07:00 AM",
    warningType: "Late",
    cost: 50,
    incidentDetails: "Lamar arrived 45 minutes late for the dispatch of the Johnson house move, causing the entire crew to be delayed.",
    severity: "Written",
    details: "Lamar arrived 45 minutes late for the dispatch of the Johnson house move, causing the entire crew to be delayed.",
    issuedBy: "Dan Stevens",
    managerSignature: "MOCK_DAN_SIG",
    status: "Active",
  },
  {
    id: "wrn2",
    employeeId: "emp1",
    employeeName: "Marcus Miller",
    date: "Jun 28, 2026 04:30 PM",
    warningType: "Damage",
    cost: 750,
    incidentDetails: "Marcus scraped a hallway wall while moving a heavy dresser. Minor drywall scuffs occurred. Customer was notified, and Marcus reported it promptly.",
    damageDate: "May 22, 2024",
    damageCost: "750.00",
    additionalNotes: "Marcus reported it promptly.",
    severity: "Verbal",
    details: "Marcus scraped a hallway wall while moving a heavy dresser.",
    issuedBy: "Dan Stevens",
    employeeSignature: "MOCK_MARCUS_SIG",
    managerSignature: "MOCK_DAN_SIG",
    status: "Active",
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>(INITIAL_SIGNATURES);
  const [warnings, setWarnings] = useState<Warning[]>(INITIAL_WARNINGS);
  const [policies, setPolicies] = useState<Policy[]>(POLICIES);

  // Navigation states
  const [currentScreen, setCurrentScreen] = useState<string>("home");
  const [activeTab, setActiveTabInternal] = useState<string>("home");
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount (hydration safe)
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const savedUsers = localStorage.getItem("users");
    const savedSignatures = localStorage.getItem("signatures");
    const savedWarnings = localStorage.getItem("warnings");
    const savedPolicies = localStorage.getItem("policies");

    if (savedUsers) {
      try { setUsers(JSON.parse(savedUsers)); } catch (e) {}
    }
    if (savedPolicies) {
      try { setPolicies(JSON.parse(savedPolicies)); } catch (e) {}
    }
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } catch (e) {}
    }
    if (savedSignatures) {
      try { setSignatures(JSON.parse(savedSignatures)); } catch (e) {}
    }
    if (savedWarnings) {
      try { setWarnings(JSON.parse(savedWarnings)); } catch (e) {}
    }
    setIsLoading(false);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      if (currentUser) {
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("currentUser");
      }
    }
  }, [currentUser, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("signatures", JSON.stringify(signatures));
    }
  }, [signatures, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("warnings", JSON.stringify(warnings));
    }
  }, [warnings, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("policies", JSON.stringify(policies));
    }
  }, [policies, isLoading]);

  // Login handler
  const login = (email: string, password?: string): boolean => {
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (foundUser) {
      setCurrentUser(foundUser);
      setActiveTabInternal("home");
      setCurrentScreen("home");
      return true;
    }
    return false;
  };

  // Signup handler
  const signup = (
    name: string,
    email: string,
    role: UserRole,
    title: string,
    password?: string
  ) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    const newUser: User = {
      id: `emp-${Date.now()}`,
      name,
      email,
      role,
      title,
      avatar: initials || "U",
      password: password || "password",
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setActiveTabInternal("home");
    setCurrentScreen("home");
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setCurrentScreen("home");
    setActiveTabInternal("home");
  };

  // Warning Status Toggle handler
  const updateWarningStatus = (warningId: string, status: "Active" | "Resolved") => {
    setWarnings((prev) =>
      prev.map((w) => (w.id === warningId ? { ...w, status } : w))
    );
  };

  // Role switching sandbox helper
  const switchRole = (role: UserRole) => {
    if (role === "manager") {
      const mgr = users.find((u) => u.role === "manager") || users[users.length - 1];
      setCurrentUser(mgr);
    } else {
      const emp = users.find((u) => u.role === "employee" && u.id !== "emp5") || users[0];
      setCurrentUser(emp);
    }
    setActiveTabInternal("home");
    setCurrentScreen("home");
  };

  // Impersonation login helper
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
    const newId = `emp-${Date.now()}`;
    const initials = employeeData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    const newEmployee: User = {
      ...employeeData,
      id: newId,
      avatar: initials,
      password: "password",
    };

    setUsers((prev) => [...prev, newEmployee]);
  };

  // Sign policy (Employee-only)
  const signPolicy = (policyId: string, signatureData: string) => {
    if (!currentUser) return;
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
  const issueWarning = (warningData: Omit<Warning, "id" | "issuedBy" | "employeeName" | "details" | "status">) => {
    if (!currentUser) return;
    const targetEmployee = users.find((u) => u.id === warningData.employeeId);
    
    // Use warningData.date if provided, otherwise generate a default
    let finalDate = warningData.date;
    if (!finalDate) {
      const now = new Date();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[now.getMonth()];
      const day = now.getDate();
      const year = now.getFullYear();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // key hours starting from 12 instead of 0
      finalDate = `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
    }

    const now = new Date();
    const newWarning: Warning = {
      ...warningData,
      id: `WW-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(warnings.length + 1).padStart(3, '0')}`,
      employeeName: targetEmployee ? targetEmployee.name : "Unknown Employee",
      date: finalDate,
      issuedBy: currentUser.name,
      status: "Active",
      details: warningData.incidentDetails || "",
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
    setCurrentScreen("home");
  };

  const addPolicy = (policyData: Omit<Policy, "id">) => {
    const newPolicy: Policy = {
      ...policyData,
      id: `policy-${Date.now()}`
    };
    setPolicies((prev) => [...prev, newPolicy]);
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
        setSelectedEmployeeId,
        login,
        signup,
        logout,
        updateWarningStatus,
        isLoading,
        addPolicy,
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
