"use client";

import React from "react";
import { useApp } from "@/app/context";
import { WarningForm } from "@/app/components/WarningForm";
import { redirect } from "next/navigation";

export default function NewWarningPage() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  return <WarningForm />;
}
