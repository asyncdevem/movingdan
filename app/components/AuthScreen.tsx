"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useApp, UserRole } from "../context";
import { Lock, Mail, User as UserIcon, Shield, FileCheck, Truck, ArrowRight, UserCheck } from "lucide-react";

export const AuthScreen: React.FC = () => {
  const { login, signup, users } = useApp();
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    const success = login(email, password);
    if (success) {
      setError("");
    } else {
      setError("Invalid email address. Choose a pre-seeded account or register.");
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter your job title.");
      return;
    }

    setError("");
    signup(name, email, role, title, password || "password");
  };

  const quickLogin = (userEmail: string) => {
    login(userEmail);
  };

  return (
    <div className="w-full h-full min-h-screen flex bg-zinc-950 text-white overflow-y-auto md:overflow-hidden select-none">
      
      {/* 1. Left Side Panel: Branding (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-radial from-red-950 via-zinc-950 to-black p-12 flex-col justify-between relative overflow-hidden border-r border-zinc-900 shrink-0">
        
        {/* Abstract shapes for premium visual design */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Mascot Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white border border-zinc-800 flex items-center justify-center p-0.5 shadow-md">
            <Image
              src="/dan_mascot_logo.png"
              alt="Mascot Logo"
              width={36}
              height={36}
              className="object-cover rounded-lg"
            />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight text-white">
              Dan <span className="text-primary">- Moving Man</span>
            </h2>
            <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block -mt-0.5">
              Operations Portal
            </span>
          </div>
        </div>

        {/* Branding content */}
        <div className="my-auto max-w-md relative z-10 py-10">
          <span className="text-[10px] font-black uppercase text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full tracking-wider inline-block mb-6">
            Compliance Management
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white leading-tight uppercase">
            Keep your fleet and movers <span className="text-primary">fully compliant.</span>
          </h1>
          <p className="text-zinc-400 text-xs font-semibold mt-4 leading-relaxed">
            Quickly verify company safety procedures, sign mandatory onboarding documentation, issue warning notices, and track crew compliance histories from one integrated dashboard.
          </p>

          {/* Core App Features */}
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <FileCheck size={16} />
              </div>
              <span className="text-xs font-bold text-zinc-300">Read & Digitally Sign Standard SOPs</span>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <Shield size={16} />
              </div>
              <span className="text-xs font-bold text-zinc-300">Track and Log Infractions & Damage Incidents</span>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <Truck size={16} />
              </div>
              <span className="text-xs font-bold text-zinc-300">Dedicated Fleet Rental Safety Inspection Workflows</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] font-bold text-zinc-600 relative z-10">
          © {new Date().getFullYear()} Dan The Moving Man, LLC. All rights reserved.
        </div>

      </div>

      {/* 2. Right Side Panel: Form (Always visible) */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-6 md:p-12 bg-zinc-950 overflow-y-auto">
        
        {/* Mobile Logo Header */}
        <div className="flex md:hidden items-center gap-3.5 mb-8">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-0.5 border border-zinc-800">
            <Image
              src="/dan_mascot_logo.png"
              alt="Mascot Logo"
              width={32}
              height={32}
              className="object-cover rounded-md"
            />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase text-white">Dan - Moving Man</h2>
            <span className="text-[8px] font-bold text-zinc-550 uppercase tracking-widest block -mt-0.5">
              Operations Portal
            </span>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-4">
          
          {/* Header Switcher Tab */}
          <div className="flex items-center gap-6 border-b border-zinc-850 pb-3.5 mb-8">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`text-sm font-black uppercase tracking-wider relative transition-all ${
                isLogin ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Sign In
              {isLogin && <span className="absolute -bottom-[15px] left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`text-sm font-black uppercase tracking-wider relative transition-all ${
                !isLogin ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Create Account
              {!isLogin && <span className="absolute -bottom-[15px] left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          </div>

          {/* Validation Errors */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-primary text-xs font-bold rounded-xl p-3.5 mb-6">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-505">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter company email"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Password (Optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-primary hover:bg-primary-hover text-white font-black uppercase text-xs tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
                <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            // SIGNUP FORM
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                    <UserIcon size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Miller"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-505">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marcus@movingdan.com"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Portal Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none transition-all"
                >
                  <option value="employee">Employee / Mover</option>
                  <option value="manager">Manager / Owner</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Job Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lead Packer & Loader"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-3 px-4 text-xs font-bold text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Password (Optional)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-3 px-4 text-xs font-bold text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-primary hover:bg-primary-hover text-white font-black uppercase text-xs tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Account
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* QUICK DEMO LOGIN PROFILE CARDS (Extremely review friendly) */}
          <div className="mt-8 pt-6 border-t border-zinc-850">
            <h4 className="text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-3.5 flex items-center gap-1.5">
              <UserCheck size={12} className="text-primary" />
              Developer Sandbox: Quick Sign In
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {users.slice(0, 6).map((u) => (
                <button
                  key={u.id}
                  onClick={() => quickLogin(u.email)}
                  className="bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-850 text-left p-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-950/65 text-primary text-[10px] font-black flex items-center justify-center shrink-0 border border-red-900/30">
                      {u.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-white truncate leading-tight group-hover:text-primary transition-colors">
                        {u.name.split(" ")[0]}
                      </p>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wide block mt-0.5">
                        {u.role === "manager" ? "Manager" : "Mover"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer on mobile */}
        <div className="md:hidden text-[9px] text-center font-bold text-zinc-700 mt-6">
          © {new Date().getFullYear()} Dan The Moving Man, LLC.
        </div>

      </div>

    </div>
  );
};
