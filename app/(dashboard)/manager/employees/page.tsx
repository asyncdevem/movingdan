"use client";

import React, { useState } from "react";
import { useApp } from "@/app/context";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Search, Mail, UserPlus, AlertTriangle
} from "lucide-react";

export default function ManagerEmployeesPage() {
  const { users, currentUser, signatures, policies, warnings, isLoading, disableUser, deleteUser } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [actioningUserId, setActioningUserId] = useState<string | null>(null);

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

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

Do you want to remove this user from the directory?`;
    
    if (!confirm(confirmMsg)) return;
    
    setActioningUserId(userId);
    try {
      await deleteUser(userId);
      alert('✅ User removed from directory!\n\n⚠️ Note: Firebase Auth account still exists.');
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
          <p className="hidden md:block text-[11px] text-zinc-500 font-semibold mt-0.5">Manage crew compliance records</p>
        </div>
        <Link
          href="/manager/employees/add"
          className="px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus size={14} />
          Add Employee
        </Link>
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
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Compliance</span>
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
                          {signedCount}/{policies.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-150">
                    <span className="text-[10px] font-bold text-zinc-400 truncate block mb-3">{user.email}</span>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/manager/warnings/new?employeeId=${user.id}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-primary hover:text-primary-hover bg-red-50 hover:bg-red-100 py-2 px-3 rounded-lg transition-colors border border-red-100 shadow-3xs"
                      >
                        <AlertTriangle size={12} />
                        Issue Warning
                      </Link>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleBlockUser(user.id, (user as any).disabled || false)}
                          disabled={actioningUserId === user.id}
                          className="inline-flex items-center justify-center gap-1 text-[9px] font-black uppercase text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 py-1.5 px-2 rounded-lg transition-colors border border-amber-200 disabled:opacity-50"
                        >
                          {actioningUserId === user.id ? "..." : (user as any).disabled ? "Unblock" : "Block"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          disabled={actioningUserId === user.id}
                          className="inline-flex items-center justify-center gap-1 text-[9px] font-black uppercase text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 py-1.5 px-2 rounded-lg transition-colors border border-red-200 disabled:opacity-50"
                        >
                          {actioningUserId === user.id ? "..." : "Delete"}
                        </button>
                      </div>
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
}
