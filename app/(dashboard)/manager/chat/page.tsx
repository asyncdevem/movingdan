"use client";

import React, { useState } from "react";
import { useApp } from "@/app/context";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Plus, Users, Trash2 } from "lucide-react";

export default function ManagerChatPage() {
  const { currentUser, chatGroups, deleteChatGroup, isLoading } = useApp();
  const router = useRouter();
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  const handleDeleteGroup = async (e: React.MouseEvent, groupId: string, groupName: string) => {
    e.preventDefault(); // Prevent navigation to group
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${groupName}"? This will delete all messages in the group and cannot be undone.`)) {
      return;
    }

    setDeletingGroupId(groupId);
    try {
      await deleteChatGroup(groupId);
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('Failed to delete group. Please try again.');
    } finally {
      setDeletingGroupId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-14 md:h-16 bg-white border-b border-zinc-200 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm md:text-base font-extrabold text-zinc-900 md:text-lg truncate">Team Chat</h2>
          <p className="hidden md:block text-[11px] text-zinc-500 font-semibold mt-0.5">
            Communicate with your team in real-time
          </p>
        </div>
        <button
          onClick={() => router.push('/manager/chat/create')}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all shrink-0"
        >
          <Plus size={14} className="md:w-4 md:h-4" />
          <span className="hidden sm:inline">New Group</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 safe-area-bottom">
        <div className="max-w-4xl mx-auto">
          
          {/* Groups List */}
          {chatGroups.length > 0 ? (
            <div className="flex flex-col gap-2 md:gap-3">
              {chatGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-zinc-200 shadow-2xs hover:border-zinc-300 hover:shadow-sm transition-all relative group"
                >
                  <Link
                    href={`/manager/chat/${group.id}`}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      {/* Icon */}
                      <div className="bg-primary/10 text-primary p-2.5 md:p-3 rounded-xl shrink-0">
                        <MessageSquare size={20} className="md:w-6 md:h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-10 md:pr-12">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-xs md:text-sm font-black text-zinc-900 truncate">{group.name}</h3>
                          {group.lastMessage && (
                            <span className="text-[9px] md:text-[10px] text-zinc-400 font-semibold shrink-0">
                              {new Date(group.lastMessage.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          )}
                        </div>

                        {/* Members */}
                        <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-zinc-500 font-semibold mb-1.5 md:mb-2">
                          <Users size={10} className="md:w-3 md:h-3" />
                          <span>{group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}</span>
                        </div>

                        {/* Last Message */}
                        {group.lastMessage ? (
                          <p className="text-[10px] md:text-xs text-zinc-600 truncate">
                            <span className="font-bold">{group.lastMessage.senderName}:</span>{' '}
                            {group.lastMessage.text}
                          </p>
                        ) : (
                          <p className="text-[10px] md:text-xs text-zinc-400 italic">No messages yet</p>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteGroup(e, group.id, group.name)}
                    disabled={deletingGroupId === group.id}
                    className={`absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 rounded-lg transition-all ${
                      deletingGroupId === group.id
                        ? 'opacity-50 cursor-not-allowed'
                        : 'opacity-70 md:opacity-0 group-hover:opacity-100 hover:bg-red-50 text-zinc-400 hover:text-red-600'
                    }`}
                    title="Delete group"
                  >
                    {deletingGroupId === group.id ? (
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={14} className="md:w-4 md:h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12 md:py-16 px-4">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-zinc-100 rounded-2xl mb-3 md:mb-4">
                <MessageSquare size={24} className="text-zinc-400 md:w-8 md:h-8" />
              </div>
              <h3 className="text-base md:text-lg font-black text-zinc-900 mb-2">No Chat Groups Yet</h3>
              <p className="text-xs md:text-sm text-zinc-500 font-semibold mb-4 md:mb-6 max-w-md mx-auto">
                Create your first group chat to start communicating with your team members.
              </p>
              <button
                onClick={() => router.push('/manager/chat/create')}
                className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                <Plus size={14} className="md:w-4 md:h-4" />
                Create Group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
