"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context";
import { 
  Mail, Bell, Calendar, AlertTriangle, CheckCircle, 
  Settings as SettingsIcon, ChevronRight
} from "lucide-react";

export const EmailNotificationSettings: React.FC = () => {
  const { currentUser, warnings, signatures, policies } = useApp();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(true);
  const [instantAlerts, setInstantAlerts] = useState(true);

  // Load settings from Firebase (placeholder)
  useEffect(() => {
    // TODO: Load from Firebase when integrated
    const savedSettings = localStorage.getItem("emailSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setEmailEnabled(settings.emailEnabled ?? true);
      setWeeklyDigestEnabled(settings.weeklyDigestEnabled ?? true);
      setInstantAlerts(settings.instantAlerts ?? true);
    }
  }, []);

  const saveSettings = () => {
    // Save to localStorage (Firebase integration placeholder)
    const settings = {
      emailEnabled,
      weeklyDigestEnabled,
      instantAlerts,
    };
    localStorage.setItem("emailSettings", JSON.stringify(settings));
    
    // TODO: Save to Firebase
    // await updateEmailNotificationSettings(currentUser.id, settings);
  };

  useEffect(() => {
    saveSettings();
  }, [emailEnabled, weeklyDigestEnabled, instantAlerts]);

  if (!currentUser) return null;

  const myWarnings = warnings.filter(w => w.employeeId === currentUser.id);
  const mySignatures = signatures.filter(s => s.employeeId === currentUser.id);
  const pendingPolicies = policies.length - mySignatures.length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 md:text-lg">Email Notifications</h2>
          <p className="hidden md:block text-[11px] text-zinc-500 font-semibold mt-0.5">
            Manage your weekly digests and instant alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-zinc-400" />
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            Active
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-zinc-50">
        <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-10">

          {/* Current Status Overview */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-sm font-black uppercase text-zinc-900 tracking-tight mb-4 flex items-center gap-2">
              <SettingsIcon size={16} className="text-primary" />
              Notification Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-zinc-900">{myWarnings.length}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
                  Total Warnings
                </div>
              </div>
              <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-emerald-600">{mySignatures.length}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
                  Policies Signed
                </div>
              </div>
              <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-primary">{pendingPolicies}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
                  Pending Review
                </div>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="flex flex-col gap-3">
              
              {/* Master Email Toggle */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-55 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-lg text-white">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">Email Notifications</p>
                    <p className="text-[10px] font-semibold text-zinc-500 mt-0.5">
                      Enable all email communications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailEnabled(!emailEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    emailEnabled ? "bg-emerald-500" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      emailEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Digest Toggle */}
              <div className={`flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-55 transition-colors ${
                !emailEnabled ? "opacity-50" : ""
              }`}>
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-800 p-2 rounded-lg text-white">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">Weekly Digest</p>
                    <p className="text-[10px] font-semibold text-zinc-500 mt-0.5">
                      Receive weekly compliance summaries every Friday
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => weeklyDigestEnabled && setWeeklyDigestEnabled(!weeklyDigestEnabled)}
                  disabled={!emailEnabled}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    emailEnabled ? "cursor-pointer" : "cursor-not-allowed"
                  } ${
                    weeklyDigestEnabled && emailEnabled ? "bg-emerald-500" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      weeklyDigestEnabled && emailEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Instant Alerts Toggle */}
              <div className={`flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-55 transition-colors ${
                !emailEnabled ? "opacity-50" : ""
              }`}>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 p-2 rounded-lg text-white">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">Instant Alerts</p>
                    <p className="text-[10px] font-semibold text-zinc-500 mt-0.5">
                      Get notified immediately when warnings are issued
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => instantAlerts && setInstantAlerts(!instantAlerts)}
                  disabled={!emailEnabled}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    emailEnabled ? "cursor-pointer" : "cursor-not-allowed"
                  } ${
                    instantAlerts && emailEnabled ? "bg-emerald-500" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      instantAlerts && emailEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>

          {/* Email Preview Info */}
          <div className="bg-zinc-950 text-white rounded-2xl p-6 shadow-md">
            <h3 className="text-sm font-black uppercase tracking-tight mb-3 flex items-center gap-2">
              <Bell size={16} className="text-red-500" />
              What You'll Receive
            </h3>
            <ul className="space-y-2 text-[11px] font-semibold leading-relaxed text-zinc-300">
              <li className="flex items-start gap-2">
                <ChevronRight size={14} className="text-red-500 shrink-0 mt-0.5" />
                <span><strong className="text-white">Weekly Digest:</strong> Every Friday at 5:00 PM with your week's warnings, signatures, and compliance status</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={14} className="text-red-500 shrink-0 mt-0.5" />
                <span><strong className="text-white">Warning Alerts:</strong> Instant notification when a written warning is issued to your account</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={14} className="text-red-500 shrink-0 mt-0.5" />
                <span><strong className="text-white">Policy Notifications:</strong> Alert when new policies require your signature</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};
