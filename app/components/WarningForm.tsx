"use client";

import React, { useRef, useState, useEffect } from "react";
import { useApp } from "../context";
import { ArrowLeft, AlertTriangle, PenTool, RotateCcw, ShieldCheck, CheckCircle } from "lucide-react";

export const WarningForm: React.FC = () => {
  const { users, issueWarning, setNavigation } = useApp();
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [employeeId, setEmployeeId] = useState("");
  const [category, setCategory] = useState("Tardiness / Lateness");
  const [severity, setSeverity] = useState<"Verbal" | "Written" | "Final Warning">("Written");
  const [details, setDetails] = useState("");
  const [validationError, setValidationError] = useState("");

  // Only managers can access this, and they only issue warnings to movers (role === employee)
  const movers = users.filter((u) => u.role === "employee");

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#111827"; // Charcoal/Black ink color
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && coords) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeId) {
      setValidationError("Please select an employee.");
      return;
    }
    if (!details.trim() || details.trim().length < 10) {
      setValidationError("Please write detailed incident notes (min 10 chars).");
      return;
    }
    if (!canvasRef.current || !hasDrawn) {
      setValidationError("Manager signature is required.");
      return;
    }

    setValidationError("");
    
    // Save warning
    issueWarning({
      employeeId,
      employeeName: "", // sets automatically in context
      category,
      severity,
      details,
      managerSignature: canvasRef.current.toDataURL("image/png")
    });

    setSuccess(true);
    setTimeout(() => {
      setNavigation("home");
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* Top Header Navigation */}
      <div className="h-14 bg-white border-b border-zinc-100 px-4 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setNavigation("home")}
          className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-zinc-700" />
        </button>
        <h2 className="text-base font-extrabold text-zinc-900">Written Warning</h2>
      </div>

      {/* Form Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 py-6 bg-zinc-50">
        <div className="max-w-2xl mx-auto w-full bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-3xs my-4">
        
        {/* Warning Notification Alert */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <div className="bg-red-500 text-white p-2 rounded-xl shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-primary">HR Compliance Notice</h4>
            <p className="text-[11px] font-semibold text-zinc-600 leading-normal mt-1">
              Ensure warning notes are objective, factual, and specify exact dates, times, and infractions. These logs are added to the employee&apos;s permanent file.
            </p>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 mb-6 animate-bounce">
            <CheckCircle className="text-emerald-500 shrink-0" size={24} />
            <div>
              <p className="text-xs font-bold text-emerald-800">Warning Logged Successfully!</p>
              <p className="text-[10px] text-emerald-600">The incident record is updated in reports.</p>
            </div>
          </div>
        )}

        {validationError && (
          <div className="bg-red-50 border border-red-200 text-primary text-xs font-bold rounded-xl p-3 mb-4">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-10">
          
          {/* Target Employee Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-600 tracking-wider">Select Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-white border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 rounded-xl px-4 py-3 text-xs font-bold text-zinc-800 outline-none transition-all"
            >
              <option value="">-- Choose Mover --</option>
              {movers.map((mover) => (
                <option key={mover.id} value={mover.id}>
                  {mover.name} ({mover.title})
                </option>
              ))}
            </select>
          </div>

          {/* Infraction Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-600 tracking-wider">Infraction Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 rounded-xl px-4 py-3 text-xs font-bold text-zinc-800 outline-none transition-all"
            >
              <option value="Tardiness / Lateness">Tardiness / Lateness</option>
              <option value="Property Damage">Property Damage</option>
              <option value="Vehicle Misuse">Vehicle Misuse (Uhaul/Company Fleet)</option>
              <option value="Safety Protocol Violation">Safety Protocol Violation</option>
              <option value="Unexcused Absence">Unexcused Absence</option>
              <option value="Policy Violation">Policy Non-Compliance</option>
              <option value="Other / Misconduct">Other / Professional Misconduct</option>
            </select>
          </div>

          {/* Severity Level Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-600 tracking-wider">Warning Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Verbal", "Written", "Final Warning"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSeverity(level)}
                  className={`py-2.5 px-2 rounded-xl text-[10px] font-black uppercase border transition-all text-center ${
                    severity === level
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-xs"
                      : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-600 tracking-wider">Incident Details</label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe the incident in detail. Include dates, specific actions, customer impact, or damages caused..."
              className="w-full bg-white border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-800 placeholder-zinc-400 outline-none transition-all resize-none"
            />
          </div>

          {/* Manager Signature Canvas */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-600 tracking-wider flex items-center gap-1.5">
              <PenTool size={13} className="text-primary" />
              Manager Digital Sign-off
            </label>
            
            <div className="bg-white border border-zinc-200 rounded-2xl p-4">
              <div className="relative border border-zinc-200 rounded-xl bg-zinc-50 overflow-hidden h-32">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="signature-canvas w-full h-full cursor-crosshair absolute inset-0"
                />
                
                <div className="absolute bottom-4 left-4 right-4 border-b border-zinc-300 pointer-events-none flex justify-between text-[8px] text-zinc-400 font-bold uppercase tracking-wider">
                  <span>X</span>
                  <span>Manager Signature</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <button
                  type="button"
                  onClick={clearCanvas}
                  disabled={!hasDrawn}
                  className={`flex items-center gap-1 text-[10px] font-bold py-1.5 px-3 rounded-lg border transition-all ${
                    hasDrawn
                      ? "text-zinc-700 bg-white hover:bg-zinc-50 border-zinc-250 cursor-pointer"
                      : "text-zinc-300 bg-zinc-50 border-zinc-200 cursor-not-allowed"
                  }`}
                >
                  <RotateCcw size={11} />
                  Reset
                </button>
                <span className="text-[10px] font-semibold text-zinc-400">
                  {hasDrawn ? "Signature recorded" : "Please draw in box"}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full mt-4 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white py-3.5 px-5 rounded-2xl shadow-md transition-all duration-200 font-black text-sm uppercase tracking-wider"
          >
            Log Warning Incident
          </button>

        </form>
        </div>

      </div>

    </div>
  );
};
