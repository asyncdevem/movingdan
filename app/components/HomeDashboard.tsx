"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "../context";
import { FileText, AlertTriangle, UserPlus, BarChart3, ShieldCheck, ChevronRight } from "lucide-react";

export const HomeDashboard: React.FC = () => {
  const { currentUser, policies, signatures, warnings, users } = useApp();
  const isManager = currentUser?.role === "manager";

  // Calculate pending policies for the current user
  const userSignatures = signatures.filter((s) => s.employeeId === currentUser?.id);
  const pendingCount = policies.length - userSignatures.length;

  // Calculate warning statistics for manager
  const activeWarnings = warnings.filter(w => w.status === "Active");
  const totalPenaltyCost = warnings.reduce((sum, w) => sum + (w.cost || 0), 0);
  const recentWarnings = warnings.slice(0, 3); // Last 3 warnings

  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-6 py-8">
      <div className="max-w-2xl mx-auto w-full flex-grow flex flex-col justify-center">
      
      {/* Header & Branding */}
      <div className="flex flex-col items-center justify-center text-center mt-2 mb-6">
        <div className="relative w-28 h-28 mb-3 drop-shadow-md rounded-2xl overflow-hidden bg-white border border-zinc-105 flex items-center justify-center">
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

      {/* User Info Greeting Card */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-xs mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
            {currentUser?.avatar}
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Welcome back,</p>
            <h3 className="text-sm font-bold text-zinc-800">{currentUser?.name}</h3>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
            isManager ? "bg-red-50 text-primary border border-red-100" : "bg-zinc-100 text-zinc-700"
          }`}>
            {currentUser?.role}
          </span>
          {!isManager && (
            <span className="text-[8px] text-zinc-400 font-semibold">Limited Access</span>
          )}
        </div>
      </div>

      {/* Manager Warnings Summary */}
      {isManager && warnings.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 border border-red-100 shadow-xs mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <AlertTriangle size={14} />
                Warnings Overview
              </h4>
              <p className="text-xs text-zinc-600 font-semibold mt-1">Active incidents & penalty tracking</p>
            </div>
            <Link
              href="/manager/warnings"
              className="text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-wider flex items-center gap-1"
            >
              View All
              <ChevronRight size={12} />
            </Link>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-xl p-3 border border-red-100">
              <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Total</p>
              <p className="text-2xl font-black text-zinc-900 mt-1">{warnings.length}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-red-100">
              <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Active</p>
              <p className="text-2xl font-black text-primary mt-1">{activeWarnings.length}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-red-100">
              <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Penalty Cost</p>
              <p className="text-xl font-black text-zinc-900 mt-1">${totalPenaltyCost.toFixed(2)}</p>
            </div>
          </div>

          {/* Recent Warnings */}
          {recentWarnings.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-2">Recent Incidents</p>
              {recentWarnings.map((warning) => (
                <div key={warning.id} className="bg-white rounded-lg p-3 border border-red-100 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-zinc-900 truncate">{warning.employeeName}</p>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        warning.severity === "Final Warning" 
                          ? "bg-red-100 text-red-700" 
                          : warning.severity === "Written"
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 text-zinc-600"
                      }`}>
                        {warning.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-600 font-semibold mt-0.5">
                      {warning.warningType} • ${warning.cost}
                    </p>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ml-2 ${
                    warning.status === "Active" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {warning.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Employee compliance notice */}
      {!isManager && (
        <Link 
          href="/employee/policies"
          className={`rounded-2xl p-4 mb-6 border transition-all duration-200 hover:scale-[1.01] block ${
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
        </Link>
      )}

      {/* Primary Action Buttons (Vertical Stack) */}
      <div className="flex flex-col gap-4">
        {/* Written Policies (Red Button) */}
        <Link
          href={isManager ? "/manager/policies" : "/employee/policies"}
          className="w-full flex items-center justify-between bg-primary hover:bg-primary-hover active:scale-[0.99] text-white py-4.5 px-5 rounded-2xl shadow-md transition-all duration-200 text-left font-bold cursor-pointer"
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
        </Link>

        {/* Written Warning (Manager Only) */}
        {isManager && (
          <Link
            href="/manager/warnings/new"
            className="w-full flex items-center justify-between bg-zinc-900 hover:bg-zinc-800 text-white border-transparent shadow-md active:scale-[0.99] py-4.5 px-5 rounded-2xl transition-all duration-200 text-left font-bold"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2.5 rounded-xl">
                <AlertTriangle size={22} className="text-white" />
              </div>
              <div>
                <span className="block text-base tracking-tight font-extrabold">
                  Issue Written Warning
                </span>
                <span className="block text-xs font-medium text-white/80 mt-0.5">
                  Record incident & issue notice
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-white/70" />
          </Link>
        )}
      </div>

      {/* Manager-Only Secondary Actions */}
      {isManager && (
        <>
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
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            </div>
          </div>

          {/* Secondary Action Buttons (Side-by-Side Grid) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Add Employee */}
            <Link
              href="/manager/employees/add"
              className="flex flex-col items-start p-4 rounded-2xl border bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-xs active:scale-[0.98] transition-all duration-200 text-left"
            >
              <div className="p-2.5 rounded-xl mb-3 bg-red-50 text-primary">
                <UserPlus size={20} />
              </div>
              <span className="text-sm font-extrabold text-zinc-800 block">
                Add Employee
              </span>
              <span className="text-[10px] font-medium text-zinc-500 mt-0.5">
                Register new movers
              </span>
            </Link>

            {/* Generate Report */}
            <Link
              href="/manager/reports"
              className="flex flex-col items-start p-4 rounded-2xl border bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-xs active:scale-[0.98] transition-all duration-200 text-left"
            >
              <div className="p-2.5 rounded-xl mb-3 bg-zinc-100 text-zinc-800">
                <BarChart3 size={20} />
              </div>
              <span className="text-sm font-extrabold text-zinc-800 block">
                Generate Report
              </span>
              <span className="text-[10px] font-medium text-zinc-500 mt-0.5">
                Compliance analytics
              </span>
            </Link>
          </div>

          {/* Email Automation Testing Section */}
          <EmailAutomationSection />
        </>
      )}
      </div>

    </div>
  );
};

// Email Automation Testing Component
const EmailAutomationSection: React.FC = () => {
  const { users, currentUser } = useApp();
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string>("");
  const [isSendingEmployee, setIsSendingEmployee] = React.useState(false);
  const [isSendingManager, setIsSendingManager] = React.useState(false);
  const [lastSent, setLastSent] = React.useState<{employee?: string, manager?: string}>({});
  const [statusMessage, setStatusMessage] = React.useState<string>("");

  const employees = users.filter(u => u.role === "employee");

  const handleSendEmployeeDigest = async () => {
    if (!selectedEmployeeId) {
      setStatusMessage("Please select an employee");
      return;
    }

    const employee = employees.find(e => e.id === selectedEmployeeId);
    if (!employee) return;

    setIsSendingEmployee(true);
    setStatusMessage("");

    try {
      const response = await fetch('/api/emails/send-employee-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          employeeName: employee.name,
          employeeEmail: employee.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage(`✅ Employee digest sent to ${employee.name}`);
        setLastSent(prev => ({...prev, employee: new Date().toLocaleTimeString()}));
      } else {
        setStatusMessage(`❌ Failed: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`❌ Error sending email`);
    } finally {
      setIsSendingEmployee(false);
    }
  };

  const handleSendManagerStats = async () => {
    if (!currentUser) return;

    setIsSendingManager(true);
    setStatusMessage("");

    try {
      const response = await fetch('/api/emails/send-manager-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerName: currentUser.name,
          managerEmail: currentUser.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage(`✅ Manager stats sent to ${currentUser.email}`);
        setLastSent(prev => ({...prev, manager: new Date().toLocaleTimeString()}));
      } else {
        setStatusMessage(`❌ Failed: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`❌ Error sending email`);
    } finally {
      setIsSendingManager(false);
    }
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 shadow-xs">
      <div className="mb-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-2">
          📧 Email Automation Testing
        </h4>
        <p className="text-xs text-zinc-600 font-semibold mt-1">Test weekly digest emails manually</p>
      </div>

      {/* Employee Digest Test */}
      <div className="bg-white rounded-xl p-4 mb-3 border border-blue-100">
        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-2">
          Test Employee Digest
        </label>
        <select
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          className="w-full bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-2.5 px-3 text-xs font-semibold text-zinc-800 outline-none mb-3"
        >
          <option value="">Select an employee...</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
        <button
          onClick={handleSendEmployeeDigest}
          disabled={isSendingEmployee || !selectedEmployeeId}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          {isSendingEmployee ? "Sending..." : "Send Test Employee Digest"}
        </button>
        {lastSent.employee && (
          <p className="text-[9px] text-zinc-500 font-semibold mt-2">Last sent: {lastSent.employee}</p>
        )}
      </div>

      {/* Manager Stats Test */}
      <div className="bg-white rounded-xl p-4 mb-3 border border-blue-100">
        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-2">
          Test Manager Stats Email
        </label>
        <button
          onClick={handleSendManagerStats}
          disabled={isSendingManager}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          {isSendingManager ? "Sending..." : "Send Test Manager Stats"}
        </button>
        {lastSent.manager && (
          <p className="text-[9px] text-zinc-500 font-semibold mt-2">Last sent: {lastSent.manager}</p>
        )}
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`rounded-xl p-3 text-xs font-bold ${
          statusMessage.startsWith('✅') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {statusMessage}
        </div>
      )}

      <div className="mt-3 text-[9px] text-zinc-500 font-semibold">
        💡 Automated emails send every Monday at 8:00 AM
      </div>
    </div>
  );
};
