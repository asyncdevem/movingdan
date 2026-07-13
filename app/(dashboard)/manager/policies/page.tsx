"use client";

import React from "react";
import { useApp } from "@/app/context";
import { PoliciesList } from "@/app/components/PoliciesList";
import { redirect } from "next/navigation";

export default function ManagerPoliciesPage() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  return <PoliciesList />;
}
