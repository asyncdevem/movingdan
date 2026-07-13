"use client";

import React from "react";
import { useApp } from "@/app/context";
import { PoliciesList } from "@/app/components/PoliciesList";
import { redirect } from "next/navigation";

export default function EmployeePoliciesPage() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "employee") {
    redirect("/");
  }

  return <PoliciesList />;
}
