"use client";

import React from "react";
import { useApp } from "@/app/context";
import { HomeDashboard } from "@/app/components/HomeDashboard";
import { redirect } from "next/navigation";

export default function ManagerDashboardPage() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated (but only after loading is complete)
  if (!currentUser && !isLoading) {
    redirect("/");
  }

  // Redirect employees to employee dashboard
  if (currentUser && currentUser.role === "employee") {
    redirect("/employee");
  }

  return <HomeDashboard />;
}
