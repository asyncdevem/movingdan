"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/app/context";
import { HomeDashboard } from "@/app/components/HomeDashboard";
import { useRouter } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";

export default function EmployeeDashboardPage() {
  const { currentUser, isLoading, warnings } = useApp();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = React.useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [unsignedWarnings, setUnsignedWarnings] = useState<any[]>([]);

  // Check for unsigned warnings when user is loaded
  useEffect(() => {
    if (currentUser && currentUser.role === "employee") {
      const unsigned = warnings.filter(
        w => w.employeeId === currentUser.id && !w.employeeSignature
      );
      setUnsignedWarnings(unsigned);
      
      // Show popup if there are unsigned warnings
      if (unsigned.length > 0) {
        setShowWarningPopup(true);
      }
    }
  }, [currentUser, warnings]);

  // Handle redirects in useEffect (not during render)
  React.useEffect(() => {
    // Only act after loading is completely done
    if (isLoading) {
      return; // Still loading, don't do anything
    }
    
    // Now loading is done, mark as checked
    if (!hasCheckedAuth) {
      setHasCheckedAuth(true);
    }
    
    // Redirect to login if not authenticated
    if (!currentUser) {
      router.push("/");
      return;
    }
    
    // Redirect managers to manager dashboard
    if (currentUser.role === "manager") {
      router.push("/manager");
      return;
    }
  }, [isLoading, currentUser, router, hasCheckedAuth]);

  // Show loading state while checking authentication
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!currentUser || currentUser.role !== "employee") {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show employee dashboard
  return (
    <>
      <HomeDashboard />

      {/* Unsigned Warnings Popup */}
      {showWarningPopup && unsignedWarnings.length > 0 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowWarningPopup(false)}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-zinc-500" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-red-100 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-black text-zinc-900">Unsigned Warnings</h3>
            </div>

            <p className="text-sm text-zinc-600 font-semibold mb-4 leading-relaxed">
              You have <span className="font-black text-red-600">{unsignedWarnings.length}</span> warning{unsignedWarnings.length !== 1 ? 's' : ''} that require{unsignedWarnings.length === 1 ? 's' : ''} your signature acknowledgment.
            </p>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
              <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                Please review and sign all warnings to maintain compliance with company policy.
              </p>
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {unsignedWarnings.map((warning) => (
                <Link
                  key={warning.id}
                  href={`/employee/compliance/${warning.id}`}
                  onClick={() => setShowWarningPopup(false)}
                  className="block bg-zinc-50 rounded-lg p-3 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-zinc-900">{warning.warningType}</p>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                        {warning.date} • ${warning.cost}
                      </p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${
                      warning.severity === "Final Warning" 
                        ? "bg-red-600 text-white" 
                        : "bg-zinc-900 text-white"
                    }`}>
                      {warning.severity}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWarningPopup(false)}
                className="flex-1 px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Later
              </button>
              <Link
                href="/employee/compliance"
                onClick={() => setShowWarningPopup(false)}
                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center"
              >
                View All
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
