"use client";

import React from "react";
import { useApp } from "@/app/context";
import { PolicyDetail } from "@/app/components/PolicyDetail";
import { redirect } from "next/navigation";

export default function ManagerPolicyDetailPage({ params }: { params: { id: string } }) {
  const { currentUser, isLoading } = useApp();

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  return <PolicyDetail />;
}
