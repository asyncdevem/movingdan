"use client";

import React, { useState } from "react";
import { useApp } from "@/app/context";
import { redirect } from "next/navigation";
import { Mail, Send, Clock, CheckCircle } from "lucide-react";

export default function EmailAutomationPage() {
  const { users, currentUser, isLoading } = useApp();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isSendingEmployee, setIsSendingEmployee] = useState(false);
  const [isSendingManager, setIsSendingManager] = useState(false);
  const [lastSent, setLastSent] = useState<{employee?: string, manager?: string}>({});
  const [statusMessage, setStatusMessage] = useState<string>("");

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 md:text-lg">Email Automation</h2>
          <p className="hidden md:block text-[11px] text-zinc-500 font-semibold mt-0.5">Test weekly digest emails</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          
          {/* Info Banner */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500 text-white shrink-0">
                <Mail size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-blue-900 mb-2">
                  Automated Weekly Digests
                </h3>
                <p className="text-sm text-zinc-700 font-semibold leading-relaxed">
                  Weekly performance emails are automatically sent every <strong>Monday at 8:00 AM</strong>. 
                  Use this page to manually test emails before they go out.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-700">
                  <Clock size={14} />
                  Next scheduled send: Monday, 8:00 AM
                </div>
              </div>
            </div>
          </div>

          {/* Employee Digest Section */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <Send size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900">
                  Test Employee Digest
                </h4>
                <p className="text-xs text-zinc-500 font-semibold mt-0.5">
                  Send a test weekly performance summary to an employee
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                  Select Employee
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full bg-white border border-zinc-200 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 rounded-xl py-3 px-4 text-sm font-semibold text-zinc-800 outline-none"
                >
                  <option value="">Choose an employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSendEmployeeDigest}
                disabled={isSendingEmployee || !selectedEmployeeId}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                {isSendingEmployee ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Test Digest
                  </>
                )}
              </button>

              {lastSent.employee && (
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold">
                  <CheckCircle size={14} className="text-green-600" />
                  Last sent: {lastSent.employee}
                </div>
              )}
            </div>
          </div>

          {/* Manager Stats Section */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900">
                  Test Manager Stats
                </h4>
                <p className="text-xs text-zinc-500 font-semibold mt-0.5">
                  Send a test weekly team statistics report to yourself
                </p>
              </div>
            </div>

            <button
              onClick={handleSendManagerStats}
              disabled={isSendingManager}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              {isSendingManager ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={16} />
                  Send Test Stats
                </>
              )}
            </button>

            {lastSent.manager && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold mt-3">
                <CheckCircle size={14} className="text-green-600" />
                Last sent: {lastSent.manager}
              </div>
            )}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`rounded-xl p-4 text-sm font-bold flex items-start gap-3 ${
              statusMessage.startsWith('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <span className="text-lg">{statusMessage.startsWith('✅') ? '✅' : '❌'}</span>
              <span>{statusMessage.substring(2)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
