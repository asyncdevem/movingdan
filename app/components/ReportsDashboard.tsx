"use client";

import React, { useState } from "react";
import { useApp } from "../context";
import { ArrowLeft, BarChart3, AlertTriangle, FileText, CheckCircle2, XCircle, Download, Clock } from "lucide-react";
import * as XLSX from 'xlsx';

export const ReportsDashboard: React.FC = () => {
  const { policies, signatures, warnings, users, setNavigation, currentUser } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Filter out managers from compliance reports
  const movers = users.filter((u) => u.role === "employee");
  
  // Debug logging
  console.log('=== REPORTS DASHBOARD DEBUG ===');
  console.log('Total Users:', users.length);
  console.log('Total Movers (Employees):', movers.length);
  console.log('Total Policies:', policies.length);
  console.log('Total Signatures:', signatures.length);
  console.log('Movers:', movers);
  console.log('Policies:', policies);
  console.log('Signatures:', signatures);
  
  // Total compliance checks = total movers * total policies
  const totalChecks = movers.length * policies.length;
  // Current signatures by active movers
  const moverSignatures = signatures.filter((s) => 
    movers.some((m) => m.id === s.employeeId)
  );
  
  const signedChecks = moverSignatures.length;
  const compliancePercentage = totalChecks > 0 ? Math.round((signedChecks / totalChecks) * 100) : 0;

  console.log('Total Checks:', totalChecks);
  console.log('Signed Checks:', signedChecks);
  console.log('Compliance %:', compliancePercentage);

  // Calculate signature status per policy
  const policyStats = policies.map((policy) => {
    const signedCount = signatures.filter((s) => s.policyId === policy.id).length;
    const rate = movers.length > 0 ? Math.round((signedCount / movers.length) * 100) : 0;
    return {
      ...policy,
      signedCount,
      rate
    };
  });

  const handleExportExcel = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Overall Compliance Summary
      const summaryData: (string | number)[][] = [
        ['DAN - THE MOVING MAN', '', '', ''],
        ['Compliance Report', '', '', ''],
        ['Generated:', new Date().toLocaleString(), '', ''],
        ['', '', '', ''],
        ['OVERALL METRICS', '', '', ''],
        ['Total Employees:', movers.length, '', ''],
        ['Total Policies:', policies.length, '', ''],
        ['Total Required Signatures:', totalChecks, '', ''],
        ['Completed Signatures:', signedChecks, '', ''],
        ['Compliance Rate:', `${compliancePercentage}%`, '', ''],
        ['', '', '', ''],
        ['POLICY BREAKDOWN', '', '', ''],
        ['Policy Name', 'Signatures', 'Total Movers', 'Completion %'],
      ];

      policyStats.forEach(stat => {
        summaryData.push([
          stat.title,
          stat.signedCount,
          movers.length,
          `${stat.rate}%`
        ]);
      });

      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

      // Sheet 2: Employee Compliance Detail
      const employeeData: (string | number)[][] = [
        ['Employee Name', 'Email', 'Title', 'Policies Signed', 'Total Policies', 'Compliance %', 'Warnings']
      ];

      movers.forEach(mover => {
        const moverSigs = signatures.filter(s => s.employeeId === mover.id);
        const moverWarnings = warnings.filter(w => w.employeeId === mover.id);
        const compliance = policies.length > 0 ? Math.round((moverSigs.length / policies.length) * 100) : 0;
        
        employeeData.push([
          mover.name,
          mover.email,
          mover.title,
          moverSigs.length,
          policies.length,
          `${compliance}%`,
          moverWarnings.length
        ]);
      });

      const ws2 = XLSX.utils.aoa_to_sheet(employeeData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Employee Details');

      // Sheet 3: Warnings Log
      const warningsData: (string | number)[][] = [
        ['Date', 'Employee', 'Warning Type', 'Severity', 'Cost', 'Incident Details', 'Issued By', 'Status']
      ];

      warnings.forEach(warning => {
        warningsData.push([
          warning.date,
          warning.employeeName,
          warning.warningType,
          warning.severity,
          `$${warning.cost}`,
          warning.incidentDetails || warning.details,
          warning.issuedBy,
          warning.status
        ]);
      });

      const ws3 = XLSX.utils.aoa_to_sheet(warningsData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Warnings');

      // Sheet 4: Policy Signatures
      const signaturesData: (string | number)[][] = [
        ['Employee Name', 'Policy Name', 'Signed Date', 'Email']
      ];

      signatures.forEach(sig => {
        const employee = users.find(u => u.id === sig.employeeId);
        const policy = policies.find(p => p.id === sig.policyId);
        
        if (employee && policy) {
          signaturesData.push([
            employee.name,
            policy.title,
            new Date(sig.signedAt).toLocaleString(),
            employee.email
          ]);
        }
      });

      const ws4 = XLSX.utils.aoa_to_sheet(signaturesData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Signatures');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Compliance_Report_${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Check console for details.');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* Top Header Navigation */}
      <div className="h-14 bg-white border-b border-zinc-100 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNavigation("home")}
            className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-700" />
          </button>
          <h2 className="text-base font-extrabold text-zinc-900">Compliance Reports</h2>
        </div>
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-primary border border-red-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors active:scale-95"
        >
          <Download size={12} />
          Export
        </button>
      </div>

      {/* Main Dashboard Panel (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 py-5 bg-zinc-50">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        
        {downloadSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-xl p-3 text-center">
            Excel Compliance Report exported successfully! Check downloads.
          </div>
        )}

        {/* Global Compliance Metric Card */}
        <div className="bg-zinc-900 text-white rounded-2xl p-5 border border-zinc-800 shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
            <BarChart3 size={160} />
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-500">Overall Score</span>
              <h3 className="text-3xl font-black mt-1">{compliancePercentage}%</h3>
              <p className="text-[11px] text-zinc-400 font-semibold mt-1">Corporate policy signature compliance</p>
            </div>
            
            <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-sm relative">
              {/* Radial Progress Outline */}
              <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="stroke-zinc-700 fill-none"
                  strokeWidth="4"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="stroke-red-500 fill-none"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - compliancePercentage / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-xs text-zinc-200 relative z-10">{signedChecks}/{totalChecks}</span>
            </div>
          </div>
        </div>

        {/* Policy-by-Policy Compliance Breakdown */}
        <div>
          <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-3">Policy Sign-off Rates</h4>
          <div className="flex flex-col gap-3">
            {policyStats.map((stat) => (
              <div key={stat.id} className="bg-white rounded-2xl p-4 border border-zinc-150 shadow-3xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-zinc-900">{stat.title}</span>
                  </div>
                  <span className={`text-[10px] font-black ${
                    stat.rate > 80 ? "text-emerald-600" : stat.rate > 40 ? "text-amber-600" : "text-primary"
                  }`}>
                    {stat.rate}% ({stat.signedCount}/{movers.length})
                  </span>
                </div>
                {/* SVG Progress Bar */}
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      stat.rate > 80 ? "bg-emerald-500" : stat.rate > 40 ? "bg-amber-500" : "bg-primary"
                    }`}
                    style={{ width: `${stat.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Written Warning Incident Log */}
        <div>
          <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-3">Recent Disciplinary Filings ({warnings.length})</h4>
          <div className="flex flex-col gap-3 pb-8">
            {warnings.length > 0 ? (
              warnings.map((warning) => (
                <div key={warning.id} className="bg-white rounded-2xl p-4 border border-zinc-150 shadow-3xs flex gap-3">
                  <div className="bg-zinc-100 text-zinc-800 p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-black text-zinc-900 truncate">{warning.employeeName}</h5>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        warning.severity === "Final Warning" 
                          ? "bg-red-100 text-red-700" 
                          : warning.severity === "Written" 
                          ? "bg-zinc-900 text-white" 
                          : "bg-zinc-100 text-zinc-600"
                      }`}>
                        {warning.severity}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 mt-0.5">{warning.warningType || "Warning"} • {warning.date}</p>
                    <p className="text-[11px] text-zinc-600 font-medium leading-relaxed mt-2 bg-zinc-50 p-2 rounded-lg border border-zinc-100 italic">
                      &quot;{warning.details}&quot;
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                      <span>Issued by: {warning.issuedBy}</span>
                      <span className="text-emerald-600 flex items-center gap-0.5 font-black">
                        <CheckCircle2 size={10} />
                        Signed
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-2xl border border-zinc-100">
                <p className="text-xs font-semibold text-zinc-400">No warnings logged in the system.</p>
              </div>
            )}
          </div>
        </div>
        </div>

      </div>

    </div>
  );
};
