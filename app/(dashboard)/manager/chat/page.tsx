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
      <div className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 md:text-lg">Team Chat</h2>
          <p className="hidden md:block text-[11px] text-zinc-500 font-semibold mt-0.5">
            Communicate with your team in real-time
          </p>
        </div>
        <button
          onClick={() => router.push('/manager/chat/create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Group</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Groups List */}
          {chatGroups.length > 0 ? (
            <div className="flex flex-col gap-3">
              {chatGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xs hover:border-zinc-300 hover:shadow-sm transition-all relative group"
                >
                  <Link
                    href={`/manager/chat/${group.id}`}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="bg-primary/10 text-primary p-3 rounded-xl shrink-0">
                        <MessageSquare size={24} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-sm font-black text-zinc-900 truncate">{group.name}</h3>
                          {group.lastMessage && (
                            <span className="text-[10px] text-zinc-400 font-semibold shrink-0">
                              {new Date(group.lastMessage.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          )}
                        </div>

                        {/* Members */}
                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold mb-2">
                          <Users size={12} />
                          <span>{group.memberIds.length} members</span>
                        </div>

                        {/* Last Message */}
                        {group.lastMessage ? (
                          <p className="text-xs text-zinc-600 truncate">
                            <span className="font-bold">{group.lastMessage.senderName}:</span>{' '}
                            {group.lastMessage.text}
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-400 italic">No messages yet</p>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteGroup(e, group.id, group.name)}
                    disabled={deletingGroupId === group.id}
                    className={`absolute top-3 right-3 p-2 rounded-lg transition-all ${
                      deletingGroupId === group.id
                        ? 'opacity-50 cursor-not-allowed'
                        : 'opacity-0 group-hover:opacity-100 hover:bg-red-50 text-zinc-400 hover:text-red-600'
                    }`}
                    title="Delete group"
                  >
                    {deletingGroupId === group.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-100 rounded-2xl mb-4">
                <MessageSquare size={32} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 mb-2">No Chat Groups Yet</h3>
              <p className="text-sm text-zinc-500 font-semibold mb-6 max-w-md mx-auto">
                Create your first group chat to start communicating with your team members.
              </p>
              <button
                onClick={() => router.push('/manager/chat/create')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                <Plus size={16} />
                Create Group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
