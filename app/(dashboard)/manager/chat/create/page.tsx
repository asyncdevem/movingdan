"use client";

import React, { useState } from "react";
import { useApp } from "@/app/context";
import { redirect, useRouter } from "next/navigation";
import { ArrowLeft, Users, Check } from "lucide-react";
import { Toast, ToastType } from "@/app/components/Toast";

export default function CreateChatGroupPage() {
  const { currentUser, users, createChatGroup, isLoading } = useApp();
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  const employees = users.filter(u => u.role === "employee");

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setToast({ message: 'Please enter a group name', type: 'error' });
      return;
    }

    if (selectedMembers.length === 0) {
      setToast({ message: 'Please select at least one member', type: 'error' });
      return;
    }

    setIsCreating(true);
    try {
      const groupId = await createChatGroup(groupName, selectedMembers);
      setToast({ message: 'Group created successfully!', type: 'success' });
      setTimeout(() => {
        router.push(`/manager/chat/${groupId}`);
      }, 1000);
    } catch (error) {
      setToast({ message: 'Failed to create group', type: 'error' });
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
            <h2 className="text-base font-extrabold text-zinc-900">Create Group Chat</h2>
            <p className="hidden md:block text-[10px] text-zinc-500 font-semibold mt-0.5">
              Select team members to add to the group
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto">
          
          {/* Group Name Input */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-3">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Monday Crew, Weekend Team"
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* Member Selection */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                Select Members
              </label>
              <span className="text-xs font-bold text-zinc-600">
                {selectedMembers.length} selected
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {employees.map((employee) => {
                const isSelected = selectedMembers.includes(employee.id);
                
                return (
                  <button
                    key={employee.id}
                    onClick={() => toggleMember(employee.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-red-50 border-primary'
                        : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {employee.avatar}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-zinc-900">{employee.name}</p>
                        <p className="text-xs text-zinc-500 font-semibold">{employee.title}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={isCreating || !groupName.trim() || selectedMembers.length === 0}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Users size={18} />
                Create Group
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
