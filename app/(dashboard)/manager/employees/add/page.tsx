"use client";

import React from "react";
import { useApp } from "@/app/context";
import { AddEmployeeForm } from "@/app/components/AddEmployeeForm";
import { redirect } from "next/navigation";

export default function AddEmployeePage() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  return <AddEmployeeForm />;
}
