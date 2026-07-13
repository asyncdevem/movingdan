"use client";

import React, { useState } from "react";
import { 
  generateWeeklyDigestEmail, 
  generateWarningIssuedEmail, 
  generateNewPolicyEmail 
} from "@/lib/emailTemplates";

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<"weekly" | "warning" | "policy">("weekly");

  const mockWeeklyData = {
    employeeName: "Marcus Miller",
    weekStartDate: "July 7, 2026",
    weekEndDate: "July 11, 2026",
    newWarnings: [
      {
        id: "wrn-001",
        warningType: "Late Arrival",
        date: "July 9, 2026 9:45 AM",
        severity: "Written",
        cost: 50,
        incidentDetails: "Arrived 45 minutes late to dispatch, causing crew delay.",
        details: "Arrived 45 minutes late to dispatch, causing crew delay.",
      },
      {
        id: "wrn-002",
        warningType: "Damage",
        date: "July 10, 2026 2:30 PM",
        severity: "Verbal",
        cost: 350,
        incidentDetails: "Scratched client's hardwood floor while moving piano.",
        details: "Scratched client's hardwood floor while moving piano.",
      }
    ],
    newSignatures: [
      {
        policyTitle: "Renting a Uhaul",
        policyId: "renting-uhaul",
        signedAt: "2026-07-08T10:30:00Z",
      },
      {
        policyTitle: "Handling Damage",
        policyId: "handling-damage",
        signedAt: "2026-07-10T14:15:00Z",
      }
    ],
    totalWarnings: 2,
    totalSignatures: 2,
  };

  const mockWarningData = {
    employeeName: "Alex Johnson",
    warningType: "Damage",
    warningDate: "July 11, 2026 10:45 AM",
    severity: "Written",
    incidentDetails: "Backed into client's fence while exiting driveway.",
    cost: 750,
    issuedBy: "Dan Stevens",
  };

  const mockPolicyData = {
    employeeName: "Sarah Jenkins",
    policyTitle: "Back Safety & Lift Techniques",
    policyDescription: "Critical lifting procedures, weight limits, and physical health instructions for all movers.",
  };

  const getEmailHtml = () => {
    switch (selectedTemplate) {
      case "weekly":
        return generateWeeklyDigestEmail(mockWeeklyData);
      case "warning":
        return generateWarningIssuedEmail(mockWarningData);
      case "policy":
        return generateNewPolicyEmail(mockPolicyData);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            📧 Email Template Preview
          </h1>
          <p className="text-sm font-semibold text-zinc-400">
            Live preview of email templates sent to employees
          </p>
        </div>

        {/* Template Selector */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setSelectedTemplate("weekly")}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              selectedTemplate === "weekly"
                ? "bg-primary text-white shadow-lg"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            📅 Weekly Digest
          </button>
          <button
            onClick={() => setSelectedTemplate("warning")}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              selectedTemplate === "warning"
                ? "bg-primary text-white shadow-lg"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            ⚠️ Warning Issued
          </button>
          <button
            onClick={() => setSelectedTemplate("policy")}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              selectedTemplate === "policy"
                ? "bg-primary text-white shadow-lg"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            📝 New Policy
          </button>
        </div>

        {/* Email Info */}
        <div className="bg-zinc-900 rounded-2xl p-5 mb-6 border border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-zinc-500 font-bold block text-xs mb-1">FROM:</span>
              <span className="font-black text-white">DAN - The Moving Man &lt;noreply@movingdan.com&gt;</span>
            </div>
            <div>
              <span className="text-zinc-500 font-bold block text-xs mb-1">TO:</span>
              <span className="font-black text-white">
                {selectedTemplate === "weekly" && mockWeeklyData.employeeName}
                {selectedTemplate === "warning" && mockWarningData.employeeName}
                {selectedTemplate === "policy" && mockPolicyData.employeeName}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 font-bold block text-xs mb-1">SUBJECT:</span>
              <span className="font-black text-white">
                {selectedTemplate === "weekly" && `📋 Weekly Compliance Summary`}
                {selectedTemplate === "warning" && `⚠️ Written Warning Issued`}
                {selectedTemplate === "policy" && `📝 New Policy Requires Signature`}
              </span>
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div 
            dangerouslySetInnerHTML={{ __html: getEmailHtml() }}
            className="email-preview"
          />
        </div>

        {/* Footer Notes */}
        <div className="mt-8 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-sm font-black uppercase tracking-wider mb-3 text-primary">
            📚 Implementation Notes
          </h3>
          <ul className="space-y-2 text-xs font-semibold text-zinc-400 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">▸</span>
              <span>These emails are generated by Firebase Cloud Functions when triggered by Firestore events</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">▸</span>
              <span>Weekly digests are scheduled every Friday at 5:00 PM via Cloud Scheduler</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">▸</span>
              <span>Instant alerts are sent immediately when warnings or policies are created</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">▸</span>
              <span>Templates are mobile-responsive and follow the app's design system</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">▸</span>
              <span>Configure email service in <code className="bg-zinc-800 px-1.5 py-0.5 rounded font-mono">.env.local</code> (Gmail SMTP, SendGrid, or AWS SES)</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
