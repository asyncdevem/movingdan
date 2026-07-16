// Firebase Client SDK Configuration
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { 
  getStorage, 
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (client-side only)
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

// Only initialize on client side
if (typeof window !== "undefined") {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

// Safe exports with type assertions for client-side usage
export { auth, db, storage, onAuthStateChanged };
export type { FirebaseUser };

// ==========================================
// Authentication Helpers
// ==========================================

export const signUpWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error("Firebase not initialized");
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error("Firebase not initialized");
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  if (!auth) throw new Error("Firebase not initialized");
  return await firebaseSignOut(auth);
};

export const updatePassword = async (newPassword: string) => {
  if (!auth) throw new Error("Firebase not initialized");
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return await firebaseUpdatePassword(user, newPassword);
};

// Phone Authentication Setup
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  if (!auth) throw new Error("Firebase not initialized");
  return new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved
    },
  });
};

export const sendPhoneVerification = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
) => {
  if (!auth) throw new Error("Firebase not initialized");
  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

export const verifyPhoneCode = async (verificationId: string, code: string) => {
  if (!auth) throw new Error("Firebase not initialized");
  const credential = PhoneAuthProvider.credential(verificationId, code);
  return await signInWithCredential(auth, credential);
};

// ==========================================
// Firestore Database Helpers
// ==========================================

export const createUserProfile = async (userId: string, userData: {
  name: string;
  email: string;
  phone?: string;
  role: "employee" | "manager";
  title: string;
  avatar: string;
  password?: string; // For employees who don't use Firebase Auth
}) => {
  if (!db) throw new Error("Firebase not initialized");
  await setDoc(doc(db, "users", userId), {
    ...userData,
    createdAt: serverTimestamp(),
    emailNotificationsEnabled: true,
    weeklyDigestEnabled: true,
  });
};

export const getUserProfile = async (userId: string) => {
  if (!db) throw new Error("Firebase not initialized");
  const docSnap = await getDoc(doc(db, "users", userId));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateUserProfile = async (userId: string, data: any) => {
  if (!db) throw new Error("Firebase not initialized");
  await updateDoc(doc(db, "users", userId), data);
};

export const getAllUsers = async () => {
  if (!db) throw new Error("Firebase not initialized");
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ==========================================
// Email Notifications Helpers
// ==========================================

export const scheduleWeeklyDigest = async (userId: string, data: {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  warningsSummary: any[];
  signaturesSummary: any[];
  weekStartDate: string;
  weekEndDate: string;
}) => {
  if (!db) throw new Error("Firebase not initialized");
  // Add to email queue collection for Cloud Function to process
  await addDoc(collection(db, "emailQueue"), {
    type: "weekly_digest",
    userId,
    data,
    status: "pending",
    scheduledFor: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
};

export const sendImmediateNotification = async (
  userId: string,
  type: "warning_issued" | "policy_added" | "signature_required",
  data: any
) => {
  if (!db) throw new Error("Firebase not initialized");
  await addDoc(collection(db, "emailQueue"), {
    type,
    userId,
    data,
    status: "pending",
    priority: "high",
    createdAt: serverTimestamp(),
  });
};

export const getEmailNotificationSettings = async (userId: string) => {
  if (!db) throw new Error("Firebase not initialized");
  const userDoc = await getDoc(doc(db, "users", userId));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      emailNotificationsEnabled: data.emailNotificationsEnabled ?? true,
      weeklyDigestEnabled: data.weeklyDigestEnabled ?? true,
      instantWarningAlerts: data.instantWarningAlerts ?? true,
    };
  }
  return {
    emailNotificationsEnabled: true,
    weeklyDigestEnabled: true,
    instantWarningAlerts: true,
  };
};

export const updateEmailNotificationSettings = async (
  userId: string,
  settings: {
    emailNotificationsEnabled?: boolean;
    weeklyDigestEnabled?: boolean;
    instantWarningAlerts?: boolean;
  }
) => {
  if (!db) throw new Error("Firebase not initialized");
  await updateDoc(doc(db, "users", userId), settings);
};

// ==========================================
// Sync Local Data to Firebase (Migration Helper)
// ==========================================

export const syncLocalDataToFirebase = async (
  users: any[],
  policies: any[],
  signatures: any[],
  warnings: any[]
) => {
  if (!db) throw new Error("Firebase not initialized");
  
  try {
    // Sync users
    for (const user of users) {
      await setDoc(doc(db, "users", user.id), user);
    }

    // Sync policies
    for (const policy of policies) {
      await setDoc(doc(db, "policies", policy.id), policy);
    }

    // Sync signatures
    for (const signature of signatures) {
      await addDoc(collection(db, "signatures"), signature);
    }

    // Sync warnings
    for (const warning of warnings) {
      await setDoc(doc(db, "warnings", warning.id), warning);
    }

    return { success: true };
  } catch (error) {
    console.error("Error syncing data:", error);
    return { success: false, error };
  }
};

// ==========================================
// Firebase Storage Helpers
// ==========================================

/**
 * Upload a file to Firebase Storage
 * @param file - File or Blob to upload
 * @param path - Storage path (e.g., 'warnings/photos/image.jpg')
 * @returns Download URL of uploaded file
 */
export const uploadFile = async (file: File | Blob, path: string): Promise<string> => {
  if (!storage) throw new Error("Firebase not initialized");
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

/**
 * Upload multiple files to Firebase Storage
 * @param files - Array of files to upload
 * @param basePath - Base storage path (e.g., 'warnings/photos')
 * @returns Array of download URLs
 */
export const uploadMultipleFiles = async (
  files: File[] | Blob[],
  basePath: string
): Promise<string[]> => {
  if (!storage) throw new Error("Firebase not initialized");
  const uploadPromises = files.map((file, index) => {
    const timestamp = Date.now();
    const fileName = file instanceof File ? file.name : `file-${index}`;
    const path = `${basePath}/${timestamp}-${fileName}`;
    return uploadFile(file, path);
  });
  
  return await Promise.all(uploadPromises);
};

/**
 * Delete a file from Firebase Storage
 * @param url - Download URL of the file to delete
 */
export const deleteFile = async (url: string): Promise<void> => {
  if (!storage) throw new Error("Firebase not initialized");
  const storageRef = ref(storage, url);
  await deleteObject(storageRef);
};

/**
 * Upload warning photos
 * @param warningId - Warning document ID
 * @param photos - Array of photo files
 * @returns Array of photo URLs
 */
export const uploadWarningPhotos = async (
  warningId: string,
  photos: File[]
): Promise<string[]> => {
  return await uploadMultipleFiles(photos, `warnings/${warningId}/photos`);
};

/**
 * Upload signature image
 * @param userId - User ID
 * @param signatureBlob - Signature canvas blob
 * @returns Signature image URL
 */
export const uploadSignature = async (
  userId: string,
  signatureBlob: Blob
): Promise<string> => {
  const timestamp = Date.now();
  const path = `signatures/${userId}/${timestamp}.png`;
  return await uploadFile(signatureBlob, path);
};

// ==========================================
// Policies CRUD Operations
// ==========================================

export const createPolicy = async (policy: {
  title: string;
  shortDesc: string;
  iconName: string;
  content: string;
}) => {
  if (!db) throw new Error("Firebase not initialized");
  const docRef = await addDoc(collection(db, "policies"), {
    ...policy,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getPolicy = async (policyId: string) => {
  if (!db) throw new Error("Firebase not initialized");
  const docSnap = await getDoc(doc(db, "policies", policyId));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getAllPolicies = async () => {
  if (!db) throw new Error("Firebase not initialized");
  const querySnapshot = await getDocs(collection(db, "policies"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updatePolicy = async (policyId: string, data: any) => {
  if (!db) throw new Error("Firebase not initialized");
  await updateDoc(doc(db, "policies", policyId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deletePolicy = async (policyId: string) => {
  if (!db) throw new Error("Firebase not initialized");
  await deleteDoc(doc(db, "policies", policyId));
};

// ==========================================
// Signatures Operations
// ==========================================

export const createSignature = async (signature: {
  policyId: string;
  employeeId: string;
  signatureData: string;
}) => {
  if (!db) throw new Error("Firebase not initialized");
  const docRef = await addDoc(collection(db, "signatures"), {
    ...signature,
    signedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getEmployeeSignatures = async (employeeId: string) => {
  if (!db) throw new Error("Firebase not initialized");
  const q = query(
    collection(db, "signatures"),
    where("employeeId", "==", employeeId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      policyId: data.policyId,
      employeeId: data.employeeId,
      signatureData: data.signatureData,
      signedAt: data.signedAt?.toDate ? data.signedAt.toDate().toISOString() : new Date().toISOString(),
    };
  });
};

export const getAllSignatures = async () => {
  if (!db) throw new Error("Firebase not initialized");
  const querySnapshot = await getDocs(collection(db, "signatures"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      policyId: data.policyId,
      employeeId: data.employeeId,
      signatureData: data.signatureData,
      signedAt: data.signedAt?.toDate ? data.signedAt.toDate().toISOString() : new Date().toISOString(),
    };
  });
};

// ==========================================
// Warnings Operations
// ==========================================

export const createWarning = async (warning: {
  employeeId: string;
  employeeName: string;
  date: string;
  warningType: string;
  cost: number;
  incidentDetails: string;
  severity: string;
  issuedBy: string;
  managerSignature: string;
  photos?: string[];
}) => {
  if (!db) throw new Error("Firebase not initialized");
  const docRef = await addDoc(collection(db, "warnings"), {
    ...warning,
    status: "Active",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getEmployeeWarnings = async (employeeId: string) => {
  if (!db) throw new Error("Firebase not initialized");
  const q = query(
    collection(db, "warnings"),
    where("employeeId", "==", employeeId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getAllWarnings = async () => {
  if (!db) throw new Error("Firebase not initialized");
  const querySnapshot = await getDocs(collection(db, "warnings"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateWarning = async (warningId: string, data: any) => {
  if (!db) throw new Error("Firebase not initialized");
  await updateDoc(doc(db, "warnings", warningId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};
