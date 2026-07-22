"use client";

import React, { useState } from "react";
import { useApp } from "@/app/context";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle, Search } from "lucide-react";

export default function ManagerWarningsPage() {
  const { currentUser, warnings, users, isLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Resolved">("All");

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  const filteredWarnings = warnings.filter((warning) => {
    const matchesSearch = warning.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         warning.warningType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || warning.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/manager"
            className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-700" />
          </Link>
          <div>
            <h2 className="text-base font-extrabold text-zinc-900 md:text-lg">All Warnings</h2>
            <p className="hidden md:block text-[11px] text-zinc-500 font-semibold mt-0.5">
              View all disciplinary filings
            </p>
          </div>
        </div>
        <Link
          href="/manager/warnings/new"
          className="px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <AlertTriangle size={14} />
          Issue Warning
        </Link>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by employee or warning type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950/10 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-zinc-800 placeholder-zinc-400 outline-none transition-all"
            />
          </div>

          <div className="flex gap-2">
            {(["All", "Active", "Resolved"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  filterStatus === status
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-zinc-200">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Warnings</p>
            <p className="text-2xl font-black text-zinc-900 mt-1">{warnings.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-zinc-200">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Active</p>
            <p className="text-2xl font-black text-primary mt-1">
              {warnings.filter(w => w.status === "Active").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-zinc-200">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Resolved</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {warnings.filter(w => w.status === "Resolved").length}
            </p>
          </div>
        </div>

        {/* Warnings List */}
        <div className="flex flex-col gap-3 pb-10">
          {filteredWarnings.length > 0 ? (
            filteredWarnings.map((warning) => (
              <Link
                key={warning.id}
                href={`/manager/warnings/${warning.id}`}
                className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xs flex gap-4 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="bg-red-50 text-primary p-3 rounded-xl h-12 w-12 flex items-center justify-center shrink-0">
                  <AlertTriangle size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-black text-zinc-900">{warning.employeeName}</h5>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full ${
                      warning.severity === "Final Warning" 
                        ? "bg-red-100 text-red-700 border border-red-200" 
                        : warning.severity === "Written"
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {warning.severity}
                    </span>
                  </div>
                  
                  <p className="text-xs font-bold text-zinc-500 mt-1">
                    {warning.warningType} • {warning.date} • ${warning.cost}
                  </p>
                  
                  <p className="text-xs text-zinc-650 leading-relaxed mt-3 bg-zinc-50 p-4 rounded-xl border border-zinc-150 italic text-zinc-700 font-semibold">
                    &quot;{warning.incidentDetails || warning.details || "No details provided"}&quot;
                  </p>
                  
                  <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <span>Issued by: {warning.issuedBy}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${
                      warning.status === "Active" ? "bg-red-50 text-red-650 border border-red-100" : "bg-emerald-50 text-emerald-650 border border-emerald-100"
                    }`}>
                      {warning.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
              {searchQuery || filterStatus !== "All" ? (
                <>
                  <Search size={36} className="mx-auto text-zinc-300 mb-2" />
                  <p className="text-sm font-black text-zinc-800">No warnings found</p>
                  <p className="text-xs text-zinc-400 mt-1">Try adjusting your search or filters</p>
                </>
              ) : (
                <>
                  <CheckCircle size={36} className="mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm font-black text-zinc-800">No warnings issued yet</p>
                  <p className="text-xs text-zinc-400 mt-1">All employees are in good standing</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
