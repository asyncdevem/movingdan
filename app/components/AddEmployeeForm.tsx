"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context";
import { ArrowLeft, UserPlus, Mail, Phone, Calendar, ShieldCheck, KeyRound, CheckCircle, Eye, EyeOff } from "lucide-react";

export const AddEmployeeForm: React.FC = () => {
  const router = useRouter();
  const { addEmployee } = useApp();
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("Professional Mover");
  const [role, setRole] = useState<"employee" | "manager">("employee");
  const [startDate, setStartDate] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setValidationError("Full name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setValidationError("Please enter a valid company email.");
      return;
    }
    if (!startDate) {
      setValidationError("Start date is required.");
      return;
    }
    if (!password || password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    setValidationError("");
    setIsCreating(true);
    
    try {
      // Call context action to create employee (this will handle Firebase auth + Firestore)
      await addEmployee({
        name,
        email,
        title,
        role,
        password
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/manager");
      }, 1500);
    } catch (err: any) {
      // Enhanced error messages
      let errorMessage = "Failed to create employee account";
      
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please use a different email.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use at least 6 characters.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password authentication is not enabled. Please contact support.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setValidationError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* Top Header Navigation */}
      <div className="h-14 bg-white border-b border-zinc-100 px-4 flex items-center gap-3 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-zinc-700" />
        </button>
        <h2 className="text-base font-extrabold text-zinc-900">Add Employee</h2>
      </div>

      {/* Form Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 py-6 bg-zinc-50">
        <div className="max-w-2xl mx-auto w-full bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-3xs my-4">
        
        {/* Onboarding Guide Card */}
        <div className="bg-zinc-900 text-white rounded-2xl p-4 flex items-start gap-3 mb-6 shadow-md">
          <div className="bg-white/10 p-2 rounded-xl shrink-0 text-red-500">
            <UserPlus size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-red-500">New Employee Setup</h4>
            <p className="text-[11px] font-semibold text-zinc-300 leading-normal mt-1">
              Onboard a new crew member to grant them portal access. They will be prompted to sign mandatory safety policies upon their first login.
            </p>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 mb-6 animate-bounce">
            <CheckCircle className="text-emerald-500 shrink-0" size={24} />
            <div>
              <p className="text-xs font-bold text-emerald-800">Employee Created!</p>
              <p className="text-[10px] text-emerald-600">Onboarding credentials saved successfully.</p>
            </div>
          </div>
        )}

        {validationError && (
          <div className="bg-red-50 border border-red-200 text-primary text-xs font-bold rounded-xl p-3 mb-4">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 pb-10">
          
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-600 tracking-wider">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marcus Miller"
              className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-800 outline-none transition-all"
            />
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-600 tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                <Mail size={14} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. marcus@movingdan.com"
                className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-zinc-800 outline-none transition-all"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-600 tracking-wider">Phone (Optional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                <Phone size={14} />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. (555) 019-2834"
                className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-zinc-800 outline-none transition-all"
              />
            </div>
          </div>

          {/* Title/Position */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-600 tracking-wider">Title / Position</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mover & Driver, Crew Lead"
              className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-800 outline-none transition-all"
            />
          </div>

          {/* Access Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-600 tracking-wider">Access Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("employee")}
                className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase border transition-all text-center ${
                  role === "employee"
                    ? "bg-zinc-950 border-zinc-950 text-white"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                Mover (Employee)
              </button>
              <button
                type="button"
                onClick={() => setRole("manager")}
                className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase border transition-all text-center ${
                  role === "manager"
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                Manager (Admin)
              </button>
            </div>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-600 tracking-wider">Start Date</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                <Calendar size={14} />
              </span>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-zinc-800 outline-none transition-all"
              />
            </div>
          </div>

          {/* Initial Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-600 tracking-wider">Initial Login Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                <KeyRound size={14} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 4 characters"
                className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-2.5 pl-10 pr-10 text-xs font-semibold text-zinc-800 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isCreating}
            className={`w-full mt-4 py-3.5 px-5 rounded-2xl shadow-md transition-all duration-200 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 ${
              isCreating
                ? "bg-zinc-400 text-zinc-200 cursor-not-allowed"
                : "bg-primary hover:bg-primary-hover active:scale-[0.99] text-white"
            }`}
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Crew Account"
            )}
          </button>

        </form>
        </div>

      </div>

    </div>
  );
};
