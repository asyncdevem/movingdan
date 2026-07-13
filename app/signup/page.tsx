"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, Lock, Phone, ArrowRight, Loader2, Shield,
  CheckCircle, AlertCircle, User, KeyRound, Eye, EyeOff, ArrowLeft
} from "lucide-react";
import { useApp } from "../context";
import { 
  signUpWithEmail, 
  setupRecaptcha, 
  sendPhoneVerification,
  verifyPhoneCode,
  createUserProfile,
  auth,
} from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();
  const { currentUser, isLoading: contextLoading } = useApp();
  const [isMounted, setIsMounted] = useState(false);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<"credentials" | "verify" | "profile">("credentials");

  // Email/Password fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Profile fields (for signup) - always employee role
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const role = "employee"; // Fixed to employee

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const handleEmailSignup = async () => {
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

      await signUpWithEmail(email, password);
      setStep("profile");
      
    } catch (err: any) {
      let errorMessage = "Signup failed";
      
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignup = async () => {
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
      setSuccess("Verification code sent!");
      
    } catch (phoneError: any) {
      let errorMessage = "Phone signup failed";
      
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
      setStep("profile");
      
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

  const handleCompleteProfile = async () => {
    if (!name || !title) {
      setError("Please complete all profile fields");
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

      const userId = auth?.currentUser?.uid;
      if (userId) {
        const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
        await createUserProfile(userId, {
          name,
          email: email || "",
          phone: phoneNumber || "",
          role: "employee",
          title,
          avatar: initials,
        });
        // User will be redirected by useEffect after context updates
      } else {
        throw new Error("No authenticated user found");
      }

    } catch (err: any) {
      setError(err.message || "Failed to create profile");
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
            Create Account
          </h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-2">
            Join DAN - The Moving Man
          </p>
        </div>

        {/* Employee Signup Notice */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="text-blue-400 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-xs font-bold text-blue-400 mb-1">Employee Account Signup</p>
              <p className="text-[10px] text-blue-300/80 leading-relaxed">
                Sign up to create an employee account. Manager accounts are created by administrators only.
              </p>
            </div>
          </div>
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
                      <span className="font-black">Note:</span> Phone authentication requires additional Firebase setup. If you see errors, please use Email sign-up.
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
                          onKeyDown={(e) => e.key === "Enter" && handleEmailSignup()}
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
                          onKeyDown={(e) => e.key === "Enter" && handleEmailSignup()}
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
                      <p className="text-[10px] text-zinc-500 mt-2 font-semibold">
                        Must be at least 6 characters
                      </p>
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

                {/* Error/Success Messages */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-bold text-red-800">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                    <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-bold text-emerald-800">{success}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={method === "email" ? handleEmailSignup : handlePhoneSignup}
                  disabled={isLoading}
                  className="w-full mt-6 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Processing...
                    </>
                  ) : (
                    <>
                      {method === "phone" ? "Send Code" : "Continue"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Sign In Link */}
                <p className="text-center text-xs text-zinc-600 mt-6 font-semibold">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-black hover:underline">
                    Sign In
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

                {success && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                    <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-bold text-emerald-800">{success}</p>
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

            {/* Step 3: Complete Profile */}
            {step === "profile" && (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                    <User className="text-primary" size={24} />
                  </div>
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">
                    Complete Your Profile
                  </h3>
                  <p className="text-xs text-zinc-600 mt-2 font-semibold">
                    Tell us a bit about yourself
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-zinc-700 mb-2 tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && title && handleCompleteProfile()}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-zinc-700 mb-2 tracking-wider">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && name && handleCompleteProfile()}
                      placeholder="Professional Mover"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-zinc-600">
                      <span className="text-primary font-black">Employee Account:</span> You're signing up as an employee. Manager accounts are created by administrators only.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-bold text-red-800">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                    <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-bold text-emerald-800">{success}</p>
                  </div>
                )}

                <button
                  onClick={handleCompleteProfile}
                  disabled={isLoading}
                  className="w-full mt-6 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle size={16} />
                    </>
                  )}
                </button>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
