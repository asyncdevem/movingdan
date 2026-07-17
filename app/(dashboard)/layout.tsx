"use client";

import React, { useState } from "react";
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
  AlertTriangle,
  Menu,
  X
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, logout } = useApp();
  const pathname = usePathname();
  const isManager = currentUser?.role === "manager";
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    <div className="flex h-screen w-screen bg-zinc-50">
      
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

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside className={`md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-zinc-200 z-50 transition-transform duration-300 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full py-6 px-5">
          {/* Close Button & Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
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
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-zinc-600" />
            </button>
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
                  onClick={() => setIsMobileSidebarOpen(false)}
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
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  logout();
                }}
                title="Sign Out"
                className="p-1.5 hover:bg-red-50 hover:text-red-650 text-zinc-400 rounded-lg transition-colors border border-transparent hover:border-red-100"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative md:overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-zinc-200 px-4 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors -ml-1.5"
            >
              <Menu size={20} className="text-zinc-700" />
            </button>
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

        {/* Page Content - Scrollable with padding for mobile nav and safe area */}
        <div 
          className="flex-1 flex flex-col overflow-y-auto bg-zinc-50 md:pb-0 md:overflow-hidden pt-14 md:pt-0"
          style={{ 
            paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))'
          }}
        >
          {children}
        </div>

        {/* Mobile Bottom Nav - Fixed position with safe area support */}
        <nav 
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex items-center justify-around px-2 shadow-lg z-30"
          style={{ 
            height: 'calc(4rem + env(safe-area-inset-bottom))',
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-16 h-16 gap-1 transition-all ${
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
