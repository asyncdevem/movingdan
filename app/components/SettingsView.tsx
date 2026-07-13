"use client";

import React, { useState } from "react";
import { useApp } from "../context";
import { HelpCircle, Shield, ChevronRight, LogOut, Mail, User as UserIcon } from "lucide-react";
import { EmailNotificationSettings } from "./EmailNotificationSettings";

export const SettingsView: React.FC = () => {
  const { currentUser, logout } = useApp();
  const [activeTab, setActiveTab] = useState<"general" | "notifications">("general");

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
          <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-1">Company Info</h4>
          
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
