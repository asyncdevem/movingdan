"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, Lock, Phone, ArrowRight, Loader2, 
  AlertCircle, KeyRound, Eye, EyeOff, ArrowLeft
} from "lucide-react";
import { useApp } from "../context";
import { 
  signInWithEmail, 
  setupRecaptcha, 
  sendPhoneVerification,
  verifyPhoneCode,
} from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, isLoading: contextLoading } = useApp();
  const [isMounted, setIsMounted] = useState(false);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<"credentials" | "verify">("credentials");

  // Email/Password fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    setFirebaseConfigured(!!apiKey && apiKey !== "your-api-key-here");
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!contextLoading && currentUser) {
      const role = currentUser.role || 'employee';
      const redirectPath = role === "manager" ? "/manager" : "/employee";
      router.replace(redirectPath);
    }
  }, [currentUser, contextLoading, router]);

  if (!isMounted) {
    return null;
  }

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (!firebaseConfigured) {
        setError("Firebase is not configured. Please contact administrator.");
        setIsLoading(false);
        return;
      }

      const userCredential = await signInWithEmail(email, password);
      // User will be redirected by useEffect after context updates
      
    } catch (err: any) {
      let errorMessage = "Authentication failed";
      
      if (err.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email. Please sign up first.";
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
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneAuth = async () => {
    if (!phoneNumber) {
      setError("Please enter phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (!firebaseConfigured) {
        setError("Firebase is not configured. Please contact administrator.");
        setIsLoading(false);
        return;
      }

      const recaptchaVerifier = setupRecaptcha("recaptcha-container");
      const result = await sendPhoneVerification(phoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      setStep("verify");
      
    } catch (phoneError: any) {
      let errorMessage = "Phone authentication failed";
      
      if (phoneError.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number format. Please use format: +1234567890";
      } else if (phoneError.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (phoneError.message) {
        errorMessage = phoneError.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError("Please enter verification code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (!firebaseConfigured) {
        setError("Firebase is not configured. Please contact administrator.");
        setIsLoading(false);
        return;
      }

      await verifyPhoneCode(confirmationResult.verificationId, verificationCode);
      // User will be redirected by useEffect after context updates
      
    } catch (err: any) {
      let errorMessage = "Verification failed";
      
      if (err.code === "auth/invalid-verification-code") {
        errorMessage = "Invalid verification code. Please check and try again.";
      } else if (err.code === "auth/code-expired") {
        errorMessage = "Verification code has expired. Please request a new code.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
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
            Welcome Back
          </h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-2">
            Sign in to your account
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Form Content */}
          <div className="p-8">

            {/* Step 1: Credentials */}
            {step === "credentials" && (
              <>
                {/* Method Selector */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <button
                    onClick={() => setMethod("email")}
                    className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      method === "email"
                        ? "bg-primary text-white shadow-md"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    <Mail size={14} />
                    Email
                  </button>
                  <button
                    onClick={() => setMethod("phone")}
                    className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      method === "phone"
                        ? "bg-primary text-white shadow-md"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    <Phone size={14} />
                    Phone
                  </button>
                </div>

                {/* Phone Auth Notice */}
                {method === "phone" && firebaseConfigured && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <p className="text-[10px] font-bold text-amber-800">
                      <span className="font-black">Note:</span> Phone authentication requires additional Firebase setup. If you see errors, please use Email sign-in.
                    </p>
                  </div>
                )}

                {/* Email Method */}
                {method === "email" && (
                  <div className="space-y-4">
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
                          onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                          placeholder="you@movingdan.com"
                          className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>

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
                          onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
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
                  </div>
                )}

                {/* Phone Method */}
                {method === "phone" && (
                  <div>
                    <label className="block text-xs font-black uppercase text-zinc-700 mb-2 tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2 font-semibold">
                      Include country code (e.g., +1 for USA)
                    </p>
                  </div>
                )}

                {/* Hidden reCAPTCHA container */}
                <div id="recaptcha-container"></div>

                {/* Error Messages */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-bold text-red-800">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={method === "email" ? handleEmailAuth : handlePhoneAuth}
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
                      {method === "phone" ? "Send Code" : "Sign In"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Sign Up Link */}
                <p className="text-center text-xs text-zinc-600 mt-6 font-semibold">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-primary font-black hover:underline">
                    Sign Up
                  </Link>
                </p>
              </>
            )}

            {/* Step 2: Verify Phone */}
            {step === "verify" && (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                    <KeyRound className="text-primary" size={24} />
                  </div>
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">
                    Verify Your Phone
                  </h3>
                  <p className="text-xs text-zinc-600 mt-2 font-semibold">
                    Enter the 6-digit code sent to {phoneNumber}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-zinc-700 mb-2 tracking-wider">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-center text-2xl font-black text-zinc-900 tracking-widest placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-bold text-red-800">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleVerifyCode}
                  disabled={isLoading}
                  className="w-full mt-6 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button
                  onClick={() => setStep("credentials")}
                  className="w-full mt-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  ← Back to phone number
                </button>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
