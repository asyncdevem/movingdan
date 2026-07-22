"use client";

import React, { use, useState } from "react";
import { useApp } from "@/app/context";
import { redirect, useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { ChatInterface } from "@/app/components/ChatInterface";

export default function ManagerChatGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { currentUser, chatGroups, isLoading } = useApp();
  const router = useRouter();
  
  const { groupId } = use(params);

  if (isLoading) return null;

  if (!currentUser || currentUser.role !== "manager") {
    redirect("/");
  }

  const group = chatGroups.find(g => g.id === groupId);

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
        <div className="flex-1">
          <h3 className="text-sm font-black text-zinc-900">{group.name}</h3>
          <p className="text-xs text-zinc-500 font-semibold">
            {group.memberIds.length} members
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterface groupId={groupId} group={group} />
    </div>
  );
}
