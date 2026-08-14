"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";

export default function EmployeeForgotPasswordPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch('/api/employee/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      if (data.warning) {
        setError(data.warning);
      }

      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError('Network error. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md my-8">
        
        {/* Back to Login */}
        <Link 
          href="/employee-login"
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
            Employee Account Recovery
          </p>
        </div>

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
                  Password Reset Email Sent!
                </h2>
                <p className="text-sm text-zinc-600 font-semibold mb-2">
                  Check your email for your new password.
                </p>
                <p className="text-xs text-zinc-500 font-medium mb-6">
                  Please change your password immediately after logging in for security.
                </p>
                <Link
                  href="/employee-login"
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
                    Enter your email address and we'll send you a new password.
                  </p>
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs text-blue-800 font-semibold">
                      💡 <strong>Note:</strong> A new temporary password will be sent to your email. Please change it after logging in.
                    </p>
                  </div>
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
                        placeholder="employee@movingdan.com"
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
                        <Mail size={16} />
                        Reset Password
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Back Link */}
                <div className="mt-6 pt-6 border-t border-zinc-200 text-center">
                  <Link 
                    href="/employee-login"
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
