"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/app/context";
import { redirect } from "next/navigation";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function EmployeeCompliancePage() {
  const { currentUser, warnings, isLoading } = useApp();

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "employee") {
    redirect("/");
  }

  const myWarnings = warnings.filter((w) => w.employeeId === currentUser.id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 md:text-lg">My Compliance Record</h2>
          <p className="hidden md:block text-[11px] text-zinc-500 font-semibold mt-0.5">Track your safety record and notifications</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 max-w-4xl w-full mx-auto">
        
        {/* Profile Stats Summary */}
        <div className="bg-zinc-950 text-white rounded-2xl p-6 border border-zinc-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-red-500">Record Summary</span>
            <h3 className="text-3xl font-black mt-1">
              {myWarnings.length === 0 ? "Perfect Record" : `${myWarnings.length} Warnings Issued`}
            </h3>
            <p className="text-xs text-zinc-400 font-semibold mt-1">
              {myWarnings.length === 0 
                ? "Excellent job! You are fully compliant with all company standards and safety policies." 
                : "Please review infractions below. Reach out to management for resolution steps."}
            </p>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ml-4 ${
            myWarnings.length === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          }`}>
            <AlertTriangle size={28} />
          </div>
        </div>

        {/* Warning Logs List */}
        <div>
          <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-3">Infraction Notices</h4>
          <div className="flex flex-col gap-3 pb-10">
            {myWarnings.length > 0 ? (
              myWarnings.map((warning) => (
                <Link
                  key={warning.id}
                  href={`/employee/compliance/${warning.id}`}
                  className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xs flex gap-4 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="bg-red-50 text-primary p-3 rounded-xl h-12 w-12 flex items-center justify-center shrink-0">
                    <AlertTriangle size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-black text-zinc-900 uppercase tracking-tight">{warning.warningType || "Warning"}</h5>
                        <span className="text-[9px] font-black text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-150 font-mono tracking-tight">
                          {warning.id}
                        </span>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full ${
                        warning.severity === "Final Warning" 
                          ? "bg-red-105 text-red-700 border border-red-200" 
                          : "bg-zinc-900 text-white"
                      }`}>
                        {warning.severity}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 mt-1">Issued {warning.date} • Impact: ${warning.cost}</p>
                    <p className="text-xs text-zinc-650 leading-relaxed mt-3 bg-zinc-50 p-4 rounded-xl border border-zinc-150 italic text-zinc-700 font-semibold">
                      &quot;{warning.incidentDetails || warning.details || "No details provided"}&quot;
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      <span>Issued by: {warning.issuedBy}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${
                        warning.status === "Active" ? "bg-red-50 text-red-650" : "bg-emerald-50 text-emerald-650"
                      }`}>
                        Status: {warning.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
                <CheckCircle size={36} className="mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-black text-zinc-800">You are in good standing!</p>
                <p className="text-xs text-zinc-400 mt-1">Keep adhering to SOP procedures and fleet guidelines.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
