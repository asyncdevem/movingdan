"use client";

import React, { useState, use } from "react";
import { useApp } from "@/app/context";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Calendar, DollarSign, User, FileText, CheckCircle, XCircle } from "lucide-react";

export default function WarningDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { currentUser, warnings, users, updateWarningStatus, isLoading } = useApp();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Unwrap params Promise
  const { id } = use(params);

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  const warning = warnings.find((w) => w.id === id);

  if (!warning) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-zinc-300 mb-3" />
          <h2 className="text-lg font-black text-zinc-900">Warning Not Found</h2>
          <p className="text-sm text-zinc-500 mt-1">This warning record does not exist.</p>
          <Link
            href="/manager/warnings"
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase"
          >
            Back to Warnings
          </Link>
        </div>
      </div>
    );
  }

  const employee = users.find((u) => u.id === warning.employeeId);

  const handleStatusToggle = async () => {
    setIsUpdating(true);
    const newStatus = warning.status === "Active" ? "Resolved" : "Active";
    await updateWarningStatus(warning.id, newStatus);
    setIsUpdating(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-700" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-zinc-900">Warning Details</h2>
            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
              ID: {warning.id}
            </p>
          </div>
        </div>
        
        {/* Status Toggle Button */}
        <button
          onClick={handleStatusToggle}
          disabled={isUpdating}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            warning.status === "Active"
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-zinc-900 hover:bg-zinc-800 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isUpdating ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Updating...
            </>
          ) : warning.status === "Active" ? (
            <>
              <CheckCircle size={14} />
              Mark Resolved
            </>
          ) : (
            <>
              <XCircle size={14} />
              Reopen
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Status Banner */}
          <div className={`rounded-2xl p-5 mb-6 border flex items-center gap-4 ${
            warning.status === "Active"
              ? "bg-red-50 border-red-200"
              : "bg-emerald-50 border-emerald-200"
          }`}>
            <div className={`p-3 rounded-xl ${
              warning.status === "Active" ? "bg-red-500" : "bg-emerald-500"
            }`}>
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-black uppercase tracking-wider ${
                warning.status === "Active" ? "text-red-700" : "text-emerald-700"
              }`}>
                {warning.status === "Active" ? "Active Warning" : "Resolved"}
              </h3>
              <p className="text-xs text-zinc-600 font-semibold mt-1">
                {warning.status === "Active" 
                  ? "This incident is currently active and requires attention"
                  : "This incident has been resolved and closed"}
              </p>
            </div>
            <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
              warning.severity === "Final Warning" 
                ? "bg-red-700 text-white" 
                : warning.severity === "Written"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-600 text-white"
            }`}>
              {warning.severity}
            </span>
          </div>

          {/* Employee Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
              <User size={14} />
              Employee Information
            </h4>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                {employee?.avatar || warning.employeeName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h5 className="text-base font-black text-zinc-900">{warning.employeeName}</h5>
                <p className="text-xs text-zinc-500 font-semibold">{employee?.title || "Employee"}</p>
                {employee?.email && (
                  <p className="text-xs text-zinc-400 font-semibold mt-1">{employee.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Warning Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            {/* Warning Type */}
            <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-red-50 text-primary">
                  <AlertTriangle size={16} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">Warning Type</h4>
              </div>
              <p className="text-base font-black text-zinc-900">{warning.warningType}</p>
            </div>

            {/* Penalty Cost */}
            <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <DollarSign size={16} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">Penalty Cost</h4>
              </div>
              <p className="text-base font-black text-zinc-900">${warning.cost.toFixed(2)}</p>
            </div>

            {/* Date Issued */}
            <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Calendar size={16} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">Date Issued</h4>
              </div>
              <p className="text-base font-black text-zinc-900">{warning.date}</p>
            </div>

            {/* Issued By */}
            <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <User size={16} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">Issued By</h4>
              </div>
              <p className="text-base font-black text-zinc-900">{warning.issuedBy}</p>
            </div>
          </div>

          {/* Incident Details */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
              <FileText size={14} />
              Incident Details
            </h4>
            <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-200">
              <p className="text-sm text-zinc-700 leading-relaxed font-semibold">
                {warning.incidentDetails || warning.details || "No details provided"}
              </p>
            </div>
          </div>

          {/* Additional Notes (if exists) */}
          {warning.additionalNotes && (
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4">
                Additional Notes
              </h4>
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <p className="text-sm text-zinc-700 leading-relaxed font-semibold">
                  {warning.additionalNotes}
                </p>
              </div>
            </div>
          )}

          {/* Damage Details (if applicable) */}
          {warning.damageDate && warning.damageCost && (
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4">
                Damage Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Damage Date</p>
                  <p className="text-sm font-bold text-zinc-900 mt-1">{warning.damageDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Estimated Cost</p>
                  <p className="text-sm font-bold text-zinc-900 mt-1">${warning.damageCost}</p>
                </div>
              </div>
            </div>
          )}

          {/* Photos (if exists) */}
          {warning.photos && warning.photos.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4">
                Incident Photos ({warning.photos.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {warning.photos.map((photo, index) => (
                  <div key={index} className="aspect-video bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden">
                    {photo && photo.startsWith('data:image') ? (
                      <img 
                        src={photo} 
                        alt={`Incident photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-xs text-zinc-400 font-semibold">Photo {index + 1}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4">
              Signatures
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Manager</p>
                <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
                  <p className="text-xs font-bold text-zinc-600">
                    {warning.managerSignature ? "✓ Signed" : "Not signed"}
                  </p>
                </div>
              </div>
              {warning.employeeSignature && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Employee</p>
                  <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
                    <p className="text-xs font-bold text-zinc-600">✓ Signed</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
