"use client";

import React, { useState } from "react";
import { useApp } from "@/app/context";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Users, User, Plus } from "lucide-react";

type ChatView = "groups" | "dms";

export default function EmployeeChatPage() {
  const { currentUser, chatGroups, directMessages, unreadCounts, createDirectMessage, users, isLoading } = useApp();
  const [activeView, setActiveView] = useState<ChatView>("groups");
  const [showUserList, setShowUserList] = useState(false);
  const router = useRouter();

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "employee") {
    redirect("/");
  }

  const handleStartDM = async (userId: string) => {
    try {
      const dmId = await createDirectMessage(userId);
      router.push(`/employee/chat/${dmId}`);
      setShowUserList(false);
    } catch (error) {
      console.error('Failed to create DM:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const getOtherUser = (dm: typeof directMessages[0]) => {
    const otherUserId = dm.participants.find(id => id !== currentUser?.id);
    return users.find(u => u.id === otherUserId);
  };

  const availableUsers = users.filter(u => u.id !== currentUser?.id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-14 md:h-16 bg-white border-b border-zinc-200 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm md:text-base font-extrabold text-zinc-900 md:text-lg">Team Chat</h2>
          <p className="hidden md:block text-[11px] text-zinc-500 font-semibold mt-0.5">
            Stay connected with your team
          </p>
        </div>
        {activeView === 'dms' && (
          <button
            onClick={() => setShowUserList(true)}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all shrink-0"
          >
            <Plus size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">New DM</span>
            <span className="sm:hidden">New</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-zinc-200 px-4 md:px-6 flex gap-4 shrink-0">
        <button
          onClick={() => setActiveView('groups')}
          className={`py-3 px-2 text-xs md:text-sm font-black uppercase tracking-wider border-b-2 transition-colors ${
            activeView === 'groups'
              ? 'border-primary text-primary'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users size={14} />
            Groups
          </span>
        </button>
        <button
          onClick={() => setActiveView('dms')}
          className={`py-3 px-2 text-xs md:text-sm font-black uppercase tracking-wider border-b-2 transition-colors ${
            activeView === 'dms'
              ? 'border-primary text-primary'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <span className="flex items-center gap-2">
            <User size={14} />
            DMs
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 safe-area-bottom min-h-0">
        <div className="max-w-4xl mx-auto">
          
          {/* Groups View */}
          {activeView === 'groups' && (
            <>
          {/* Groups List */}
          {chatGroups.length > 0 ? (
            <div className="flex flex-col gap-2 md:gap-3">
              {chatGroups.map((group) => {
                const unreadCount = unreadCounts[group.id] || 0;
                
                return (
                  <Link
                    key={group.id}
                    href={`/employee/chat/${group.id}`}
                    className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-zinc-200 shadow-2xs hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer relative"
                  >
                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                      <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-primary text-white text-[10px] md:text-xs font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-full min-w-[20px] md:min-w-[24px] text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}

                    <div className="flex items-start gap-3 md:gap-4">
                      {/* Icon */}
                      <div className={`p-2.5 md:p-3 rounded-xl shrink-0 ${
                        unreadCount > 0 ? 'bg-primary/20 text-primary' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        <MessageSquare size={20} className="md:w-6 md:h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6 md:pr-8">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className={`text-xs md:text-sm font-black truncate ${
                            unreadCount > 0 ? 'text-zinc-900' : 'text-zinc-700'
                          }`}>
                            {group.name}
                          </h3>
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
                          <p className={`text-[10px] md:text-xs truncate ${
                            unreadCount > 0 ? 'text-zinc-900 font-bold' : 'text-zinc-600'
                          }`}>
                            <span className="font-bold">{group.lastMessage.senderName}:</span>{' '}
                            {group.lastMessage.text}
                          </p>
                        ) : (
                          <p className="text-[10px] md:text-xs text-zinc-400 italic">No messages yet</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12 md:py-16 px-4">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-zinc-100 rounded-2xl mb-3 md:mb-4">
                <MessageSquare size={24} className="text-zinc-400 md:w-8 md:h-8" />
              </div>
              <h3 className="text-base md:text-lg font-black text-zinc-900 mb-2">No Chat Groups</h3>
              <p className="text-xs md:text-sm text-zinc-500 font-semibold max-w-md mx-auto">
                You're not part of any chat groups yet. Your manager will add you to team chats.
              </p>
            </div>
          )}
            </>
          )}

          {/* DMs View */}
          {activeView === 'dms' && (
            <>
              {directMessages.length > 0 ? (
                <div className="flex flex-col gap-2 md:gap-3">
                  {directMessages.map((dm) => {
                    const otherUser = getOtherUser(dm);
                    if (!otherUser) return null;
                    const unreadCount = unreadCounts[dm.id] || 0;

                    return (
                      <Link
                        key={dm.id}
                        href={`/employee/chat/${dm.id}`}
                        className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-zinc-200 shadow-2xs hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer relative"
                      >
                        {/* Unread Badge */}
                        {unreadCount > 0 && (
                          <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-primary text-white text-[10px] md:text-xs font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-full min-w-[20px] md:min-w-[24px] text-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </div>
                        )}

                        <div className="flex items-start gap-3 md:gap-4">
                          {/* Avatar */}
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {otherUser.avatar}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pr-6 md:pr-8">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className={`text-xs md:text-sm font-black truncate ${
                                unreadCount > 0 ? 'text-zinc-900' : 'text-zinc-700'
                              }`}>
                                {otherUser.name}
                              </h3>
                              {dm.lastMessage && (
                                <span className="text-[9px] md:text-[10px] text-zinc-400 font-semibold shrink-0">
                                  {new Date(dm.lastMessage.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] md:text-xs text-zinc-500 font-semibold mb-1.5 capitalize">
                              {otherUser.role} • {otherUser.title}
                            </p>

                            {/* Last Message */}
                            {dm.lastMessage ? (
                              <p className={`text-[10px] md:text-xs truncate ${
                                unreadCount > 0 ? 'text-zinc-900 font-bold' : 'text-zinc-600'
                              }`}>
                                {dm.lastMessage.senderId === currentUser?.id ? 'You: ' : ''}
                                {dm.lastMessage.text}
                              </p>
                            ) : (
                              <p className="text-[10px] md:text-xs text-zinc-400 italic">No messages yet</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-12 md:py-16 px-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-zinc-100 rounded-2xl mb-3 md:mb-4">
                    <User size={24} className="text-zinc-400 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base md:text-lg font-black text-zinc-900 mb-2">No Direct Messages</h3>
                  <p className="text-xs md:text-sm text-zinc-500 font-semibold mb-4 md:mb-6 max-w-md mx-auto">
                    Start a direct conversation with any team member.
                  </p>
                  <button
                    onClick={() => setShowUserList(true)}
                    className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    <Plus size={14} className="md:w-4 md:h-4" />
                    Start Conversation
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User List Modal */}
      {showUserList && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowUserList(false)}
          />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white rounded-2xl z-50 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-zinc-900">Start Conversation</h3>
              <button
                onClick={() => setShowUserList(false)}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <span className="text-zinc-400 text-xl">✕</span>
              </button>
            </div>
            <div className="space-y-2">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartDM(user.id)}
                  className="w-full flex items-center gap-3 p-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{user.name}</p>
                    <p className="text-xs text-zinc-500 font-semibold capitalize">{user.role} • {user.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
