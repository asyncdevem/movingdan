"use client";

import React from "react";
import { useApp } from "@/app/context";
import { HomeDashboard } from "@/app/components/HomeDashboard";
import { useRouter } from "next/navigation";

export default function EmployeeDashboardPage() {
  const { currentUser, isLoading } = useApp();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = React.useState(false);

  // Handle redirects in useEffect (not during render)
  React.useEffect(() => {
    // Only act after loading is completely done
    if (isLoading) {
      return; // Still loading, don't do anything
    }
    
    // Now loading is done, mark as checked
    if (!hasCheckedAuth) {
      setHasCheckedAuth(true);
    }
    
    // Redirect to login if not authenticated
    if (!currentUser) {
      router.push("/");
      return;
    }
    
    // Redirect managers to manager dashboard
    if (currentUser.role === "manager") {
      router.push("/manager");
      return;
    }
  }, [isLoading, currentUser, router, hasCheckedAuth]);

  // Show loading state while checking authentication
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!currentUser || currentUser.role !== "employee") {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show employee dashboard
  return <HomeDashboard />;
}
