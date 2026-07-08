"use client";

import React from "react";
import { useApp, User } from "../context";
import { UserCog, ToggleLeft, Key, UserCheck, HelpCircle, Shield, ChevronRight } from "lucide-react";

export const SettingsView: React.FC = () => {
  const { currentUser, users, switchRole, loginAs } = useApp();

  const handleRoleToggle = () => {
    const nextRole = currentUser.role === "manager" ? "employee" : "manager";
    switchRole(nextRole);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* Top Header */}
      <div className="h-14 bg-white border-b border-zinc-100 px-4 flex items-center justify-between shrink-0">
        <h2 className="text-base font-extrabold text-zinc-900">Settings</h2>
        <span className="text-[10px] font-black text-zinc-400">v1.0.0</span>
      </div>

      {/* Main Settings Panel (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 py-5 bg-zinc-50">
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-150 shadow-3xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-lg shadow-sm">
            {currentUser.avatar}
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 leading-tight">{currentUser.name}</h3>
            <p className="text-xs font-bold text-zinc-500 mt-0.5">{currentUser.title}</p>
            <p className="text-[10px] text-zinc-400 font-medium mt-1">{currentUser.email}</p>
          </div>
        </div>

        {/* Developer Sandbox Controls (Extremely useful for reviewing) */}
        <div className="bg-red-50/40 border border-red-100 rounded-2xl p-5">
          <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5 mb-3">
            <UserCog size={13} />
            Review Sandbox Controls
          </h4>
          <p className="text-[11px] font-semibold text-zinc-600 leading-relaxed mb-4">
            Toggle roles or impersonate pre-seeded employees below to experience the workflows from different viewpoints.
          </p>

          <div className="flex flex-col gap-3">
            {/* Quick Role Toggle Button */}
            <div className="flex items-center justify-between bg-white border border-red-100 rounded-xl p-3.5 shadow-3xs">
              <div>
                <span className="block text-xs font-bold text-zinc-800">Quick Role Switch</span>
                <span className="block text-[10px] text-zinc-400 font-semibold mt-0.5">Toggle between mover & manager views</span>
              </div>
              <button
                type="button"
                onClick={handleRoleToggle}
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-[10px] font-black uppercase tracking-wider py-2 px-3.5 rounded-lg transition-colors cursor-pointer"
              >
                Switch to {currentUser.role === "manager" ? "Employee" : "Manager"}
              </button>
            </div>

            {/* Impersonate Coworker Section */}
            <div className="bg-white border border-red-100 rounded-xl p-3.5 shadow-3xs">
              <span className="block text-xs font-bold text-zinc-800 mb-2.5">Sign in as specific user:</span>
              <div className="flex flex-wrap gap-2">
                {users.map((u) => {
                  const isActive = currentUser.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => loginAs(u.id)}
                      className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border transition-all ${
                        isActive
                          ? "bg-zinc-900 border-zinc-900 text-white shadow-2xs"
                          : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-600 cursor-pointer"
                      }`}
                    >
                      {u.name.split(" ")[0]} ({u.role === "manager" ? "Admin" : "Mover"})
                    </button>
                  );
                })}
              </div>
            </div>
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
        </div>
        </div>

      </div>

    </div>
  );
};
