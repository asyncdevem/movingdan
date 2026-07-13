"use client";

import React from "react";
import { useApp } from "@/app/context";
import { ReportsDashboard } from "@/app/components/ReportsDashboard";
import { redirect } from "next/navigation";

export default function ManagerReportsPage() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  return <ReportsDashboard />;
}
