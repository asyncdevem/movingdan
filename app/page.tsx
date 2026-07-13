"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useApp } from "./context";
import { HomeDashboard } from "./components/HomeDashboard";
import { PoliciesList } from "./components/PoliciesList";
import { PolicyDetail } from "./components/PolicyDetail";
import { WarningForm } from "./components/WarningForm";
import { AddEmployeeForm } from "./components/AddEmployeeForm";
import { ReportsDashboard } from "./components/ReportsDashboard";
import { SettingsView } from "./components/SettingsView";
import { AuthScreen } from "./components/AuthScreen";
import { FirebaseAuthScreen } from "./components/FirebaseAuthScreen";
import { AddPolicyForm } from "./components/AddPolicyForm";
import { 
  Home as HomeIcon, 
  Users as UsersIcon, 
  BarChart3 as ReportsIcon, 
  Settings as SettingsIcon,
  Search,
  Mail,
  UserPlus,
  AlertTriangle,
  Calendar,
  CheckCircle,
  FileCheck,
  ChevronRight,
  LogOut
} from "lucide-react";

// ==========================================
// 1. Employee Directory Tab (Responsive grid)
// ==========================================
const EmployeeDirectory: React.FC = () => {
  const { users, currentUser, signatures, policies, setNavigation, setSelectedEmployeeId, disableUser, deleteUser } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [actioningUserId, setActioningUserId] = useState<string | null>(null);
  const isManager = currentUser?.role === "manager";

  const directoryUsers = users.filter((u) => u.role === "employee");

  const filteredUsers = directoryUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBlockUser = async (userId: string, isDisabled: boolean) => {
    if (!confirm(`Are you sure you want to ${isDisabled ? 'unblock' : 'block'} this user?`)) return;
    
    setActioningUserId(userId);
    try {
      await disableUser(userId, !isDisabled);
      alert(`User ${isDisabled ? 'unblocked' : 'blocked'} successfully!`);
    } catch (error: any) {
      alert(`Failed to ${isDisabled ? 'unblock' : 'block'} user: ${error.message}`);
    } finally {
      setActioningUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    const confirmMsg = `⚠️ WARNING: This will remove the user from the directory, but their Firebase Authentication account will remain.

To fully delete (recommended):
1. Go to Firebase Console → Authentication
2. Find user: ${userEmail}
3. Click the 3 dots → Delete account

OR set up Firebase Admin SDK for complete deletion.

Do you want to remove this user from the directory?`;
    
    if (!confirm(confirmMsg)) return;
    
    setActioningUserId(userId);
    try {
      await deleteUser(userId);
      alert('✅ User removed from directory!\n\n⚠️ Note: Firebase Auth account still exists. To fully delete, use Firebase Console.');
    } catch (error: any) {
      alert(`Failed to delete user: ${error.message}`);
    } finally {
      setActioningUserId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 md:text-lg">Employee Directory</h2>
          <p className="hidden md:block text-[11px] text-zinc-500 font-semibold mt-0.5">Manage and view crew compliance records</p>
        </div>
        {isManager && (
          <button
            onClick={() => setNavigation("add-employee")}
            className="px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <UserPlus size={14} />
            Onboard Mover
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
        {/* Search Bar */}
        <div className="relative shrink-0 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950/10 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-zinc-800 placeholder-zinc-400 outline-none transition-all"
          />
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const signedCount = signatures.filter((s) => s.employeeId === user.id).length;
              const complianceRate = Math.round((signedCount / policies.length) * 100);

              return (
                <div
                  key={user.id}
                  className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {user.avatar}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-zinc-900 truncate">{user.name}</h4>
                        <p className="text-[11px] font-bold text-zinc-500 mt-0.5 truncate">{user.title}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col gap-1">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Compliance Status</span>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              complianceRate === 100 ? "bg-emerald-500" : complianceRate > 50 ? "bg-zinc-800" : "bg-primary"
                            }`}
                            style={{ width: `${complianceRate}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-black shrink-0 ${
                          complianceRate === 100 ? "text-emerald-600" : complianceRate > 50 ? "text-zinc-800" : "text-primary"
                        }`}>
                          {signedCount}/{policies.length} Signed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-150">
                    <span className="text-[10px] font-bold text-zinc-400 truncate block mb-3">{user.email}</span>
                    <div className="flex flex-col gap-2">
                      {isManager && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedEmployeeId(user.id);
                              setNavigation("warning-form");
                            }}
                            className="w-full inline-flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-primary hover:text-primary-hover bg-red-50 hover:bg-red-100 py-2 px-3 rounded-lg transition-colors border border-red-100 cursor-pointer shadow-3xs"
                          >
                            <AlertTriangle size={12} />
                            Issue Warning
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleBlockUser(user.id, (user as any).disabled || false)}
                              disabled={actioningUserId === user.id}
                              className="inline-flex items-center justify-center gap-1 text-[9px] font-black uppercase text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 py-1.5 px-2 rounded-lg transition-colors border border-amber-200 cursor-pointer disabled:opacity-50"
                            >
                              {actioningUserId === user.id ? "..." : (user as any).disabled ? "Unblock" : "Block"}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              disabled={actioningUserId === user.id}
                              className="inline-flex items-center justify-center gap-1 text-[9px] font-black uppercase text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 py-1.5 px-2 rounded-lg transition-colors border border-red-200 cursor-pointer disabled:opacity-50"
                            >
                              {actioningUserId === user.id ? "..." : "Delete"}
                            </button>
                          </div>
                        </>
                      )}
                      <a 
                        href={`mailto:${user.email}`} 
                        className="w-full inline-flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-zinc-700 hover:text-zinc-950 bg-zinc-105 hover:bg-zinc-200 py-2 px-3 rounded-lg transition-colors border border-zinc-200"
                      >
                        <Mail size={12} />
                        Email
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-zinc-200">
              <Search size={36} className="mx-auto text-zinc-300 mb-2" />
              <p className="text-xs font-semibold text-zinc-400">No team members found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. Personal Warnings Tab (Responsive style)
// ==========================================
const PersonalWarnings: React.FC = () => {
  const { currentUser, warnings } = useApp();
  
  if (!currentUser) return null;
  const myWarnings = warnings.filter((w) => w.employeeId === currentUser.id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 md:text-lg">My Compliance Record</h2>
          <p className="hidden md:block text-[11px] text-zinc-500 font-semibold mt-0.5">Track your safety record and notifications</p>
        </div>
        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider flex items-center gap-1">
          <CheckCircle size={10} />
          Active Account
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 max-w-4xl w-full mx-auto">
        
        {/* Profile Stats Summary */}
        <div className="bg-zinc-950 text-white rounded-2xl p-6 border border-zinc-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-red-500">Record Summary</span>
            <h3 className="text-3xl font-black mt-1">
              {myWarnings.length === 0 ? "Perfect Record" : `${myWarnings.length} Warnings Issued`}
            </h3>
            <p className="text-xs text-zinc-400 font-semibold mt-1">
              {myWarnings.length === 0 
                ? "Excellent job! You are fully compliant with all company standards and safety policies." 
                : "Please review infractions below. Reach out to Dan for resolution steps."}
            </p>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ml-4 ${
            myWarnings.length === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          }`}>
            <AlertTriangle size={28} />
          </div>
        </div>

        {/* Warning Logs List */}
        <div>
          <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-3">Infraction Notices</h4>
          <div className="flex flex-col gap-3 pb-10">
            {myWarnings.length > 0 ? (
              myWarnings.map((warning) => (
                <div key={warning.id} className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xs flex gap-4">
                  <div className="bg-red-50 text-primary p-3 rounded-xl h-12 w-12 flex items-center justify-center shrink-0">
                    <AlertTriangle size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-black text-zinc-900 uppercase tracking-tight">{warning.warningType || "Warning"}</h5>
                        <span className="text-[9px] font-black text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-150 font-mono tracking-tight">
                          {warning.id}
                        </span>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full ${
                        warning.severity === "Final Warning" 
                          ? "bg-red-105 text-red-700 border border-red-200" 
                          : "bg-zinc-900 text-white"
                      }`}>
                        {warning.severity}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 mt-1">Issued {warning.date} • Impact: ${warning.cost}</p>
                    <p className="text-xs text-zinc-650 leading-relaxed mt-3 bg-zinc-50 p-4 rounded-xl border border-zinc-150 italic text-zinc-700 font-semibold">
                      &quot;{warning.incidentDetails || warning.details}&quot;
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      <span>Issued by crew lead: {warning.issuedBy}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${
                        warning.status === "Active" ? "bg-red-50 text-red-650" : "bg-emerald-50 text-emerald-650"
                      }`}>
                        Status: {warning.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
                <CheckCircle size={36} className="mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-black text-zinc-800">You are in good standing!</p>
                <p className="text-xs text-zinc-400 mt-1">Keep adhering to SOP procedures and fleet guidelines.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// 3. Main Page Shell
// ==========================================
export default function Home() {
  const { currentScreen, activeTab, currentUser, setActiveTab, logout, isLoading } = useApp();

  // Determine whether to display navigation indicators
  const isManager = currentUser?.role === "manager";
  const hideBottomBar = ["policy-detail", "warning-form", "add-employee", "add-policy"].includes(currentScreen);

  // Render drill-down screens first, if active
  const renderScreen = () => {
    switch (currentScreen) {
      case "policy-list":
        return <PoliciesList />;
      case "policy-detail":
        return <PolicyDetail />;
      case "warning-form":
        return <WarningForm />;
      case "add-employee":
        return <AddEmployeeForm />;
      case "add-policy":
        return <AddPolicyForm />;
      case "report-view":
        return <ReportsDashboard />;
      default:
        return renderTab();
    }
  };

  // Render tab views
  const renderTab = () => {
    switch (activeTab) {
      case "employees":
        return <EmployeeDirectory />;
      case "reports":
        return isManager ? <ReportsDashboard /> : <PersonalWarnings />;
      case "settings":
        return <SettingsView />;
      case "home":
      default:
        return <HomeDashboard />;
    }
  };

  // Loading indicator
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-white select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Loading Portal...</p>
        </div>
      </div>
    );
  }

  // Auth gate with Firebase integration
  if (!currentUser) {
    return <FirebaseAuthScreen onAuthSuccess={async (userId) => {
      // Firebase auth succeeded - user will be loaded by auth listener in context
      console.log("Firebase auth successful for user:", userId);
    }} />;
  }

  return (
    <div className="flex h-screen w-screen bg-zinc-50 overflow-hidden">
      
      {/* ==========================================
          A. LEFT SIDEBAR (Desktop Screens Only)
          ========================================== */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-200 py-6 px-5 shrink-0 z-20">
        
        {/* Logo/Branding Header */}
        <div className="flex items-center gap-3 px-1 mb-8">
          <div className="relative w-10 h-10 shrink-0 bg-white border border-zinc-200 rounded-xl overflow-hidden flex items-center justify-center shadow-2xs">
            <Image
              src="/dan_mascot_logo.png"
              alt="Mascot Logo"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-xs font-black uppercase text-zinc-900 tracking-tight leading-tight">
              Dan <span className="text-primary">- Moving Man</span>
            </h1>
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 mt-0.5">
              Compliance Portal
            </span>
          </div>
        </div>

        {/* Navigation Tabs List */}
        <nav className="flex-1 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all cursor-pointer ${
              activeTab === "home"
                ? "bg-red-50 text-primary"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <HomeIcon size={16} strokeWidth={activeTab === "home" ? 2.5 : 2} />
            Home
          </button>

          <button
            onClick={() => setActiveTab("employees")}
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all cursor-pointer ${
              activeTab === "employees"
                ? "bg-red-50 text-primary"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <UsersIcon size={16} strokeWidth={activeTab === "employees" ? 2.5 : 2} />
            Directory
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all cursor-pointer ${
              activeTab === "reports"
                ? "bg-red-50 text-primary"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <ReportsIcon size={16} strokeWidth={activeTab === "reports" ? 2.5 : 2} />
            {isManager ? "Reports" : "Compliance"}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-red-50 text-primary"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <SettingsIcon size={16} strokeWidth={activeTab === "settings" ? 2.5 : 2} />
            Settings
          </button>
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="pt-4 border-t border-zinc-150 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser.avatar}
              </div>
              <div className="min-w-0">
                <h5 className="text-[11px] font-black text-zinc-900 leading-tight truncate">{currentUser.name}</h5>
                <span className="text-[9px] font-bold text-zinc-400 capitalize block mt-0.5">{currentUser.role} Account</span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 hover:bg-red-50 hover:text-red-650 text-zinc-400 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ==========================================
          B. CENTRAL CONTENT PANEL & MOBILE NAV
          ========================================== */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Mobile Header (Visible on screens < md) */}
        <header className="md:hidden h-14 bg-white border-b border-zinc-200 px-4 flex items-center justify-between shrink-0 z-10 select-none">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border border-zinc-200 flex items-center justify-center">
              <Image
                src="/dan_mascot_logo.png"
                alt="Logo"
                width={32}
                height={32}
              />
            </div>
            <h1 className="text-xs font-black uppercase text-zinc-900 tracking-tight">
              Dan <span className="text-primary">- Moving Man</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full uppercase tracking-wider">
              {currentUser.role}
            </span>
            <button
              onClick={logout}
              className="p-1 text-zinc-500 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Dynamic Inner Page Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-55 relative">
          {renderScreen()}
        </div>

        {/* Mobile Bottom Navigation Bar (Visible only on screens < md and when not details page) */}
        {!hideBottomBar && (
          <nav className="md:hidden h-16 bg-white border-t border-zinc-200 flex items-center justify-around px-2 shrink-0 select-none shadow-sm z-10">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all cursor-pointer ${
                activeTab === "home" ? "text-primary scale-105 font-black" : "text-zinc-400 hover:text-zinc-650"
              }`}
            >
              <HomeIcon size={18} strokeWidth={activeTab === "home" ? 2.5 : 2} />
              <span className="text-[9px] font-black uppercase tracking-wider">Home</span>
            </button>

            <button
              onClick={() => setActiveTab("employees")}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all cursor-pointer ${
                activeTab === "employees" ? "text-primary scale-105 font-black" : "text-zinc-400 hover:text-zinc-650"
              }`}
            >
              <UsersIcon size={18} strokeWidth={activeTab === "employees" ? 2.5 : 2} />
              <span className="text-[9px] font-black uppercase tracking-wider">Directory</span>
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all cursor-pointer ${
                activeTab === "reports" ? "text-primary scale-105 font-black" : "text-zinc-400 hover:text-zinc-650"
              }`}
            >
              <ReportsIcon size={18} strokeWidth={activeTab === "reports" ? 2.5 : 2} />
              <span className="text-[9px] font-black uppercase tracking-wider">
                {isManager ? "Reports" : "Compliance"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all cursor-pointer ${
                activeTab === "settings" ? "text-primary scale-105 font-black" : "text-zinc-400 hover:text-zinc-650"
              }`}
            >
              <SettingsIcon size={18} strokeWidth={activeTab === "settings" ? 2.5 : 2} />
              <span className="text-[9px] font-black uppercase tracking-wider">Settings</span>
            </button>
          </nav>
        )}

      </main>

    </div>
  );
}
