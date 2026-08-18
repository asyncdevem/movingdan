"use client";

import React, { useState } from "react";
import { useApp } from "@/app/context";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Search, Mail, UserPlus, AlertTriangle, Edit, X, Send, Loader2, Eye, EyeOff, Key, CheckCircle, XCircle, FileText
} from "lucide-react";
import { Toast, ToastType, ConfirmModal } from "@/app/components/Toast";

export default function ManagerEmployeesPage() {
  const { users, currentUser, signatures, policies, warnings, isLoading, disableUser, deleteUser, refreshData } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [actioningUserId, setActioningUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "", title: "", phone: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());
  
  // Email modal state
  const [emailingUser, setEmailingUser] = useState<any | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning" | "info";
  } | null>(null);

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  const directoryUsers = users.filter((u) => u.role === "employee");
  const adminUsers = users.filter((u) => u.role === "admin");
  const filteredUsers = directoryUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredAdmins = adminUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBlockUser = async (userId: string, isDisabled: boolean) => {
    setConfirmModal({
      title: `${isDisabled ? 'Unblock' : 'Block'} User?`,
      message: `Are you sure you want to ${isDisabled ? 'unblock' : 'block'} this user?`,
      type: 'warning',
      onConfirm: async () => {
        setActioningUserId(userId);
        setConfirmModal(null);
        try {
          await disableUser(userId, !isDisabled);
          setToast({
            message: `User ${isDisabled ? 'unblocked' : 'blocked'} successfully!`,
            type: 'success'
          });
        } catch (error: any) {
          setToast({
            message: `Failed to ${isDisabled ? 'unblock' : 'block'} user: ${error.message}`,
            type: 'error'
          });
        } finally {
          setActioningUserId(null);
        }
      }
    });
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    setConfirmModal({
      title: 'Delete User?',
      message: `⚠️ WARNING: This will remove the user from the directory, but their Firebase Authentication account will remain.

To fully delete (recommended):
1. Go to Firebase Console → Authentication
2. Find user: ${userEmail}
3. Click the 3 dots → Delete account

Do you want to remove this user from the directory?`,
      type: 'danger',
      onConfirm: async () => {
        setActioningUserId(userId);
        setConfirmModal(null);
        try {
          await deleteUser(userId);
          setToast({
            message: '✅ User removed from directory!\n\n⚠️ Note: Firebase Auth account still exists.',
            type: 'success'
          });
        } catch (error: any) {
          setToast({
            message: `Failed to delete user: ${error.message}`,
            type: 'error'
          });
        } finally {
          setActioningUserId(null);
        }
      }
    });
  };

  const handleEditEmployee = (user: any) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      title: user.title || "",
      phone: user.phone || "",
      email: user.email || ""
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/employee/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: editingUser.id,
          updates: editForm
        })
      });

      if (response.ok) {
        setToast({ message: 'Employee profile updated successfully!', type: 'success' });
        setEditingUser(null);
        await refreshData(); // Refresh context data without page reload
      } else {
        const data = await response.json();
        setToast({ message: `Failed to update: ${data.error}`, type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error updating profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEmailModal = (user: any) => {
    setEmailingUser(user);
    setEmailSubject("");
    setEmailMessage("");
    setEmailError("");
  };

  const handleSendEmail = async () => {
    if (!emailingUser) return;
    
    if (!emailSubject.trim()) {
      setEmailError("Please enter a subject");
      return;
    }
    
    if (!emailMessage.trim()) {
      setEmailError("Please enter a message");
      return;
    }

    setIsSendingEmail(true);
    setEmailError("");

    try {
      const response = await fetch('/api/send-employee-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailingUser.email,
          toName: emailingUser.name,
          subject: emailSubject,
          message: emailMessage,
          fromName: currentUser?.name || "Manager"
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({ message: '✅ Email sent successfully!', type: 'success' });
        setEmailingUser(null);
      } else {
        setEmailError(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError('Error sending email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const togglePolicyExpansion = (userId: string) => {
    setExpandedPolicies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
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
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 flex flex-col gap-4 md:gap-6 pb-6">
        {/* Search Bar and Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between shrink-0">
          <div className="relative flex-1 max-w-md">
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

          {/* Toggle All Passwords Button */}
          <button
            onClick={() => {
              if (visiblePasswords.size > 0) {
                setVisiblePasswords(new Set());
              } else {
                setVisiblePasswords(new Set(filteredUsers.map(u => u.id)));
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl transition-all text-xs font-bold text-zinc-700"
          >
            {visiblePasswords.size > 0 ? (
              <>
                <EyeOff size={14} />
                Hide All Passwords
              </>
            ) : (
              <>
                <Eye size={14} />
                Show All Passwords
              </>
            )}
          </button>
        </div>

        {/* Directory Grid */}
        <div className="flex flex-col gap-6 pb-10">
          {/* Admins Section */}
          {(filteredAdmins.length > 0 || adminUsers.length > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-zinc-200"></div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Administrators ({filteredAdmins.length})
                </h3>
                <div className="h-px flex-1 bg-zinc-200"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAdmins.map((user) => {
              const userSignatures = signatures.filter((s) => s.employeeId === user.id);
              const signedPolicyIds = new Set(userSignatures.map(s => s.policyId));
              const signedCount = userSignatures.length;
              const complianceRate = Math.round((signedCount / policies.length) * 100);
              
              const signedPolicies = policies.filter(p => signedPolicyIds.has(p.id));
              const unsignedPolicies = policies.filter(p => !signedPolicyIds.has(p.id));

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
                    
                    {/* Policy Details Section */}
                    <div className="mt-4">
                      <button
                        onClick={() => togglePolicyExpansion(user.id)}
                        className="w-full flex items-center justify-between p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={12} className="text-blue-600" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                            Policy Details
                          </span>
                        </div>
                        <div className="text-[9px] font-bold text-blue-600">
                          {expandedPolicies.has(user.id) ? "Hide" : "Show"}
                        </div>
                      </button>

                      {/* Expanded Policy List */}
                      {expandedPolicies.has(user.id) && (
                        <div className="mt-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg max-h-64 overflow-y-auto">
                          {/* Signed Policies */}
                          {signedPolicies.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-[9px] font-black uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1">
                                <CheckCircle size={10} />
                                Signed ({signedPolicies.length})
                              </h5>
                              <div className="space-y-1.5">
                                {signedPolicies.map((policy) => (
                                  <div key={policy.id} className="flex items-start gap-2 text-[10px]">
                                    <CheckCircle size={10} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-zinc-700 font-semibold leading-tight">{policy.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Unsigned Policies */}
                          {unsignedPolicies.length > 0 && (
                            <div>
                              <h5 className="text-[9px] font-black uppercase tracking-wider text-red-700 mb-2 flex items-center gap-1">
                                <XCircle size={10} />
                                Not Signed ({unsignedPolicies.length})
                              </h5>
                              <div className="space-y-1.5">
                                {unsignedPolicies.map((policy) => (
                                  <div key={policy.id} className="flex items-start gap-2 text-[10px]">
                                    <XCircle size={10} className="text-red-500 shrink-0 mt-0.5" />
                                    <span className="text-zinc-700 font-semibold leading-tight">{policy.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* All Complete Message */}
                          {signedPolicies.length === policies.length && policies.length > 0 && (
                            <div className="text-center py-2">
                              <CheckCircle size={20} className="text-emerald-500 mx-auto mb-1" />
                              <p className="text-[10px] font-bold text-emerald-700">All Policies Signed!</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-150">
                    <span className="text-[10px] font-bold text-zinc-400 truncate block mb-2">{user.email}</span>
                    
                    {/* Password Display/Toggle */}
                    <div className="mb-3 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Key size={12} className="text-zinc-400 shrink-0" />
                        <span className="text-[10px] font-mono font-bold text-zinc-700 truncate">
                          {visiblePasswords.has(user.id) 
                            ? (user.password || "No password set") 
                            : "••••••••"}
                        </span>
                      </div>
                      <button
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="p-1.5 rounded-md hover:bg-zinc-200 transition-colors shrink-0"
                        title={visiblePasswords.has(user.id) ? "Hide password" : "Show password"}
                      >
                        {visiblePasswords.has(user.id) ? (
                          <EyeOff size={12} className="text-zinc-600" />
                        ) : (
                          <Eye size={12} className="text-zinc-600" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEditEmployee(user)}
                        className="w-full inline-flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 py-2 px-3 rounded-lg transition-colors border border-blue-200 shadow-3xs"
                      >
                        <Edit size={12} />
                        Edit Profile
                      </button>
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
                      <button
                        onClick={() => handleOpenEmailModal(user)}
                        className="w-full inline-flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-zinc-700 hover:text-zinc-950 bg-zinc-105 hover:bg-zinc-200 py-2 px-3 rounded-lg transition-colors border border-zinc-200"
                      >
                        <Mail size={12} />
                        Email
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Employees Section */}
      {filteredUsers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-zinc-200"></div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">
              Employees ({filteredUsers.length})
            </h3>
            <div className="h-px flex-1 bg-zinc-200"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const userSignatures = signatures.filter((s) => s.employeeId === user.id);
              const signedPolicyIds = new Set(userSignatures.map(s => s.policyId));
              const signedCount = userSignatures.length;
              const complianceRate = Math.round((signedCount / policies.length) * 100);
              
              const signedPolicies = policies.filter(p => signedPolicyIds.has(p.id));
              const unsignedPolicies = policies.filter(p => !signedPolicyIds.has(p.id));

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
                    
                    {/* Policy Details Section */}
                    <div className="mt-4">
                      <button
                        onClick={() => togglePolicyExpansion(user.id)}
                        className="w-full flex items-center justify-between p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={12} className="text-blue-600" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                            Policy Details
                          </span>
                        </div>
                        <div className="text-[9px] font-bold text-blue-600">
                          {expandedPolicies.has(user.id) ? "Hide" : "Show"}
                        </div>
                      </button>

                      {/* Expanded Policy List */}
                      {expandedPolicies.has(user.id) && (
                        <div className="mt-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg max-h-64 overflow-y-auto">
                          {/* Signed Policies */}
                          {signedPolicies.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-[9px] font-black uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1">
                                <CheckCircle size={10} />
                                Signed ({signedPolicies.length})
                              </h5>
                              <div className="space-y-1.5">
                                {signedPolicies.map((policy) => (
                                  <div key={policy.id} className="flex items-start gap-2 text-[10px]">
                                    <CheckCircle size={10} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-zinc-700 font-semibold leading-tight">{policy.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Unsigned Policies */}
                          {unsignedPolicies.length > 0 && (
                            <div>
                              <h5 className="text-[9px] font-black uppercase tracking-wider text-red-700 mb-2 flex items-center gap-1">
                                <XCircle size={10} />
                                Not Signed ({unsignedPolicies.length})
                              </h5>
                              <div className="space-y-1.5">
                                {unsignedPolicies.map((policy) => (
                                  <div key={policy.id} className="flex items-start gap-2 text-[10px]">
                                    <XCircle size={10} className="text-red-500 shrink-0 mt-0.5" />
                                    <span className="text-zinc-700 font-semibold leading-tight">{policy.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* All Complete Message */}
                          {signedPolicies.length === policies.length && policies.length > 0 && (
                            <div className="text-center py-2">
                              <CheckCircle size={20} className="text-emerald-500 mx-auto mb-1" />
                              <p className="text-[10px] font-bold text-emerald-700">All Policies Signed!</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-150">
                    <span className="text-[10px] font-bold text-zinc-400 truncate block mb-2">{user.email}</span>
                    
                    {/* Password Display/Toggle */}
                    <div className="mb-3 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Key size={12} className="text-zinc-400 shrink-0" />
                        <span className="text-[10px] font-mono font-bold text-zinc-700 truncate">
                          {visiblePasswords.has(user.id) 
                            ? (user.password || "No password set") 
                            : "••••••••"}
                        </span>
                      </div>
                      <button
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="p-1.5 rounded-md hover:bg-zinc-200 transition-colors shrink-0"
                        title={visiblePasswords.has(user.id) ? "Hide password" : "Show password"}
                      >
                        {visiblePasswords.has(user.id) ? (
                          <EyeOff size={12} className="text-zinc-600" />
                        ) : (
                          <Eye size={12} className="text-zinc-600" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEditEmployee(user)}
                        className="w-full inline-flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 py-2 px-3 rounded-lg transition-colors border border-blue-200 shadow-3xs"
                      >
                        <Edit size={12} />
                        Edit Profile
                      </button>
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
                      <button
                        onClick={() => handleOpenEmailModal(user)}
                        className="w-full inline-flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-zinc-700 hover:text-zinc-950 bg-zinc-105 hover:bg-zinc-200 py-2 px-3 rounded-lg transition-colors border border-zinc-200"
                      >
                        <Mail size={12} />
                        Email
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredUsers.length === 0 && filteredAdmins.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
          <Search size={36} className="mx-auto text-zinc-300 mb-2" />
          <p className="text-xs font-semibold text-zinc-400">No team members found.</p>
        </div>
      )}
        </div>
      </div>

      {/* Edit Employee Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                  <Edit size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900">Edit Employee Profile</h3>
                  <p className="text-xs text-zinc-500 font-semibold">Update employee information</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <X size={20} className="text-zinc-500" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-3 px-4 text-sm font-semibold text-zinc-800 outline-none"
                  placeholder="John Doe"
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-3 px-4 text-sm font-semibold text-zinc-800 outline-none"
                  placeholder="Professional Mover"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-3 px-4 text-sm font-semibold text-zinc-800 outline-none"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-3 px-4 text-sm font-semibold text-zinc-800 outline-none"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900">Send Email</h3>
                  <p className="text-xs text-zinc-500 font-semibold">To: {emailingUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEmailingUser(null)}
                className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <X size={20} className="text-zinc-500" />
              </button>
            </div>

            {emailError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs font-bold text-red-700">{emailError}</p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Subject */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-3 px-4 text-sm font-semibold text-zinc-800 outline-none"
                  placeholder="Enter email subject"
                  disabled={isSendingEmail}
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                  Message
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={8}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-3 px-4 text-sm font-semibold text-zinc-800 outline-none resize-none"
                  placeholder="Write your message here..."
                  disabled={isSendingEmail}
                />
              </div>

              {/* Recipient Email Info */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-zinc-500">
                  Recipient: <span className="text-zinc-900">{emailingUser.email}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEmailingUser(null)}
                disabled={isSendingEmail}
                className="flex-1 px-4 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
          isLoading={actioningUserId !== null}
        />
      )}
    </div>
  );
}
