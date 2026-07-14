"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Users, ArrowRight, Truck, FileCheck, AlertTriangle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full py-6 px-6 flex items-center justify-between border-b border-zinc-800/50 backdrop-blur-sm bg-zinc-950/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
            <Image
              src="/dan_mascot_logo.png"
              alt="DAN Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-lg font-black text-white uppercase tracking-tight">
              DAN <span className="text-primary">- The Moving Man</span>
            </h1>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
              Compliance Management Portal
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full p-4 md:p-8">
        <div className="w-full max-w-6xl mx-auto py-8 md:py-16">
          
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 mb-6">
              <Shield className="text-red-400" size={16} />
              <span className="text-xs font-black text-red-400 uppercase tracking-wider">
                Safety & Compliance Portal
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Welcome to Your<br />
              <span className="text-primary">Compliance Hub</span>
            </h2>
            <p className="text-zinc-400 text-sm md:text-base font-semibold max-w-2xl mx-auto">
              Sign in to access policies, track compliance, and manage crew documentation
            </p>
          </div>

          {/* Login Cards */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            
            {/* Employee Login Card */}
            <Link
              href="/employee-login"
              className="group relative bg-white/5 border border-zinc-800 hover:border-primary/50 rounded-3xl p-8 md:p-10 transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                  <Users className="text-primary" size={28} />
                </div>
                
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                  Employee Login
                </h3>
                <p className="text-zinc-400 text-sm font-semibold mb-6 leading-relaxed">
                  Sign in with your phone number and password to access policies and track your compliance status
                </p>

                <div className="space-y-2.5 mb-8">
                  <div className="flex items-center gap-2.5 text-zinc-500">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <FileCheck size={12} className="text-primary" />
                    </div>
                    <span className="text-xs font-bold">Review & sign policies</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-500">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Shield size={12} className="text-primary" />
                    </div>
                    <span className="text-xs font-bold">Track compliance status</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-500">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Truck size={12} className="text-primary" />
                    </div>
                    <span className="text-xs font-bold">View safety procedures</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-primary uppercase tracking-wider">
                    Sign In Now
                  </span>
                  <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform" size={20} />
                </div>
              </div>
            </Link>

            {/* Manager Login Card */}
            <Link
              href="/manager-login"
              className="group relative bg-white/5 border border-zinc-800 hover:border-red-500/50 rounded-3xl p-8 md:p-10 transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                  <Shield className="text-red-400" size={28} />
                </div>
                
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                  Manager Login
                </h3>
                <p className="text-zinc-400 text-sm font-semibold mb-6 leading-relaxed">
                  Secure access with Firebase authentication to manage employees, policies, and warnings
                </p>

                <div className="space-y-2.5 mb-8">
                  <div className="flex items-center gap-2.5 text-zinc-500">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <Users size={12} className="text-red-400" />
                    </div>
                    <span className="text-xs font-bold">Manage employee directory</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-500">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle size={12} className="text-red-400" />
                    </div>
                    <span className="text-xs font-bold">Issue & track warnings</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-500">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <FileCheck size={12} className="text-red-400" />
                    </div>
                    <span className="text-xs font-bold">Create company policies</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-red-400 uppercase tracking-wider">
                    Secure Sign In
                  </span>
                  <ArrowRight className="text-red-400 group-hover:translate-x-1 transition-transform" size={20} />
                </div>
              </div>
            </Link>

          </div>

          {/* Features Grid */}
          <div className="mt-16 md:mt-20">
            <h3 className="text-center text-sm font-black text-zinc-400 uppercase tracking-wider mb-8">
              Key Features
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/5 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
                <FileCheck className="text-primary mb-3" size={24} />
                <h4 className="text-xs font-black text-white uppercase mb-1.5">Digital Signatures</h4>
                <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                  Sign policies electronically
                </p>
              </div>
              <div className="bg-white/5 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
                <AlertTriangle className="text-primary mb-3" size={24} />
                <h4 className="text-xs font-black text-white uppercase mb-1.5">Warning System</h4>
                <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                  Track incidents & violations
                </p>
              </div>
              <div className="bg-white/5 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
                <Users className="text-primary mb-3" size={24} />
                <h4 className="text-xs font-black text-white uppercase mb-1.5">Employee Directory</h4>
                <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                  Manage crew information
                </p>
              </div>
              <div className="bg-white/5 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
                <Truck className="text-primary mb-3" size={24} />
                <h4 className="text-xs font-black text-white uppercase mb-1.5">Safety Protocols</h4>
                <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                  Access SOPs anytime
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t border-zinc-800/50 backdrop-blur-sm bg-zinc-950/80">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600 font-semibold">
              © {new Date().getFullYear()} DAN - The Moving Man, LLC. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-600 font-semibold">Powered by Firebase & Resend</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
