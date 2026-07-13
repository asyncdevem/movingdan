"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/app/context";
import { 
  Home as HomeIcon, 
  Users as UsersIcon, 
  BarChart3 as ReportsIcon, 
  Settings as SettingsIcon,
  LogOut,
  FileText,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, logout } = useApp();
  const pathname = usePathname();
  const isManager = currentUser?.role === "manager";

  const managerNavItems = [
    { href: "/manager", label: "Home", icon: HomeIcon },
    { href: "/manager/employees", label: "Directory", icon: UsersIcon },
    { href: "/manager/warnings", label: "Warnings", icon: AlertTriangle },
    { href: "/manager/reports", label: "Reports", icon: ReportsIcon },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const employeeNavItems = [
    { href: "/employee", label: "Home", icon: HomeIcon },
    { href: "/employee/policies", label: "Policies", icon: FileText },
    { href: "/employee/compliance", label: "Compliance", icon: ShieldCheck },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const navItems = isManager ? managerNavItems : employeeNavItems;

  return (
    <div className="flex h-screen w-screen bg-zinc-50 overflow-hidden">
      
      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-200 py-6 px-5 shrink-0 z-20">
        
        {/* Logo */}
        <div className="flex items-center gap-3 px-1 mb-8">
          <div className="relative w-10 h-10 shrink-0 bg-white border border-zinc-200 rounded-xl overflow-hidden flex items-center justify-center shadow-2xs">
            <Image
              src="/dan_mascot_logo.png"
              alt="Mascot Logo"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-xs font-black uppercase text-zinc-900 tracking-tight leading-tight">
              Dan <span className="text-primary">- Moving Man</span>
            </h1>
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 mt-0.5">
              Compliance Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all ${
                  isActive
                    ? "bg-red-50 text-primary"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="pt-4 border-t border-zinc-150 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser?.avatar}
              </div>
              <div className="min-w-0">
                <h5 className="text-[11px] font-black text-zinc-900 leading-tight truncate">{currentUser?.name}</h5>
                <span className="text-[9px] font-bold text-zinc-400 capitalize block mt-0.5">{currentUser?.role}</span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 hover:bg-red-50 hover:text-red-650 text-zinc-400 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-white border-b border-zinc-200 px-4 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border border-zinc-200 flex items-center justify-center">
              <Image
                src="/dan_mascot_logo.png"
                alt="Logo"
                width={32}
                height={32}
              />
            </div>
            <h1 className="text-xs font-black uppercase text-zinc-900 tracking-tight">
              Dan <span className="text-primary">- Moving Man</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full uppercase tracking-wider">
              {currentUser?.role}
            </span>
            <button
              onClick={logout}
              className="p-1 text-zinc-500 hover:text-red-500 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-55">
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden h-16 bg-white border-t border-zinc-200 flex items-center justify-around px-2 shrink-0 shadow-sm z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${
                  isActive ? "text-primary scale-105 font-black" : "text-zinc-400 hover:text-zinc-650"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </nav>

      </main>

    </div>
  );
}
