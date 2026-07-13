"use client";

import React from "react";
import { useApp } from "@/app/context";
import { SettingsView } from "@/app/components/SettingsView";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) return null;

  if (!currentUser) {
    redirect("/");
  }

  return <SettingsView />;
}
