"use client";

import React, { useEffect } from "react";
import { useApp } from "./context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Truck, Shield, FileCheck, Users, CheckCircle, 
  ArrowRight, BarChart3, Clock, Award 
} from "lucide-react";

export default function LandingPage() {
  const { currentUser, isLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentUser) {
      // Redirect authenticated users to their dashboard
      const role = currentUser.role || 'employee';
      const redirectPath = role === "manager" ? "/manager" : "/employee";
      setTimeout(() => {
        router.replace(redirectPath);
      }, 100);
    }
  }, [currentUser, isLoading, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-white select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Loading Portal...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting authenticated users
  if (currentUser) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-white select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  src="/dan_mascot_logo.png"
                  alt="DAN Logo"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-lg font-black text-white uppercase tracking-tight">
                  DAN
                </h1>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  The Moving Man
                </p>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-6 py-2.5 text-sm font-bold text-white hover:text-zinc-300 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-8">
              <Shield className="text-primary" size={16} />
              <span className="text-xs font-black text-primary uppercase tracking-wider">
                Professional Moving Compliance Platform
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight mb-6">
              Moving Forward
              <br />
              <span className="text-primary">With Confidence</span>
            </h2>

            <p className="text-lg sm:text-xl text-zinc-400 font-semibold max-w-3xl mx-auto mb-10 leading-relaxed">
              Streamline your moving operations with comprehensive compliance tracking, policy management, and team oversight.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-2xl flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all backdrop-blur-sm border border-white/20"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <FileCheck className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3">
                Policy Management
              </h3>
              <p className="text-sm text-zinc-400 font-semibold leading-relaxed">
                Create, distribute, and track policy acknowledgments across your entire team with digital signatures.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3">
                Team Oversight
              </h3>
              <p className="text-sm text-zinc-400 font-semibold leading-relaxed">
                Manage employee accounts, track warnings, and maintain comprehensive records for your moving team.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3">
                Compliance Reports
              </h3>
              <p className="text-sm text-zinc-400 font-semibold leading-relaxed">
                Generate detailed reports on policy compliance, signatures, and team performance metrics.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3">
                Secure Authentication
              </h3>
              <p className="text-sm text-zinc-400 font-semibold leading-relaxed">
                Enterprise-grade security with Firebase authentication protecting your sensitive business data.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Clock className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3">
                Real-Time Updates
              </h3>
              <p className="text-sm text-zinc-400 font-semibold leading-relaxed">
                Instant notifications and updates keep your team informed about policy changes and requirements.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Award className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3">
                Professional Standards
              </h3>
              <p className="text-sm text-zinc-400 font-semibold leading-relaxed">
                Maintain industry compliance and professional standards with structured documentation.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary to-red-800 rounded-3xl p-12 text-center shadow-2xl">
            <Truck className="text-white mx-auto mb-6" size={48} />
            <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-white/90 font-semibold mb-8 max-w-2xl mx-auto">
              Join professional moving companies already using DAN to manage their teams and ensure compliance.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-zinc-100 text-primary rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-xl"
            >
              Create Your Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Image
                  src="/dan_mascot_logo.png"
                  alt="DAN Logo"
                  width={40}
                  height={40}
                  className="rounded-md"
                />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                  DAN - The Moving Man
                </h4>
              </div>
            </div>
            <p className="text-xs text-zinc-500 font-semibold">
              © 2024 DAN - The Moving Man. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
