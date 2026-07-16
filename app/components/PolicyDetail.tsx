"use client";

import React, { useRef, useState, useEffect } from "react";
import { useApp } from "../context";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, RotateCcw, PenTool, Calendar, ShieldCheck, Edit, Trash2, X, Heading, Bold, List, Eye, EyeOff } from "lucide-react";
import { PolicyIcon } from "./PoliciesList";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Toast, ToastType, ConfirmModal } from "./Toast";

export const PolicyDetail: React.FC = () => {
  const { 
    currentUser, 
    policies, 
    signatures, 
    signPolicy,
    refreshData
  } = useApp();
  
  const router = useRouter();
  const params = useParams();
  const policyId = params.id as string;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", shortDesc: "", content: "", iconName: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditPreview, setShowEditPreview] = useState(false);
  const editContentRef = React.useRef<HTMLTextAreaElement>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const isManager = currentUser?.role === "manager";

  const policy = policies.find((p) => p.id === policyId);
  const userSignature = signatures.find(
    (s) => s.policyId === policyId && s.employeeId === currentUser?.id
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
  }, [isSigned, policyId]);

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
    
    if (policyId) {
      signPolicy(policyId, signatureData);
      setSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    }
  };

  const handleEditPolicy = () => {
    if (!policy) return;
    setEditForm({
      title: policy.title,
      shortDesc: policy.shortDesc,
      content: policy.content,
      iconName: policy.iconName
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!policy) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/policy/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyId: policy.id,
          updates: editForm
        })
      });

      if (response.ok) {
        setToast({ message: 'Policy updated successfully!', type: 'success' });
        setIsEditing(false);
        await refreshData(); // Refresh context data instead of page reload
      } else {
        const data = await response.json();
        setToast({ message: `Failed to update: ${data.error}`, type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error updating policy', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePolicy = async () => {
    if (!policy) return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/policy/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyId: policy.id })
      });

      if (response.ok) {
        router.push('/manager/policies');
      } else {
        setToast({ message: 'Failed to delete policy', type: 'error' });
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      setToast({ message: 'Error deleting policy', type: 'error' });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const insertEditMarkdown = (before: string, after: string = "") => {
    const textarea = editContentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editForm.content.substring(start, end);
    const newText = editForm.content.substring(0, start) + before + selectedText + after + editForm.content.substring(end);
    
    setEditForm({...editForm, content: newText});
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  if (!policy) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm font-bold text-zinc-500">Policy not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-xs font-bold text-primary">
          Back to List
        </button>
      </div>
    );
  }

  // Render policy content using ReactMarkdown
  const renderPolicyContent = (text: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-lg font-black text-zinc-900 uppercase tracking-tight mt-6 mb-3" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-base font-black text-zinc-900 uppercase tracking-tight mt-6 mb-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mt-6 mb-2" {...props} />,
          p: ({node, ...props}) => <p className="text-xs font-semibold text-zinc-600 leading-relaxed my-2" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1.5 my-3 text-xs font-semibold text-zinc-700" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1.5 my-3 text-xs font-semibold text-zinc-700" {...props} />,
          li: ({node, ...props}) => <li className="text-xs font-semibold text-zinc-700" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-zinc-900" {...props} />,
          em: ({node, ...props}) => <em className="italic" {...props} />,
          a: ({node, ...props}) => <a className="text-primary underline hover:text-primary-hover" target="_blank" rel="noopener noreferrer" {...props} />,
          code: ({node, ...props}) => <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-mono" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 my-3 italic text-zinc-600" {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* Top Header Navigation */}
      <div className="h-14 bg-white border-b border-zinc-100 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-700" />
          </button>
          <h2 className="text-base font-extrabold text-zinc-900 max-w-[200px] truncate">{policy.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isSigned 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
              : "bg-red-50 text-primary border border-red-100"
          }`}>
            {isSigned ? "Signed" : "Pending"}
          </span>
          {isManager && (
            <>
              <button
                onClick={handleEditPolicy}
                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                title="Edit Policy"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                title="Delete Policy"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
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
                    Signed by <span className="font-bold text-zinc-700">{currentUser?.name}</span>
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
                      {currentUser?.name}
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

      {/* Edit Policy Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                  <Edit size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900">Edit Policy</h3>
                  <p className="text-xs text-zinc-500 font-semibold">Update policy information</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <X size={20} className="text-zinc-500" />
              </button>
            </div>

            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                  Policy Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-3 px-4 text-sm font-semibold text-zinc-800 outline-none"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={editForm.shortDesc}
                  onChange={(e) => setEditForm({...editForm, shortDesc: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-3 px-4 text-sm font-semibold text-zinc-800 outline-none"
                />
              </div>

              {/* Icon Name */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block mb-2">
                  Icon Name (Lucide)
                </label>
                <input
                  type="text"
                  value={editForm.iconName}
                  onChange={(e) => setEditForm({...editForm, iconName: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-3 px-4 text-sm font-semibold text-zinc-800 outline-none"
                  placeholder="Truck, Calendar, Clock, etc."
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                    Policy Content
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEditPreview(!showEditPreview)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    {showEditPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showEditPreview ? "Edit" : "Preview"}
                  </button>
                </div>

                {/* Formatting Toolbar */}
                {!showEditPreview && (
                  <div className="flex items-center gap-1 p-2 bg-zinc-100 border border-zinc-200 rounded-xl mb-2">
                    <button
                      type="button"
                      onClick={() => insertEditMarkdown("### ", "\n")}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-zinc-600 hover:text-zinc-900"
                      title="Heading"
                    >
                      <Heading size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertEditMarkdown("**", "**")}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-zinc-600 hover:text-zinc-900"
                      title="Bold"
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertEditMarkdown("* ", "\n")}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-zinc-600 hover:text-zinc-900"
                      title="Bullet List"
                    >
                      <List size={16} />
                    </button>
                  </div>
                )}

                {/* Editor / Preview */}
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  {showEditPreview ? (
                    <div className="bg-white p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                      {renderPolicyContent(editForm.content)}
                    </div>
                  ) : (
                    <textarea
                      ref={editContentRef}
                      rows={12}
                      value={editForm.content}
                      onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                      className="w-full bg-white p-4 text-sm font-mono text-zinc-800 outline-none resize-none"
                      placeholder="Use ### for headings, * for bullets..."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-red-100 text-red-600">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-black text-zinc-900">Delete Policy?</h3>
            </div>
            <p className="text-sm text-zinc-600 font-semibold mb-6">
              Are you sure you want to permanently delete this policy? All employee signatures will be lost. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePolicy}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
};
