"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, AlertCircle, ArrowLeft, CheckCircle, Shield } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    setFirebaseConfigured(!!apiKey && apiKey !== "your-api-key-here");
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!firebaseConfigured) {
      setError("Firebase authentication is not configured. Please contact administrator.");
      return;
    }

    if (!auth) {
      setError("Firebase authentication is not initialized.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      let errorMessage = "Failed to send password reset email";
      
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md my-8">
        
        {/* Back to Login */}
        <Link 
          href="/manager-login"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Login
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
            Reset Password
          </h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-2">
            Manager Account Recovery
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
                  Firebase not configured. Contact your administrator.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reset Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Form Content */}
          <div className="p-8">
            {success ? (
              /* Success Message */
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h2 className="text-lg font-black text-zinc-900 mb-2">
                  Email Sent!
                </h2>
                <p className="text-sm text-zinc-600 font-semibold mb-6">
                  If an account exists with that email, you'll receive password reset instructions shortly.
                </p>
                <Link
                  href="/manager-login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  <ArrowLeft size={16} />
                  Return to Login
                </Link>
              </div>
            ) : (
              /* Reset Form */
              <>
                <div className="mb-6">
                  <p className="text-sm text-zinc-600 font-semibold">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  
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
                        onKeyDown={(e) => e.key === "Enter" && handleResetPassword(e)}
                        placeholder="manager@movingdan.com"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        autoFocus
                      />
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        Send Reset Link
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Back Link */}
                <div className="mt-6 pt-6 border-t border-zinc-200 text-center">
                  <Link 
                    href="/manager-login"
                    className="text-xs font-bold text-zinc-600 hover:text-primary transition-colors"
                  >
                    Remember your password? Sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
