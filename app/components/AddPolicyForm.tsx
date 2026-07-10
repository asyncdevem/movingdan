"use client";

import React, { useState } from "react";
import { useApp } from "../context";
import { 
  ArrowLeft, ClipboardList, Shield, Info, Truck, 
  Calendar, Clock, Receipt, PhoneCall, ShieldAlert, BookOpen, CheckCircle
} from "lucide-react";

export const AddPolicyForm: React.FC = () => {
  const { addPolicy, setNavigation } = useApp();
  const [success, setSuccess] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [iconName, setIconName] = useState("ShieldAlert");
  const [content, setContent] = useState(
    `### 1. Policy Overview\n[Describe why this policy is established and what it covers...]\n\n### 2. Standard Operating Procedures\n* **SOP 1:** [Detail first standard step or requirement]\n* **SOP 2:** [Detail second standard step or requirement]\n* **SOP 3:** [Detail third standard step or requirement]\n\n### 3. Compliance & Enforcement\nFailure to adhere to these guidelines will result in disciplinary action under the Written Warnings policy. Please sign below to acknowledge your understanding and agreement.`
  );
  const [validationError, setValidationError] = useState("");

  const iconsList = [
    { name: "ShieldAlert", label: "Safety / Shield", icon: ShieldAlert },
    { name: "Truck", label: "Vehicle / Fleet", icon: Truck },
    { name: "Calendar", label: "Schedule", icon: Calendar },
    { name: "Clock", label: "Hours / Time", icon: Clock },
    { name: "Receipt", label: "Expenses", icon: Receipt },
    { name: "PhoneCall", label: "Absences", icon: PhoneCall },
    { name: "BookOpen", label: "General Code", icon: BookOpen },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setValidationError("Policy title is required.");
      return;
    }
    if (!shortDesc.trim()) {
      setValidationError("Short description is required.");
      return;
    }
    if (!content.trim() || content.trim().length < 20) {
      setValidationError("Please write a detailed policy guideline (min 20 characters).");
      return;
    }

    setValidationError("");
    
    // Call context action
    addPolicy({
      title: title.trim(),
      shortDesc: shortDesc.trim(),
      iconName,
      content,
    });

    setSuccess(true);
    setTimeout(() => {
      setNavigation("policy-list");
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-zinc-800">
      
      {/* Top Header Navigation */}
      <div className="h-14 bg-white border-b border-zinc-100 px-4 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setNavigation("policy-list")}
          className="p-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-zinc-650"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-base font-extrabold text-zinc-900">Create Safety Policy</h2>
      </div>

      {/* Form Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 py-6 bg-zinc-55">
        <div className="max-w-2xl mx-auto w-full bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-3xs my-4">
        
        {/* Onboarding Guide Card */}
        <div className="bg-zinc-950 text-white rounded-2xl p-4 flex items-start gap-3 mb-6 shadow-md">
          <div className="bg-white/10 p-2 rounded-xl shrink-0 text-red-500">
            <ClipboardList size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-red-550">SOP Policy Setup</h4>
            <p className="text-[11px] font-semibold text-zinc-350 leading-normal mt-1">
              Add new standard operating procedures to the compliance database. Employees will be notified and required to digitally sign off on these terms.
            </p>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 mb-6 animate-bounce">
            <CheckCircle className="text-emerald-500 shrink-0" size={24} />
            <div>
              <p className="text-xs font-bold text-emerald-800">Policy Created Successfully!</p>
              <p className="text-[10px] text-emerald-600">The new policy has been loaded into compliance lists.</p>
            </div>
          </div>
        )}

        {validationError && (
          <div className="bg-red-50 border border-red-200 text-primary text-xs font-bold rounded-xl p-3.5 mb-4">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-10">
          
          {/* Policy Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-500 tracking-wider">Policy Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Back Safety & Lift Techniques"
              className="w-full bg-white border border-zinc-250 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-800 outline-none transition-all"
            />
          </div>

          {/* Short Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-505 tracking-wider">Short Summary</label>
            <input
              type="text"
              required
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="e.g. Critical lifting procedures, weight limits, and physical health instructions."
              className="w-full bg-white border border-zinc-250 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-800 outline-none transition-all"
            />
          </div>

          {/* Policy Icon Picker Selection Grid */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-zinc-500 tracking-wider">Policy Symbol (Icon)</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 border border-zinc-200 rounded-2xl bg-zinc-55 p-2.5">
              {iconsList.map((item) => {
                const IconComponent = item.icon;
                const isSelected = iconName === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    title={item.label}
                    onClick={() => setIconName(item.name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-primary border-primary text-white shadow-2xs"
                        : "bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-650 cursor-pointer"
                    }`}
                  >
                    <IconComponent size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Policy Content (Full Markdown Textarea) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-zinc-500 tracking-wider">Policy Guidelines (Markdown supported)</label>
              <span className="text-[10px] text-zinc-400 italic">headings # list * bold **</span>
            </div>
            <textarea
              rows={12}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white border border-zinc-255 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl p-4 text-xs font-mono text-zinc-800 placeholder-zinc-400 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3.5 mt-2">
            <button
              type="submit"
              className="flex-1 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              Create Policy
            </button>
            <button
              type="button"
              onClick={() => setNavigation("policy-list")}
              className="px-6 py-3.5 bg-white hover:bg-zinc-50 border border-zinc-250 text-zinc-705 rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </form>

        </div>
      </div>

    </div>
  );
};
