"use client";

import React, { use, useState, useRef, useEffect } from "react";
import { useApp } from "@/app/context";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Calendar, DollarSign, User, FileText, PenTool, RotateCcw, CheckCircle } from "lucide-react";
import { Toast, ToastType } from "@/app/components/Toast";

export default function EmployeeWarningDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { currentUser, warnings, isLoading, signWarning, refreshData } = useApp();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // Unwrap params Promise
  const { id } = use(params);

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "employee") {
    redirect("/");
  }

  const warning = warnings.find((w) => w.id === id && w.employeeId === currentUser.id);

  // Set up drawing canvas for signature
  useEffect(() => {
    if (!showSignatureModal || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#c5221f"; // Primary Red ink
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, [showSignatureModal]);

  // Canvas drawing handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && coords) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && coords) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setHasDrawn(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleSignWarning = async () => {
    if (!hasDrawn || !canvasRef.current || !warning) {
      setToast({ message: 'Please provide your signature', type: 'error' });
      return;
    }

    setIsSigning(true);
    try {
      const signatureData = canvasRef.current.toDataURL("image/png");
      await signWarning(warning.id, signatureData);
      setToast({ message: 'Warning signed successfully', type: 'success' });
      setShowSignatureModal(false);
      setHasDrawn(false);
      await refreshData();
    } catch (error) {
      setToast({ message: 'Failed to sign warning', type: 'error' });
    } finally {
      setIsSigning(false);
    }
  };

  if (!warning) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-zinc-300 mb-3" />
          <h2 className="text-lg font-black text-zinc-900">Warning Not Found</h2>
          <p className="text-sm text-zinc-500 mt-1">This warning record does not exist or you don't have access to it.</p>
          <Link
            href="/employee/compliance"
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase"
          >
            Back to Compliance
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-700" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-zinc-900">Warning Details</h2>
            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
              ID: {warning.id}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Status Banner */}
          <div className={`rounded-2xl p-5 mb-6 border flex items-center gap-4 ${
            warning.status === "Active"
              ? "bg-red-50 border-red-200"
              : "bg-emerald-50 border-emerald-200"
          }`}>
            <div className={`p-3 rounded-xl ${
              warning.status === "Active" ? "bg-red-500" : "bg-emerald-500"
            }`}>
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-black uppercase tracking-wider ${
                warning.status === "Active" ? "text-red-700" : "text-emerald-700"
              }`}>
                {warning.status === "Active" ? "Active Warning" : "Resolved"}
              </h3>
              <p className="text-xs text-zinc-600 font-semibold mt-1">
                {warning.status === "Active" 
                  ? "This warning is currently active. Please review and acknowledge."
                  : "This warning has been resolved and closed."}
              </p>
            </div>
            <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
              warning.severity === "Final Warning" 
                ? "bg-red-700 text-white" 
                : warning.severity === "Written"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-600 text-white"
            }`}>
              {warning.severity}
            </span>
          </div>

          {/* Warning Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            {/* Warning Type */}
            <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-red-50 text-primary">
                  <AlertTriangle size={16} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">Warning Type</h4>
              </div>
              <p className="text-base font-black text-zinc-900">{warning.warningType}</p>
            </div>

            {/* Penalty Cost */}
            <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <DollarSign size={16} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">Penalty Cost</h4>
              </div>
              <p className="text-base font-black text-zinc-900">${warning.cost.toFixed(2)}</p>
            </div>

            {/* Date Issued */}
            <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Calendar size={16} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">Date Issued</h4>
              </div>
              <p className="text-base font-black text-zinc-900">{warning.date}</p>
            </div>

            {/* Issued By */}
            <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <User size={16} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">Issued By</h4>
              </div>
              <p className="text-base font-black text-zinc-900">{warning.issuedBy}</p>
            </div>
          </div>

          {/* Incident Details */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
              <FileText size={14} />
              Incident Details
            </h4>
            <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-200">
              <p className="text-sm text-zinc-700 leading-relaxed font-semibold">
                {warning.incidentDetails || warning.details || "No details provided"}
              </p>
            </div>
          </div>

          {/* Additional Notes (if exists) */}
          {warning.additionalNotes && (
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4">
                Additional Notes
              </h4>
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <p className="text-sm text-zinc-700 leading-relaxed font-semibold">
                  {warning.additionalNotes}
                </p>
              </div>
            </div>
          )}

          {/* Damage Details (if applicable) */}
          {warning.damageDate && warning.damageCost && (
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4">
                Damage Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Damage Date</p>
                  <p className="text-sm font-bold text-zinc-900 mt-1">{warning.damageDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Estimated Cost</p>
                  <p className="text-sm font-bold text-zinc-900 mt-1">${warning.damageCost}</p>
                </div>
              </div>
            </div>
          )}

          {/* Photos (if exists) */}
          {warning.photos && warning.photos.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4">
                Incident Photos ({warning.photos.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {warning.photos.map((photo, index) => (
                  <div key={index} className="aspect-video bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden">
                    {photo && photo.startsWith('data:image') ? (
                      <img 
                        src={photo} 
                        alt={`Incident photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-xs text-zinc-400 font-semibold">Photo {index + 1}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Information Card */}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500 text-white shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 mb-2">
                  What This Means
                </h4>
                <p className="text-xs text-zinc-700 leading-relaxed font-semibold">
                  This warning has been issued as part of company policy enforcement. Please review the details carefully and reach out to your manager if you have any questions or concerns about this incident.
                </p>
              </div>
            </div>
          </div>

          {/* Employee Signature Section */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4">
              Employee Acknowledgment
            </h4>
            {warning.employeeSignature ? (
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle size={20} className="text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-700">You have signed this warning</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Your Signature</p>
                  <div className="h-24 flex items-center justify-center bg-zinc-50 rounded-lg border border-zinc-200">
                    {warning.employeeSignature.startsWith('data:image') ? (
                      <img 
                        src={warning.employeeSignature} 
                        alt="Employee signature" 
                        className="max-h-20 object-contain"
                      />
                    ) : (
                      <p className="text-xs text-zinc-500 font-semibold italic">Signed</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 mb-4">
                  <div className="flex items-center gap-3">
                    <PenTool size={18} className="text-amber-600" />
                    <p className="text-sm font-bold text-amber-700">Signature Required</p>
                  </div>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    You must acknowledge this warning by providing your digital signature. This confirms you have read and understood the incident details.
                  </p>
                </div>
                <button
                  onClick={() => setShowSignatureModal(true)}
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <PenTool size={16} />
                  Sign Warning
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-lg font-black text-zinc-900 mb-2">Sign Warning</h3>
            <p className="text-xs text-zinc-600 font-semibold mb-4">
              Please sign below to acknowledge you have read and understood this warning.
            </p>
            
            {/* Canvas */}
            <div className="border-2 border-zinc-300 rounded-xl mb-4 bg-zinc-50 relative">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-48 touch-none cursor-crosshair rounded-xl"
                style={{ touchAction: 'none' }}
              />
              {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-xs text-zinc-400 font-semibold">Sign here with your finger or mouse</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={clearCanvas}
                disabled={!hasDrawn}
                className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RotateCcw size={14} />
                Clear
              </button>
              <button
                onClick={() => {
                  setShowSignatureModal(false);
                  setHasDrawn(false);
                  clearCanvas();
                }}
                disabled={isSigning}
                className="flex-1 px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSignWarning}
                disabled={!hasDrawn || isSigning}
                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSigning ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
