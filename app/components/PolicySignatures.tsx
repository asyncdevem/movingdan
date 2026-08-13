"use client";

import React, { useState } from "react";
import { useApp } from "../context";
import { CheckCircle, XCircle, Calendar, User, Search, Filter } from "lucide-react";

interface PolicySignaturesProps {
  policyId: string;
}

export const PolicySignatures: React.FC<PolicySignaturesProps> = ({ policyId }) => {
  const { users, signatures, policies } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "signed" | "unsigned">("all");

  const policy = policies.find(p => p.id === policyId);
  
  // Get all employees (exclude managers for policy signatures)
  const employees = users.filter(u => u.role === "employee");
  
  // Get signatures for this policy
  const policySignatures = signatures.filter(s => s.policyId === policyId);
  
  // Create a map of employeeId to signature
  const signatureMap = new Map(policySignatures.map(sig => [sig.employeeId, sig]));
  
  // Build employee status list
  const employeeStatuses = employees.map(employee => {
    const signature = signatureMap.get(employee.id);
    return {
      employee,
      signature,
      isSigned: !!signature,
      signedAt: signature?.signedAt,
    };
  });

  // Apply filters
  const filteredEmployees = employeeStatuses.filter(status => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      status.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      status.employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      status.employee.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "signed" && status.isSigned) ||
      (filterStatus === "unsigned" && !status.isSigned);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalEmployees = employees.length;
  const signedCount = employeeStatuses.filter(s => s.isSigned).length;
  const unsignedCount = totalEmployees - signedCount;
  const signedPercentage = totalEmployees > 0 ? Math.round((signedCount / totalEmployees) * 100) : 0;

  if (!policy) {
    return (
      <div className="text-center py-6 text-sm text-zinc-500 font-semibold">
        Policy not found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Employees */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Total Employees</p>
              <p className="text-2xl font-black text-zinc-900 mt-1">{totalEmployees}</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 text-zinc-600">
              <User size={20} />
            </div>
          </div>
        </div>

        {/* Signed */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Signed</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{signedCount}</p>
              <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{signedPercentage}% Complete</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>

        {/* Unsigned */}
        <div className="bg-white border border-red-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-red-600">Pending</p>
              <p className="text-2xl font-black text-red-700 mt-1">{unsignedCount}</p>
              <p className="text-[10px] font-bold text-red-600 mt-0.5">Awaiting Signature</p>
            </div>
            <div className="p-3 rounded-xl bg-red-100 text-red-600">
              <XCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-zinc-800 placeholder-zinc-400 outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Filter size={12} />
              Status:
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  filterStatus === "all"
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("signed")}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  filterStatus === "signed"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                Signed
              </button>
              <button
                onClick={() => setFilterStatus("unsigned")}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  filterStatus === "unsigned"
                    ? "bg-red-600 text-white"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3 grid grid-cols-12 gap-4 text-[10px] font-black uppercase tracking-wider text-zinc-600">
          <div className="col-span-4">Employee</div>
          <div className="col-span-3">Title</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-3 text-right">Signed Date</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-zinc-100">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((status) => (
              <div
                key={status.employee.id}
                className="px-5 py-4 grid grid-cols-12 gap-4 items-center hover:bg-zinc-50 transition-colors"
              >
                {/* Employee Info */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black shrink-0">
                    {status.employee.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">
                      {status.employee.name}
                    </p>
                    <p className="text-[10px] font-medium text-zinc-500 truncate">
                      {status.employee.email}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="col-span-3">
                  <p className="text-xs font-semibold text-zinc-700 truncate">
                    {status.employee.title}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="col-span-2 flex justify-center">
                  {status.isSigned ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      <CheckCircle size={10} />
                      Signed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      <XCircle size={10} />
                      Pending
                    </span>
                  )}
                </div>

                {/* Signed Date */}
                <div className="col-span-3 text-right">
                  {status.signedAt ? (
                    <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-zinc-600">
                      <Calendar size={12} className="text-zinc-400" />
                      <span>
                        {new Date(status.signedAt).toLocaleDateString()} at{" "}
                        {new Date(status.signedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-zinc-400">—</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-semibold text-zinc-400">
                No employees found matching your filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700">
            Overall Completion
          </h4>
          <span className="text-lg font-black text-zinc-900">{signedPercentage}%</span>
        </div>
        <div className="w-full bg-zinc-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${signedPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] font-semibold">
          <span className="text-emerald-600">{signedCount} signed</span>
          <span className="text-red-600">{unsignedCount} pending</span>
        </div>
      </div>
    </div>
  );
};
