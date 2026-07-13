"use client";

import React from "react";
import { useApp } from "@/app/context";
import { AddPolicyForm } from "@/app/components/AddPolicyForm";
import { redirect } from "next/navigation";

export default function AddPolicyPage() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  return <AddPolicyForm />;
}
