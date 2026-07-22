"use client";

import React, { use, useState } from "react";
import { useApp } from "@/app/context";
import { redirect, useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, UserPlus } from "lucide-react";
import { ChatInterface } from "@/app/components/ChatInterface";

export default function ManagerChatGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { currentUser, chatGroups, users, addMembersToGroup, isLoading } = useApp();
  const router = useRouter();
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  
  const { groupId } = use(params);

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  const group = chatGroups.find(g => g.id === groupId);

  // Get employees not already in the group
  const availableEmployees = users.filter(
    u => u.role === 'employee' && !group?.memberIds.includes(u.id)
  );

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return;

    setIsAddingMembers(true);
    try {
      await addMembersToGroup(groupId, selectedMembers);
      setShowAddMembers(false);
      setSelectedMembers([]);
    } catch (error) {
      console.error('Failed to add members:', error);
      alert('Failed to add members. Please try again.');
    } finally {
      setIsAddingMembers(false);
    }
  };

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto text-zinc-300 mb-3" />
          <h2 className="text-lg font-black text-zinc-900">Group Not Found</h2>
          <p className="text-sm text-zinc-500 mt-1">
            This chat group doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => router.push('/manager/chat')}
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile Header with Back Button */}
      <div className="md:hidden h-14 bg-white border-b border-zinc-200 px-4 flex items-center gap-3 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-zinc-700" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-zinc-900 truncate">{group.name}</h3>
          <p className="text-xs text-zinc-500 font-semibold">
            {group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}
          </p>
        </div>
        {availableEmployees.length > 0 && (
          <button
            onClick={() => setShowAddMembers(true)}
            className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
            title="Add members"
          >
            <UserPlus size={18} />
          </button>
        )}
      </div>

      {/* Chat Interface */}
      <ChatInterface 
        groupId={groupId} 
        group={group}
        onAddMembers={availableEmployees.length > 0 ? () => setShowAddMembers(true) : undefined}
      />

      {/* Add Members Modal */}
      {showAddMembers && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowAddMembers(false)}
          />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-zinc-200 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base md:text-lg font-black text-zinc-900">Add Members</h3>
                  <p className="text-xs md:text-sm text-zinc-500 font-semibold mt-1">
                    Select employees to add to {group.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMembers(false)}
                  className="text-zinc-400 hover:text-zinc-700 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {availableEmployees.length > 0 ? (
                <div className="space-y-2">
                  {availableEmployees.map(employee => (
                    <label
                      key={employee.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedMembers.includes(employee.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(employee.id)}
                        onChange={() => handleToggleMember(employee.id)}
                        className="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary"
                      />
                      <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {employee.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate">{employee.name}</p>
                        <p className="text-xs text-zinc-500 font-semibold truncate">{employee.title}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-500 font-semibold">
                    All employees are already in this group
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {availableEmployees.length > 0 && (
              <div className="p-4 md:p-6 border-t border-zinc-200 shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddMembers(false)}
                    className="flex-1 px-4 py-3 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMembers}
                    disabled={selectedMembers.length === 0 || isAddingMembers}
                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-black uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAddingMembers ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Add {selectedMembers.length} {selectedMembers.length === 1 ? 'Member' : 'Members'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
