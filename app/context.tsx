"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  auth, 
  db, 
  onAuthStateChanged,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getAllPolicies,
  getEmployeeSignatures,
  getAllSignatures,
  getAllWarnings,
  createSignature,
  createWarning,
  createUserProfile,
  createPolicy,
  updateWarning,
  type FirebaseUser
} from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

// Types
export type UserRole = "employee" | "manager";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
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

export interface ChatGroup {
  id: string;
  name: string;
  createdBy: string;
  createdByName: string;
  memberIds: string[];
  members?: User[]; // Populated from memberIds
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    timestamp: string;
  };
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
  readBy: string[];
}

interface AppContextProps {
  currentUser: User | null;
  users: User[];
  policies: Policy[];
  signatures: Signature[];
  warnings: Warning[];
  chatGroups: ChatGroup[];
  messages: Record<string, ChatMessage[]>; // groupId -> messages
  unreadCounts: Record<string, number>; // groupId -> count
  currentScreen: string; // navigation
  activeTab: string; // bottom navigation
  selectedPolicyId: string | null;
  selectedEmployeeId: string | null; // for warning detail or profile
  switchRole: (role: UserRole) => void;
  loginAs: (userId: string) => void;
  addEmployee: (employee: Omit<User, "id" | "avatar"> & { password?: string; phone?: string }) => Promise<void>;
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
  signWarning: (warningId: string, signatureData: string) => Promise<void>;
  disableUser: (userId: string, disabled: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>; // Refresh all data from Firebase
  createChatGroup: (name: string, memberIds: string[]) => Promise<void>;
  sendMessage: (groupId: string, text: string) => Promise<void>;
  loadGroupMessages: (groupId: string) => Promise<void>;
  markMessagesAsRead: (groupId: string) => Promise<void>;
  deleteChatGroup: (groupId: string) => Promise<void>;
  deleteMessage: (messageId: string, groupId: string) => Promise<void>;
  addMembersToGroup: (groupId: string, memberIds: string[]) => Promise<void>;
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
    phone: "+1 (555) 019-2831",
    title: "Professional Mover & Driver",
    avatar: "MM",
    password: "password",
  },
  {
    id: "emp2",
    name: "Sarah Jenkins",
    role: "employee",
    email: "sarah@movingdan.com",
    phone: "+1 (555) 019-2832",
    title: "Mover & Packing Specialist",
    avatar: "SJ",
    password: "password",
  },
  {
    id: "emp3",
    name: "Lamar Washington",
    role: "employee",
    email: "lamar@movingdan.com",
    phone: "+1 (555) 019-2833",
    title: "Crew Lead & Heavy Lifting Expert",
    avatar: "LW",
    password: "password",
  },
  {
    id: "emp4",
    name: "David Cooper",
    role: "employee",
    email: "david@movingdan.com",
    phone: "+1 (555) 019-2834",
    title: "Mover / Driver",
    avatar: "DC",
    password: "password",
  },
  {
    id: "emp5",
    name: "Alex Johnson",
    role: "employee",
    email: "alex@movingdan.com",
    phone: "+1 (555) 019-2835",
    title: "Professional Mover & Driver",
    avatar: "AJ",
    password: "password",
  },
  {
    id: "mgr1",
    name: "Dan Stevens",
    role: "manager",
    email: "dan@movingdan.com",
    phone: "+1 (555) 019-2800",
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>(INITIAL_SIGNATURES);
  const [warnings, setWarnings] = useState<Warning[]>(INITIAL_WARNINGS);
  const [policies, setPolicies] = useState<Policy[]>([]); // Start with empty array, load from Firebase

  // Chat states
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Navigation states
  const [currentScreen, setCurrentScreen] = useState<string>("home");
  const [activeTab, setActiveTabInternal] = useState<string>("home");
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useFirebase, setUseFirebase] = useState<boolean | null>(null); // null = not yet determined

  // Check if Firebase is configured
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const isConfigured = !!apiKey && apiKey !== "your-api-key-here";
    setUseFirebase(isConfigured);
  }, []);

  // Firebase Auth Listener - Updated to use server-side session
  useEffect(() => {
    // Wait until we know if Firebase is configured
    if (useFirebase === null) {
      return;
    }

    if (useFirebase === false) {
      // Use localStorage for demo mode
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
      return;
    }

    // Firebase mode - Load session from server-side cookie
    (async () => {
      try {
        const response = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'include', // Important: include cookies in request
        });
        
        if (!response.ok) {
          console.error('[Context] Session API returned error:', response.status);
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();

        if (data.session && data.session.user) {
          const user = data.session.user;
          setCurrentUser(user);

          // Load all data based on role
          if (user.role === 'manager') {
            // Managers get all data
            const [allUsers, allPolicies, allWarnings, allSignatures] = await Promise.all([
              getAllUsers(),
              getAllPolicies(),
              getAllWarnings(),
              getAllSignatures(),
            ]);

            setUsers(allUsers as User[]);
            setPolicies(allPolicies as Policy[]);
            setWarnings(allWarnings as Warning[]);
            setSignatures(allSignatures.map((sig: any) => ({
              policyId: sig.policyId,
              employeeId: sig.employeeId,
              signedAt: sig.signedAt || new Date().toISOString(),
              signatureData: sig.signatureData
            })));
          } else if (user.role === 'employee') {
            // Employees get limited data
            const employeeResponse = await fetch('/api/employee-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ employeeId: user.id }),
              cache: 'no-store',
            });

            const employeeData = await employeeResponse.json();

            if (employeeData.success) {
              setPolicies(employeeData.policies);
              
              const mappedSignatures = employeeData.signatures.map((sig: any) => ({
                policyId: sig.policyId,
                employeeId: sig.employeeId,
                signedAt: sig.signedAt || new Date().toISOString(),
                signatureData: sig.signatureData
              }));
              setSignatures(mappedSignatures);

              if (employeeData.warnings) {
                setWarnings(employeeData.warnings as Warning[]);
              }
            }
          }
        } else {
          // No session
          setCurrentUser(null);
          setUsers(INITIAL_USERS);
          setPolicies([]);
          setSignatures(INITIAL_SIGNATURES);
          setWarnings(INITIAL_WARNINGS);
        }
      } catch (error) {
        console.error("[Context] Error loading session:", error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [useFirebase]);

  // Sync to localStorage only in demo mode
  useEffect(() => {
    if (!isLoading && useFirebase === false) {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users, isLoading, useFirebase]);

  useEffect(() => {
    if (!isLoading && useFirebase === false) {
      if (currentUser) {
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("currentUser");
      }
    }
  }, [currentUser, isLoading, useFirebase]);

  useEffect(() => {
    if (!isLoading && useFirebase === false) {
      localStorage.setItem("signatures", JSON.stringify(signatures));
    }
  }, [signatures, isLoading, useFirebase]);

  useEffect(() => {
    if (!isLoading && useFirebase === false) {
      localStorage.setItem("warnings", JSON.stringify(warnings));
    }
  }, [warnings, isLoading, useFirebase]);

  useEffect(() => {
    if (!isLoading && useFirebase === false) {
      localStorage.setItem("policies", JSON.stringify(policies));
    }
  }, [policies, isLoading, useFirebase]);

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
  const logout = async () => {
    try {
      // Call server action to delete session cookie
      const { logout: logoutAction } = await import("@/app/actions/auth");
      await logoutAction();
    } catch (error: any) {
      // NEXT_REDIRECT is not an error - it's how Next.js handles redirects in server actions
      if (error?.message?.includes('NEXT_REDIRECT') || error?.digest?.startsWith('NEXT_REDIRECT')) {
        // This is expected - the redirect is happening
        return;
      }
      
      console.error("Error during logout:", error);
      // Still clear local state even if server action fails
      setCurrentUser(null);
      setCurrentScreen("home");
      setActiveTabInternal("home");
    }
  };

  // Warning Status Toggle handler - Firebase integrated
  const updateWarningStatus = async (warningId: string, status: "Active" | "Resolved") => {
    if (useFirebase === true) {
      try {
        await updateWarning(warningId, { status });
        const allWarnings = await getAllWarnings();
        setWarnings(allWarnings as Warning[]);
      } catch (error) {
        console.error("Error updating warning status:", error);
      }
    } else {
      setWarnings((prev) =>
        prev.map((w) => (w.id === warningId ? { ...w, status } : w))
      );
    }
  };

  // Sign Warning (Employee acknowledgment)
  const signWarning = async (warningId: string, signatureData: string) => {
    if (useFirebase === true) {
      try {
        const response = await fetch('/api/warnings/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ warningId, employeeSignature: signatureData })
        });

        if (!response.ok) {
          throw new Error('Failed to sign warning');
        }

        // Refresh warnings to get updated data
        await refreshData();
      } catch (error) {
        console.error("Error signing warning:", error);
        throw error;
      }
    } else {
      // Mock mode
      setWarnings((prev) =>
        prev.map((w) => (w.id === warningId ? { ...w, employeeSignature: signatureData } : w))
      );
    }
  };

  // ==========================================
  // Chat Functions
  // ==========================================

  // Create Chat Group
  const createChatGroup = async (name: string, memberIds: string[]) => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      const response = await fetch('/api/chat/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          createdBy: currentUser.id,
          createdByName: currentUser.name,
          memberIds: [...memberIds, currentUser.id], // Include creator
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create chat group');
      }

      const data = await response.json();
      
      // Reload groups
      await loadUserChatGroups();
      
      return data.groupId;
    } catch (error) {
      console.error("Error creating chat group:", error);
      throw error;
    }
  };

  // Load User's Chat Groups
  const loadUserChatGroups = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/chat/groups/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (!response.ok) {
        throw new Error('Failed to load chat groups');
      }

      const data = await response.json();
      
      // Populate member details
      const groupsWithMembers = data.groups.map((group: ChatGroup) => ({
        ...group,
        members: users.filter(u => group.memberIds.includes(u.id))
      }));
      
      setChatGroups(groupsWithMembers);
      
      // Calculate unread counts
      calculateUnreadCounts(groupsWithMembers);
    } catch (error) {
      console.error("Error loading chat groups:", error);
    }
  };

  // Send Message
  const sendMessage = async (groupId: string, text: string) => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      const response = await fetch('/api/chat/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          text,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Reload messages for this group
      await loadGroupMessages(groupId);
      
      // Reload groups to update lastMessage
      await loadUserChatGroups();
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  // Load Group Messages
  const loadGroupMessages = async (groupId: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${groupId}`);

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      
      setMessages(prev => ({
        ...prev,
        [groupId]: data.messages
      }));
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Mark Messages as Read
  const markMessagesAsRead = async (groupId: string) => {
    if (!currentUser) return;

    try {
      // Update readBy locally immediately for better UX
      setMessages(prev => {
        const groupMessages = prev[groupId] || [];
        const updatedMessages = groupMessages.map(msg => ({
          ...msg,
          readBy: msg.readBy.includes(currentUser.id) 
            ? msg.readBy 
            : [...msg.readBy, currentUser.id]
        }));
        
        return {
          ...prev,
          [groupId]: updatedMessages
        };
      });

      // Update unread count
      setUnreadCounts(prev => ({
        ...prev,
        [groupId]: 0
      }));

      // TODO: Call API to update readBy in Firestore
      // For now, it's handled client-side
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Delete Chat Group
  const deleteChatGroup = async (groupId: string) => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      const response = await fetch('/api/chat/groups/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete group');
      }

      // Remove group from local state
      setChatGroups(prev => prev.filter(g => g.id !== groupId));
      
      // Remove messages for this group
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[groupId];
        return newMessages;
      });
      
      // Remove unread count
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[groupId];
        return newCounts;
      });
    } catch (error) {
      console.error("Error deleting group:", error);
      throw error;
    }
  };

  // Delete Message
  const deleteMessage = async (messageId: string, groupId: string) => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      const response = await fetch('/api/chat/messages/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, groupId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      // Remove message from local state
      setMessages(prev => ({
        ...prev,
        [groupId]: (prev[groupId] || []).filter(m => m.id !== messageId)
      }));
      
      // Reload groups to update lastMessage
      await loadUserChatGroups();
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  };

  // Add Members to Group
  const addMembersToGroup = async (groupId: string, memberIds: string[]) => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      const response = await fetch('/api/chat/groups/add-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, memberIds })
      });

      if (!response.ok) {
        throw new Error('Failed to add members to group');
      }

      // Reload groups to update member list
      await loadUserChatGroups();
    } catch (error) {
      console.error("Error adding members to group:", error);
      throw error;
    }
  };

  // Calculate Unread Counts
  const calculateUnreadCounts = (groups: ChatGroup[]) => {
    if (!currentUser) return;

    const counts: Record<string, number> = {};
    
    groups.forEach(group => {
      const groupMessages = messages[group.id] || [];
      const unreadCount = groupMessages.filter(
        msg => !msg.readBy.includes(currentUser.id) && msg.senderId !== currentUser.id
      ).length;
      
      counts[group.id] = unreadCount;
    });
    
    setUnreadCounts(counts);
  };

  // Load chat groups when user changes
  useEffect(() => {
    if (currentUser && useFirebase === true) {
      loadUserChatGroups();
    }
  }, [currentUser, useFirebase]);

  // Recalculate unread counts when messages change
  useEffect(() => {
    calculateUnreadCounts(chatGroups);
  }, [messages, chatGroups, currentUser]);

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

  // Add Employee (Manager-only) - Updated with email sending via Resend
  const addEmployee = async (employeeData: Omit<User, "id" | "avatar"> & { password?: string; phone?: string }) => {
    const initials = employeeData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    if (useFirebase === true && employeeData.role === "manager") {
      // Managers use Firebase Auth
      try {
        // Create Firebase Authentication account via API (doesn't log out admin)
        if (employeeData.password && employeeData.email) {
          const response = await fetch('/api/admin/create-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: employeeData.email,
              password: employeeData.password,
              name: employeeData.name,
              role: employeeData.role,
              title: employeeData.title,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to create user account');
          }

          // Create user profile in Firestore with the Firebase UID
          await createUserProfile(data.userId, {
            name: employeeData.name,
            email: employeeData.email,
            phone: employeeData.phone || "",
            role: employeeData.role,
            title: employeeData.title,
            avatar: initials,
          });
        }
        
        // Reload all users
        const allUsers = await getAllUsers();
        setUsers(allUsers as User[]);
      } catch (error) {
        console.error("Error adding manager:", error);
        throw error; // Re-throw to let the form handle it
      }
    } else {
      // Employees use simple phone + password (no Firebase Auth)
      try {
        const newId = `emp-${Date.now()}`;
        const newEmployee: User = {
          ...employeeData,
          id: newId,
          avatar: initials,
          phone: employeeData.phone || "",
          password: employeeData.password, // Store password for non-Firebase auth
        };
        
        if (useFirebase === true) {
          // Store in Firestore (for persistence) but no Firebase Auth
          await createUserProfile(newId, {
            name: newEmployee.name,
            email: newEmployee.email,
            phone: newEmployee.phone || "",
            role: newEmployee.role,
            title: newEmployee.title,
            avatar: initials,
            password: employeeData.password, // Include password for employees
          });
          const allUsers = await getAllUsers();
          setUsers(allUsers as User[]);
        } else {
          // Demo mode - just add to local state
          setUsers((prev) => [...prev, newEmployee]);
        }

        // Send welcome email with credentials
        if (employeeData.email && employeeData.phone && employeeData.password) {
          try {
            await fetch('/api/send-welcome-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: employeeData.email,
                employeeName: employeeData.name,
                phone: employeeData.phone,
                password: employeeData.password,
              }),
            });
          } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
            // Don't throw - employee creation was successful
          }
        }
      } catch (error) {
        console.error("Error adding employee:", error);
        throw error;
      }
    }
  };

  // Sign policy (Employee-only) - Uses API route for server-side operations
  const signPolicy = async (policyId: string, signatureData: string) => {
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

    if (useFirebase === true) {
      try {
        // Use API route for server-side signing (works for both employees and managers)
        const response = await fetch('/api/sign-policy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            policyId,
            employeeId: currentUser.id,
            signatureData,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to sign policy');
        }

        // Reload employee signatures via API (for employees) or direct query (for managers)
        if (currentUser.role === 'employee') {
          const dataResponse = await fetch('/api/employee-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ employeeId: currentUser.id }),
          });

          const employeeData = await dataResponse.json();

          if (employeeData.success) {
            const mappedSignatures = employeeData.signatures.map((sig: any) => ({
              policyId: sig.policyId,
              employeeId: sig.employeeId,
              signedAt: sig.signedAt || new Date().toISOString(),
              signatureData: sig.signatureData
            }));
            setSignatures(mappedSignatures);
          }
        } else if (firebaseUser) {
          // For managers, reload all signatures
          const allSignatures = await getAllSignatures();
          const mappedSignatures = allSignatures.map((sig: any) => ({
            policyId: sig.policyId,
            employeeId: sig.employeeId,
            signedAt: sig.signedAt || new Date().toISOString(),
            signatureData: sig.signatureData
          }));
          setSignatures(mappedSignatures);
        }
      } catch (error: any) {
        console.error("Error signing policy:", error);
        alert(`Failed to sign policy: ${error.message || "Unknown error"}`);
      }
    } else {
      // Demo mode - just add to local state
      setSignatures((prev) => [...prev, newSig]);
    }
  };

  // Issue Written Warning (Manager-only) - Firebase integrated
  const issueWarning = async (warningData: Omit<Warning, "id" | "issuedBy" | "employeeName" | "details" | "status">) => {
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

    if (useFirebase === true) {
      try {
        // Build the warning object for Firestore, excluding undefined fields
        const firestoreWarning: any = {
          employeeId: newWarning.employeeId,
          employeeName: newWarning.employeeName,
          date: newWarning.date,
          warningType: newWarning.warningType,
          cost: newWarning.cost,
          incidentDetails: newWarning.incidentDetails,
          severity: newWarning.severity,
          issuedBy: newWarning.issuedBy,
          managerSignature: newWarning.managerSignature,
        };

        // Only add optional fields if they exist and are not undefined
        if (newWarning.photos && newWarning.photos.length > 0) {
          firestoreWarning.photos = newWarning.photos;
        }
        if (newWarning.damageDate) {
          firestoreWarning.damageDate = newWarning.damageDate;
        }
        if (newWarning.damageCost) {
          firestoreWarning.damageCost = newWarning.damageCost;
        }
        if (newWarning.additionalNotes) {
          firestoreWarning.additionalNotes = newWarning.additionalNotes;
        }
        if (newWarning.employeeSignature) {
          firestoreWarning.employeeSignature = newWarning.employeeSignature;
        }

        await createWarning(firestoreWarning);
        const allWarnings = await getAllWarnings();
        setWarnings(allWarnings as Warning[]);
      } catch (error: any) {
        console.error("Error issuing warning:", error);
        alert(`Failed to issue warning: ${error.message || "Unknown error"}`);
      }
    } else {
      setWarnings((prev) => [newWarning, ...prev]);
    }
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

  const addPolicy = async (policyData: Omit<Policy, "id">) => {
    if (useFirebase === true) {
      try {
        await createPolicy(policyData);
        const allPolicies = await getAllPolicies();
        setPolicies(allPolicies as Policy[]);
      } catch (error) {
        console.error("Error adding policy:", error);
      }
    } else {
      const newPolicy: Policy = {
        ...policyData,
        id: `policy-${Date.now()}`
      };
      setPolicies((prev) => [...prev, newPolicy]);
    }
  };

  // Disable/Enable User (Manager-only)
  const disableUser = async (userId: string, disabled: boolean) => {
    if (useFirebase === true) {
      try {
        const response = await fetch('/api/admin/disable-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, disabled }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update user status');
        }

        // Update user in Firestore
        await updateUserProfile(userId, { disabled });
        
        // Reload users
        const allUsers = await getAllUsers();
        setUsers(allUsers as User[]);
      } catch (error: any) {
        console.error("Error updating user status:", error);
        throw error;
      }
    } else {
      // Demo mode - just update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, disabled } : u))
      );
    }
  };

  // Delete User (Manager-only)
  const deleteUser = async (userId: string) => {
    if (useFirebase === true) {
      try {
        // Note: Deleting from Firebase Auth requires Admin SDK or the user's own ID token
        // For now, we can only delete from Firestore
        // In production, set up Firebase Admin SDK in API route
        
        // Delete from Firestore
        if (db) {
          const userDocRef = doc(db, "users", userId);
          await deleteDoc(userDocRef);
        }
        
        // Show warning to user about auth account
        console.warn('User deleted from Firestore. Firebase Auth account still exists. To fully delete, use Firebase Console or implement Admin SDK.');
        
        // Reload users
        const allUsers = await getAllUsers();
        setUsers(allUsers as User[]);
      } catch (error: any) {
        console.error("Error deleting user:", error);
        throw error;
      }
    } else {
      // Demo mode
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  // Refresh all data from Firebase (for use after CRUD operations)
  const refreshData = async () => {
    if (useFirebase !== true || !firebaseUser) return;

    try {
      // Reload all data from Firebase
      const [allUsers, allPolicies, allWarnings] = await Promise.all([
        getAllUsers(),
        getAllPolicies(),
        getAllWarnings(),
      ]);

      setUsers(allUsers as User[]);
      setPolicies(allPolicies as Policy[]);
      setWarnings(allWarnings as Warning[]);

      // Reload signatures
      const userProfile = await getUserProfile(firebaseUser.uid);
      if (userProfile) {
        const isManager = (userProfile as any).role === "manager";
        const signaturesData = isManager 
          ? await getAllSignatures()
          : await getEmployeeSignatures(firebaseUser.uid);
        
        const mappedSignatures = signaturesData.map((sig: any) => ({
          policyId: sig.policyId,
          employeeId: sig.employeeId,
          signedAt: sig.signedAt || new Date().toISOString(),
          signatureData: sig.signatureData
        }));
        setSignatures(mappedSignatures);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        policies,
        signatures,
        warnings,
        chatGroups,
        messages,
        unreadCounts,
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
        signWarning,
        disableUser,
        deleteUser,
        refreshData,
        createChatGroup,
        sendMessage,
        loadGroupMessages,
        markMessagesAsRead,
        deleteChatGroup,
        deleteMessage,
        addMembersToGroup,
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
