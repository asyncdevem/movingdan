"use client";

import React, { useState } from "react";
import { useApp } from "../context";
import { 
  ArrowLeft, 
  ClipboardList, 
  ChevronRight, 
  Search, 
  CheckCircle, 
  Clock,
  Truck,
  Calendar,
  Clock as ClockIcon,
  Receipt,
  PhoneCall,
  ShieldAlert
} from "lucide-react";

// Icon mapping helper
export const PolicyIcon = ({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) => {
  switch (name) {
    case "Truck":
      return <Truck size={size} className={className} />;
    case "Calendar":
      return <Calendar size={size} className={className} />;
    case "Clock":
      return <ClockIcon size={size} className={className} />;
    case "Receipt":
      return <Receipt size={size} className={className} />;
    case "PhoneCall":
      return <PhoneCall size={size} className={className} />;
    case "ShieldAlert":
      return <ShieldAlert size={size} className={className} />;
    default:
      return <ClipboardList size={size} className={className} />;
  }
};

export const PoliciesList: React.FC = () => {
  const { policies, signatures, currentUser, setNavigation } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  // Get current user's signatures
  const userSignatures = signatures.filter((s) => s.employeeId === currentUser.id);
  const signedPolicyIds = new Set(userSignatures.map((s) => s.policyId));

  // Filter policies based on search query
  const filteredPolicies = policies.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* Top Header Navigation */}
      <div className="h-14 bg-white border-b border-zinc-100 px-4 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setNavigation("home")}
          className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-zinc-700" />
        </button>
        <h2 className="text-base font-extrabold text-zinc-900">Written Policies</h2>
      </div>

      {/* Main Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 py-5 bg-zinc-50">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-5">
        
        {/* Instructions Card */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-xs flex items-start gap-3">
          <div className="bg-red-50 p-2.5 rounded-xl text-primary shrink-0">
            <ClipboardList size={22} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700">Instructions</h4>
            <p className="text-xs font-semibold text-zinc-600 leading-relaxed mt-1">
              Read and sign each policy below. Your digital signature confirms you have read, understand, and agree to adhere to the policy terms.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative shrink-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-zinc-800 placeholder-zinc-400 outline-none transition-all"
          />
        </div>

        {/* Policies List */}
        <div className="flex flex-col gap-3 pb-6">
          {filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => {
              const isSigned = signedPolicyIds.has(policy.id);
              return (
                <button
                  key={policy.id}
                  onClick={() => setNavigation("policy-detail", policy.id)}
                  className="bg-white hover:bg-zinc-50 border border-zinc-150 hover:border-zinc-250 rounded-2xl p-4 flex items-center justify-between text-left transition-all duration-200 active:scale-[0.99] group shadow-2xs"
                >
                  <div className="flex items-start gap-3.5 pr-2">
                    {/* Policy Icon */}
                    <div className={`p-3 rounded-xl shrink-0 transition-colors ${
                      isSigned ? "bg-emerald-50 text-emerald-600" : "bg-red-50/70 text-primary"
                    }`}>
                      <PolicyIcon name={policy.iconName} size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-zinc-950 group-hover:text-zinc-900">
                        {policy.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-medium line-clamp-2 mt-0.5 leading-relaxed">
                        {policy.shortDesc}
                      </p>
                      
                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1 mt-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isSigned 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-red-50 text-primary border border-red-100"
                      }`}>
                        {isSigned ? (
                          <>
                            <CheckCircle size={10} />
                            Signed
                          </>
                        ) : (
                          <>
                            <Clock size={10} />
                            Pending Signature
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
                </button>
              );
            })
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-zinc-100">
              <ClipboardList size={32} className="mx-auto text-zinc-300 mb-2" />
              <p className="text-xs font-semibold text-zinc-400">No policies found matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
        </div>

      </div>

    </div>
  );
};
