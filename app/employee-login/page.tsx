"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useApp } from "../context";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function EmployeeLoginPage() {
  const router = useRouter();
  const { currentUser, isLoading: contextLoading, loginEmployee } = useApp();
  const [isMounted, setIsMounted] = useState(false);

  // Login fields
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!contextLoading && currentUser && currentUser.role === "employee") {
      router.replace("/employee");
    }
  }, [currentUser, contextLoading, router]);

  if (!isMounted) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !password) {
      setError("Please enter phone number and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await loginEmployee(phone, password);
      
      if (success) {
        // User will be redirected by useEffect after context updates
      } else {
        setError("Invalid phone number or password. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md my-8">
        
        {/* Back to Home */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg">
            <Image
              src="/dan_mascot_logo.png"
              alt="DAN Logo"
              width={64}
              height={64}
              className="rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Employee Sign In
          </h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-2">
            Enter your credentials
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Phone Number */}
              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-2 tracking-wider">
                  Phone Number
                </label>
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={phone}
                  onChange={(value) => setPhone(value || "")}
                  className="phone-input-custom"
                  placeholder="Enter phone number"
                />
                <p className="text-[10px] text-zinc-500 mt-1.5 font-semibold">
                  Use the phone number provided by your manager
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-2 tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-xs font-bold text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-zinc-200">
              <p className="text-xs text-zinc-600 font-semibold text-center">
                Don't have an account? Contact your manager to create one.
              </p>
            </div>

            {/* Manager Login Link */}
            <div className="mt-4">
              <Link 
                href="/manager-login"
                className="block text-center text-xs font-bold text-primary hover:underline"
              >
                Are you a manager? Sign in here
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 mt-6 font-semibold">
          Powered by <span className="text-zinc-400 font-black">DAN - The Moving Man</span>
        </p>
      </div>
    </div>
  );
}
