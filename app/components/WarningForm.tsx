"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp, User, Warning } from "../context";
import { 
  ArrowLeft, Search, Calendar, ChevronRight, AlertTriangle, 
  ShieldCheck, CheckCircle, PenTool, RotateCcw, X, Plus, 
  Info, Check, Trash2, Clock, ShieldAlert, AlertCircle
} from "lucide-react";

export const WarningForm: React.FC = () => {
  const router = useRouter();
  const { 
    users, warnings, issueWarning, 
    selectedEmployeeId, setSelectedEmployeeId, updateWarningStatus, currentUser 
  } = useApp();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Wizard state: 
  // 1. Select Employee
  // 2. Select Date & Time
  // 3. Select Warning Type
  // 4. Add Details & Cost
  // 5. Attach Photos
  // 6. Review Warning
  // 7. Warning Saved (Success Screen)
  // 8. Employee Warnings (History list)
  const [step, setStep] = useState<number>(1);
  const [stepError, setStepError] = useState("");

  const goToStep = (nextStep: number) => {
    setStepError("");
    setStep(nextStep);
  };

  // Form selections
  const [targetEmployee, setTargetEmployee] = useState<User | null>(null);
  const [warningDate, setWarningDate] = useState("2024-05-22");
  const [warningType, setWarningType] = useState<string>(""); // Damage, Late, Call In / No Show, Not Following Rules, Other
  const [incidentDetails, setIncidentDetails] = useState("");
  const [damageCost, setDamageCost] = useState("0.00");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [generatedWarningId, setGeneratedWarningId] = useState("");
  const [severity, setSeverity] = useState<"Verbal" | "Written" | "Final Warning">("Written");
  
  // History tab: All, Active, Resolved
  const [historyTab, setHistoryTab] = useState<"All" | "Active" | "Resolved">("All");
  const [selectedHistoryWarning, setSelectedHistoryWarning] = useState<Warning | null>(null);

  // Search state for Step 1
  const [searchQuery, setSearchQuery] = useState("");

  // Only employees can receive warnings
  const movers = users.filter((u) => u.role === "employee");

  // Load pre-selected employee from context if available
  useEffect(() => {
    if (selectedEmployeeId) {
      const emp = users.find((u) => u.id === selectedEmployeeId);
      if (emp) {
        setTargetEmployee(emp);
        goToStep(8); // Go straight to warnings history for that employee
      }
    }
  }, [selectedEmployeeId, users]);

  // Set up drawing canvas for signature in Step 6
  useEffect(() => {
    if (step !== 6 || !canvasRef.current) return;

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
  }, [step]);

  // Date lists for custom timepicker
  const dateOptions = [
    { label: "Mon May 21 2024", value: "2024-05-21" },
    { label: "Tue May 22 2024", value: "2024-05-22" },
    { label: "Wed May 23 2024", value: "2024-05-23" },
    { label: "Thu May 24 2024", value: "2024-05-24" },
    { label: "Fri May 25 2024", value: "2024-05-25" },
    { label: "Sat May 26 2024", value: "2024-05-26" },
  ];

  const hourOptions = ["9", "10", "11", "12", "1"];
  const minuteOptions = ["00", "15", "30", "45"];
  const periodOptions = ["AM", "PM"];

  // Warning type default costs mapping
  const warningTypes = [
    { type: "Damage", desc: "For any moving accident or property damage.", defaultCost: "Custom Amount", icon: ShieldAlert, color: "bg-red-50 text-primary border-red-200" },
    { type: "Late", desc: "For arriving late to work or job site.", defaultCost: "50.00", icon: Clock, color: "bg-amber-50 text-amber-500 border-amber-200" },
    { type: "Call In / No Show", desc: "For calling in or no showing to scheduled job.", defaultCost: "100.00", icon: AlertCircle, color: "bg-blue-50 text-blue-500 border-blue-200" },
    { type: "Not Following Rules", desc: "For not following company policies or safety rules.", defaultCost: "0.00", icon: ShieldCheck, color: "bg-red-50 text-primary border-red-200" },
    { type: "Other", desc: "For any other issue not listed above.", defaultCost: "Custom Amount", icon: Info, color: "bg-zinc-50 text-zinc-500 border-zinc-200" },
  ];

  // Helper to format Date string
  const getFormattedDate = () => {
    const date = new Date(warningDate);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

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

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  // Photo handlers
  const triggerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotos((prev) => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadDemoPhotos = () => {
    setPhotos([
      "https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400&q=80"
    ]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission handler
  const saveWarning = () => {
    if (!targetEmployee) return;

    const signatureData = canvasRef.current ? canvasRef.current.toDataURL("image/png") : "MOCK_SIGNATURE";
    const dateFormatted = getFormattedDate();
    const finalCost = parseFloat(damageCost.replace(/[$,\s]/g, "")) || 0;

    // Trigger context action
    issueWarning({
      employeeId: targetEmployee.id,
      date: dateFormatted,
      warningType,
      cost: finalCost,
      incidentDetails,
      damageDate: warningType === "Damage" ? dateFormatted : undefined,
      damageCost: warningType === "Damage" ? damageCost : undefined,
      additionalNotes: additionalNotes.trim() ? additionalNotes : undefined,
      photos: warningType === "Damage" && photos.length > 0 ? photos : undefined,
      severity,
      managerSignature: signatureData
    });

    // Generate a temporary ID matching standard format for display in Success Screen (Step 7)
    const now = new Date();
    const mockId = `WW-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-00${warnings.length + 1}`;
    setGeneratedWarningId(mockId);
    
    // Clear manager drawing canvas
    setHasDrawn(false);

    // Go to Step 7
    goToStep(7);
  };

  const handleBack = () => {
    if (step === 8) {
      setSelectedEmployeeId(null);
      router.push("/manager");
    } else if (step > 1) {
      goToStep(step - 1);
    } else {
      router.back();
    }
  };

  // Filter employee warning list
  const getEmployeeWarnings = () => {
    if (!targetEmployee) return [];
    const empWarnings = warnings.filter((w) => w.employeeId === targetEmployee.id);
    if (historyTab === "All") return empWarnings;
    return empWarnings.filter((w) => w.status === historyTab);
  };

  const startNewWarningFromHistory = () => {
    setWarningType("");
    setIncidentDetails("");
    setDamageCost("750.00");
    setAdditionalNotes("");
    setPhotos([]);
    goToStep(2);
  };

  // Step names helper
  const getStepProgressWidth = () => {
    if (step >= 7) return "100%";
    return `${Math.round(((step - 1) / 5) * 100)}%`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-55 text-zinc-900 font-sans">
      
      {/* Header */}
      <div className="h-14 bg-white border-b border-zinc-200 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-zinc-105 transition-colors text-zinc-650 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-sm font-black uppercase text-zinc-900 tracking-wider">
              {step === 1 && "Written Warnings"}
              {step === 2 && "New Written Warning"}
              {step === 3 && "New Written Warning"}
              {step === 4 && `${warningType || "Warning"} Details`}
              {step === 5 && `${warningType || "Warning"} Photos`}
              {step === 6 && "Review Warning"}
              {step === 7 && "Warning Saved"}
              {step === 8 && "Employee Warnings"}
            </h2>
          </div>
        </div>

        {/* Step Indicator */}
        {step < 7 && (
          <div className="text-[10px] font-black uppercase text-primary bg-red-50 border border-red-150 px-2.5 py-1 rounded-full tracking-wider">
            Step {step} of 6
          </div>
        )}
      </div>

      {/* Step Progress Line */}
      {step < 7 && (
        <div className="h-1 w-full bg-zinc-200 shrink-0">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: getStepProgressWidth() }}
          />
        </div>
      )}

      {/* Main Workspace (Scrollable) */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 py-6 px-4 flex flex-col items-center">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-xs flex flex-col justify-between my-2">
          
          {/* STEP 1: SELECT EMPLOYEE */}
          {step === 1 && (
            <div className="p-5 flex flex-col gap-5">
              <div className="text-center pb-2">
                <h3 className="text-base font-black text-zinc-800 uppercase tracking-tight">Select Employee</h3>
                <p className="text-[11px] font-semibold text-zinc-550 mt-0.5">Choose the employee to issue a written warning</p>
              </div>

              {/* Validation alert box */}
              {stepError && (
                <div className="bg-red-50 border border-red-200 text-primary text-xs font-bold rounded-xl p-3.5">
                  {stepError}
                </div>
              )}

              {/* Custom Search Input */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-455">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-zinc-800 placeholder-zinc-400 outline-none transition-all"
                />
              </div>

              {/* Dropdown Field */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Employee Dropdown</label>
                <select
                  value={targetEmployee?.id || ""}
                  onChange={(e) => {
                    const emp = movers.find((m) => m.id === e.target.value);
                    if (emp) setTargetEmployee(emp);
                  }}
                  className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl p-3 text-xs font-bold text-zinc-850 outline-none"
                >
                  <option value="">Select an employee...</option>
                  {movers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Interactive Employees List */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Select from list:</span>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-zinc-150 rounded-2xl p-2 bg-zinc-50">
                  {movers
                    .filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setTargetEmployee(m);
                          goToStep(2);
                        }}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          targetEmployee?.id === m.id
                            ? "bg-red-50/75 border-primary/30"
                            : "bg-white border-zinc-200 hover:border-zinc-250 hover:bg-zinc-50/40"
                        } cursor-pointer`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 text-primary border border-red-200 flex items-center justify-center font-black text-xs">
                            {m.avatar}
                          </div>
                          <div>
                            <p className="text-xs font-black text-zinc-855">{m.name}</p>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mt-0.5">{m.title}</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-zinc-400" />
                      </button>
                    ))}
                </div>
              </div>

              {/* Footer navigation */}
              <button
                onClick={() => {
                  if (!targetEmployee) {
                    setStepError("Please select an employee before continuing.");
                    return;
                  }
                  goToStep(2);
                }}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                Next
              </button>
            </div>
          )}

          {/* STEP 2: SELECT DATE */}
          {step === 2 && targetEmployee && (
            <div className="p-5 flex flex-col gap-5">
              <div className="text-center">
                <h3 className="text-base font-black text-zinc-800 uppercase tracking-tight">Select Date</h3>
                <p className="text-[11px] font-semibold text-zinc-555 mt-0.5">Specify when the infraction occurred</p>
              </div>

              {/* Selected Employee Info */}
              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary text-white border border-primary-hover flex items-center justify-center font-black text-xs shrink-0">
                  {targetEmployee.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-wider text-primary">Selected Mover</p>
                  <p className="text-xs font-black text-zinc-855 truncate">{targetEmployee.name}</p>
                </div>
              </div>

              {/* Date Selection */}
              <div className="flex flex-col gap-4">
                {/* Date Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Incident Date</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-450 pointer-events-none">
                      <Calendar size={14} />
                    </span>
                    <input
                      type="date"
                      value={warningDate}
                      onChange={(e) => setWarningDate(e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl py-3 pl-9 pr-4 text-xs font-semibold text-zinc-800 outline-none"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1">Selected Date</p>
                  <p className="text-sm font-bold text-zinc-900">{getFormattedDate()}</p>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => goToStep(3)}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                Next
              </button>
            </div>
          )}

          {/* STEP 3: SELECT WARNING TYPE */}
          {step === 3 && targetEmployee && (
            <div className="p-5 flex flex-col gap-5">
              <div className="text-center">
                <h3 className="text-base font-black text-zinc-800 uppercase tracking-tight">Select Warning Type</h3>
                <p className="text-[11px] font-semibold text-zinc-550 mt-0.5">Categorize the infraction notice</p>
              </div>

              {/* Validation alert box */}
              {stepError && (
                <div className="bg-red-50 border border-red-200 text-primary text-xs font-bold rounded-xl p-3.5">
                  {stepError}
                </div>
              )}

              {/* Small Header Summary */}
              <div className="border border-zinc-150 rounded-2xl p-3 bg-zinc-50 flex items-center justify-between text-[11px] font-bold text-zinc-600">
                <span>Employee: {targetEmployee.name}</span>
                <span>Date: {getFormattedDate()}</span>
              </div>

              {/* Warning Type Options */}
              <div className="flex flex-col gap-2">
                {warningTypes.map((item) => {
                  const Icon = item.icon;
                  const isSelected = warningType === item.type;
                  return (
                    <button
                      key={item.type}
                      onClick={() => {
                        setWarningType(item.type);
                        setStepError("");
                      }}
                      className={`flex items-start gap-3.5 p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "bg-red-50/70 border-primary/30 ring-1 ring-primary/20"
                          : "bg-white border-zinc-200 hover:border-zinc-250 hover:bg-zinc-50/20"
                      } cursor-pointer`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${item.color}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-zinc-850">{item.type}</p>
                        <p className="text-[10px] font-medium text-zinc-500 leading-normal mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => {
                  if (!warningType) {
                    setStepError("Please select a warning type before continuing.");
                    return;
                  }
                  // Don't pre-populate cost - let manager enter it
                  goToStep(4);
                }}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                Next
              </button>
            </div>
          )}

          {/* STEP 4: ADD DETAILS & COST */}
          {step === 4 && targetEmployee && (
            <div className="p-5 flex flex-col gap-5">
              <div className="text-center">
                <h3 className="text-base font-black text-zinc-800 uppercase tracking-tight">{warningType} Details</h3>
                <p className="text-[11px] font-semibold text-zinc-550 mt-0.5">Provide detailed notes and associated costs</p>
              </div>

              {/* Validation alert box */}
              {stepError && (
                <div className="bg-red-50 border border-red-200 text-primary text-xs font-bold rounded-xl p-3.5">
                  {stepError}
                </div>
              )}

              {/* Banner summary */}
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="bg-red-500 text-white p-2 rounded-xl shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-primary">{warningType}</h4>
                  <p className="text-[10px] font-semibold text-zinc-650 leading-relaxed mt-0.5">
                    For any moving accident, property damage, or standard fleet infraction.
                  </p>
                </div>
              </div>

              {/* Incident Details Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-555 tracking-wider">Moving Accident / Incident Details</label>
                <textarea
                  rows={3}
                  value={incidentDetails}
                  onChange={(e) => {
                    setIncidentDetails(e.target.value);
                    if (e.target.value.trim()) setStepError("");
                  }}
                  placeholder="e.g. Backed into client's fence while exiting driveway."
                  className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl p-3 text-xs font-semibold text-zinc-800 placeholder-zinc-400 outline-none resize-none"
                />
              </div>

              {/* Damage Date Picker & Cost Input - Only visible for Damage type warnings */}
              {warningType === "Damage" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-550 tracking-wider">Damage Date</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-455 pointer-events-none">
                        <Calendar size={14} />
                      </span>
                      <input
                        type="date"
                        value={warningDate}
                        onChange={(e) => setWarningDate(e.target.value)}
                        className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl py-2.5 pl-9 pr-4 text-xs font-semibold text-zinc-800 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-555 tracking-wider">Damage Cost ($)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-zinc-700 text-xs pointer-events-none">
                        $
                      </span>
                      <input
                        type="text"
                        value={damageCost}
                        onChange={(e) => setDamageCost(e.target.value)}
                        placeholder="750.00"
                        className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl py-3 pl-8 pr-4 text-xs font-bold text-zinc-800 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Additional Notes (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-550 tracking-wider">Additional Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Client provided estimate for repairs. Will follow up if additional costs are needed."
                  className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl p-3 text-xs font-semibold text-zinc-800 placeholder-zinc-400 outline-none resize-none"
                />
              </div>

              {/* Severity / Warning Level Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-550 tracking-wider">Warning Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Verbal", "Written", "Final Warning"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverity(level)}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all text-center ${
                        severity === level
                          ? "bg-zinc-900 border-zinc-900 text-white shadow-xs"
                          : "bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50"
                      } cursor-pointer`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => {
                  if (!incidentDetails.trim()) {
                    setStepError("Please provide incident details before continuing.");
                    return;
                  }
                  // Only show photos step for Damage type
                  if (warningType === "Damage") {
                    goToStep(5);
                  } else {
                    goToStep(6);
                  }
                }}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                Next
              </button>
            </div>
          )}

          {/* STEP 5: ATTACH PHOTOS - Only for Damage warnings */}
          {step === 5 && targetEmployee && warningType === "Damage" && (
            <div className="p-5 flex flex-col gap-5">
              <div className="text-center">
                <h3 className="text-base font-black text-zinc-800 uppercase tracking-tight">{warningType} Photos</h3>
                <p className="text-[11px] font-semibold text-zinc-550 mt-0.5">Attach photos to document the incident</p>
              </div>

              <div className="text-xs font-bold text-zinc-500 mb-1 leading-normal">
                Add photos of the damage.
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 gap-3 min-h-[220px]">
                {photos.map((photoUrl, index) => (
                  <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 group shadow-3xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={photoUrl} 
                      alt={`Damage Attachment ${index + 1}`} 
                      className="object-cover w-full h-full"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                {/* Empty photo slots to match mockup visually */}
                {Array.from({ length: Math.max(0, 4 - photos.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center bg-zinc-50/50 aspect-video text-zinc-300">
                    <Info size={16} />
                  </div>
                ))}
              </div>

              {/* Upload & Demo Actions */}
              <div className="flex flex-col gap-2.5">
                <label className="w-full flex items-center justify-center gap-1.5 py-3 border border-red-200 hover:bg-red-50/30 text-primary rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer">
                  <Plus size={14} />
                  Upload Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={triggerImageUpload}
                    className="hidden" 
                  />
                </label>

                <button
                  type="button"
                  onClick={loadDemoPhotos}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Load Demo Photos (Mockup)
                </button>
              </div>

              {/* Next Button */}
              <button
                onClick={() => goToStep(6)}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                Next
              </button>
            </div>
          )}

          {/* STEP 6: REVIEW WARNING */}
          {step === 6 && targetEmployee && (
            <div className="p-5 flex flex-col gap-5">
              <div className="text-center">
                <h3 className="text-base font-black text-zinc-800 uppercase tracking-tight">Review Warning</h3>
                <p className="text-[11px] font-semibold text-zinc-555 mt-0.5">Confirm details and submit signature</p>
              </div>

              {/* Summary Card */}
              <div className="border border-zinc-200 rounded-2xl p-4 flex flex-col gap-3 bg-zinc-50/50">
                <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-xs leading-normal font-semibold">
                  <div>
                    <span className="block text-[9px] font-black uppercase text-zinc-400">Employee</span>
                    <span className="text-zinc-855 font-bold">{targetEmployee.name}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase text-zinc-400">Date</span>
                    <span className="text-zinc-855 font-bold">{getFormattedDate()}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-zinc-400">Warning Type:</span>
                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-primary font-bold text-[10px]">
                      {warningType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details list */}
              <div className="border border-zinc-200 rounded-2xl p-4 flex flex-col gap-3">
                <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Details</h4>
                <div className="flex flex-col gap-2.5 text-xs">
                  <div>
                    <span className="block text-[9px] font-black uppercase text-zinc-400">Moving Accident / Incident</span>
                    <p className="text-zinc-700 font-medium leading-relaxed bg-zinc-50 p-2.5 border border-zinc-150 rounded-xl mt-0.5">{incidentDetails}</p>
                  </div>
                  {warningType === "Damage" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[9px] font-black uppercase text-zinc-400">Damage Date</span>
                        <span className="text-zinc-800 font-bold">{warningDate}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black uppercase text-zinc-400">Damage Cost</span>
                        <span className="text-zinc-805 font-black">${damageCost}</span>
                      </div>
                    </div>
                  )}
                  {additionalNotes && (
                    <div>
                      <span className="block text-[9px] font-black uppercase text-zinc-400">Additional Notes</span>
                      <p className="text-zinc-700 font-medium leading-relaxed bg-zinc-50 p-2.5 border border-zinc-150 rounded-xl mt-0.5">{additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Photos row */}
              {photos.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Photos ({photos.length})</span>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {photos.map((url, i) => (
                      <div key={i} className="w-14 h-10 rounded-lg overflow-hidden border border-zinc-200 shrink-0 shadow-3xs shadow-black/5 bg-zinc-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Thumb ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manager Digital Signature Box */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-550 tracking-wider flex items-center gap-1.5">
                  <PenTool size={12} className="text-primary" />
                  Manager Digital Sign-off
                </label>
                <div className="bg-white border border-zinc-200 rounded-2xl p-3">
                  <div className="relative border border-zinc-200 rounded-xl bg-zinc-50 overflow-hidden h-28">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={() => setIsDrawing(false)}
                      onMouseLeave={() => setIsDrawing(false)}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={() => setIsDrawing(false)}
                      className="signature-canvas w-full h-full cursor-crosshair absolute inset-0"
                    />
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 border-b border-zinc-300 pointer-events-none flex justify-between text-[7px] text-zinc-400 font-bold uppercase tracking-widest">
                      <span>X</span>
                      <span>{currentUser?.name || 'Manager'} (Manager Signature)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      disabled={!hasDrawn}
                      className={`flex items-center gap-1 text-[9px] font-bold py-1 px-2.5 rounded-lg border transition-all ${
                        hasDrawn
                          ? "text-zinc-700 bg-white hover:bg-zinc-55 border-zinc-250 cursor-pointer"
                          : "text-zinc-350 bg-zinc-50 border-zinc-200 cursor-not-allowed"
                      }`}
                    >
                      <RotateCcw size={10} />
                      Reset
                    </button>
                    <span className="text-[9px] font-semibold text-zinc-400">Draw above</span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                disabled={!hasDrawn}
                onClick={saveWarning}
                className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all ${
                  hasDrawn
                    ? "bg-primary hover:bg-primary-hover text-white cursor-pointer shadow-md"
                    : "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                }`}
              >
                Save Warning
              </button>
            </div>
          )}

          {/* STEP 7: WARNING SAVED (SUCCESS) */}
          {step === 7 && targetEmployee && (
            <div className="p-5 flex flex-col gap-6 items-center text-center">
              <div className="text-center mt-4">
                <h3 className="text-base font-black text-zinc-850 uppercase tracking-tight">Warning Saved</h3>
              </div>

              {/* Checkmark Graphic */}
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs my-2">
                <CheckCircle size={44} className="stroke-[1.5]" />
              </div>

              <div className="flex flex-col gap-2 max-w-xs">
                <p className="text-xs font-bold text-zinc-800 leading-normal">
                  Written warning has been saved successfully.
                </p>
                <div className="bg-zinc-50 border border-zinc-155 rounded-xl py-2 px-4 inline-block mx-auto mt-2">
                  <span className="block text-[8px] font-black uppercase text-zinc-450 tracking-wider">Warning ID</span>
                  <span className="text-xs font-black text-zinc-800 font-mono tracking-wider">
                    {generatedWarningId}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col gap-2 mt-4 pb-2">
                <button
                  onClick={() => {
                    goToStep(8);
                  }}
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all shadow-md cursor-pointer"
                >
                  View Warning
                </button>
                <button
                  onClick={() => {
                    setSelectedEmployeeId(null);
                    router.push("/manager");
                  }}
                  className="w-full py-3 border border-zinc-250 hover:bg-zinc-50 text-zinc-700 rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer"
                >
                  Back to List
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: EMPLOYEE WARNING HISTORY */}
          {step === 8 && targetEmployee && (
            <div className="flex flex-col h-[520px]">
              
              {/* Back label arrow */}
              <div className="bg-zinc-50/50 border-b border-zinc-200 py-3.5 px-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedEmployeeId(null);
                    goToStep(1);
                  }}
                  className="p-1 text-zinc-555 hover:text-zinc-800 font-black text-xs uppercase flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>{targetEmployee.name}</span>
                </button>
              </div>

              {/* History Tabs Filter */}
              <div className="flex border-b border-zinc-200 shrink-0 select-none">
                {(["All", "Active", "Resolved"] as const).map((tab) => {
                  const isActive = historyTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setHistoryTab(tab)}
                      className={`flex-1 text-center py-3 text-[10px] font-black uppercase tracking-wider relative transition-all border-b-2 ${
                        isActive 
                          ? "text-primary border-primary font-black" 
                          : "text-zinc-400 hover:text-zinc-650 border-transparent"
                      } cursor-pointer`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Warnings List Area */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-zinc-50/50">
                {getEmployeeWarnings().length > 0 ? (
                  getEmployeeWarnings().map((w) => {
                    const isDamage = w.warningType === "Damage";
                    const isLate = w.warningType === "Late";
                    const isNoShow = w.warningType === "Call In / No Show";
                    const isRules = w.warningType === "Not Following Rules";
                    
                    let badgeBg = "bg-zinc-100 text-zinc-600";
                    if (w.status === "Active") {
                      badgeBg = isDamage ? "bg-red-50 text-primary border border-red-150" 
                              : isLate ? "bg-amber-50 text-amber-600 border border-amber-150" 
                              : "bg-red-50 text-primary border border-red-150";
                    } else if (w.status === "Resolved") {
                      badgeBg = "bg-emerald-50 text-emerald-600 border border-emerald-150";
                    }

                    return (
                      <div 
                        key={w.id} 
                        onClick={() => setSelectedHistoryWarning(w)}
                        className="bg-white border border-zinc-200 hover:border-zinc-255 p-4 rounded-2xl shadow-3xs cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl shrink-0 ${
                              isDamage ? "bg-red-50 text-primary" 
                              : isLate ? "bg-amber-50 text-amber-500" 
                              : isNoShow ? "bg-blue-50 text-blue-555" 
                              : isRules ? "bg-red-50 text-primary" : "bg-zinc-55 text-zinc-500"
                            }`}>
                              {isDamage && <ShieldAlert size={14} />}
                              {isLate && <Clock size={14} />}
                              {isNoShow && <AlertCircle size={14} />}
                              {isRules && <ShieldCheck size={14} />}
                              {!isDamage && !isLate && !isNoShow && !isRules && <Info size={14} />}
                            </div>
                            <div>
                              <p className="text-xs font-black text-zinc-800 leading-tight">{w.warningType}</p>
                              <span className="text-[9px] font-bold text-zinc-400 tracking-wide mt-0.5 block">{w.date}</span>
                            </div>
                          </div>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${badgeBg}`}>
                            {w.status}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-black">
                          <span className="text-zinc-400">Penalty Cost</span>
                          <span className="text-zinc-800">${w.cost.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <CheckCircle className="text-emerald-500 mb-2.5 stroke-[1.5]" size={36} />
                    <p className="text-xs font-black text-zinc-805">Clear Compliance Record</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal max-w-[200px]">
                      This employee has no warning infractions registered under this filter.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions Panel */}
              <div className="p-4 border-t border-zinc-200 bg-white shrink-0 select-none">
                <button
                  onClick={startNewWarningFromHistory}
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  Add New Warning
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* DETAIL HISTORY WARNING DRAWER MODAL */}
      {selectedHistoryWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-xl border border-zinc-200 max-h-[90vh] flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
            
            <div className="h-14 bg-white border-b border-zinc-200 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black uppercase text-zinc-805">Warning Reference</h3>
                <span className="bg-zinc-105 text-zinc-850 px-2.5 py-0.5 rounded-lg text-[9px] font-mono tracking-wider font-bold">
                  {selectedHistoryWarning.id}
                </span>
              </div>
              <button 
                onClick={() => setSelectedHistoryWarning(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-450 hover:text-zinc-650 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-xs">
              
              {/* Type, cost, and date status info */}
              <div className="border border-zinc-150 rounded-2xl p-4 bg-zinc-50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="font-black text-zinc-800 text-xs">{selectedHistoryWarning.warningType}</span>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                    selectedHistoryWarning.status === "Active" 
                      ? "bg-red-50 text-primary border border-red-150" 
                      : "bg-emerald-50 text-emerald-600 border border-emerald-150"
                  }`}>
                    {selectedHistoryWarning.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-zinc-600 font-semibold mt-1">
                  <div>
                    <span className="block text-[8px] font-black uppercase text-zinc-450">Incident Date</span>
                    <span className="text-zinc-855 font-bold">{selectedHistoryWarning.date}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-black uppercase text-zinc-455">Financial Impact</span>
                    <span className="text-zinc-855 font-black">${selectedHistoryWarning.cost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Description Details */}
              <div>
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Incident Details</span>
                <p className="bg-zinc-50 text-zinc-700 leading-relaxed font-medium p-3.5 border border-zinc-150 rounded-2xl mt-1 italic">
                  &quot;{selectedHistoryWarning.incidentDetails || selectedHistoryWarning.details}&quot;
                </p>
              </div>

              {/* Additional notes if damage */}
              {selectedHistoryWarning.additionalNotes && (
                <div>
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Additional Notes</span>
                  <p className="bg-zinc-50 text-zinc-700 leading-relaxed font-medium p-3.5 border border-zinc-155 rounded-2xl mt-1">
                    {selectedHistoryWarning.additionalNotes}
                  </p>
                </div>
              )}

              {/* Render attached photos */}
              {selectedHistoryWarning.photos && selectedHistoryWarning.photos.length > 0 && (
                <div>
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block mb-1">Attached Incident Photos</span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedHistoryWarning.photos.map((photo, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-zinc-200 shadow-3xs bg-zinc-55">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo} alt={`Attached log ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signature visualization */}
              <div className="grid grid-cols-2 gap-3 mt-1.5 pt-3.5 border-t border-zinc-150">
                <div className="border border-zinc-150 rounded-xl p-2.5 text-center bg-zinc-50/50">
                  <span className="block text-[8px] font-black uppercase text-zinc-450">Issued By</span>
                  <span className="text-xs font-bold text-zinc-755 block mt-1">{selectedHistoryWarning.issuedBy}</span>
                  <span className="text-[8px] text-zinc-400 uppercase font-bold mt-1 block">(Manager)</span>
                </div>
                <div className="border border-zinc-150 rounded-xl p-2.5 text-center bg-zinc-50/50 flex flex-col items-center justify-between">
                  <span className="block text-[8px] font-black uppercase text-zinc-455">Manager Signature</span>
                  {selectedHistoryWarning.managerSignature.startsWith("data:image") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedHistoryWarning.managerSignature} alt="Manager Sig" className="max-h-8 object-contain" />
                  ) : (
                    <span className="text-[9px] font-mono italic text-zinc-500 mt-1 block">Signed Digitally</span>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-55 flex items-center justify-between gap-3 shrink-0">
              {currentUser?.role === "manager" ? (
                <button
                  onClick={() => {
                    const nextStatus = selectedHistoryWarning.status === "Active" ? "Resolved" : "Active";
                    updateWarningStatus(selectedHistoryWarning.id, nextStatus);
                    setSelectedHistoryWarning((prev) => prev ? { ...prev, status: nextStatus } : null);
                  }}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center text-white ${
                    selectedHistoryWarning.status === "Active"
                      ? "bg-emerald-655 hover:bg-emerald-600 shadow-md"
                      : "bg-zinc-800 hover:bg-zinc-750 shadow-md"
                  }`}
                >
                  Mark as {selectedHistoryWarning.status === "Active" ? "Resolved" : "Active"}
                </button>
              ) : (
                <div className="text-[10px] text-zinc-400 italic">
                  Read-only view for Movers.
                </div>
              )}
              
              <button
                onClick={() => setSelectedHistoryWarning(null)}
                className="px-4 py-3 bg-white hover:bg-zinc-100 border border-zinc-250 text-zinc-755 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
