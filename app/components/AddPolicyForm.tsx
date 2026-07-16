"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context";
import { 
  ArrowLeft, ClipboardList, Shield, Info, Truck, 
  Calendar, Clock, Receipt, PhoneCall, ShieldAlert, BookOpen, CheckCircle,
  Bold, Italic, List, Heading, Eye, EyeOff, Type
} from "lucide-react";

export const AddPolicyForm: React.FC = () => {
  const router = useRouter();
  const { addPolicy } = useApp();
  const [success, setSuccess] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [iconName, setIconName] = useState("ShieldAlert");
  const [content, setContent] = useState(
    `### 1. Policy Overview\n[Describe why this policy is established and what it covers...]\n\n### 2. Standard Operating Procedures\n* **SOP 1:** [Detail first standard step or requirement]\n* **SOP 2:** [Detail second standard step or requirement]\n* **SOP 3:** [Detail third standard step or requirement]\n\n### 3. Compliance & Enforcement\nFailure to adhere to these guidelines will result in disciplinary action under the Written Warnings policy. Please sign below to acknowledge your understanding and agreement.`
  );
  const [validationError, setValidationError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const contentRef = React.useRef<HTMLTextAreaElement>(null);

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
      router.push("/manager/policies");
    }, 1500);
  };

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const renderPreview = (text: string) => {
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
          .map((item) => item.replace(/^[\*\-\s]+/, "").trim())
          .filter(item => item.length > 0);
        return (
          <ul key={idx} className="list-disc pl-5 space-y-1.5 my-3 text-xs font-semibold text-zinc-700">
            {items.map((item, itemIdx) => {
              // Handle bold text **text**
              const parts = item.split(/(\*\*.*?\*\*)/g);
              return (
                <li key={itemIdx}>
                  {parts.map((part, partIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
                    }
                    return <span key={partIdx}>{part}</span>;
                  })}
                </li>
              );
            })}
          </ul>
        );
      }
      // Handle bold text in paragraphs
      const parts = block.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="text-xs font-semibold text-zinc-600 leading-relaxed my-2">
          {parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
            }
            return <span key={partIdx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-zinc-800">
      
      {/* Top Header Navigation */}
      <div className="h-14 bg-white border-b border-zinc-100 px-4 flex items-center gap-3 shrink-0">
        <button
          onClick={() => router.back()}
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

          {/* Policy Content (Enhanced Markdown Editor) */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-zinc-500 tracking-wider">Policy Guidelines</label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPreview ? "Edit" : "Preview"}
              </button>
            </div>

            {/* Formatting Toolbar */}
            {!showPreview && (
              <div className="flex items-center gap-1 p-2 bg-zinc-100 border border-zinc-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => insertMarkdown("### ", "\n")}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-zinc-600 hover:text-zinc-900"
                  title="Heading"
                >
                  <Heading size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("**", "**")}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-zinc-600 hover:text-zinc-900"
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("* ", "\n")}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-zinc-600 hover:text-zinc-900"
                  title="Bullet List"
                >
                  <List size={16} />
                </button>
                <div className="h-5 w-px bg-zinc-300 mx-1" />
                <div className="flex-1 text-[9px] text-zinc-500 font-semibold px-2">
                  Shortcuts: <span className="font-mono">### Heading</span> | <span className="font-mono">**bold**</span> | <span className="font-mono">* list</span>
                </div>
              </div>
            )}

            {/* Editor / Preview */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              {showPreview ? (
                <div className="bg-white p-6 min-h-[300px] max-h-[500px] overflow-y-auto">
                  {renderPreview(content)}
                </div>
              ) : (
                <textarea
                  ref={contentRef}
                  rows={14}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white p-4 text-xs font-mono text-zinc-800 placeholder-zinc-400 outline-none resize-none leading-relaxed"
                  placeholder="### 1. Section Title&#10;Write your policy content here...&#10;&#10;* Use asterisks for bullet points&#10;* **Bold text** with double asterisks&#10;* Add blank lines between paragraphs"
                />
              )}
            </div>

            {/* Character Count */}
            <div className="flex justify-between items-center text-[9px] text-zinc-400 font-semibold">
              <span>Markdown supported: ### headings, * lists, **bold**</span>
              <span>{content.length} characters</span>
            </div>
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
              onClick={() => router.back()}
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
