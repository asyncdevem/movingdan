"use client";

import React from "react";
import { useApp } from "@/app/context";
import { PolicyDetail } from "@/app/components/PolicyDetail";
import { redirect } from "next/navigation";

export default function EmployeePolicyDetailPage({ params }: { params: { id: string } }) {
  const { currentUser, isLoading } = useApp();

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "employee") {
    redirect("/");
  }

  return <PolicyDetail />;
}
