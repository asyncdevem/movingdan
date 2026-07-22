"use client";

import React from "react";
import { useApp } from "@/app/context";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Users } from "lucide-react";

export default function EmployeeChatPage() {
  const { currentUser, chatGroups, unreadCounts, isLoading } = useApp();

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "employee") {
    redirect("/");
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 md:text-lg">Team Chat</h2>
          <p className="hidden md:block text-[11px] text-zinc-500 font-semibold mt-0.5">
            Stay connected with your team
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Groups List */}
          {chatGroups.length > 0 ? (
            <div className="flex flex-col gap-3">
              {chatGroups.map((group) => {
                const unreadCount = unreadCounts[group.id] || 0;
                
                return (
                  <Link
                    key={group.id}
                    href={`/employee/chat/${group.id}`}
                    className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xs hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer relative"
                  >
                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                      <div className="absolute top-3 right-3 bg-primary text-white text-xs font-black px-2 py-1 rounded-full min-w-[24px] text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-xl shrink-0 ${
                        unreadCount > 0 ? 'bg-primary/20 text-primary' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        <MessageSquare size={24} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className={`text-sm font-black truncate ${
                            unreadCount > 0 ? 'text-zinc-900' : 'text-zinc-700'
                          }`}>
                            {group.name}
                          </h3>
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
                          <p className={`text-xs truncate ${
                            unreadCount > 0 ? 'text-zinc-900 font-bold' : 'text-zinc-600'
                          }`}>
                            <span className="font-bold">{group.lastMessage.senderName}:</span>{' '}
                            {group.lastMessage.text}
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-400 italic">No messages yet</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-100 rounded-2xl mb-4">
                <MessageSquare size={32} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 mb-2">No Chat Groups</h3>
              <p className="text-sm text-zinc-500 font-semibold max-w-md mx-auto">
                You're not part of any chat groups yet. Your manager will add you to team chats.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
