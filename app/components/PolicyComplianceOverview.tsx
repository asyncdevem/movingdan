"use client";

import React, { useState } from "react";
import { useApp } from "../context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ClipboardList, 
  ChevronRight, 
  Search, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Plus
} from "lucide-react";
import { PolicyIcon } from "./PoliciesList";

export const PolicyComplianceOverview: React.FC = () => {
  const { policies, signatures, users } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Get all employees
  const employees = users.filter(u => u.role === "employee");
  const totalEmployees = employees.length;

  // Calculate compliance for each policy
  const policyCompliance = policies.map(policy => {
    const policySignatures = signatures.filter(s => s.policyId === policy.id);
    const signedCount = policySignatures.length;
    const percentage = totalEmployees > 0 ? Math.round((signedCount / totalEmployees) * 100) : 0;
    
    return {
      policy,
      signedCount,
      unsignedCount: totalEmployees - signedCount,
      percentage,
      status: percentage === 100 ? "complete" : percentage >= 75 ? "high" : percentage >= 50 ? "medium" : "low"
    };
  });

  // Filter by search
  const filteredPolicies = policyCompliance.filter(item =>
    searchQuery === "" ||
    item.policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.policy.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Overall statistics
  const totalSignatures = signatures.length;
  const totalPossibleSignatures = policies.length * totalEmployees;
  const overallCompliance = totalPossibleSignatures > 0 
    ? Math.round((totalSignatures / totalPossibleSignatures) * 100) 
    : 0;

  const completePolicies = policyCompliance.filter(p => p.percentage === 100).length;
  const criticalPolicies = policyCompliance.filter(p => p.percentage < 50).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "high":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "low":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-200";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return "from-emerald-500 to-emerald-600";
    if (percentage >= 75) return "from-blue-500 to-blue-600";
    if (percentage >= 50) return "from-amber-500 to-amber-600";
    return "from-red-500 to-red-600";
  };

  return (
    <div 
      className="flex-1 overflow-auto px-5 py-5 bg-zinc-50"
      style={{ 
        WebkitOverflowScrolling: 'touch',
        minHeight: 0
      }}
    >
      <div className="max-w-6xl mx-auto pb-6">
        
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary text-white">
                <ClipboardList size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                  Policy Compliance Overview
                </h1>
                <p className="text-xs font-semibold text-zinc-500">
                  Track employee signature compliance across all policies
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/manager/policies/add')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Policy</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Overall Compliance */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4">
            {/* Overall Compliance */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Overall Compliance
                </p>
                <TrendingUp size={16} className="text-primary" />
              </div>
              <p className="text-3xl font-black text-primary">{overallCompliance}%</p>
              <p className="text-[10px] font-semibold text-zinc-600 mt-1">
                {totalSignatures} of {totalPossibleSignatures} signatures
              </p>
            </div>

            {/* Total Policies */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                  Total Policies
                </p>
                <ClipboardList size={16} className="text-zinc-400" />
              </div>
              <p className="text-3xl font-black text-zinc-900">{policies.length}</p>
              <p className="text-[10px] font-semibold text-zinc-600 mt-1">
                Active policy documents
              </p>
            </div>

            {/* Complete Policies */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Fully Signed
                </p>
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-700">{completePolicies}</p>
              <p className="text-[10px] font-semibold text-emerald-600 mt-1">
                100% compliance
              </p>
            </div>

            {/* Critical Policies */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-red-700">
                  Needs Attention
                </p>
                <AlertTriangle size={16} className="text-red-600" />
              </div>
              <p className="text-3xl font-black text-red-700">{criticalPolicies}</p>
              <p className="text-[10px] font-semibold text-red-600 mt-1">
                Below 50% signed
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-5">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-zinc-800 placeholder-zinc-400 outline-none transition-all"
          />
        </div>

        {/* Policies List */}
        <div className="flex flex-col gap-4">
            {filteredPolicies.length > 0 ? (
              filteredPolicies.map((item) => (
                <Link
                  key={item.policy.id}
                  href={`/manager/policies/${item.policy.id}`}
                  className="bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-2xl p-5 transition-all duration-200 active:scale-[0.99] group shadow-xs"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Policy Icon */}
                    <div className={`p-3 rounded-xl shrink-0 ${
                      item.status === "complete" 
                        ? "bg-emerald-50 text-emerald-600" 
                        : "bg-red-50/70 text-primary"
                    }`}>
                      <PolicyIcon name={item.policy.iconName} size={22} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-extrabold text-zinc-950 group-hover:text-zinc-900 mb-1">
                            {item.policy.title}
                          </h4>
                          <p className="text-xs text-zinc-500 font-medium line-clamp-1">
                            {item.policy.shortDesc}
                          </p>
                        </div>
                        <ChevronRight size={20} className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0 mt-1" />
                      </div>

                      {/* Compliance Stats */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-zinc-900">
                            {item.percentage}%
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                            {item.status === "complete" && "Complete"}
                            {item.status === "high" && "High Compliance"}
                            {item.status === "medium" && "Medium"}
                            {item.status === "low" && "Low"}
                          </span>
                        </div>
                        <div className="text-[10px] font-semibold text-zinc-600">
                          <span className="text-emerald-600 font-bold">{item.signedCount}</span> signed
                          {" • "}
                          <span className="text-red-600 font-bold">{item.unsignedCount}</span> pending
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${getProgressColor(item.percentage)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-zinc-100">
                <ClipboardList size={40} className="mx-auto text-zinc-300 mb-3" />
                <p className="text-sm font-bold text-zinc-400">
                  No policies found matching &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
