"use client";

import React from "react";
import Image from "next/image";
import { useApp } from "../context";
import { FileText, AlertTriangle, UserPlus, BarChart3, Lock, ShieldCheck, ChevronRight, UserCog } from "lucide-react";

export const HomeDashboard: React.FC = () => {
  const { currentUser, setNavigation, policies, signatures, switchRole } = useApp();
  const isManager = currentUser.role === "manager";

  const handleRoleToggle = () => {
    switchRole(isManager ? "employee" : "manager");
  };

  // Calculate pending policies for the current user
  const userSignatures = signatures.filter((s) => s.employeeId === currentUser.id);
  const pendingCount = policies.length - userSignatures.length;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-6 py-8">
      <div className="max-w-2xl mx-auto w-full flex-grow flex flex-col justify-center">
      
      {/* Header & Branding */}
      <div className="flex flex-col items-center justify-center text-center mt-2 mb-6">
        <div className="relative w-28 h-28 mb-3 drop-shadow-md rounded-2xl overflow-hidden bg-white border border-zinc-100 flex items-center justify-center">
          <Image
            src="/dan_mascot_logo.png"
            alt="Dan The Moving Man Logo"
            width={112}
            height={112}
            priority
            className="object-cover"
          />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">
          Dan <span className="text-primary">- The Moving Man</span>
        </h1>
        <p className="text-[11px] font-semibold text-zinc-500 tracking-wider uppercase mt-0.5">
          Workforce & Compliance Portal
        </p>
      </div>

      {/* Interactive Role Switcher Banner (Helpful for prototyping review) */}
      <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary text-white rounded-xl">
            <UserCog size={18} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-primary tracking-wider">Active Role: {currentUser.role}</p>
            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
              {isManager 
                ? "Full access to warnings, onboarding, and compliance metrics." 
                : "Limited access. Switch role to test manager forms."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRoleToggle}
          className="bg-white hover:bg-zinc-50 border border-zinc-250 text-zinc-800 text-[10px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs hover:scale-[1.02] active:scale-[0.98]"
        >
          Toggle to {isManager ? "Mover" : "Manager"}
        </button>
      </div>

      {/* User Info Greeting Card */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-xs mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
            {currentUser.avatar}
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Welcome back,</p>
            <h3 className="text-sm font-bold text-zinc-800">{currentUser.name}</h3>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
          isManager ? "bg-red-50 text-primary border border-red-100" : "bg-zinc-100 text-zinc-700"
        }`}>
          {currentUser.role}
        </span>
      </div>

      {/* Employee compliance notice */}
      {!isManager && (
        <div 
          onClick={() => setNavigation("policy-list")}
          className={`rounded-2xl p-4 mb-6 border cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
            pendingCount > 0 
              ? "bg-red-50/55 border-red-100 hover:bg-red-50" 
              : "bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50/60"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${pendingCount > 0 ? "text-primary" : "text-emerald-700"}`}>
                {pendingCount > 0 ? "Action Required" : "Compliance Status"}
              </h4>
              <p className="text-sm font-bold text-zinc-800 mt-1">
                {pendingCount > 0 
                  ? `You have ${pendingCount} unsigned policies` 
                  : "All corporate policies are fully signed"}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {pendingCount > 0 
                  ? "Tap here to view and sign pending documents" 
                  : "Good job! You are fully compliant."}
              </p>
            </div>
            <div className={`p-2 rounded-xl ${pendingCount > 0 ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
              {pendingCount > 0 ? <FileText size={18} /> : <ShieldCheck size={18} />}
            </div>
          </div>
        </div>
      )}

      {/* Primary Action Buttons (Vertical Stack) */}
      <div className="flex flex-col gap-4">
        {/* Written Policies (Red Button) */}
        <button
          onClick={() => setNavigation("policy-list")}
          className="w-full flex items-center justify-between bg-primary hover:bg-primary-hover active:scale-[0.99] text-white py-4.5 px-5 rounded-2xl shadow-md transition-all duration-200 text-left font-bold"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/15 p-2.5 rounded-xl">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <span className="block text-base tracking-tight font-extrabold">Written Policies</span>
              <span className="block text-xs font-medium text-white/80 mt-0.5">Read & digitally sign corporate SOPs</span>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/70" />
        </button>

        {/* Written Warning (Dark Button) */}
        <div className="relative">
          <button
            disabled={!isManager}
            onClick={() => setNavigation("warning-form")}
            className={`w-full flex items-center justify-between py-4.5 px-5 rounded-2xl transition-all duration-200 text-left font-bold border ${
              isManager 
                ? "bg-zinc-900 hover:bg-zinc-800 text-white border-transparent shadow-md active:scale-[0.99] cursor-pointer" 
                : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${isManager ? "bg-white/10" : "bg-zinc-200"}`}>
                <AlertTriangle size={22} className={isManager ? "text-white" : "text-zinc-400"} />
              </div>
              <div>
                <span className="block text-base tracking-tight font-extrabold flex items-center gap-1.5">
                  Issue Written Warning
                  {!isManager && <Lock size={13} className="text-zinc-400 inline" />}
                </span>
                <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {isManager ? "Record incident & issue notice" : "Manager-only access"}
                </span>
              </div>
            </div>
            <ChevronRight size={20} className={isManager ? "text-white/70" : "text-zinc-300"} />
          </button>
        </div>
      </div>

      {/* Visual Divider (Red line with custom moving truck logo) */}
      <div className="relative my-8 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-primary/25"></div>
        </div>
        <div className="relative z-10 bg-neutral-50 px-4 flex items-center justify-center">
          <div className="relative w-12 h-6 border border-zinc-200 rounded-full bg-white flex items-center justify-center shadow-xs overflow-hidden">
            <Image
              src="/moving_truck_logo.png"
              alt="Truck Icon"
              width={36}
              height={18}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Secondary Action Buttons (Side-by-Side Grid) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Add Employee */}
        <button
          disabled={!isManager}
          onClick={() => setNavigation("add-employee")}
          className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
            isManager
              ? "bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-xs cursor-pointer active:scale-[0.98]"
              : "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed opacity-75"
          }`}
        >
          <div className={`p-2.5 rounded-xl mb-3 ${isManager ? "bg-red-50 text-primary" : "bg-zinc-200 text-zinc-400"}`}>
            <UserPlus size={20} />
          </div>
          <span className="text-sm font-extrabold text-zinc-800 block flex items-center gap-1">
            Add Employee
            {!isManager && <Lock size={11} className="text-zinc-400" />}
          </span>
          <span className="text-[10px] font-medium text-zinc-500 mt-0.5">
            Register new movers
          </span>
        </button>

        {/* Generate Report */}
        <button
          disabled={!isManager}
          onClick={() => setNavigation("report-view")}
          className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
            isManager
              ? "bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-xs cursor-pointer active:scale-[0.98]"
              : "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed opacity-75"
          }`}
        >
          <div className={`p-2.5 rounded-xl mb-3 ${isManager ? "bg-zinc-100 text-zinc-800" : "bg-zinc-200 text-zinc-400"}`}>
            <BarChart3 size={20} />
          </div>
          <span className="text-sm font-extrabold text-zinc-800 block flex items-center gap-1">
            Generate Report
            {!isManager && <Lock size={11} className="text-zinc-400" />}
          </span>
          <span className="text-[10px] font-medium text-zinc-500 mt-0.5">
            Compliance analytics
          </span>
        </button>
      </div>
      </div>

    </div>
  );
};
