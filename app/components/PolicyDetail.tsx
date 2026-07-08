"use client";

import React, { useRef, useState, useEffect } from "react";
import { useApp } from "../context";
import { ArrowLeft, CheckCircle, RotateCcw, PenTool, Calendar, ShieldCheck } from "lucide-react";
import { PolicyIcon } from "./PoliciesList";

export const PolicyDetail: React.FC = () => {
  const { 
    currentUser, 
    policies, 
    signatures, 
    selectedPolicyId, 
    signPolicy, 
    setNavigation 
  } = useApp();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [success, setSuccess] = useState(false);

  const policy = policies.find((p) => p.id === selectedPolicyId);
  const userSignature = signatures.find(
    (s) => s.policyId === selectedPolicyId && s.employeeId === currentUser.id
  );

  const isSigned = !!userSignature;

  // Initialize Canvas context options
  useEffect(() => {
    if (!canvasRef.current || isSigned) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set styling for signatures
    ctx.strokeStyle = "#1e3a8a"; // Deep blue ink color
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Setup canvas resolution based on device pixel ratio to keep lines crisp
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Set width and height in style attributes for correct layout sizing
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, [isSigned, selectedPolicyId]);

  // Drawing mouse handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch event
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
    if (isSigned) return;

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
    if (!isDrawing || isSigned) return;

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
    if (!canvasRef.current || isSigned) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleSubmitSignature = () => {
    if (!canvasRef.current || !hasDrawn || isSigned) return;
    
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL("image/png");
    
    if (selectedPolicyId) {
      signPolicy(selectedPolicyId, signatureData);
      setSuccess(true);
      setTimeout(() => {
        setNavigation("policy-list");
      }, 1500);
    }
  };

  if (!policy) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm font-bold text-zinc-500">Policy not found.</p>
        <button onClick={() => setNavigation("policy-list")} className="mt-4 text-xs font-bold text-primary">
          Back to List
        </button>
      </div>
    );
  }

  // Basic custom markdown renderer to render bold titles, bullets, and body text beautifully
  const renderPolicyContent = (text: string) => {
    return text.split("\n\n").map((block, idx) => {
      if (block.startsWith("###")) {
        return (
          <h3 key={idx} className="text-sm font-black text-zinc-900 uppercase tracking-tight mt-6 mb-2">
            {block.replace("###", "").trim()}
          </h3>
        );
      }
      if (block.startsWith("*") || block.startsWith("-")) {
        const items = block
          .split("\n")
          .map((item) => item.replace(/^[\*\-\s]+/, "").trim());
        return (
          <ul key={idx} className="list-disc pl-5 space-y-1.5 my-3 text-xs font-semibold text-zinc-700">
            {items.map((item, itemIdx) => (
              <li key={itemIdx}>{item}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={idx} className="text-xs font-semibold text-zinc-600 leading-relaxed my-2">
          {block}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* Top Header Navigation */}
      <div className="h-14 bg-white border-b border-zinc-100 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNavigation("policy-list")}
            className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-700" />
          </button>
          <h2 className="text-base font-extrabold text-zinc-900 max-w-[200px] truncate">{policy.title}</h2>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
          isSigned 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
            : "bg-red-50 text-primary border border-red-100"
        }`}>
          {isSigned ? "Signed" : "Pending"}
        </span>
      </div>

      {/* Scrollable Policy Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 bg-zinc-50">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-10">
          
          {/* Left Column: Policy Text */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Document Header Card */}
            <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-3xs flex items-start gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${isSigned ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-primary"}`}>
                <PolicyIcon name={policy.iconName} size={24} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-zinc-900">{policy.title}</h1>
                <p className="text-xs font-semibold text-zinc-500 mt-1">Official Company Policy Document</p>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-3xs leading-relaxed text-zinc-700">
              {renderPolicyContent(policy.content)}
            </div>
          </div>

          {/* Right Column: Signature Pad Box */}
          <div className="lg:col-span-5 lg:sticky lg:top-5 flex flex-col gap-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-3xs">
              <h4 className="text-sm font-extrabold text-zinc-900 mb-3 flex items-center gap-1.5 border-b border-zinc-100 pb-3">
                <PenTool size={16} className="text-primary" />
                Digital Acknowledgment
              </h4>

              {success && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 mb-4 animate-bounce">
                  <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Signature Submitted!</p>
                    <p className="text-[10px] text-emerald-600">Your compliance record has been updated.</p>
                  </div>
                </div>
              )}

              {isSigned ? (
                /* Signed Record State */
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                    <ShieldCheck size={26} />
                  </div>
                  <p className="text-xs font-extrabold text-zinc-800">Signed Document Acknowledged</p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Signed by <span className="font-bold text-zinc-700">{currentUser.name}</span>
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                    <Calendar size={10} />
                    {userSignature.signedAt ? new Date(userSignature.signedAt).toLocaleDateString() + " at " + new Date(userSignature.signedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Seeded"}
                  </p>

                  {/* Render Saved Signature Image if base64 exists */}
                  {userSignature.signatureData.startsWith("data:") ? (
                    <div className="mt-4 bg-white border border-emerald-250 rounded-lg p-2 max-w-[280px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={userSignature.signatureData}
                        alt="Signature Image"
                        className="max-h-20 object-contain mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 bg-white border border-emerald-100 rounded-lg px-6 py-4 max-w-[280px] italic text-[11px] text-zinc-400 font-serif font-bold tracking-widest border-dashed">
                      {currentUser.name}
                    </div>
                  )}
                </div>
              ) : (
                /* Interactive Signature Canvas Draw State */
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-zinc-500 mb-1 leading-relaxed">
                    Please draw your signature in the frame below using your mouse or touch screen.
                  </p>

                  {/* Canvas Frame */}
                  <div className="relative border border-zinc-200 rounded-xl bg-zinc-50 overflow-hidden h-36">
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
                    
                    {/* Visual X Line */}
                    <div className="absolute bottom-5 left-5 right-5 border-b border-zinc-300 pointer-events-none flex justify-between text-[10px] text-zinc-400 font-bold">
                      <span>X</span>
                      <span>Sign Here</span>
                    </div>
                  </div>

                  {/* Canvas Controls */}
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      disabled={!hasDrawn}
                      className={`flex items-center gap-1.5 text-xs font-bold py-2 px-3.5 rounded-lg border transition-all ${
                        hasDrawn
                          ? "text-zinc-700 bg-white hover:bg-zinc-50 border-zinc-250 cursor-pointer"
                          : "text-zinc-300 bg-zinc-50 border-zinc-200 cursor-not-allowed"
                      }`}
                    >
                      <RotateCcw size={13} />
                      Clear
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitSignature}
                      disabled={!hasDrawn}
                      className={`text-xs font-black py-2.5 px-5 rounded-lg text-white shadow-xs transition-all ${
                        hasDrawn
                          ? "bg-primary hover:bg-primary-hover cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-zinc-300 cursor-not-allowed"
                      }`}
                    >
                      Sign Document
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
