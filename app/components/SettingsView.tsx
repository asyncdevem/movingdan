"use client";

import React, { useState } from "react";
import { useApp } from "../context";
import { HelpCircle, Shield, ChevronRight, LogOut, Mail, User as UserIcon, Lock, Eye, EyeOff } from "lucide-react";
import { EmailNotificationSettings } from "./EmailNotificationSettings";
import { updatePassword } from "@/lib/firebase";

export const SettingsView: React.FC = () => {
  const { currentUser, logout } = useApp();
  const [activeTab, setActiveTab] = useState<"general" | "notifications">("general");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const isManager = currentUser?.role === "manager";
  const isEmployee = currentUser?.role === "employee";

  const handlePasswordChange = async () => {
    setPasswordMessage("");

    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordMessage("❌ All fields are required");
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMessage("❌ New passwords do not match");
      return;
    }

    if (passwordForm.new.length < 6) {
      setPasswordMessage("❌ Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);

    try {
      if (isEmployee) {
        // Employee: Use API route
        const response = await fetch('/api/employee/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: currentUser.id,
            currentPassword: passwordForm.current,
            newPassword: passwordForm.new
          })
        });

        const data = await response.json();

        if (response.ok) {
          setPasswordMessage("✅ Password updated successfully!");
          setPasswordForm({ current: "", new: "", confirm: "" });
          setTimeout(() => {
            setShowPasswordChange(false);
            setPasswordMessage("");
          }, 2000);
        } else {
          setPasswordMessage(`❌ ${data.error}`);
        }
      } else if (isManager) {
        // Manager: Use Firebase Auth
        await updatePassword(passwordForm.new);
        setPasswordMessage("✅ Password updated successfully!");
        setPasswordForm({ current: "", new: "", confirm: "" });
        setTimeout(() => {
          setShowPasswordChange(false);
          setPasswordMessage("");
        }, 2000);
      }
    } catch (error: any) {
      setPasswordMessage(`❌ ${error.message || "Failed to update password"}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* Top Header with Tabs */}
      <div className="bg-white border-b border-zinc-100 shrink-0">
        <div className="h-14 px-4 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-zinc-900">Settings</h2>
          <span className="text-[10px] font-black text-zinc-400">v1.0.0</span>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pb-2">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "general"
                ? "bg-red-50 text-primary border border-red-100"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <UserIcon size={14} />
            General
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "notifications"
                ? "bg-red-50 text-primary border border-red-100"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <Mail size={14} />
            Email Notifications
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "notifications" ? (
        <EmailNotificationSettings />
      ) : (
      <div className="flex-1 overflow-y-auto px-5 py-5 bg-zinc-50">
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-150 shadow-3xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-lg shadow-sm">
            {currentUser?.avatar}
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 leading-tight">{currentUser?.name}</h3>
            <p className="text-xs font-bold text-zinc-500 mt-0.5">{currentUser?.title}</p>
            <p className="text-[10px] text-zinc-400 font-medium mt-1">{currentUser?.email}</p>
          </div>
        </div>

        {/* Generic Option List Mockups */}
        <div className="flex flex-col gap-2.5 pb-8">
          <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-1">Account Settings</h4>
          
          {/* Change Password */}
          <div 
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="flex items-center justify-between bg-white border border-zinc-150 rounded-2xl p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                <Lock size={16} />
              </div>
              <div>
                <span className="block text-xs font-extrabold text-zinc-800">Change Password</span>
                <span className="block text-[10px] text-zinc-400 font-semibold mt-0.5">Update your account password</span>
              </div>
            </div>
            <ChevronRight size={16} className={`text-zinc-300 transition-transform ${showPasswordChange ? 'rotate-90' : ''}`} />
          </div>

          {/* Password Change Form */}
          {showPasswordChange && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5">
              <div className="flex flex-col gap-4">
                {/* Current Password */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                    {isEmployee ? "Current Password" : "New Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                      placeholder={isEmployee ? "Enter current password" : "Enter new password"}
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                {isEmployee && (
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      >
                        {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                    Confirm {isEmployee ? "New " : ""}Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                      placeholder="Confirm password"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Message */}
                {passwordMessage && (
                  <div className={`rounded-xl p-3 text-xs font-bold ${
                    passwordMessage.startsWith('✅') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {passwordMessage}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </div>
          )}

          <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-1 mt-4">Company Info</h4>
          
          <div className="flex items-center justify-between bg-white border border-zinc-150 rounded-2xl p-4 cursor-pointer hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-zinc-100 p-2.5 rounded-xl text-zinc-700">
                <Shield size={16} />
              </div>
              <div>
                <span className="block text-xs font-extrabold text-zinc-800">Privacy & Security</span>
                <span className="block text-[10px] text-zinc-400 font-semibold mt-0.5">Manage data retention & logs</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-zinc-300" />
          </div>

          <div className="flex items-center justify-between bg-white border border-zinc-150 rounded-2xl p-4 cursor-pointer hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-zinc-100 p-2.5 rounded-xl text-zinc-700">
                <HelpCircle size={16} />
              </div>
              <div>
                <span className="block text-xs font-extrabold text-zinc-800">Support & Feedback</span>
                <span className="block text-[10px] text-zinc-400 font-semibold mt-0.5">Report bugs or submit suggestions</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-zinc-300" />
          </div>

          <div 
            onClick={logout}
            className="flex items-center justify-between bg-white border border-red-105 hover:bg-red-50/50 rounded-2xl p-4 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-50 p-2.5 rounded-xl text-red-600">
                <LogOut size={16} />
              </div>
              <div>
                <span className="block text-xs font-extrabold text-red-700">Log Out</span>
                <span className="block text-[10px] text-zinc-400 font-semibold mt-0.5">End your portal session securely</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-red-300" />
          </div>
        </div>
        </div>

      </div>
      )}

    </div>
  );
};
