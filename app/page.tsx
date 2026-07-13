"use client";

import React, { useEffect } from "react";
import { useApp } from "./context";
import { FirebaseAuthScreen } from "./components/FirebaseAuthScreen";
import { useRouter } from "next/navigation";

export default function Home() {
  const { currentUser, isLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentUser) {
      // Redirect authenticated users to their dashboard
      if (currentUser.role === "manager") {
        router.push("/manager");
      } else {
        router.push("/employee");
      }
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

  // Auth gate - show login screen if not authenticated
  if (!currentUser) {
    return <FirebaseAuthScreen onAuthSuccess={async (userId) => {
      // Firebase auth succeeded - user will be redirected by useEffect
      console.log("Firebase auth successful for user:", userId);
    }} />;
  }

  // Show loading while redirecting
  return (
    <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-white select-none">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Redirecting...</p>
      </div>
    </div>
  );
}
