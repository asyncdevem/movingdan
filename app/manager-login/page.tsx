"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import { signInWithEmail } from "@/lib/firebase";
import { createManagerSession } from "@/app/actions/auth";

export default function ManagerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/manager';
  
  const [isMounted, setIsMounted] = useState(false);

  // Email/Password fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    setFirebaseConfigured(!!apiKey && apiKey !== "your-api-key-here");
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    if (!firebaseConfigured) {
      setError("Firebase authentication is not configured. Please contact administrator.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Authenticate with Firebase on client side
      const userCredential = await signInWithEmail(email, password);
      const user = userCredential.user;

      // Create server-side session
      const result = await createManagerSession(
        user.uid,
        user.email || email,
        user.displayName || email.split('@')[0]
      );
      
      if (result.success) {
        // Wait a moment for cookie to be set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect to callback URL or manager dashboard
        window.location.href = callbackUrl;
      } else {
        setError(result.error || "Failed to create session");
        setIsLoading(false);
      }
    } catch (err: any) {
      let errorMessage = "Authentication failed";
      
      if (err.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "No manager account found with this email.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
            Manager Sign In
          </h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-2 flex items-center justify-center gap-2">
            <Shield size={14} />
            Secure Firebase Authentication
          </p>
        </div>

        {/* Firebase Configuration Notice */}
        {!firebaseConfigured && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Configuration Required</p>
                <p className="text-[10px] text-amber-300/80 leading-relaxed">
                  Firebase not configured. Add your credentials to <code className="bg-amber-900/30 px-1 py-0.5 rounded text-[9px] font-mono">.env.local</code> to enable manager authentication.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email Address */}
              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-2 tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
                    placeholder="manager@movingdan.com"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase text-zinc-700 tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
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
                disabled={isLoading || !firebaseConfigured}
                className="w-full mt-6 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Sign In Securely
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Employee Login Link */}
            <div className="mt-6 pt-6 border-t border-zinc-200">
              <Link 
                href="/employee-login"
                className="block text-center text-xs font-bold text-primary hover:underline"
              >
                Employee? Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
